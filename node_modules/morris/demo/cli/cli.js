#! /usr/bin/env node

const Morris = require("../../");

var renderText = require("./render-text.js");
const readline = require('readline');
const Cursor = require('./Cursor');





var game = new Morris({
  board: {
    rows: 3,
    points: [false, true, false]
  },
  pieces: 4,
  rules: true
});

var cursor = new Cursor(game);

var actions = {
  set: {
    handle() {
      //console.log("!!!");
      //renderGame();
      var setting = game.set({
        team: game.nextTeam,
        row: cursor.row,
        position: cursor.position
      });
      renderGame();
      //console.log(game.nextTeam);
      //console.log(setting);
    }
  },
  move: {
    startPoint: null,
    handle() {
      if (!this.startPoint) {
        this.startPoint = {
          row: cursor.row,
          position: cursor.position
        };
        renderGame();
      }
      else {
        var movement = game.move(this.startPoint, {
          row: cursor.row,
          position: cursor.position
        });
        this.startPoint = null;
        renderGame();
      }
    }
  },
  remove: {
    handle() {
      var removement = game.remove({
        row: cursor.row,
        position: cursor.position
      });
      renderGame();
    }
  }
};



renderGame(undefined, true);

//console.log("\n\n", game.board.map[4].mills);

//console.log("\n\n\n\n\n", game.board.map[9].mills);




function renderGame(selected = [], clearStdout = false) {
  var text = renderText(game, [game.board.getPointIndex(cursor.row, cursor.position)].concat(selected));
  var lines = text.split("\n").length;

  if (clearStdout) {
    console.log("\n".repeat(lines));
  }

  var posY = process.stdout.rows - lines - 1;

  readline.cursorTo(process.stdin, 0, posY);

  console.log(text);

  var xWidth = text.split("\n")[4].length - 10;


  var teamStr = "Team: " + (game.nextTeam === "white" ? "\x1b[47m" : "\x1b[40m\x1b[37m") + game.nextTeam + "\x1b[0m";
  var teamStrLength = "Team: ".length + game.nextTeam.length;

  var actionStr = "Action: \x1b[4m" + game.nextAction + "\x1b[0m" + "    ";
  var actionStrLength = "Action: ".length + game.nextTeam.length;

  process.stdout.write(teamStr + " ".repeat(xWidth - actionStrLength - teamStrLength) + actionStr);
}
//console.log(game.nextAction);
//console.log(require('util').inspect(game, { depth: null }));






readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    process.stdout.write("\n");
    readline.cursorTo(process.stdin, 0, process.stdout.rows);
    process.exit();
  } else {
    var cursorKeys = ["right", "left", "up", "down"];
    var keyActions = {
      return: function() {
        actions[game.nextAction].handle();
      }
    };
    if (cursorKeys.includes(key.name)) {
      cursor.move(key.name);

      renderGame();
    }
    else if (key.name in keyActions) {
      keyActions[key.name]();
    }
  }
});
