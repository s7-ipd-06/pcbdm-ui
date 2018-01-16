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
            </tr>
          </thead>
          <tbody>
            <tr v-for="hole in holes" :class="{ 'active': hole.selected, 'highlighted': hole.highlighted }"  :style="{ 'background-color': 'hsl(' + hole.hue + ', 100%, 95%)' }" @mouseover="hole.highlighted = true" @mouseout="hole.highlighted = false" >
              <td>{{ hole.optimizedIndex }}</td>
              <td>{{ hole.x }}</td>
              <td>{{ hole.y }}</td>
              <td>{{ hole.d }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </aside>

    <section id="main">
      <pcb-viewer @fileLoaded="fileLoaded" :holes="holes" :holeSizes="holeSizes"></pcb-viewer>
    </section>

    <aside id="sidebar-right">
      <div id="process-controller">
        <h5>{{ file.name }}</h5>

        Total distance, estimated drill time:

        <button type="button" :class="['btn', pc.playing ? 'btn-danger' : 'btn-success']" id="pc-playpause">
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

      <serial-monitor></serial-monitor>
      <!-- ManualControls -->
    </aside>
  </div>
</template>

<script>
  import SerialMonitor from '@/components/SerialMonitor'
  import PcbViewer from '@/components/PCBViewer'

  const fs = require('fs')
  import HoleExtractor from '../lib/hole-extractor.js'
  import HoleSorter from '../lib/hole-sorter.js'

  export default {
    name: 'pcbdm-ui',
    components: {
      PcbViewer,
      SerialMonitor
    },
    data () {
      return {
        file: {
          name: ''
        },
        fileStatus: {
          message: '',
          type: 'default'
        },
        holes: [],
        holeSizes: [],
        pc: { // Proces Controller
          playing: false
        }
      }
    },
    computed: {
      progress () {
        return 25;
      }
    },
    mounted () {
    },
    methods: {
      fileLoaded (file) {
        console.log('App: PCBViewer@fileLoaded: ', file.path)
        this.file = file;

        HoleExtractor(file.body)
        .then((holes) => {
          // Group holes by diameter
          let holeSizes = holes.reduce((initial, hole) => {
            if(!initial.find((hs) => hs.d == hole.d)) initial.push({
              d: hole.d,
              holes: []
            })
            initial[initial.length-1].holes.push(hole)
            return initial
          }, []).sort((a, b) => a.d - b.d)
          
          // Generate colors per hole size
          const min = holeSizes[0].d
          const max = holeSizes[holeSizes.length-1].d
          const delta = max-min
          holeSizes = holeSizes.map((hs) => {
            hs.hue = (380 * (hs.d-min) / delta) % 360;
            return hs;
          })

          this.holeSizes = holeSizes

          // Apply colors to holes
          holes.forEach((hole, index) => {
            const holeSize = holeSizes.find((h) => h.d == hole.d)
            hole.hue = holeSize.hue
            hole.index = index
          })

          this.fileStatus.message = `Sorting holes...`;
          
          var hs = new HoleSorter(holes)
          .on('sorted', (sortedHoles) => {
            // Add extra properties to be populated later
            this.holes = sortedHoles.map((hole, i) => {
              hole.optimizedIndex = i
              hole.highlighted = false
              return hole
            })
          })
        })
        .catch((e) => {throw e})
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

  border-color: #d7d7d7;
  border-style: solid;
  border-width: 0;
  background: rgba(147, 128, 108, 0.098);
/*  box-shadow: inset 0 0 16px 0px #d0d0d0;*/
}

#main {
  position: absolute;
  left: 240px;
  right: 280px;
  top: 0;
  bottom: 0;
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
  width: 240px;
  /*border-right-width: 1px;*/
}

#sidebar-right {
  right: 0;
  width: 280px;
  /*border-left-width: 1px;*/
}

#pcb-viewer {
  float: left;
  margin-right: 25px;
}

#path-generator {
  float: left;
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
