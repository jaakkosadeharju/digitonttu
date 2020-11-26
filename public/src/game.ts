import { Dimensions } from "./dimensions.js";
import { Player } from "./player.js";
import { Point } from "./point.js";
import { Terrain } from "./terrain.js";

let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("game-area");
let ctx: CanvasRenderingContext2D = canvas.getContext("2d");

let terrain = new Terrain(canvas, new Dimensions(1920,1080));
let player = new Player(ctx, new Point(100, 100));
let time = new Date();

const drawSky = (ctx: CanvasRenderingContext2D) => {
    let bg = ctx.createLinearGradient(0, 0, 0, 1080);
    bg.addColorStop(0, '#304');
    bg.addColorStop(0.5, '#004');
    bg.addColorStop(1, '#000');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1920, 1080);
}

const draw = () => {
    drawSky(ctx);
    terrain.draw();

    // Calculate time
    let t0 = time;
    let t1 = new Date();
    const dt = (t1.getTime() - t0.getTime()) / 1000;

    player.calculateFrame(dt);
    player.draw();

    time = t1;
}

setInterval(() => {
    ctx.clearRect(0, 0, 1920, 1080);

    draw();
}, 20);