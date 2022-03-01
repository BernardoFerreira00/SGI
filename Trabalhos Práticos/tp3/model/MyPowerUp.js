/**
 * Handles behaviour when car colides with an power-up.
 */
export class MyPowerUp {

    constructor(game, cx, cz) {
        this.game = game;
        this.initialPosition = [cx, 0, cz]
        this.position = [cx, 0, cz];
        this.collided = false;
    }

    /**
     * Starts compensation on car when colliding with power-up.
     * Increases car's velocity.
     */
    execute() {
        if (this.game.getIsFirstDifficulty()) { // Easy.
            if(!this.collided) {
                this.collided = true;
                this.game.vehicle.velocity *= 1.5;
                setTimeout(this.reset.bind(this), 1000);
            }    
        } else {
            if(!this.collided) { // Hard.
                this.collided = true;
                this.game.vehicle.velocity *= 1.5;
                setTimeout(this.reset.bind(this), 1000);
            }    
        }
    }

    /**
     * Resets car behaviour to normal.
     */
    reset() {
        if (this.game.getIsFirstDifficulty()) { // Easy.
            if(!this.collided) {
                this.game.vehicle.velocity /= 2;
                this.collided = false;
            }    
        } else { // Hard.
            if(!this.collided) {
                this.game.vehicle.velocity /= 2;
                this.collided = false;
            }    
        }
    }
}