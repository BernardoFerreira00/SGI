import {CGFinterface, dat} from '../lib/CGF.js';

/**
* MyInterface
* @constructor
*/
export class MyInterface extends CGFinterface {
    constructor() {
        super();
    }

    init(application) {
        // call CGFinterface init
        super.init(application);
       
        // init GUI. For more information on the methods, check:
        // https://github.com/dataarts/dat.gui/blob/master/API.md
        this.gui = new dat.GUI();

        this.gui.add(this.scene, 'displayAxis').name("Display axis");
        
        // Turn on and off lights menu.
        var f3 = this.gui.addFolder('Lights');
        var f4 = f3.addFolder('Light 1');
        f4.add(this.scene.lights[0], 'enabled').name("Center");
        var f5 = f3.addFolder('Light 2');
        f5.add(this.scene.lights[1], 'enabled').name("Lamp");
        var f6 = f3.addFolder('Light 3');
        f6.add(this.scene.lights[2], 'enabled').name("Top Corner");


        return true;
    }


}