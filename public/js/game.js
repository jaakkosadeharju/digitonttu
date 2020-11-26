import { Dimensions } from "./dimensions.js";
import { Player } from "./player.js";
import { Point } from "./point.js";
import { Terrain } from "./terrain.js";
var canvas = document.getElementById("game-area");
var ctx = canvas.getContext("2d");
var terrain = new Terrain(canvas, new Dimensions(1920, 1080));
var player = new Player(ctx, new Point(100, 100));
var time = new Date();
var drawSky = function (ctx) {
    var bg = ctx.createLinearGradient(0, 0, 0, 1080);
    bg.addColorStop(0, '#304');
    bg.addColorStop(0.5, '#004');
    bg.addColorStop(1, '#000');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1920, 1080);
};
var draw = function () {
    drawSky(ctx);
    terrain.draw();
    var t0 = time;
    var t1 = new Date();
    var dt = (t1.getTime() - t0.getTime()) / 1000;
    player.calculateFrame(dt);
    player.draw();
    time = t1;
};
setInterval(function () {
    ctx.clearRect(0, 0, 1920, 1080);
    draw();
}, 20);
//# sourceMappingURL=game.js.map