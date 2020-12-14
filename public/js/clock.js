var Clock = (function () {
    function Clock(ctx, terrain) {
        var _this = this;
        this.extensionVisible = 5;
        this.extendTime = function (seconds) {
            _this.timeExtensions.push({
                seconds: seconds,
                time: new Date()
            });
        };
        this.ctx = ctx;
        this.terrain = terrain;
        this.timeExtensions = [];
    }
    Clock.prototype.draw = function (time) {
        var _this = this;
        if (!this.terrain) {
            return;
        }
        this.ctx.font = "100px Josefin Sans";
        this.ctx.fillStyle = '#afa5';
        this.ctx.textAlign = "center";
        var seconds = Math.max(0, (time / 1000));
        var formatted = Math.round(seconds).toFixed();
        this.ctx.fillText((" " + formatted + " s").replace('.', ','), this.terrain.areaDimensions.width / 2, this.terrain.areaDimensions.height / 2);
        this.timeExtensions = this.timeExtensions.filter(function (t) { return (new Date()).getTime() < (t.time.getTime() + _this.extensionVisible * 1000); });
        this.timeExtensions.forEach(function (e, i) {
            var timeLeft = ((e.time.getTime() + _this.extensionVisible * 1000) - (new Date()).getTime()) / 1000;
            _this.ctx.font = "40px Josefin Sans";
            _this.ctx.fillStyle = "rgba(180, 30, 30, " + timeLeft / _this.extensionVisible + ")";
            _this.ctx.strokeStyle = "rgba(70, 20, 20, " + timeLeft / _this.extensionVisible + ")";
            _this.ctx.textAlign = "center";
            var formatted = Math.round(e.seconds).toFixed();
            _this.ctx.fillText(("+ " + formatted + " s").replace('.', ','), _this.terrain.areaDimensions.width / 2, _this.terrain.areaDimensions.height / 2 + ((1 - timeLeft / _this.extensionVisible) * 100));
            _this.ctx.strokeText(("+ " + formatted + " s").replace('.', ','), _this.terrain.areaDimensions.width / 2, _this.terrain.areaDimensions.height / 2 + ((1 - timeLeft / _this.extensionVisible) * 100));
        });
    };
    return Clock;
}());
export { Clock };
//# sourceMappingURL=clock.js.map