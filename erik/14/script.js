import * as THREE from 'three'
import { COLOR, SCREEN_SIZE, HPD } from '~/utils/const'
import {
  enableFullscreenOnDoubleClick,
  enableFullViewportOnResize,
} from '~/utils/events'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js'
import matcapSrc from 'url:./textures/matcaps/4.png'

// textures
const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingManager)
const matcapTexture = textureLoader.load(matcapSrc)

// debug
const gui = new dat.GUI()

// sizes
let sizes = SCREEN_SIZE()

// scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(COLOR.BLACK)

// material
const material = new THREE.MeshStandardMaterial({ color: COLOR.RED })
material.roughness = 0
material.side = THREE.DoubleSide

// objects
const sphere = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.5, 32, 32),
  material
)
sphere.position.x = -1.5
const box = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1), material)
const torus = new THREE.Mesh(
  new THREE.TorusBufferGeometry(0.3, 0.2, 32, 32),
  material
)
torus.position.x = 1.5

const plane = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), material)
plane.rotation.x = Math.PI * 1.5
plane.position.y = -1.5
plane.position.y = -1.5
scene.add(sphere, box, torus, plane)

// light
const ambientLight = new THREE.AmbientLight(COLOR.WHITE, 0.1)
scene.add(ambientLight)
gui
.add(ambientLight, 'intensity')
.min(0)
.max(1)
.step(0.001)
.name('ambientLight')

const directionalLight = new THREE.DirectionalLight(COLOR.RED, 0.3)
directionalLight.position.set(1, 0.25, 0)
scene.add(directionalLight)
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

const hemisphereLight = new THREE.HemisphereLight(COLOR.BLUE, COLOR.YELLOW, 0.3)
gui
.add(hemisphereLight, 'intensity')
.min(0)
.max(1)
.step(0.001)
.name('hemisphereLight')
scene.add(hemisphereLight)

const pointLight = new THREE.PointLight(COLOR.PURPLE, 0.5)
pointLight.position.set(1, -1.3, 1)
gui
.add(pointLight, 'intensity')
.min(0)
.max(1)
.step(0.001)
.name('pointLight')
scene.add(pointLight)

const rectAreaLight = new THREE.RectAreaLight(COLOR.YELLOW, 0.5, 2, 2)
rectAreaLight.position.set(-1.5, -1, 1.5)
rectAreaLight.lookAt(box.position)
gui
.add(rectAreaLight, 'intensity')
.min(0)
.max(1)
.step(0.001)
.name('rectAreaLight')
scene.add(rectAreaLight)

const spotLight = new THREE.SpotLight(COLOR.WHITE, 0.5, 10, Math.PI * 0.1, 0.25, 1)
spotLight.position.set(0, 2, 3)
gui
.add(spotLight, 'intensity')
.min(0)
.max(1)
.step(0.001)
.name('spotLight')
scene.add(spotLight)

// helpers
const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2)
scene.add(hemisphereLightHelper)
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2)
scene.add(directionalLightHelper)
const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2)
scene.add(pointLightHelper)
const spotLightHelper = new THREE.SpotLightHelper(spotLight, 0.2)
scene.add(spotLightHelper)
requestAnimationFrame(() => spotLightHelper.update())
const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight, 0.2)
scene.add(rectAreaLightHelper)

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
  )
  camera.position.z = 3
camera.position.y = 0.5
camera.lookAt(box.position)
scene.add(camera)

// renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(...Object.values(sizes))
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

  sphere.rotation.y = 0.1 * t
  box.rotation.y = 0.1 * t
  torus.rotation.y = 0.1 * t
  sphere.rotation.x = 0.15 * t
  box.rotation.x = 0.15 * t
  torus.rotation.x = 0.15 * t

  controls.update()
  renderer.render(scene, camera)

  requestAnimationFrame(tick)
}
tick()
