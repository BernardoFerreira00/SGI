import { CGFscene, CGFcamera, CGFaxis, CGFappearance } from "../lib/CGF.js";
import { MyChair } from "./MyChair.js";
import { MyCube } from "./MyCube.js";
import { MyFloor } from "./MyFloor.js";
import { MyLamp } from "./MyLamp.js";
import { MyPiramid4 } from "./MyPyramid4.js";
import { MyQuad } from "./MyQuad.js";
import { MyTable } from "./MyTable.js";
import { MyWalls } from "./MyWalls.js";

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
        this.initMaterials();
        this.enableTextures(true);

        //Background color
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        //Initialize scene objects
        this.axis = new CGFaxis(this);
        this.plane = new MyQuad(this);
        this.cube = new MyCube(this);
        this.table1 = new MyTable(this, Array(5, 3, 0.3), Array(0.3, 3.5, 0.3));
        this.table2 = new MyTable(this, Array(5, 3, 0.3), Array(0.3, 3.5, 0.3));
        this.table3 = new MyTable(this, Array(5, 3, 0.3), Array(0.3, 3.5, 0.3));
        this.table4 = new MyTable(this, Array(5, 3, 0.3), Array(0.3, 3.5, 0.3));
        this.floor = new MyFloor(this, Array(20, 20, 1));
        this.walls = new MyWalls(this, Array(20, 10, 1));

        this.chair = new MyChair(this);
        this.lamp = new MyLamp(this);

        this.piramid = new MyPiramid4(this);
        
        //Variables connected to MyInterface
        this.displayAxis = true;
        this.displayNormals = true;
        this.light1 = true;

        this.updateNormalViz();
    }

    initLights() {
        // Ambient light.
        this.setGlobalAmbientLight(0.2, 0.2, 0.2, 1.0);

        // Lamp from the center.
        this.lights[0].setPosition(2.0, 5.0, -1.0, 1.0);
        this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
        this.lights[0].setSpecular(1.0, 1.0, 1.0, 1.0);
        this.lights[0].enable();
        this.lights[0].setVisible(true);
        this.lights[0].update();

        // Light on lamp.
        this.lights[1].setPosition(6, 5, -1.5, 1);
        this.lights[1].setDiffuse(1.0, 1.0, 1.0, 1.0);
        this.lights[0].setSpecular(1.0, 1.0, 1.0, 1.0);
        this.lights[1].enable();
        this.lights[1].setVisible(true);
        this.lights[1].update();

        // Light on top corner of wall.
        this.lights[2].setPosition(9.5, 9.5, 9.5, 1.0);
        this.lights[2].setDiffuse(0.5, 0.5, 0.5, 1.0);
        this.lights[2].setSpecular(1, 1, 1, 1.0);
        this.lights[2].enable();
        this.lights[2].setVisible(true);
        this.lights[2].update();
    }

    initCameras() {
        this.camera = new CGFcamera(0.6, 0.1, 500, vec3.fromValues(20, 20, 20), vec3.fromValues(0, 0, 0));
    }

    updateCustomMaterial() {
        this.customMaterial.setAmbient(...this.hexToRgbA(this.customMaterialValues['Ambient']));
        this.customMaterial.setDiffuse(...this.hexToRgbA(this.customMaterialValues['Ambient']));
        this.customMaterial.setSpecular(...this.hexToRgbA(this.customMaterialValues['Ambient']));
        this.customMaterial.setShininess(this.customMaterialValues['Ambient']);
   };

    initMaterials() {
        this.customMaterialValues = {
            'Ambient': '#0000ff',
            'Diffuse': '#ff0000',
            'Specular': '#000000',
            'Shininess': 10
        }
        
        this.customMaterial = new CGFappearance(this);

        this.wood1Material = new CGFappearance(this);
        this.wood1Material.setAmbient(0.1, 0.1, 0.1, 1);
        this.wood1Material.setDiffuse(0.9, 0.9, 0.9, 1);
        this.wood1Material.setSpecular(0.1, 0.1, 0.1, 1);
        this.wood1Material.loadTexture("../images/wood_texture.jpg");
        this.wood1Material.setTextureWrap('REPEAT', 'REPEAT');
        this.wood1Material.setShininess(10.0);

        this.wood2Material = new CGFappearance(this);
        this.wood2Material.setAmbient(0.51, 0.29, 0.04, 1.0);
        this.wood2Material.setDiffuse(0.36, 0.16, 0.02, 1.0);
        this.wood2Material.setSpecular(1.0, 1.0, 1.0, 1.0);
        this.wood2Material.loadTexture("../images/wood_textureCadeira.jpg");
        this.wood2Material.setTextureWrap('REPEAT', 'REPEAT');
        this.wood2Material.setShininess(100.0);

        this.wallMaterial = new CGFappearance(this);
        this.wallMaterial.setAmbient(1.0, 1.0, 1.0, 1.0);
        this.wallMaterial.setDiffuse(1.0, 1.0, 1.0, 1.0);
        this.wallMaterial.setSpecular(1.0, 1.0, 1.0, 1.0);
        this.wallMaterial.loadTexture("../images/ocean.jpg");
        this.wallMaterial.setTextureWrap('REPEAT', 'REPEAT');
        this.wallMaterial.setShininess(10.0);
        
        this.floorMaterial = new CGFappearance(this);
        this.floorMaterial.setAmbient(0.66, 0.66, 0.66, 1.0);
        this.floorMaterial.setDiffuse(0.66, 0.66, 0.66, 1.0);
        this.floorMaterial.setSpecular(1.0, 1.0, 1.0, 1.0);
        this.floorMaterial.loadTexture("../images/sand.jpg");
        this.floorMaterial.setTextureWrap('REPEAT', 'REPEAT');
        this.floorMaterial.setShininess(10.0);
         
        this.lampMaterial = new CGFappearance(this);
        this.lampMaterial.setAmbient(0.46, 0.79, 0.82, 1.0);
        this.lampMaterial.setDiffuse(0.46, 0.79, 0.82, 1.0);
        this.lampMaterial.setSpecular(1.0, 1.0, 1.0, 1.0);
        this.lampMaterial.loadTexture("../images/metal.jpg");
        this.lampMaterial.setTextureWrap('REPEAT', 'REPEAT');
        this.lampMaterial.setShininess(100.0);

        this.updateCustomMaterial();
    }

    display() {
        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();
        
        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        // Ensure that lights are updated.
        this.lights[0].update();
        this.lights[1].update();
        this.lights[2].update();

        // Draw axis
        if (this.displayAxis)
            this.axis.display();

        // Draw three Tables and apply material.
        this.wood1Material.apply(); 
        this.table1.display(Array(-5, 0, -5), Array(Math.PI, 0, 1, 0));
        this.table2.display(Array(5, 0, 5), Array(Math.PI / 2.5, 0, 1, 0));
        this.table3.display(Array(5, 0, 5), Array(-Math.PI / 2, 0, 1, 0));
        this.table4.display(Array(5, 0, -5), Array(Math.PI / 4, 0, 1, 0));
        
        //Draw two Chairs and apply material.
        this.wood2Material.apply(); 
        this.pushMatrix();
        this.translate(4, 0, 2);
        this.scale(1.2, 1.2, 1.2);
        this.chair.display();
        this.popMatrix();
        
        this.pushMatrix();
        this.translate(2, 0, -6);
        this.rotate(-Math.PI / 1.3, 0, 1, 0);
        this.scale(1.2, 1.2, 1.2);
        this.chair.display();
        this.popMatrix();  
        
        //Draw Floor and apply material.
        this.floorMaterial.apply();
        this.floor.display();

        // Draw Walls and apply material.
        this.wallMaterial.apply();
        this.walls.display();
        
        // Draw lamp and apply material.
        this.lampMaterial.apply();
        this.pushMatrix();
        this.scale(1.5, 1.5, 1.5);
        this.translate(4, 2.48, -1);
        this.lamp.display();
        this.popMatrix();
    }

    updateNormalViz()
    {
        if (this.displayNormals) {
            this.plane.enableNormalViz();
        }
        else {
            this.plane.disableNormalViz();
        }
    }

    hexToRgbA(hex)
    {
        var ret;
        //either we receive a html/css color or a RGB vector
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            ret=[
                parseInt(hex.substring(1,3),16).toPrecision()/255.0,
                parseInt(hex.substring(3,5),16).toPrecision()/255.0,
                parseInt(hex.substring(5,7),16).toPrecision()/255.0,
                1.0
            ];
        }
        else
            ret=[
                hex[0].toPrecision()/255.0,
                hex[1].toPrecision()/255.0,
                hex[2].toPrecision()/255.0,
                1.0
            ];
        return ret;
    }
}