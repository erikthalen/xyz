import * as THREE from 'three'
import { COLOR, SCREEN_SIZE, HPD } from '~/utils/const'
import {
  enableFullscreenOnDoubleClick,
  enableFullViewportOnResize,
} from '~/utils/events'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import shadowSrc from 'url:./textures/bakedShadow.jpg'
import shadowSrc2 from 'url:./textures/simpleShadow.jpg'

// textures
const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingManager)
const shadowTexture = textureLoader.load(shadowSrc)
const shadowTexture2 = textureLoader.load(shadowSrc2)

// debug
const gui = new dat.GUI()

// sizes
let sizes = SCREEN_SIZE()

// scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(COLOR.BLACK)

// material
const material = new THREE.MeshStandardMaterial({ color: COLOR.WHITE })
material.roughness = 0
material.side = THREE.DoubleSide

// objects
const box = new THREE.Mesh(new THREE.SphereBufferGeometry(0.5, 64, 64), material)
box.castShadow = true

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  // new THREE.MeshBasicMaterial({ map: shadowTexture })
  material
)
plane.rotation.x = - Math.PI * 1.5
plane.position.y = -0.5
plane.receiveShadow = true

const sphereShadow = new THREE.Mesh(
  new THREE.PlaneGeometry(1.5, 1.5),
  new THREE.MeshBasicMaterial({
    color: COLOR.BLACK,
    transparent: true,
    alphaMap: shadowTexture2,
  })
)
sphereShadow.rotation.x = Math.PI * 1.5
sphereShadow.position.y = plane.position.y + 0.01

scene.add(box, plane, sphereShadow)

// light
const ambientLight = new THREE.AmbientLight(COLOR.WHITE, 0.1)
scene.add(ambientLight)
gui
.add(ambientLight, 'intensity')
.min(0)
.max(1)
.step(0.001)
.name('ambientLight')

const directionalLight = new THREE.DirectionalLight(COLOR.ORANGE, 0.1)
directionalLight.position.set(3, 3, -1)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.width = 1024
directionalLight.shadow.mapSize.height = 1024
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 10
directionalLight.shadow.camera.top = 2
directionalLight.shadow.camera.right = 2
directionalLight.shadow.camera.left = -2
directionalLight.shadow.camera.bottom = -2
scene.add(directionalLight)
const directionalLightCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
)
directionalLightCameraHelper.visible = false
scene.add(directionalLightCameraHelper)
gui
.add(directionalLightCameraHelper, 'visible')
.name('directionalLightCameraHelper')

gui
.add(directionalLight, 'intensity')
.min(0)
.max(1)
.step(0.001)
.name('directionalLight')
gui
.add(directionalLight.position, 'x')
.min(-1)
  .max(1)
  .step(0.001)
  .name('directionalLight x')
  
  const pointLight = new THREE.PointLight(COLOR.WHITE, 0.3)
  pointLight.position.set(-1, 1, 0)
  pointLight.castShadow = true
  pointLight.shadow.mapSize.width = 1024
  pointLight.shadow.mapSize.height = 1024
  pointLight.shadow.camera.near = 0.1
  pointLight.shadow.camera.far = 8
  gui.add(pointLight, 'intensity').min(0).max(1).step(0.001).name('pointLight')
scene.add(pointLight)
const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
pointLightCameraHelper.visible = false
scene.add(pointLightCameraHelper)
gui.add(pointLightCameraHelper, 'visible').name('pointLightCameraHelper')

const spotLight = new THREE.SpotLight(COLOR.WHITE, 0.4, 10, Math.PI * 0.3)
spotLight.position.set(0, 2, 2)
spotLight.castShadow = true
spotLight.shadow.mapSize.width = 1024
spotLight.shadow.mapSize.height = 1024
spotLight.shadow.camera.fov = 30
spotLight.shadow.camera.near = 1
spotLight.shadow.camera.far = 7
gui.add(spotLight, 'intensity').min(0).max(1).step(0.001).name('spotLight')
const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera)
spotLightCameraHelper.visible = false
scene.add(spotLightCameraHelper)
scene.add(spotLight)
gui.add(spotLightCameraHelper, 'visible').name('spotLightCameraHelper')

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
  )
  camera.position.z = 3
  scene.add(camera)
  
  // renderer
  const canvas = document.querySelector('.webgl')
  const renderer = new THREE.WebGLRenderer({ canvas })
  renderer.setSize(...Object.values(sizes))
  renderer.shadowMap.enabled = false
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setPixelRatio(Math.min(HPD ? window.devicePixelRatio : 1, 2))
  renderer.render(scene, camera)
  
  enableFullscreenOnDoubleClick(canvas)
  enableFullViewportOnResize(camera, renderer, () => (sizes = SCREEN_SIZE()))
  
  // controls
  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  
  const clock = new THREE.Clock()
  
  const tick = () => {
    const t = clock.getElapsedTime()
    
    box.rotation.y = 0.1 * t
    box.rotation.x = 0.15 * t
    
    box.position.x = Math.cos(t) * 1.5
    box.position.z = Math.sin(t) * 1.5
    box.position.y = Math.abs(Math.sin(t * 3))
    sphereShadow.position.x = box.position.x
    sphereShadow.position.z = box.position.z
    sphereShadow.material.opacity = (1 - box.position.y) * 0.4
    
    controls.update()
    renderer.render(scene, camera)
    
  requestAnimationFrame(tick)
}
tick()
