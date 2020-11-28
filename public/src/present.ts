import { Point } from "./point.js";
import { Terrain } from "./terrain.js";

export class Present {
    constructor(canvas: HTMLCanvasElement, terrain: Terrain) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.collected = false;
        this.position = new Point(
            Math.random() * (terrain.areaDimensions.width - this.width),
            Math.random() * (terrain.areaDimensions.height / 2 - this.height));
    }

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    position: Point;
    collected: boolean;
    width = 29 * (3/2);
    height = 28 * (3 / 2);

    public draw() {
        const ctx = this.ctx;

        // ctx.fillStyle = '#f00';
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        let present = <HTMLImageElement>document.getElementById("present");
        ctx.drawImage(present, this.position.x, this.position.y, this.width, this.height);
    }
}