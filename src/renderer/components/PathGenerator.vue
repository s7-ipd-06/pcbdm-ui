<template>
  <div id="path-generator">
    <h2>Path generator</h2>
    <br />
    <table cellpadding="0" cellspacing="0">
      <thead>
          <th>Name</th><th>Total path distance</th>
      </thead>
      <tbody>
        <tr v-for="path in paths" :class="{ 'active': path.selected }" @click="selectPath(path)">
          <td>{{ path.name }}</td>
          <td>{{ path.totalDistance }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>

var ce, c, h, w;

export default {
  name: 'path-generator',
  props: ['holes'],
  data: () => {
    return {
      paths: [
        {name: 'original', totalDistance: null, selected: false},
        {name: 'algorithm 1', totalDistance: null, selected: false},
        {name: 'algorithm 2', totalDistance: null, selected: false}
      ]
    }
  },
  mounted () {
  },
  methods: {
    selectPath(path) {
      console.log(`Path '${path.name}' selected`)

      path.selected = true;
      this.emit('pathSelected', this)
    }
  },
  watch: {
    holes() {
      let previousHole = null
      let totalDistance = 0
      this.holes.forEach((hole) => {
        if(previousHole) {
          const distance = Math.sqrt(Math.pow(Math.abs(hole.x-previousHole.x), 2) + Math.pow(Math.abs(hole.y-previousHole.y), 2))
          totalDistance += distance
        }
        console.log(totalDistance)
        previousHole = hole;
      })
      totalDistance = Math.round(totalDistance)
      console.log(totalDistance)
      this.paths[0].totalDistance = totalDistance
    }
  }
}

</script>

<style scoped>

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
tr {
  cursor: pointer;
}

</style>