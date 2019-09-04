(function() {
  class Cursor {
    constructor(game) {
      this.row = 0;
      this.position = 0;

      this.game = game;

    }
    get index() {
      return game.board.getPointIndex(this.row, this.position);
    }
    move(key) {
      this.relativeActions[this.sides[0][key]]();
    }
    get relativeActions() {
      var self = this;
      return {
        right() {
          self.position = self.position + 1 < self.game.board.pointCount ? (self.position + 1) : 0;
        },
        left() {
          self.position = self.position - 1 >= 0 ? (self.position - 1) : (self.game.board.pointCount - 1);
        },
        up() {
          self.row = self.row + 1 < self.game.board.rows.length ? (self.row + 1) : 0;
        },
        down() {
          self.row = self.row - 1 >= 0 ? (self.row - 1) : (self.game.board.rows.length - 1);
        }
      };
    }
  }

  Cursor.prototype.sides = [
    {
      right: "right",
      left: "left",
      up: "up",
      down: "down"
    }
  ];

  module.exports = Cursor;

})();
function moveCursor(key) {
  var relativeActions = {
    right: function() {
      cursor.position = cursor.position + 1 < game.board.pointCount ? (cursor.position + 1) : 0;
    },
    left: function() {
      cursor.position = cursor.position - 1 >= 0 ? (cursor.position - 1) : (game.board.pointCount - 1);
    },
    up: function() {
      cursor.row = cursor.row + 1 < game.board.rows.length ? (cursor.row + 1) : 0;
    },
    down: function() {
      cursor.row = cursor.row - 1 >= 0 ? (cursor.row - 1) : (game.board.rows.length - 1);
    }
  };
  var sides = [
    {
      right: "right",
      left: "left",
      up: "up",
      down: "down"
    }
  ];
  relativeActions[sides[0][key]]();
  renderGame();

}
