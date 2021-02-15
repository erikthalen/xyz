import * as THREE from 'three'
import { COLOR, HPD, SCREEN_SIZE } from '~/utils/const'
import {
  enableFullscreenOnDoubleClick,
  enableFullViewportOnResize,
} from '~/utils/events'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import starSrc from 'url:./textures/particles/8.png'
// import * as dat from 'dat.gui'

// const giu = new dat.GUI()

// sizes
let sizes = SCREEN_SIZE()

// scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(COLOR.BLACK)

// textures
const textureLoader = new THREE.TextureLoader()
const star = textureLoader.load(starSrc)

// pacticles
const particlesGeometry = new THREE.BufferGeometry()
const patriclesMaterial = new THREE.PointsMaterial({
  size: 0.2,
  sizeAttenuation: true,
  alphaMap: star,
  transparent: true,
  alphaTest: 0.001,
  // depthTest: false,
  depthWrite: true,
  vertexColors: true
})

const count = 50

const arr = new Float32Array(count * 3).fill(0)
const positions = arr.map(_ => (Math.random() - 0.5) * 5)
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

const colorsArr = new Float32Array(count * 3).fill(0)
const colors = colorsArr.map(_ => Math.random())
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

// points
const particles = new THREE.Points(particlesGeometry, patriclesMaterial)
scene.add(particles)

// const box = new THREE.Mesh(
//   new THREE.BoxBufferGeometry(),
//   new THREE.MeshNormalMaterial()
// )
// scene.add(box)

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.z = 3
scene.add(camera)

// renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(...Object.values(sizes))
renderer.setPixelRatio(Math.min(HPD ? window.devicePixelRatio : 1, 2))
renderer.render(scene, camera)

enableFullscreenOnDoubleClick(canvas)
enableFullViewportOnResize(camera, renderer, () => (sizes = SCREEN_SIZE()))

// controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const clock = new THREE.Clock()

const tick = () => {
  const t = clock.getElapsedTime()

  for(let i = 0; i < count; i++) {
    const i3 = i * 3
    const x = particlesGeometry.attributes.position.array[i3 + 0]
    particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(t + x)
  }

  particlesGeometry.attributes.position.needsUpdate = true

  controls.update()
  renderer.render(scene, camera)

  requestAnimationFrame(tick)
}
tick()
