import * as THREE from 'three'
import { COLOR, SCREEN_SIZE, HPD } from '~/utils/const'
import { enableFullViewportOnResize, mouse } from '~/utils/events'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import gsap from 'gsap/gsap-core'
import CANNON from 'cannon'

// globals
let currentIntersect = null

// mouse
let cursor = new THREE.Vector2()
mouse(({ x, y }) => {
  cursor.x = x
  cursor.y = y
})

window.addEventListener('click', () => {
  if (currentIntersect) {
    gsap.to(currentIntersect.object.rotation, {
      duration: 1,
      x: currentIntersect.object.rotation.x + Math.PI * 0.5,
      ease: 'elastic.out(0.2, 0.3)',
    })
  }
})

// gui
const gui = new dat.GUI()

// sizes
let sizes = SCREEN_SIZE()

// scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(COLOR.BLACK)

// light
const ambientLight = new THREE.AmbientLight(COLOR.WHITE, 0.2)
scene.add(ambientLight)
const directionalLight = new THREE.DirectionalLight(COLOR.WHITE, 0.7, 100)
directionalLight.position.set(0, 3, 2)
scene.add(directionalLight)

/**
 * Physics
 */
// world
const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)

// box
const sphereShape = new CANNON.Sphere(0.5)
const sphereBody = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(0, 3, 0),
  shape: sphereShape
})
world.addBody(sphereBody)

// floor
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.mass = 0
floorBody.addShape(floorShape)
world.addBody(floorShape)


/**
 * three js
 */
const mesh1 = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.5, 32, 32),
  new THREE.MeshPhongMaterial({
    color: COLOR.RED,
    shininess: 1,
    specular: COLOR.WHITE,
  })
)
mesh1.rotation.set(1, 2, 3)

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: COLOR.WHITE,
  })
)
plane.rotation.x = -Math.PI * 0.5
plane.position.y = -2

scene.add(mesh1, plane)

// raycaster
const raycaster = new THREE.Raycaster()

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.set(-6, 4, 4)
scene.add(camera)
camera.lookAt(mesh1.position)

// renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(...Object.values(sizes))
renderer.setPixelRatio(Math.min(HPD ? window.devicePixelRatio : 1, 2))
renderer.render(scene, camera)

/**
 * shadows
 */
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
directionalLight.castShadow = true
directionalLight.shadow.mapSize.width = 1024
directionalLight.shadow.mapSize.height = 1024
directionalLight.shadow.camera.near = 0.5
directionalLight.shadow.camera.far = 500
mesh1.castShadow = true
plane.receiveShadow = true

enableFullViewportOnResize(camera, renderer, () => (sizes = SCREEN_SIZE()))

// controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const clock = new THREE.Clock()

const tick = () => {
  // const t = clock.getElapsedTime()
  const deltaTime = clock.getDelta()

  // update physics world
  world.step(1 / 60, deltaTime, 3)

  mesh1.position.copy(sphereBody.position)

  // update controls
  controls.update()
  renderer.render(scene, camera)

  requestAnimationFrame(tick)
}
tick()
