<template>
  <div id="app">
    <aside id="sidebar-left">
      <div id="hole-list">
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
    </aside>

    <section id="main">
      <pcb-viewer @fileLoaded="fileLoaded" :holes="holes"></pcb-viewer>
    </section>

    <aside id="sidebar-right">
      <div id="process-controller">
        <h3>main.brd</h3>
        Filename: main.brd

        Total distance, estimated drill time:

        <button type="button" class="btn" id="pc-playpause">
          <span class="glyphicon" :class="[pc.playing ? 'glyphicon-pause' : 'glyphicon-play']" aria-hidden="true"></span>
        </button>
        <button type="button" class="btn" id="pc-stop">
          <span class="glyphicon glyphicon-stop" aria-hidden="true"></span>
        </button>

        <div class="progress">
          <div class="progress-bar" role="progressbar" :style="{ width: progress + '%' }" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">{{ progress }}%</div>
        </div>

        Drilled 0 of 24 holes.<br />
        Drilled 900 of 14343 mm<br />
        Average time per hole: 2.4 s<br />
        Estimated drill time left: 4:32<br />
        <br />
      </div>

      <!-- <serial-monitor></serial-monitor> -->
      <!-- ManualControls -->
    </aside>
  </div>
</template>

<script>
  import SerialMonitor from '@/components/SerialMonitor'
  import PcbViewer from '@/components/PCBViewer'

  const fs = require('fs')
  import HoleExtractor from '../lib/hole-extractor.js'

  export default {
    name: 'pcbdm-ui',
    components: {
      PcbViewer
    },
    data () {
      return {
        holes: [],
        pc: { // Proces Controller
          playing: false
        }
      }
    },
    computed: {
      progress () {
        return 25;
      }
      /*holeSizes () {
        let holeSizes = this.holes.reduce((initial, hole) => {
          if(initial.indexOf(hole.d) == -1) initial.push(hole.d)
          return initial
        }, []).sort()
        
        const min = holeSizes[0]
        const max = holeSizes[holeSizes.length-1]
        const delta = max-min

        holeSizes = holeSizes.map((hole) => {
          const hue = 360 * (hole-min) / delta;

          return {
            d: hole,
            hue: hue
          }
        })

        this.holeSizes = holeSizes

        return holeSizes
      }*/
    },
    mounted () {
    },
    methods: {
      fileLoaded (file) {
        const fileContents = fs.readFileSync(file.path).toString()
        console.log('File loaded, loading holes')
        HoleExtractor(fileContents)
        .then((holes) => {
          holes.sort((a, b) => a.d - b.d)

          // Add extra properties to be populated later
          this.holes = holes.map((hole, i) => {
            hole.index = i
            hole.optimizedIndex = i
            hole.hue = 0
            hole.highlighted = false
            return hole
          })
        })
        .catch((e) => {throw e})
      }
    },
    watch: {
      holes: {
        handler (val, oldVal) {
          /* Check for differences in:
           * hole.optimizedIndex  When the order has been changed by the path generator
           */
          if(val.length == oldVal.length) {
            const anyChange = val.reduce((difference, item, index) => {
              if(difference) return true;
              if(item.optimizedIndex != oldVal[index].optimizedIndex) return true;
              return false;
            }, false)

            if(!anyChange) return;
          }
          //console.log('App.vue: Watcher triggered', val.length, oldVal.length)

          // Generate array with the hole sizes
          let holeSizes = this.holes.reduce((initial, hole) => {
            if(initial.indexOf(hole.d) == -1) initial.push(hole.d)
            return initial
          }, []).sort()
          
          // Generate colors per hole size
          const min = holeSizes[0]
          const max = holeSizes[holeSizes.length-1]
          const delta = max-min
          holeSizes = holeSizes.map((hole) => {
            const hue = (380 * (hole-min) / delta) % 360;

            return {
              d: hole,
              hue: hue
            }
          })

          this.holeSizes = holeSizes

          // Apply colors to holes
          this.holes.forEach((hole, index) => {
            const holeSize = holeSizes.find((h) => h.d == hole.d)
            hole.hue = holeSize.hue
          })

          // Sort holes by optimizedIndex
          //this.holes.sort((a, b) => a.optimizedIndex - b.optimizedIndex)
        },
        deep: true
      }
    }
  }
</script>

<style>
::selection {
  background: rgba(55, 135, 255, 0.75);
  color: #fff;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  outline: 0;
  -webkit-tap-highlight-color: none;
  border: 0;
}

html, body {
  height: 100%;
}

body {
  font-family: 'Open Sans', 'Helvetica Neue';
  font-size: 12px;
  color: #222;
}

#app {
  height: 100%;
}

aside {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 280px;

  border-color: #d7d7d7;
  border-style: solid;
  border-width: 0;
  background: rgba(147, 128, 108, 0.098);
  box-shadow: inset 0 0 16px 0px #d0d0d0;
}

#main {
  margin-left: 280px;
  padding: 10px;
}

aside h1 {
  border-bottom: 1px solid #000;
  background: rgb(75, 75, 75);
  color: #fff;

  font-size: 1.5em;
  padding: 8px 16px;
  height: 38px;
}

#sidebar-left {
  left: 0;
  /*border-right-width: 1px;*/
}

#sidebar-right {
  right: 0;
  /*border-left-width: 1px;*/
}

#pcb-viewer {
  float: left;
  margin-right: 25px;
}

#path-generator {
  float: left;
}

.holes-list {
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
