const PImage = require('pureimage');
const fs = require('fs');

var rowPx = 200;
//var rowPx = 20;

var pointRadius = 20;

var imageOffset = pointRadius * 1.5;

var pointStrokeWidth = 1;
var lineStrokeWidth = pointStrokeWidth;

module.exports = function(game, imagePath, callback) {
  var board = game;

  //console.log(game);

  var rows = game.board.map.length / game.board.pointCount;

  var innerSize = (rows * 2) * rowPx;

  var imageSize = innerSize + imageOffset * 2;

  var renderImage = PImage.make(imageSize, imageSize);
  var ctx = renderImage.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, imageSize, imageSize);

  ctx.strokeStyle= "#000000";
  ctx.lineWidth = 5;

  var allPoints = [];

  for (var i = 0; i < rows; i++) {
    var rectBoundings = {
      x: imageSize / 2 - (i + 1) * rowPx,
      y: imageSize / 2 - (i + 1) * rowPx,
      size: rowPx * (i + 1) * 2
    };

    ctx.lineWidth = lineStrokeWidth;
    ctx.strokeWidth = lineStrokeWidth;
    ctx.strokeRect(rectBoundings.x, rectBoundings.y, rectBoundings.size, rectBoundings.size);

    var pointsCount = game.board.points.length * 4;

    allPoints.push(new Array(pointsCount).fill(function(pointIndex) {
      // 'pointIndex' is the index of the point in row globally (0-7)


      // Get the real count of points at one side in a row (Default 2)
      var realPointsCount = pointsCount / 4;
      // Calculate index of site
      var side = Math.trunc(pointIndex / realPointsCount);
      // Index of point relative to side (0-1)
      var index = pointIndex % realPointsCount;
      // Percentage position of point in relation to side length
      var indexRel = index / (realPointsCount - 1);

      // Now, it is important to set the psoition when needed.
      // E.g. On top side, Y position is alaways the same but X position changes. Same on bottom side
      // Reverse logic on left and right side

      var rowOffset = (i + 1) * rowPx;
      var rowSize = rowOffset * 2;

      var x = imageSize / 2;
      var y = imageSize / 2;

      var pointPos = {
        index: index
      };

      if (side % 2) {
        // Even
        y -= rowOffset;
        x += side == 1 ? rowOffset : -rowOffset;

        pointPos.x = x;
        pointPos.y = y + (indexRel * rowSize);
      }
      else {
        // Odd
        x -= rowOffset;
        y += side == 2 ? rowOffset : -rowOffset;
        //return pos;
        pointPos.x = x + (indexRel * rowSize);
        pointPos.y = y;
      }

      return pointPos;
    }));



    /*ctx.beginPath();
    ctx.moveTo(, 0);
    ctx.lineTo(300, 150);
    ctx.stroke();*/
  }
  ctx.fillStyle = '#000000';
  ctx.strokeStyle = '#000000';



  allPoints.forEach(function(row, rowIndex) {
    row.forEach(function(point, pointIndex) {

      ctx.lineWidth = lineStrokeWidth;

      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      if (rowIndex + 1 in allPoints && game.board.points[point.index]) {
        ctx.lineTo(allPoints[rowIndex + 1][pointIndex].x, allPoints[rowIndex + 1][pointIndex].y);
      }
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.lineWidth = pointStrokeWidth;
      ctx.beginPath();
      ctx.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    });
  });


  var stream = fs.createWriteStream(imagePath);

  PImage.encodePNGToStream(renderImage, stream).then(() => {
    callback(stream);
  }, function(err) {
    console.log(err);
  });



}
