import { CGFobject } from '../lib/CGF.js';
import { MyTriangle } from './MyTriangle.js';
import { MyRectangle } from './MyRectangle.js';
import { MySphere } from './MySphere.js';
import { MyCylinder } from './MyCylinder.js';

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