import { CGFscene } from "../lib/CGF.js";
import { MapTextureTrack } from "../MapTextureTrack.js";
import {Helpers} from '../helpers/Helpers.js';

var DEGREE_TO_RAD = Math.PI / 180;

/**
 * Handles various aspects and behaviours of Vehicle entity.
 */
export class MyVehicle {

    constructor(position, scene) {

        this.anim;

        this.scene = scene;

        this.position = position;
        this.lastPosition = this.position
        this.initialPosition = this.position;
        this.direction = 0;

        this.velocity = 0

        this.timeChanged = 1
        this.timeChangedRotation = 1
        this.rotation = 0

        this.isRotatingLeft = false
        this.isRotatingRight = false

        this.lastRotatingLeft = false
        this.lastRotatingRight = false

        this.travelDistance = 0;
    }

    // ================================
    // Velocity
    // ================================

    /**
     * Increments car's velocity.
     */
    setVelocity(velocity) {
        this.timeChanged = 1

        var wDrag = -0.4 * velocity * this.velocity
        var rDrag = -0.4 * velocity
        var fLong = wDrag + rDrag

        if (this.velocity + fLong + velocity < -0.3) {
            this.velocity = this.velocity.toFixed(5)
        } else {
            this.velocity = this.velocity + fLong + velocity
            this.velocity = +this.velocity.toFixed(5)
        }
    }


    /**
     * Handles car's velocity behaviour.
     * Returns car's current velocity but also applies some changes to it (decreasing it).
     * Should not be used when we only need the velocity value.
     */
    getVelocity() {
        if (this.timeChanged - 0.01 < 0) {
            this.timeChanged = 0
            this.velocity = 0
        } 
        else {
            // Decreases velocity. 
            this.timeChanged = +this.timeChanged - 0.001
            this.velocity = this.velocity * this.timeChanged
        }

        this.velocity = +this.velocity.toFixed(5)

        if (this.velocity == -0.01) {
            this.velocity = 0
        }

        this.calculatePosition();

        return this.velocity.toFixed(5)
    }

    calculatePosition() {
        // Computes car's velocity in x and z axis.
        var vx = this.velocity * Math.cos(this.direction * DEGREE_TO_RAD);
        var vz = -this.velocity * Math.sin(this.direction * DEGREE_TO_RAD);
        this.position[0] += vx;
        this.position[2] += vz;

        // Stores current position.
        this.lastPosition = this.position
        // Computes car travel distance.
        this.travelDistance += Math.abs(this.velocity);

    }
    

    /*
    * This used to display vehicle's velocity on screen.
    * It converts a float number to value km/h.
    */
    getVelocityNiceFormat() {
        var velocityConverted = Math.round(this.velocity * 100)
        return (velocityConverted * 2).toString()
    }


    // ================================
    // Vehicle General Rotation
    // ================================

    /**
     * Increments vehicle's rotation.
     */
    setRotation(rotation) {
        this.timeChangedRotation = 1
        this.rotation = this.rotation + rotation;
    }

    /**
     * Handles car's rotation behaviour.
     * Returns car's current rotation but also applies some changes to it (decreasing it).
     * Should not be used when we only need the rotation value.
     */
    getRotation() {
        if (this.timeChangedRotation - 0.01 < 0) {
            this.timeChangedRotation = 0
            this.rotation = 0
        } else {
            // Decreases vehicle's rotation.
            this.timeChangedRotation = +this.timeChangedRotation - 0.01
            this.rotation = this.rotation * this.timeChangedRotation;
        }
        
        // Computes new direction.
        this.direction = this.direction + this.rotation * 180 / Math.PI;
        
        return this.rotation
    }


    // ================================
    // Wheels Rotation.
    // ================================

    /**
     * Sets fixed vehicle wheels's rotation. 
     * Wheels should rotate to right/left according to
     * rotation applied. 
     */
    setWheelsRotation(rotation) {
        if (rotation == 45) {
            this.isRotatingRight = true
            this.isRotatingLeft = false
        } else if (rotation == 0) {
            this.isRotatingRight = false
            this.isRotatingLeft = false
        } else {
            this.isRotatingLeft = true
            this.isRotatingRight = false
        }
    }

    /**
     * Returns wheels rotation.
     */
    getWheelsRotation() {
        var wRotation = 0

        if (this.lastRotatingLeft) {
            if (this.isRotatingRight) {
                wRotation = 90
            } else if (this.isRotatingLeft) {
                wRotation = 0
            } else {
                wRotation = 45
            }
        } else if (this.lastRotatingRight) {
            if (this.isRotatingRight) {
                wRotation = 0
            } else if (this.isRotatingLeft) {
                wRotation = -90
            } else {
                wRotation = -45
            }
        } else {
            if (this.isRotatingRight) {
                wRotation = 45
            } else if (this.isRotatingLeft) {
                wRotation = -45
            } else {
                wRotation = 0
            }
        }

        this.lastRotatingLeft = this.isRotatingLeft 
        this.lastRotatingRight = this.isRotatingRight

        return wRotation/180
    }

    // ================================
    // Vehicle's position.
    // ================================

    /**
     * Returns vehicle's rotation.
     */
    getPosition() {
        return this.position;
    }
}

