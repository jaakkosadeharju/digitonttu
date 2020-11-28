import { Point } from "./point.js";

export class Clock {
    constructor(ctx: CanvasRenderingContext2D, position: Point) {
        this.ctx = ctx;
        this.position = position;
    }

    ctx: CanvasRenderingContext2D;
    position: Point;

    public draw(time: number) {
        this.ctx.font = "100px Arial";
        this.ctx.fillStyle = '#afa5';
        this.ctx.textAlign = "center";
        const seconds = Math.max(0, (time / 1000));
        const formatted = Math.round(seconds).toFixed();
        this.ctx.fillText(`${formatted} s`.replace('.', ','), this.position.x, this.position.y);
    }
}