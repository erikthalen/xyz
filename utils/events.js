export const onMousemove = cb => {
  window.addEventListener('mousemove', ({ clientX, clientY }) => {
    cb({ x: clientX, y: clientY })
  })
}

export const onResize = cb => {
  window.addEventListener('resize', cb)
}

export const onDblclick = cb => {
  window.addEventListener('dblclick', cb)
}

export const enableFullscreen = canvas => {
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
