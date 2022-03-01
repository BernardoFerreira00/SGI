import { CGFobject } from '../lib/CGF.js';
import { CGFnurbsSurface, CGFnurbsObject  } from '../lib/CGF.js';



/**
 * MyCylinder built with NURBS
 * @constructor
 * @param scene - Reference to MyScene object
 * @param id - ID of the cylinder to create.
 * @param base - 
 * @param top - 
 * @param height - height for the cylinder.
 * @param slices - number of slices for the cylinder.
 * @param stacks - number of stacks for the cylinder.
 */
export class MyCylinder2 extends CGFobject{

    constructor(scene, base, top, heigth, slices, stacks) {
        super(scene);
        
        this.base = base;
        this.top = top;
        this.heigth = heigth;
        this.npartsU = stacks;
        this.npartsV = slices;
        this.radioTop = this.top/2;
        this.radioBase = this.base/2;

        
        var controlV1 = this.makeControlVerticesFirstHalf();
        this.cylinderFH = this.makeSurface(3, 1, controlV1);

        var controlV2 = this.makeControlVerticesSecondHalf();
        this.cylinderSH = this.makeSurface(3, 1, controlV2);
    }

    makeSurface(degree1, degree2, controlVertexes) {

        var nurbsSurface = new CGFnurbsSurface(degree1, degree2, controlVertexes);
        var cylinderObj = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, nurbsSurface);

        return cylinderObj;
    }

    makeControlVerticesFirstHalf() {

        var cVertexes = [
            [
                [this.radioBase-0.3, 0, 0, 1],
                [this.radioTop-0.3, 0, this.heigth, 1]
            ],//1
            [
                [this.radioBase/2, this.radioBase, 0, 1],
                [this.radioTop/2, this.radioTop, this.heigth, 1]
            ],//2
            [
                [-this.radioBase/2, this.radioBase, 0, 1],
                [-this.radioTop/2, this.radioBase, this.heigth, 1]
            ],//3
            [
                [-this.radioBase+0.3, 0, 0, 1],
                [-this.radioTop+0.3, 0, this.heigth, 1]
            ]//4
        ];

        return cVertexes;
    }

    makeControlVerticesSecondHalf() {
        var cVertexes = [
            [
                [-this.radioBase+0.3, 0, 0, 1],
                [-this.radioTop+0.4, 0, this.heigth, 1]
            ],//4
            [
                [-this.radioBase/2, -this.radioBase, 0, 1],
                [-this.radioTop/2, -this.radioTop, this.heigth, 1]
            ],//3
            [
                [this.radioBase/2, -this.radioBase, 0, 1],
                [this.radioTop/2, -this.radioTop, this.heigth, 1]
            ],//2
            [
                [this.radioBase-0.3, 0, 0, 1],
                [this.radioTop-0.3, 0, this.heigth, 1]
            ]//1
            
            
            
        ];

        return cVertexes;
    }
    
   /**
    * Invokes displaying methods for each half of the cylinder.
    */
    display() {
        this.cylinderFH.display();
        this.cylinderSH.display();
    }

    updateTexCoords() {
        this.updateTexCoordsGLBuffers();
    } 


}