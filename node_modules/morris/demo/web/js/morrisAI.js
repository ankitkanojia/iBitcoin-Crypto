(function() {
  class MorrisAI {
    constructor(game, gameClass) {
      this.game = game;
      this.gameConstructor = gameClass;
    }
    calcMoves() {
      var self = this;

      var team = this.game.nextTeam;

      var possibleMoves = this.game.getMoves();



      for (var move of possibleMoves) {
        let millPotential = self.millPotential(move) * 1.9;
        //console.log(millPotential);
        let preventMillPotential = self.preventMillPotential(move) * 1.8;
        //console.log(preventMillPotential, move.targetPoint);
        let prepareMillPotential = self.prepareMillPotential(move) * 1.7;
        //console.log(prepareMillPotential);

        let tacticsPotential = self.tacticsPotential(move) * 1;


        move.potential = millPotential + preventMillPotential + prepareMillPotential + tacticsPotential;
      }

      var moves = possibleMoves.sort(function(a, b) {
        return a.potential < b.potential ? 1 : a.potential > b.potential ? -1 : 0;
      })


      return moves;
    }
    millPotential(move) {
      var self = this;


      var game = MorrisAI.cloneGame(this.game, this.gameConstructor);
      var changeset;
      var actions = {
        set() {
          var setOptions = Object.assign({
            team: game.nextTeam
          }, move.targetPoint.position);
          changeset = game.set(setOptions);
        },
        move() {
          changeset = game.move(move.startPoint.position, move.targetPoint.position);

        },
        remove() {
          changeset = game.remove(move.targetPoint.position);
        }
      };
      actions[move.action]();

      return changeset.targetPoint.mills.length;

    }
    preventMillPotential(move) {
      var self = this;

      var changeset;
      var game = MorrisAI.cloneGame(this.game, this.gameConstructor);
      var contraryTeams = game.teams.filter(team => team.name != game.nextTeam);
      var targetPoint = game.board.getPoint(move.targetPoint.position.row, move.targetPoint.position.position);
      var potential = 0;

      var actions = {
        set() {
          contraryTeams.forEach(function(team) {
            potential += checkForMill(team);
            game = MorrisAI.cloneGame(self.game, self.gameConstructor);
          });
        },
        move() {
          contraryTeams.forEach(function(team) {
            potential += checkForMill(team);
            game = MorrisAI.cloneGame(self.game, self.gameConstructor);
          });
        },
        remove() {
          potential += targetPoint.mills.length;
        }
      };
      function checkForMill(team) {
        var setOptions = Object.assign({
          team: team.name
        }, move.targetPoint.position);
        game.board.set(setOptions);
        return targetPoint.mills.length;
      }

      actions[game.nextAction]();

      return potential;

    }
    prepareMillPotential(move) {
      var self = this;
      var game = MorrisAI.cloneGame(this.game, this.gameConstructor);

      var targetPoint = game.board.getPoint(move.targetPoint.position.row, move.targetPoint.position.position);
      var contraryTeams = game.teams.filter(team => team.name != game.nextTeam);


      var potential = 0;

      var actions = {
        set: checkForPreparedMill,
        move: checkForPreparedMill,
        remove() {
          contraryTeams.forEach(function(team) {
            var setOptions = Object.assign({
              team: team.name
            }, move.targetPoint.position);
            game.board.set(setOptions);
            potential += targetPoint.mills.length;
          });
        }
      };

      function checkForPreparedMill() {
        for (var direction in targetPoint.surroundings) {
          if (targetPoint.surroundings.hasOwnProperty(direction)) {
            let point = targetPoint.surroundings[direction];
            if (point) {
              let setOptions = Object.assign({
                team: game.nextTeam
              }, point.position);
              game.board.set(setOptions);
              potential += point.mills.length;

              setOptions.team = false;
              game.board.set(setOptions);
            }
          }
        }
      }

      return potential;

    }
    tacticsPotential(move) {
      var potential = 0;

      for (var direction in move.targetPoint.surroundings) {
        if (move.targetPoint.surroundings.hasOwnProperty(direction)) {
          let point = move.targetPoint.surroundings[direction];
          if (point) {
            potential += point.team === game.nextTeam ? 1 : 0.5;
          }
        }
      }

      return potential;
    }
    // Static method to clone a game instance
    static cloneGame(gameInstance, gameConstructor) {
      var options = {
        board: {
          rows: gameInstance.board.rows.length,
          points: gameInstance.board.points,
          default: gameInstance.board.map.map(point => point.team)
        },
        pieces: gameInstance.teams[0].pieces.length,
        teams: gameInstance.teams.map(function(team) {
          return {
            name: team.name,
            pieces: team.pieces.map(piece => piece)
          }
        }),
        rules: false,
        lastChangeset: Object.assign({}, gameInstance.__lastChangeset)
      };
      var game = new gameConstructor(options);
      // Set the 'targetPoint' to the new instance
      var lastChangesetTargetIndex = gameInstance.board.map.indexOf(gameInstance.__lastChangeset.targetPoint);
      game.__lastChangeset.targetPoint = game.board.map[lastChangesetTargetIndex];

      // Get the team object from the original game instance
      var lastChangesetTeam = gameInstance.teams.objectFromKey(gameInstance.getTeam(gameInstance.__lastChangeset.piece), "name");
      // Get the index of the piece within this original team object
      var lastChangesetPieceIndex = lastChangesetTeam.pieces.indexOf(gameInstance.__lastChangeset.piece);
      // Set the new instance's lastChangeset.piece to a piece object from its own team but usually with the same index as the original
      game.__lastChangeset.piece = game.teams.objectFromKey(lastChangesetTeam.name, "name").pieces[lastChangesetPieceIndex];


      return game;

    }

  }
  if ("process" in this) {
    module.exports = MorrisAI;
  }
  else {
    window.MorrisAI = MorrisAI;
  }
})();


Object.defineProperty(Array.prototype, "max",{
  get() {
    return Math.max.apply(Math, this);
  }
});

/*

# AI

The AI used here is a fast and simple AI program that tries to get the best moves by validating their potential. It is important to know, that the AI **is not** perfect by calculating the whole game. That would have been a solution but I did not liked such a AI. I wanted an AI that is not absolutely perfect but just simple and fast.

In detail, the AI works with a lot of methods that return a potential for inner game actions and moves. They are not too complex but very general. You can win against the AI ;-)

The AI module can also be used within browser's API or within Node.js. *You do not have to browserify the module!* Within a browser's API it will create the class `MorrisAI` to the window object you can use instead. If you are using Node.js, you can *require* it simply.

```javascript
const MorrisAI = require('./morrisAI');
```

```javascript
var ai = new MorrisAI(myGame, MorrisGame);

// Get the best moves
var bestMoves = ai.calcMoves();

// Log them to console
console.log(bestMoves);
```
You need to put your game instance into and your constructor class. That is important because the AI would do some stuff with the original class.

*/
