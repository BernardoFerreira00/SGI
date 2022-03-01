import {CGFobject} from '../lib/CGF.js';
import { MyQuad } from './MyQuad.js';

/**
* MyWalls
* @constructor
 * @param scene - Reference to MyScene object
*/
export class MyWalls extends CGFobject {
    constructor(scene, wallDimensions) {
        super(scene);
        this.wallDimensions = wallDimensions
        this.wall1 = new MyQuad(scene);
        this.wall2 = new MyQuad(scene);
        this.wall3 = new MyQuad(scene);
        this.wall4 = new MyQuad(scene);
    }
    display() {
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.scene.translate(0, this.wallDimensions[1]/2, -this.wallDimensions[1]);
        this.scene.scale(this.wallDimensions[0], this.wallDimensions[1], 1);
        this.wall1.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(0, this.wallDimensions[1]/2, -this.wallDimensions[1]);
        this.scene.scale(this.wallDimensions[0], this.wallDimensions[1], 1);
        this.wall2.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(Math.PI / 2, 0, 1, 0);
        this.scene.translate(0, this.wallDimensions[1]/2, -this.wallDimensions[1]);
        this.scene.scale(this.wallDimensions[0], this.wallDimensions[1], 1);
        this.wall2.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI / 2, 0, 1, 0);
        this.scene.translate(0, this.wallDimensions[1]/1.2, -this.wallDimensions[1]);
        this.scene.scale(this.wallDimensions[0], this.wallDimensions[1]/3, 1);
        this.wall2.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI / 2, 0, 1, 0);
        this.scene.translate(2.35, this.wallDimensions[1]/6, -this.wallDimensions[1]);
        this.scene.scale(this.wallDimensions[0]/1.3, this.wallDimensions[1]/3, 1);
        this.wall2.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(-Math.PI / 2, 0, 1, 0);
        this.scene.translate(0, this.wallDimensions[1]/2, -this.wallDimensions[1]);
        this.scene.scale(this.wallDimensions[0]/1.87, this.wallDimensions[1]/3, 1);
        this.wall2.display();
        this.scene.popMatrix();

      
    }

    // These are only needed if you are enabling normal visualization in compound objects
    enableNormalViz(){     this.face.enableNormalViz();    } ;
    disableNormalViz(){     this.face.disableNormalViz();    } ;
}