import {CGFobject} from '../lib/CGF.js';
import { MyCube } from './MyCube.js';
import { MyQuad } from './MyQuad.js';

/**
* MyTable
* @constructor
 * @param scene - Reference to MyScene object
*/
export class MyTable extends CGFobject {
    constructor(scene, topDimensions, legDimennsions) {
        super(scene);

        this.topDimensions = topDimensions;
        this.legDimennsions = legDimennsions;
        this.tableTop = new MyCube(scene);
        this.leg1 = new MyCube(scene);
        this.leg2 = new MyCube(scene);
        this.leg3 = new MyCube(scene);
        this.leg4 = new MyCube(scene);
    }

    display(position, rotation) {
        this.position = position
        this.rotation = rotation
        this.createTableTop()
        this.createLeg()
    }

    // These are only needed if you are enabling normal visualization in compound objects
    enableNormalViz(){     this.face.enableNormalViz();    } ;
    disableNormalViz(){     this.face.disableNormalViz();    } ;

    createTableTop() {
        this.scene.pushMatrix(); 
        this.scene.rotate(this.rotation[0], this.rotation[1], this.rotation[2], this.rotation[3]);       
        this.scene.translate(0 + this.position[0], this.legDimennsions[1] + this.position[1], 0 + this.position[2]);
        this.scene.rotate(Math.PI / 2, 1, 0, 0);
        this.scene.scale(this.topDimensions[0], this.topDimensions[1], this.topDimensions[2]);
        this.tableTop.display();
        this.scene.popMatrix();
    }

    createLeg() {
        this.scene.pushMatrix();
        this.scene.rotate(this.rotation[0], this.rotation[1], this.rotation[2], this.rotation[3]);
        this.scene.translate(this.topDimensions[0]/2 - (this.legDimennsions[0]/2) + this.position[0], this.legDimennsions[1]/2 - (this.topDimensions[2] / 2) + this.position[1], this.topDimensions[1]/2 - (this.legDimennsions[2]/2) + this.position[2]);
        this.scene.scale(this.legDimennsions[0], this.legDimennsions[1], this.legDimennsions[2]);
        this.leg1.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(this.rotation[0], this.rotation[1], this.rotation[2], this.rotation[3]);
        this.scene.translate(-this.topDimensions[0]/2 + (this.legDimennsions[0]/2 + this.position[0]), this.legDimennsions[1]/2 + (this.topDimensions[2] / 2) + this.position[1], -this.topDimensions[1]/2 + (this.legDimennsions[2]/2) + this.position[2]);
        this.scene.scale(this.legDimennsions[0], this.legDimennsions[1], this.legDimennsions[2]);
        this.leg2.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(this.rotation[0], this.rotation[1], this.rotation[2], this.rotation[3]);
        this.scene.translate(this.topDimensions[0]/2 - (this.legDimennsions[0]/2) + this.position[0], this.legDimennsions[1]/2 + (this.topDimensions[2] / 2) + this.position[1], -this.topDimensions[1]/2 + (this.legDimennsions[2]/2) + this.position[2]);
        this.scene.scale(this.legDimennsions[0], this.legDimennsions[1], this.legDimennsions[2]);
        this.leg3.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.rotate(this.rotation[0], this.rotation[1], this.rotation[2], this.rotation[3]);
        this.scene.translate(-this.topDimensions[0]/2 + (this.legDimennsions[0]/2) + this.position[0], this.legDimennsions[1]/2 + (this.topDimensions[2] / 2) + this.position[1], this.topDimensions[1]/2 - (this.legDimennsions[2]/2) + this.position[2]);
        this.scene.scale(this.legDimennsions[0], this.legDimennsions[1], this.legDimennsions[2]);
        this.leg4.display();
        this.scene.popMatrix();
    }
}



