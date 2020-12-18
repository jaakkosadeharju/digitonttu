import { Terrain } from "./terrain";

export class Clock {
    constructor(ctx: CanvasRenderingContext2D, terrain: Terrain) {
        this.ctx = ctx;
        this.terrain = terrain;
        this.timeExtensions = [];
    }

    terrain: Terrain;
    timeExtensions: any[];
    extensionVisible = 5; //  seconds

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

        // Draw time extensions
        this.timeExtensions = this.timeExtensions.filter(t => (new Date()).getTime() < (t.time.getTime() + this.extensionVisible * 1000));
        this.timeExtensions.forEach((e, i) => {
            const timeLeft = ((e.time.getTime() + this.extensionVisible * 1000) - (new Date()).getTime()) / 1000;
            this.ctx.font = "40px Josefin Sans";
            if (e.seconds > 0) {
                this.ctx.fillStyle = `rgba(30, 220, 30, ${timeLeft / this.extensionVisible})`;
            } else {
                this.ctx.fillStyle = `rgba(220, 30, 30, ${timeLeft / this.extensionVisible})`;
            }
            this.ctx.textAlign = "center";
            const formatted = e.seconds.toFixed(1);
            this.ctx.fillText(`${e.seconds > 0 ? '+' : ''}${formatted} s`.replace('.', ','), this.terrain.areaDimensions.width / 2, this.terrain.areaDimensions.height / 2 + ((1 - timeLeft / this.extensionVisible) * 100));
        });
    }

    extendTime = (seconds: number) => {
        this.timeExtensions.push({
            seconds,
            time: new Date()
        })
    }
}