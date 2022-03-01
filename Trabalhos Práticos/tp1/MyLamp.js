import {CGFobject} from '../lib/CGF.js';
import { MyCube } from "./MyCube.js";
import { MyPiramid4 } from './MyPyramid4.js';

/**
* MyLamp
* @constructor
 * @param scene - Reference to MyScene object
*/
export class MyLamp extends CGFobject {
    constructor(scene) {
        super(scene);
        
        this.cube = new MyCube(this.scene);
        this.piramid = new MyPiramid4(this.scene);
    }
    display() {

        this.constructBase();
        this.constructStick();
        this.constructAbajur();
    }
    constructBase() {

        this.scene.pushMatrix();
        this.scene.scale(0.5, 0.1, 0.5);
        this.cube.display();
        this.scene.popMatrix();
    }
    constructStick() {

        this.scene.pushMatrix();
        this.scene.translate(0, 0.5, 0);
        this.scene.scale(0.1, 0.9, 0.1);
        this.cube.display();
        this.scene.popMatrix();

    }
    constructAbajur() {
        this.scene.pushMatrix();
        this.scene.translate(0, 0.7, 0);
        this.scene.scale(0.8, 1, 0.8);
        this.piramid.display();
        this.scene.popMatrix();
    }
    enableNormalViz(){     this.face.enableNormalViz();    } ;
    disableNormalViz(){     this.face.disableNormalViz();    } ;
};