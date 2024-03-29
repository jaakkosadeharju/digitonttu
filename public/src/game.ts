import { Clock } from "./clock.js";
import { Dimensions } from "./dimensions.js";
import { Player } from "./player.js";
import { Point } from "./point.js";
import { Present } from "./present.js";
import { Terrain } from "./terrain.js";
import { Sounds } from "./sounds.js"

let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("game-area");
let ctx: CanvasRenderingContext2D = canvas.getContext("2d");


canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
let areaHeight = canvas.height;
let areaWidth = canvas.width;

const gameDuration = 30;
let gameExtraTime = 0;
let terrain: Terrain;
let player: Player;
let presents: Present[];
let time: Date;
let startTime: Date;
let clock: Clock;
let highscore: number = JSON.parse(localStorage.getItem('highscore')) || 0;
let stats = JSON.parse(localStorage.getItem('stats')) || {
    longestJump: 0, highestPoint: 0, gamesPlayed: 0, topSpeed: 0
};
let sounds: Sounds = new Sounds();


const drawSky = (ctx: CanvasRenderingContext2D) => {
    let bg = ctx.createLinearGradient(0, 0, 0, areaHeight);
    bg.addColorStop(0, '#474');
    bg.addColorStop(0.5, '#333');
    bg.addColorStop(1, '#daa');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, areaWidth, areaHeight);
}

const setAreaDimensions = () => {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    areaHeight = canvas.height;
    areaWidth = canvas.width;

    terrain.areaDimensions.width = canvas.width;
    terrain.areaDimensions.height = canvas.height;
    terrain.resetPoints();

    document.getElementsByTagName('body')[0].style.height = window.innerHeight + 'px';
    drawSky(ctx);
}

const calculateFrame = () => {
    // Calculate time
    let t0 = time;
    let t1 = new Date();
    let dt = (t1.getTime() - t0.getTime()) / 1000;

    if (dt > 1000) {
        dt = 10;
    }

    player.calculateFrame(dt, presents.filter(p => p.collected));

    time = t1;
}

const draw = () => {
    drawSky(ctx);
    terrain.draw();

    // Score
    ctx.font = "50px Josefin Sans";
    ctx.textAlign = "right";
    ctx.fillText(`${presents.length - 1}`, areaWidth - 40, 60);


    // Score
    ctx.font = "14px Josefin Sans";
    ctx.textAlign = "right";
    ctx.fillText(`Pisin hyppy ${player.longestJump()} m`, areaWidth - 40, 100);
    ctx.fillText(`Maksimikorkeus ${player.highestPoint()} m`, areaWidth - 40, 120);
    ctx.fillText(`Huippunopeus ${player.topSpeed()} km/h`, areaWidth - 40, 140);

    // Clock
    if (startTime) {
        clock.draw((gameDuration + gameExtraTime) * 1000 - (time.getTime() - startTime.getTime()));
    }

    player.draw(presents.filter(p => p.collected));
    presents.forEach((p, i) => {
        p.draw();
    });
}

const updateHtmlTargets = () => {
    document.getElementById('result').innerText = (presents.length - 1).toString();
    document.getElementById('high-score').innerText = highscore.toString();
    document.getElementById('games-played').innerText = stats.gamesPlayed.toString();
    document.getElementById('longest-jump').innerText = stats.longestJump.toString();
    document.getElementById('highest-point').innerText = stats.highestPoint.toString();
    document.getElementById('top-speed').innerText = stats.topSpeed.toString();
};

const updateSoundButton = () => {
    let soundButton = document.getElementById('sound');
    if (sounds.enabled) {
        soundButton.innerHTML = "&#128266;";
        soundButton.classList.remove("muted");
    }
    else {
        soundButton.innerHTML = "&#128263;";
        soundButton.classList.add("muted");
    }
}

const initGame = () => {
    terrain = new Terrain(canvas, new Dimensions(areaWidth, areaHeight));
    clock = new Clock(ctx, terrain);
    player = new Player(canvas, terrain, new Point(50, 600));
    presents = [new Present(canvas, terrain)];
    time = new Date();

    updateHtmlTargets();
    updateSoundButton();
}

const startGame = () => {
    initGame();
    startTime = new Date();
    gameExtraTime = 0;
    time = startTime;

    let interval = setInterval(() => {
        if (startTime.getTime() > (new Date()).getTime() - (gameDuration + gameExtraTime) * 1000) {
            calculateFrame();
        }
        else {
            clearInterval(interval);
        }
    }, 5);

    // sounds.stopMainTune();
    sounds.startGameTune();
}

const refresh = () => {
    ctx.clearRect(0, 0, areaWidth, areaHeight);

    const p = presents[presents.length - 1];
    const playerSize = player.skiWidth;

    if (new Point(player.onScreenX(), player.position.y - playerSize).distanceTo(p.position) < p.width * (3 / 2)) {
        // Pick the present
        p.collected = true;
        presents.push(new Present(canvas, terrain));
        let timeIncrement =
            -1 +
            // factor from x-speed
            (terrain.areaDimensions.width / player.velocity.x) *
            // dimension factor
            (5 * terrain.areaDimensions.height / terrain.areaDimensions.width) *
            // size factor
            ((terrain.areaDimensions.width + terrain.areaDimensions.height) / 5000) *
            // Time factor (half of the bonus every 30 s)
            (1 / ((gameDuration + gameExtraTime) / 30));

        timeIncrement = Math.min(10, timeIncrement);
        gameExtraTime += timeIncrement;
        clock.extendTime(timeIncrement);

        sounds.playCollectSound();
    }

    draw();

    if (startTime.getTime() > (new Date()).getTime() - (gameDuration + gameExtraTime) * 1000) {
        requestAnimationFrame(refresh);
    }
    else {
        // Game ended
        const score = presents.length - 1;
        document.getElementsByTagName('body')[0].classList.remove('started');
        document.getElementById('result').innerText = score.toString();

        sounds.stopGameTune();
        // sounds.startMainTune();

        // save the high score
        highscore = Math.max(highscore, score);
        localStorage.setItem('highscore', JSON.stringify(highscore));
        document.getElementById('high-score').innerText = score.toString();

        // Save stats
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

// Draw first frame to the background
setTimeout(() => {
    draw();
}, 200);

window.onresize = setAreaDimensions;
window.onscroll = setAreaDimensions;

document.getElementById('start').onclick = () => {
    startGame();
    document.getElementsByTagName('body')[0].classList.add('started');
    requestAnimationFrame(refresh);
}

const diveButton = document.getElementById('dive');

diveButton.addEventListener('mousedown', e => {
    player.handleDiveButtonPress();
}, false);
diveButton.addEventListener('mouseup', e => {
    player.hanldeDiveButtonRelease();
}, false);

diveButton.addEventListener('touchstart', e => {
    player.handleDiveButtonPress();
    diveButton.classList.add('active')
    e.preventDefault();
}, false);
diveButton.addEventListener('touchend', e => {
    player.hanldeDiveButtonRelease();
    diveButton.classList.remove('active')
    e.preventDefault();
}, false);
diveButton.addEventListener('touchcancel', e => {
    player.hanldeDiveButtonRelease();
    diveButton.classList.remove('active')
    e.preventDefault();
}, false);


const soundButton = document.getElementById('sound');
soundButton.addEventListener('click', e => {
    sounds.toggleMute();

    updateSoundButton();

    e.preventDefault();
}, false);