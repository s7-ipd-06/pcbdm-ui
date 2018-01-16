<template>
  <div id="pcb-viewer">
    <svg id="viewer">
      <defs>
        <clipPath id="clippath-pcb-area">
          <rect x="0" y="0" class="clip-xy" width="9999" height="9999" />
        </clipPath>
        <clipPath id="clippath-pcb-area-y-only">
          <rect x="0" y="0" class="clip-y" width="9999" height="9999" />
        </clipPath>
      </defs>
      <g id="g-xfixed"></g>
      <g id="g-yfixed-wrapper" clip-path="url(#clippath-pcb-area-y-only)">
        <g id="g-yfixed"></g>
      </g>
      <g id="g-flipped"></g>
      <g id="g-panzoom-wrapper" clip-path="url(#clippath-pcb-area)">
        <g id="g-panzoom">
          <g id="g-coordinatesystem">
            <g id="g-pcb"></g>
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>

<script>

const fs = require('fs')
const uniqid = require('uniqid')
const Path = require('path')
const isXML = require('is-xml')
const eagle2svg = require('eagle2svg')
const EventEmitter = require('events').EventEmitter

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
      var files = fs.readdirSync(__static + '/testboards/');
      var randomFile = files[Math.floor(Math.random()*files.length)]
      randomFile = 'wagencontroller.brd';
      this.loadFile(__static + '/testboards/' + randomFile)
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

// Every unit = pixels
function us(value) {
  return value * 8
}

var se, s, h, w
var gsf; // Flipped root g-element
var gpz; // Panned & zoomed g-element
  var gc; // Coordinate system
    var gpcb;
  var gx; // X-axis g, y-fixed
  var gy; // Y-axis g, x-fixed

function setupCanvas() {
  se = document.getElementById('viewer') // The <SVG> element
  s = d3.select(se) // D3 object of <SVG> element

  // Insert main groups
  gpz = d3.select('#g-panzoom') // Group with pan- & zoom-able objects such as the coordinate system
  gc = d3.select('#g-coordinatesystem') // Group containing coordinate-system positioned objects
    .attr('transform', `translate(${rulerWidth}, -${rulerWidth})`)
  gpcb = d3.select('#g-pcb')

  gx = d3.select('#g-yfixed'); // Group with objects fixed in the y direction
  gy = d3.select('#g-xfixed'); // Group with objects fixed in the x direction

  gsf = s.select('#g-flipped') // Same as SVG but flipped

  drawRulers()

  // Things that need to be updated when the size of the canvas changes
  window.addEventListener('resize', function setCanvasSize() {
    h = se.clientHeight;
    w = se.clientWidth;
    se.setAttribute('height', h)
    se.setAttribute('width', w)

    d3.select('.clip-xy')
      .attr('width', w)
      .attr('height', h-rulerWidth)
      .attr('x', rulerWidth)
    d3.select('.clip-y')
      .attr('width', w)
      .attr('height', h)
      .attr('x', rulerWidth)

    updateRulers();

    gsf.attr('transform', `translate(0, ${h}) scale(1, -1)`)

    // Flip PCB
    gpcb.attr('transform', `translate(0, ${h}) scale(1, -1)`)

    return setCanvasSize
  }())

  // Zoom & pan
  d3.select(se).call(d3.zoom().scaleExtent([1, 1]).on('zoom', (e) => {
    gpz.attr('transform', d3.event.transform)

    gx.attr('transform', `translate(${d3.event.transform.x}, 0) scale(${d3.event.transform.k}, 1)`)
    gy.attr('transform', `translate(0, ${d3.event.transform.y}) scale(1, ${d3.event.transform.k})`)
  }));

  // Start render loop
  window.requestAnimationFrame(render.bind(this));
}

var rulerWidth = 15;
var rulerTextOffset = 6;
var rulerLength = 1000; // 100mm
var tickInterval = 5; // A tick & gridline every 10mm
var numTicks = rulerLength/tickInterval;
var rulerBackground = '#555'
var rulerBorderColor = '#222'
var gridlineColor = '#aaa'
function drawRulers() {
  var xScale = d3.scaleLinear()
    .domain([-rulerLength, rulerLength])
    .range([-us(rulerLength), us(rulerLength)]);

  var xAxis = d3.axisBottom(xScale)
    .ticks(2*numTicks)
    .tickSize(-us(rulerLength)) // Height of tick gridline

  gx.append('g')
    .attr('id', 'ruler-x')
    .call(g => {
      g.append('rect')
        .attr('x', -us(rulerLength))
        .attr('y', 0)
        .attr('width', 2*us(rulerLength))
        .attr('height', rulerWidth)
        .attr('fill', rulerBackground)
      
      g.call(xAxis);
    })
    .call(axisStyle)

  var yScale = d3.scaleLinear()
    .domain([-rulerLength, rulerLength])
    .range([us(rulerLength), -us(rulerLength)]);

  var yAxis = d3.axisLeft(yScale)
    .ticks(2*numTicks)
    .tickSize(-us(rulerLength)) // Height of tick gridline

  gy.append('g')
    .attr('id', 'ruler-y')
    .call((g) => {
      g.append('rect')
        .attr('x', -rulerWidth)
        .attr('y', -us(rulerLength))
        .attr('width', rulerWidth)
        .attr('height', 2*us(rulerLength))
        .attr('fill', rulerBackground)

      g.call(yAxis);
    
      g.selectAll('text')
        .attr('y', -6)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
    })
    .call(axisStyle)

  function axisStyle(g) {
    g.select('.domain').attr('stroke', rulerBorderColor);

    g.selectAll('text')
      .attr('fill', 'white')

    g.selectAll('.tick > line')
      .attr('stroke', gridlineColor)

    g.selectAll('.tick').filter((d, i) => i === numTicks).select('line')
      .attr('stroke', 'black')
  }

  gsf.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', rulerWidth)
    .attr('height', rulerWidth)
    .attr('fill', rulerBorderColor)
  gsf.append('text')
    .attr('x', rulerWidth/2)
    .attr('y', -rulerWidth)
    .attr('fill', 'white')
    .attr('dy', '0.32em')
    .attr('font-size', '8px')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(0, ${rulerWidth/-2}) scale(1, -1)`)
    .text('mm')
}

function updateRulers() {
  d3.select('#ruler-y')
    .attr('transform', `translate(${rulerWidth}, ${(h - us(0*rulerLength) - rulerWidth)})`)
    //.attr('y', -w+rulerTextOffset)

  d3.select('#ruler-x')
    .attr('transform', `translate(${rulerWidth}, ${(h - rulerWidth)})`)
}

function updatePCB(g) {
  var holes = this.holes;
  var holeSizes = this.holeSizes;

  if(holeSizes) {
    var polyline = g.selectAll('polyline')
      .data(this.holeSizes);
    
      polyline.exit().remove();
      
      polyline.enter().append('polyline')
        .attr('fill', 'none')
      .merge(polyline)
        .attr('stroke', (hs) => `hsl(${hs.hue}, 50%, 50%)`)
        .attr('stroke-width', 2)
        .attr('stroke-linejoin', 'round')
        .attr('points', (hs) => hs.holes.reduce((i, h) => {
          i.push(us(h.x) + ' ' + us(h.y));
          return i
        }, []))
  }
  
  var circle = g.selectAll('circle')
    .data(holes);
  
    circle.exit().remove();
    
    circle.enter().append('circle')
      .attr('fill', '#444')
    .merge(circle)
      .attr('cx', (h) => us(h.x))
      .attr('cy', (h) => us(h.y))
      .attr('r', (h) => (h.highlighted ? 2 : 1)*us(h.d)/2)
}

function render() {
  updatePCB.bind(this)(gpcb)

  window.requestAnimationFrame(render.bind(this));
}
</script>

<style scoped>

#pcb-viewer, #viewer {
  height: 100%;
  width: 100%;
}

</style>