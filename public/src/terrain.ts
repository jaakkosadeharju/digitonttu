import { Point } from "./point.js";
import { Dimensions } from "./dimensions.js";

export class Terrain {
    constructor(canvas: HTMLCanvasElement, areaDimensions: Dimensions) {
        this.areaDimensions = areaDimensions;
        this.canvas = canvas;
        this.resetPoints();
        this.draggingHandles = {};

        this.addMouseEventListeners();
    }

    handleRadius = 20;
    handleStrokeWidth = 3;
    maxVerticalHeight = () => this.areaDimensions.height * (14 / 20);
    minVerticalHeight = () => this.areaDimensions.height * (17 / 20);
    canvas: HTMLCanvasElement;
    points: Point[];
    areaDimensions: Dimensions;
    draggingHandles: any;

    draw() {
        let ctx = this.canvas.getContext("2d");
        this.points = this.points.sort((a, b) => a.x - b.x);
        const pointsWithControlPoint = this.pointsWithControlPoints();

        let snow = ctx.createLinearGradient(0, this.minVerticalHeight(), 0, this.maxVerticalHeight());
        snow.addColorStop(0, '#555');
        snow.addColorStop(0.9, '#222');
        // ctx.fillStyle = '#222';
        ctx.fillStyle = snow;

        ctx.beginPath();
        ctx.moveTo(-this.areaDimensions.width, this.areaDimensions.height * 2);
        ctx.lineTo(
            pointsWithControlPoint[0].x,
            pointsWithControlPoint[0].y);

        // Draw the terrain
        pointsWithControlPoint
            .slice(1, pointsWithControlPoint.length)
            .forEach(p =>
                ctx.bezierCurveTo(p.cp1.x, p.cp1.y, p.cp2.x, p.cp2.y, p.x, p.y));

        ctx.lineTo(this.areaDimensions.width * 2, this.areaDimensions.height * 2);

        ctx.closePath();
        ctx.fill();

        // Draw the handles
        this.points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, this.handleRadius, 0, 2 * Math.PI);
            ctx.fillStyle = '#dddddd99';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(p.x, p.y, this.handleRadius, 0, 2 * Math.PI);
            ctx.strokeStyle = '#aaaaaaff';
            ctx.lineWidth = this.handleStrokeWidth;
            ctx.stroke();
        });
    }

    public getBezierXY(t: number, start: Point, end: Point) {
        return {
            x: Math.pow(1 - t, 3) * start.x + 3 * t * Math.pow(1 - t, 2) * end.cp1.x
                + 3 * t * t * (1 - t) * end.cp2.x + t * t * t * end.x,
            y: Math.pow(1 - t, 3) * start.y + 3 * t * Math.pow(1 - t, 2) * end.cp1.y
                + 3 * t * t * (1 - t) * end.cp2.y + t * t * t * end.y
        };
    }

    public getBezierAngle(t: number, start: Point, end: Point) {
        var dx = Math.pow(1 - t, 2) * (end.cp1.x - start.x) + 2 * t * (1 - t) * (end.cp2.x - end.cp1.x) + t * t * (end.x - end.cp2.x);
        var dy = Math.pow(1 - t, 2) * (end.cp1.y - start.y) + 2 * t * (1 - t) * (end.cp2.y - end.cp1.y) + t * t * (end.y - end.cp2.y);
        return -Math.atan2(dx, dy) + 0.5 * Math.PI;
    }

    public getHeightAt(x: number) {
        const points = this.pointsWithControlPoints().sort((a, b) => a.x - b.x);
        let leftPoint;
        let rightPoint;

        if (x < 0 || x > this.areaDimensions.width) {
            console.error(`Cannot resolve terrain height at ${x}`)
        }

        for (let i = 0; i < points.length; i++) {
            if (points[i].x > x) {
                rightPoint = points[i];
                leftPoint = points[i - 1];
                break;
            }
        }

        let t = 1;
        for (let i = 1; i <= 100 ; ++i) {
            if (this.getBezierXY(t, leftPoint, rightPoint).x < x) {
                t += 0.5/i;
            } else {
                t -= 0.5/i;
            }
        }

        return [this.getBezierXY(t, leftPoint, rightPoint).y, this.getBezierAngle(t, leftPoint, rightPoint)];
    }

    // Add point to front and back to make line continue from edge to edge
    private extrapolatedPoints() {
        const points = this.points;

        return [
            {
                x: points[points.length - 1].x - this.areaDimensions.width,
                y: points[points.length - 1].y,
            },
            ...points,
            {
                x: this.areaDimensions.width + points[0].x,
                y: points[0].y,
            },
        ];
    }

    // Add bezier control points to the array
    private pointsWithControlPoints(): Point[] {
        return this.extrapolatedPoints().reduce((arr, elem, i, pointsArr) => {
            const prevX = pointsArr[(pointsArr.length + i - 1) % pointsArr.length].x;

            return [
                ...arr,
                {
                    x: elem.x,
                    y: elem.y,
                    cp1: {
                        x: prevX + (elem.x - prevX) / 2,
                        y: pointsArr[(pointsArr.length + i - 1) % pointsArr.length].y
                    },
                    cp2: {
                        x: elem.x - (elem.x - prevX) / 2,
                        y: elem.y
                    }
                }
            ];
        }, []);
    }



    // terrain mouse event handlers
    startDrag = (x: number, y: number, identifier: number = 0) => {
        if (this.draggingHandles[identifier]) {
            return;
        }

        const mouseCanvasPosition = new Point(
            (x - this.canvas.offsetLeft) / this.canvas.offsetWidth * this.canvas.width,
            (y - this.canvas.offsetTop) / this.canvas.offsetHeight * this.canvas.height
        )

        const closestPoint = this.points.reduce((closest: Point, p: Point) => {
            return (p.distanceTo(mouseCanvasPosition) < closest.distanceTo(mouseCanvasPosition) ? p : closest);
        }, new Point(Infinity, Infinity));

        if (closestPoint.distanceTo(mouseCanvasPosition) < this.handleRadius * 2) {
            // console.log('START', identifier);
            
            this.draggingHandles[identifier] = closestPoint;
        }
    }
    moveTerrainHandle = (x: number, y: number, identifier: number = 0) => {
        if (this.draggingHandles[identifier]) {
            const mouseCanvasPosition = new Point(
                (x - this.canvas.offsetLeft) / this.canvas.offsetWidth * this.canvas.width,
                (y - this.canvas.offsetTop) / this.canvas.offsetHeight * this.canvas.height
            )

            // console.log('MOVE', identifier, x, y);
            
            this.draggingHandles[identifier].x = mouseCanvasPosition.x;
            this.draggingHandles[identifier].y = Math.max(Math.min(mouseCanvasPosition.y, this.minVerticalHeight()), this.maxVerticalHeight());
        }
    }
    endDrag = (identifier: number = 0) => {
        if (this.draggingHandles[identifier] !== undefined) {
            // console.log('END', identifier);
            
            this.draggingHandles[identifier] = undefined;
        }
    }

    resetPoints = () => {
        this.points = [
            new Point(this.areaDimensions.width - this.areaDimensions.width * (1 / 4), this.maxVerticalHeight()),
            new Point(this.areaDimensions.width - this.areaDimensions.width * (3 / 4), this.minVerticalHeight())
        ];
    };

    private addMouseEventListeners() {
        // mouse events
        this.canvas.addEventListener('mousedown', e => {
            e.preventDefault();
            this.startDrag(e.clientX, e.clientY)
        }, false);
        this.canvas.addEventListener('mousemove', e => {
            e.preventDefault();
            this.moveTerrainHandle(e.clientX, e.clientY)
        }, false);
        this.canvas.addEventListener('mouseup', e => {
            e.preventDefault();
            this.endDrag()
        }, false);
        this.canvas.addEventListener("touchstart", e => {
            e.preventDefault();

            for (let i = 0; i < e.touches.length; i++) {
                const touch = e.targetTouches.item(i);
                if (touch) {
                    this.startDrag(touch.clientX, touch.clientY, touch.identifier);
                }
            }
        }, false);
        this.canvas.addEventListener("touchend", e => {
            e.preventDefault();

            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches.item(i);
                this.endDrag(touch.identifier);
            }
        }, false);
        this.canvas.addEventListener("touchcancel", e => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches.item(i);
                this.endDrag(touch.identifier);
            }
        }, false);
        this.canvas.addEventListener("touchmove", e => {
            e.preventDefault();

            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches.item(i);
                this.moveTerrainHandle(touch.clientX, touch.clientY, touch.identifier);
            }
        }, false);
    }
}
