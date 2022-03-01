import { CGFobject } from '../lib/CGF.js';

/**
 * MyComponent
 * @constructor
 * @param graph - Reference to MySceneGraph object
 * @param componentID - ID of the component to create.
 */
export class MyComponent {
    constructor(graph, componentID) {
        this.graph = graph
        this.componentID = componentID
        this.children = []
        this.primitives = []
        this.materialID = null
        this.texture = []
        this.transformMatrix = mat4.create()
        mat4.identity(this.transformMatrix)
    }

    /**
     * Adds a component as children of component.
     * @param childrenID - ID of the component to add as children.
     */
    addChild(childrenID) {
        this.children.push(childrenID)
    }

     /**
     * Adds a primitive as children of component.
     * @param primitiveID - ID of the primitive to add as children.
     */
    addPrimitive(primitiveID) {
        this.primitives.push(primitiveID)
    }
    
}