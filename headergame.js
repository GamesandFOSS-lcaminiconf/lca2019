(function () {
    var requestAnimationFrame = window.requestAnimationFrame
    || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame
    || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

var canvas = document.getElementById("canvas"),
    width = document.documentElement.clientWidth,
    height = document.documentElement.clientHeight / 2,
    ctx = canvas.getContext("2d"),
    player = {
        x: width / 2,
        y: height - 15,
        width: 50,
        height: 50,
        speed: 3,
        velX: 0,
        velY: 0,
        jumping: false,
        grounded: false
    },
    keys = [],
    friction = 0.8,
    gravity = 0.1;

var boxes = [];
var triangles = [];

// dimensions
//left side
boxes.push({
    x: 0,
    y: 0,
    width: 5,
    height: height
});
//bottom
boxes.push({
    x: 0,
    y: height - 2,
    width: width,
    height: 50
});
//right side
boxes.push({
    x: width,
    y: 0,
    width: 5,
    height: height
});

function generateTriangles() {
  triangles = destroyTriangles(triangles);
  var triangleWidthHeight = 50;
  var numberoftriangles = Math.floor(width / (triangleWidthHeight+100));
  var trianglerows = Math.floor(height / (triangleWidthHeight+100));
  var total = Math.floor(numberoftriangles);
  var startx = 50;
  var starty = 50;
  var fill = 100;

  for (var p = 0; p < trianglerows; p++){
    for (var k = 0; k < numberoftriangles; k++) {
      triangles.push({
          xA: startx + (k*(fill+triangleWidthHeight)), //same as xC
          yA: starty + (p*(fill+triangleWidthHeight)), //same as yB
          xB: startx + ((k+1)*triangleWidthHeight)+(k*fill), //same as yC
          yB: starty + (p*(fill+triangleWidthHeight)), //same as yA
          xC: startx + (k*(fill+triangleWidthHeight)), //same as xA
          yC: starty + ((p+1)*triangleWidthHeight)+(p*fill)  //same as xB
      });
    }
  }
}

function destroyTriangles(trianglesarray) {
  if (triangles.length > 0) {
    trianglesarray = [];
  }
  return trianglesarray;
}

canvas.width = width;
canvas.height = height

function update() {
  if (triangles.length <= 0){
    generateTriangles();
  }
  if(canvas.width !== innerWidth){
      canvas.width = innerWidth;
      //var width = innerWidth; // this line does something funky and I need to find out why. I think I know why
      width = innerWidth;
      player.x = width/2;
      player.y = height - 15;
      boxes[1] = ({
          x: 0,
          y: height - 2,
          width: canvas.width,
          height: 50
      });
      boxes[2] = ({
          x: canvas.width - 1,
          y: 0,
          width: 5,
          height: height
      });
      generateTriangles();
  }

  // check keys
  if (keys[38] || keys[32]) {
      // up arrow or space
      if (!player.jumping && player.grounded) {
          player.jumping = true;
          player.grounded = false;
          player.velY = -player.speed * 2;
      }
  }
  if (keys[39]) {
      // right arrow
      if (player.velX < player.speed) {
        player.velX++;
      }
  }
  if (keys[37]) {
    // left arrow
    if (player.velX > -player.speed) {
          player.velX--;
      }
  }

  player.velX *= friction;
  player.velY += gravity;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#0F7C11";
  ctx.beginPath();

  var trianglesList = [];
  player.grounded = false;
  for (var i = 0; i < boxes.length; i++) {
      //ctx.rect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
      for (var j = 0; j < triangles.length; j++) {
        ctx.beginPath();
        ctx.moveTo(triangles[j].xA,triangles[j].yA);
        ctx.lineTo(triangles[j].xB,triangles[j].yB);
        ctx.lineTo(triangles[j].xC,triangles[j].yC);
        ctx.lineTo(triangles[j].xA,triangles[j].yA);
        ctx.strokeStyle = "#0F7C11"
        ctx.stroke();
      }
      var dir = colCheck(player, boxes[i]);

      if (dir === "l" || dir === "r") {
          player.velX = 0;
          player.jumping = false;
      } else if (dir === "b") {
          player.grounded = true;
          player.jumping = false;
      } else if (dir === "t") {
          player.velY *= -1;
      }
  }
  var collisionTriangles = determineLikelyCollisionTriangles(player, triangles, 100);

  var collided = colTCheck(player, collisionTriangles);
  if(collided){
    player.velY = -player.velY;
    player.velX = -player.velX;
  }

  if(player.grounded){
       player.velY = 0;
  }

  player.x += player.velX;
  player.y += player.velY;

  /*ctx.fill();*/
  ctx.fillStyle = "#ccd5c5";
  ctx.fillRect(player.x, player.y, player.width, player.height);
  //window.addEventListener('resize',resizeCanvas, false);

  requestAnimationFrame(update);
}

function colCheck(shapeA, shapeB) {
    // get the vectors to check against
    var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
        vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
        // add the half widths and half heights of the objects
        hWidths = (shapeA.width / 2) + (shapeB.width / 2),
        hHeights = (shapeA.height / 2) + (shapeB.height / 2),
        colDir = null;

    // if the x and y vector are less than the half width or half height,
    //they we must be inside the object, causing a collision
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
    // figures out on which side we are colliding (top, bottom, left, or right)
    var oX = hWidths - Math.abs(vX),
        oY = hHeights - Math.abs(vY);
    if (oX >= oY) {
            if (vY > 0) {
                colDir = "t";
                shapeA.y += oY;
            } else {
                colDir = "b";
                shapeA.y -= oY;
            }
        } else {
            if (vX > 0) {
                colDir = "l";
                shapeA.x += oX;
            } else {
                colDir = "r";
                shapeA.x -= oX;
            }
        }
    }
    return colDir;
}
//
/* TRIANGLE COLLISION CODE */
//
function createPoint(x,y){
  return {x: x,
          y: y
        };
}
//turns point into 2D vector
function createVector2D(start, finish){
  return {dx: finish.x - start.x,
          dy: finish.y - start.y,
        };
}

//norm also means length of 2Dvector
function Norm2D(v){
    return Math.sqrt(Math.pow(v.dx, 2)+Math.pow(v.dy, 2));
}

//turns 2D vector into 3D vector
function expand2DVector(v){
  return {dx: v.dx, dy: v.dy, dz: 0};
}

//possibly add check for 3D and if not turn into 3D
function dotProduct3D(v1, v2){
  return v1.dx*v2.dx+v1.dy*v2.dy+v1.dz*v2.dz;
}

//possibly add check for 3D vector and if not turn into 3D vector
function crossProduct(v1, v2){
  cx = (v1.dy*v2.dz) - (v1.dz*v2.dy);
  cy = (v1.dz*v2.dx) - (v1.dx*v2.dz);
  cz = (v1.dx*v2.dy) - (v1.dy*v2.dx);
  return {dx: cx, dy: cy, dz: cz};
}

function turnTriangleintoList(triangle){
  var a = createPoint(triangle.xA, triangle.yA);
  var b = createPoint(triangle.xB, triangle.yB);
  var c = createPoint(triangle.xC, triangle.yC);
  return [a,b,c];
}

function calculatePlayerCenter(player){
  return createPoint(player.x + player.width/2, player.y - player.height/2);
}

function approximateTriangleCenter(triangle){
  // this function needs a list of triangle points. see turnTriangleintoList()
  //potentially change to get true center which is start point (x+1/3width),(y-1/3width)
  var x = 0;
  var y = 0;
  for(var i=0; i<3; i++){
    x += triangle[i].x;
    y += triangle[i].y;
  }
  x = x / 3;
  y = y / 3;

  return createPoint(x, y);
}

function turnPlayerIntoList(player){
  var topleft = createPoint(player.x, player.y);
  var topright = createPoint((player.x + player.width), player.y);
  var bottomright = createPoint((player.x + player.width),
    (player.y + player.height));
  var bottomleft = createPoint(player.x, (player.y + player.height));
  return [topleft, topright, bottomright, bottomleft];
}

function collidePointwithPolygon(Polygon, point){
  // the polygon has to be a list of the points that are the
  // convex hull of the Polygon running clockwise around the
  // polygon
  var collision = true;
  for(var i=0; i < Polygon.length; i++) {
    // maybe check if 2D or 3D first
    var PolyV = expand2DVector(createVector2D(Polygon[i], Polygon[(i+1)%Polygon.length]));
    var VtoPoint = expand2DVector(createVector2D(Polygon[i], point));
    var VofXProduct = crossProduct(PolyV, VtoPoint);
    if(VofXProduct.dz < 0){
      collision = false;
      break;
    }
  }
  return collision;
}

function collidetwoPolygons(Poly1, Poly2){
  //check if any point of Poly2 collides with Poly1
  var collision = false;
  for(var i=0; i<Poly2.length; i++){
    collision = collidePointwithPolygon(Poly1, Poly2[i]);
    if(collision == true){
      return collision;
    }
  }
  // check if any point of Poly1 collides with Poly2
  for(var i=0; i<Poly1.length; i++){
    collision = collidePointwithPolygon(Poly2, Poly1[i]);
    if(collision == true){
      return collision;
    }
  }
  return collision;
}

function colTCheck(player, triangles){
  var playerList = turnPlayerIntoList(player);
  for(var i=0; i<triangles.length; i++){
    var currTList = turnTriangleintoList(triangles[i]);
    var collision = collidetwoPolygons(playerList, currTList);
  }
  return collision;
}

function determineLikelyCollisionTriangles(player, triangles, maxdist){
  var likelytriangles = [];
  var pcenter = calculatePlayerCenter(player);

  for(var i=0; i<triangles.length; i++){
    var t = turnTriangleintoList(triangles[i]);
    var tcenter = approximateTriangleCenter(t);
    var dist = Norm2D(createVector2D(pcenter, tcenter));
    if(dist < maxdist){
      likelytriangles.push(triangles[i]);
    }
  }
  return likelytriangles;
}


document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});

document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});

window.addEventListener("load", function () {
    update();
});
