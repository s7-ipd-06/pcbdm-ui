<template>
  <div id="hole-list">
    <div class="drop-here">
      <span class="drop-here-icon"></span>
      <br />
      <span>Drop your .brd file</span>
    </div>

    <table cellpadding="0" cellspacing="0">
      <thead>
        <tr>
          <th>#</th>
          <th>x</th>
          <th>y</th>
          <th>diameter</th>
          <th>state</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="hole in holes" :class="{ 'active': hole.selected, 'highlighted': hole.highlighted }"  :style="{ 'background-color': 'hsl(' + hole.hue + ', 100%, 95%)' }" @mouseover="hole.highlighted = true" @mouseout="hole.highlighted = false" >
          <td>{{ hole.optimizedIndex }}</td>
          <td>{{ hole.x }}</td>
          <td>{{ hole.y }}</td>
          <td>{{ hole.d }}</td>
          <td>{{ hole.state }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>

const fs = require('fs')
const Path = require('path')
const EventEmitter = require('events').EventEmitter

export default {
  name: 'hole-list',
  props: ['holes'],
  mounted () {
    // File drop
    var dropzone = this.$el;
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault() // Prevent the page from actually trying to open and view the file
      e.stopPropagation() // Stop the event from propagating to parent elements

      dropzone.classList.remove('dropTarget')

      for (let f of e.dataTransfer.files) {
        this.$emit('loadFile', f.path)
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
  }
}

</script>

<style scoped>

.drop-here {
  position: absolute;
  top: 45%;
  left: 16px;
  right: 16px;
  padding: 16px;
  border: 3px dashed #ccc;
  border-radius: 12px;
  text-align: center;
  color: #aaa;
  z-index: -9;
}

.drop-here span {
  display: inline-block;
}

.drop-here .drop-here-icon {
  height: 50px;
  width: 50px;
  margin-bottom: 16px;

  -webkit-mask-image: url('/static/drop-file.svg');
  mask-image: url('/static/drop-file.svg');
  background-color: #ccc;
}

.dropTarget {
  box-shadow: inset 0 0 24px #888;
  background-color: #fafafa;
  transition: all 200ms;
}

#hole-list {
  display: block;
  overflow-y: scroll;
  height: 100%;
}
  #hole-list table {
    width: 100%;
  }
  table {
    font-size: 10px;
  }
  td, th {
    padding: 5px;
    border-bottom: 1px solid #dfdfdf;
    border-right: 1px solid #dfdfdf;
  }
  tr td:last-of-type, tr th:last-of-type {
    border-right: none;
  }
  tr:last-of-type {
    border-bottom: none;
  }
  th {
    background: #555;
    font-weight: normal;
    color: #fff;
  }
  tr.highlighted {
    opacity: 0.8;
  }

</style>
