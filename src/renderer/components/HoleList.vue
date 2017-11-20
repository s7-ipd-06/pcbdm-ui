<template>
  <div id="hole-list">
    <h2>Holes</h2>
    <table cellpadding="0" cellspacing="0">
      <thead>
        <tr>
          <th>x</th>
          <th>y</th>
          <th>diameter</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="hole in holes" :class="{ 'active': hole.selected }" @click="hole.select()">
          <td>{{ hole.x }}</td>
          <td>{{ hole.y }}</td>
          <td>{{ hole.diameter }}</td>
        </tr>
      </tbody>
    </table>
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
  mounted () {
    setInterval(() => {
     console.log(this.holes.length);
    }, 1000)
  }
}

</script>

<style scoped>
table {
  border-top: 1px solid #dfdfdf;
  border-left: 1px solid #dfdfdf;
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
</style>