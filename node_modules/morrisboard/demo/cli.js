const Mill = require('../');


var game = new Mill(3, 3, [2]);

game.set({
  player: "white",
  row: 1,
  position: 0
});



console.log(require('util').inspect(game, { depth: null }));
