import { CGFapplication } from '../lib/CGF.js';
import { XMLscene } from './XMLScene.js';
import { MyInterface } from './MyInterface.js';
import { MySceneGraph } from './graph/MySceneGraph.js';
import { MySVGReader } from './MySVGReader.js';

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
    function(m,key,value) {
      vars[decodeURIComponent(key)] = decodeURIComponent(value);
    });
    return vars;
}	 

function main() {

	// Standard application, scene and interface setup
    var app = new CGFapplication(document.body);
    var myInterface = new MyInterface();
    var myScene = new XMLscene(myInterface);

    app.init();

    app.setScene(myScene);
    app.setInterface(myInterface);

    myInterface.setActiveCamera(myScene.camera);
	
    var filename=getUrlVars()['file'] || "GameScene.xml";
    var svgFilename = getUrlVars()['file'] || "NewTrack.svg";

	// create and load graph, and associate it to scene. 
	// Check console for loading errors
    var myGraph = new MySceneGraph(filename, myScene);
    var svgParser = new MySVGReader(svgFilename, myScene);
	
	// start
    app.run();
}

main();
