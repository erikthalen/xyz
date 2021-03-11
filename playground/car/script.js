import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { COLOR, SCREEN_SIZE, HPD } from '~/utils/const'
import { enableFullViewportOnResize } from '~/utils/events'
import { throttle } from '~/utils/throttle'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'dat.gui'
import soundSrc from 'url:./sounds/hit.mp3'
import startupSrc from 'url:./sounds/startup.mp3'
import drivingSrc from 'url:./sounds/driving.mp3'
import tireSrc from 'url:./sounds/tire.mp3'
import { CameraHelper } from 'three'

// globals
let s = SCREEN_SIZE()
let chassisBody = null
let box = null
let car = null
let objectsToUpdate = []
let mixer = null
let isSliding = false

// debug
const parameters = {
  width: 2.2,
  height: 2.25,
  depth: 4.85,
  engineForce: 400,
  maxSteerVal: 0.8,
}
const gui = new dat.GUI()
gui.hide()

// const updateCarSize = () => {
//   console.log(chassisBody, box)
//   chassisBody.shapes[0].halfExtents.x = parameters.width
//   chassisBody.shapes[0].halfExtents.y = parameters.height
//   chassisBody.shapes[0].halfExtents.z = parameters.depth
//   chassisBody.shapes[0].boundingSphereRadiusNeedsUpdate = true
//   chassisBody.shapes[0].updateConvexPolyhedronRepresentation()

//   box.scale.copy(
//     new THREE.Vector3(
//       chassisBody.shapes[0].halfExtents.x,
//       chassisBody.shapes[0].halfExtents.y,
//       chassisBody.shapes[0].halfExtents.z
//     )
//   )
// }

// gui.add(parameters, 'width').min(0).max(20).step(0.01).onChange(updateCarSize)
// gui.add(parameters, 'height').min(0).max(20).step(0.01).onChange(updateCarSize)
// gui.add(parameters, 'depth').min(0).max(20).step(0.01).onChange(updateCarSize)
gui.add(parameters, 'engineForce').min(0).max(2000).step(1)
gui.add(parameters, 'maxSteerVal').min(0).max(1.2).step(0.01)

/**
 * SOUND
 */
const startupSound = new Audio(startupSrc)
const drivingSound = new Audio(drivingSrc)
const tireSound = new Audio(tireSrc)
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

// canvas
const canvas = document.querySelector('canvas.webgl')

// scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(COLOR.WHITE)

// camera
const camera = new THREE.PerspectiveCamera(45, s.width / s.height, 0.1, 1000)
camera.position.set(40, 40, -40)
camera.lookAt(0, 0, 0)
scene.add(camera)

// renderer
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(...Object.values(s))
renderer.setPixelRatio(Math.min(HPD ? window.devicePixelRatio : 1, 2))
enableFullViewportOnResize(camera, renderer, () => (s = SCREEN_SIZE()))

// controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// clock
const clock = new THREE.Clock()

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100, 100),
  new THREE.MeshStandardMaterial({
    color: COLOR.WHITE,
    side: THREE.DoubleSide,
  })
)
plane.receiveShadow = true
plane.rotation.x = Math.PI * 0.5
scene.add(plane)

const ambientLight = new THREE.AmbientLight(COLOR.WHITE, 0.5)
scene.add(ambientLight)
var directionalLight = new THREE.DirectionalLight(COLOR.WHITE, 0.7)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(2048, 2048)
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 12
directionalLight.shadow.camera.left = -40
directionalLight.shadow.camera.top = 40
directionalLight.shadow.camera.right = 40
directionalLight.shadow.camera.bottom = -40
directionalLight.position.set(-0.5, 10, -0.5)
scene.add(directionalLight)

// const directionalLightCameraHelper = new CameraHelper(directionalLight.shadow.camera)
// scene.add(directionalLightCameraHelper)

/**
 * Physics
 **/
var world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world)
world.gravity.set(0, -9.82, 0)
world.defaultContactMaterial.friction = 0

var groundMaterial = new CANNON.Material('groundMaterial')
var wheelMaterial = new CANNON.Material('wheelMaterial')
var wheelGroundContactMaterial = new CANNON.ContactMaterial(
  wheelMaterial,
  groundMaterial,
  {
    friction: 0.3,
    restitution: 0,
    contactEquationStiffness: 1000,
  }
)

world.addContactMaterial(wheelGroundContactMaterial)

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

const carSize = [parameters.width, parameters.height, parameters.depth]

// car physics body
const chassisShape = new CANNON.Box(new CANNON.Vec3(...carSize.map(s => s / 2)))
chassisBody = new CANNON.Body({ mass: 150 })
chassisBody.addShape(chassisShape)
chassisBody.position.set(0, 4, 0)
chassisBody.angularVelocity.set(0, 0, 0) // initial velocity

// car visual body
var geometry = new THREE.BoxGeometry(1, 1, 1) // double chasis shape
var material = new THREE.MeshNormalMaterial({
  side: THREE.DoubleSide,
})
box = new THREE.Mesh(geometry, material)
box.scale.set(...carSize)
// scene.add(box)

/**
 * Models
 */
const gltfLoader = new GLTFLoader()
gltfLoader.load('/models/CesiumMilkTruck/glTF/CesiumMilkTruck.gltf', gltf => {
  mixer = new THREE.AnimationMixer(gltf.scene)
  const action = mixer.clipAction(gltf.animations[0])

  action.play()

  startupSound.currentTime = 0
  startupSound.volume = 0.2
  startupSound.play()
  // setTimeout(() => {
  //   drivingSound.play()
  //   drivingSound.addEventListener('ended', () => {
  //     drivingSound.currentTime = 0
  //     setTimeout(() => {
  //       drivingSound.play()
  //     }, 100)
  //   })
  // }, 1000)

  // console.log(gltf.scene)
  car = gltf.scene
  console.log(car)
  car.castShadow = true
  car.children[0].castShadow = true
  car.children[0].children[0].children.forEach(
    child => (child.castShadow = true)
  )
  controls.target = car.position
  scene.add(gltf.scene)
})

// parent vehicle object
const vehicle = new CANNON.RaycastVehicle({
  chassisBody: chassisBody,
  indexRightAxis: 0, // x
  indexUpAxis: 1, // y
  indexForwardAxis: 2, // z
})

// wheel options
var options = {
  radius: 0.4,
  directionLocal: new CANNON.Vec3(0, -1, 0),
  suspensionStiffness: 45,
  suspensionRestLength: 0.4,
  frictionSlip: 5,
  dampingRelaxation: 2.3,
  dampingCompression: 4.5,
  maxSuspensionForce: 200000,
  rollInfluence: 0.01,
  axleLocal: new CANNON.Vec3(-1, 0, 0),
  chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
  maxSuspensionTravel: 0.25,
  customSlidingRotationalSpeed: -30,
  useCustomSlidingRotationalSpeed: true,
}

const axlewidth = 0.9
// sw
options.chassisConnectionPointLocal.set(
  axlewidth,
  -parameters.height / 2 + options.radius,
  -1.35
)
vehicle.addWheel(options)

// se
options.chassisConnectionPointLocal.set(
  -axlewidth,
  -parameters.height / 2 + options.radius,
  -1.35
)
vehicle.addWheel(options)

// nw
options.chassisConnectionPointLocal.set(
  axlewidth,
  -parameters.height / 2 + options.radius,
  1.45
)
vehicle.addWheel(options)

// ne
options.chassisConnectionPointLocal.set(
  -axlewidth,
  -parameters.height / 2 + options.radius,
  1.45
)
vehicle.addWheel(options)

vehicle.addToWorld(world)

// car wheels
const wheelBodies = []
const wheelVisuals = []

vehicle.wheelInfos.forEach(wheel => {
  const shape = new CANNON.Cylinder(
    wheel.radius,
    wheel.radius,
    wheel.radius / 2,
    20
  )

  const body = new CANNON.Body({ mass: 1, material: wheelMaterial })
  const q = new CANNON.Quaternion()

  q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
  body.addShape(shape, new CANNON.Vec3(), q)
  wheelBodies.push(body)

  // wheel visual body
  const geometry = new THREE.CylinderGeometry(
    wheel.radius,
    wheel.radius,
    0.4,
    32
  )
  const material = new THREE.MeshPhongMaterial({
    color: COLOR.BLUE,
    emissive: COLOR.BLACK,
    side: THREE.DoubleSide,
    flatShading: true,
  })

  const cylinder = new THREE.Mesh(geometry, material)
  cylinder.geometry.rotateZ(Math.PI / 2)
  wheelVisuals.push(cylinder)
  // scene.add(cylinder)
})

// update the wheels to match the physics
world.addEventListener('postStep', () => {
  for (var i = 0; i < vehicle.wheelInfos.length; i++) {
    vehicle.updateWheelTransform(i)

    const t = vehicle.wheelInfos[i].worldTransform
    // update wheel physics
    wheelBodies[i].position.copy(t.position)
    wheelBodies[i].quaternion.copy(t.quaternion)
    // update wheel visuals
    wheelVisuals[i].position.copy(t.position)
    wheelVisuals[i].quaternion.copy(t.quaternion)
  }
})

var q = plane.quaternion
var planeBody = new CANNON.Body({
  mass: 0, // mass = 0 makes the body static
  material: groundMaterial,
  shape: new CANNON.Plane(),
  quaternion: new CANNON.Quaternion(-q._x, q._y, q._z, q._w),
})
world.addBody(planeBody)

/**
 * Main
 **/
const tick = () => {
  const delta = clock.getDelta()

  world.step(1 / 60, delta, 3)
  // update the chassis position
  if (box) {
    box.position.copy(chassisBody.position)
    box.quaternion.copy(chassisBody.quaternion)
  }

  if (car) {
    car.position.copy(chassisBody.position)
    car.position.y = chassisBody.position.y - 1.5

    car.quaternion.copy(chassisBody.quaternion)

    // if(vehicle.currentVehicleSpeedKmHour > 4) {
    //   camera.position.x = car.position.x + 20
    //   camera.position.z = car.position.z - 20
    // }
  }

  if (vehicle.sliding && !isSliding) {
    tireSound.currentTime = 0
    tireSound.volume = 0.1
    tireSound.play()
    isSliding = true
  }
  if (tireSound.paused) {
    isSliding = false
  }
  drivingSound.volume = Math.max(
    Math.min(Math.abs(vehicle.currentVehicleSpeedKmHour) / 30, 1),
    0
  )

  // update objects
  objectsToUpdate.forEach(object => {
    object.mesh.position.copy(object.body.position)
    object.mesh.quaternion.copy(object.body.quaternion)
  })

  if (mixer !== null && Math.abs(vehicle.currentVehicleSpeedKmHour) > 4) {
    mixer.update(delta)
  }

  controls.update()

  renderer.render(scene, camera)

  requestAnimationFrame(tick)
}
tick()

function navigate(e) {
  if (e.type != 'keydown' && e.type != 'keyup') return
  var keyup = e.type == 'keyup'
  vehicle.setBrake(0, 0)
  vehicle.setBrake(0, 1)
  vehicle.setBrake(0, 2)
  vehicle.setBrake(0, 3)

  // const engineForce = 400
  // const maxSteerVal = 0.7

  if (e.keyCode === 38) {
    // forward
    vehicle.applyEngineForce(keyup ? 0 : -parameters.engineForce, 0)
    vehicle.applyEngineForce(keyup ? 0 : -parameters.engineForce, 1)
    vehicle.applyEngineForce(keyup ? 0 : -parameters.engineForce, 2)
    vehicle.applyEngineForce(keyup ? 0 : -parameters.engineForce, 3)
  }

  if (e.keyCode === 40) {
    // backward
    vehicle.applyEngineForce(keyup ? 0 : parameters.engineForce, 0)
    vehicle.applyEngineForce(keyup ? 0 : parameters.engineForce, 1)
    vehicle.applyEngineForce(keyup ? 0 : parameters.engineForce, 2)
    vehicle.applyEngineForce(keyup ? 0 : parameters.engineForce, 3)
  }

  if (e.keyCode === 39) {
    // right
    vehicle.setSteeringValue(keyup ? 0 : -parameters.maxSteerVal, 2)
    vehicle.setSteeringValue(keyup ? 0 : -parameters.maxSteerVal, 3)
  }

  if (e.keyCode === 37) {
    // left
    vehicle.setSteeringValue(keyup ? 0 : parameters.maxSteerVal, 2)
    vehicle.setSteeringValue(keyup ? 0 : parameters.maxSteerVal, 3)
  }
}

window.addEventListener('keydown', navigate)
window.addEventListener('keyup', navigate)

// box
const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({
  metalness: 0,
  roughness: 1,
  color: COLOR.ORANGE,
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
    mass: 4,
    position: new CANNON.Vec3(0, 4, 0),
    shape,
    material: defaultMaterial,
  })
  body.position.copy(position)
  body.addEventListener('collide', playSound)
  world.addBody(body)

  objectsToUpdate.push({ mesh, body })
}

const wall = Array(78)
  .fill(0)
  .forEach((_, i, arr) => {
    const x = (i % 13) - 6.5 + (Math.floor(i / 13) % 2 === 0 ? -0.25 : 0.25)
    const y = Math.floor(i / 13) + 0.7
    const z = 30
    
    createBox(1, 1, 1, { x, y, z })
  })
// const wall2 = Array(42)
//   .fill(0)
//   .forEach((_, i, arr) => {
//     createBox(1, 1, 1, { x: (i % 6) - 3, y: Math.floor(i / 6) + 0.5, z: 21.1 })
//   })
