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
        this.maxVerticalHeight = function () { return _this.areaDimensions.height * (14 / 20); };
        this.minVerticalHeight = function () { return _this.areaDimensions.height * (17 / 20); };
        this.startDrag = function (x, y) {
            var mouseCanvasPosition = new Point((x - _this.canvas.offsetLeft) / _this.canvas.offsetWidth * _this.canvas.width, (y - _this.canvas.offsetTop) / _this.canvas.offsetHeight * _this.canvas.height);
            var closestPoint = _this.points.reduce(function (closest, p) {
                return (p.distanceTo(mouseCanvasPosition) < closest.distanceTo(mouseCanvasPosition) ? p : closest);
            }, new Point(Infinity, Infinity));
            if (closestPoint.distanceTo(mouseCanvasPosition) < _this.handleRadius) {
                _this.draggingHandle = closestPoint;
            }
        };
        this.moveTerrainHandle = function (x, y) {
            var mouseCanvasPosition = new Point((x - _this.canvas.offsetLeft) / _this.canvas.offsetWidth * _this.canvas.width, (y - _this.canvas.offsetTop) / _this.canvas.offsetHeight * _this.canvas.height);
            if (_this.draggingHandle) {
                _this.draggingHandle.x = mouseCanvasPosition.x;
                _this.draggingHandle.y = Math.max(Math.min(mouseCanvasPosition.y, _this.minVerticalHeight()), _this.maxVerticalHeight());
            }
        };
        this.endDrag = function () {
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
            ctx.fillStyle = '#dddddd99';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(p.x, p.y, _this.handleRadius, 0, 2 * Math.PI);
            ctx.strokeStyle = '#aaaaaaff';
            ctx.lineWidth = _this.handleStrokeWidth;
            ctx.stroke();
        });
    };
    Terrain.prototype.getBezierXY = function (t, start, end) {
        return {
            x: Math.pow(1 - t, 3) * start.x + 3 * t * Math.pow(1 - t, 2) * end.cp1.x
                + 3 * t * t * (1 - t) * end.cp2.x + t * t * t * end.x,
            y: Math.pow(1 - t, 3) * start.y + 3 * t * Math.pow(1 - t, 2) * end.cp1.y
                + 3 * t * t * (1 - t) * end.cp2.y + t * t * t * end.y
        };
    };
    Terrain.prototype.getBezierAngle = function (t, start, end) {
        var dx = Math.pow(1 - t, 2) * (end.cp1.x - start.x) + 2 * t * (1 - t) * (end.cp2.x - end.cp1.x) + t * t * (end.x - end.cp2.x);
        var dy = Math.pow(1 - t, 2) * (end.cp1.y - start.y) + 2 * t * (1 - t) * (end.cp2.y - end.cp1.y) + t * t * (end.y - end.cp2.y);
        return -Math.atan2(dx, dy) + 0.5 * Math.PI;
    };
    Terrain.prototype.getHeightAt = function (x) {
        var points = this.pointsWithControlPoints().sort(function (a, b) { return a.x - b.x; });
        var leftPoint;
        var rightPoint;
        if (x < 0 || x > this.areaDimensions.width) {
            console.error("Cannot resolve terrain height at " + x);
        }
        for (var i = 0; i < points.length; i++) {
            if (points[i].x > x) {
                rightPoint = points[i];
                leftPoint = points[i - 1];
                break;
            }
        }
        var t = 1;
        for (var i = 1; i <= 100; ++i) {
            if (this.getBezierXY(t, leftPoint, rightPoint).x < x) {
                t += 0.5 / i;
            }
            else {
                t -= 0.5 / i;
            }
        }
        return [this.getBezierXY(t, leftPoint, rightPoint).y, this.getBezierAngle(t, leftPoint, rightPoint)];
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
        var _this = this;
        this.canvas.addEventListener('mousedown', function (e) {
            e.preventDefault();
            _this.startDrag(e.clientX, e.clientY);
        }, false);
        this.canvas.addEventListener('mousemove', function (e) {
            e.preventDefault();
            _this.moveTerrainHandle(e.clientX, e.clientY);
        }, false);
        this.canvas.addEventListener('mouseup', function (e) {
            e.preventDefault();
            _this.endDrag();
        }, false);
        this.canvas.addEventListener("touchstart", function (e) {
            e.preventDefault();
            _this.startDrag(e.touches[0].clientX, e.touches[0].clientY);
        }, false);
        this.canvas.addEventListener("touchend", function (e) {
            e.preventDefault();
            _this.endDrag();
        }, false);
        this.canvas.addEventListener("touchcancel", function (e) {
            e.preventDefault();
            _this.endDrag();
        }, false);
        this.canvas.addEventListener("touchmove", function (e) {
            e.preventDefault();
            _this.moveTerrainHandle(e.touches[0].clientX, e.touches[0].clientY);
        }, false);
    };
    return Terrain;
}());
export { Terrain };
//# sourceMappingURL=terrain.js.map