import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RectAreaLightHelper }  from 'three/examples/jsm/helpers/RectAreaLightHelper.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js'


import * as dat from 'lil-gui'


const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingManager)

const moonColorTexture = textureLoader.load('/moon_color.jpg')
const moonHeightTexture = textureLoader.load('/moon_height.jpg')


// const moonColorTexture2 = textureLoader.load('/lroc_color_poles_4k.jpg')
// const moonNormalMap = textureLoader.load('/ldem_16_uint.jpg')


const gui = new dat.GUI()
gui.close()

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
gui.add(material, 'bumpScale', 0, .1, 0.001).name("Bump Scale")

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

gui.add(ambientLight, 'intensity', 0, 3, 0.05).name("Ambient Light Intensity")



//Create a DirectionalLight and turn on shadows for the light
const directionalLight = new THREE.DirectionalLight( 0xffffff, 3);
directionalLight.position.set( 0, 0, 1.5 ); //default; light shining from top
directionalLight.lookAt(new THREE.Vector3())
directionalLight.castShadow = true; // default false
scene.add( directionalLight );

gui.add(directionalLight, 'intensity', 0, 6, 0.05).name("Directional Light Intensity")

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2)
// scene.add(directionalLightHelper)


//Set up shadow properties for the light
directionalLight.shadow.mapSize.width = 5000; // default
directionalLight.shadow.mapSize.height = 5000; // default


directionalLight.shadow.camera.near = 0;
directionalLight.shadow.camera.far = 1.4;
directionalLight.shadow.camera.left = -0.6;
directionalLight.shadow.camera.right = 0.6;
directionalLight.shadow.camera.top = 0.6;
directionalLight.shadow.camera.bottom = -0.6;


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
camera.position.x = 0
camera.position.y = 0
camera.position.z = -1.5
camera.lookAt(sphere.position); // or camera.lookAt(0, 0, 0);
// directionalLight.position.copy( camera.position );

scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.minDistance = 1.1

controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas, 
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.physicallyCorrectLights = true

//makes shit look weird
// renderer.outputEncoding = THREE.sRGBEncoding
//makes it dull
// renderer.toneMapping = THREE.ReinhardToneMapping
// renderer.toneMappingExposure = 1.5
renderer.setSize(sizes.width, sizes.height)
renderer.setClearColor(new THREE.Color(0x000000))
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Post processing
 */
let RenderTargetClass = null

if(renderer.getPixelRatio() === 1 && renderer.capabilities.isWebGL2)
{
    RenderTargetClass = THREE.WebGLMultisampleRenderTarget
    console.log('Using WebGLMultisampleRenderTarget')
}
else
{
    RenderTargetClass = THREE.WebGLRenderTarget
    console.log('Using WebGLRenderTarget')
}

const renderTarget = new RenderTargetClass(
    800,
    600,
    {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
    }
)

// Effect composer

const effectComposer = new EffectComposer(renderer, renderTarget)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
effectComposer.setSize(sizes.width, sizes.height)


// Render pass

const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)

// Gamma correction pass
const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader)
// effectComposer.addPass(gammaCorrectionPass)

// Antialias pass
if(renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2)
{
    const smaaPass = new SMAAPass()
    effectComposer.addPass(smaaPass)

    console.log('Using SMAA')
}

const unrealBloomPass = new UnrealBloomPass()
effectComposer.addPass(unrealBloomPass)

unrealBloomPass.strength = 0.265
unrealBloomPass.radius = 0.513
unrealBloomPass.threshold = 0

gui.add(unrealBloomPass, 'enabled').name('Bloom Enabled')
gui.add(unrealBloomPass, 'strength').min(0).max(2).step(0.001).name('Bloom Strength')
gui.add(unrealBloomPass, 'radius').min(0).max(2).step(0.001).name('Bloom Radius')
gui.add(unrealBloomPass, 'threshold').min(0).max(1).step(0.001).name('Bloom Threshold')


/**
 * Moon Phases
 */

 const Moon = {
   phases: ['new-moon', 'waxing-crescent-moon', 'quarter-moon', 'waxing-gibbous-moon', 'full-moon', 'waning-gibbous-moon', 'last-quarter-moon', 'waning-crescent-moon'],
   phase: function (year, month, day) {
     let c = 0;
     let e = 0;
     let jd = 0;
     let b = 0;

     if (month < 3) {
       year--;
       month += 12;
     }

     ++month;
     c = 365.25 * year;
     e = 30.6 * month;
     jd = c + e + day - 694039.09; // jd is total days elapsed
     jd /= 29.5305882; // divide by the moon cycle
     b = parseInt(jd); // int(jd) -> b, take integer part of jd
     jd -= b; // subtract integer part to leave fractional part of original jd
     b = Math.round(jd * 8); // scale fraction from 0-8 and round

     if (b >= 8) b = 0; // 0 and 8 are the same so turn 8 into 0

     return {phase: b, name: Moon.phases[b], };
   }
 };

 const today = new Date();
 const phase = Moon.phase(today.getFullYear(), today.getMonth()+1, today.getDate());

 console.log(phase)


 console.log((2 * Math.PI) / phase.phase)

const thetaCalc = function(num){
    return ((2 * Math.PI) * num)
}

 // const rotation = {"theta": 0}
 const rotation = {
    "theta": (Math.PI) / phase.phase,
    "new-moon": function(){
        this.theta = 0
        console.log(this.theta)
        camera.position.x =  x * Math.cos(rotation.theta) + z * Math.sin(rotation.theta);
        camera.position.z =  z * Math.cos(rotation.theta) - x * Math.sin(rotation.theta);
    },
    "waxing-crescent-moon": function(){
        this.theta = thetaCalc(1.5/8)
        console.log(this.theta)
        camera.position.x =  x * Math.cos(rotation.theta) + z * Math.sin(rotation.theta);
        camera.position.z =  z * Math.cos(rotation.theta) - x * Math.sin(rotation.theta);
    },
    "quarter-moon": function(){
        this.theta = thetaCalc(2/8)
        console.log(this.theta)
        camera.position.x =  x * Math.cos(rotation.theta) + z * Math.sin(rotation.theta);
        camera.position.z =  z * Math.cos(rotation.theta) - x * Math.sin(rotation.theta);
    },
    "waxing-gibbous-moon": function(){
        this.theta = thetaCalc(3/8)
        console.log(this.theta)
        camera.position.x =  x * Math.cos(rotation.theta) + z * Math.sin(rotation.theta);
        camera.position.z =  z * Math.cos(rotation.theta) - x * Math.sin(rotation.theta);
    },
    "full-moon": function(){
        this.theta = thetaCalc(4/8)
        console.log(this.theta)
        camera.position.x =  x * Math.cos(rotation.theta) + z * Math.sin(rotation.theta);
        camera.position.z =  z * Math.cos(rotation.theta) - x * Math.sin(rotation.theta);
    },
    "waning-gibbous-moon": function(){
        this.theta = thetaCalc(5/8)
        console.log(this.theta)
        camera.position.x =  x * Math.cos(rotation.theta) + z * Math.sin(rotation.theta);
        camera.position.z =  z * Math.cos(rotation.theta) - x * Math.sin(rotation.theta);
    },
    "last-quarter-moon": function(){
        this.theta = thetaCalc(6/8)
        console.log(this.theta)
        camera.position.x =  x * Math.cos(rotation.theta) + z * Math.sin(rotation.theta);
        camera.position.z =  z * Math.cos(rotation.theta) - x * Math.sin(rotation.theta);
    },
    "waning-crescent-moon": function(){
        this.theta = thetaCalc(6.5/8)
        console.log(this.theta)
        camera.position.x =  x * Math.cos(rotation.theta) + z * Math.sin(rotation.theta);
        camera.position.z =  z * Math.cos(rotation.theta) - x * Math.sin(rotation.theta);
    },
    "today": function(){
        
        this.theta = thetaCalc(phase.phase/8)
        console.log(this.theta)
        camera.position.x =  x * Math.cos(rotation.theta) + z * Math.sin(rotation.theta);
        camera.position.z =  z * Math.cos(rotation.theta) - x * Math.sin(rotation.theta);
    }
}
 
 gui.add(rotation, "new-moon")
 gui.add(rotation, "waxing-crescent-moon")
 gui.add(rotation, "quarter-moon")
 gui.add(rotation, "waxing-gibbous-moon")
 gui.add(rotation, "full-moon")
 gui.add(rotation, "waning-gibbous-moon")
 gui.add(rotation, "last-quarter-moon")
 gui.add(rotation, "waning-crescent-moon")
 gui.add(rotation, "today")
 // gui.add(rotation, "theta", 0, 10, .01)
 

 var x = camera.position.x;
 var z = camera.position.z;

    camera.position.x =  x * Math.cos(rotation.theta) + z * Math.sin(rotation.theta);
    camera.position.z =  z * Math.cos(rotation.theta) - x * Math.sin(rotation.theta);


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Update objects
    sphere.rotation.y = 0.1 * elapsedTime
    // let theta be the amount you want to rotate by

    // camera.lookAt(sphere.position); // or camera.lookAt(0, 0, 0);

    // Update controls
    controls.update()

    // Render
    // renderer.render(scene, camera)
    effectComposer.render()


    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()