export class Point {
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    x: number;
    y: number;
    cp1: Point;
    cp2: Point;

    // Euclidean distance between this and the argument point
    public distanceTo(point: Point) {
        const dx = this.x - point.x;
        const dy = this.y - point.y;

        // Calculate the distance
        return Math.sqrt(dx * dx + dy * dy);
    }
}