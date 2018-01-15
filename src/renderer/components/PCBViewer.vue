<template>
  <div id="pcb-viewer">
    <canvas id="viewer" width="420" height="300"></canvas>
  </div>
</template>

<script>

const fs = require('fs')
const uniqid = require('uniqid')
const Path = require('path')
const isXML = require('is-xml')
const eagle2svg = require('eagle2svg')
const EventEmitter = require('events').EventEmitter

var ce, c, h, w;

class File extends EventEmitter {
  constructor(path) {
    super(path)

    this.path = path
    this.pathInfo = Path.parse(path)
    this.selected = false
    this.name = this.pathInfo.base
    this.thumbnail = ''

    // Get extension for future use
    const pathInfo = Path.parse(path)

    // Load file
    this.contents = fs.readFileSync(path).toString()

    // Generate & save the thumbnail
    this.generateThumbnail()
    .then((thumbnailContents) => {
      const thumbPath = '/temp/' + uniqid() + '.svg'
      fs.writeFile(__static + thumbPath, thumbnailContents, () => {
        this.thumbnail = '/static' + thumbPath
      })
    })
    .catch((err) => {
      console.error(err)
      throw err
    })
  }

  /**
   * Generates the thumbnail based on the path
   */
  generateThumbnail() {
    return new Promise((resolve, reject) => {
      if(!isXML(this.contents)) reject('No XML')
      if(this.pathInfo.ext != '.brd') reject('No .brd file')
      
      eagle2svg(this.contents, { width: 80, height: 60 })
      .then((result) => {
        resolve(result)
      })
      .catch(reject)
    })
  }

  select() {
    this.selected = true;
    this.emit('select', this)
  }

  deselect() {
    this.selected = false;
    this.emit('deselect')
  }
}

export default {
  name: 'pcb-viewer',
  props: ['holes'],
  mounted () {
    ce = document.getElementById('viewer')
    c = ce.getContext('2d')
    h = parseInt(ce.getAttribute('height'))
    w = parseInt(ce.getAttribute('width'))

    window.requestAnimationFrame(render.bind(this));
    
    var dropzone = this.$el;
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault() // Prevent the page from actually trying to open and view the file
      e.stopPropagation() // Stop the event from propagating to parent elements

      dropzone.classList.remove('dropTarget')

      for (let f of e.dataTransfer.files) {
        loadFile.bind(this)(f.path)
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
      loadFile.bind(this)(__static + '/main.brd')
    }
  }
}



function loadFile(path) {
  const newFile = new File(path)

  this.file = newFile

  this.$emit('fileLoaded', newFile)

  return newFile
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
    // End previous
    if(lastHole && lastHole.d != hole.d) {
      c.stroke()
      c.closePath()
    }

    // Start
    if(!lastHole || lastHole.d != hole.d) {
      c.beginPath()
      c.strokeStyle = `hsl(${hole.hue}, 50%, 50%)`
      c.moveTo(us(hole.x), us(hole.y)) 
    } else {
      c.lineTo(us(hole.x), us(hole.y))
    }

    lastHole = hole
  })
  // End
  c.stroke()
  c.closePath()


  c.restore()
  window.requestAnimationFrame(render.bind(this));
}
</script>

<style scoped>


</style>