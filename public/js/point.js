var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.distanceTo = function (point) {
        var dx = this.x - point.x;
        var dy = this.y - point.y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    return Point;
}());
export { Point };
//# sourceMappingURL=point.js.map