<template>
  <div id="pcb-viewer">
    <canvas id="viewer"></canvas>
  </div>
</template>

<script>

const fs = require('fs')
const uniqid = require('uniqid')
const Path = require('path')
const isXML = require('is-xml')
const eagle2svg = require('eagle2svg')
const EventEmitter = require('events').EventEmitter
const plotgrid = require('plot-grid')

const d3 = require('d3')

export default {
  name: 'pcb-viewer',
  props: ['holes'],
  mounted () {
    setupCanvas.bind(this)()

    // File drop
    var dropzone = this.$el;
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault() // Prevent the page from actually trying to open and view the file
      e.stopPropagation() // Stop the event from propagating to parent elements

      dropzone.classList.remove('dropTarget')

      for (let f of e.dataTransfer.files) {
        this.loadFile(f.path)
      }
    })

    dropzone.addEventListener('dragleave', (e) => {
      dropzone.classList.remove('dropTarget')
    })
    
    dropzone.addEventListener('dragover', (e) => {
      dropzone.classList.add('dropTarget')
      e.preventDefault() // Prevent the page from actually trying to open and view the file
      e.stopPropagation() // Stop the event from propagating to parent elements
    })

    // Add test file when in development mode
    if(process.env.NODE_ENV == 'development') {
      this.loadFile(__static + '/main.brd')
    }
  },
  methods: {
    loadFile (path) {
      const pathInfo = Path.parse(path)

      const file = {
        name: pathInfo.base,
        path: path,
        body: fs.readFileSync(path).toString()
      }
      
      this.$emit('fileLoaded', file)
    }
  }
}

var ce, c, h, w
var cTransform;

function setupCanvas() {
  ce = document.getElementById('viewer')
  c = ce.getContext('2d')
  window.addEventListener('resize', function setCanvasSize() {
    h = ce.clientHeight;
    w = ce.clientWidth;
    ce.setAttribute('height', h)
    ce.setAttribute('width', w)
    return setCanvasSize
  }())

  d3.select(ce).call(d3.zoom().scaleExtent([1/8, 8]).on('zoom', (e) => cTransform = d3.event.transform))

  window.requestAnimationFrame(render.bind(this));
}

// Unit scale
function us(value) {
  return value * 5
}

function render() {
  c.save()
  c.clearRect(0, 0, w, h)
  if(cTransform) {
    c.translate(cTransform.x, cTransform.y);
    c.scale(cTransform.k, cTransform.k);
  }

  // Draw paths
  let lastHole;
  this.holes.forEach((hole, i) => {
    if(lastHole && lastHole.d != hole.d) { // End previous
      c.stroke()
      c.closePath()
    }

    if(!lastHole || lastHole.d != hole.d) { // Start
      c.beginPath()
      c.strokeStyle = `hsl(${hole.hue}, 50%, 50%)`
      c.moveTo(us(hole.x), us(hole.y)) 
    } else {
      c.lineTo(us(hole.x), us(hole.y))
    }

    lastHole = hole
  })
  c.stroke() // End
  c.closePath()

  // Draw holes
  this.holes.forEach((hole) => {
    c.beginPath()
    c.arc(us(hole.x), us(hole.y), (hole.highlighted ? 2 : 1)*us(hole.d)/2, 0, 2*Math.PI)
    c.fillStyle = '#444'
    c.fill()
    c.closePath()
  })


  c.restore()
  window.requestAnimationFrame(render.bind(this));
}
</script>

<style scoped>

#pcb-viewer, #viewer {
  height: 100%;
  width: 100%;
}

</style>