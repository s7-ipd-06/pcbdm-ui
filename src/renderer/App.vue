<template>
  <div id="app">
    <aside id="sidebar-left">
      <h1>Files</h1>
      <file-list @fileSelected="fileSelected"></file-list>
    </aside>

    <section id="main">
      <pcb-viewer :holes="holes"></pcb-viewer>
      <path-generator :holes="holes"></path-generator>
      <div style="clear: both"></div>
      <br />
      <hole-list :holes="holes"></hole-list>
    </section>

    <aside id="sidebar-right">
      <!-- ProcessController -->
      <serial-monitor></serial-monitor>
      <!-- ManualControls -->
    </aside>
  </div>
</template>

<script>
  import FileList from '@/components/FileList'
  import HoleList from '@/components/HoleList'
  import SerialMonitor from '@/components/SerialMonitor'
  import PcbViewer from '@/components/PCBViewer'
  import PathGenerator from '@/components/PathGenerator'

  const fs = require('fs')
  import HoleExtractor from '../lib/hole-extractor.js'

  export default {
    name: 'pcbdm-ui',
    components: {
      FileList,
      HoleList,
      SerialMonitor,
      PcbViewer,
      PathGenerator
    },
    data () {
      return {
        holes: []
      }
    },
    /*computed: {
      holeSizes () {
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
      }
    },*/
    mounted () {
    },
    methods: {
      fileSelected (file) {
        const fileContents = fs.readFileSync(file.path).toString()
        
        HoleExtractor(fileContents)
        .then((holes) => {
          this.holes = holes.map((hole) => {
            hole.hue = 0
            hole.highlighted = false
            return hole
          })
          this.holes = this.holes.sort((a, b) => a.d - b.d)
        })
        .catch((e) => {throw e})
      }
    },
    watch: {
      holes () {
        let holeSizes = this.holes.reduce((initial, hole) => {
          if(initial.indexOf(hole.d) == -1) initial.push(hole.d)
          return initial
        }, []).sort()
        
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

        this.holes.forEach((hole) => {
          const holeSize = holeSizes.find((h) => h.d == hole.d)
          hole.hue = holeSize.hue
        })
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

</style>
