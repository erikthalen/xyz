import * as THREE from 'three'
import * as dat from 'dat.gui'
import { COLOR, SCREEN_SIZE, HPD } from '~/utils/const'
import { enableFullViewportOnResize } from '~/utils/events'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// sizes
let sizes = SCREEN_SIZE()

// gui
const gui = new dat.GUI()
const parameters = {
  envMapIntensity: 1,
}

// scene
const scene = new THREE.Scene()

// light
const ambientLight = new THREE.AmbientLight(COLOR.WHITE, 0.9)
scene.add(ambientLight)
gui
  .add(ambientLight, 'intensity')
  .min(0)
  .max(10)
  .step(0.001)
  .name('ambientLightIntensity')

const directionalLight = new THREE.DirectionalLight(COLOR.WHITE, 0.8)
directionalLight.position.set(-3.503, 0.399, -0.685)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.normalBias = 0.05
scene.add(directionalLight)

// const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(cameraHelper)

gui
  .add(directionalLight, 'intensity')
  .min(0)
  .max(10)
  .step(0.001)
  .name('lightIntensity')
gui
  .add(directionalLight.position, 'x')
  .min(-5)
  .max(5)
  .step(0.001)
  .name('lightPositionX')
gui
  .add(directionalLight.position, 'y')
  .min(-5)
  .max(5)
  .step(0.001)
  .name('lightPositionY')
gui
  .add(directionalLight.position, 'z')
  .min(-5)
  .max(5)
  .step(0.001)
  .name('lightPositionZ')

// models
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

// update all materials
const updateAllMaterials = () => {
  scene.traverse(child => {
    if (
      child.type === 'Mesh' &&
      child.material.type === 'MeshStandardMaterial'
    ) {
      child.material.envMapIntensity = parameters.envMapIntensity
      child.material.needsUpdate = true
      child.castShadow = true
      child.receiveShadow = true
    }
  })
}
gui
  .add(parameters, 'envMapIntensity')
  .min(0)
  .max(20)
  .step(0.001)
  .onChange(updateAllMaterials)

// environment map
const environmentMap = cubeTextureLoader.load([
  '/textures/environmentMaps/1/px.jpg',
  '/textures/environmentMaps/1/nx.jpg',
  '/textures/environmentMaps/1/py.jpg',
  '/textures/environmentMaps/1/ny.jpg',
  '/textures/environmentMaps/1/pz.jpg',
  '/textures/environmentMaps/1/nz.jpg',
])
environmentMap.encoding = THREE.sRGBEncoding
scene.background = environmentMap
scene.environment = environmentMap

// models
gltfLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf', gltf => {
  gltf.scene.scale.set(10, 10, 10)
  gltf.scene.position.y = -3
  scene.add(gltf.scene)
  gui
    .add(gltf.scene.rotation, 'y')
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.001)
    .name('rotation')
  updateAllMaterials(scene)
})

const spere = new THREE.Mesh(
  new THREE.SphereGeometry(7, 32, 32),
  new THREE.MeshStandardMaterial()
)
spere.position.set(15, 0, 3)
scene.add(spere)

// camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  1000
)
camera.position.set(-3, 7, 20)
scene.add(camera)

// renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setSize(...Object.values(sizes))
renderer.setPixelRatio(Math.min(HPD ? window.devicePixelRatio : 1, 2))
renderer.render(scene, camera)
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 3
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
gui
  .add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhart: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
  })
  .onFinishChange(() => {
    renderer.toneMapping = Number(renderer.toneMapping)
    updateAllMaterials()
  })
gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001)

enableFullViewportOnResize(camera, renderer, () => (sizes = SCREEN_SIZE()))

// controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const clock = new THREE.Clock()

const tick = () => {
  const delta = clock.getDelta()

  controls.update()

  renderer.render(scene, camera)

  requestAnimationFrame(tick)
}
tick()
