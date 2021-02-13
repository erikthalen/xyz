import * as THREE from 'three'
import { COLOR, HPD } from '~/utils/const'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// sizes
const sizes = {
  width: 800,
  height: 600,
}

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
// const aspect = sizes.width / sizes.height
// const camera = new THREE.OrthographicCamera(-1 * aspect, 1 * aspect, 1, -1)
camera.position.z = 3
scene.add(camera)
camera.lookAt(mesh.position)

// renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setSize(...Object.values(sizes))
renderer.setPixelRatio(Math.min(HPD ? window.devicePixelRatio : 1, 2))
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
