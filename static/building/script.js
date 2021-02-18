import * as THREE from './building/build/three.module.js';

import Stats from './building/libs/stats.module.js';

import { GUI } from './building/libs/dat.gui.module.js';
import { OrbitControls } from './building/OrbitControls.js';


let wireframe, renderer, scene, camera, camera2, controls;
let wireframe1;
let matLine, matLineBasic, matLineDashed;
let stats;
//let gui;
let factor = .8;
let plane;
let mouse, raycaster, isShiftDown = false;
let isMouseDown = false;
let rollOverMesh, rollOverMaterial;
let cubeGeo, cubeMaterial;
// viewport
let insetWidth;
let insetHeight;

let colorValueLarge = "#ffae23";
const objects = [];
const voxels = [];
var mouseRepte;
let placespeed = 150;
let rollOverGeo;

let boxDem= [1,1];
let canvas;
let offset;
init();
var gui = new GUI();

var conf = { color : '#ffae23' };    
gui.addColor(conf, 'color').onChange( function(colorValue) {
    colorValueLarge = colorValue;
});
/*
gui.add( {"Voxel Width": 1}, 'Voxel Width', 1, 4 ).onChange( function (val) {
	boxDem[0] = val;
	console.log(rollOverMesh.geometry.parameters)

	rollOverGeo = new THREE.BoxGeometry( 50*boxDem[0], 50, 50*boxDem[1] );
	rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
	rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
	scene.add( rollOverMesh );
}).step(1);

gui.add( {"Voxel Length": 1}, 'Voxel Length', 1, 4 ).onChange( function (val) {
	boxDem[1] = val;
	rollOverMesh.geometry.parameters.depth = 50*val;
}).step(1);*/

animate();



function init() {

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth * factor, window.innerHeight * factor );
	var renderDiv = document.getElementById("renderContainer");
	renderDiv.appendChild( renderer.domElement );


	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xf0f0f0 );

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth * factor / window.innerHeight * factor, 1, 10000 );

	camera.position.set( 500, 1600, 0 );
	camera.lookAt( 0, 0, 0 );
	
	controls = new OrbitControls( camera, renderer.domElement );
	controls.minDistance = 300;
	controls.maxDistance = 2000;

	// roll-over helpers

	rollOverGeo = new THREE.BoxGeometry( 62.5, 62.5, 62.5 );
	rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
	rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
	scene.add( rollOverMesh );

	// cubes

	cubeGeo = new THREE.BoxGeometry( 62.5, 62.5, 62.5 );
	cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
	// grid

	const gridHelper = new THREE.GridHelper( 1000, 16 );
	scene.add( gridHelper );

	// lights

	const ambientLight = new THREE.AmbientLight( 0x606060 );
	scene.add( ambientLight );

	const directionalLight = new THREE.DirectionalLight( 0xffffff );
	directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
	scene.add( directionalLight );

	//
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();
	const geometry = new THREE.PlaneGeometry( 1000, 1000 );
	geometry.rotateX( - Math.PI / 2 );

	plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: false } ) );
	scene.add( plane );

	objects.push( plane );



	document.addEventListener( 'mousemove', onDocumentMouseMove );
	document.addEventListener( 'mousedown', onMouseDown );
	document.addEventListener( 'mouseup', onMouseUp );
	document.addEventListener( 'keydown', onDocumentKeyDown );
	document.addEventListener( 'keyup', onDocumentKeyUp );

	//
	canvas = document.querySelector('canvas');
	window.addEventListener( 'resize', onWindowResize );
	onWindowResize();

	stats = new Stats();
	document.body.appendChild( stats.dom );

	//initGui();
	
}

function onWindowResize() {

	factor = 0.8; // percentage of the screen
	var w = window.innerWidth * factor;
	var h = window.innerHeight * factor;
	renderer.setSize(w, h);
	camera.aspect = w / h;
	camera.updateProjectionMatrix();


	offset = getMousePos(canvas, window.event);

	
}


//
function animate() {
	//
	
	requestAnimationFrame( animate );

	stats.update();

	// main scene


	renderer.setViewport( 0, 0, window.innerWidth * factor, window.innerHeight * factor );

	
	// renderer will set this eventually

	renderer.render( scene, camera );
	
}

function getMousePos(scene, evt) {
	console.log("asdf")
	var rect = scene.getBoundingClientRect();
	return {
		x: rect.left,
		y: rect.top
	};
}

function onDocumentMouseMove( event ) {
	
	event.preventDefault();
	
	mouse.set( ( (event.clientX-offset["x"]) / (window.innerWidth * factor) ) * 2 - 1, - ( (event.clientY-offset["y"]) / (window.innerHeight * factor) ) * 2 + 1 );
	raycaster.setFromCamera( mouse, camera );
	const intersects = raycaster.intersectObjects( objects );

	if ( intersects.length > 0 ) {

		const intersect = intersects[ 0 ];

		rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
		rollOverMesh.position.divideScalar( 62.5 ).floor().multiplyScalar( 62.5 ).addScalar( 31.25 );

	}
	
	
}
function findObjectByKey(array, key, value) {
	for (var i = 0; i < array.length; i++) {
		if (array[i][key].toString() == value.toString()) {
			return i;
		}
	}
	return null;
}
function onMouseDown( event ) {
	if(event.button == 0){
		//event.preventDefault();
		isMouseDown = true;
		console.log(isMouseDown);
		mouse.set( ( (event.clientX-offset["x"]) / (window.innerWidth * factor) ) * 2 - 1, - ( (event.clientY-offset["y"]) / (window.innerHeight * factor) ) * 2 + 1 );
		placeOrDelete();
		setTimeout(placeOrDelete, 400);
		
		//mouseRepte = setInterval(placeOrDelete, 150);			
	}
}


function placeOrDelete() {
	if(isMouseDown){

		raycaster.setFromCamera( mouse, camera );

		const intersects = raycaster.intersectObjects( objects );

		if ( intersects.length > 0 ) {

			const intersect = intersects[ 0 ];

			// delete cube

			if ( isShiftDown ) {
				placespeed = 30;
				if ( intersect.object !== plane ) {

					scene.remove( intersect.object );

					objects.splice( objects.indexOf( intersect.object ), 1 );


					let pos = intersect.object.position;
					
					voxels.splice(findObjectByKey(voxels, 'position', pos),1);

				}

				// create cube

			} else {
				placespeed = 130;
				cubeGeo = new THREE.BoxGeometry( 62.5*boxDem[0], 62.5, 62.5*boxDem[1] );
				const voxel = new THREE.Mesh( cubeGeo, new THREE.MeshLambertMaterial( { color: colorValueLarge } ) );
				
				voxel.position.copy( intersect.point ).add( intersect.face.normal );
				voxel.position.divideScalar( 62.5 ).floor().multiplyScalar( 62.5).addScalar( 31.25 );

				

				scene.add( voxel );
				objects.push( voxel );

				voxels.push({"position":( intersect.point ).add( intersect.face.normal ).divideScalar( 62.5 ).floor().multiplyScalar( 62.5).addScalar( 31.25 ),"color":colorValueLarge})

				console.log(voxels)
			}
			
			
		}
		setTimeout(placeOrDelete, placespeed);
	}
}


function onMouseUp( event ) {
	if(event.button == 0){
		isMouseDown = false;
		clearInterval(mouseRepte);
		console.log(isMouseDown)
	}
}


function onDocumentKeyDown( event ) {

	switch ( event.keyCode ) {

		case 16: isShiftDown = true; break;

	}

}

function onDocumentKeyUp( event ) {
	switch ( event.keyCode ) {

		case 16: isShiftDown = false; break;

	}

}

