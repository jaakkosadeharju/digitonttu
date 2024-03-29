import { Point } from "./point.js";
var Present = (function () {
    function Present(canvas, terrain) {
        this.width = 29 * (3 / 2);
        this.height = 28 * (3 / 2);
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.collected = false;
        this.position = new Point(Math.random() * (terrain.areaDimensions.width - this.width), Math.random() * (terrain.areaDimensions.height / 2 - this.height));
        this.visible = true;
    }
    Present.prototype.draw = function () {
        if (!this.visible) {
            return false;
        }
        var ctx = this.ctx;
        var present = document.getElementById("present");
        ctx.drawImage(present, this.position.x - this.width / 2, this.position.y - this.height / 2, this.width, this.height);
    };
    return Present;
}());
export { Present };
//# sourceMappingURL=present.js.map