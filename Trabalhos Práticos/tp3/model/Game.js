import { Helpers } from '../helpers/Helpers.js';
import { MyKeyAnimation } from "../Animation/MyKeyAnimation.js";
import { MyAnimation } from "../Animation/MyAnimation.js";
import { MapTextureTrack } from "../MapTextureTrack.js";

var DEGREE_TO_RAD = Math.PI / 180;
var one_time = true

/**
 * Handles various Game aspects and functionalities.
 */
export class Game {

    // ======================================================
    // CONSTRUCTOR AND INITS
    // ======================================================

    constructor(scene, isFirstTrack) {
        this.scene = scene

        this.number_laps = 0;
        this.trackLength = 1000;

        this.isFirstDifficulty = true
        this.isFirstTrack = isFirstTrack

        this.goForward = "KeyW";
        this.goBackwards = "KeyS";
        this.goLeft = "KeyA";
        this.goRigth = "KeyD";

        this.obstacles = [];
        this.powerUps = [];
        this.routes = [];
        this.vehicle;
        this.start;

        this.state = "game";

        // -1 : StartMenu || 0 : Paused || 1 : Playing.
        this.gameStatus = -1
    }

    /**
     * Initializes car, obstacles and power-ups.
     */
    init() {

        this.initCar();
        this.initObstacles();
        this.initPowerUps();
        this.activateRoutePoints = this.routes[0].points;
        this.vehicle.anim = new MyAnimation(this, this.vehicle);
    }


    /**
     * Initializes car by setting its initial position. 
     */
    initCar() {
        var initialPosition = vec3.create();
        vec3.set(initialPosition, this.vehicle.initialPosition[0], 1.5, this.vehicle.initialPosition[2]);

        mat4.copy(this.scene.graph.components["Car"].transformMatrix, this.scene.graph.components["Car"].transformMatrixInitial)

        var initialPosition = vec3.create();
        vec3.set(initialPosition, this.vehicle.initialPosition[0], 1.5, this.vehicle.initialPosition[2]);
        mat4.copy(this.scene.graph.components["Car"].transformMatrix, this.scene.graph.components["Car"].transformMatrixInitial)
        mat4.translate(this.scene.graph.components["Car"].transformMatrix, this.scene.graph.components["Car"].transformMatrixInitial, initialPosition);
        mat4.rotate(this.scene.graph.components["Car"].transformMatrix, this.scene.graph.components["Car"].transformMatrix, 90 * DEGREE_TO_RAD, [0,1,0]);
    }

    /**
     * Initializes all obstacles by setting their initial position. 
     */
    initObstacles() {

        for(var i=0; i<this.obstacles.length; i++) {
            var tagName = "Obstacle" + (i+1);
            var initialPosition = vec3.create()
            vec3.set(initialPosition, this.obstacles[i].initialPosition[0], 0.5, this.obstacles[i].initialPosition[2]);
            mat4.copy(this.scene.graph.components[tagName].transformMatrix, this.scene.graph.components[tagName].transformMatrixInitial)
            mat4.translate(this.scene.graph.components[tagName].transformMatrix, this.scene.graph.components[tagName].transformMatrixInitial, initialPosition);
        }
    }

    /**
     * Initializes all power-ups by setting their initial position. 
     */
    initPowerUps() {
        for(var i=0; i<this.powerUps.length; i++) {
            var tagName = "PowerUp" + (i+1);  

            var initialPosition = vec3.create();
            vec3.set(initialPosition, this.powerUps[i].position[0], 0.5, this.powerUps[i].position[2]);
            mat4.copy(this.scene.graph.components[tagName].transformMatrix, this.scene.graph.components[tagName].transformMatrixInitial)
            mat4.translate(this.scene.graph.components[tagName].transformMatrix, this.scene.graph.components[tagName].transformMatrixInitial, initialPosition);
        }
    }


    // ======================================================
    // GAME STATUS
    // ======================================================

    /**
     * Sets Game Status.
     * Accepted Values: -1 : StartMenu || 0 : Paused || 1 : Playing.
     */
    setGameStatus(status) {
        if (status == -1 || status == 0 || status == 1) {
            this.gameStatus = status
            console.log("Game Status changed to " + this.gameStatus)
        } else {
            console.log("Invalid option @ changeGameStatus()")
        }
    }

    /**
     * Returns Game status.
     * Values: -1 : StartMenu || 0 : Paused || 1 : Playing.
     */
    getGameStatus() {        
        return this.gameStatus
    }

    /**
     * If the game is paused or stopped, changes it status to playing.
     * If the game is on playing status, changes status to pause.
     */
    changeGamePausedStatus() {
        console.log(this.gameStatus)
        if (this.gameStatus == 1) {
            this.setGameStatus(0)
        } else if (this.gameStatus == -1) {
            this.setGameStatus(1)
            this.startTimer()
        } else if (this.gameStatus == 0) {
            this.setGameStatus(1)
        }
    }

    /**
     * If the game is paused or on playing status, changes status to stopped. 
     */
    changeGameStartMenuStatus() {
        if (this.gameStatus == 0 || this.gameStatus == 1) {
            this.setGameStatus(-1)
        }
    }

    /**
     * Listens for various aspects of game playing or demo mode.
     */
    updateGame() {
        switch(this.state) {
            case "game":
                if (this.getGameStatus() == 1) {
                    this.getCommands();
                    this.checkColisions();
                    this.countingLaps();
                    this.checkIfVictory();
                }
                break;
            case "demo":
                if (this.getGameStatus() == 1) {
                    this.getCommands();
                    this.countingLaps();
                    this.checkIfVictory();
                }
                break;
        }
    }


    /**
     * Handles Losing Game.
     */
    gameOver() {
        this.scene.isVictory = -1
    }


    /**
     * Checks if game was won.
     */
    checkIfVictory() {
        if(this.number_laps == 3) {
            this.scene.isVictory = 1
        }
    }


    // ======================================================
    // GAME SETTINGS
    // ======================================================

    /**
     * Switches between the two available difficulties,
     * according to current state.
     */
    changeDifficulty() {
        this.isFirstDifficulty = !this.isFirstDifficulty
    }

    /**
     * Returns true if current difficulty is set to Easy.
     */
    getIsFirstDifficulty() {
        return this.isFirstDifficulty
    }

    /**
     * Switches between the two available maps,
     * according to current state.
     */
    changeTrack() {
        this.isFirstTrack = !this.isFirstTrack
    }

    /**
     * Returns true if current map is the first one.
     */
    getTrack() {
        return this.isFirstTrack
    }


    // ======================================================
    // TIMER
    // ======================================================

    /**
     * Starts time counter.
     */
    startTimer() {
        this.timer = setInterval(this.updateTimer.bind(this), 1000);
        this.timeLeft = 200;
        this.stringTimer;
    }

    /**
     * Updates timer value.
     */
    updateTimer() {
        if (this.getGameStatus() == 1) {
            this.timeLeft -= 1; 
            if(this.timeLeft <= 0) {
                this.gameOver();
            }
        }
    }

    /**
     * Returns current time on time counter.
     */
    getTimeCount() {
        this.secondsToTimer();
        return this.stringTimer;
    }

    /**
     * Converts timer unit to "hh:mm" format.
     */
    secondsToTimer() {
        var timeLeftAux = this.timeLeft;
        var minutesAux;
        var secondsAux;

        this.minutes = parseInt(timeLeftAux/60);
        minutesAux = Math.round((timeLeftAux/60 % 1) * 100) / 100;

        this.seconds = minutesAux * 60;

        this.seconds = parseInt(minutesAux * 60);

        this.stringTimer = "";
        
        if(this.minutes >= 10) {
            this.stringTimer = this.minutes;
            if(this.seconds >= 10) {
                this.stringTimer += ":" + this.seconds
            }else {
                this.stringTimer += ":0" + this.seconds
            }
        
        }else if(this.minutes < 10) {
            this.stringTimer = "0" + this.minutes;
            if(this.seconds >= 10) {
                this.stringTimer += ":" + this.seconds
            }else {
                this.stringTimer += ":0" + this.seconds
            }
        }
    }

    checkCrossFinishLine() {
        return Helpers.calculateDistance(this.vehicle.position, this.start.startingLinePosition) <= 8;
    }


    // ======================================================
    // COMMANDS
    // ======================================================

    /**
     * Checks if controlling keys are being pressed, according to
     * if it's game or demo.
     */
    getCommands() {
        switch(this.state) {
            case "game":
                this.commandsForGame();
                break;
            case "demo":
                this.commandsForDemo();
            default:
                break;
        }
    }
    
    /**
     * Checks if game controlling keys are being pressed.
     */
    commandsForGame() {      
        if (this.scene.interface.isKeyPressed(this.goForward)) {
            this.vehicle.setVelocity(0.05)
        }
        if (this.scene.interface.isKeyPressed(this.goBackwards)) {
            this.vehicle.setVelocity(-0.02)
        }
        if (this.scene.interface.isKeyPressed(this.goLeft)) {
            this.vehicle.setRotation(0.002)
            this.vehicle.setWheelsRotation(45)
        } else if (this.scene.interface.isKeyPressed(this.goRigth)) {
            this.vehicle.setRotation(-0.002)
            this.vehicle.setWheelsRotation(-45)
        }else {
            this.vehicle.setWheelsRotation(0)
        }
    }

    /**
     * Checks if demo controlling keys are being pressed.
     */
    commandsForDemo() {
        if (this.scene.interface.isKeyPressed("KeyY")) {
            this.resetToMenu()
        }
    }

    getNumberLapsFormatToDisplay() {
        return "LAPS:" + this.number_laps.toString() + "/3";
    }


    // ======================================================
    // LAPS
    // ======================================================

    /**
     * If car has crossed the fininish line and has travelled (almost) all track length.
     * increments number of laps.
     */
    countingLaps() {

        if(this.vehicle.travelDistance >= (this.trackLength - 50) && this.checkCrossFinishLine()) {
            this.number_laps += 1;
            this.vehicle.travelDistance = 0;
        }
    }


    /**
     * Returns true if the car has crossed finish light.
     */
    checkCrossFinishLine() {
        console.log(this.start.startingLinePosition)
        return Helpers.calculateDistance(this.vehicle.position, this.start.startingLinePosition) <= 8;
    }

    /**
     * Returns string with current number of laps.
     */
    getNumberLapsFormatToDisplay() {
        return "LAPS" + this.number_laps.toString() + "/3"
    }

    // ======================================================
    // COLISIONS
    // ======================================================

    /**
     * Checks if car has collided with an obstacle or with a power-up.
     */
    checkColisions() {
        //Check collision with Obstacles.
        for(var i=0; i<this.obstacles.length; i++) {
            if(Helpers.calculateDistance(this.vehicle.position, this.obstacles[i].position) <= 5) {
                this.obstacles[i].execute();
            }
        }
        
        //Check collision with PowerUps
        for(var i=0; i<this.powerUps.length; i++) {
            if(Helpers.calculateDistance(this.vehicle.position, this.powerUps[i].position) <= 5) {
                this.powerUps[i].execute();
            }
        }

        this.checkCarOutsideTrack();
    }
    
    checkCarOutsideTrack() {

        this.scene.activeMapTexture.getPixelFromCarPosition(this.vehicle.position);
    }

    onMapLoaded(map) {

        //wefbefiwebfieiwnfi
    }
}