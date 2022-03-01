/**
 * Base class for Animation.
 */
export class KeyFrame {
    constructor(speed, orientation, firstPosition, endPosition) {
        this.speed = speed;
        this.firstPosition = firstPosition;
        this.endPosition = endPosition;
        this.orientation = orientation;
    }
}