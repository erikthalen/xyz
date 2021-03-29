import * as THREE from 'three'
import * as dat from 'dat.gui'
import { COLOR, SCREEN_SIZE, HPD } from '~/utils/const'
import { enableFullViewportOnResize } from '~/utils/events'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { vertexShader } from './vertex.js'
import { fragmentShader } from './fragment.js'

// sizes
let s = SCREEN_SIZE()

// gui
const gui = new dat.GUI()
const parameters = {}

// loaders
const textureLoader = new THREE.TextureLoader()

// scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(COLOR.WHITE)

// textures
const flagTexture = textureLoader.load('/textures/sweden.jpg')

// mesh
const geometry = new THREE.PlaneGeometry(1, 1, 32, 32)

const count = geometry.attributes.position.count
const randoms = new Float32Array(count).fill(0).map(Math.random)

geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  side: THREE.DoubleSide,
  uniforms: {
    uFrequency: { value: new THREE.Vector2(10, 5) },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(COLOR.BLUE) },
    uTexture: { value: flagTexture },
    uIsFlag: { value: true }
  },
})
const material2 = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  side: THREE.DoubleSide,
  uniforms: {
    uFrequency: { value: new THREE.Vector2(10, 5) },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(COLOR.BLUE) },
    uIsFlag: { value: false }
  },
})

const mesh = new THREE.Mesh(geometry, material)
mesh.scale.y = 2 / 3
mesh.position.x -= 1
scene.add(mesh)

const mesh2 = new THREE.Mesh(geometry, material2)
mesh2.position.x += 1
scene.add(mesh2)

// camera
const camera = new THREE.PerspectiveCamera(45, s.width / s.height, 0.1, 1000)
camera.position.set(-1, 1, 5)
scene.add(camera)

// light
const directionalLight = new THREE.DirectionalLight(COLOR.WHITE, 0.8)
directionalLight.position.set(1, 1, 1)
scene.add(directionalLight)

// renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setSize(...Object.values(s))
renderer.setPixelRatio(Math.min(HPD ? window.devicePixelRatio : 1, 2))
renderer.render(scene, camera)
enableFullViewportOnResize(camera, renderer, () => (s = SCREEN_SIZE()))

// controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// clock
const clock = new THREE.Clock()

// tick
const tick = () => {
  const time = clock.getElapsedTime()

  material.uniforms.uTime.value = time

  controls.update()
  renderer.render(scene, camera)

  requestAnimationFrame(tick)
}
tick()
