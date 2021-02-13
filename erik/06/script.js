import * as THREE from 'three'
import gsap from 'gsap'
import { COLOR, HPD } from '~/utils/const'

// scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(COLOR.WHITE)

// red cube
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: COLOR.RED })
const mesh = new THREE.Mesh(geometry, material)
mesh.rotation.z = -1
mesh.rotation.x = -1
scene.add(mesh)

// sizes
const sizes = {
  width: 800,
  height: 600,
}

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

// clock
const clock = new THREE.Clock()

gsap.to(mesh.position, { duration: 1, delay: 1, x: 2 })

const tick = () => {
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}
tick()