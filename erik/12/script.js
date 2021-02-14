import * as THREE from 'three'
import { COLOR, SCREEN_SIZE, HPD } from '~/utils/const'
import {
  enableFullscreenOnDoubleClick,
  enableFullViewportOnResize,
} from '~/utils/events'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
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

// const material = new THREE.MeshBasicMaterial({ map: colorTexture })
// material.map = colorTexture
// material.color = new THREE.Color(COLOR.LILAC)
// material.wireframe = true
// material.transparent = true
// material.opacity = 0.5
// material.alphaMap = alphaTexture
// material.side = THREE.DoubleSide

// const material = new THREE.MeshNormalMaterial()
// material.flatShading = true

// const material = new THREE.MeshMatcapMaterial()
// material.matcap = matcapTexture

// const material = new THREE.MeshDepthMaterial()

// const material = new THREE.MeshLambertMaterial()

// const material = new THREE.MeshPhongMaterial()
// material.shininess = 100
// material.specular = new THREE.Color(COLOR.RED)

// const material = new THREE.MeshToonMaterial()

// door
const material = new THREE.MeshStandardMaterial()
material.metalness = 0
material.roughness = 1
material.map = colorTexture
material.aoMap = ambientOcclusionTexture
material.displacementMap = heightTexture
material.displacementScale = 0.05
material.metalnessMap = metalnessTexture
material.roughnessMap = roughnessTexture
material.normalMap = normalTexture
material.normalScale.set(0.5, 0.5)
material.transparent = true
material.alphaMap = alphaTexture

const material2 = new THREE.MeshStandardMaterial()
material2.metalness = 0.9
material2.roughness = 0.02
material2.envMap = environmentMapTexture

gui.add(material, 'wireframe')
gui.add(material, 'metalness').min(0).max(1).step(0.0001)
gui.add(material, 'roughness').min(0).max(1).step(0.0001)
gui.add(material, 'aoMapIntensity').min(0).max(10).step(0.0001)
gui.add(material, 'displacementScale').min(0).max(1).step(0.0001)

material.side = THREE.DoubleSide

// objects
const sphere = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.5, 64, 64),
  material2
)
sphere.position.x = -1.5
const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 128, 128), material)
const torus = new THREE.Mesh(
  new THREE.TorusBufferGeometry(0.3, 0.2, 128, 128),
  material
)
torus.position.x = 1.5

plane.geometry.setAttribute(
  'uv2',
  new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2)
)
sphere.geometry.setAttribute(
  'uv2',
  new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2)
)
torus.geometry.setAttribute(
  'uv2',
  new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2)
)

scene.add(sphere, plane, torus)

// light
const ambientLight = new THREE.AmbientLight(COLOR.WHITE, 0.5)
const pointLight = new THREE.PointLight(COLOR.WHITE, 0.5)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(ambientLight, pointLight)

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
  sphere.rotation.y = 0.1 * t
  plane.rotation.y = 0.1 * t
  torus.rotation.y = 0.1 * t
  sphere.rotation.x = 0.15 * t
  plane.rotation.x = 0.15 * t
  torus.rotation.x = 0.15 * t

  controls.update()
  renderer.render(scene, camera)

  requestAnimationFrame(tick)
}
tick()
