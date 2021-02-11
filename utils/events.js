export const mousemove = (cb) => {
  window.addEventListener('mousemove', ({ clientX, clientY }) => {
    cb({ x: clientX, y: clientY })
  })
}
