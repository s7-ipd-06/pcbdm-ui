<template>
  <div id="pcb-viewer">
    <svg id="viewer"></svg>
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
  props: ['holes', 'holeSizes'],
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

var se, s, h, w
var mg; // master g-element

function setupCanvas() {
  se = document.getElementById('viewer')
  s = d3.select(se)
  window.addEventListener('resize', function setCanvasSize() {
    h = se.clientHeight;
    w = se.clientWidth;
    se.setAttribute('height', h)
    se.setAttribute('width', w)
    return setCanvasSize
  }())

  mg = s.append('g');

  d3.select(se).call(d3.zoom().scaleExtent([1/8, 8]).on('zoom', (e) => mg.attr('transform', d3.event.transform)));

  /*s.selectAll('circle')
  .data(this.holes)
  .enter().append('circle')
    .attr('cx', function(h) { return us(h.x); })
    .attr('cy', function(h) { return us(h.y); })
    .attr('r', (h) => (h.highlighted ? 2 : 1)*us(h.d)/2);*/
  /*
  <polyline fill="none" stroke="black" 
      points="20,100 40,60 70,80 100,20"/>
      */
  window.requestAnimationFrame(render.bind(this));
}

// Unit scale
function us(value) {
  return value * 5
}

function render() {
  var holes = this.holes;
  var holeSizes = this.holeSizes;

  if(holeSizes) {
    var polyline = mg.selectAll('polyline')
      .data(this.holeSizes);
    
      polyline.exit().remove();
      
      polyline.enter().append('polyline')
        .attr('fill', 'none')
      .merge(polyline)
        .attr('stroke', (hs) => `hsl(${hs.hue}, 50%, 50%)`)
        .attr('points', (hs) => hs.holes.reduce((i, h) => {
          i.push(us(h.x) + ' ' + us(h.y));
          return i
        }, []))
  }
  
  var circle = mg.selectAll('circle')
    .data(holes);
  
    circle.exit().remove();
    
    circle.enter().append('circle')
      .attr('fill', '#444')
    .merge(circle)
      .attr('cx', (h) => us(h.x))
      .attr('cy', (h) => us(h.y))
      .attr('r', (h) => (h.highlighted ? 2 : 1)*us(h.d)/2)

  /*c.save()
  c.clearRect(0, 0, w, h)
  if(cTransform) {
    c.translate(cTransform.x, cTransform.y);
    c.scale(cTransform.k, cTransform.k);
  }*/

  // Draw paths
  /*let lastHole;
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
  c.closePath()*/

  // Draw holes
  /*this.holes.forEach((hole) => {
    c.beginPath()
    c.arc(us(hole.x), us(hole.y), (hole.highlighted ? 2 : 1)*us(hole.d)/2, 0, 2*Math.PI)
    c.fillStyle = '#444'
    c.fill()
    c.closePath()
  })


  c.restore()*/
  window.requestAnimationFrame(render.bind(this));
}
</script>

<style scoped>

#pcb-viewer, #viewer {
  height: 100%;
  width: 100%;
}

</style>