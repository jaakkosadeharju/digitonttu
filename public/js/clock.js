var Clock = (function () {
    function Clock(ctx, terrain) {
        this.ctx = ctx;
        this.terrain = terrain;
    }
    Clock.prototype.draw = function (time) {
        if (!this.terrain) {
            return;
        }
        this.ctx.font = "100px Josefin Sans";
        this.ctx.fillStyle = '#afa5';
        this.ctx.textAlign = "center";
        var seconds = Math.max(0, (time / 1000));
        var formatted = Math.round(seconds).toFixed();
        this.ctx.fillText((" " + formatted + " s").replace('.', ','), this.terrain.areaDimensions.width / 2, this.terrain.areaDimensions.height / 2);
    };
    return Clock;
}());
export { Clock };
//# sourceMappingURL=clock.js.map