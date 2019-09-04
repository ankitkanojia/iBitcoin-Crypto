var viewMenu = document.querySelector(".view.menu");
var viewGame = document.querySelector(".view.game");

var inputRowsCount = document.querySelector(".input-rows");

var startGameBtn = document.querySelector(".btn-startgame");
var menuBtn = document.querySelector(".btn-menu");
var exportBtn = document.querySelector(".btn-export");
var btnLoad = document.querySelector(".btn-load");
var fileInput = document.querySelector(".file-input");
var aiChecker = document.querySelector(".ai-check");


startGameBtn.addEventListener("click", function() {
  viewMenu.classList.remove("visible");
  viewGame.classList.add("visible");

  createUserGame(parseInt(inputRowsCount.value), [false, true, false], 9, [], [], [false, aiChecker.checked]);

  render();
});
function createUserGame(rows, points, piecesCount, defaultMap, defaultTeams, aiPlaying) {
  game = new MorrisGame({
    board: {
      rows: rows,
      points: points,
      default: defaultMap
    },
    pieces: piecesCount,
    rules: true,
    teams: defaultTeams
  });
  ai = new MorrisAI(game, MorrisGame);

  teams = {
    "white": aiPlaying[0],
    "black": aiPlaying[1]
  };
}

menuBtn.addEventListener("click", function() {
  viewMenu.classList.add("visible");
  viewGame.classList.remove("visible");
});

exportBtn.addEventListener("click", function() {
  var exportData = {
    board: {
      points: game.board.points,
      rows: game.board.rows.length
    },
    teams: game.teams.map(function(team) {
      delete team.activePieces;
      delete team.moveablePieces;
      return team;
    }),
    __lastChangeset: Object.assign({}, game.__lastChangeset)
  };
  if (exportData.__lastChangeset) {
    exportData.__lastChangeset.targetPoint = game.board.map.indexOf(exportData.__lastChangeset.targetPoint);
    if ("startPoint" in exportData.__lastChangeset) {
      exportData.__lastChangeset.startPoint = game.board.map.indexOf(exportData.__lastChangeset.startPoint);
    }
  }

  var exportDataStr = JSON.stringify(exportData);

  window.open("data:text/json;charset=utf-8," + exportDataStr);
});

btnLoad.addEventListener("click", function() {
  fileInput.click();
});
fileInput.addEventListener("change", function(event) {

  var reader = new FileReader();
  reader.addEventListener("load", function(progress) {
    var gameData = JSON.parse(reader.result);

    var pointCount = gameData.board.rows * (gameData.board.points.length - 1) * 4;

    var boardMap = new Array(pointCount).fill(function(index) {
      for (var team of gameData.teams) {
        if (team.pieces.objectFromKey(index, "point")) {
          return team.name;
        }
      }
      return false;
    });

    viewMenu.classList.remove("visible");
    viewGame.classList.add("visible");

    createUserGame(gameData.board.rows, gameData.board.points, gameData.teams[0].pieces.length, boardMap, gameData.teams);

    if (gameData.__lastChangeset) {
      gameData.__lastChangeset.targetPoint = game.board.map[gameData.__lastChangeset.targetPoint];
      if ("startPoint" in gameData.__lastChangeset) {
        gameData.__lastChangeset.startPoint = game.board.map[gameData.__lastChangeset.startPoint];
      }
    }
    game.__lastChangeset = gameData.__lastChangeset;

    render();

  });
  reader.readAsText(event.target.files[0]);
});

var svgRenderDocument = document.getElementById("board");

var game, ai, teams;

var userActions = {
  set: {
    handle(point) {
      return game.set(Object.assign({
        team: game.nextTeam,
      }, point.position));
    }
  },
  move: {
    selected: null,
    handle(point) {
      if (!this.selected) {
        this.selected = point;
      }
      else {
        var movement = game.move(this.selected.position, point.position);
        this.selected = null;
        return movement;
      }
    }
  },
  remove: {
    handle(point) {
      return game.remove(point.position);
    }
  }
};

function handleUserMovement(point) {

  var actions = {
    set(move) {
      game.set(Object.assign({
        team: game.nextTeam
      }, move.targetPoint.position));
    },
    move(move) {
      game.move(move.startPoint.position, move.targetPoint.position);
    },
    remove(move) {

      game.remove(move.targetPoint.position);
    }
  };



  var changeset = userActions[game.nextAction].handle(point);

  render();

  if (changeset && changeset.success && teams[game.nextTeam] && game.nextAction != "remove") {
    // AI is doing next movement
    let bestMoves = ai.calcMoves(game);
    actions[bestMoves[0].action](bestMoves[0]);

    if (game.nextAction === "remove") {
      let bestMoves = ai.calcMoves(game);
      actions[bestMoves[0].action](bestMoves[0]);
    }

    render();

  }
  else {
    console.log(changeset);
  }


}


function render() {
  renderGame(game, svgRenderDocument, {
    margin: 16,
    radius: 15,
    strokeWidth: 0.5,
    selected: [userActions.move.selected]
  }, handleUserMovement);
}
