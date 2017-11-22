<template>
  <div id="hole-list">
    <h2>Holes</h2>
    <br />
    <div class="holes-wrapper">
      <table cellpadding="0" cellspacing="0">
        <thead>
          <tr>
            <th>#</th>
            <th>x</th>
            <th>y</th>
            <th>diameter</th>
            <th>optimizedIndex</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="hole in holes" :class="{ 'active': hole.selected, 'highlighted': hole.highlighted }"  :style="{ 'background-color': 'hsl(' + hole.hue + ', 100%, 95%)' }" @mouseover="hole.highlighted = true" @mouseout="hole.highlighted = false" >
            <td>{{ hole.index }}</td>
            <td>{{ hole.x }}</td>
            <td>{{ hole.y }}</td>
            <td>{{ hole.d }}</td>
            <td>{{ hole.optimizedIndex }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>

const fs = require('fs')
const uniqid = require('uniqid')
const Path = require('path')
const isXML = require('is-xml')
const EventEmitter = require('events').EventEmitter

export default {
  name: 'hole-list',
  props: ['holes'],
  /*data: () => {
    return {
      holes
    }
  },*/
  mounted: () => {
    
  }
}

</script>

<style scoped>
.holes-wrapper {
  display: block;
  overflow-y: scroll;
  height: 400px;
}
table {
  border-top: 1px solid #dfdfdf;
  border-left: 1px solid #dfdfdf;
  font-size: 10px;
}
td, th {
  padding: 5px;
  border-bottom: 1px solid #dfdfdf;
  border-right: 1px solid #dfdfdf;
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