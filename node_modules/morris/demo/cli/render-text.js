var rowHeight = 3;


module.exports = function RenderText(game, selected = []) {
  var p = new Array(24).fill(function(index) {
    return game.board.map[index].team ? "⦿" : " ";
  });


  function c(index) {
    if (game.board.map[index].team === "white") {
      return "\x1b[7m";
    }
    return "";
    return "\x1b[47m";
  }

  function b(index, type) {
    var chars = {
      h: {
        default: "─",
        bold: "━"
      },
      v: {
        default: "│",
        bold: "┃"
      },
      u: {
        default: "┴",
        bold: "┷"
      },
      d: {
        default: "┬",
        bold: "┯"
      },
      l: {
        default: "┤",
        bold: "┨"
      },
      r: {
        default: "├",
        bold: "┠"
      },
      rt: {
        default: "┐",
        bold: "┓"
      },
      lt: {
        default: "┌",
        bold: "┏"
      },
      rb: {
        default: "┘",
        bold: "┛"
      },
      lb: {
        default: "└",
        bold: "┗"
      }
    };
    chars = {
      h: {
        default: "─",
        bold: "═"
      },
      v: {
        default: "│",
        bold: "║"
      },
      u: {
        default: "┴",
        bold: "╧"
      },
      d: {
        default: "┬",
        bold: "╤"
      },
      l: {
        default: "┤",
        bold: "╢"
      },
      r: {
        default: "├",
        bold: "╟"
      },
      rt: {
        default: "┐",
        bold: "╗"
      },
      lt: {
        default: "┌",
        bold: "╔"
      },
      rb: {
        default: "┘",
        bold: "╝"
      },
      lb: {
        default: "└",
        bold: "╚"
      }
    };
    if (selected.includes(index)) {
      return chars[type].bold;
    }
    else {
      return chars[type].default;
    }
  }

  var s = " ";
  var h = "h";
  var hl = "─";
  var lt = "lt";
  var rt = "rt";
  var lb = "lb";
  var rb = "rb";
  var d = "d";
  var u = "u";

  function point(dir, type, index) {
    var sides = {
      t: [
        `${b(index, "lt")}${b(index, "h").r(7)}${b(index, "rt")}`,
        `${b(index, "lt")}${b(index, "h").r(3)}${b(index, "u")}${b(index, "h").r(3)}${b(index, "rt")}`
      ],
      b: [
        `${b(index, "lb")}${b(index, "h").r(7)}${b(index, "rb")}`,
        `${b(index, "lb")}${b(index, "h").r(3)}${b(index, "d")}${b(index, "h").r(3)}${b(index, "rb")}`
      ],
      s: [
        `${b(index, "v")}${c(index)}       \x1b[0m${b(index, "v")}`,
        `${b(index, "v")}${c(index)}   ${p[index]}   \x1b[0m${b(index, "r")}`,
        `${b(index, "l")}${c(index)}   ${p[index]}   \x1b[0m${b(index, "v")}`,
        `${b(index, "l")}${c(index)}   ${p[index]}   \x1b[0m${b(index, "r")}`
      ]
    }
    return sides[dir][type];
  }

  function line(type, typeIndex, indexes, margin) {
    var types = {
      t: [
        `${point("t", 0, indexes[0])}` + " ".r(margin) + `${point("t", 0, indexes[1])}` + " ".r(margin) + `${point("t", 0, indexes[2])}`,
        `${point("s", 0, indexes[0])}` + " ".r(margin) + `${point("s", 0, indexes[1])}` + " ".r(margin) + `${point("s", 0, indexes[2])}`,
        `${point("s", 1, indexes[0])}` + "─".r(margin) + `${point("s", 3, indexes[1])}` + "─".r(margin) + `${point("s", 2, indexes[2])}`,
        `${point("b", 1, indexes[0])}` + " ".r(margin) + `${point("b", 1, indexes[1])}` + " ".r(margin) + `${point("b", 1, indexes[2])}`,
        `${point("b", 1, indexes[0])}` + " ".r(margin) + `${point("b", 0, indexes[1])}` + " ".r(margin) + `${point("b", 1, indexes[2])}`,
        `${point("t", 0, indexes[0])}` + " ".r(margin) + `${point("t", 1, indexes[1])}` + " ".r(margin) + `${point("t", 0, indexes[2])}`
      ],
      b: [
        `${point("t", 1, indexes[0])}` + " ".r(margin) + `${point("t", 0, indexes[1])}` + " ".r(margin) + `${point("t", 1, indexes[2])}`,
        `${point("s", 0, indexes[0])}` + " ".r(margin) + `${point("s", 0, indexes[1])}` + " ".r(margin) + `${point("s", 0, indexes[2])}`,
        `${point("s", 1, indexes[0])}` + "─".r(margin) + `${point("s", 3, indexes[1])}` + "─".r(margin) + `${point("s", 2, indexes[2])}`,
        `${point("b", 0, indexes[0])}` + " ".r(margin) + `${point("b", 0, indexes[1])}` + " ".r(margin) + `${point("b", 0, indexes[2])}`,
        `${point("t", 1, indexes[0])}` + " ".r(margin) + `${point("t", 1, indexes[1])}` + " ".r(margin) + `${point("t", 1, indexes[2])}`,
        `${point("b", 0, indexes[0])}` + " ".r(margin) + `${point("b", 1, indexes[1])}` + " ".r(margin) + `${point("b", 0, indexes[2])}`
      ],
      m: [
        `${point("t", 1, indexes[0])}` + " ".r(margin) + `${point("t", 1, indexes[1])}` + " ".r(margin) + `${point("t", 1, indexes[2])}`,
        `${point("s", 0, indexes[0])}` + " ".r(margin) + `${point("s", 0, indexes[1])}` + " ".r(margin) + `${point("s", 0, indexes[2])}`,
        `${point("s", 1, indexes[0])}` + "─".r(margin) + `${point("s", 3, indexes[1])}` + "─".r(margin) + `${point("s", 2, indexes[2])}`,
        `${point("b", 1, indexes[0])}` + " ".r(margin) + `${point("b", 1, indexes[1])}` + " ".r(margin) + `${point("b", 1, indexes[2])}`
      ]
    };

    return types[type][typeIndex];
  }


  var baseStr =
`
`                       +                       `${line("t", 0, [16, 17, 18], 51)}
`                       +                       `${line("t", 1, [16, 17, 18], 51)}
`                       +                       `${line("t", 2, [16, 17, 18], 51)}
`                       +                       `${line("t", 1, [16, 17, 18], 51)}
`                       +                       `${line("t", 3, [16, 17, 18], 51)}
    │                                                           │                                                           │
    │                                                           │                                                           │
    │                                                           │                                                           │
    │                                                           │                                                           │
    │                                                           │                                                           │
    │`           + " ".repeat(18) +             `${line("t", 5, [8, 9, 10], 28)}`             + " ".repeat(18) +            `│
    │`           + " ".repeat(18) +             `${line("t", 1, [8, 9, 10], 28)}`             + " ".repeat(18) +            `│
    │`           + " ".repeat(18) +             `${line("t", 2, [8, 9, 10], 28)}`             + " ".repeat(18) +            `│
    │`           + " ".repeat(18) +             `${line("t", 1, [8, 9, 10], 28)}`             + " ".repeat(18) +            `│
    │`           + " ".repeat(18) +             `${line("t", 3, [8, 9, 10], 28)}`             + " ".repeat(18) +            `│
    │                      │                                    │                                    │                      │
    │                      │                                    │                                    │                      │
    │                      │                                    │                                    │                      │
    │                      │                                    │                                    │                      │
    │                      │                                    │                                    │                      │
    │                      │                                    │                                    │                      │
    │                      │` + " ".repeat(18) + `${line("t", 5, [0, 1, 2], 5)}` + " ".repeat(18) + `│                      │
    │                      │` + " ".repeat(18) + `${line("t", 1, [0, 1, 2], 5)}` + " ".repeat(18) + `│                      │
    │                      │` + " ".repeat(18) + `${line("t", 2, [0, 1, 2], 5)}` + " ".repeat(18) + `│                      │
    │                      │` + " ".repeat(18) + `${line("t", 1, [0, 1, 2], 5)}` + " ".repeat(18) + `│                      │
    │                      │` + " ".repeat(18) + `${line("t", 4, [0, 1, 2], 5)}` + " ".repeat(18) + `│                      │
    │                      │                      │                           │                      │                      │
    │                      │                      │                           │                      │                      │
${line("m", 0, [23, 15, 7], 14)}`                       + " ".repeat(19) +                       `${line("m", 0, [3, 11, 19], 14)}
${line("m", 1, [23, 15, 7], 14)}`                       + " ".repeat(19) +                       `${line("m", 1, [3, 11, 19], 14)}
${line("m", 2, [23, 15, 7], 14)}`                       + " ".repeat(19) +                       `${line("m", 2, [3, 11, 19], 14)}
${line("m", 1, [23, 15, 7], 14)}`                       + " ".repeat(19) +                       `${line("m", 1, [3, 11, 19], 14)}
${line("m", 3, [23, 15, 7], 14)}`                       + " ".repeat(19) +                       `${line("m", 3, [3, 11, 19], 14)}
    │                      │                      │                           │                      │                      │
    │                      │                      │                           │                      │                      │
    │                      │`+ " ".repeat(18) + `${line("b", 0, [6, 5, 4],5)}` + " ".repeat(18) +`│                      │
    │                      │`+ " ".repeat(18) + `${line("b", 1, [6, 5, 4],5)}` + " ".repeat(18) +`│                      │
    │                      │`+ " ".repeat(18) + `${line("b", 2, [6, 5, 4],5)}` + " ".repeat(18) +`│                      │
    │                      │`+ " ".repeat(18) + `${line("b", 1, [6, 5, 4],5)}` + " ".repeat(18) +`│                      │
    │                      │`+ " ".repeat(18) + `${line("b", 5, [6, 5, 4],5)}` + " ".repeat(18) +`│                      │
    │                      │                                    │                                    │                      │
    │                      │                                    │                                    │                      │
    │                      │                                    │                                    │                      │
    │                      │                                    │                                    │                      │
    │                      │                                    │                                    │                      │
    │                      │                                    │                                    │                      │
    │`          + " ".repeat(18) +             `${line("b", 4, [14, 13, 12], 28)}`             + " ".repeat(18) +          `│
    │`          + " ".repeat(18) +             `${line("b", 1, [14, 13, 12], 28)}`             + " ".repeat(18) +          `│
    │`          + " ".repeat(18) +             `${line("b", 2, [14, 13, 12], 28)}`             + " ".repeat(18) +          `│
    │`          + " ".repeat(18) +             `${line("b", 1, [14, 13, 12], 28)}`             + " ".repeat(18) +          `│
    │`          + " ".repeat(18) +             `${line("b", 5, [14, 13, 12], 28)}`             + " ".repeat(18) +          `│
    │                                                           │                                                           │
    │                                                           │                                                           │
    │                                                           │                                                           │
    │                                                           │                                                           │
    │                                                           │                                                           │
`                       +                       `${line("b", 4, [22, 21, 20], 51)}
`                       +                       `${line("b", 1, [22, 21, 20], 51)}
`                       +                       `${line("b", 2, [22, 21, 20], 51)}
`                       +                       `${line("b", 1, [22, 21, 20], 51)}
`                       +                       `${line("b", 3, [22, 21, 20], 51)}
`;

  return baseStr;
}




String.prototype.r = function(count) {
  var str = this;
  for (var i = 0; i < count - 1; i++) {
    str += this;
  }
  return str;
};
String.prototype.r = String.prototype.r;
