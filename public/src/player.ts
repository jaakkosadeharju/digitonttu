import { Point } from "./point.js";
import { Present } from "./present.js";
import { Terrain } from "./terrain.js";

export class Player {
    lastCalcTime: Date;
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
    positionHistory: Point[];
    friction = 0.9;
    divePressed: boolean;
    onGround: boolean;
    jumpStartPos: number;
    jumps: number[];
    minY: number;
    maxSpeed: number;

    onScreenX = () => ((this.terrain.areaDimensions.width + this.position.x) % this.terrain.areaDimensions.width);
    longestJump = () => Math.round((this.jumps.sort((a, b) => b - a)[0]) || 0);
    highestPoint = () => Math.round((this.terrain.areaDimensions.height - this.minY) / 50);
    topSpeed = () => Math.round(this.maxSpeed / 50 * 3.6);

    constructor(canvas: HTMLCanvasElement, terrain: Terrain, startingPosition: Point = new Point(100, 100)) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.terrain = terrain;
        this.position = startingPosition;
        this.angle = 0;
        this.velocity = new Point(10, 10);
        this.positionHistory = [];
        this.atGround = false;
        this.diving = false;
        this.divePressed = false;
        this.onGround = false;
        this.jumps = [];
        this.minY = this.terrain.areaDimensions.height;
        this.maxSpeed = 0;

        this.addEventListeners();
    }

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

    calculateFrame = (dt: number, collectedPresents: Present[]) => {
        if (dt === 0) {
            return;
        }
        // Update history
        this.positionHistory.push(new Point(this.position.x, this.position.y));
        this.positionHistory.splice(0, Math.max(0, this.positionHistory.length - 1000));
        const lastPosition = this.positionHistory[this.positionHistory.length - 5] || this.position;
        const [terrainHeight, terrainAngle] = this.terrain.getHeightAt(this.onScreenX());

        if (this.diving && terrainHeight - 20 <= this.position.y) {
            this.velocity.y += (10 / (dt * 1000)) * Math.sin(terrainAngle);
            this.velocity.x += (10 / (dt * 1000)) * Math.cos(-terrainAngle);
        }

        // player touches ground
        if (terrainHeight - 1 <= this.position.y) {
            // Store jump length
            if (this.jumpStartPos && !this.onGround && this.position.x - this.jumpStartPos > 500) {
                this.jumps.push((this.position.x - this.jumpStartPos) / 50);
            }

            this.onGround = true;

            let speed = Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2));

            // if (this.diving) {
            //     speed += (100 / (dt * 1000));
            // }

            this.velocity.x += Math.sin(terrainAngle) * (dt * this.gravity); // m/s

            if (Math.abs(terrainAngle - this.angle) > (Math.PI / 4)) {
                speed = Math.min(speed, 100); // kill the speed if angle too steep
            }

            if ((terrainAngle < this.angle || this.angle == 0) && this.velocity.x >= 0) {
                // redirect the player when moving rightward
                this.velocity.y = speed * Math.sin(terrainAngle);
                this.velocity.x = speed * Math.cos(-terrainAngle);
            }
            else if (terrainAngle >= this.angle && this.velocity.x < 0) {
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
            if (this.onGround) {
                // store jump start
                this.jumpStartPos = this.position.x;
            }

            this.onGround = false;

            this.velocity.y += (dt * this.gravity * (this.diving ? this.divingWeight : 1)); // m/s

            if (terrainHeight - 5 <= this.position.y) {
                this.atGround = false;
            }
        }

        // Set new location
        this.position.x += (dt * this.velocity.x);
        this.position.y += (dt * this.velocity.y);

        // Store max height
        if (this.position.y < this.minY) {
            this.minY = this.position.y;
        }

        this.maxSpeed = Math.max(this.maxSpeed, Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2)));

        // Set the the angle of velocity as angle if not at ground
        if (terrainHeight - 10 > this.position.y && this.position.distanceTo(lastPosition) < this.terrain.areaDimensions.width / 2) {
            this.angle = Math.atan2(this.position.y - lastPosition.y, this.position.x - lastPosition.x);
        }
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
        // Angle vector
        // this.ctx.strokeStyle = "#fff";
        // this.ctx.lineWidth = 5;
        // this.ctx.beginPath();
        // const ski = this.ski();
        // this.ctx.moveTo(this.onScreenX(), this.position.y);
        // this.ctx.lineTo(this.onScreenX() + this.velocity.x/5, this.position.y + this.velocity.y/5);
        // this.ctx.stroke();


        //Heigt indicator
        if (this.position.y < - this.playerHeight) {
            this.ctx.strokeStyle = "#fff";
            this.ctx.lineWidth = 5;
            this.ctx.beginPath();
            this.ctx.moveTo(this.onScreenX(), 0);
            this.ctx.lineTo(this.onScreenX(), 40);
            this.ctx.stroke();

            this.ctx.textAlign = "left";
            this.ctx.font = "30px Josefin Sans";
            this.ctx.fillStyle = '#dddddd99';
            this.ctx.fillText(`${Math.round((this.terrain.areaDimensions.height - this.position.y) / 50)} m`, 30, 50);
        }

        let player: HTMLImageElement;
        if (this.velocity.x >= 0) {
            player = <HTMLImageElement>document.getElementById("player");
            this.drawImageCenter(player, this.onScreenX(), this.position.y, 150, 250, 1 / 5, this.angle);
        } else {
            player = <HTMLImageElement>document.getElementById("player-reversed");
            this.drawImageCenter(player, this.onScreenX(), this.position.y, 150, 250, 1 / 5, this.angle);
        }

        const maxVisiblePresents = 20;
        collectedPresents.slice(0, maxVisiblePresents).forEach((present, i) => {
            let presentSlot = this.positionHistory[this.positionHistory.length - (i + 1) * 10];
            present.position.x = (presentSlot.x % this.terrain.areaDimensions.width) - present.width / 2;
            present.position.y = presentSlot.y - present.height / 2;
        });
        collectedPresents.slice(maxVisiblePresents).forEach(p => p.visible = false);

        // // box
        // this.ctx.beginPath();
        // this.ctx.fillStyle = "white";
        // // this.ctx.fillRect(this.onScreenX() - this.skiWidth/2, this.position.y - this.skiWidth, this.skiWidth, this.skiWidth);
        // this.ctx.arc(this.onScreenX(), this.position.y - this.skiWidth, 10, 0, 2*Math.PI, false);
        // this.ctx.fill();
    }

    private addEventListeners() {
        // mouse events
        window.addEventListener('keydown', e => {
            if (e.code == 'Space') {
                e.preventDefault();
                document.getElementById('dive').classList.add('active');
                this.diving = true;
            }
        }, false);
        window.addEventListener('keyup', e => {
            if (e.code == 'Space') {
                e.preventDefault();
                document.getElementById('dive').classList.remove('active');
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