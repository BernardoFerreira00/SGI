import { Helpers } from "../helpers/Helpers.js";
import { KeyFrame } from "./KeyFrame.js";

var cont = 0;
var DEGREE_TO_RAD = Math.PI / 180;

/**
 * Animation for Demo Mode.
 */
export class MyKeyAnimation {

    constructor(game, object) {

        this.game = game;
        this.object = object;

        this.routePoints = this.game.activateRoutePoints;
        this.time_interval = 10;
        this.keyFrames = [];

        this.keyFrame = 0;

        this.speed;
        this.angle;

        this.setupKeyFrames();
    }

    setupKeyFrames() {

        for(var i=0; i<this.routePoints.length-1; i++) {
            var orientation = Helpers.vectorNormalization([this.routePoints[i+1][2] - this.routePoints[i][2], 0, this.routePoints[i+1][0] - this.routePoints[i][0]]);
            var speed = Helpers.calculateDistance(this.routePoints[i+1], this.routePoints[i])/this.time_interval;
            let keyFrame = new KeyFrame(speed, orientation, this.routePoints[i], this.routePoints[i+1]);
            this.keyFrames.push(keyFrame);
        }

        this.speed = this.keyFrames[this.keyFrame].speed;
    }

    checkIfArriveToNextPosition() {

        if(Helpers.calculateDistance(this.object.position, this.keyFrames[this.keyFrame].endPosition) <= 1.4) {
            this.keyFrame += 1;
            return true;
        }
        return false;
    }

    animate() {

        if(this.checkIfArriveToNextPosition()) {
            var vector1 = this.keyFrames[this.keyFrame].orientation;
            var vector2 = this.keyFrames[this.keyFrame+1].orientation;
            this.object.rotation = -Helpers.calculateAngleBetweenVectors(vector1, vector2);
            this.object.velocity = this.keyFrames[this.keyFrame].speed;
        }else {
            this.object.velocity = this.speed;
            this.object.rotation = 0;
        }
    }

    animation(component) {

        this.animate();

        var translation = vec3.create();
        vec3.set(translation, 0, 0, this.object.velocity);

        this.object.direction = this.object.direction + this.object.rotation * 180 / Math.PI;

        this.object.calculatePosition();

        mat4.rotate(component.transformMatrix, component.transformMatrix, this.object.rotation, [0,1,0]);

        mat4.translate(component.transformMatrix, component.transformMatrix, translation);
    }
}