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
            0, 0.5, 0,   
            -0.5, 0, 0.5,  
            0.5, 0, 0.5,    
            0.5, 0, -0.5,  
            -0.5, 0, -0.5,   

            0, 0.5, 0,        
            -0.5, 0, 0.5,   
            0.5, 0, 0.5,    
            0.5, 0, -0.5,   
            -0.5, 0, -0.5,   

            0, 0.5, 0,
            0, 0.5, 0
        ];

        this.indices = [
            0, 1, 2,
            0, 2, 3,
            0, 3, 4,
            0, 4, 1
        ];

        this.texCoords = [
        

        ];

        let vector01 = this.CalcVect([0, 0.5, 0], [0, Math.sin(45) + 0.5, Math.cos(45)]);
        let vector02 = this.CalcVect([0, 0.5, 0], [Math.cos(45), Math.sin(45) + 0.5, 0]); 
        let vector03 = this.CalcVect([0, 0.5, 0], [0, Math.sin(45) + 0.5, -Math.cos(45)]);
        let vector04 = this.CalcVect([0, 0.5, 0], [-Math.cos(45), Math.sin(45) + 0.5, 0]);
        
        let vector11 = this.CalcVect([-0.5, 0, 0.5], [-0.5, Math.sin(45), Math.cos(45) + 0.5]);
        let vector12 = this.CalcVect([-0.5, 0, 0.5] ,[-Math.cos(45) - 0.5, Math.sin(45), 0.5]);
        
        let vector21 = this.CalcVect([0.5, 0, 0.5], [0.5, Math.sin(45),Math.cos(45) + 0.5]);
        let vector22 = this.CalcVect([0.5, 0, 0.5], [Math.cos(45) + 0.5, Math.sin(45), 0.5]);

        let vector31 = this.CalcVect([0.5, 0, -0.5], [Math.cos(45) + 0.5, Math.sin(45), -0.5]);
        let vector32 = this.CalcVect([0.5, 0, -0.5], [0.5 , Math.sin(45), -Math.cos(45) - 0.5]);

        let vector41 = this.CalcVect([-0.5, 0, -0.5], [-0.5, Math.sin(45), -Math.cos(45) - 0.5]);
        let vector42 = this.CalcVect([-0.5, 0, -0.5], [-Math.cos(45) - 0.5, Math.sin(45), -0.5]);


        this.normals = [
            vector01[0], vector01[1], vector01[2],
            vector11[0], vector11[1], vector11[2],
            vector21[0], vector21[1], vector21[2],
            vector31[0], vector31[1], vector31[2],
            vector41[0], vector41[1], vector41[2],
            vector02[0], vector02[1], vector02[2],
            vector12[0], vector12[1], vector12[2],
            vector22[0], vector22[1], vector22[2],
            vector32[0], vector32[1], vector32[2],
            vector42[0], vector42[1], vector42[2],
            vector03[0], vector03[1], vector03[2],
            vector04[0], vector04[1], vector04[2]
        ];
        
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
    CalcVect(pointA, pointB) {

        let vector = [pointB[0] - pointA[0], pointB[1] - pointA[1], pointB[2] - pointA[2]];

        return vector;
    }
  
}