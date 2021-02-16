import * as THREE from 'three'
import { COLOR, SCREEN_SIZE, HPD } from '~/utils/const'
import { throttle } from '~/utils/throttle'
import { enableFullViewportOnResize, mouse } from '~/utils/events'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import * as CANNON from 'cannon-es'
import soundSrc from 'url:./sounds/hit.mp3'

/**
 * GLOBALS
 */
let currentIntersect = null
let objectsToUpdate = []

/**
 * SIZES
 */
let sizes = SCREEN_SIZE()

/**
 * MOUSE
 */
let cursor = new THREE.Vector2()
mouse(({ x, y }) => {
  cursor.x = x
  cursor.y = y
})

window.addEventListener('click', () => {
  if (currentIntersect) {
    const currentIntersectBody = objectsToUpdate.find(obj => obj.mesh === currentIntersect.object).body
    // currentIntersect.object.material.color.set(COLOR.GREEN)
    const randomX = (Math.random() - 0.5) * 300
    const randomZ = (Math.random() - 0.5) * 300
    currentIntersectBody.applyForce(new CANNON.Vec3(randomX, 600, randomZ), currentIntersect.object.position)
  }
})

/**
 * SCENE
 */
const scene = new THREE.Scene()
scene.background = new THREE.Color(COLOR.GREY)

/**
 * SOUND
 */
const sound = new Audio(soundSrc)
const play = throttle(impactStrength => {
  sound.volume = Math.min(impactStrength / 20, 1)
  sound.currentTime = 0
  sound.play()
}, 50)
function playSound(collision) {
  const impactStrength = collision.contact.getImpactVelocityAlongNormal()
  if (impactStrength > 1.5) {
    play(impactStrength)
  }
}

/**
 * LIGHT
 */
const ambientLight = new THREE.AmbientLight(COLOR.GREY, 0.8)
scene.add(ambientLight)
const directionalLight = new THREE.DirectionalLight(COLOR.WHITE, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = -7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = -7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * PHYSICS
 */
// world
const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)
world.allowSleep = true
world.broadphase = new CANNON.SAPBroadphase(world)

// materials
const defaultMaterial = new CANNON.Material('default')
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.1,
    restitution: 0.7,
  }
)
world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial

// floor
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body({
  mass: 0,
  shape: floorShape,
})
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
world.addBody(floorBody)

// sphere
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
const sphereMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.1,
  roughness: 0.7,
  color: COLOR.PURPLE,
})

function createSphere(radius, position) {
  // three js mesh
  const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
  mesh.scale.set(radius, radius, radius)
  mesh.castShadow = true
  mesh.position.copy(position)
  scene.add(mesh)

  const shape = new CANNON.Sphere(radius)
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 4, 0),
    shape,
    material: defaultMaterial,
  })
  body.position.copy(position)
  body.addEventListener('collide', playSound)
  world.addBody(body)

  objectsToUpdate.push({ mesh, body })
}

// box
const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.1,
  roughness: 0.7,
  color: COLOR.LILAC,
})

function createBox(width, height, depth, position) {
  // three js mesh
  const mesh = new THREE.Mesh(boxGeometry, boxMaterial)
  mesh.scale.set(width, height, depth)
  mesh.castShadow = true
  mesh.position.copy(position)
  scene.add(mesh)

  const shape = new CANNON.Box(
    new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5)
  )
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 4, 0),
    shape,
    material: defaultMaterial,
  })
  body.position.copy(position)
  body.addEventListener('collide', playSound)
  world.addBody(body)

  objectsToUpdate.push({ mesh, body })
}

/**
 * three js
 */
createSphere(0.5, { x: 0, y: 6, z: 0 })
createBox(1, 1, 1, { x: 0.3, y: 4.5, z: 0.4 })

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: COLOR.WHITE,
    side: THREE.DoubleSide,
  })
)
plane.receiveShadow = true
plane.rotation.x = -Math.PI * 0.5

scene.add(plane)

// raycaster
const raycaster = new THREE.Raycaster()

// camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  10000
)
camera.position.set(-10, 15, 20)
scene.add(camera)

// renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(...Object.values(sizes))
renderer.setPixelRatio(Math.min(HPD ? window.devicePixelRatio : 1, 2))
renderer.render(scene, camera)

// gui
const gui = new dat.GUI()
const debugObj = {
  createSphere: () =>
    createSphere(0.5, {
      x: (Math.random() - 0.5) * 3,
      y: 5,
      z: (Math.random() - 0.5) * 3,
    }),
  createBox: () =>
    createBox(1, 1, 1, {
      x: (Math.random() - 0.5) * 3,
      y: 5,
      z: (Math.random() - 0.5) * 3,
    }),
  reset: () => {
    objectsToUpdate.forEach(object => {
      object.body.removeEventListener('collide', playSound)
      world.removeBody(object.body)
      scene.remove(object.mesh)
    })
  },
}
gui.add(debugObj, 'createSphere')
gui.add(debugObj, 'createBox')
gui.add(debugObj, 'reset')

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

  // check intersections
  raycaster.setFromCamera(cursor, camera)
  const intersects = raycaster.intersectObjects(
    objectsToUpdate.map(o => o.mesh)
  )

  if (intersects.length) {
    currentIntersect = intersects[0]
  } else {
    currentIntersect = null
  }

  // update objects
  objectsToUpdate.forEach(object => {
    object.mesh.position.copy(object.body.position)
    object.mesh.quaternion.copy(object.body.quaternion)
  })

  // update controls
  controls.update()
  renderer.render(scene, camera)

  requestAnimationFrame(tick)
}
tick()
