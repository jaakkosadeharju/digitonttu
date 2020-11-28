import { Clock } from "./clock.js";
import { Dimensions } from "./dimensions.js";
import { Player } from "./player.js";
import { Point } from "./point.js";
import { Present } from "./present.js";
import { Terrain } from "./terrain.js";
var canvas = document.getElementById("game-area");
var ctx = canvas.getContext("2d");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
var areaHeight = canvas.height;
var areaWidth = canvas.width;
var gameDuration = 30;
var terrain;
var player;
var presents;
var time;
var startTime;
var clock = new Clock(ctx, new Point(areaWidth / 2, areaHeight / 2));
var highscore = JSON.parse(localStorage.getItem('highscore')) || 0;
var setAreaDimensions = function () {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    terrain.areaDimensions.width = canvas.width;
    terrain.areaDimensions.height = canvas.height;
    document.getElementsByTagName('body')[0].style.height = window.innerHeight + 'px';
};
var drawSky = function (ctx) {
    var bg = ctx.createLinearGradient(0, 0, 0, areaHeight);
    bg.addColorStop(0, '#474');
    bg.addColorStop(0.5, '#333');
    bg.addColorStop(1, '#daa');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, areaWidth, areaHeight);
};
var draw = function () {
    drawSky(ctx);
    terrain.draw();
    var t0 = time;
    var t1 = new Date();
    var dt = (t1.getTime() - t0.getTime()) / 1000;
    if (dt > 1000) {
        dt = 10;
    }
    player.calculateFrame(dt);
    player.draw(presents.filter(function (p) { return p.collected; }));
    presents.forEach(function (p, i) {
        p.draw();
    });
    ctx.font = "50px Arial";
    ctx.textAlign = "right";
    ctx.fillText("" + (presents.length - 1), areaWidth - 40, 60);
    if (startTime) {
        clock.draw(gameDuration * 1000 - (t1.getTime() - startTime.getTime()));
    }
    time = t1;
};
var initGame = function () {
    terrain = new Terrain(canvas, new Dimensions(areaWidth, areaHeight));
    player = new Player(canvas, terrain, new Point(100, 600));
    presents = [new Present(canvas, terrain)];
    time = new Date();
    document.getElementById('high-score').innerText = highscore.toString();
};
var startGame = function () {
    initGame();
    startTime = new Date();
    time = startTime;
};
var refresh = function () {
    ctx.clearRect(0, 0, areaWidth, areaHeight);
    var p = presents[presents.length - 1];
    if (player.position.x > p.position.x - p.width / 2
        && player.position.x < p.position.x + p.width * (3 / 2)
        && player.position.y > p.position.y - p.height / 2
        && player.position.y < p.position.y + p.height * (3 / 2)) {
        p.collected = true;
        presents.push(new Present(canvas, terrain));
    }
    draw();
    if (startTime.getTime() > (new Date()).getTime() - gameDuration * 1000) {
        requestAnimationFrame(refresh);
    }
    else {
        var score = presents.length - 1;
        document.getElementsByTagName('body')[0].classList.remove('started');
        document.getElementById('result').innerText = score.toString();
        if (score > highscore) {
            highscore = score;
            document.getElementById('high-score').innerText = score.toString();
            localStorage.setItem('highscore', JSON.stringify(score));
        }
    }
};
initGame();
setAreaDimensions();
draw();
window.onresize = setAreaDimensions;
window.onscroll = setAreaDimensions;
document.getElementById('start').onclick = function () {
    startGame();
    document.getElementsByTagName('body')[0].classList.add('started');
    requestAnimationFrame(refresh);
};
var diveButton = document.getElementById('dive');
diveButton.addEventListener('mousedown', function (e) {
    player.handleDiveButtonPress();
}, false);
diveButton.addEventListener('mouseup', function (e) {
    player.hanldeDiveButtonRelease();
}, false);
diveButton.addEventListener('touchstart', function (e) {
    player.handleDiveButtonPress();
    e.preventDefault();
}, false);
diveButton.addEventListener('touchend', function (e) {
    player.hanldeDiveButtonRelease();
    e.preventDefault();
}, false);
diveButton.addEventListener('touchcancel', function (e) {
    player.hanldeDiveButtonRelease();
    e.preventDefault();
}, false);
//# sourceMappingURL=game.js.map