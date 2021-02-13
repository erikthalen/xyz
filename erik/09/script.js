import * as THREE from 'three'
import { COLOR, SCREEN_SIZE, HPD } from '~/utils/const'
import { keepFullscreen } from '~/utils/events'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// sizes
let sizes = SCREEN_SIZE()

// scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(COLOR.WHITE)

// cube
const geometry = new THREE.BufferGeometry()
let positionsArray = new Float32Array(500 * 3 * 3)

/**
 * position the verticies randomly
 */
positionsArray = positionsArray.map(() => (Math.random() - 0.5) * 4)

/**
 * apply the positions as a buffer, to the geometry
 */
const positionsAttributes = new THREE.BufferAttribute(positionsArray, 3)
geometry.setAttribute('position', positionsAttributes)

const material = new THREE.MeshBasicMaterial({ color: COLOR.BLUE, wireframe: true })
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

// controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

keepFullscreen(camera, renderer, () => {
  sizes = SCREEN_SIZE()
})

const tick = () => {
  controls.update()
  renderer.render(scene, camera)

  requestAnimationFrame(tick)
}
tick()
