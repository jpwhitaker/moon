import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RectAreaLightHelper }  from 'three/examples/jsm/helpers/RectAreaLightHelper.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'


import * as dat from 'lil-gui'


const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingManager)

const moonColorTexture = textureLoader.load('/moon_color.jpg')
const moonHeightTexture = textureLoader.load('/moon_height.jpg')


// const moonColorTexture2 = textureLoader.load('/lroc_color_poles_4k.jpg')
// const moonNormalMap = textureLoader.load('/ldem_16_uint.jpg')


const gui = new dat.GUI({width: 500})

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//Objects


const material = new THREE.MeshStandardMaterial()
material.map = moonColorTexture
material.aoMapIntensity = 1
// material.displacementMap = moonHeightTexture
// material.displacementScale = 0.025

// gui.add(material, 'displacementScale', 0, .1, 0.005).name("Displacement Scale")

material.bumpMap = moonHeightTexture;
material.bumpScale = 0.01
// debugger
gui.add(material, 'bumpScale', -10, 10, 0.1).name("bump Scale")

material.roughness = 1;




const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5,160, 30),
    material
)



sphere.castShadow = true;
sphere.receiveShadow = true;



scene.add(sphere)

//Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
scene.add(ambientLight)



//Create a DirectionalLight and turn on shadows for the light
const directionalLight = new THREE.DirectionalLight( 0xffffff, 3);
directionalLight.position.set( 1, 0, 0 ); //default; light shining from top
directionalLight.lookAt(new THREE.Vector3())
directionalLight.castShadow = true; // default false
scene.add( directionalLight );

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2)
// scene.add(directionalLightHelper)


//Set up shadow properties for the light
directionalLight.shadow.mapSize.width = 5000; // default
directionalLight.shadow.mapSize.height = 5000; // default
// directionalLight.shadow.camera.near = 0.5; // default
// directionalLight.shadow.camera.far = 3; // default

// directionalLight.shadowDarkness = 0.5;
directionalLight.shadow.camera.near = 0;
directionalLight.shadow.camera.far = 1.4;
directionalLight.shadow.camera.left = -0.6;
directionalLight.shadow.camera.right = 0.6;
directionalLight.shadow.camera.top = 0.6;
directionalLight.shadow.camera.bottom = -0.6;

const shadowCamera = new THREE.CameraHelper( directionalLight.shadow.camera )
// scene.add(shadowCamera)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = .8
camera.position.y = 0
camera.position.z = 1.5

scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.minDistance = 1.1

controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.physicallyCorrectLights = true

/**
 * Post processing
 */
const effectComposer = new EffectComposer(renderer)
effectComposer.setSize(sizes.width, sizes.height)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)
const unrealBloomPass = new UnrealBloomPass()
unrealBloomPass.strength = 0.265
unrealBloomPass.radius = 0.513
unrealBloomPass.threshold = 0

gui.add(unrealBloomPass, 'enabled')
gui.add(unrealBloomPass, 'strength').min(0).max(2).step(0.001)
gui.add(unrealBloomPass, 'radius').min(0).max(2).step(0.001)
gui.add(unrealBloomPass, 'threshold').min(0).max(1).step(0.001)

effectComposer.addPass(unrealBloomPass)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Update objects
    sphere.rotation.y = 0.1 * elapsedTime

    // Update controls
    controls.update()

    // Render
    // renderer.render(scene, camera)
    effectComposer.render()


    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()