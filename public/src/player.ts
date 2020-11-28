import { Point } from "./point.js";
import { Present } from "./present.js";
import { Terrain } from "./terrain.js";

export class Player {
    constructor(canvas: HTMLCanvasElement, terrain: Terrain, startingPosition: Point = new Point(100, 100)) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.terrain = terrain;
        this.position = startingPosition;
        this.t = new Date();
        this.angle = 0;
        this.velocity = new Point(10, 10);
        this.positionHistory = [];
        this.atGround = false;
        this.diving = false;
        this.divePressed = false;

        this.addEventListeners();
    }
    atGround: boolean;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    terrain: Terrain;
    gravityScale = 30;
    skiWidth = 30;
    playerHeight = 20;
    position: Point;
    angle: number; // rad
    velocity: Point;
    gravity = 9.81 * this.gravityScale;
    diving: boolean;
    divingWeight = 3;
    t: Date;
    positionHistory: Point[];
    friction = 0.9;
    divePressed: boolean;

    ski = () => ({
        back: new Point(
            this.position.x - (this.skiWidth / 2) * Math.cos(this.angle),
            this.position.y - (this.skiWidth / 2) * Math.sin(this.angle)
        ),
        front: new Point(
            this.position.x + (this.skiWidth / 2) * Math.cos(this.angle),
            this.position.y + (this.skiWidth / 2) * Math.sin(this.angle)
        )
    });

    velocityAngle = () => {
        const pos1 = this.positionHistory[this.positionHistory.length - 1];
        const pos2 = this.positionHistory[this.positionHistory.length - 2];

        if (pos1 && pos2) {
            return Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
        }
        return 0;
    }

    calculateFrame = (dt: number) => {
        // Update history
        this.positionHistory.push(new Point(this.position.x, this.position.y));
        this.positionHistory.splice(0, Math.max(0, this.positionHistory.length - 1000));
        const lastPosition = this.positionHistory[this.positionHistory.length - 1];

        const [terrainHeight, terrainAngle] = this.terrain.getHeightAt(this.position.x);

        // player touches ground
        if (terrainHeight + 1 <= this.position.y) {
            let speed = Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2));

            if (this.diving) {
                speed += 40;
            }

            this.velocity.x += Math.sin(terrainAngle) * (dt * this.gravity); // m/s

            if (Math.abs(terrainAngle - this.angle) > (Math.PI / 4)) {
                speed = Math.min(speed, 100); // kill the speed if angle too steep
            }

            if (terrainAngle < this.angle && this.velocity.x >= 0) {
                // redirect the player when moving rightward
                this.velocity.y = speed * Math.sin(terrainAngle);
                this.velocity.x = speed * Math.cos(-terrainAngle);
            }
            else if (terrainAngle > this.angle && this.velocity.x < 0) {
                // redirect the player when moving leftward
                this.velocity.y = speed * Math.sin(terrainAngle);
                this.velocity.x = speed * Math.cos(-terrainAngle);
            }
            else {
                // console.log(this.angle, terrainAngle, Math.sin(this.angle), Math.sin(terrainAngle))
                // debugger;
            }


            this.angle = terrainAngle;
            this.position.y = Math.min(terrainHeight, this.position.y);
            this.atGround = true;
        } else {
            this.velocity.y += (dt * this.gravity * (this.diving ? this.divingWeight : 1)); // m/s

            if (terrainHeight - 5 <= this.position.y) {
                this.atGround = false;
            }
        }

        // Set new location
        this.position.x += (dt * this.velocity.x);
        this.position.y += (dt * this.velocity.y);

        // Set the the angle of velocity as angle if not at ground
        if (terrainHeight - 10 > this.position.y) {
            this.angle = Math.atan2(this.position.y - lastPosition.y, this.position.x - lastPosition.x);
        }

        // make player warp to the other side of the screen if going outside of the area
        this.position.x = (this.terrain.areaDimensions.width + this.position.x) % this.terrain.areaDimensions.width;
    }

    drawImage(image: HTMLImageElement, x: number, y: number, scale: number, rotation: number) {
        this.ctx.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
        this.ctx.rotate(rotation);
        this.ctx.drawImage(image, -image.width / 2, -image.height / 2);
    }

    drawImageCenter(image: HTMLImageElement, x: number, y: number, cx: number, cy: number, scale: number, rotation: number) {
        this.ctx.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
        this.ctx.rotate(rotation);
        this.ctx.drawImage(image, -cx, -cy);
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    draw(collectedPresents: Present[]) {
        // this.ctx.strokeStyle = "#fff";
        // this.ctx.lineWidth = 5;
        // this.ctx.beginPath();
        // const ski = this.ski();
        // this.ctx.moveTo(this.position.x, this.position.y);
        // this.ctx.lineTo(this.position.x + this.velocity.x, this.position.y + this.velocity.y);
        // this.ctx.stroke();

        //Heigt indicator
        if (this.position.y < - this.playerHeight) {
            this.ctx.strokeStyle = "#fff";
            this.ctx.lineWidth = 5;
            this.ctx.beginPath();
            this.ctx.moveTo(this.position.x, 0);
            this.ctx.lineTo(this.position.x, 40);
            this.ctx.stroke();

            this.ctx.textAlign = "left";
            this.ctx.font = "30px Arial";
            this.ctx.fillText(`${Math.round((this.terrain.areaDimensions.height - this.position.y) / 50)} m`, 30, 50);
        }

        let player: HTMLImageElement;
        if (this.velocity.x >= 0) {
            player = <HTMLImageElement>document.getElementById("player");
            this.drawImageCenter(player, this.position.x, this.position.y, 150, 250, 1 / 5, this.angle);
        } else {
            player = <HTMLImageElement>document.getElementById("player-reversed");
            this.drawImageCenter(player, this.position.x, this.position.y, 150, 250, 1 / 5, this.angle);
        }

        collectedPresents.forEach((present, i) => {
            let presentSlot = this.positionHistory[this.positionHistory.length - (i + 1) * 4];
            present.position.x = presentSlot.x - present.width / 2;
            present.position.y = presentSlot.y - present.height / 2;
        });
    }

    private addEventListeners() {
        // mouse events
        window.addEventListener('keydown', e => {
            if (e.code == 'Space') {
                e.preventDefault();
                this.diving = true;
            }
        }, false);
        window.addEventListener('keyup', e => {
            if (e.code == 'Space') {
                e.preventDefault();
                this.diving = false;
            }
        }, false);
    }


    public handleDiveButtonPress = () => {
        this.divePressed = true;
        this.diving = true;
        this.divePressed = true;
    };

    public hanldeDiveButtonRelease = () => {
        if (this.divePressed) {
            this.diving = false;
            this.divePressed = false;
        }
    };
}