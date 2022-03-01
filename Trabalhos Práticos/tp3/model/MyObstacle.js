

/**
 * Handles behaviour when car colides with an obstacle.
 */
export class MyObstacle {

    constructor(game, cx, cz) {
        this.game = game;
        this.initialPosition = [cx, 0, cz]
        this.position = [cx, 0, cz];

        this.startTime;
        this.endTime;
        this.collided = false;
    }

    /**
     * Starts penalization on car when colliding with obstacle.
     */
    execute() {
        if (this.game.getIsFirstDifficulty()) { // Easy.
            if(!this.collided) {
                // Car loses all its velocity.

                this.game.vehicle.velocity = 0
                this.collided = true;
                setTimeout(this.reset.bind(this), 30000);
            }    
        } else { // Hard.
            // Car controllos are switched. 
            this.game.goForward = "KeyS";
            this.game.goBackwards = "KeyW";
            this.game.goLeft = "KeyD";
            this.game.goRigth = "KeyA";
    
            setTimeout(this.reset.bind(this), 7000);
        }
    }

    /**
     * Resets car behaviour to normal.
     */
    reset() {
        if (this.game.getIsFirstDifficulty()) {
            this.collided = false;
        } else { 
            this.game.goForward = "KeyW";
            this.game.goBackwards = "KeyS";
            this.game.goLeft = "KeyA";
            this.game.goRigth = "KeyD";
        }
    }
}