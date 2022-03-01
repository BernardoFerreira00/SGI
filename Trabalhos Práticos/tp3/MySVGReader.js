import { CGFappearance, CGFtexture, CGFXMLreader } from "./lib/CGF.js";
import { MyPowerUp } from "./model/MyPowerUp.js";
import { MyObstacle } from "./model/MyObstacle.js";
import { MyStartingLine } from "./model/MyStartLine.js";
import { MyRoute } from "./model/MyRoute.js";
import { MyVehicle } from "./model/MyVehicle.js";

/**
 * Parses SVG file with the track specification and power-ups, obstacles
 * and initial car position.
 */
export class MySVGReader {

    constructor(filename, scene) {
        // Establish bidirectional references between scene and SVGGraph.
        this.scene = scene;
        scene.svgGraph = this;

        this.loadedOk = null;

        this.reader = new CGFXMLreader();
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("SVG Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseSVGFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        this.scene.onSVGLoaded();
    }

    parseSVGFile(rootElement) {
        var nodes = rootElement.children;

        for(var i=0; i<nodes.length; i++) {
            if(nodes[i].nodeName == "g") {
                var error = this.parseGNode(nodes[i]);
            }
        }

        return error;
    }

    parseGNode(gNode) {  
        if(this.reader.getString(gNode, 'inkscape:label') == "PowerUps") { // Parses Power-ups.
            var powerUpsNodeChildren = gNode.children;

            for(var i=0; i<powerUpsNodeChildren.length; i++) {
                if(powerUpsNodeChildren[i].nodeName == "circle") {
                    var cx = this.reader.getFloat(powerUpsNodeChildren[i], 'cx');
                    var cy = this.reader.getFloat(powerUpsNodeChildren[i], 'cy');
                    var powerUp = new MyPowerUp(this.scene.game, Number(cx), Number(cy));
                    this.scene.game.powerUps.push(powerUp);
                }else {
                    this.onXMLError(powerUpsNodeChildren[i].nodeName + "label is invalid.");
                    return 1;
                }
            }

        } else if(this.reader.getString(gNode, 'inkscape:label') == "Obstacles") { // Parses Obstacles.
            var obstaclesNodeChildren = gNode.children;

            for(var i=0; i<obstaclesNodeChildren.length; i++) {
                if(obstaclesNodeChildren[i].nodeName == "circle") {
                    var cx = this.reader.getFloat(obstaclesNodeChildren[i], "cx");
                    var cy = this.reader.getFloat(obstaclesNodeChildren[i], "cy");
                    var obstacle = new MyObstacle(this.scene.game, Number(cx), Number(cy));
                    this.scene.game.obstacles.push(obstacle);
                }else {
                    this.onXMLError(obstaclesNodeChildren[i].nodeName + "label is invalid.");
                    return 1;
                }
            }

        }else if(this.reader.getString(gNode, 'inkscape:label') == "Start") { // Parses car's initial position.
            var path = gNode.children[0];

            if(path != undefined) {
                var points = this.parseDComponentInPath(this.reader.getString(path, "d"));
                this.scene.game.start = new MyStartingLine([points[0][0], 0, points[0][1]].map((i) => Number(i)));
                this.scene.game.vehicle = new MyVehicle([points[0][0], 0, points[0][1]].map((i) => Number(i)),this.scene);
                console.log([points[0][0], 0, points[0][1]])
            }else {
                this.onXMLError("path is undefined.");
                return 1;
            }

        }else if(this.reader.getString(gNode, 'inkscape:label') == "Routes") { // Parses routes specification (for DEMO).
            var paths = gNode.children;

            for(var i=0; i<paths.length; i++) {
                var points = this.parseDComponentInPath(this.reader.getString(paths[i], "d"));
                var route = new MyRoute(points);
                this.scene.game.routes.push(route);
            }
        }else if(this.reader.getString(gNode, 'inkscape:label') == "Track") {
        }
        else {
            this.onXMLError(this.reader.getString(gNode, 'inkscape:label') + " label does not exists.");
            return 1;
        }

        return null;
    }
    
    parseDComponentInPath(d) {
        var points = [];
        var spitedString = d.split(" ");

        for(var i=1; i<spitedString.length; i++) {
            var point = spitedString[i];
            
            var pointX = point.split(",")[0];
            var pointY = point.split(",")[1];

            if(pointX == "L" || pointX == "l" || pointX == "Z" || pointX == "c" || pointX == "h") {
                continue;
            }

            points.push([pointX, pointY]);
        }

        return points;
    }


    log(message) {
        console.log("   " + message);
    }

    
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }


    getVehicle() {
        return this.vehicle;
    }
}