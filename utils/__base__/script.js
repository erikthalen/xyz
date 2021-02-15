import * as THREE from 'three'
import { COLOR, SCREEN_SIZE, HPD } from '~/utils/const'
import {
  enableFullscreenOnDoubleClick,
  enableFullViewportOnResize,
} from '~/utils/events'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

// textures
const textureLoader = new THREE.TextureLoader()

// gui
const gui = new dat.GUI()

// sizes
let sizes = SCREEN_SIZE()

// scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(COLOR.WHITE)

// light
const ambientLight = new THREE.AmbientLight(COLOR.WHITE, 0.7)
scene.add(ambientLight)
const directionalLight = new THREE.DirectionalLight(COLOR.WHITE, 0.6)
directionalLight.position.set(0, 3, 2)
scene.add(directionalLight)

// cube
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshStandardMaterial({ color: COLOR.BLUE })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)
mesh.position.x = -1.5

const mesh2 = new THREE.Mesh(geometry, material)
scene.add(mesh2)

const mesh3 = new THREE.Mesh(geometry, material)
scene.add(mesh3)
mesh3.position.x = 1.5

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.set(-1, 2, 3)
scene.add(camera)
camera.lookAt(mesh.position)

// renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(...Object.values(sizes))
renderer.setPixelRatio(Math.min(HPD ? window.devicePixelRatio : 1, 2))
renderer.render(scene, camera)

// fullscreen on dblclick
enableFullscreenOnDoubleClick(canvas)
// keep renderer same size as viewport
enableFullViewportOnResize(camera, renderer, () => (sizes = SCREEN_SIZE()))

// controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const tick = () => {
  controls.update()
  renderer.render(scene, camera)

  requestAnimationFrame(tick)
}
tick()
