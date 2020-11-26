import { Point } from "./point.js";

export class Player {
    constructor(ctx: CanvasRenderingContext2D, startingPosition: Point = new Point(100, 100)) {
        this.position = startingPosition;
        this.ctx = ctx;
        this.t = new Date();
        this.angle = 0;
        this.speed = new Point(0,0);
    }

    playerScale = 15;
    ctx: CanvasRenderingContext2D;
    skiWidth = 40;
    position: Point;
    angle: number; // rad
    speed: Point;
    gravity = 9.81 * this.playerScale;
    t: Date;

    ski = () => ({
        back: new Point(
            this.position.x - (this.skiWidth/2) * Math.cos(this.angle),
            this.position.y - (this.skiWidth / 2) * Math.sin(this.angle)
        ),
        front: new Point(
            this.position.x + (this.skiWidth / 2) * Math.cos(this.angle),
            this.position.y + (this.skiWidth / 2) * Math.sin(this.angle)
        )
    });

    calculateFrame = (dt: number) => {
        // Update the speed
        this.speed.y += (dt * this.gravity); // m/s

        // Set new location
        this.position.x += (dt * this.speed.x);
        this.position.y += (dt * this.speed.y);
    }

    draw() {
        this.ctx.strokeStyle = "#fff";
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();

        const ski = this.ski();

        this.ctx.moveTo(ski.back.x, ski.back.y);
        this.ctx.lineTo(ski.front.x, ski.front.y);
        this.ctx.stroke();
    }
}