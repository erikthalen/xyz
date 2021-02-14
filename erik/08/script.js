import * as THREE from 'three'
import { COLOR, HPD } from '~/utils/const'
import { onResize, enableFullscreenOnDoubleClick } from '~/utils/events'
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
  renderer.setPixelRatio(Math.min(HPD ? window.devicePixelRatio : 1, 2))
})

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
enableFullscreenOnDoubleClick(canvas)

// controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const tick = () => {
  controls.update()
  renderer.render(scene, camera)

  requestAnimationFrame(tick)
}
tick()
