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
        this.visible = true;
    }

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    position: Point;
    collected: boolean;
    width = 29 * (3 / 2);
    height = 28 * (3 / 2);
    visible: boolean;

    public draw() {
        if (!this.visible) {
            return false;
        }
        
        const ctx = this.ctx;

        // ctx.fillStyle = '#f00';
        // ctx.beginPath();
        // ctx.arc(
        //     this.position.x,
        //     this.position.y,
        //     this.width * (3 / 2),
        //     0,
        //     Math.PI * 2,
        //     false);
        // ctx.fill();

        let present = <HTMLImageElement>document.getElementById("present");
        ctx.drawImage(present,
            this.position.x - this.width / 2,
            this.position.y - this.height / 2,
            this.width,
            this.height);
    }
}