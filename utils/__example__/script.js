import * as THREE from 'three'
import { COLOR, SCREEN_SIZE, HPD } from '~/utils/const'
import { enableFullscreen, keepFullscreen } from '~/utils/events'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import * as dat from 'dat.gui'

// sizes
let sizes = SCREEN_SIZE()

// scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(COLOR.WHITE)

// red cube
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: COLOR.RED })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.z = 3
scene.add(camera)
camera.lookAt(mesh.position)

// renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(...Object.values(sizes))
renderer.setPixelRatio(Math.min(HPD ? window.devicePixelRatio : 1, 2))
renderer.render(scene, camera)

// fullscreen on dblclick
enableFullscreen(canvas)
// keep renderer same size as viewport
keepFullscreen(camera, renderer, () => (sizes = SCREEN_SIZE()))

// controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const tick = () => {
  controls.update()
  renderer.render(scene, camera)

  requestAnimationFrame(tick)
}
tick()
