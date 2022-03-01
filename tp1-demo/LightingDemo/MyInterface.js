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
        this.gui.add(this.scene, 'displayNormals').name("Display normals");

        // example of a dropdown that has numeric ID's associated, 
        // and an event handler to be called when the selection changes

        this.gui.add(this.scene, 'scaleFactor', 0.1, 10.0).name('Scale');

        this.gui.add(this.scene, 'selectedMaterial', this.scene.materialIDs).name('Selected Material');

           
        // similar but for light 1
        var f1 = this.gui.addFolder('Light');
        f1.add(this.scene.lights[0], 'enabled').name("Enabled");
        var sf1 = f1.addFolder('Light Position');
        sf1.add(this.scene.lights[0].position, '0', -5.0, 5.0).name("X Position");
        sf1.add(this.scene.lights[0].position, '1', -5.0, 5.0).name("Y Position");
        sf1.add(this.scene.lights[0].position, '2', -5.0, 5.0).name("Z Position");
        var sf2 = f1.addFolder('Light Attenuation');
        sf2.add(this.scene.lights[0], 'constant_attenuation', 0.00, 1.00).name("Const. Atten.");
        sf2.add(this.scene.lights[0], 'linear_attenuation', 0.0, 1.0).name("Linear Atten.");
        sf2.add(this.scene.lights[0], 'quadratic_attenuation', 0.0, 1.0).name("Quad. Atten.");
    
        // Anothe forlder for grouping the custom material's parameters
        var f2 = this.gui.addFolder('Custom Material');
        
        f2.addColor(this.scene.customMaterialValues,'Ambient').onChange(this.scene.updateCustomMaterial.bind(this.scene));
        f2.addColor(this.scene.customMaterialValues,'Diffuse').onChange(this.scene.updateCustomMaterial.bind(this.scene));
        f2.addColor(this.scene.customMaterialValues,'Specular').onChange(this.scene.updateCustomMaterial.bind(this.scene));
        f2.add(this.scene.customMaterialValues,'Shininess', 0, 100).onChange(this.scene.updateCustomMaterial.bind(this.scene));

        return true;
    }


}