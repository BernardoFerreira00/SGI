import { CGFinterface, CGFapplication, dat } from './lib/CGF.js';

/**
* MyInterface class, creating a GUI interface.
*/
export class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  https://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        // add a group of controls (and open/expand by defult)

        this.initKeys();

        return true;
    }

    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    /**
     * Invoked when a key is pressed.
     */
    processKeyDown(event) {  
        
        // Pause game.
        if (event.code == "KeyP")
            this.scene.changeGamePausedStatus()
        else if (event.code == "Escape")
            this.scene.changeGameStartMenuStatus()

        this.activeKeys[event.code]=true;
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }

    /**
     * Adds lights to be controlled through interface.
     * @param lights - Available lights to add as options to interface.
     */
    setLightsOnInterface(lights) {
        var lightsFolder = this.gui.addFolder('Lights')
        lightsFolder.open()

        // Iterate over all lights.
        // And add them to interface.
        var i = 0
        for (var key in lights) {
            if (lights.hasOwnProperty(key)) {
                // Converted to Boolean() in order to appear as checkboxs.
                this.scene.lightsScene[key] = Boolean(lights[key][0]);
                lightsFolder.add(this.scene.lightsScene, key);
            }
            i++
        }
    }

    /**
     * Adds views to be controlled through interface
     * @param views - Available views to add as options to interface.
     */
    setViewsOnInterface(views) {
        var viewsFolder = this.gui.addFolder('Views')
        viewsFolder.open()
    
        // Iterate over all views.
        // And add them to array that stores available views for interface. 
        var options = {}
        for (var key in views) {
            if (views.hasOwnProperty(key)) { 
                options[key] = key
            }
        }

        viewsFolder.add(this.scene.currentView, 'active', options );
    }

}