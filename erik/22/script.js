import * as THREE from 'three'
import { COLOR, SCREEN_SIZE, HPD } from '~/utils/const'
import { enableFullViewportOnResize } from '~/utils/events'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// globals
let mixer = null

// sizes
let sizes = SCREEN_SIZE()

// scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(COLOR.WHITE)

// light
const ambientLight = new THREE.AmbientLight(COLOR.WHITE, 0.9)
scene.add(ambientLight)
const directionalLight = new THREE.DirectionalLight(COLOR.WHITE, 0.8)
directionalLight.position.set(0, 3, 2)
scene.add(directionalLight)

// models
const gltfLoader = new GLTFLoader()

// fox
gltfLoader.load('/models/Fox/glTF/Fox.gltf', gltf => {
  mixer = new THREE.AnimationMixer(gltf.scene)
  const action = mixer.clipAction(gltf.animations[1])

  action.play()

  gltf.scene.scale.set(0.025, 0.025, 0.025)
  scene.add(gltf.scene)
})

// camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  1000
)
camera.position.set(-3, 5, 10)
scene.add(camera)

// renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(...Object.values(sizes))
renderer.setPixelRatio(Math.min(HPD ? window.devicePixelRatio : 1, 2))
renderer.render(scene, camera)

enableFullViewportOnResize(camera, renderer, () => (sizes = SCREEN_SIZE()))

// controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const clock = new THREE.Clock()

const tick = () => {
  const delta = clock.getDelta()

  // update mixer (animations)
  if (mixer !== null) {
    mixer.update(delta)
  }

  controls.update()

  renderer.render(scene, camera)

  requestAnimationFrame(tick)
}
tick()
