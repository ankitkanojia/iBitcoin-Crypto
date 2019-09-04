(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = class Exception {
  constructor(message, code, type, properties = {}) {
    this.message = message;
    this.errorCode = code;
    this.type = type;

    for (var key in properties) {
      if (properties.hasOwnProperty(key)) {
        this[key] = properties[key];
      }
    }
  }
}

},{}],2:[function(require,module,exports){
Array.prototype.fill = function(callback = i => true) {
  for (var i = 0; i < this.length; i++) {
    this[i] = callback(i);
  }
  return this;
}
Object.prototype.fillDefaults = function(defaults) {
  Object.keys(defaults).forEach(key => {
    if (!(key in this)) {
      this[key] = defaults[key];
    }
    else if (typeof defaults[key] == "object" && defaults[key] != null) {
      this[key] = this[key].fillDefaults(defaults[key]);
    }
  });
  return this;
}
Array.prototype.indexOfKey = function(value, key, start = 0) {
  for (var i = start; i < this.length; i++) {
    if (this[i][key] === value) {
      return i;
    }
  }
  return -1;
}
Array.prototype.objectFromKey = function(value, key, start = 0) {
  var index = this.indexOfKey(value, key, start);
  var item = this[index];
  //item.__index = index;
  return item;
}
/*
String.prototype.repeat = function(count) {
  var str = "";
  for (var i = 0; i < count; i++) {
    str += this;
  }
  return this;
};*/

},{}],3:[function(require,module,exports){
(function() {
  const helper = require("./helper");

  var Board = require("./morrisboard");

  var Exception = require("./Exception");

  class Morris {
    constructor(options) {
      var self = this;

      options = options.fillDefaults({
        board: {
          rows: 3,
          points: [false, true, false],
          default: []
        },
        pieces: 9,
        rules: true,
        lastChangeset: null,
        teams: []

      });

      // Initialize morris board for game controller
      this.board = new Board(options.board.rows, options.board.points);

      // Try to fill the board with default teams if they are given
      this.board.map = this.board.map.map(function(point, i) {
        // If the current point has a related default team in default-object of options
        if (options.board.default[i]) {
          // set point's team to the default one
          point.team = options.board.default[i];
        }
        // Return point because we are working with map method
        return point;
      });

      // Just wether rule validating is active (Boolean)
      this.rules = options.rules;

      // By default, 'teams' is just an array conatining team names
      // Fill each one up to a team object
      this.teams = this.teams.map(function(teamName) {
        // Try to get the current team object from option's teams objects
        // Option's team objects are used to fill defaults
        var defaultTeam = options.teams.objectFromKey(teamName, "name");
        // Team object that will repleace the team name
        var team = {
          name: teamName,
          // Fill up the given amount of pieces with own 'fill' prototype function of Array
          pieces: new Array(options.pieces).fill(function(index) {
            // Try to use properties from this piece within the defaultTeam given from options
            // But if this does not exist, use an empty piece instead
            return {
              point: (defaultTeam && "pieces" in defaultTeam && index in defaultTeam.pieces) ? defaultTeam.pieces[index].point : null,
              removed: (defaultTeam && "pieces" in defaultTeam && index in defaultTeam.pieces) ? defaultTeam.pieces[index].removed : false
            };
          }),
          // Returns all active pieces within this team
          // "Active" means pieces, that are just not removed yet
          get activePieces() {
            // 'removed' property of a piece is always 'false' if the piece is not removed
            return this.pieces.filter(piece => !piece.removed);
          },
          // Returns all pieces within this team that are on the board and moveable
          get moveablePieces() {
            // Filter for all pieces whose point property's type is number which excludes the 'null' value
            return this.activePieces.filter(piece => typeof piece.point === "number");
          }
        };
        return team;
      });

      // Try to set an existing lastChangeset to the instance if one is given in options
      this.__lastChangeset = options.lastChangeset || null


    }
    // Calculates the next team's name that is used to move
    get nextTeam() {
      // Check wether there exist a last changeset
      if (this.__lastChangeset) {
        // Get the team name of the last change normally directly from the piece
        // Sometimes the chnageset contains a seperate 'team' property that is used if the piece that was used to interact with is not a part of the team that interacted
        // This case is when a "removement" happened (A piece will always be removed by the contrary team)
        var teamName = this.__lastChangeset.team || this.getTeam(this.__lastChangeset.piece);
        var teamIndex = this.teams.indexOfKey(teamName, "name");

        // Try to just use the "next" team in 'teams' array but if the current one is the last one, jump over to the first one
        return (teamIndex + 1) in this.teams ? this.teams[teamIndex + 1].name : this.teams[0].name;
      }
      // No last changeset, return first team's name because this one is always starting the match
      return this.teams[0].name;
    }
    // Calculates the next action that should be performed
    get nextAction() {
      // Check wether there exist a last changeset
      if (this.__lastChangeset) {
        // Check wether the target point of the last changeset (last movement) is involved in at least one mill
        // That means, that this mill was created with this movement (last changeset)
        if (this.__lastChangeset.targetPoint.mills.length > 0) {
          // Next action should be removed
          // Please keep in mind that the "nextTeam" now is the contrary team of the team that created the mill. This may looks not correct but it is absolutely correct because we will remove the piece from this contrary team
          return "remove";
        }
      }
      // The last changeset's target point seems not to be a part of a created mill which means that we will get the next action just by checking the current game's phase (0-2)
      var phaseActions = [
        "set",
        "move",
        "move"
      ];
      // Return the action that is related to current pahse of the game
      return phaseActions[this.phase];
    }
    // Returns current pahse of the game
    get phase() {
      // Loop trough teams and check wether they have at least one unused piece (Phase 1)
      for (var team of this.teams) {
        // Returns the index of first piece object that's 'point' property is null of current team
        // If this index is not -1, such a piece object exists and phause 1 is still active because there is a team that is allowed to 'set()'
        if (team.pieces.indexOfKey(null, "point") > -1) {
          // Return 0 to represent phase 1
          return 0;
        }
      }
      // No piece found that's "point" property is null
      // Phase 1 is completed, looking for phase 2 or 3 ...

      // Loop trough teams to check wether they have three or less active (unremoved) pieces on board
      for (var team of this.teams) {
        // Filter the pieces array for a false in "removed" property
        // If the returning array's length is three or less, phase 2 is completed and phase 3 is the current one
        if (team.activePieces.length <= 3) {
          // Return 2 to represent phase 3
          return 2;
        }
      }

      // There exist no unused pieces but no team has three or less active pieces
      // Return 1 to represent phase 2
      return 1;
    }
    // Returns wether the game is game over
    get gameOver() {
      // Loop trough all teams to check wether they have more than 0 active pieces
      for (var team of this.teams) {
        // Check the current team for having no active pieces
        if (team.activePieces.length <= 0) {
          // Return true because obviously the game is over
          return true;
        }
      }
      // Every team has at least one active piece
      // Game is still running, return false
      return false;
    }
    // Returns wether the game is a draw
    get draw() {
      // Game has to not to be over and there should be no possible move
      return (!this.gameOver && this.getMoves().length <= 0);
    }
    // Get piece by position object
    getPiece(pos) {
      var index = this.board.getPointIndex(pos.row, pos.position);
      for (var team of this.teams) {
        var relatedPiece = team.pieces.objectFromKey(index, "point");
        if (relatedPiece) {
          return relatedPiece;
        }
      }
    }
    // Method to set a piece to a point and validate this movement with the rules
    set(options, sandbox = false) {
      // Get the point object by using its position given from options
      var targetPoint = this.board.getPoint(options.row, options.position);

      // Prototype the changeset
      var changeset = {
        success: false,
        action: "set",
        piece: null,
        targetPoint: targetPoint
      };
      // Errors will be thrown by adding them to the changeset

      // Anonymous function to use the return break
      (() => {
        // If the target point is invalid, throw an error
        if (!targetPoint) {
          changeset.error = new Exception("Point is invalid or does not exist", 3, "data");
          return;
        }

        // Get team object from options "team" prooperty
        var team = this.teams.objectFromKey(options.team, "name");
        // If this team is inavlid, throw an error
        if (!team) {
          changeset.error = new Exception("Team is invalid", 0, "data");
          return;
        }
        // If the next team that is allowed to interact is not the team that is tried to set and rule validation is allowed
        if (this.rules && this.nextTeam != options.team) {
          changeset.error = new Exception("Team is not allowed to set", 2, "rule");
          return;
        }


        // Get first piece that isn't setted yet
        var piece = team.pieces.objectFromKey(null, "point");

        // If there exist a piece that should be edited
        if (piece) {
          changeset.piece = piece;
          // Piece is valid
          // If target point has no piece on it or if it has one, rule validation has to be disabled
          if (!targetPoint.team || !this.rules) {
            // Movement is okay
            // But change only something really if sandbox is d
            if (!sandbox) {
              // Set the piece on the board and return its index
              var settedIndex = this.board.set(options);
              // Set the related piece's point property to this index to relate the piece to the point on the board
              piece.point = settedIndex;
            }
          }
          else {
            changeset.error = new Exception("Point (target) is already used by piece.", 4, "rule", {
              targetPoint: targetPoint
            });
          }
        }
        else {
          changeset.error = new Exception("Team has no unused pieces anymore", 1, "data");
        }
      })();
      // If no error occured
      if (!changeset.error) {
        // Set success of the changeset to true
        changeset.success = true;
        // If sandbox is not used, the successfull movement will be saved in the last changeset property
        if (!sandbox) {
          this.__lastChangeset = changeset;
        }
      }
      // Return changeset
      return changeset;
    }
    move(from, to, sandbox = false) {

      // Get the indexes of the points we are working with
      var fromIndex = this.board.getPointIndex(from.row, from.position);
      var toIndex = this.board.getPointIndex(to.row, to.position);

      // Get the point objects
      var startPoint = this.board.map[fromIndex];
      var targetPoint = this.board.map[toIndex];

      // Protoytpe changeset
      var changeset = {
        success: false,
        action: "move",
        piece: null,
        startPoint: startPoint,
        targetPoint: targetPoint
      };
      // Errors will be thrown by adding them to the changeset

      // Anonymous function to use the return break
      (() => {
        // If start or target point is not valid, throw an error
        if (!startPoint || !targetPoint) {
          changeset.error = new Exception("Cannot move piece. Start point or target point is invalid or does not exist", 3, "data");
          return;
        }
        // If the start point's team is false which means that the point has no piece on it
        // And therefore, you can not move any piece from it to another point
        if (!startPoint.team) {
          changeset.error = new Exception("Cannot move piece from point. No piece on this point", 4, "data");
          return;
        }
        // Get the piece standing on the start point
        var piece = this.getPiece(from);

        // Refer this piece to the changeset
        changeset.piece = piece;

        // Validate movement with rules
        if (this.validateMovement(startPoint, targetPoint) || !this.rules) {
          // If validating was successfully or rules are disabled, go on

          if (!sandbox) {
            this.board.move(fromIndex, toIndex);
            piece.point = toIndex;
          }
        }
        else {
          changeset.error = new Exception("Invalid movement. Cannot move piece over such a distance or this team is not allowed to move", 5, "rule");
        }
      })();

      if (!changeset.error) {
        changeset.success = true;
        if (!sandbox) {
          this.__lastChangeset = changeset;
        }
      }

      return changeset;
    }
    remove(point, sandbox = false) {

      var targetPoint = this.board.getPoint(point.row, point.position);
      var startIndex = this.board.map.indexOf(targetPoint);

      var piece = this.teams.objectFromKey(targetPoint.team, "name").pieces.objectFromKey(startIndex, "point");

      var changeset = {
        success: false,
        action: "remove",
        piece: piece,
        // Define team explictily because the piece who was used to interact with is defintly not a piece of the team that is doing the removement
        team: this.getTeam(this.__lastChangeset.piece),
        targetPoint: targetPoint
      };

      if (targetPoint && typeof piece.point === "number") {
        if ((targetPoint.team === this.nextTeam && this.nextAction === "remove" && targetPoint.mills.length <= 0) || !this.rules) {
          if (!sandbox) {
            this.board.remove(startIndex);
            piece.removed = true;
            piece.point = undefined;
          }
        }
        else {
          changeset.error = new Exception("Not allowed to remove pieces of this team", 7, "rule");
        }
      }
      else {
        changeset.error = new Exception("Piece or point is invalid or does not exist", 3, "data");
      }

      if (!changeset.error) {
        changeset.success = true;
        if (!sandbox) {
          this.__lastChangeset = changeset;
        }
      }


      return changeset;
    }
    // Method to validate a movement in general by using all the aspects of Nine Men's Morris rules
    validateMovement(from, to) {
      // Get reference from point to related team
      var teamRef = this.teams.objectFromKey(from.team, "name");
      //console.log(teamRef.name, Board.isSurrounding(from, to), this.board.map.indexOf(from.surroundings.right));
      // Check wether the related team has 3 or less active (unremoved) pieces (Jumping is allowed) or if not, the target point borders on the point directly
      return ((teamRef.activePieces.length <= 3 || Board.isSurrounding(from, to)) && this.nextTeam === from.team && !to.team);

    }
    getTeam(piece) {
      for (var team of this.teams) {
        if (team.pieces.includes(piece)) {
          return team.name;
        }
      }
      /*for (var team of this.teams) {
        if (team.pieces.objectFromKey(piece.point, "point")) {
          return team.name;
        }
      }*/

      return null;
    }
    getMoves() {
      var self = this;

      var movements = [];

      var actions = {
        set() {
          // Returns all empty points on the board which have no piece on it (team: false)
          var emptyPoints = self.board.map.filter(point => !point.team);
          // Loop trough all possible target points
          emptyPoints.forEach(function(point) {
            // Assign setting options from point's position and the next team
            var pointInfo = Object.assign({
              team: self.nextTeam
            }, point.position);
            // Set this point for the next team in sandbox mode (true)
            var testSet = self.set(pointInfo, true);
            // Sandbox setting was successfull, add it to array
            if (testSet.success) {
              // Push an movement describing object to the array 'movements'
              movements.push({
                action: "set",
                team: pointInfo.team,
                targetPoint: point
              });
            }
          });
        },
        move() {
          var usedPoints = self.board.map.filter(point => point.team);
          // Loop trough all used points on the board and check wether the pieces on them can be moved to a different point
          usedPoints.forEach(startPoint => {
            // Loop trough the whole board now and check wether 'startPoint's piece can be moved to the current target point
            self.board.map.forEach(targetPoint => {
              // Validate a theoretically movement between these two points
              if (self.validateMovement(startPoint, targetPoint)) {
                // Such a movement seems to be valid
                // Push a movement describing object to the array 'movements'
                movements.push({
                  action: "move",
                  startPoint: startPoint,
                  targetPoint: targetPoint
                });
              }
            });
          });
        },
        remove() {
          var usedPoints = self.board.map.filter(point => point.team);
          // Loop trough all used points on the board and check wether the pieces on them can be moved to a different point
          usedPoints.forEach(targetPoint => {
            // Remove piece in sandbox mode and check the success
            var removement = self.remove(targetPoint.position, true);
            // Wether the removement is allowed
            if (removement.success) {
              // Push a movement describing object to the array 'movements'
              movements.push({
                action: "remove",
                targetPoint: targetPoint
              });
            }
          });
        }
      };

      actions[this.nextAction]();

      return movements;
    }
  }
  Morris.prototype.teams = ["white", "black"];

  if ("process" in this) {
    module.exports = Morris;
  }
  else {
    window.MorrisGame = Morris;
  }
})();

},{"./Exception":1,"./helper":2,"./morrisboard":4}],4:[function(require,module,exports){
(function() {
  const helper = require("./helper");

  const sides = 4;


  class MorrisBoard {
    constructor(size, points) {
      var self = this;

      // Generate map
      this.pointCount = (points.length - 1) * sides;
      // Loop trough rows to set their fields
      for (var currRow = 0; currRow < size; currRow++) {
        // Add all fields of a row to map
        this.map = this.map.concat(new Array(this.pointCount).fill(function(i) {
          // Protofill a point on the board
          return {
            team: false,
            get surroundings() {
              var index = self.map.indexOf(this);
              return self.getSurroundings(index);
            },
            get position() {
              return self.getPointPosition(self.map.indexOf(this));
            },
            get mills() {
              return self.getMills(self.map.indexOf(this));
            },
            get sides() {
              return self.getSides(self.map.indexOf(this));
            },
            get line() {
              return self.getLineIndex(self.map.indexOf(this));
            }
          };
        }));

      }

      this.points = points;


    }
    // Getter that returns all rows as arrays containing point objects
    get rows() {
      var rows = [];
      // Loop trough map with 'pointCount' as step size
      // 'pointCount' represents the amount of points within a row (E.g. 8)
      for (var i = 0; i < this.map.length; i += this.pointCount) {
        // Push for each row a sliced version of 'map' starting ta row's start index and ending with the last point of the current row
        rows.push(this.map.slice(i, i + this.pointCount));
      }
      return rows;
    }
    getSurroundings(index) {
      var pos = this.getPointPosition(index);
      // Get the line the point is a part of (If not, false)
      var line = this.getLineIndex(index);
      /*

      NOTE
      Please remember that the coordinate system behind this is circular. That means the "left" surrounding is not always the left you see on your screen. Also "up" and down are just in relation to the center point of the board

      */
      return {
        // Try to add just 1 to the current index. But if such a position would be bigger or equal as the amount of points in the row, we are looking at the last point of a row
        // Therefore we have to use the first point of row as right surrounding
        right: (pos.position + 1) < this.pointCount ? this.map[index + 1] : this.map[pos.row * this.pointCount + 0],
        // Same here but in reverse logic with substrating. If such a position is bigger or equal to 0, it is okay. But if not, the current point seems to be the first in row
        // Therefore we have use the last point of row as left surrounding
        left: (pos.position - 1 >= 0) ? this.map[index - 1] : this.map[pos.row * this.pointCount + this.pointCount - 1],
        up: typeof line === "number" ? ((index + this.pointCount) in this.map ? this.map[index + this.pointCount] : null) : null,
        down: typeof line === "number" ? ((index - this.pointCount) in this.map ? this.map[index - this.pointCount] : null) : null

      };
      return row;
    }
    getPointIndex(row, position) {
      return row * this.pointCount + position;
    }
    getPoint(row, position) {
      return this.map[this.getPointIndex(row, position)];
    }
    getPointPosition(index) {
      return {
        row: Math.trunc(index / this.pointCount),
        position: index % this.pointCount
      };
    }
    getSides(index) {
      var pos = this.getPointPosition(index);

      var allSides = [
        // Primary side is the first side (returns normally by calculating)
        Math.trunc(pos.position / (this.pointCount / sides)),
        // Secondary side is the side, that returns when the start point is one less (If this is not same as primary side, the point borders on a second side)
        Math.trunc((((pos.position - 1) >= 0 ? pos.position : this.pointCount) - 1) / (this.pointCount / sides))
      ];
      return allSides.filter((side, index) => allSides.indexOf(side, index + 1) == -1);
    }
    // Returns the index of the line a point is part of (If the point is part of it). If not, returns false
    getLineIndex(index) {
      var point = this.map[index];
      var pos = this.getPointPosition(index);

      var pointConnectionIndex = pos.position % (this.pointCount / sides);
      var connection = this.points[pointConnectionIndex];

      return connection ? pos.position : false;
    }
    // Returns a line's points
    getLine(lineIndex) {
      if (typeof lineIndex != "number") {
        return false;
      }
      var rowsCount = this.map.length / this.pointCount;
      var line = [];
      for (var row = 0; row < rowsCount; row++) {
        line.push(this.map[row * this.pointCount + lineIndex]);
      }
      return line;
    }
    getSide(sideIndex, row) {
      // Start point is alway the leftest point on the side
      var point = this.map[this.pointCount * row + sideIndex * (this.pointCount / sides)];

      // Not needed yet because the search starts always at the leftest one
      /*var leftPoints = [];
      var neighbouringPointLeft = point;
      while (neighbouringPointLeft.sides.includes(sideIndex)) {
        leftPoints.push(this.map.indexOf(neighbouringPointLeft));
        neighbouringPointLeft = neighbouringPointLeft.surroundings.left;
      }*/

      // We start at leftest point because of "left-to-right"

      // Array that will be filled with points that are right of the start point
      var rightPoints = [];
      // Initiale start point as first point (Because the start point also a part of the side)
      var neighbouringPointRight = point;
      // Loop while the current point ('neighbouringPointRight') is a part of current side we are working with (Part of it's 'sides' property)
      while (neighbouringPointRight.sides.includes(sideIndex)) {
        // Push current point to the list
        rightPoints.push(neighbouringPointRight);
        // Set new point to point right from current point
        neighbouringPointRight = neighbouringPointRight.surroundings.right;
      }
      // Point right from last point seems to be not a part of current side
      // Side list is completed

      // Returning side list
      return rightPoints;
    }
    getMills(index) {

      var mills = [];

      var pos = this.getPointPosition(index);
      var point = this.map[index];

      // Check for horizontal mills
      var horizontalMills = [];
      point.sides.forEach((side) => {
        var sideList = this.getSide(side, pos.row);
        // Loop trough all points of the side
        for (var currPoint of sideList) {
          // If current point's team does not equal to the team of the point whose side we are stdy here, return because this side cannot contain a mill
          if (point.team != currPoint.team || !point.team) {
            // Current point's team is a different one (Contrary team or no team because there is no piece). This side does not contain a mill
            return;
          }
        }
        horizontalMills.push(sideList);
      });

      mills = mills.concat(horizontalMills);

      var verticalMill;

      // Get line's object from its index
      var line = this.getLine(point.line);
      // If this returns a valid object (Otherwise false)
      if (line) {
        // Anonymous function used here to return when a team does not equals to the required one
        (function() {
          // Loop trough points of line and check wether their team equals to the team of the current point
          for (var currPoint of line) {
            if (point.team != currPoint.team || !point.team) {
              // Different team (false or contrary one), return because
              return;
            }
          }
          verticalMill = line;
          mills.push(verticalMill);
        })();
      }

      return mills;


    }
    set(options) {
      // Wether all required options exist
      if ("team" in options && "row" in options && "position" in options) {
        // Calculate index of field in map
        var fieldIndex = this.getPointIndex(options.row, options.position);
        // Set piece on point
        this.map[fieldIndex].team = options.team;
        // Return the index of the point to use it externaly
        return fieldIndex;
      }
    }
    move(pos, newPos) {
      var teamName = this.map[pos].team;

      this.map[newPos].team = teamName;
      this.map[pos].team = false;
    }
    get mills() {
      var mills = [];
      this.map.filter(point => point.team).forEach(function(point) {
        // Filter if a mill already exists in 'mills' array
        mills = mills.concat(point.mills.filter(function(mill) {
          // General function that returns wether the current mill is already located within 'mills' array
          return !(function() {
            // Looping trough 'mills' array and check the mills wether they are qual to the current 'mill'
            for (var currMill of mills) {
              // Function that returns wether the current 'mill' is exactly the same as the current mill ('currMill') of 'mills' array
              var isMill = (function() {
                // Looping trough all points within the current mill
                for (var i = 0; i < currMill.length; i++) {
                  // If there exist a point that's equivalent point in 'mill' does not equal with it, this mill cannot be exactly the same
                  if (currMill[i] != mill[i]) {
                    return false;
                  }
                }
                // Obviously, no point in 'currMill' was found that does not eual to its equivalent point in 'mill'
                // Therefore, 'currMill' seems to be exactly the same as 'mill'
                return true;
              })();
              // If the current mill 'currMill' seems to be exactly the same as 'mill' we can return a true
              // if not, the loop goes on to the next mill to check for equivalence with 'mill'
              if (isMill) {
                return true;
              }
            }
            // Loop was finished and no mill in 'mills' was found that equals to 'mill'
            // 'mill' seems to be new
            return false;
          })();
        }));
      });
      return mills;
    }
    remove(index) {
      // Just reset the 'team' property
      this.map[index].team = false;


    }
    // Checks wether a given point borders on a second point by looping trough its surroundings
    static isSurrounding(point, targetPoint) {
      // Loop trough a surroundings of the point
      for (var surroundingPointDirection in point.surroundings) {
        // Just to exclude prototype properties within the 'surroundings' object
        if (point.surroundings.hasOwnProperty(surroundingPointDirection)) {
          // Wether the current surroundings equals to target point
          if (point.surroundings[surroundingPointDirection] === targetPoint) {
            return true;
          }
        }
      }
      return false;
    }

  }
  MorrisBoard.prototype.map = [];

  module.exports = MorrisBoard;
})();

},{"./helper":5}],5:[function(require,module,exports){
Array.prototype.fill = function(callback = i => true) {
  for (var i = 0; i < this.length; i++) {
    this[i] = callback(i);
  }
  return this;
}
Object.prototype.fillDefaults = function(defaults) {
  Object.keys(defaults).forEach(key => {
    if (!(key in this)) {
      this[key] = defaults[key];
    }
    else if (typeof defaults[key] == "object" && defaults[key] != null) {
      this[key] = this[key].fillDefaults(defaults[key]);
    }
  });
  return this;
}

},{}]},{},[3]);
