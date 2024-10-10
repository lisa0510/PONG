"use strict";

let gl;
let sp;

let Vertices;
let VertexBuffer;
let VertexLoc;
let uProjectionMatLoc;
let uModelMatLoc;
let Colors = [];
let ColorBuffer;
let ColorLoc;

let ball;
let paddle1;
let paddle2;
let mittelLine;
let lastTime;
let keysPressed = {};

function main(agl, asp) {
  gl = agl;
  sp = asp;

  Vertices = [-0.5, -0.8, 0.5, -0.8, 0.5, 0.5, -0.5, 0.5];

  VertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Vertices), gl.STATIC_DRAW);

  VertexLoc = gl.getAttribLocation(sp, "aVertex");
  gl.vertexAttribPointer(VertexLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(VertexLoc);

  uProjectionMatLoc = gl.getUniformLocation(sp, "uProjectionMat");
  uModelMatLoc = gl.getUniformLocation(sp, "uModelMat");

  ColorBuffer = gl.createBuffer();
  ColorLoc = gl.getAttribLocation(sp, "aColor");

  const array = ["BottomLeft", "BottomRight", "TopRight", "TopLeft"];
  array.forEach(
    (s, i) => (Colors[i] = Color2rgb(document.getElementById(s).value))
  );

  // Projection Matrix: Orthographic projection for a 100x100 square in the center of the screen
  const projectionMatrix = [
    2 / gl.canvas.width, 0, 0,
    0, 2 / gl.canvas.height, 0,
    0, 0, 1,
  ];

  gl.uniformMatrix3fv(uProjectionMatLoc, false, projectionMatrix);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //Initializes game objects (ball, paddles, midline) with their positions and sizes.
  ball = new Ball(0, 0, 10, 10, 1, 1); // Geschwindigkeit verringert
  paddle1 = new Paddle(-gl.canvas.width / 2 + 40, 0, 10, 60); // Paddle 1 nach links verschoben
  paddle2 = new Paddle(gl.canvas.width / 2 - 40, 0, 10, 60);  // Paddle 2 nach rechts verschoben
  mittelLine = new MittelLine(0, 0, 5, 500);

  DrawRect(paddle1.x, paddle1.y, paddle1.dx, paddle1.dy);
  DrawRect(paddle2.x, paddle2.y, paddle2.dx, paddle2.dy);
  DrawRect(ball.x, ball.y, ball.dx, ball.dy);
  DrawRect(mittelLine.x, mittelLine.y, mittelLine.dx, mittelLine.dy);

  // Tastaturereignisse
  window.addEventListener("keydown", function (event) {
    keysPressed[event.key] = true;
  });
  window.addEventListener("keyup", function (event) {
    keysPressed[event.key] = false;
  });

  window.requestAnimationFrame(drawAnimated);
  console.log("Animation started!");
}

function Color2rgb(color) {
  color = parseInt(color.substring(1), 16);
  const b = color & 255;
  color >>= 8;
  const g = color & 255;
  color >>= 8;
  const r = color & 255;
  return [r / 255.0, g / 255.0, b / 255.0];
}

function DrawRect(x0, y0, dx, dy) {
  // Model Matrix: Transformationsmatrix für jedes Objekt
  const modelMatrix = [
    dx, 0, 0,
    0, dy, 0,
    x0, y0, 1,
  ];

  gl.uniformMatrix3fv(uModelMatLoc, false, modelMatrix);
  gl.bindBuffer(gl.ARRAY_BUFFER, ColorBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(Colors.flat()),
    gl.STATIC_DRAW
  );
  gl.vertexAttribPointer(ColorLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(ColorLoc);

  gl.drawArrays(gl.TRIANGLE_FAN, 0, Vertices.length / 2);
}

//Updates the color of an object in the Colors array and redraws all objects using DrawRect for each object.
function Draw(index, color) {
  console.log("Draw", index, color);
  Colors[index] = Color2rgb(color);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  DrawRect(paddle1.x, paddle1.y, paddle1.dx, paddle1.dy);
  DrawRect(paddle2.x, paddle2.y, paddle2.dx, paddle2.dy);
  DrawRect(ball.x, ball.y, ball.dx, ball.dy);
  DrawRect(mittelLine.x, mittelLine.y, mittelLine.dx, mittelLine.dy);
}

// Spiellogik-Update-Funktion
function updateGame() {
  // Paddle-Bewegungen
  if (
    keysPressed["ArrowDown"] &&
    paddle2.y > -gl.canvas.height / 2 + paddle2.dy / 2
  ) {
    paddle2.y -= 2;
  }
  if (
    keysPressed["ArrowUp"] &&
    paddle2.y < gl.canvas.height / 2 - paddle2.dy / 2
  ) {
    paddle2.y += 2;
  }
  if (keysPressed["s"] && paddle1.y > -gl.canvas.height / 2 + paddle1.dy / 2) {
    paddle1.y -= 2;
  }
  if (keysPressed["w"] && paddle1.y < gl.canvas.height / 2 - paddle1.dy / 2) {
    paddle1.y += 2;
  }

  // Ballbewegungen
  ball.x += ball.speedx;
  ball.y += ball.speedy;

  // Kollision mit oberen und unteren Wänden
  if (
    ball.y <= -gl.canvas.height / 2 + ball.dy / 2 ||
    ball.y >= gl.canvas.height / 2 - ball.dy / 2
  ) {
    ball.speedy = -ball.speedy;
  }

  // Kollision mit Paddles

  if (
    (ball.x - ball.dx / 2 <= paddle1.x + paddle1.dx / 2 &&
      ball.y >= paddle1.y - paddle1.dy / 2 &&
      ball.y <= paddle1.y + paddle1.dy / 2) ||
    (ball.x + ball.dx / 2 >= paddle2.x - paddle2.dx / 2 &&
      ball.y >= paddle2.y - paddle2.dy / 2 &&
      ball.y <= paddle2.y + paddle2.dy / 2)
  ) {
    ball.speedx = -ball.speedx;
  }

  // Punkte und Zurücksetzen, verlässt spielfeld?
  if (ball.x < -gl.canvas.width / 2 || ball.x > gl.canvas.width / 2) {

    ball.x = 0;
    ball.y = 0;
    ball.speedx = -ball.speedx;
  }
}

// Zeichnungsfunktion aktualisieren
function drawAnimated(timeStamp) {
  // Berechne die vergangene Zeit seit dem letzten Aufruf
  if (!lastTime) lastTime = timeStamp;
  const deltaTime = timeStamp - lastTime;
  lastTime = timeStamp;

  updateGame(); // Spiellogik aktualisieren

  // Zeichne die Objekte neu
  gl.clear(gl.COLOR_BUFFER_BIT); // Lösche den Bildschirm
  DrawRect(paddle1.x, paddle1.y, paddle1.dx, paddle1.dy); // Zeichne Paddle 1 neu
  DrawRect(paddle2.x, paddle2.y, paddle2.dx, paddle2.dy); // Zeichne Paddle 2 neu
  DrawRect(mittelLine.x, mittelLine.y, mittelLine.dx, mittelLine.dy); // Zeichne Mittellinie neu
  DrawRect(ball.x, ball.y, ball.dx, ball.dy); // Zeichne den Ball neu

  // Fordere den nächsten Frame an
  window.requestAnimationFrame(drawAnimated);
}

// Klassen für Ball und Paddles
class Ball {
  constructor(x, y, dx, dy, speedx, speedy) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.speedx = speedx;
    this.speedy = speedy;
  }
}

class Paddle {
  constructor(x, y, dx, dy) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
  }
}

class MittelLine {
  constructor(x, y, dx, dy) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
  }
}
