<template>
  <div id="app">
    <aside id="sidebar-left">
      <hole-list :holes="holes" @loadFile="loadFile"></hole-list>
    </aside>

    <section id="main">
      <pcb-viewer :holes="holes" :path="path" @loadFile="loadFile"></pcb-viewer>
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
  const fs = require('fs')
  const Path = require('path')

  import HoleList from '@/components/HoleList'
  import SerialMonitor from '@/components/SerialMonitor'
  import PcbViewer from '@/components/PCBViewer'

  import HoleExtractor from '../lib/hole-extractor.js'
  import HoleSorter from '../lib/hole-sorter.js'

  export default {
    name: 'pcbdm-ui',
    components: {
      HoleList,
      PcbViewer,
      SerialMonitor
    },
    data () {
      return {
        file: {
          name: ''
        },
        holes: [],
        holeSizes: [],
        pc: { // Proces Controller
          playing: false
        },
        path: []
      }
    },
    computed: {
      progress () {
        return 25;
      }
    },
    mounted () {
      // Add test file when in development mode
      if(process.env.NODE_ENV == 'development') {
        var files = fs.readdirSync(__static + '/testboards/').filter(f => f.substr(0, 1) != '.')
        var randomFile = files[Math.floor(Math.random()*files.length)]
        //randomFile = 'wagencontroller.brd';
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

        console.log('App: PCBViewer@loadFile: ', file.path)
        this.file = file;

        console.log('Extracting holes')

        HoleExtractor(file.body)
        .then((holes) => {
          console.log('Holes extracted')

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
          holeSizes = holeSizes.map((hs, i) => {
            hs.hue = i*210 % 360;
            return hs;
          })
          this.holeSizes = holeSizes

          // Apply colors to holes
          holes.forEach((hole, index) => {
            const holeSize = holeSizes.find((h) => h.d == hole.d)
            hole.hue = holeSize.hue
            hole.index = index
          })

          console.log('Sorting holes...')
          
          var hs = new HoleSorter(holes)
          .on('sorted', (sortedHoles) => {
            // Add extra properties to be populated later
            this.holes = sortedHoles.map((hole, i) => {
              hole.optimizedIndex = i
              hole.highlighted = false
              hole.drilled = false
              return hole
            })
          })
        })
        .catch((e) => {throw e})
      }
    },
    watch: {
      holes (holes) {
        const path = [];

        let ph; // Previous hole
        holes.forEach((h) => {
          if(h.drilled) return;

          if(!ph) {
            path.push({ x: 0, y: 0, x2: h.x, y2: h.y, w: 1, c: `hsl(0, 0%, 50%)` })
          } else {
            if(ph.d == h.d) {
              path.push({ x: ph.x, y: ph.y, x2: h.x, y2: h.y, w: 2, c: `hsl(${h.hue}, 50%, 50%)` })
            } else {
              path.push({ x: ph.x, y: ph.y, x2: h.x, y2: h.y, w: 1, c: `hsl(0, 0%, 50%)` })
            }
          }

          ph = h;
        })

        this.path = path;
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


</style>
