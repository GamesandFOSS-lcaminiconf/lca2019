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
        width: 75,
        height: 75,
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
generateTriangles();
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

boxes.push({
    x: 120,
    y: 10,
    width: 80,
    height: 80
});
boxes.push({
    x: 170,
    y: 50,
    width: 80,
    height: 80
});
boxes.push({
    x: 220,
    y: 100,
    width: 80,
    height: 80
});
boxes.push({
    x: 270,
    y: 150,
    width: 40,
    height: 40
});


function generateTriangles() {
  var triangleWidthHeight = 50;
  var numberoftriangles = Math.floor(width / (triangleWidthHeight+100));
  var total = Math.floor(numberoftriangles);
  console.log(numberoftriangles);
  var startx = 25;
  var starty = 25;
  var fill = 0;


  for (var p = 0; p < 10; p++){
    for (var k = 0; k < numberoftriangles; k++) {
      triangles.push({
          xA: startx + (k*(fill+triangleWidthHeight)), //same as xC
          yA: starty, //same as yB
          xB: startx + ((k+1)*triangleWidthHeight)+(k*fill), //same as yC
          yB: starty, //same as yA
          xC: startx + (k*(fill+triangleWidthHeight)), //same as xA
          yC: starty + triangleWidthHeight //same as xB
      });
      console.log(fill);
      fill = 100;
    }
      starty = 25+(p*(fill+triangleWidthHeight));
  }
}

canvas.width = width;
canvas.height = height


/*function resizeCanvas() {
  var canvas = document.getElementById("canvas"),
        width = document.documentElement.clientWidth;
    canvas.width = width;
  boxes[1] = ({
      x: 0,
      y: height - 2,
      width: width,
      height: 50
  });
  boxes[2] = ({
      x: width - 1,
      y: 0,
      width: 5,
      height: height
  });

  //so close but yet so far
  //requestAnimationFrame(update);
}*/


function update() {
    if(canvas.width !== innerWidth){
        canvas.width = innerWidth;
        //var width = innerWidth; // this line does something funky and I need to find out why
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
        width = innerWidth;
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


    /*/ Filled triangle
        ctx.beginPath();
        ctx.moveTo(25, 25);
        ctx.lineTo(105, 25);
        ctx.lineTo(25, 105);
        ctx.fill();*/

    if(player.grounded){
         player.velY = 0;
    }

    player.x += player.velX;
    player.y += player.velY;

    ctx.fill();
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
    var oX = hWidths - Math.abs(vX), oY = hHeights - Math.abs(vY);
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

document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});

document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});

window.addEventListener("load", function () {
    update();
});
