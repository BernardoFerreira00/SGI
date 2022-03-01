import { CGFcameraOrtho, CGFscene } from '../lib/CGF.js';
import { CGFaxis,CGFcamera } from '../lib/CGF.js';


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

        this.interface = myinterface;
        // Stores lights available on interface.
        this.lightsScene = {}
        // Stores current view on display.
        this.currentView = { active: "" }
        // Stores views available on interface.
        this.viewsScene = {}
        // Signals if we are in the process of change materials due to 'M' key being pressed.
        this.toChangeMaterial = false
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.enableTextures(true);

        this.initCameras()

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(100);
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(100, 100, 100), vec3.fromValues(0, 0, 0));
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
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        var i = 0;
        // Lights index.

        // Reads the lights from the scene graph.
        for (var key in this.graph.lights) {
            // Only eight lights allowed by WebGL.
            if (i >= 8)
                break;              

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

    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }


    /** Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.initLoadedCameras();

        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

        this.initLights();

        this.sceneInited = true;

        this.display()
    }

    /**
     * Displays the scene.
     */
    display() {
        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

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

        if (this.sceneInited) {
            // Draw axis
            this.setDefaultAppearance();

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();

            // Invokes method to change camera to one selected.
            this.changeCamera()
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}