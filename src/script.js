import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RectAreaLightHelper }  from 'three/examples/jsm/helpers/RectAreaLightHelper.js'

import * as dat from 'lil-gui'


const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingManager)

const doorColorTexture = textureLoader.load('/moon_color.jpg')


const doorHeightTexture = textureLoader.load('/moon_height.jpg')


const gui = new dat.GUI({width: 500})

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//Objects
// const material = new THREE.MeshBasicMaterial()
// material.map = doorColorTexture
// material.transparent = true
// material.alphaMap = doorAlphaTexture
// material.side = THREE.DoubleSide

// const material = new THREE.MeshNormalMaterial()

// const material = new THREE.MeshMatcapMaterial()
// material.matcap = matcapTexture

// const material = new THREE.MeshDepthMaterial()

// const material = new THREE.MeshLambertMaterial()

// const material = new THREE.MeshPhongMaterial()
// material.shininess = 100

// const material = new THREE.MeshToonMaterial()
// material.gradientMap = gradientTexture

const material = new THREE.MeshStandardMaterial()
material.map = doorColorTexture
// material.aoMapIntensity = 1
material.displacementMap = doorHeightTexture
material.displacementScale = 0.02
// material.metalnessMap = doorMetalnessTexture
// material.roughnessMap = doorRoughnessTexture

// material.metalness = 0;
material.roughness = 1;




const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 3000, 3000),
    material
)

sphere.castShadow = true;
sphere.receiveShadow = true;

// sphere.geometry.setAttribute(
//     'uv2',
//     new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2)
// )



// const plane = new THREE.Mesh(
//     new THREE.PlaneGeometry(1, 1, 200, 200),
//     material
// )

// plane.geometry.setAttribute(
//     'uv2',
//     new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2)
// )

// const torus = new THREE.Mesh(
//     new THREE.TorusGeometry(0.3, 0.2, 64, 128),
//     material
// )
// torus.position.x = 1.5
// torus.geometry.setAttribute(
//     'uv2',
//     new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2)
// )

scene.add(sphere)

//Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
scene.add(ambientLight)

// const pointLight = new THREE.PointLight(0xffffff, 1.5)
// pointLight.position.x = 2
// pointLight.position.y = 3
// pointLight.position.z = 4
// scene.add(pointLight)

// const spotLight = new THREE.SpotLight(0xffffff, 6, 3, 0.3)
// spotLight.castShadow = true
// spotLight.shadow.mapSize.width = 10000
// spotLight.shadow.mapSize.height = 10000
// spotLight.position.set(2, 2, 0)
// spotLight.target.position.x = 0
// spotLight.target.position.y = 0
// spotLight.target.position.z = 0
// scene.add(spotLight.target)

// const spotLightHelper = new THREE.SpotLightHelper( spotLight );
// scene.add( spotLightHelper );

// window.requestAnimationFrame(() => {
//     spotLightHelper.update()
// }) 

// scene.add(spotLight)

// gui.add(spotLight, 'angle', 0, 50, 0.001)
//     .name("Spotlight Angle")



//Create a DirectionalLight and turn on shadows for the light
const directionalLight = new THREE.DirectionalLight( 0xffffff, 3);
directionalLight.position.set( 1, 0, 0 ); //default; light shining from top
directionalLight.lookAt(new THREE.Vector3())
directionalLight.castShadow = true; // default false
scene.add( directionalLight );

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2)
// scene.add(directionalLightHelper)


//Set up shadow properties for the light
directionalLight.shadow.mapSize.width = 100000; // default
directionalLight.shadow.mapSize.height = 100000; // default
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

// gui.add(directionalLight.shadow.mapSize, 'width', 2000, 100000, 100)
//     .name("Directional Light Shadow Map Size Width")

// gui.add(directionalLight.shadow.mapSize, 'height', 2000, 100000, 100)
//     .name("Directional Light Shadow Map Size Height")

// gui.add(directionalLight, 'shadowDarkness', 0, 100, 1)
//     .name("shadow darkness")

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
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
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
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Update objects
    sphere.rotation.y = 0.1 * elapsedTime
    // plane.rotation.y = 0.1 * elapsedTime
    // torus.rotation.y = 0.1 * elapsedTime

    // sphere.rotation.x = 0.15 * elapsedTime
    // plane.rotation.x = 0.15 * elapsedTime
    // torus.rotation.x = 0.15 * elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()