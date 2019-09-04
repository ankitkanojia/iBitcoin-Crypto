# Nine Men's Morris

I separated the board logic from the game logic to make the game extensible and modular.
The game logic implements parts like rule validation.

## Installation

```bash
npm install morris
```

### CLI Usage

To use the `morris` CLI program, install it globally.

```bash
npm install morris -g
```

The board is completely modular which means that you are not focused on the normal look of a Nine Men's Morris board.
By using the property `points` in board options, you can define how many points exist on each side and wether they are connected with the upper row.
And the amount or rows can be defined with the property `rows` in board options. More about the idea behind `points` in [Points](#Points).

To require the module you can browserify it simply with *browserify*. In the case of a browser's API the module will add the class `MorrisGame` to the window object you can use instead.

As Node.js module, just require it:

```javascript
const Morris = require('morris');
```

To create a new game instance call:
```javascript
var myGame = new Morris({
  board: {
    rows: 3,
    points: [false, true, false]
  },
  pieces: 9,
  rules: true
});
```

The `Morris` class will automatically create a new `MorrisBoard` instance for itself. You find it at as `board` property of your game instance.
As I already said, the `board` is own class instance for controlling the board. Normally you do not need manipulating it directly but if you want to know how, have a look at [Morris Board](#Morris Board).

That is just good to know to understand why addressing a point will be done by defining a `row` and a `position` (Index within the row).

The reason why I separated board and game logic is, that this keeps the process completely clean extensible.

#### Important

Please note that the board works with a circular coordinate system. What that means is described more detailed below.

Your instance should look like:

```javascript
{
  board: <MorrisBoard>, // The instance of the board your game instance uses
  points: [Array], // Array containing the template for points on each side
  rules: true || false, // Wether rule validation is enabled
  // More information about the structure of a team and a 'piece' object you will find below
  teams: [
    {
      name: "white",
      pieces: [Array] // Array containing your defined amount of pieces for each team as objects
    },
    {
      name: "black",
      pieces: [Array] // Array containing your defined amount of pieces for each team as objects
    }
  ],
  // Object containing some information to validate rules like 'nextTeam' or 'nextAction'
  __rule: {
    nextTeam: [Getter], // Returns the next team using the information about the last changeset
    nextAction: [Getter], // Returns the next action using the information about the last changeset
    __lastChangeset: <ChangeSet> // The last successfull changeset. Used to get next team or action
  }
}
```

### Ruling

The algorithms for validating rules and all related properties and methods are absolutely responsive which means, that your *game instance* **will not** modify more properties than needed. The **only** important property that will always be edited by your *game instance* is the `__lastChangeset` property in `__rule` (More about this below). All the other stuff like `phase`, `gameOver`, `nextTeam`, `nextAction`

### Points

The `points` property of your instance is the same as you used as argument when creating the instance. If you did not specified one, the default one is used.
In detail this array describes, how many points your board has on each side and wether they are connected with each other.

For example, the default `points` array looks like:
```javascript
[false, true, false]
```

This means that the points left and right side are **not** connected with the upper and lower one but the point in the middle is. Because a Nine Men's Morris board normally looks like this, this is the default value.

### Teams

The `teams` array of your instance contains objects that represent each team.
Normally there exist exactly two teams, called `black` and `white` but theoretically more teams would be possible. And also the algorithms behind rule validation and game logic are made for more than two teams.

But that is just the general theory behind it.

A team object looks like:

```javascript
{
  name: "teamName",
  pieces: [Array] // Array containing your defined amount of pieces for each team as objects
}
```

#### Pieces

As you saw, the `pieces` array within a `team` object contains each piece as an object. You can define the amount of the pieces for each team in `pieces` property when creating your game instance.

A piece object literal contains thre properties. `point` whose value represents an index in `map` array within the in game's board instance. If the piece is not set yet, `point` is `null`.
The other property is `removed` that contains a boolean value. It is used to declare a piece as *removed*.
The third one is the **Getter** `activePieces` that just returns an array with all pieces of the team that are **not** removed but still active.

```javascript
{
  name: "teamName", // "white" or "black"
  pieces: [
    ...
    {
      point: null, // null or the index of the point, the piece is standing on
      removed: false // Wether the piece is already removed
    }
    ...
  ]
}
```

### Rules

To handle internally with rules and the logic of a game, a object for rules, named `__rule` exist in your game instance.


### Get Moves

To get a list of all valid moves call:
```javascript
myGame.getMoves();
```

This will return an `array` containing objects representing each movement specially for the kind of movement. For example, a `set` & `remove` *movement* only needs a `targetPoint` property wether a `move` *movement* usually has also a `startPoint` property containing the point the movement is going to start from.

#### Movement Object Literal

```javascript
{
  action: "movementName", // "set", "move" or "remove"; String describing the kind of movement
  startPoint: [Object], // Optional. Point object literal who refers to the start point within the 'board.map'
  targetPoint: [Object], // Point object literal who refers to the target point within the 'board.map'
  team: "teamName" // "white" or "black"
}
```

### Get Piece

To get a piece that is related to a point's position, use the `getPiece` method.

```javascript
// Returns the piece object literal
var piece = myGame.getPiece({
  row: 0,
  position: 0
});
// Log the piece object
console.log(piece);
```

#### Important

If not piece is related to this point, the method will return `undefined`.

### Set

To set a new piece to the board use the `set` method of your game instance.
(More about the coordinating system in [MorrisBoard->Coordinating](#Coordinating))

```javascript
var changeset = myGame.set({
  team: "white", // Name of the team you want to use
  row: 0,
  position: 0
});
// If an error occured (Set action was not allowed)
if (changeset.error) {
  console.error(err);
}
// The set action was successfully
else {
  console.log(changeset);
}
```

### Move

To move a piece from one point to another one, use the `move` method of your game instance.

```javascript
var changeset = myGame.move({
  row: 0,
  position: 0,
}, {
  row: 0,
  position: 1,
});

// If an error occured (Movement was not allowed)
if (changeset.error) {
  console.error(err);
}
// The movement was successfully
else {
  console.log(changeset);
}
```

### Remove

To remove a piece from the board, use the `remove` method of your game instance.

```javascript
var changeset = myGame.remove({
  row: 0,
  position: 0
});
// If an error occured (Removement was not allowed)
if (changeset.error) {
  console.error(err);
}
// The removement was successfully
else {
  console.log(changeset);
}
```

### Next Team

To get the next team just get the property `nextTeam` of your game instance.
*Please keep in mind that this property is a getter and is related to the* `__lastChangeset` *object of your game instance.*

```javascript
// Get the next team
var nextTeam = myGame.nextTeam;

// Log it
console.log(nextTeam);
```

#### Important

Please keep in mind that after a created mill, the next action is normally `remove`. But the next team is* **not** the team that is *removing* (Normally the same team that created the mill before) **but** the contrary team whose piece will be removed.

### Next Action

To get the next action that should be performed within the game, just get the property `nextAction` of your game instance.

```javascript
// Get the next action
var nextAction = myGame.nextAction;

// Log it
console.log(nextAction);
```

### Phase

The `phase` property of your game instance returns the current phase of the match. (0-2) / (1-3)

```javascript
// Get the current match's phase
var phase = myGame.phase;

// Log it
console.log(phase);
```

### Game Over

To get wether the game is over, just get the `gameOver` property of your game instance.

```javascript
// Get wether the game is over
var isGameOver = myGame.gameOver;

// Log it
console.log(isGameOver);
```

### Draw

To get wether the game is a draw, just get the `draw` property of your game instance.

```javascript
// Get wether the game is a draw
var isDraw = myGame.draw;

// Log it
console.log(isDraw);
```
