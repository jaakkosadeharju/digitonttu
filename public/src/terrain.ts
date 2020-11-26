import { Point } from "./point.js";
import { Dimensions } from "./dimensions.js";

export class Terrain {
    constructor(canvas: HTMLCanvasElement, areaDimensions: Dimensions) {
        this.areaDimensions = areaDimensions;
        this.canvas = canvas;
 
        this.points = [
            new Point(areaDimensions.width - areaDimensions.width * (1 / 4), this.maxVerticalHeight()),
            new Point(areaDimensions.width - areaDimensions.width * (3 / 4), this.minVerticalHeight())
        ];

        this.addMouseEventListeners();
    }

    handleRadius = 20;
    handleStrokeWidth = 3;
    maxVerticalHeight = () => this.areaDimensions.height / 2;
    minVerticalHeight = () => this.areaDimensions.height * (19/20);
    canvas: HTMLCanvasElement;
    points: Point[];
    areaDimensions: Dimensions;
    draggingHandle: Point;

    draw() {
        let ctx = this.canvas.getContext("2d");
        this.points = this.points.sort((a,b) => a.x - b.x);
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
            ctx.fillStyle = '#dddddd';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(p.x, p.y, this.handleRadius, 0, 2 * Math.PI);
            ctx.strokeStyle = '#aaaaaa';
            ctx.lineWidth = this.handleStrokeWidth;
            ctx.stroke();
        });
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
    private pointsWithControlPoints() {
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
    startDrag = (e: MouseEvent) => {
        const mouseCanvasPosition = new Point(
            (e.clientX - this.canvas.offsetLeft) / this.canvas.offsetWidth * this.canvas.width,
            (e.clientY - this.canvas.offsetTop) / this.canvas.offsetHeight * this.canvas.height
        )

        const closestPoint = this.points.reduce((closest: Point, p: Point) => {
            return (p.distanceTo(mouseCanvasPosition) < closest.distanceTo(mouseCanvasPosition) ? p : closest);
        }, new Point(Infinity, Infinity));

        if (closestPoint.distanceTo(mouseCanvasPosition) < this.handleRadius) {
            this.draggingHandle = closestPoint;
        }
    }
    moveTerrainHandle = (e: MouseEvent) => {
        const mouseCanvasPosition = new Point(
            (e.clientX - this.canvas.offsetLeft) / this.canvas.offsetWidth * this.canvas.width,
            (e.clientY - this.canvas.offsetTop) / this.canvas.offsetHeight * this.canvas.height
        )

        if (this.draggingHandle) {
            this.draggingHandle.x = mouseCanvasPosition.x;
            this.draggingHandle.y = Math.max(Math.min(mouseCanvasPosition.y, this.minVerticalHeight()), this.maxVerticalHeight());
        }
    }
    endDrag = (e: MouseEvent) => {
        if (this.draggingHandle) {
            this.draggingHandle = null;
        }
    }

    private addMouseEventListeners() {
        // mouse events
        this.canvas.onmousedown = this.startDrag;
        this.canvas.onmousemove = this.moveTerrainHandle;
        this.canvas.onmouseup = this.endDrag;
    }
}
