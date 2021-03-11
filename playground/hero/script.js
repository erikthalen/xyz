import * as THREE from 'three'
import { COLOR, SCREEN_SIZE, HPD } from '~/utils/const'
import { enableFullViewportOnResize, mouse } from '~/utils/events'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import gsap from 'gsap'

/**
 * Globals
 */
const canvas = document.querySelector('canvas.webgl')
const { width, height } = SCREEN_SIZE()
let scrollY = 0
let cursor = new THREE.Vector2()
let materials = null
let textures = null
let object = null
let chair = {}

mouse(({ x, y }) => {
  cursor.x = x
  cursor.y = y
})

const gui = new dat.GUI()
const parameters = {
  x: 0,
  y: -300,
  z: 0,
}

/**
 * Scene
 */
const scene = new THREE.Scene()
scene.background = new THREE.Color(COLOR.WHITE)

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000)
camera.position.z = 1500

/**
 * Light
 */
const ambientLight = new THREE.AmbientLight(COLOR.WHITE, 0.7)
scene.add(ambientLight)
const directionalLight = new THREE.DirectionalLight(COLOR.WHITE, 0.7)
scene.add(directionalLight)
const pointLight = new THREE.PointLight(COLOR.WHITE, 2)
pointLight.position.y = 500
pointLight.position.z = 500
scene.add(pointLight)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(width, height)
renderer.setPixelRatio(HPD ? Math.min(window.devicePixelRatio, 2) : 1)
renderer.render(scene, camera)
enableFullViewportOnResize(camera, renderer)

/**
 * Clock
 */
const clock = new THREE.Clock()

/**
 * Controls
 */
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Manager
 */
function loadModel() {
  object.traverse(child => {
    // console.log('child', child)
    // if (child instanceof THREE.Mesh) {
    if (child.material) {
      child.material.map = new THREE.TextureLoader(manager).load(
        '/textures/door/color.jpg'
      )
    }
  })

  const [chairObj] = [...object.children]

  chair = chairObj
  window.chair = chair

  if (!chair) return

  //   camera.lookAt(chair.position)

  chair.position.y = -300
  chair.rotation.x = Math.PI * 0.25

  gui.add(chair.position, 'x').min(-1000).max(1000).step(1)
  gui.add(chair.position, 'y').min(-1000).max(1000).step(1)
  gui.add(chair.position, 'z').min(-1000).max(1000).step(1)

  gui
    .add(chair.rotation, 'x')
    .min(-Math.PI * 2)
    .max(Math.PI * 2)
    .step(0.001)
  gui
    .add(chair.rotation, 'y')
    .min(-Math.PI * 2)
    .max(Math.PI * 2)
    .step(0.001)
  gui
    .add(chair.rotation, 'z')
    .min(-Math.PI * 2)
    .max(Math.PI * 2)
    .step(0.001)

  initAnimations()
  scene.add(chair)
}

/**
 * Loading manager
 */
const manager = new THREE.LoadingManager(loadModel)
manager.onProgress = (item, loaded, total) => {
  console.log(item, loaded, total)
}

/**
 * Materials
 */
const mtlLoader = new MTLLoader(manager)
mtlLoader.load('/models/chair/hans-wegner-elbow.obj', mat => {
  mat.preload()
  materials = mat
})

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader(manager)
textures = textureLoader.load('/textures/matcaps/4.png')

/**
 * Models
 */
const objLoader = new OBJLoader(manager)
objLoader.setMaterials(materials).load(
  '/models/chair/hans-wegner-elbow.obj',
  obj => (object = obj),
  xhr => console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
)

/**
 * Animations
 */
const initAnimations = () => {
  // gsap.to(chair.rotation, { duration: 1, delay: 1, x: Math.PI * 2 })
}

const tick = () => {
  // get/set variables
  const elapsedTime = clock.getElapsedTime()
  scrollY = window.pageYOffset

  //   if (object) {
  //     // upd scene
  //     object.rotation.x = -scrollY * 0.001 + Math.PI * 0.2
  //     object.rotation.y = elapsedTime * 0.1
  //     object.rotation.z = cursor.x

  //     object.position.y = scrollY * 0.001 - 7
  //   }

  // update controls
  controls.update()

  // render scene
  renderer.render(scene, camera)

  // console.log(scrollY, cursor)

  // loop
  requestAnimationFrame(tick)
}
tick()

/**
 * Animations
 */
const base = {
  duration: 1,
}

const chapters = {
  one: {
    rotation: {
      x: Math.PI * 2,
    },
    position: { y: 100 },
  },
  two: {
    rotation: { x: 0 },
    position: { y: 0 },
  },
}

/**
 * Scroll listeners
 */
const titles = [...document.querySelectorAll('.title')]

const moveChair = () => {
  console.log('moveChair', chair)
}

const cb = ([entry], str) => {
  console.log(str, window)
  // moveChair()

  if (!entry.isIntersecting || !chair) return

  const { chapter } = entry.target.dataset

  gsap.to(chair.rotation, { ...base, ...chapters[chapter].rotation })
  gsap.to(chair.position, { ...base, ...chapters[chapter].position })
}

titles.forEach(title => {
  // console.log(chair)
  const observer = new IntersectionObserver(e => cb(e, chair))
  observer.observe(title)
})
