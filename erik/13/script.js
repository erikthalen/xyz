import * as THREE from 'three'
import { COLOR, SCREEN_SIZE, HPD } from '~/utils/const'
import {
  enableFullscreenOnDoubleClick,
  enableFullViewportOnResize,
} from '~/utils/events'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import * as dat from 'dat.gui'

import colorSrc from 'url:./textures/door/color.jpg'
import alphaSrc from 'url:./textures/door/alpha.jpg'
import heightSrc from 'url:./textures/door/height.jpg'
import normalSrc from 'url:./textures/door/normal.jpg'
import ambientOcclusionSrc from 'url:./textures/door/ambientOcclusion.jpg'
import metalnessSrc from 'url:./textures/door/metalness.jpg'
import roughnessSrc from 'url:./textures/door/roughness.jpg'
import matcapSrc from 'url:./textures/matcaps/4.png'
import gradientSrc from 'url:./textures/gradients/3.jpg'

import px from 'url:./textures/environmentMaps/3/px.jpg'
import nx from 'url:./textures/environmentMaps/3/nx.jpg'
import py from 'url:./textures/environmentMaps/3/py.jpg'
import ny from 'url:./textures/environmentMaps/3/ny.jpg'
import pz from 'url:./textures/environmentMaps/3/pz.jpg'
import nz from 'url:./textures/environmentMaps/3/nz.jpg'

// import font from 'url:./fonts/helvetiker_regular.typeface.json'

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

const matcapTexture = textureLoader.load(matcapSrc)
const gradientTexture = textureLoader.load(gradientSrc)

const cubeTextureLoader = new THREE.CubeTextureLoader()
const environmentMapTexture = cubeTextureLoader.load([px, nx, py, ny, pz, nz])

// debug
const gui = new dat.GUI()

// sizes
let sizes = SCREEN_SIZE()

// scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(COLOR.WHITE)

// door
// const material = new THREE.MeshStandardMaterial()
// material.metalness = 0
// material.roughness = 1
// material.map = colorTexture
// material.aoMap = ambientOcclusionTexture
// material.displacementMap = heightTexture
// material.displacementScale = 0.05
// material.metalnessMap = metalnessTexture
// material.roughnessMap = roughnessTexture
// material.normalMap = normalTexture
// material.normalScale.set(0.5, 0.5)
// material.transparent = true
// material.alphaMap = alphaTexture

// text
const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })
material.wireframe = false
gui.add(material, 'wireframe')

const fontLoader = new THREE.FontLoader()
fontLoader.load('/fonts/helvetiker_regular.typeface.json', font => {
  const textGeometry = new THREE.TextBufferGeometry('Donuts', {
    font,
    size: 0.5,
    height: 0.1,
    curveSegments: 4,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelOffset: 0,
    bevelSegments: 5,
  })
  const text = new THREE.Mesh(textGeometry, material)
  textGeometry.center()
  scene.add(text)
})

// donuts
const donutGeometry = new THREE.TorusBufferGeometry(0.3, 0.2, 20, 45)

console.time('donuts')

const donuts = Array(300).fill(0).map(_ => {
  const donut = new THREE.Mesh(donutGeometry, material)
  donut.position.x = (Math.random() - 0.5) * 2 * 10
  donut.position.y = (Math.random() - 0.5) * 2 * 10
  donut.position.z = (Math.random() - 0.5) * 2 * 10
  
  donut.rotation.x = Math.random() * Math.PI
  donut.rotation.y = Math.random() * Math.PI
  
  const scale = Math.random()
  donut.scale.set(scale, scale, scale)
  return donut
})

scene.add(...donuts)

console.timeEnd('donuts')

// light
const ambientLight = new THREE.AmbientLight(COLOR.WHITE, 0.5)
const pointLight = new THREE.PointLight(COLOR.WHITE, 0.5)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(ambientLight, pointLight)

// axisHelper
// const axisHelper = new THREE.AxisHelper()
// scene.add(axisHelper)

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
const controls = new TrackballControls(camera, canvas)
controls.enableDamping = true

const clock = new THREE.Clock()

const tick = () => {
  const t = clock.getElapsedTime()

  controls.update()
  renderer.render(scene, camera)

  requestAnimationFrame(tick)
}
tick()
