<template>
  <div id="pcb-viewer">
    <h2>PCB Viewer</h2>
    <br />
    <canvas id="viewer" width="420" height="300"></canvas>
  </div>
</template>

<script>

var ce, c, h, w;

export default {
  name: 'pcb-viewer',
  props: ['holes'],
  /*data: () => {
    return {
      holes
    }
  },*/
  mounted () {
    ce = document.getElementById('viewer')
    c = ce.getContext('2d')
    h = parseInt(ce.getAttribute('height'))
    w = parseInt(ce.getAttribute('width'))

    window.requestAnimationFrame(render.bind(this));
  }
}

// Unit scale
function us(value) {
  return value * 5
}

function render() {
  c.clearRect(0, 0, w, h)
  c.save()

  this.holes.forEach((hole) => {
    c.beginPath()
    c.arc(us(hole.x), us(hole.y), (hole.highlighted ? 2 : 1)*us(hole.d)/2, 0, 2*Math.PI)
    c.fillStyle = '#444'
    c.fill()
    c.closePath()
  })

  let lastHole;
  this.holes.forEach((hole, i) => {
    if(!lastHole) {
      c.beginPath()
      c.strokeStyle = `hsl(${hole.hue}, 50%, 50%)`
      c.moveTo(us(hole.x), us(hole.y)) 
    } else {
      c.lineTo(us(hole.x), us(hole.y))
    }

    if(lastHole) {
      if(lastHole.d != hole.d) {
        lastHole = null
        c.stroke()
        c.closePath()
      }
    } else {
      lastHole = hole
    }
  })
  c.stroke()
  c.closePath()


  c.restore()
  window.requestAnimationFrame(render.bind(this));
}
</script>

<style scoped>

#viewer {
  box-shadow: 0 0 15px #aaa;
}

</style>