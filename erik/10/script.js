import * as THREE from 'three'
import { COLOR, SCREEN_SIZE, HPD } from '~/utils/const'
import { enableFullViewportOnResize } from '~/utils/events'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import gsap from 'gsap'

const parameters = {
  boxColor: COLOR.RED,
  spin: () => {
    gsap.to(mesh.rotation, {
      duration: 5,
      y: mesh.rotation.y + Math.PI,
      ease: 'elastic.out(0.2, 0.3)',
    })
  },
  spinBack: () => {
    gsap.to(mesh.rotation, {
      duration: 5,
      y: mesh.rotation.y + -Math.PI,
      ease: 'elastic.out(0.2, 0.3)',
    })
  },
}

// gui
const gui = new dat.GUI()

gui.add(parameters, 'spin')
gui.add(parameters, 'spinBack')

// sizes
let sizes = SCREEN_SIZE()

// scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(COLOR.WHITE)

// red cube
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshNormalMaterial()
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

gui.add(mesh.position, 'y').min(-3).max(3).step(0.01).name('Elevation')
gui.add(mesh, 'visible')
gui.add(material, 'wireframe')

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

enableFullViewportOnResize(camera, renderer, () => (sizes = SCREEN_SIZE()))

const tick = () => {
  controls.update()
  renderer.render(scene, camera)

  requestAnimationFrame(tick)
}
tick()
