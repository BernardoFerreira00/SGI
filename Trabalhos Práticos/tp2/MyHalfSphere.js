import { CGFobject } from '../lib/CGF.js';

/**
 * MyHalfSphere
 * @constructor
 * @param scene - Reference to MyScene object
 * @param slices - number of slices
 * @param stacks - number of stacks
 */
export class MyHalfSphere extends CGFobject {
    constructor(scene, slices, stacks) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;

        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
    
        var phiValue = (Math.PI / 2) / this.stacks;
        var thetaValue = 2 * Math.PI / this.slices;

        for (let i = 0; i <= this.stacks; i++) {
            for (let j = 0; j <= this.slices; j++) {
                this.texCoords.push(j * 1 / this.slices, i * 1 / this.stacks);
                this.vertices.push(Math.cos(thetaValue * j) * Math.cos(phiValue * i), Math.sin(thetaValue * j) * Math.cos(phiValue * i), Math.sin(phiValue * i));
                this.normals.push(Math.cos(thetaValue * j) * Math.cos(phiValue * i), Math.sin(thetaValue * j) * Math.cos(phiValue * i), Math.sin(phiValue * i));
            }
        }
    
        for (let i = 0; i < this.stacks; i++) {
            for (let j = 0; j < this.slices; j++) {
                this.indices.push(i * (this.slices + 1) + j, i * (this.slices + 1) + 1 + j, (i + 1) * (this.slices + 1) + j);
                this.indices.push(i * (this.slices + 1) + 1 + j, (i + 1) * (this.slices + 1) + 1 + j, (i + 1) * (this.slices + 1) + j);
            }
        }
    
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}