import * as THREE from 'three'
import { COLOR } from '~/utils/const'
import { onResize, enableFullscreen } from '~/utils/events'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// sizes
const screenSize = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
})
let sizes = screenSize()

onResize(() => {
  sizes = screenSize()
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
  renderer.setSize(...Object.values(sizes))
})

// scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(COLOR.WHITE)

// cube
const geometry = new THREE.BufferGeometry()

const count = 500
let positionsArray = new Float32Array(count * 3 * 3)

positionsArray = positionsArray.map(() => (Math.random() - 0.5) * 4)

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
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.render(scene, camera)

// controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const tick = () => {
  controls.update()
  renderer.render(scene, camera)

  requestAnimationFrame(tick)
}
tick()
