<template>
  <div id="path-generator">
    <h2>Path generator</h2>
    <br />
    <table cellpadding="0" cellspacing="0">
      <thead>
          <th>Name</th><th>Total path distance</th>
      </thead>
      <tbody>
        <tr v-for="gen in generators" :class="{ 'active': gen.selected }" @click="selectPath(gen)">
          <td>{{ gen.name }}</td>
          <td>{{ gen.totalDistance }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>

const { spawn } = require('child_process');

export default {
  name: 'path-generator',
  props: ['holes'],
  data: () => {
    return {
      generators: [
        {command: {cmd: 'node', args: ['./src/lib/pathgenerators/original.js']}, name: 'Original', totalDistance: null, selected: false, holes: []},
        {command: {cmd: 'node', args: ['./src/lib/pathgenerators/x-sorted.js']}, name: 'X sorted', totalDistance: null, selected: false, holes: []},
        {command: {cmd: 'node', args: ['./src/lib/pathgenerators/y-sorted.js']}, name: 'Y sorted', totalDistance: null, selected: false, holes: []},
        {command: {cmd: 'node', args: ['./src/lib/pathgenerators/diagonal-sorted.js']}, name: 'Diagonal sorted', totalDistance: null, selected: false, holes: []},
        //{executable: 'node src/lib/pathgenerators/a1.js', name: 'Algorithm 1', totalDistance: null, selected: false, holeOrder: []},
      ]
    }
  },
  mounted () {
  },
  methods: {
    selectPath(path) {
      console.log(`Path '${path.name}' selected`)

      const holeByIndex = (index) => this.holes.find((h) => h.index == index)

      // Apply new order
      path.holes.forEach((hole, index) => {
        holeByIndex(hole.index).optimizedIndex = index
      })
      this.holes.sort((a, b) => a.optimizedIndex - b.optimizedIndex)

      path.selected = true;
      this.$emit('pathSelected', this)
    }
  },
  watch: {
    holes(val, oldVal) {
      // Don't update if the optimizedIndexes have been changed
      if(val.length == oldVal.length) {
        const anyChange = val.reduce((difference, item, index) => {
          if(difference) return true;
          if(item.optimizedIndex != oldVal[index].optimizedIndex) return true;
          return false;
        }, false)

        if(anyChange) return;
      }
      console.log('PathGenerator.vue: Watcher triggered')
      
      // Sort holes to original index (sorted by diameter)
      let holesNormalized = this.holes.slice(0).sort((a, b) => a.index - b.index)

      // Calculate paths with algorithms
      this.generators.forEach((gen) => {
        let holesRange = [];

        let optimizedHoles = [];

        holesNormalized.forEach((hole, index, array) => {
          const previousHole = array[index-1]
          
          // Create groups per diameter
          if(previousHole && (hole.d != previousHole.d || index == array.length-1)) {
            if(index == array.length-1) holesRange.push(hole)

            const child = spawn(gen.command.cmd, gen.command.args);

            child.stdin.write(JSON.stringify(holesRange))
            child.stdin.write(Buffer.from([0x0A, 0x0D])) // New line
            child.stdin.end()

            child.on('error', (e) => {
              console.log('error')
              console.error(e)
            })

            child.on('exit', (e) => {
              //console.log('exit', e)
            })

            child.stdout.on('data', (buff) => {
              const sortedRange = JSON.parse(buff.toString())
              
              optimizedHoles = [...optimizedHoles, ...sortedRange]
              
              // Check whether all holes have been processed
              if(optimizedHoles.length == holesNormalized.length) {
                // Reorder the groups by diameter because they are not processed synchronously
                let holeGroups = optimizedHoles.reduce((groups, hole) => {
                  let group = groups.find((group) => group.d == hole.d)
                  if(!group) {
                    groups.push({ d: hole.d, holes: [] })
                    group = groups[groups.length-1]
                  }

                  group.holes.push(hole)
                  return groups
                }, [])
                .sort((a, b) => a.d - b.d)

                optimizedHoles = holeGroups.reduce((holes, group) => {
                  return [...holes, ...group.holes]
                }, [])


                gen.holes = optimizedHoles

                // Calculate path distance
                let previousHole = null
                let totalDistance = 0
                gen.holes.forEach((hole) => {
                  if(previousHole) {
                    if(previousHole.d == hole.d) {
                      const distance = Math.sqrt(Math.pow(Math.abs(hole.x-previousHole.x), 2) + Math.pow(Math.abs(hole.y-previousHole.y), 2))
                      totalDistance += distance
                    }
                  }
                  previousHole = hole;
                })
                
                totalDistance = Math.round(totalDistance)
                
                gen.totalDistance = totalDistance
              }
            });

            child.on('close', () => {
              console.log(`Path generator ${gen.name} executed`)
            })

            holesRange = (typeof last != 'undefined' ? [last] : [])
          }

          holesRange.push(hole)

        })
      })
    },
    generators: {
      handler (val, oldVal) {
        // Don't update if the totalDistance has changed
        const anyChange = val.reduce((difference, item, index) => {
          if(difference) return true;
          if(item.totalDistance != oldVal[index].totalDistance) return true;
          return false;
        }, false)
        if(anyChange) return;

        this.generators.sort((a, b) => {
          return a.totalDistance - b.totalDistance
        })
      }
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