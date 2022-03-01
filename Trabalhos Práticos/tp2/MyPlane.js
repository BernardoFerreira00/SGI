import { CGFobject } from '../lib/CGF.js';
import { CGFnurbsSurface, CGFnurbsObject  } from '../lib/CGF.js';

/**
 * MyPlane built with NURBs
 */
export class MyPlane extends CGFobject {

    /**
    * MyPlane
    * @constructor
    * @param scene - Reference to MyScene object
    * @param npartsU - number of parts divided in U domain.
    * @param npartsV - number of parts divided in V domain.
    */
    constructor(scene, npartsU, npartsV) {
        super(scene);

        this.controlvertexes = [];
        this.npartsU = npartsU;
        this.npartsV = npartsV;
        this.divisionU = 1/this.npartsU;
        this.divisionV = 1/this.npartsV;

        this.planeObj;
        this.initBuffers();

    }

    initBuffers() {
        this.makeControlVertices();
        this.makeSurface(1, 1);
    }

    makeSurface(degree1, degree2) {
        var nurbsSurface = new CGFnurbsSurface(degree1, degree2, this.controlvertexes);
        this.planeObj = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, nurbsSurface);
    }

    makeControlVertices() {
        this.controlvertexes = [
            [
                [-0.5, 0, -0.5, 1],
                [0.5, 0, -0.5, 1]
            ],
            [
                [-0.5, 0, 0.5, 1],
                [0.5, 0, 0.5, 1]
            ]
        ];
    }

    display() {
        this.planeObj.display();
    }
    
    updateTexCoords(s, t) {
        this.updateTexCoordsGLBuffers();
    }   
}