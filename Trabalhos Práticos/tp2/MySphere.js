import { CGFobject } from '../lib/CGF.js';
import { MyHalfSphere } from './MyHalfSphere.js';


/**
 * MySphere
 * @constructor
 * @param scene - Reference to MyScene object
 * @param radius - radius for sphere.
 * @param slices - number of slices.
 * @param stacks - number of stacks.
 */
export class MySphere extends CGFobject {
    constructor(scene, radius, slices, stacks) {
        super(scene);
        this.radius = radius;
        this.slices = slices;
        this.stacks = stacks;

        this.semiSphereTop = new MyHalfSphere(this.scene, this.slices, this.stacks);
        this.semiSphereBack = new MyHalfSphere(this.scene, this.slices, this.stacks);
    }

    /**
     * Invokes display methods for each half of the sphere.
     */
    display() {
        this.scene.pushMatrix();
        this.scene.scale(this.radius, this.radius, this.radius);
        this.semiSphereTop.display();
        this.scene.popMatrix();
    
        this.scene.pushMatrix();
        this.scene.scale(this.radius, this.radius, this.radius);
        this.scene.rotate(Math.PI, 1, 0, 0);
        this.semiSphereBack.display();
        this.scene.popMatrix();
    };

    /**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(s, t) {
		//this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}
}