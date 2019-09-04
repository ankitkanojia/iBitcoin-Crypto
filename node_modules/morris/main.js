(function() {
  const helper = require("./helper");

  var Board = require("morrisboard");

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
