import { CGFobject } from '../lib/CGF.js';


/**
 * MyCylinder
 * @constructor
 * @param scene - Reference to MyScene object
 * @param id - ID of the cylinder to create.
 * @param base - 
 * @param top - 
 * @param height - height for the cylinder.
 * @param slices - number of slices for the cylinder.
 * @param stacks - number of stacks for the cylinder.
 */
export class MyCylinder extends CGFobject {
    constructor(scene, id, base, top, height, slices, stacks) {
        super(scene);
        this.id = id;
        this.base = base;
        this.top = top;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;

        this.initBuffers();
    }

    
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
        
        var ang = 0;
        var deltaAng = 2 * Math.PI/this.slices;

        var stack = 0;
        var deltaStacks = this.height/this.stacks;
       
        var raio = this.base;
        var deltaRaio = (this.top - this.base)/this.stacks;
        var slope = this.stacks/Math.abs(this.top - this.base);
        
        for(var i=0; i<=this.stacks; i++) {
            for(var j=0; j<=this.slices; j++) {
                
                var x = raio * Math.cos(ang);
                var y = raio * Math.sin(ang);
                var z = stack;

                this.vertices.push(x, y, z);
                this.normals.push(Math.cos(ang), Math.sin(ang), -1/slope);
                this.texCoords.push(j / this.slices, i / this.stacks);

                ang += deltaAng;
            }
            
            raio += deltaRaio;
            stack += deltaStacks;
            ang = 0;
        }
        
        for(var i=0; i<this.stacks; i++) {
            for(var j=0; j<this.slices; j++) {
                this.indices.push(
                    i * (this.slices + 1) + j,
                    i * (this.slices + 1) + (j + 1),
                    (i + 1) * (this.slices + 1) + (j + 1)
                );
                this.indices.push(
                    (i + 1) * (this.slices + 1) + (j + 1),
                    (i + 1) * (this.slices + 1) + j,
                    i * (this.slices + 1) + j
                );
            }
        }
        
        this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
    }
    

    updateTexCoords() {
		this.updateTexCoordsGLBuffers();
	}
}
