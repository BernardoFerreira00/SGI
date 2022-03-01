/**
 * Animation for Playing Mode.
 */
export class MyAnimation {

    constructor(game, object) {

        this.game = game;
        this.object = object;

    }

    animation(component1, component2, component3) {

        var rotation = this.object.getRotation()
        var wRotation = this.object.getWheelsRotation()
        var velocity = Number(this.object.getVelocity())

        mat4.rotate(component1.transformMatrix, component1.transformMatrix, rotation, [0,1,0]);
        mat4.rotate(component2.transformMatrix, component2.transformMatrix, wRotation, [0,1,0]);
        mat4.rotate(component3.transformMatrix, component3.transformMatrix, wRotation, [0,1,0]);

        var translation = vec3.create();
        vec3.set(translation, 0, 0, velocity);

        mat4.translate(component1.transformMatrix, component1.transformMatrix, translation);
    }

}