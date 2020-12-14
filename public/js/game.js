import { Clock } from "./clock.js";
import { Dimensions } from "./dimensions.js";
import { Player } from "./player.js";
import { Point } from "./point.js";
import { Present } from "./present.js";
import { Terrain } from "./terrain.js";
import { Sounds } from "./sounds.js";
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
var clock;
var highscore = JSON.parse(localStorage.getItem('highscore')) || 0;
var stats = JSON.parse(localStorage.getItem('stats')) || {
    longestJump: 0, highestPoint: 0, gamesPlayed: 0, topSpeed: 0
};
var sounds = new Sounds();
var drawSky = function (ctx) {
    var bg = ctx.createLinearGradient(0, 0, 0, areaHeight);
    bg.addColorStop(0, '#474');
    bg.addColorStop(0.5, '#333');
    bg.addColorStop(1, '#daa');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, areaWidth, areaHeight);
};
var setAreaDimensions = function () {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    areaHeight = canvas.height;
    areaWidth = canvas.width;
    terrain.areaDimensions.width = canvas.width;
    terrain.areaDimensions.height = canvas.height;
    terrain.resetPoints();
    document.getElementsByTagName('body')[0].style.height = window.innerHeight + 'px';
    drawSky(ctx);
};
var calculateFrame = function () {
    var t0 = time;
    var t1 = new Date();
    var dt = (t1.getTime() - t0.getTime()) / 1000;
    if (dt > 1000) {
        dt = 10;
    }
    player.calculateFrame(dt);
    time = t1;
};
var draw = function () {
    drawSky(ctx);
    terrain.draw();
    player.draw(presents.filter(function (p) { return p.collected; }));
    presents.forEach(function (p, i) {
        p.draw();
    });
    ctx.font = "50px Josefin Sans";
    ctx.textAlign = "right";
    ctx.fillText("" + (presents.length - 1), areaWidth - 40, 60);
    ctx.font = "14px Josefin Sans";
    ctx.textAlign = "right";
    ctx.fillText("Pisin hyppy " + player.longestJump() + " m", areaWidth - 40, 100);
    ctx.fillText("Maksimikorkeus " + player.highestPoint() + " m", areaWidth - 40, 120);
    ctx.fillText("Huippunopeus " + player.topSpeed() + " km/h", areaWidth - 40, 140);
    if (startTime) {
        clock.draw(gameDuration * 1000 - (time.getTime() - startTime.getTime()));
    }
};
var updateHtmlTargets = function () {
    document.getElementById('result').innerText = "-";
    document.getElementById('high-score').innerText = highscore.toString();
    document.getElementById('games-played').innerText = stats.gamesPlayed.toString();
    document.getElementById('longest-jump').innerText = stats.longestJump.toString();
    document.getElementById('highest-point').innerText = stats.highestPoint.toString();
    document.getElementById('top-speed').innerText = stats.topSpeed.toString();
};
var updateSoundButton = function () {
    var soundButton = document.getElementById('sound');
    if (sounds.enabled) {
        soundButton.innerHTML = "&#128266;";
        soundButton.classList.remove("muted");
    }
    else {
        soundButton.innerHTML = "&#128263;";
        soundButton.classList.add("muted");
    }
};
var initGame = function () {
    terrain = new Terrain(canvas, new Dimensions(areaWidth, areaHeight));
    clock = new Clock(ctx, terrain);
    player = new Player(canvas, terrain, new Point(50, 600));
    presents = [new Present(canvas, terrain)];
    time = new Date();
    updateHtmlTargets();
    updateSoundButton();
};
var startGame = function () {
    initGame();
    startTime = new Date();
    time = startTime;
    var interval = setInterval(function () {
        if (startTime.getTime() > (new Date()).getTime() - gameDuration * 1000) {
            calculateFrame();
        }
        else {
            clearInterval(interval);
        }
    }, 5);
    sounds.startGameTune();
};
var refresh = function () {
    ctx.clearRect(0, 0, areaWidth, areaHeight);
    var p = presents[presents.length - 1];
    var playerSize = player.skiWidth;
    if (new Point(player.onScreenX(), player.position.y - playerSize).distanceTo(p.position) < p.width * (3 / 2)) {
        p.collected = true;
        presents.push(new Present(canvas, terrain));
        sounds.playCollectSound();
    }
    draw();
    if (startTime.getTime() > (new Date()).getTime() - gameDuration * 1000) {
        requestAnimationFrame(refresh);
    }
    else {
        var score = presents.length - 1;
        document.getElementsByTagName('body')[0].classList.remove('started');
        document.getElementById('result').innerText = score.toString();
        sounds.stopGameTune();
        highscore = Math.max(highscore, score);
        localStorage.setItem('highscore', JSON.stringify(highscore));
        document.getElementById('high-score').innerText = score.toString();
        stats.gamesPlayed += 1;
        stats.longestJump = Math.max(stats.longestJump || 0, player.longestJump());
        stats.highestPoint = Math.max(stats.highestPoint || 0, player.highestPoint());
        stats.topSpeed = Math.max(stats.topSpeed || 0, player.topSpeed());
        localStorage.setItem('stats', JSON.stringify(stats));
        updateHtmlTargets();
    }
};
initGame();
setAreaDimensions();
setTimeout(function () {
    draw();
}, 200);
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
    diveButton.classList.add('active');
    e.preventDefault();
}, false);
diveButton.addEventListener('touchend', function (e) {
    player.hanldeDiveButtonRelease();
    diveButton.classList.remove('active');
    e.preventDefault();
}, false);
diveButton.addEventListener('touchcancel', function (e) {
    player.hanldeDiveButtonRelease();
    diveButton.classList.remove('active');
    e.preventDefault();
}, false);
var soundButton = document.getElementById('sound');
soundButton.addEventListener('click', function (e) {
    sounds.toggleMute();
    updateSoundButton();
    e.preventDefault();
}, false);
//# sourceMappingURL=game.js.map