import { CGFscene, CGFcamera, CGFaxis } from "../lib/CGF.js";
import { SimpleImage } from "./GetPixelColor.js";

/**
* MyScene
* @constructor
*/
export class MyScene extends CGFscene {
    constructor() {
        super();
    }

    init(application) {
        super.init(application);
        this.initCameras();
        this.initLights();

        //Background color
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        //Initialize scene objects
        this.axis = new CGFaxis(this);

        this.map = new SimpleImage(this.onMapLoaded, "test.png");
	}
    initLights() {
        this.setGlobalAmbientLight(0.3, 0.3, 0.3, 1.0);

        this.lights[0].setPosition(4.0, 3.0, 2.0, 1.0);
        this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
        this.lights[0].setSpecular(1.0, 1.0, 0.0, 1.0);
        this.lights[0].disable();
        this.lights[0].setVisible(true);
        this.lights[0].update();
    }

	onMapLoaded(map) {
		// just for demo purposes
		console.log(map.logPixelAt(1, 1) + " shoud be green"); // top-left corner
		console.log(map.logPixelAt(1, 46) + " shoud be green"); // bottom-left corner
		console.log(map.logPixelAt(1, 47) + " shoud be white"); // bottom-left corner
		console.log(map.logPixelAt(1, 197) + " shoud be white"); // bottom-left corner
		console.log(map.logPixelAt(1, 198) + " shoud be red"); // bottom-left corner

		console.log(map.logPixelAt(255, 1) + " shoud be blue"); // top-right corner
		console.log(map.logPixelAt(map.getWidth() - 4, map.getHeight() - 4) + " shoud be blue"); // bottom-right corner
	}

    initCameras() {
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(10, 10, 10), vec3.fromValues(0, 0, 0));
    }

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
        
        this.lights[0].update();

        // Draw axis
        if (this.displayAxis)
            this.axis.display();

        // This does not do anything else, it relies on SimpleImage.js onload method
        // to show pixel data in the console
        // In your app you should use the SimpleImage.getPixel method to get the values
        // Warning: if/while image not loaded, that method returns null
    }
}