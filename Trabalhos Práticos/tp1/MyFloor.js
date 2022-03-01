import {CGFobject} from '../lib/CGF.js';
import { MyQuad } from './MyQuad.js';

/**
* MyFloor
* @constructor
 * @param scene - Reference to MyScene object
*/
export class MyFloor extends CGFobject {
    constructor(scene, floorDimensions) {
        super(scene);
        this.floorDimensions = floorDimensions
        this.floor = new MyQuad(scene);
    }
    display() {
        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI / 2, 1, 0, 0);
        this.scene.scale(this.floorDimensions[0], this.floorDimensions[1], this.floorDimensions[0]);
        this.floor.display();
        this.scene.popMatrix();
    }

    // These are only needed if you are enabling normal visualization in compound objects
    enableNormalViz(){     this.face.enableNormalViz();    } ;
    disableNormalViz(){     this.face.disableNormalViz();    } ;
}


