import { Point } from "./point.js";
var Player = (function () {
    function Player(canvas, terrain, startingPosition) {
        var _this = this;
        if (startingPosition === void 0) { startingPosition = new Point(100, 100); }
        this.gravityScale = 30;
        this.skiWidth = 30;
        this.playerHeight = 20;
        this.gravity = 9.81 * this.gravityScale;
        this.divingWeight = 3;
        this.friction = 0.9;
        this.ski = function () { return ({
            back: new Point(_this.position.x - (_this.skiWidth / 2) * Math.cos(_this.angle), _this.position.y - (_this.skiWidth / 2) * Math.sin(_this.angle)),
            front: new Point(_this.position.x + (_this.skiWidth / 2) * Math.cos(_this.angle), _this.position.y + (_this.skiWidth / 2) * Math.sin(_this.angle))
        }); };
        this.velocityAngle = function () {
            var pos1 = _this.positionHistory[_this.positionHistory.length - 1];
            var pos2 = _this.positionHistory[_this.positionHistory.length - 2];
            if (pos1 && pos2) {
                return Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
            }
            return 0;
        };
        this.calculateFrame = function (dt) {
            _this.positionHistory.push(new Point(_this.position.x, _this.position.y));
            _this.positionHistory.splice(0, Math.max(0, _this.positionHistory.length - 1000));
            var lastPosition = _this.positionHistory[_this.positionHistory.length - 1];
            var _a = _this.terrain.getHeightAt(_this.position.x), terrainHeight = _a[0], terrainAngle = _a[1];
            if (terrainHeight + 1 <= _this.position.y) {
                var speed = Math.sqrt(Math.pow(_this.velocity.x, 2) + Math.pow(_this.velocity.y, 2));
                if (_this.diving) {
                    speed += 40;
                }
                _this.velocity.x += Math.sin(terrainAngle) * (dt * _this.gravity);
                if (Math.abs(terrainAngle - _this.angle) > (Math.PI / 4)) {
                    speed = Math.min(speed, 100);
                }
                if (terrainAngle < _this.angle && _this.velocity.x >= 0) {
                    _this.velocity.y = speed * Math.sin(terrainAngle);
                    _this.velocity.x = speed * Math.cos(-terrainAngle);
                }
                else if (terrainAngle > _this.angle && _this.velocity.x < 0) {
                    _this.velocity.y = speed * Math.sin(terrainAngle);
                    _this.velocity.x = speed * Math.cos(-terrainAngle);
                }
                else {
                }
                _this.angle = terrainAngle;
                _this.position.y = Math.min(terrainHeight, _this.position.y);
                _this.atGround = true;
            }
            else {
                _this.velocity.y += (dt * _this.gravity * (_this.diving ? _this.divingWeight : 1));
                if (terrainHeight - 5 <= _this.position.y) {
                    _this.atGround = false;
                }
            }
            _this.position.x += (dt * _this.velocity.x);
            _this.position.y += (dt * _this.velocity.y);
            if (terrainHeight - 10 > _this.position.y) {
                _this.angle = Math.atan2(_this.position.y - lastPosition.y, _this.position.x - lastPosition.x);
            }
            _this.position.x = (_this.terrain.areaDimensions.width + _this.position.x) % _this.terrain.areaDimensions.width;
        };
        this.handleDiveButtonPress = function () {
            _this.divePressed = true;
            _this.diving = true;
            _this.divePressed = true;
        };
        this.hanldeDiveButtonRelease = function () {
            if (_this.divePressed) {
                _this.diving = false;
                _this.divePressed = false;
            }
        };
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
        this.addEventListeners();
    }
    Player.prototype.drawImage = function (image, x, y, scale, rotation) {
        this.ctx.setTransform(scale, 0, 0, scale, x, y);
        this.ctx.rotate(rotation);
        this.ctx.drawImage(image, -image.width / 2, -image.height / 2);
    };
    Player.prototype.drawImageCenter = function (image, x, y, cx, cy, scale, rotation) {
        this.ctx.setTransform(scale, 0, 0, scale, x, y);
        this.ctx.rotate(rotation);
        this.ctx.drawImage(image, -cx, -cy);
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    };
    Player.prototype.draw = function (collectedPresents) {
        var _this = this;
        if (this.position.y < -this.playerHeight) {
            this.ctx.strokeStyle = "#fff";
            this.ctx.lineWidth = 5;
            this.ctx.beginPath();
            this.ctx.moveTo(this.position.x, 0);
            this.ctx.lineTo(this.position.x, 40);
            this.ctx.stroke();
            this.ctx.textAlign = "left";
            this.ctx.font = "30px Arial";
            this.ctx.fillText(Math.round((this.terrain.areaDimensions.height - this.position.y) / 50) + " m", 30, 50);
        }
        var player;
        if (this.velocity.x >= 0) {
            player = document.getElementById("player");
            this.drawImageCenter(player, this.position.x, this.position.y, 150, 250, 1 / 5, this.angle);
        }
        else {
            player = document.getElementById("player-reversed");
            this.drawImageCenter(player, this.position.x, this.position.y, 150, 250, 1 / 5, this.angle);
        }
        collectedPresents.forEach(function (present, i) {
            var presentSlot = _this.positionHistory[_this.positionHistory.length - (i + 1) * 10];
            present.position.x = presentSlot.x - present.width / 2;
            present.position.y = presentSlot.y - present.height / 2;
        });
    };
    Player.prototype.addEventListeners = function () {
        var _this = this;
        window.addEventListener('keydown', function (e) {
            if (e.code == 'Space') {
                e.preventDefault();
                _this.diving = true;
            }
        }, false);
        window.addEventListener('keyup', function (e) {
            if (e.code == 'Space') {
                e.preventDefault();
                _this.diving = false;
            }
        }, false);
    };
    return Player;
}());
export { Player };
//# sourceMappingURL=player.js.map