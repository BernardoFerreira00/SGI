import {CGFobject} from '../lib/CGF.js';
/**
* MyPiramid4
* @constructor
 * @param scene - Reference to MyScene object
*/
export class MyPiramid4 extends CGFobject {
    constructor(scene) {
        super(scene);
        this.initBuffers();

    }
    initBuffers() {

        // Generate vertices
        this.vertices = [
            0, 0.5, 0,     //0
            -0.5, 0, 0.5,  //1
            0.5, 0, 0.5,   //2
            0.5, 0, -0.5,  //3
            -0.5, 0, -0.5, //4

            0, 0.5, 0,      //0  
            -0.5, 0, 0.5,   //1
            0.5, 0, 0.5,    //2
            0.5, 0, -0.5,   //3
            -0.5, 0, -0.5,  //4

            0, 0.5, 0,      //0
            0, 0.5, 0       //0
        ];

        this.indices = [
            0, 1, 2,
            0, 2, 3,
            0, 3, 4,
            0, 4, 1
        ];

        
        this.normals = [
            0, 0.5, 0.5, //0
            0, 0.5, 0.5, //1
            0, 0.5, 0.5, //2
            0.5, 0.5, 0, //3
            0, 0.5, -0.5, //4

            0.5, 0.5, 0, //0
            -0.5, 0.5, 0, //1
            0.5, 0.5, 0, //2
            0, 0.5, -0.5, //3
            -0.5, 0.5, 0, //4
            
            0, 0.5, -0.5, //0
            -0.5, 0.5, 0  //0

        ];
        
        
        for(var i=0; i<9; i+=3) {
            var size = Math.sqrt(this.normals[i]*this.normals[i] +
                                this.normals[i+1]*this.normals[i+1] +
                                this.normals[i+2]*this.normals[i+2]
                                );
            this.normals[i] /= size;
            this.normals[i+1] /= size;
            this.normals[i+2] /= size;
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}