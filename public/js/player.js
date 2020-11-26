import { Point } from "./point.js";
var Player = (function () {
    function Player(ctx, startingPosition) {
        var _this = this;
        if (startingPosition === void 0) { startingPosition = new Point(100, 100); }
        this.playerScale = 15;
        this.skiWidth = 40;
        this.gravity = 9.81 * this.playerScale;
        this.ski = function () { return ({
            back: new Point(_this.position.x - (_this.skiWidth / 2) * Math.cos(_this.angle), _this.position.y - (_this.skiWidth / 2) * Math.sin(_this.angle)),
            front: new Point(_this.position.x + (_this.skiWidth / 2) * Math.cos(_this.angle), _this.position.y + (_this.skiWidth / 2) * Math.sin(_this.angle))
        }); };
        this.calculateFrame = function (dt) {
            _this.speed.y += (dt * _this.gravity);
            _this.position.x += (dt * _this.speed.x);
            _this.position.y += (dt * _this.speed.y);
        };
        this.position = startingPosition;
        this.ctx = ctx;
        this.t = new Date();
        this.angle = 0;
        this.speed = new Point(0, 0);
    }
    Player.prototype.draw = function () {
        this.ctx.strokeStyle = "#fff";
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        var ski = this.ski();
        this.ctx.moveTo(ski.back.x, ski.back.y);
        this.ctx.lineTo(ski.front.x, ski.front.y);
        this.ctx.stroke();
    };
    return Player;
}());
export { Player };
//# sourceMappingURL=player.js.map