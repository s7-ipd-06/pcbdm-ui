<template>
  <div id="list" class="full-height">
    <div v-for="file in files" class="file" :class="{ 'active': file.selected }" @click="file.select()">
      <div class="file-thumbnail"><img :src="file.thumbnail" /></div>
      <div class="file-information">
        <div class="file-name" :title="file.name">{{ file.name }}</div>
      </div>
    </div>

    <div class="drop-here">
      <span class="drop-here-icon"></span>
      <br />
      <span>Drop your .brd file here</span>
    </div>
  </div>
</template>

<script>

import RenderThumbnail from './FileList/lib/render-thumbnail.js'
const fs = require('fs')
const uniqid = require('uniqid')
const Path = require('path')
const isXML = require('is-xml')
const eagle2svg = require('eagle2svg')
const EventEmitter = require('events').EventEmitter

const config = {
  thumbnailPath: 'static/temp/thumbnails/'
}

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
  name: 'file-list',
  data () {
    return {
      files: []
    }
  },
  mounted () {
    const list = this.$el;
    
    list.addEventListener('drop', (e) => {
      e.preventDefault() // Prevent the page from actually trying to open and view the file
      e.stopPropagation() // Stop the event from propagating to parent elements

      list.classList.remove('dropTarget')

      for (let f of e.dataTransfer.files) {
        addFile.bind(this)(f.path)
      }
    })

    list.addEventListener('dragleave', (e) => {
      list.classList.remove('dropTarget')
    })
    
    list.addEventListener('dragover', (e) => {
      list.classList.add('dropTarget')
      e.preventDefault() // Prevent the page from actually trying to open and view the file
      e.stopPropagation() // Stop the event from propagating to parent elements
    })

    // Add test file when in development mode
    if(process.env.NODE_ENV == 'development') {
      addFile.bind(this)(__static + '/main.brd')
    }
  }
}

function addFile(path) {
  const newFile = new File(path)
  .on('select', (file) => {
    this.$emit('fileSelected', file)
    this.files.filter((file) => file != newFile).forEach((file) => file.deselect())
  })

  this.files.push(newFile)

  // If no file selected yet, select this file
  if(this.files.filter((file) => file.selected).length == 0) {
    newFile.select()
  }

  return newFile
}

</script>

<style scoped>

#list {
  position: absolute;
  top: 38px;
  bottom: 0;
  width: 100%;
  overflow-y: scroll;
}

#list .drop-here {
  position: relative;
  top: 16px;
  margin: 0 16px;
  padding: 16px;
  border: 3px dashed #ccc;
  border-radius: 12px;
  text-align: center;
  color: #aaa;
}

#list .drop-here span {
  display: inline-block;
}

#list .drop-here .drop-here-icon {
  height: 50px;
  width: 50px;
  margin-bottom: 16px;

  -webkit-mask-image: url('/static/drop-file.svg');
  mask-image: url('/static/drop-file.svg');
  background-color: #ccc;
}

#list.dropTarget {
  box-shadow: inset 0 0 24px #888;
  background-color: #fafafa;
  transition: all 200ms;
}

.file {
  border-bottom: 1px solid #dfdfdf;
  display: flex;
  cursor: pointer;
}

.file.active {
  background: #fff;
}

.file-thumbnail {
  margin: 8px;
  border: 1px solid #ddd;
  height: 60px;
  min-width: 80px;
  box-shadow: inset 0 0 16px #ddd;
}
  .file-thumbnail img {

  }

.file-information {;
  flex: 1;
  padding: 8px 8px 8px 0;
}

.file-name {
  display: inline-block;
  width: 180px;
  font-size: 1em;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>
