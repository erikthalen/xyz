import * as THREE from 'three'
import { COLOR, SCREEN_SIZE, HPD } from '~/utils/const'
import { enableFullscreen, keepFullscreen } from '~/utils/events'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import * as dat from 'dat.gui'

import colorSrc from 'url:./textures/door/color.jpg'
import alphaSrc from 'url:./textures/door/alpha.jpg'
import heightSrc from 'url:./textures/door/height.jpg'
import normalSrc from 'url:./textures/door/normal.jpg'
import ambientOcclusionSrc from 'url:./textures/door/ambientOcclusion.jpg'
import metalnessSrc from 'url:./textures/door/metalness.jpg'
import roughnessSrc from 'url:./textures/door/roughness.jpg'

// textures
const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingManager)
const colorTexture = textureLoader.load(colorSrc)
const alphaTexture = textureLoader.load(alphaSrc)
const heightTexture = textureLoader.load(heightSrc)
const normalTexture = textureLoader.load(normalSrc)
const ambientOcclusionTexture = textureLoader.load(ambientOcclusionSrc)
const metalnessTexture = textureLoader.load(metalnessSrc)
const roughnessTexture = textureLoader.load(roughnessSrc)

colorTexture.repeat.x = 3
colorTexture.repeat.y = 3
colorTexture.wrapS = THREE.RepeatWrapping
colorTexture.wrapT = THREE.MirroredRepeatWrapping

loadingManager.onStart = () => { console.log('onStart') }
loadingManager.onLoaded = () => { console.log('onLoaded') }
loadingManager.onProgress = () => { console.log('onProgress') }
loadingManager.onError = () => { console.log('onError') }

// sizes
let sizes = SCREEN_SIZE()

// scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(COLOR.WHITE)

// red cube
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ map: colorTexture })
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
