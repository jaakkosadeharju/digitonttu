var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import { Point } from "./point.js";
var Terrain = (function () {
    function Terrain(canvas, areaDimensions) {
        var _this = this;
        this.handleRadius = 20;
        this.handleStrokeWidth = 3;
        this.maxVerticalHeight = function () { return _this.areaDimensions.height / 2; };
        this.minVerticalHeight = function () { return _this.areaDimensions.height * (19 / 20); };
        this.startDrag = function (e) {
            var mouseCanvasPosition = new Point((e.clientX - _this.canvas.offsetLeft) / _this.canvas.offsetWidth * _this.canvas.width, (e.clientY - _this.canvas.offsetTop) / _this.canvas.offsetHeight * _this.canvas.height);
            var closestPoint = _this.points.reduce(function (closest, p) {
                return (p.distanceTo(mouseCanvasPosition) < closest.distanceTo(mouseCanvasPosition) ? p : closest);
            }, new Point(Infinity, Infinity));
            if (closestPoint.distanceTo(mouseCanvasPosition) < _this.handleRadius) {
                _this.draggingHandle = closestPoint;
            }
        };
        this.moveTerrainHandle = function (e) {
            var mouseCanvasPosition = new Point((e.clientX - _this.canvas.offsetLeft) / _this.canvas.offsetWidth * _this.canvas.width, (e.clientY - _this.canvas.offsetTop) / _this.canvas.offsetHeight * _this.canvas.height);
            if (_this.draggingHandle) {
                _this.draggingHandle.x = mouseCanvasPosition.x;
                _this.draggingHandle.y = Math.max(Math.min(mouseCanvasPosition.y, _this.minVerticalHeight()), _this.maxVerticalHeight());
            }
        };
        this.endDrag = function (e) {
            if (_this.draggingHandle) {
                _this.draggingHandle = null;
            }
        };
        this.areaDimensions = areaDimensions;
        this.canvas = canvas;
        this.points = [
            new Point(areaDimensions.width - areaDimensions.width * (1 / 4), this.maxVerticalHeight()),
            new Point(areaDimensions.width - areaDimensions.width * (3 / 4), this.minVerticalHeight())
        ];
        this.addMouseEventListeners();
    }
    Terrain.prototype.draw = function () {
        var _this = this;
        var ctx = this.canvas.getContext("2d");
        this.points = this.points.sort(function (a, b) { return a.x - b.x; });
        var pointsWithControlPoint = this.pointsWithControlPoints();
        var snow = ctx.createLinearGradient(0, this.minVerticalHeight(), 0, this.maxVerticalHeight());
        snow.addColorStop(0, '#555');
        snow.addColorStop(0.9, '#222');
        ctx.fillStyle = snow;
        ctx.beginPath();
        ctx.moveTo(-this.areaDimensions.width, this.areaDimensions.height * 2);
        ctx.lineTo(pointsWithControlPoint[0].x, pointsWithControlPoint[0].y);
        pointsWithControlPoint
            .slice(1, pointsWithControlPoint.length)
            .forEach(function (p) {
            return ctx.bezierCurveTo(p.cp1.x, p.cp1.y, p.cp2.x, p.cp2.y, p.x, p.y);
        });
        ctx.lineTo(this.areaDimensions.width * 2, this.areaDimensions.height * 2);
        ctx.closePath();
        ctx.fill();
        this.points.forEach(function (p) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, _this.handleRadius, 0, 2 * Math.PI);
            ctx.fillStyle = '#dddddd';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(p.x, p.y, _this.handleRadius, 0, 2 * Math.PI);
            ctx.strokeStyle = '#aaaaaa';
            ctx.lineWidth = _this.handleStrokeWidth;
            ctx.stroke();
        });
    };
    Terrain.prototype.extrapolatedPoints = function () {
        var points = this.points;
        return __spreadArrays([
            {
                x: points[points.length - 1].x - this.areaDimensions.width,
                y: points[points.length - 1].y
            }
        ], points, [
            {
                x: this.areaDimensions.width + points[0].x,
                y: points[0].y
            },
        ]);
    };
    Terrain.prototype.pointsWithControlPoints = function () {
        return this.extrapolatedPoints().reduce(function (arr, elem, i, pointsArr) {
            var prevX = pointsArr[(pointsArr.length + i - 1) % pointsArr.length].x;
            return __spreadArrays(arr, [
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
            ]);
        }, []);
    };
    Terrain.prototype.addMouseEventListeners = function () {
        this.canvas.onmousedown = this.startDrag;
        this.canvas.onmousemove = this.moveTerrainHandle;
        this.canvas.onmouseup = this.endDrag;
    };
    return Terrain;
}());
export { Terrain };
//# sourceMappingURL=terrain.js.map