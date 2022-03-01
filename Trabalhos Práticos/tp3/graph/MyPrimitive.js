import { CGFobject } from '../lib/CGF.js';
import { MyTriangle } from '../primitives/MyTriangle.js';
import { MyRectangle } from '../primitives/MyRectangle.js';
import { MySphere } from '../primitives/MySphere.js';
import { MyCylinder } from '../primitives/MyCylinder.js';

/**
 * MyPrimitive
 * @constructor
 * @param graph - Reference to MyScene object
 * @param primitive - Primitive to store. 
 */
export class MyPrimitive {
    constructor(graph, primitive) {
        this.graph = graph
        this.primitive = primitive
    }
}



