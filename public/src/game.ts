import { Clock } from "./clock.js";
import { Dimensions } from "./dimensions.js";
import { Player } from "./player.js";
import { Point } from "./point.js";
import { Present } from "./present.js";
import { Terrain } from "./terrain.js";

let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("game-area");
let ctx: CanvasRenderingContext2D = canvas.getContext("2d");


canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
let areaHeight = canvas.height;
let areaWidth = canvas.width;

const gameDuration = 30;
let terrain: Terrain;
let player: Player;
let presents: Present[];
let time: Date;
let startTime: Date;
let clock: Clock = new Clock(ctx, new Point(areaWidth / 2, areaHeight / 2));
let highscore: number = JSON.parse(localStorage.getItem('highscore')) || 0;

const setAreaDimensions = () => {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    terrain.areaDimensions.width = canvas.width;
    terrain.areaDimensions.height = canvas.height;

    document.getElementsByTagName('body')[0].style.height = window.innerHeight + 'px';
}

const drawSky = (ctx: CanvasRenderingContext2D) => {
    let bg = ctx.createLinearGradient(0, 0, 0, areaHeight);
    bg.addColorStop(0, '#474');
    bg.addColorStop(0.5, '#333');
    bg.addColorStop(1, '#daa');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, areaWidth, areaHeight);
}

const calculateFrame = () => {
    // Calculate time
    let t0 = time;
    let t1 = new Date();
    let dt = (t1.getTime() - t0.getTime()) / 1000;

    if (dt > 1000) {
        dt = 10;
    }

    player.calculateFrame(dt);

    time = t1;
}

const draw = () => {
    drawSky(ctx);
    terrain.draw();
    player.draw(presents.filter(p => p.collected));
    presents.forEach((p, i) => {
        p.draw()
    });

    // Score
    ctx.font = "50px Josefin Sans";
    ctx.textAlign = "right";
    ctx.fillText(`${presents.length - 1}`, areaWidth - 40, 60);

    // Clock
    if (startTime) {
        clock.draw(gameDuration * 1000 - (time.getTime() - startTime.getTime()));
    }
}

const initGame = () => {
    terrain = new Terrain(canvas, new Dimensions(areaWidth, areaHeight));
    player = new Player(canvas, terrain, new Point(50, 600));
    presents = [new Present(canvas, terrain)];
    time = new Date();
    document.getElementById('high-score').innerText = highscore.toString();
}

const startGame = () => {
    initGame();
    startTime = new Date();
    time = startTime;

    let interval = setInterval(() => {
        if (startTime.getTime() > (new Date()).getTime() - gameDuration * 1000) {
            calculateFrame();
        }
        else {
            clearInterval(interval);
        }
    }, 5);
}

const refresh = () => {
    ctx.clearRect(0, 0, areaWidth, areaHeight);

    const p = presents[presents.length - 1];
    const playerSize = player.skiWidth;

    if (new Point(player.position.x, player.position.y - playerSize).distanceTo(p.position) < p.width * (3/2)) {
        // Pick the present
        p.collected = true;
        presents.push(new Present(canvas, terrain));
    }

    draw();

    if (startTime.getTime() > (new Date()).getTime() - gameDuration * 1000) {
        requestAnimationFrame(refresh);
    }
    else {
        const score = presents.length - 1;
        document.getElementsByTagName('body')[0].classList.remove('started');
        document.getElementById('result').innerText = score.toString();

        if (score > highscore) {
            // set new high score
            highscore = score;
            document.getElementById('high-score').innerText = score.toString();
            localStorage.setItem('highscore', JSON.stringify(score));
        }
    }
};

initGame();
setAreaDimensions();

// Draw first frame to the background
setTimeout(() => {
    draw();
}, 100);

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