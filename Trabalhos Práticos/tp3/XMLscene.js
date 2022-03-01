import { CGFcameraOrtho, CGFscene, CGFappearance, CGFtexture, CGFshader } from './lib/CGF.js';
import { CGFaxis,CGFcamera } from './lib/CGF.js';
import { MySVGReader } from './MySVGReader.js';
import {MyQuad} from './primitives/MyQuad.js'
import {Game} from './model/Game.js'
import {Helpers} from './helpers/Helpers.js'
import { MyInterface } from './MyInterface.js';
import { MapTextureTrack } from "../MapTextureTrack.js";
import { MyKeyAnimation } from "./Animation/MyKeyAnimation.js";

var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
export class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.count = 0;

        this.interface = myinterface;
        // Stores lights available on interface.
        this.lightsScene = {}
        // Stores current view on display.
        this.currentView = { active: "" }
        // Stores views available on interface.
        this.viewsScene = {}
        // Signals if we are in the process of change materials due to 'M' key being pressed.
        this.toChangeMaterial = false

        // Heads-Up Display
        this.texture = null;
		this.appearance = null;
		this.quad = null;
		this.textShader = null;

        this.cameraPosition

        this.game = new Game(this, true)

        // 0: Empty || -1: Game Over || 1: Victory
        this.isVictory = 0
        this.displayGameFinish = 0

    }


    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;
        this.svgInited = false;

        this.enableTextures(true);

        this.initCameras()

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(100);

        this.setPickEnabled(true);

        this.initHUD()
    }


    // ======================================================
    // CAMERAS
    // ======================================================


    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(5, 5, 5), vec3.fromValues(0, 0, 0));
    }

    /**
     * Iniatilizes loaded cameras from XML and stores them in order to display as options on interface.
     */
    initLoadedCameras() {
        this.viewsScene = {}

        var i = 0;
        for (var key in this.graph.views) {
            var view = this.graph.views[key]

            // If view is of the type perspective.
            if (view[0] == "perspective") {
                var cameraTmp = new CGFcamera(view[5], view[1], view[2], view[3], view[4])
                this.camera = cameraTmp
                this.viewsScene[key] = cameraTmp
                this.interface.setActiveCamera(cameraTmp)
            } else { // If view is of the type ortograph.
                //var cameraTmp = new CGFcameraOrtho(view[5], view[6], view[8], view[7], view[1], view[2], view[3], view[4], view[9])
                var cameraTmp = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
                this.camera = cameraTmp
                this.viewsScene[key] = cameraTmp
                this.interface.setActiveCamera(cameraTmp)
            }
            i++
        }

        // Adds available views options to interface.
        this.interface.setViewsOnInterface(this.graph.views)
    }

    /**
     * Changes camera being displayed to one selected on interface. 
     */
    changeCamera() {
        if (this.currentView.active != "") {
            this.camera = this.viewsScene[this.currentView.active]
            this.interface.setActiveCamera(this.camera)
        }
    }

    /**
     * Updates following car camera's location.
     */
    moveFollowingCarCamera() {
        if (this.currentView.active == "carView") { 
            var fromPosition = this.cameraPosition
            var toPosition = this.game.vehicle.position

            this.cameraPosition = toPosition

            fromPosition = [fromPosition[0], fromPosition[1]+5, fromPosition[2]]
            toPosition = [toPosition[0]+1, toPosition[1]+5, toPosition[2]]
    
            var cameraTmp = new CGFcamera(1, 0.1, 10000000, fromPosition, toPosition)
            var angle = this.game.vehicle.direction * Math.PI / 180
            cameraTmp.rotate([0,1,0], angle)

            this.camera = cameraTmp
            this.viewsScene["carView"] = cameraTmp
            this.interface.setActiveCamera(cameraTmp)
        }
    }


    // ======================================================
    // LIGHTS
    // ======================================================

    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        var i = 0;
        // Lights index.

        // Reads the lights from the scene graph.
        for (var key in this.graph.lights) {
            // Only eight lights allowed by WebGL.
            if (i >= 8)             

            if (this.graph.lights.hasOwnProperty(key)) {
                var light = this.graph.lights[key];

                this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
                this.lights[i].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
                this.lights[i].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
                this.lights[i].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);
                this.lights[i].setConstantAttenuation(light[6][0])
                this.lights[i].setLinearAttenuation(light[6][1])
                this.lights[i].setQuadraticAttenuation(light[6][2])

                if (light[1] == "spot") {
                    this.lights[i].setSpotCutOff(light[7]);
                    this.lights[i].setSpotExponent(light[8]);
                    // this.setTarget(light[9][0], light[9][1], light[9][2]) ??
                }

                this.lights[i].setVisible(true);
                if (light[0])
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();

                i++;
            }
        }

        // Adds available lightning options to interface.
        this.interface.setLightsOnInterface(this.graph.lights)
    }

    /**
     * Sets default light.
     */
    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);

        this.axis = new CGFaxis(this, this.graph.referenceLength);
        this.gl.clearColor(0.52, 0.80, 0.92, 1.0);
        this.setGlobalAmbientLight(0, 0, 0, 1.0);
    }

    // ======================================================
    // LOAD GRAPHS & SVG
    // ======================================================

    /** 
     * Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop.
     */
    onGraphLoaded() {
        
        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);
        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

        this.initLoadedCameras();

        this.initLights();

        this.sceneInited = true;

        this.mapTextureTrack1 = new MapTextureTrack(this.game.onMapLoaded, "../scenes/images/NewTrackMapTexture.png", this);
        this.mapTextureTrack2 = new MapTextureTrack(this.game.onMapLoaded, "../scenes/images/Track1_texture_map.png", this);

        this.activeMapTexture = this.mapTextureTrack1;

        if (this.svgInited) {
            this.onSVGLoaded()
        }

        this.display();
    } 

    /** 
     * Handler called when the svg file is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop.
     */
    onSVGLoaded() {
        this.svgInited = true;

        if (this.svgInited && this.sceneInited) {
            this.game.init();
            this.graph.displayStartMenu()
            this.cameraPosition = this.game.vehicle.getPosition()
            this.setDefaultAppearance();
        }
    }

    /**
     * Initializes game by parsing XML and SVG files and creating a new instance
     * of Game.
     */
    initializeGame() {
        this.displayGameFinish = this.isVictory
        this.isVictory = 0

        var trackTextureFilePath = "./scenes/images/new_track_texture.png" // default. 
        var svgFilePathName = "NewTrack.svg" // default 
        var isFirstTrack = this.game.getTrack()
        if (isFirstTrack) {
            this.graph.components["StartMenu_Button_Track"].texture[0] = "map1Button"
        } else {
            this.graph.components["StartMenu_Button_Track"].texture[0] = "map2Button"
            trackTextureFilePath = "./scenes/images/Track1_texture.png"
            svgFilePathName = "Track1.svg"
            this.activeMapTexture = this.mapTextureTrack2;
        }
        
        
        this.graph.textures["trackTexture"] = new CGFtexture(this, trackTextureFilePath)
        this.game = new Game(this, isFirstTrack)
        this.game.trackLength = 685;
        this.svgInited = false
        var svgParser = new MySVGReader(svgFilePathName, this);
    }

    // ======================================================
    // DISPLAY MAIN METHOD
    // ======================================================

    /**
     * Scene Main Displaying Method.
     */
    display() {
        this.logPicking();

		// this resets the picking buffer
		this.clearPickRegistration();

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();
        this.axis.display();

        // Iterates over loaded lights and set them active/no-active
        // according to their state.
        var i = 0;
        for (var key in this.lightsScene) {
            if (this.lightsScene.hasOwnProperty(key)) {
                if (this.lightsScene[key]) {
                    this.lights[i].setVisible(true);
                    this.lights[i].enable();
                }
                else {
                    this.lights[i].setVisible(false);
                    this.lights[i].disable();
                }
                this.lights[i].update();
                i++;
            }
        }

        // If the XML file has been parsed.
        if (this.sceneInited) {

            // Displays the scene (MySceneGraph method).
            this.graph.displayScene();

            // Invokes method to change camera to one selected.
            this.changeCamera()
        }

        this.popMatrix();

        // If the SVG file has been parsed.
        if (this.svgInited) {

            // Check for losing or victory.
            if (this.isVictory != 0) {
                this.initializeGame()
            }

            if (this.displayGameFinish != 0) {
                this.displayGameOverMessage(this.displayGameFinish)
            }

            // Updates car's following camera.
            this.moveFollowingCarCamera()

            // Displays car.
            this.graph.displayCar()

            // Updates various game's aspects.
            this.game.updateGame();

            // If game is paused or running
            if (this.game.getGameStatus() == 0 || this.game.getGameStatus() == 1) {
                // Updates Heads-Up display.
                this.displayHUD()
            }      
        }  
    }


    // ======================================================
    // PICKING
    // ======================================================

    /**
     * Returns object pressed on with cursor/mouse.
     */
    logPicking() {
		if (this.pickMode == false) {
			if (this.pickResults != null && this.pickResults.length > 0) {
				for (var i=0; i< this.pickResults.length; i++) {
					var obj = this.pickResults[i][0];
					if (obj)
					{
						var customId = this.pickResults[i][1];				
                        this.menuOptionSelected(customId)
					}
				}
				this.pickResults.splice(0,this.pickResults.length);
			}		
		}
	}

    // ======================================================
    // HEADS-UP DISPLAY
    // ======================================================

    /**
     * Initializes Head-Up Display's components.
     */
    initHUD() {
        // Heads-Up Display
        this.appearance = new CGFappearance(this);
        // font texture: 16 x 16 characters
        this.fontTexture = new CGFtexture(this, "scenes/images/oolite-font.trans.png");
        this.appearance.setTexture(this.fontTexture);
        // plane where texture character will be rendered
        this.quad = new MyQuad(this);
        // instatiate text shader (used to simplify access via row/column coordinates)
        // check the two files to see how it is done
        this.textShader=new CGFshader(this.gl, "shaders/font.vert", "shaders/font.frag");
        // set number of rows and columns in font texture
        this.textShader.setUniformsValues({'dims': [16, 16]});

        this.pause1Quad = new MyQuad(this)
        this.pause2Quad = new MyQuad(this)
        this.appearancePause = new CGFappearance(this);
        this.appearancePause.setTexture(this.texturePause);

        // Background for labels.
        this.backgroundQuad = new MyQuad(this)
        this.backgroundTimeQuad = new MyQuad(this)
        this.backgroundTexture = new CGFtexture(this, "scenes/images/hudTrack.jpg");
        this.backgroundAppearance = new CGFappearance(this); 
        this.backgroundAppearance.setTexture(this.backgroundTexture)   
    }

    /**
     * Display HUD components.
     */
    displayHUD() {
        // activate shader for rendering text characters
        this.setActiveShaderSimple(this.textShader);

        // Optional: disable depth test so that it is always wwain front (need to reenable in the end)
        this.gl.disable(this.gl.DEPTH_TEST);

        
        // If game is paused, displays Pause Button
        if (this.game.getGameStatus() == 0) {
            this.appearancePause.apply()
            this.pushMatrix()
            this.loadIdentity()
            this.translate(-25.5,17,-50)
            this.scale(1, 3, 1)
            this.pause1Quad.display()
            this.popMatrix()
            this.registerForPick(4, this.pause2Quad);
    
            this.pushMatrix()
            this.loadIdentity()
            this.translate(-27,17,-50)
            this.scale(1, 3, 1)
            this.pause2Quad.display()
            this.popMatrix()
            this.registerForPick(4, this.pause2Quad);
        }

        // Sets background for lap's number and car's speed labels.
        this.backgroundAppearance.apply()
        this.pushMatrix()
        this.loadIdentity()
        this.translate(33, -21, -50)
        this.scale(15, 5, 1)
        this.backgroundQuad.display()
        this.popMatrix()

        // Sets background for lap's number and car's speed labels.
        this.backgroundAppearance.apply()
        this.pushMatrix()
        this.loadIdentity()
        this.translate(0, 21, -50)
        this.scale(10, 2, 1)
        this.backgroundTimeQuad.display()
        this.popMatrix()

        // activate texture containing the font
        this.appearance.apply();

        // Displays time counter.
        this.pushMatrix();
        this.loadIdentity();
        this.displayString(this.game.getTimeCount(), [-2, 21, -50])
        this.popMatrix();

        // Displays car's speed.
        this.pushMatrix();
        this.loadIdentity();
        this.displayString(this.game.vehicle.getVelocityNiceFormat() + "KM/H", [27, -20, -50])
        this.popMatrix();

        // Displays number of laps.
        this.pushMatrix();
        this.loadIdentity();
        this.displayString(this.game.getNumberLapsFormatToDisplay(), [32, -22, -50])
        this.popMatrix();

        // re-enable depth test 
        this.gl.enable(this.gl.DEPTH_TEST);

        // reactivate default shader
        this.setActiveShaderSimple(this.defaultShader);
    }

    /**
     * Display message of victory or game over.
     */
    displayGameOverMessage(isVictory) {
        // activate shader for rendering text characters
        this.setActiveShaderSimple(this.textShader);

        // Optional: disable depth test so that it is always wwain front (need to reenable in the end)
        this.gl.disable(this.gl.DEPTH_TEST);

        // activate texture containing the font
        this.appearance.apply();

        this.pushMatrix();
        this.loadIdentity();
        if (isVictory == 1) {
            this.displayString("YOU WON THE GAME", [20, 10, -50])
        } else {
            this.displayString("GAME OVER", [27, 10, -50])
        }
        this.popMatrix();

        // re-enable depth test 
        this.gl.enable(this.gl.DEPTH_TEST);

        // reactivate default shader
        this.setActiveShaderSimple(this.defaultShader);
    }

    /**
     * Displays a string in a given position of the screen.
     */
    displayString(strToDisplay, initialCoord) {
        var chars = strToDisplay.split("");
        var charsCoords = []

        this.translate(initialCoord[0], initialCoord[1], initialCoord[2]);

        for (let i = 0; i < chars.length; i++) {
            var hey = Helpers.getCharCoordinates(chars[i])
            this.activeShader.setUniformsValues({'charCoords': hey})
            this.quad.display()
            this.translate(1, 0, 0);
        }

        return charsCoords
    }

    // ======================================================
    // START MENU DISPLAY
    // ======================================================

    /**
     * Calls appropriate method according to menu's option selected.
     */
    menuOptionSelected(index) {
        switch (index) {
            case 0:
              this.startGame()
              break;
            case 1:
                this.changeDifficulty()
                break;
            case 2:
                this.game.changeTrack()
                this.initializeGame()
                break;
            case 3:
                this.startDemo()
                break;
            case 4:
                this.game.changeGamePausedStatus()
                break;
            default:
                console.log("Invalid option!")
                break;
          }
    }

    /**
     * Changes game to User-Playing status.
     */
    startGame() {
        this.game.init();
        this.displayGameFinish = 0
        this.game.startTimer()
        this.game.changeGamePausedStatus()
        this.currentView.active = "carView"
        this.changeCamera()
    }

    /**
     * Changes game to Demo status.
     */
    startDemo() {
        this.game.changeGamePausedStatus()
        this.game.state = "demo"
        this.currentView.active = "aerialView"
        this.changeCamera()
        this.game.vehicle.anim = new MyKeyAnimation(this.game, this.game.vehicle);
    }

    /**
     * Triggered on MyInterface when "Escape" key is pressed.
     * Initializes game.
     */
    changeGameStartMenuStatus() {
        this.initializeGame()
    }

    /**
     * Triggered on MyInterface when "P" key is pressed.
     * Changes game pause/playing status.
     */
    changeGamePausedStatus() {
        this.game.changeGamePausedStatus()
    }

    /**
     * Invokes method to change game's dificulty.
     */
    changeDifficulty() {
        this.game.changeDifficulty()

        if (this.game.getIsFirstDifficulty()) {
            this.graph.components["StartMenu_Button_Difficulty"].texture[0] = "easyButton"
        } else {
            this.graph.components["StartMenu_Button_Difficulty"].texture[0] = "hardButton"
        }

    }

    changeTrack() {
        this.game.changeTrack()

        if (this.game.getTrack()) {
            this.graph.components["StartMenu_Button_Track"].texture[0] = "map1Button"
        } else {
            this.graph.components["StartMenu_Button_Track"].texture[0] = "map2Button"
        }
    }

   
}