import * as THREE from 'three'
import { COLOR, SCREEN_SIZE, HPD } from '~/utils/const'
import {
  enableFullscreenOnDoubleClick,
  enableFullViewportOnResize,
  mouse,
} from '~/utils/events'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import gsap from 'gsap/gsap-core'

// globals
let currentIntersect = null

// mouse
let cursor = new THREE.Vector2()
mouse(({x, y}) => {
  cursor.x = x
  cursor.y = y
})

window.addEventListener('click', () => {
  if(currentIntersect) {
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
scene.background = new THREE.Color(COLOR.WHITE)

// light
const ambientLight = new THREE.AmbientLight(COLOR.WHITE, 0.7)
scene.add(ambientLight)
const directionalLight = new THREE.DirectionalLight(COLOR.WHITE, 0.6)
directionalLight.position.set(0, 3, 2)
scene.add(directionalLight)

// cube
const geometry = new THREE.BoxGeometry(1, 1, 1)

const mesh1 = new THREE.Mesh(
  geometry,
  new THREE.MeshStandardMaterial({ color: COLOR.BLUE })
)
const mesh2 = new THREE.Mesh(
  geometry,
  new THREE.MeshStandardMaterial({ color: COLOR.BLUE })
)
const mesh3 = new THREE.Mesh(
  geometry,
  new THREE.MeshStandardMaterial({ color: COLOR.BLUE })
)

mesh1.position.x = -1.5
mesh3.position.x = 1.5

scene.add(mesh1, mesh2, mesh3)

// raycaster
const raycaster = new THREE.Raycaster()

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.set(-3, 5, 10)
scene.add(camera)
camera.lookAt(mesh2.position)

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

  mesh1.position.y = Math.sin(t / 3) * 3
  mesh2.position.y = Math.sin(t / 3 + 2) * 3
  mesh3.position.y = Math.sin(t / 3 + 4) * 3

  // const rayOrigin = new THREE.Vector3(-3, 0, 0)
  // const rayDirection = new THREE.Vector3(1, 0, 0)
  // rayDirection.normalize()
  // raycaster.set(rayOrigin, rayDirection)

  // const objectsToTest = [mesh1, mesh2, mesh3]
  // const intersects = raycaster.intersectObjects(objectsToTest)

  // objectsToTest.forEach(object => {
  //   object.material.color.set(COLOR.BLUE)
  // })

  // intersects.forEach(intersect => {
  //   intersect.object.material.color.set(COLOR.RED)
  // })
  
  
  raycaster.setFromCamera(cursor, camera)

  const objectsToTest = [mesh1, mesh2, mesh3]
  const intersects = raycaster.intersectObjects(objectsToTest)

  objectsToTest.forEach(object => {
    object.material.color.set(COLOR.BLUE)
  })

  intersects.forEach(intersect => {
    intersect.object.material.color.set(COLOR.RED)
  })

  if(intersects.length) {
    if(currentIntersect === null) {
      // mouse enter
      gsap.to(intersects[0].object.rotation, {
        duration: 1,
        y: intersects[0].object.rotation.y + Math.PI * 0.5,
        ease: 'elastic.out(0.2, 0.3)',
      })
    }
    currentIntersect = intersects[0]
  } else {
    if(currentIntersect) {
      // mouse leave
      gsap.to(currentIntersect.object.rotation, {
        duration: 1,
        y: 0,
        ease: 'elastic.out(0.2, 0.3)',
      })
    }
    currentIntersect = null
  }

  controls.update()
  renderer.render(scene, camera)

  requestAnimationFrame(tick)
}
tick()
