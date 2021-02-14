import * as THREE from 'three'
import { COLOR, SCREEN_SIZE, HPD } from '~/utils/const'
import { enableFullscreenOnDoubleClick, enableFullViewportOnResize } from '~/utils/events'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import textureSrc from 'url:./textures/minecraft.png'

// textures
const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingManager)
const colorTexture = textureLoader.load(textureSrc)
const colorTexture2 = textureLoader.load(textureSrc)

// colorTexture.repeat.x = 3
// colorTexture.repeat.y = 3
// colorTexture.wrapS = THREE.RepeatWrapping
// colorTexture.wrapT = THREE.MirroredRepeatWrapping

// colorTexture.center.x = 0.5
// colorTexture.center.y = 0.5
// colorTexture.rotation = Math.PI * 0.25

// colorTexture.minFilter = THREE.NearestFilter
colorTexture.magFilter = THREE.NearestFilter

loadingManager.onStart = () => { console.log('onStart') }
loadingManager.onLoaded = () => { console.log('onLoaded') }
loadingManager.onProgress = () => { console.log('onProgress') }
loadingManager.onError = () => { console.log('onError') }

// sizes
let sizes = SCREEN_SIZE()

// scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(COLOR.WHITE)

// cube
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ map: colorTexture })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)
mesh.position.x = 0.66

const geometry2 = new THREE.BoxGeometry(1, 1, 1)
const material2 = new THREE.MeshBasicMaterial({ map: colorTexture2 })
const mesh2 = new THREE.Mesh(geometry2, material2)
scene.add(mesh2)
mesh2.position.x = -0.66

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
