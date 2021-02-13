import * as THREE from 'three'
import { COLOR, HPD } from '~/utils/const'

// scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(COLOR.WHITE)

// group
const group = new THREE.Group()
scene.add(group)

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: COLOR.BLUE })
)

const cube2 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: COLOR.YELLOW })
)
cube2.position.x = 2

const cube3 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: COLOR.RED })
)
cube3.position.x = -2

group.add(cube1)
group.add(cube2)
group.add(cube3)

group.position.x = 1
group.position.y = 1
group.position.z = -4
group.rotation.y = 1

// sizes
const sizes = { width: 800, height: 600 }

// camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)

// renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setPixelRatio(Math.min(HPD ? window.devicePixelRatio : 1, 2))
renderer.setSize(...Object.values(sizes))

renderer.render(scene, camera)
