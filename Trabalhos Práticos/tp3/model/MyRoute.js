import {Helpers} from '../helpers/Helpers.js'

export class MyRoute {
    constructor(deltas) {

        this.deltas = deltas.map(i => Helpers.parsePoint(i));
        this.points = [];

        this.caculatePoints();
    }

    
    caculatePoints() {

        this.points.push(this.deltas[0]);

        for(var i=1; i<this.deltas.length; i++) {
            let point = [];
            point[0] = this.points[i-1][0] + this.deltas[i][0];
            point[1] = this.deltas[i-1][1];
            point[2] = this.points[i-1][2] + this.deltas[i][2];
            this.points.push(point);
        }
    }
}