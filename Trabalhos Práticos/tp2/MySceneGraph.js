import { CGFappearance, CGFtexture, CGFXMLreader } from "../lib/CGF.js";
import { MyRectangle } from './MyRectangle.js';
import { MyTriangle } from './MyTriangle.js';
import { MyCylinder } from './MyCylinder.js';
import { MySphere } from './MySphere.js';
import { MyComponent } from "./MyComponent.js";
import { MyPrimitive } from "./MyPrimitive.js";
import { MyPlane } from "./MyPlane.js";
import { MyPatch } from "./MyPatch.js";
import { MyCylinder2 } from "./MyCylinder2.js";

var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var PRIMITIVES_INDEX = 7;
var COMPONENTS_INDEX = 8;

/**
 * MySceneGraph class, representing the scene graph.
 */

export class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];
        this.components = []

        // The id of the root element.
        this.idRoot = null;                    

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "SXG")
            return "root tag <SXG> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order " + index);

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null)
                return error;
        }

        // <globals>
        if ((index = nodeNames.indexOf("globals")) == -1)
            return "tag <globals> missing";
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <globals> out of order");

            //Parse globals block
            if ((error = this.parseGlobals(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }
        this.log("all parsed");
    }

    /**
     * Parses the <scene> block. 
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {

        // Get root of the scene.
        this.idRoot = this.reader.getString(sceneNode, 'root')
        if (this.idRoot == null)
            return "no root defined for scene";

    
        // Get axis length        
        var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length || 1;

        this.log("Parsed scene");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {
        var children = viewsNode.children;

        this.views = [];
        var numViews = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of views.
        for (var i = 0; i < children.length; i++) {

            // Storing views information
            var global = [];
            var attributeNames = [];

            //Check type of view
            if (children[i].nodeName != "perspective" && children[i].nodeName != "ortho") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["from", "to"]);
            }

            // Get id of the current view.
            var viewID = this.reader.getString(children[i], 'id');
            if (viewID == null)
                return "no ID defined for view";

            // Checks for repeated view.
            if (this.views[viewID] != null)
                return "ID must be unique for each view (conflict: ID = " + viewID + ")";

            // Near attribute
            var aux = this.reader.getFloat(children[i], 'near');
            if (!(aux != null && !isNaN(aux)))
                this.onXMLMinorError("unable to parse value component of the 'enable view' field for ID = " + viewID + "; assuming 'value = 1'");

            global.push(children[i].nodeName);
            global.push(aux);

            // Far attribute
            var aux = this.reader.getFloat(children[i], 'far');
            if (!(aux != null && !isNaN(aux)))
                this.onXMLMinorError("unable to parse value component of the 'enable view' field for ID = " + viewID + "; assuming 'value = 1'");

            global.push(aux);

            grandChildren = children[i].children;

            // Specifications for the current view.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeNames[j] == "from")
                        var aux = this.parseCoordinates3D(grandChildren[attributeIndex], "view from location for ID" + viewID);
                    else if (attributeNames[j] == "to") {
                        var aux = this.parseCoordinates3D(grandChildren[attributeIndex], "view to location for ID" + viewID);
                    }
                    else {
                        return "Unkown children on VIEWS block. ID = " + viewID
                    }
    
                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[i] + " undefined for ID = " + viewID;
            }

            // Get additional attributes of the perspective view.
            if (children[i].nodeName == "perspective") {
                // Angle attribute
                var aux = this.reader.getFloat(children[i], 'angle');
                if (!(aux != null && !isNaN(aux)))
                    this.onXMLMinorError("unable to parse value component of the 'angle' field for ID = " + viewID + ";");

                global.push(this.degreesToRadians(aux));
            }


            // Gets the additional attributes of the ortho view.
            if (children[i].nodeName == "ortho") {

                // Left attribute
                var aux = this.reader.getFloat(children[i], 'left');
                if (!(aux != null && !isNaN(aux)))
                    this.onXMLMinorError("unable to parse value component of the 'left' field for ID = " + viewID + "; assuming 'value = 1'");
                global.push(aux);

                // Right attribute
                var aux = this.reader.getFloat(children[i], 'right');
                if (!(aux != null && !isNaN(aux)))
                    this.onXMLMinorError("unable to parse value component of the 'right' field for ID = " + viewID + "; assuming 'value = 1'");

                // Top attribute
                var aux = this.reader.getFloat(children[i], 'top');
                if (!(aux != null && !isNaN(aux)))
                    this.onXMLMinorError("unable to parse value component of the 'top' field for ID = " + viewID + "; assuming 'value = 1'");
                global.push(aux);

                // Bottom attribute
                var aux = this.reader.getFloat(children[i], 'bottom');
                if (!(aux != null && !isNaN(aux)))
                    this.onXMLMinorError("unable to parse value component of the 'bottom' field for ID = " + viewID + "; assuming 'value = 1'");
                global.push(aux);

                // Get UP attribute.
                var targetIndex = nodeNames.indexOf("up");
                if (targetIndex != -1) {
                    var aux = this.parseCoordinates3D(grandChildren[targetIndex], "up values for ID " + viewID);
                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux)
                }
            }

            this.views[viewID] = global;
            numViews++;
        }

        if (numViews == 0)
            return "at least one view must be defined";

        this.log("Parsed VIEWS");
        return null;
    }

    /**
     * Converts degrees to radians.
     * @param degrees - degrees to convert.
     */
    degreesToRadians(degrees)
    {
        var pi = Math.PI;
        return degrees * (pi/180);
    }

    /**
     * Parses the <globals> node.
     */
    parseGlobals(ambientsNode) {
        var children = ambientsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        // Ambient 
        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        // Ambient.
        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        
        this.log("Parsed globals");
        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "omni" && children[i].nodeName != "spot") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular", "attenuation"]);
                attributeTypes.push(...["position", "color", "color", "color", "values"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
            var enableLight = true;
            var aux = this.reader.getFloat(children[i], 'enabled');
            if (!(aux != null && !isNaN(aux) && (aux == 1 || aux == 0)))
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");

            enableLight = aux || 1;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;

            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    // Convert location values.
                    if (attributeNames[j] == "location")
                        var aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light location for ID" + lightId);
                    else if (attributeNames[j] == "attenuation") { // Convert attenuation values.

                        var attenuationIndex = nodeNames.indexOf("attenuation");
                        var constant = this.reader.getFloat(grandChildren[attenuationIndex], 'constant');
                        if (constant == null)
                            return "unable to parse constant value for light with ID = " + lightId;
                        else if (isNaN(constant) && constant < 0)
                            return "'constant' is a non numeric value or a negative value";

                        var linear = this.reader.getFloat(grandChildren[attenuationIndex], 'linear');
                        if (linear == null)
                            return "unable to parse linear value for light with ID = " + lightId;
                        else if (isNaN(linear) && linear < 0)
                            return "'linear' is a non numeric value or a negative value";

                        var quadratic = this.reader.getFloat(grandChildren[attenuationIndex], 'quadratic');
                        if (quadratic == null)
                            return "unable to parse quadratic value for light with ID = " + lightId;
                        else if (isNaN(quadratic) && quadratic < 0)
                            return "'quadratic' is a non numeric value or a negative value";

                        var aux = [constant, linear, quadratic]
                    }
                    else
                        var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);

                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[i] + " undefined for ID = " + lightId;
            }

            // Gets the additional attributes of the spot light
            if (children[i].nodeName == "spot") {
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                var exponent = this.reader.getFloat(children[i], 'exponent');
                if (!(exponent != null && !isNaN(exponent)))
                    return "unable to parse exponent of the light for ID = " + lightId;

                var enabled = this.reader.getFloat(children[i], 'enabled');
                if (!(enabled != null && !isNaN(enabled)))
                    return "unable to parse enabled of the light for ID = " + lightId;

                var targetIndex = nodeNames.indexOf("target");

                // Retrieves the light target.
                var targetLight = [];
                if (targetIndex != -1) {
                    var aux = this.parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    targetLight = aux;
                }
                else
                    return "light target undefined for ID = " + lightId;

                global.push(...[angle, exponent, targetLight])
            }

            this.lights[lightId] = global;
            numLights++;
        }

        // At least a light needs to be defined but no more than 8.
        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block. 
     */
    parseTextures(texturesNode) {
        this.textures = [];
        var singleTexture = texturesNode.children;
        var atLeastOneTextureDefined = false;

        for (var i = 0; i < singleTexture.length; i++) {
            var nodeName = singleTexture[i].nodeName
            if (nodeName == "texture") {
                // Get texture ID.
                var textureID = this.reader.getString(singleTexture[i], 'id')
                if (textureID == null)
                    return "failed to parse texture ID"
                // Checks if ID is valid.
                if (this.textures[textureID] != null)
                    return "texture ID must unique (conflict with ID = " + textureID + ")"

                // Get texture path/file
                var filepath = this.reader.getString(singleTexture[i], 'file')
                if (textureID == null)
                    return "unable to parse texture file path for ID = " + textureID

                var texture = new CGFtexture(this.scene, filepath)

                this.textures[textureID] = texture
                atLeastOneTextureDefined = true
            } else
                this.onXMLMinorError("unknown tag name <" + nodeName + ">")
        }

        if (!atLeastOneTextureDefined)
            return "at least one texture must be defined in the TEXTURES block"

        console.log("Parsed textures")

        return null
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;
        this.materials = [];
        var grandChildren = [];
        var nodeNames = [];
        var atLeasOneMaterialWasDefined = false

        // Any number of materials.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(children[i], 'id');
            if (materialID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each light (conflict: ID = " + materialID + ")";

            var materialSpecs = children[i].children;
    
            for (var j = 0; j < materialSpecs.length; j++)
                nodeNames.push(materialSpecs[j].nodeName);


            // Shininess.
            var shininess = this.reader.getFloat(children[i], 'shininess');
            if (shininess == null)
                return "unable to parse shininess value for material with ID = " + materialID;
            else if (isNaN(shininess))
                return "'shininess' is a non numeric value";
            else if (shininess <= 0)
                return "'shininess' must be positive";

            // Emission component.
            var emissionIndex = nodeNames.indexOf("emission");
            if (emissionIndex == -1)
                return "no emission component defined for material with ID = " + materialID;
            var emissionComponent = [];
            // R.
            r = this.reader.getFloat(materialSpecs[emissionIndex], 'r');
            if (r == null)
                return "unable to parse R component of emission for material with ID = " + materialID;
            else if (isNaN(r))
                return "emisson 'r' is a non numeric value on the MATERIALS block";
            else if (r < 0 || r > 1)
                return "emisson 'r' must be a value between 0 and 1 on the MATERIALS block";
            emissionComponent.push(r);
            // G.
            g = this.reader.getFloat(materialSpecs[emissionIndex], 'g');
            if (g == null)
                return "unable to parse G component of emission for material with ID = " + materialID;
            if (isNaN(g))
                return "emisson 'g' is a non numeric value on the MATERIALS block";
            else if (g < 0 || g > 1)
                return "emisson 'g' must be a value between 0 and 1 on the MATERIALS block";
            emissionComponent.push(g);
            // B.
            b = this.reader.getFloat(materialSpecs[emissionIndex], 'b');
            if (b == null)
                return "unable to parse B component of emission for material with ID = " + materialID;
            else if (isNaN(b))
                return "emisson 'b' is a non numeric value on the MATERIALS block";
            else if (b < 0 || b > 1)
                return "emisson 'b' must be a value between 0 and 1 on the MATERIALS block";
            emissionComponent.push(b);
            // A.
            a = this.reader.getFloat(materialSpecs[emissionIndex], 'a');
            if (a == null)
                return "unable to parse A component of emission for material with ID = " + materialID;
            else if (isNaN(a))
                return "emisson 'a' is a non numeric value on the MATERIALS block";
            else if (a < 0 || a > 1)
                return "emisson 'a' must be a value between 0 and 1 on the MATERIALS block";
            emissionComponent.push(a);


            // Ambient component.
            var ambientIndex = nodeNames.indexOf("ambient");
            if (ambientIndex == -1)
                return "no ambient component defined for material with ID = " + materialID;
            var ambientComponent = [];
            // R.
            r = this.reader.getFloat(materialSpecs[ambientIndex], 'r');
            if (r == null)
                return "unable to parse R component of ambient reflection for material with ID = " + materialID;
            else if (isNaN(r))
                return "ambient 'r' is a non numeric value on the MATERIALS block";
            else if (r < 0 || r > 1)
                return "ambient 'r' must be a value between 0 and 1 on the MATERIALS block";
            ambientComponent.push(r);
            // G.
            g = this.reader.getFloat(materialSpecs[ambientIndex], 'g');
            if (g == null)
                return "unable to parse G component of ambient reflection for material with ID = " + materialID;
            else if (isNaN(g))
                return "ambient 'g' is a non numeric value on the MATERIALS block";
            else if (g < 0 || g > 1)
                return "ambient 'g' must be a value between 0 and 1 on the MATERIALS block";
            ambientComponent.push(g);
            // B.
            b = this.reader.getFloat(materialSpecs[ambientIndex], 'b');
            if (b == null)
                return "unable to parse B component of ambient reflection for material with ID = " + materialID;
            else if (isNaN(b))
                return "ambient 'b' is a non numeric value on the MATERIALS block";
            else if (b < 0 || b > 1)
                return "ambient 'b' must be a value between 0 and 1 on the MATERIALS block";
            ambientComponent.push(b);
            // A.
            a = this.reader.getFloat(materialSpecs[ambientIndex], 'a');
            if (a == null)
                return "unable to parse A component of ambient reflection for material with ID = " + materialID;
            else if (isNaN(a))
                return "ambient 'a' is a non numeric value on the MATERIALS block";
            else if (a < 0 || a > 1)
                return "ambient 'a' must be a value between 0 and 1 on the MATERIALS block";
            ambientComponent.push(a);

            // Diffuse component.
            var diffuseIndex = nodeNames.indexOf("diffuse");
            if (diffuseIndex == -1)
                return "no diffuse component defined for material with ID = " + materialID;
            var diffuseComponent = [];
            // R.
            r = this.reader.getFloat(materialSpecs[diffuseIndex], 'r');
            if (r == null)
                return "unable to parse R component of diffuse reflection for material with ID = " + materialID;
            else if (isNaN(r))
                return "diffuse 'r' is a non numeric value on the MATERIALS block";
            else if (r < 0 || r > 1)
                return "diffuse 'r' must be a value between 0 and 1 on the MATERIALS block";
            diffuseComponent.push(r);
            // G.
            g = this.reader.getFloat(materialSpecs[diffuseIndex], 'g');
            if (g == null)
                return "unable to parse G component of diffuse reflection for material with ID = " + materialID;
            else if (isNaN(g))
                return "diffuse 'g' is a non numeric value on the MATERIALS block";
            else if (g < 0 || g > 1)
                return "diffuse 'g' must be a value between 0 and 1 on the MATERIALS block";
            diffuseComponent.push(g);
            // B.
            b = this.reader.getFloat(materialSpecs[diffuseIndex], 'b');
            if (b == null)
                return "unable to parse B component of diffuse reflection for material with ID = " + materialID;
            else if (isNaN(b))
                return "diffuse 'b' is a non numeric value on the MATERIALS block";
            else if (b < 0 || b > 1)
                return "diffuse 'b' must be a value between 0 and 1 on the MATERIALS block";
            diffuseComponent.push(b);
            // A.
            a = this.reader.getFloat(materialSpecs[diffuseIndex], 'a');
            if (a == null)
                return "unable to parse A component of diffuse reflection for material with ID = " + materialID;
            else if (isNaN(a))
                return "diffuse 'a' is a non numeric value on the MATERIALS block";
            else if (a < 0 || a > 1)
                return "diffuse 'a' must be a value between 0 and 1 on the MATERIALS block";
            diffuseComponent.push(a);


            // Specular component.
            var specularIndex = nodeNames.indexOf("specular");
            if (specularIndex == -1)
                return "no specular component defined for material with ID = " + materialID;
            var specularComponent = [];
            // R.
            var r = this.reader.getFloat(materialSpecs[specularIndex], 'r');
            if (r == null)
                return "unable to parse R component of specular reflection for material with ID = " + materialID;
            else if (isNaN(r))
                return "specular 'r' is a non numeric value on the MATERIALS block";
            else if (r < 0 || r > 1)
                return "specular 'r' must be a value between 0 and 1 on the MATERIALS block"
            specularComponent.push(r);
            // G.
            var g = this.reader.getFloat(materialSpecs[specularIndex], 'g');
            if (g == null)
                return "unable to parse G component of specular reflection for material with ID = " + materialID;
            else if (isNaN(g))
                return "specular 'g' is a non numeric value on the MATERIALS block";
            else if (g < 0 || g > 1)
                return "specular 'g' must be a value between 0 and 1 on the MATERIALS block";
            specularComponent.push(g);
            // B.
            var b = this.reader.getFloat(materialSpecs[specularIndex], 'b');
            if (b == null)
                return "unable to parse B component of specular reflection for material with ID = " + materialID;
            else if (isNaN(b))
                return "specular 'b' is a non numeric value on the MATERIALS block";
            else if (b < 0 || b > 1)
                return "specular 'b' must be a value between 0 and 1 on the MATERIALS block";
            specularComponent.push(b);
            // A.
            var a = this.reader.getFloat(materialSpecs[specularIndex], 'a');
            if (a == null)
                return "unable to parse A component of specular reflection for material with ID = " + materialID;
            else if (isNaN(a))
                return "specular 'a' is a non numeric value on the MATERIALS block";
            else if (a < 0 || a > 1)
                return "specular 'a' must be a value between 0 and 1 on the MATERIALS block";
            specularComponent.push(a);


            // Creates material with the specified characteristics.
            var newMaterial = new CGFappearance(this.scene);
            newMaterial.setShininess(shininess);
            newMaterial.setAmbient(ambientComponent[0], ambientComponent[1], ambientComponent[2], ambientComponent[3]);
            newMaterial.setDiffuse(diffuseComponent[0], diffuseComponent[1], diffuseComponent[2], diffuseComponent[3]);
            newMaterial.setSpecular(specularComponent[0], specularComponent[1], specularComponent[2], specularComponent[3]);
            newMaterial.setEmission(emissionComponent[0], emissionComponent[1], emissionComponent[2], emissionComponent[3]);
            this.materials[materialID] = newMaterial;
            atLeasOneMaterialWasDefined = true;
        }

        if (!atLeasOneMaterialWasDefined)
            return "one or more materials need to be defined on the MATERIALS block"

        this.generateDefa

        this.log("Parsed materials");
        return null;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        var children = transformationsNode.children;

        this.transformations = [];

        var grandChildren = [];

        // Any number of transformations.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "transformation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            var transformationID = this.reader.getString(children[i], 'id');
            if (transformationID == null)
                return "no ID defined for transformation";

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null)
                return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";

            grandChildren = children[i].children;
            
            var transfMatrix = mat4.create();

            for (var j = grandChildren.length-1; j >= 0; j--) {
                switch (grandChildren[j].nodeName) {
                    case 'translate':
                        var coordinates = this.parseCoordinates3D(grandChildren[j], "translate transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates)) {
                            return coordinates;
                        }
                        transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'scale':
                        var scaleValues = this.parseCoordinates3D(grandChildren[j], "scale transformation for ID " + transformationID);                        
                        if(!Array.isArray(scaleValues)) {
                            return scaleValues;
                        }
                        transfMatrix = mat4.scale(transfMatrix, transfMatrix, scaleValues);
                        break;
                    case 'rotate':
                        var axisAngle = this.parseRotateValues(grandChildren[j], "rotate transformation for ID " + transformationID);
                        if(!Array.isArray(axisAngle)) {
                            return axisAngle;
                        }
                        transfMatrix = mat4.rotate(transfMatrix, transfMatrix, axisAngle[1], axisAngle[0]);
                        break;
                }
            }
            this.transformations[transformationID] = transfMatrix;
        }

        this.log("Parsed transformations");
        return null;
    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        var children = primitivesNode.children;

        this.primitives = [];

        var grandChildren = [];

        // Any number of primitives.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(children[i], 'id');
            if (primitiveId == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

            grandChildren = children[i].children;

            // Validate the primitive type
            if (grandChildren.length != 1 ||
                (grandChildren[0].nodeName != 'rectangle' && grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' && grandChildren[0].nodeName != 'sphere' &&
                    grandChildren[0].nodeName != 'torus') && grandChildren[0].nodeName != 'plane' && 
                    grandChildren[0].nodeName != 'patch' && grandChildren[0].nodeName != 'cylinder2') {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere or torus)"
            }

            // Specifications for the current primitive.
            var primitiveType = grandChildren[0].nodeName;

            // Retrieves the primitive coordinates
            if (primitiveType == 'rectangle') { // Rectangle
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2) && x2 > x1))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;
                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2) && y2 > y1))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                var rect = new MyRectangle(this.scene, primitiveId, x1, x2, y1, y2);

                this.primitives[primitiveId] = rect;
            }
            else if (primitiveType == 'triangle') { // Triangle
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;
                var z1 = this.reader.getFloat(grandChildren[0], 'z1');
                if (!(z1 != null && !isNaN(z1)))
                    return "unable to parse z1 of the primitive coordinates for ID = " + primitiveId;
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2) && x1 >= x2))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;
                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2) && y1 >= y2))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;
                var z2 = this.reader.getFloat(grandChildren[0], 'z2');
                if (!(z2 != null && !isNaN(z2)))
                    return "unable to parse z2 of the primitive coordinates for ID = " + primitiveId;
                var x3 = this.reader.getFloat(grandChildren[0], 'x3');
                if (!(x3 != null && !isNaN(x3) && x1 < x3))
                    return "unable to parse x3 of the primitive coordinates for ID = " + primitiveId;
                var y3 = this.reader.getFloat(grandChildren[0], 'y3');
                if (!(y3 != null && !isNaN(y3) && y1 > y3 && y3 == y2))
                    return "unable to parse y3 of the primitive coordinates for ID = " + primitiveId;
                var z3 = this.reader.getFloat(grandChildren[0], 'z3');
                if (!(z3 != null && !isNaN(z3)))
                    return "unable to parse z3 of the primitive coordinates for ID = " + primitiveId;

                var trig = new MyTriangle(this.scene, x1, y1, z1, x2, y2, z2, x3, y3, z3);

                this.primitives[primitiveId] = trig;
            }
            else if (primitiveType == 'cylinder') { // Cylinder
                 var base = this.reader.getFloat(grandChildren[0], 'base');
                 if (!(base != null && !isNaN(base)))
                     return "unable to parse base of the primitive coordinates for ID = " + primitiveId;
                 var top = this.reader.getFloat(grandChildren[0], 'top');
                 if (!(top != null && !isNaN(top)))
                     return "unable to parse top of the primitive coordinates for ID = " + primitiveId;
                 var height = this.reader.getFloat(grandChildren[0], 'height');
                 if (!(height != null && !isNaN(height)))
                     return "unable to parse height of the primitive coordinates for ID = " + primitiveId;
                 var slices = this.reader.getFloat(grandChildren[0], 'slices');
                 if (!(slices != null && !isNaN(slices)))
                     return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;
                 var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                 if (!(stacks != null && !isNaN(stacks)))
                     return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;

                 var cil = new MyCylinder(this.scene, primitiveId, base, top, height, slices, stacks);

                 this.primitives[primitiveId] = cil;
            }
            else if (primitiveType == 'sphere') { // Sphere
                var radius = this.reader.getFloat(grandChildren[0], 'radius');
                if (!(radius != null && !isNaN(radius)))
                    return "unable to parse radius of the primitive coordinates for ID = " + primitiveId;
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices!= null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;
                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks)))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;

                this.primitives[primitiveId] = new MySphere(this.scene, radius, slices, stacks);
            }else if(primitiveType == 'plane') { //Plane
                var npartsU = this.reader.getInteger(grandChildren[0], 'npartsU');
                if (!(npartsU != null && !isNaN(npartsU)))
                    return "unable to parse npartsU of the primitive coordinates for ID = " + primitiveId;
                var npartsV = this.reader.getInteger(grandChildren[0], 'npartsV');
                if (!(npartsV != null && !isNaN(npartsV)))
                    return "unable to parse npartsV of the primitive coordinates for ID = " + primitiveId;

                this.primitives[primitiveId] = new MyPlane(this.scene, npartsU, npartsV);
            }else if(primitiveType == 'patch') {
                var npointsU = this.reader.getInteger(grandChildren[0], 'npointsU');
                if (!(npointsU != null && !isNaN(npointsU)))
                    return "unable to parse radius of the primitive coordinates for ID = " + primitiveId;
                var npointsV = this.reader.getInteger(grandChildren[0], 'npointsV');
                if (!(npointsV != null && !isNaN(npointsV)))
                    return "unable to parse npointsV of the primitive coordinates for ID = " + primitiveId;
                var npartsU = this.reader.getInteger(grandChildren[0], 'npartsU');
                if (!(npartsU != null && !isNaN(npartsU)))
                    return "unable to parse npartsU of the primitive coordinates for ID = " + primitiveId;
                var npartsV = this.reader.getInteger(grandChildren[0], 'npartsV');
                if (!(npartsV != null && !isNaN(npartsV)))
                    return "unable to parse npartsV of the primitive coordinates for ID = " + primitiveId;

                var controlVertexes = [];
                var childsCVertexs = grandChildren[0].children;
                
                for(var l=0; l<childsCVertexs.length; l++) {
                    var x = this.reader.getFloat(childsCVertexs[l],'xx');
                    if (!(x != null && !isNaN(x)))
                        return "unable to parse xx of the primitive coordinates for ID = " + primitiveId;
                    var y = this.reader.getFloat(childsCVertexs[l],'yy');
                    if (!(y != null && !isNaN(y)))
                        return "unable to parse yy of the primitive coordinates for ID = " + primitiveId;
                    var z = this.reader.getFloat(childsCVertexs[l],'zz');
                    if (!(z != null && !isNaN(z)))
                        return "unable to parse zz of the primitive coordinates for ID = " + primitiveId;
                    controlVertexes.push([x, y, z, 1]);
                }
                var patch = new MyPatch(this.scene, npointsU, npointsV, npartsU, npartsV, controlVertexes);
                this.primitives[primitiveId] = patch;
            }else if(primitiveType == 'cylinder2') {
                var baseC = this.reader.getFloat(grandChildren[0], 'base');
                if (!(baseC != null && !isNaN(baseC)))
                    return "unable to parse baseC of the primitive coordinates for ID = " + primitiveId;
                var topC = this.reader.getFloat(grandChildren[0], 'top');
                if (!(topC != null && !isNaN(topC)))
                    return "unable to parse topC of the primitive coordinates for ID = " + primitiveId;
                var heigthC = this.reader.getFloat(grandChildren[0], 'heigth');
                if (!(heigthC != null && !isNaN(heigthC)))
                    return "unable to parse heigthC of the primitive coordinates for ID = " + primitiveId;
                var slicesC = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slicesC != null && !isNaN(slicesC)))
                    return "unable to parse slicesC of the primitive coordinates for ID = " + primitiveId;
                var stacksC = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacksC != null && !isNaN(stacksC)))
                    return "unable to parse stacksC of the primitive coordinates for ID = " + primitiveId;
                
                var cil2 = new MyCylinder2(this.scene, baseC, topC, heigthC, slicesC, stacksC);
                this.primitives[primitiveId] = cil2;
            }   
            else {
                console.warn("No Primitive");
            }
        }

        this.log("Parsed primitives");
        return null;
    }

    /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
    parseComponents(componentsNode) {
        var children = componentsNode.children;

        var grandChildren = [];
        var grandgrandChildren = [];
        var nodeNames = [];

        // Any number of components.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            
            // Get id of the current component.
            var componentID = this.reader.getString(children[i], 'id');
            if (componentID == null)
                return "no ID defined for componentID";

            // Checks for repeated IDs.
            if (this.components[componentID] != null)
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";
            
            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            this.components[componentID] = new MyComponent(this, componentID)

            var materialsIndex = nodeNames.indexOf("materials");
            var textureIndex = nodeNames.indexOf("texture");
            var childrenIndex = nodeNames.indexOf("children");
            var transformationIndex = nodeNames.indexOf("transformation");
             
            // Materials
            var materialArr = []
            for(j=0; j<grandChildren[materialsIndex].children.length;j++) {
                if (materialsIndex == -1)
                    return ("material must be defined for component " + componentID)
                var materialID = this.reader.getString(grandChildren[materialsIndex].children[j], 'id')
                if (materialID == null)
                    return "unable to parse material ID for component " + componentID
                if (materialID == "inherit")
                    materialID = "inherit"
                else if (materialID != "null" && this.materials[materialID] == null)
                    return "ID does not correspond to a valid material for component " + componentID


                if (j == 0) {
                    materialArr[j] = {id: materialID, active: true}
                } else {
                    materialArr[j] = {id: materialID, active: false}
                }
            }
            this.components[componentID].materialID = materialArr

            // Textures
            if (textureIndex == -1)
                return ("texture must be defined for component " + componentID)
            var textureID = this.reader.getString(grandChildren[textureIndex], 'id')
            if (textureID == null)
                return "unable to parse texture ID for component " + componentID
            if (textureID == "inherit")
                textureID = "inherit"
            else if (textureID == "none")
                textureID = "none"
            else if (textureID != "null" && textureID != "clear" && this.textures[textureID] == null)
                return "ID does not correspond to a valid texture for component " + componentID
            else {
                var lengthS = this.reader.getString(grandChildren[textureIndex], 'length_s')
                if (lengthS == null)
                    return "unable to parse lengthS on texture for component " + componentID
                var lengthT = this.reader.getString(grandChildren[textureIndex], 'length_t')
                if (lengthT == null)
                    return "unable to parse lengthT on texture for component " + componentID
            }
            this.components[componentID].texture = [textureID, lengthS, lengthT]
           

            if(transformationIndex == -1) {
                return ("transformation needs to exist for component " + componentID);
            }

            var transformationsNodes = grandChildren[transformationIndex].children;

            // Transformations
            for(j=transformationsNodes.length-1; j>=0; j--) {
                if(transformationsNodes[j].nodeName == "transformationref") {
                    var transId = this.reader.getString(transformationsNodes[j], "id");
                    
                    if (transId == null)
                        this.onXMLMinorError("unable to parse descendant id");
                    else if (transId == componentID)
                        return "a node may not be a child of its own";
                    else {
                        var transformation = this.transformations[transId];
                        mat4.multiply(this.components[componentID].transformMatrix, this.components[componentID].transformMatrix, transformation);
                    }
                } else if(transformationsNodes[j].nodeName == "translate") {
                    var coordinates = this.parseCoordinates3D(transformationsNodes[j], "translate transformation");
                    if (!Array.isArray(coordinates)) {
                        return coordinates;
                    }
                    mat4.translate(this.components[componentID].transformMatrix, this.components[componentID].transformMatrix, coordinates);
                }else if(transformationsNodes[j].nodeName == "rotate") {
                    var axisAngle = this.parseRotateValues(transformationsNodes[j], "rotate transformation" );
                    if (!Array.isArray(axisAngle)) {
                        return axisAngle;
                    }
                    mat4.rotate(this.components[componentID].transformMatrix, this.components[componentID].transformMatrix, axisAngle[1], axisAngle[0]);
                }else if(transformationsNodes[j].nodeName == "scale") {
                    var scaleValues = this.parseCoordinates3D(transformationsNodes[j], "scale transformation");
                    if (!Array.isArray(scaleValues)) {
                        return scaleValues;
                    }
                    mat4.scale(this.components[componentID].transformMatrix, this.components[componentID].transformMatrix, scaleValues);
                }else {
                    return "unexpected descendant";
                }
            }
            

            // Childrens
            if (childrenIndex == -1)
                return "an intermediate node must have descendants";

            var descendants = grandChildren[childrenIndex].children;

            var sizeChildren = 0;
            for (var j = 0; j < descendants.length; j++) {
                if (descendants[j].nodeName == "componentref") {
                    var curId = this.reader.getString(descendants[j], 'id');
                    this.log("Descendant: " + curId);

                    if (curId == null)
                        this.onXMLMinorError("unable to parse descendant id");
                    else if (curId == componentID)
                        return "a node may not be a child of its own";
                    else {
                        this.components[componentID].addChild(curId);
                        sizeChildren++;
                    }
                } else
                if (descendants[j].nodeName == "primitiveref") {
                    let currPrimitive = this.primitives[this.reader.getString(descendants[j], 'id')]

                    if (currPrimitive != null)
                        this.log("Leaf: " + currPrimitive);
                    else
                        console.warn("Error in leaf");

                    //parse leaf
                    this.components[componentID].addPrimitive(new MyPrimitive(this, currPrimitive));
                } else
                    this.onXMLMinorError("unknown tag <" + descendants[j].nodeName + ">");
                sizeChildren++;

            }
            if (sizeChildren == 0)
                return "at least one descendant must be defined for each intermediate node";
        }
    }


    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var position = [];
        var isScale = false;

        if(node.nodeName == "scale") {
            isScale = true;
        }
        
        // x
        var x = this.reader.getFloat(node, 'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        
        if(isScale && (x <= 0 || y <= 0 || z <= 0)) {
            return "scale values can't be less or equal to zero. "
        }

        position.push(...[x, y, z]);

        return position;
    }

    parseRotateValues(node, messageError) {
        
        var val = [];
        
        var axis = this.reader.getItem(node, 'axis',['x', 'y', 'z']);
        console.log(axis != null);
        if (axis == null)
            return "unable to parse axis of the " + messageError;

        if(axis == 'x') {
            axis = [1, 0, 0]
        }else if(axis == 'y') {
            axis = [0, 1, 0]
        }else if(axis = 'z') {
            axis = [0, 0, 1]
        }else {
            return "incorrect axis defined."
        }

        var angle = this.reader.getFloat(node, 'angle');
        if (angle == null && isNaN(angle))
            return "unable to parse angle of the " + messageError;
        
        
        val.push(axis);
        val.push(angle*DEGREE_TO_RAD);

        return val;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        var w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        var color = [];

        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        color.push(...[r, g, b, a]);

        return color;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
     * Starting point of displaying scene.
     * Invokes recursive displaing method passing as starting node the root.
     */
    displayScene() {
        this.displaySceneRecursive(this.idRoot, this.components[this.idRoot].materialID, this.components[this.idRoot].texture[0], this.scene.toChangeMaterial)
        this.scene.toChangeMaterial = false
    }

    /**
     * Invoked recursively for all component in the scene.
     * @param componentID - id of the component to display. 
     * @param materialParentID - id of the component's parent material.
     * @param textureParentID - id of the component's parent texture.
     * @param toChangeMaterial - true if we are in the process of changing materials due to pressing on 'M' keyboard.
     */
    displaySceneRecursive(componentID, materialParentID, textureParentID, toChangeMaterial) {
        var currComponent = this.components[componentID]
        // Component parent's material is applied by default to child.
        var materialID = materialParentID
        // Component parent's texture is applied by default to child.
        var textureID = textureParentID
        
        this.scene.multMatrix(currComponent.transformMatrix)

        var materialIndex = this.components[componentID].materialID.findIndex(obj => {
            return obj.active == true
        })
        // Verify if 'M' key was pressed to change applied material.
        // If yes, changes component's material to the next one in list.
        // If current material is the last on the list, changes to the first one.
        if (toChangeMaterial) {
            this.components[componentID].materialID[materialIndex].active = false
            materialIndex = materialIndex + 1
            if (this.components[componentID].materialID.length == materialIndex)
                materialIndex = 0       
            this.components[componentID].materialID[materialIndex].active = true
        } 

        // Verify if component was declared without material or with with "inherit" property.
        // If no, applies component's own material. 
        if (this.components[componentID].materialID[materialIndex] != null && this.components[componentID].materialID[materialIndex]  != "inherit")
            materialID = currComponent.materialID[materialIndex].id
        var currMaterial = this.materials[materialID]        
            
        // If component's texture was declared has inherit,
        // Applies parent's texture. 
        if (this.components[componentID].texture[0] == "inherit")
            var currTexture = this.textures[textureID]
        // If component's texture was declared has none
        else if (this.components[componentID].texture[0] == "none")
            var currTexture = null
        // If component's texture was declared
        // Applies that texture.
        else if (this.components[componentID].texture[0] != null) {
            textureID = currComponent.texture[0];
            var currTexture = this.textures[textureID]
        }

        // Iterates over component's primitives-children,
        // applying material and texture and displaying it. 
        for (let i=0; i<currComponent.primitives.length; i++) {
            if (currMaterial != null) 
                currMaterial.apply()

            if (currTexture != null) {
                currComponent.primitives[i].primitive.updateTexCoords(currComponent.texture[1], currComponent.texture[2])
                currTexture.bind()
            }

            currComponent.primitives[i].primitive.display()
        }

        // Iterates over component's components-children,
        // and recursively invokes current displaying method for each child. 
        for (let i=0; i<currComponent.children.length; i++) {
            this.scene.pushMatrix()
            this.displaySceneRecursive(currComponent.children[i], materialID, textureID, toChangeMaterial)
            this.scene.popMatrix()
        }
    }
}