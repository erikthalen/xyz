import { SCREEN_SIZE, HPD } from '~/utils/const'

export const onMousemove = cb => {
  window.addEventListener('mousemove', ({ clientX, clientY }) => {
    cb({ x: clientX, y: clientY })
  })
}

/**
 * mouse(({x, y}) => console.log(x, y)) // -1 - 1
 */
export const mouse = cb => {
  window.addEventListener('mousemove', ({ clientX, clientY }) => {
    cb({
      x: (clientX / SCREEN_SIZE().width) * 2 - 1,
      y: - (clientY / SCREEN_SIZE().height) * 2 + 1,
    })
  })
}

export const onResize = cb => {
  window.addEventListener('resize', cb)
}

export const enableFullViewportOnResize = (camera, renderer, cb) => {
  onResize(() => {
    const { width, height } = SCREEN_SIZE()
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(HPD ? window.devicePixelRatio : 1, 2))
    typeof cb === 'function' && cb()
  })
}

export const onDblclick = cb => {
  window.addEventListener('dblclick', cb)
}

export const enableFullscreenOnDoubleClick = canvas => {
  onDblclick(() => {
    if (!(document.fullscreenElement || document.webkitFullscreenElement)) {
      if (canvas.requestFullscreen) {
        canvas.requestFullscreen()
      } else if (canvas.webkitRequestFullscreen) {
        canvas.webkitRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      }
    }
  })
}
