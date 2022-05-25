/******************************************************************************
 * File: project-three.js                                                     *
 * Author: Dylan Bryan                                                        *
 * Date: 6/7/21, 8:53 AM                                                      *
 * Project: project-three                                                     *
 * Purpose: Main JavaScript file which controls all the animation             *
 ******************************************************************************/
"use strict";

let scene, camera, renderer;  // Three.js rendering basics.
let canvas;  // The canvas on which the image is rendered.
let model;   // Contains the visible objects in the scene, but
             // not the lights or camera.  The model can be
             // rotated using the keyboard.
let parentSphereRotation; // rotation of all the spheres
const totalSpheres = []; // array of spheres created
let animating = false;  // This is set to true when an animation is running.
let counter = 0; // counter for animation

function changePosition(object, x, y, z) {
    object.position.x = x;
    object.position.y = y;
    object.position.z = z;
} // end changePosition method

function changeRotation(object, x, y, z) {
    object.rotation.x = x;
    object.rotation.y = y;
    object.rotation.z = z;
} // end changeRotation method

/*  Create the scene graph.  This function is called once, as soon as the page loads.
 *  The renderer has already been created before this function is called.
 */
function createWorld() {
    const sceneColors = {
        red: { color: 0x941717 },
        yellow: { color: 0xF2DB32 },
        white: { color: 0xFFFFFF },
        black: { color: 0x000000 },
        gray: { color: 0x999999 },
    }
    renderer.setClearColor( 0x444444 );  // Set background color (0x444444 is dark gray).
    scene = new THREE.Scene();

    // create a camera, sitting on the positive z-axis.  The camera is not part of the scene.
    camera = new THREE.PerspectiveCamera(45, canvas.width/canvas.height, 1, 30);
    camera.position.z = 15;

    // create some lights and add them to the scene.
    scene.add( new THREE.DirectionalLight( 0xffffff, 0.4 ) ); // dim light shining from above
    let viewpointLight = new THREE.DirectionalLight( 0xffffff, 0.8 );  // a light to shine in the direction the camera faces
    viewpointLight.position.set(0,0,1);  // shines down the z-axis
    scene.add(viewpointLight);

    // create the model
    model = new THREE.Object3D();
    parentSphereRotation = new THREE.Object3D();
    for (let i = -11; i < 11; i+=3) {
        let sphere;
        if (i % 2 === 0) {
            sphere = new THREE.Mesh(
                new THREE.SphereGeometry(1, 32, 16),
                new THREE.MeshPhongMaterial({
                    color: sceneColors.red.color,
                    specular: 0x101010,
                    shininess: 32
                })
            )
        } else {
            sphere = new THREE.Mesh(
                new THREE.SphereGeometry(1, 32, 16),
                new THREE.MeshPhongMaterial({
                    color: sceneColors.black.color,
                    specular: 0x101010,
                    shininess: 32
                })
            )
        }
        totalSpheres.push(sphere);
        parentSphereRotation.add(sphere);
        changePosition(sphere, i, 0,  0);
    } // end for loop
    model.add(parentSphereRotation);

    model.rotation.set(0.2,0,0); // Tip it forward a bit, so we're not looking at it edge-on.

    scene.add(model);
}

/*  Render the scene.  This is called for each frame of the animation.
 */
function render() {
    renderer.render(scene, camera);
}

function changeSpherePositionPositive(array, distance) {
    for (let i = 0; i < array.length; i++) {
        if (i % 2 === 0) {
            array[i].position.y += distance;
            array[i].position.z += distance;
        } else {
            array[i].position.y -= distance;
            array[i].position.z -= distance;
        }
    } // end for loop
}

function changeSpherePositionNegative(array, distance) {
    for (let i = 0; i < array.length; i++) {
        if (i % 2 === 0) {
            array[i].position.y -= distance;
            array[i].position.z -= distance;
        } else {
            array[i].position.y += distance;
            array[i].position.z += distance;
        }
    } // end for loop
}

/*  When an animation is in progress, this function is called just before rendering each
 *  frame of the animation, to make any changes necessary in the scene graph to prepare
 *  for that frame.
 */
function updateForFrame() {
    const spheresToAdjust = [
        totalSpheres[0],
        totalSpheres[1],
        totalSpheres[2],
        totalSpheres[totalSpheres.length - 1],
        totalSpheres[totalSpheres.length - 2],
        totalSpheres[totalSpheres.length - 3],
    ];
    parentSphereRotation.rotation.y += 0.03;
    parentSphereRotation.rotation.z += 0.001;
    counter++;
    if (counter < 125) {
        changeSpherePositionPositive(spheresToAdjust, 0.02);
    } else if (counter >= 125 && counter < 250) {
        changeSpherePositionNegative(spheresToAdjust, 0.02);
    } else {
        counter = 0;
    } // end if/else if statement
}

//--------------------------- animation support -----------------------------------

/* This function runs the animation by calling updateForFrame() then calling render().
 * Finally, it arranges for itself to be called again to do the next frame.  When the
 * value of animating is set to false, this function does not schedule the next frame,
 * so the animation stops.
 */
function doFrame() {
    if (animating) {
        updateForFrame();
        render();
        requestAnimationFrame(doFrame);
    }
}

/* Responds when the setting of the "Animate" checkbox is changed.  This
 * function will start or stop the animation, depending on its setting.
 */
function doAnimateCheckbox() {
    const anim = document.getElementById("animate").checked;
    if (anim != animating) {
        animating = anim;
        if (animating) {
            doFrame();
        }
    }
}

//----------------------------- keyboard support ----------------------------------

/*  Responds to user's key press.  Here, it is used to rotate the model.
 */
function doKey(event) {
    let code = event.keyCode;
    let rotated = true;
    switch( code ) {
        case 37: model.rotation.y -= 0.03;  break;    // left arrow
        case 39: model.rotation.y +=  0.03; break;    // right arrow
        case 38: model.rotation.x -= 0.03;  break;    // up arrow
        case 40: model.rotation.x += 0.03;  break;    // down arrow
        case 33: model.rotation.z -= 0.03;  break;    // page up
        case 34: model.rotation.z += 0.03;  break;    // page down
        case 36: model.rotation.set(0.2,0,0); break;  // home
        default: rotated = false;
    }
    if (rotated) {
        event.preventDefault();  // Prevent keys from scrolling the page.
        if (!animating) { // (if an animation is running, no need for an extra render)
            render();
        }
    }
}

//----------------------------------------------------------------------------------

/**
 *  This init() function is called when by the onload event when the document has loaded.
 */
function init() {
    try {
        canvas = document.getElementById("glcanvas");
        canvas.setAttribute("width", window.innerWidth);
        canvas.setAttribute("height", window.innerHeight - 100);
        renderer = new THREE.WebGLRenderer( {
            canvas: canvas,
            antialias: true
        } );
    } catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<h3><b>Sorry, WebGL is required but is not available.</b><h3>";
        return;
    }
    document.addEventListener("keydown", doKey, false);
    document.getElementById("animate").checked = false;
    document.getElementById("animate").onchange = doAnimateCheckbox;
    createWorld();
    render();
}
