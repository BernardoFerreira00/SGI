import {CGFobject} from '../lib/CGF.js';
import { MyCube } from './MyCube.js';

/**
* MyChair
* @constructor
 * @param scene - Reference to MyScene object
*/
export class MyChair extends CGFobject {
    constructor(scene) {
        super(scene);
        
        this.cube = new MyCube(this.scene);    
    }
    display() {
        
        this.constructLegs();
        this.constructTop();
        this.constructBack();

    }
    constructBack() {

        this.scene.pushMatrix();
        this.scene.translate(0.75, 2.8, 0);
        this.scene.scale(1.8, 1.8, 0.3);
        this.cube.display();
        this.scene.popMatrix();

    }

    constructTop() {

        this.scene.pushMatrix();
        this.scene.translate(0.75, 1.8, 0.75);
        this.scene.scale(1.8, 0.3, 1.8);
        this.cube.display();
        this.scene.popMatrix();


    }
    constructLegs() {

        this.scene.pushMatrix();
        this.scene.translate(0, 1, 0);
        this.scene.scale(0.3, 1.8, 0.3);
        this.cube.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(1.5, 1, 0);
        this.scene.scale(0.3, 1.8, 0.3);
        this.cube.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(1.5, 1, 1.5);
        this.scene.scale(0.3, 1.8, 0.3);
        this.cube.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, 1, 1.5);
        this.scene.scale(0.3, 1.8, 0.3);
        this.cube.display();
        this.scene.popMatrix();


    }
    enableNormalViz(){     this.face.enableNormalViz();    } ;
    disableNormalViz(){     this.face.disableNormalViz();    } ;
}