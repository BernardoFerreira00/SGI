import { CGFobject } from '../lib/CGF.js';
import { CGFnurbsSurface, CGFnurbsObject  } from '../lib/CGF.js';


/**
 * MyPatch built with NURBs
 */
export class MyPatch extends CGFobject{

    /**
    * MyPatch
    * @constructor
    * @param scene - Reference to MyScene object
    * @param npointsU - number of points in U domain.
    * @param npointsV - number of points in V domain.
    * @param npartsU - number of parts divided in U domain.
    * @param npartsV - number of parts divided in V domain.
    * @param controlvertexes - number of control points
    */
    constructor(scene, npointsU, npointsV, npartsU, npartsV, controlvertexes) {
        super(scene)

        this.npointsU = npointsU;
        this.npointsV = npointsV;
        this.npartsU = npartsU;
        this.npartsV = npartsV;

        var degree1 = this.npointsU - 1;
        var degree2 = this.npointsV - 1;

        this.makeControlVertexes(controlvertexes);
        this.makeSurface(degree1, degree2);
    }

    makeSurface(degree1, degree2) {
        var nurbsSurface = new CGFnurbsSurface(degree1, degree2, this.cVertexes);
        this.patchObj = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, nurbsSurface);
    }
    
    makeControlVertexes(controlvertexes) {
        this.cVertexes = []
        var cont = 0;

        for(var i=0; i<this.npointsU; i++) {
            this.cVertexes.push([]);
            for(var j=0; j<this.npointsV; j++) {
                this.cVertexes[i].push(controlvertexes[cont]);
                cont++;
            }
        }
    }
    
    display() {
        this.patchObj.display();
    }

    updateTexCoords(s, t) {
        this.updateTexCoordsGLBuffers();
    } 

}