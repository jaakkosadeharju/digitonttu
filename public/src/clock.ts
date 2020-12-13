import { Point } from "./point.js";
import { Terrain } from "./terrain.js";

export class Clock {
    constructor(ctx: CanvasRenderingContext2D, terrain: Terrain) {
        this.ctx = ctx;
        this.terrain = terrain;
    }

    terrain: Terrain;

    ctx: CanvasRenderingContext2D;

    public draw(time: number) {
        if (!this.terrain) {
            return;
        }

        this.ctx.font = "100px Josefin Sans";
        this.ctx.fillStyle = '#afa5';
        this.ctx.textAlign = "center";
        const seconds = Math.max(0, (time / 1000));
        const formatted = Math.round(seconds).toFixed();
        this.ctx.fillText(` ${formatted} s`.replace('.', ','), this.terrain.areaDimensions.width / 2, this.terrain.areaDimensions.height / 2);
    }
}