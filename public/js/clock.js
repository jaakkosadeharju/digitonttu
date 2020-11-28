var Clock = (function () {
    function Clock(ctx, position) {
        this.ctx = ctx;
        this.position = position;
    }
    Clock.prototype.draw = function (time) {
        this.ctx.font = "100px Arial";
        this.ctx.fillStyle = '#afa5';
        this.ctx.textAlign = "center";
        var seconds = Math.max(0, (time / 1000));
        var formatted = (Math.round(seconds * 10) / 10).toFixed(1);
        this.ctx.fillText((formatted + " s").replace('.', ','), this.position.x, this.position.y);
    };
    return Clock;
}());
export { Clock };
//# sourceMappingURL=clock.js.map