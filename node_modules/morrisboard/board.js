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
