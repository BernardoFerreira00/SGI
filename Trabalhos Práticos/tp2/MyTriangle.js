import { CGFobject } from '../lib/CGF.js';
/**
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 * Other params are the positions of each vertice.
 */
export class MyTriangle extends CGFobject {
	constructor(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
		super(scene);

		this.v1 = vec3.fromValues(x1, y1, z1);
		this.v2 = vec3.fromValues(x2, y2, z2);
		this.v3 = vec3.fromValues(x3, y3, z3);

		this.initBuffers();
	}
	

	initBuffers() {
		this.vertices = [
			this.v1[0], this.v1[1], this.v1[2],
			this.v2[0], this.v2[1], this.v2[2],
			this.v3[0], this.v3[1], this.v3[2],

		]

		this.indices = [
			0, 1, 2
		]

		var V21 = vec3.create();  
		var V21 =[this.v2[0]-this.v1[0],
				this.v2[1]-this.v1[1],
				this.v2[2]-this.v1[2]]

		var V32 = vec3.create(); 
		var V32 =[this.v3[0]-this.v2[0],
				this.v3[1]-this.v2[1],
				this.v3[2]-this.v3[2]]

		var N =vec3.create() 
		vec3.cross(N, V21, V32)
		vec3.normalize(N, N)

		this.normals = [
			N[0], N[1], N[2],
			N[0], N[1], N[2],
			N[0], N[1], N[2],]

		this.texCoords = [
			0, 1, //this.minS, this.maxT,
			1, 1, //this.maxS, this.maxT,
			0, 0, //this.minS, this.minT,
			1, 0 //this.maxS, this.minT
		]

		this.primitiveType = this.scene.gl.TRIANGLES
		this.initGLBuffers()
	}


	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(afS, afT) {
		var distA = Math.sqrt(Math.pow(this.v2[0] - this.v3[0], 2) + Math.pow(this.v2[1] - this.v3[1], 2) + Math.pow(this.v2[2] - this.v3[2], 2));
		var distB = Math.sqrt(Math.pow(this.v1[0] - this.v3[0], 2) + Math.pow(this.v1[1] - this.v3[1], 2) + Math.pow(this.v1[2] - this.v3[2], 2));
		var distC = Math.sqrt(Math.pow(this.v2[0] - this.v1[0], 2) + Math.pow(this.v2[1] - this.v1[1], 2) + Math.pow(this.v2[2] - this.v1[2], 2));
	
		var angBeta = Math.acos((Math.pow(distA, 2) - Math.pow(distB, 2) + Math.pow(distC, 2)) / (2 * distA * distC));
	
		var distD = distA * Math.sin(angBeta);
	
		this.texCoords = [
		  0, distD/afT,
		  distC/afS, distD/afT,
		  (distC-distA*Math.cos(angBeta))/afS,(distD-distA*Math.sin(angBeta))/afT
		];
	
		this.updateTexCoordsGLBuffers();
	}
}
