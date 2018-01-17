<template>
  <div id="process-controller">
    <h5>{{ file.name }}</h5>

    <button type="button" :class="['btn', playing ? 'btn-danger' : 'btn-success']" v-on:click="playPause">
      <span class="glyphicon" :class="[playing ? 'glyphicon-pause' : 'glyphicon-play']" aria-hidden="true"></span>
    </button>
    <button type="button" class="btn" v-on:click="stop">
      <span class="glyphicon glyphicon-stop" aria-hidden="true"></span>
    </button>

    <!--<div class="progress">
      <div class="progress-bar" role="progressbar" :style="{ width: progress + '%' }" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">{{ progress }}%</div>
    </div>

    Drilled 0 of 24 holes.<br />
    Drilled 900 of 14343 mm<br />
    Average time per hole: 2.4 s<br />
    Estimated drill time left: 4:32<br />-->
    <br />
  </div>
</template>

<script>

const config = {
  z_down: 1,
  z_up: 0
}

var mm2um = (v) => Math.round(v * 1000)

export default {
  name: 'process-controller',
  props: ['file', 'holes', 'messageQueue'],
  data () {
    return {
      playing: false,
      started: false
    }
  },
  created () {
   
  },
  methods: {
    playPause () {
      if(!this.started) {
        this.start()
      } else {
        if(this.playing) {
          this.pause()
          console.log('this.playing = false 1')
          this.playing = false;
        } else {
          this.resume()
          this.playing = true;
        }
      }
    },
    start() {
      console.log('ProcessController: Starting drilling process')
      this.started = true;
      this.playing = true;
      console.log(this.playing)
      this.messageQueue.push({ message: 'G90' }) // Absolute positioning
      this.messageQueue.push({ message: 'G28' }) // Home
    },
    pause() {
      console.log('ProcessController: Pausing drilling process')
    },
    resume() {
      console.log('ProcessController: Resuming drilling process')
      this.messageQueue.push({ message: 'G90' }) // Absolute positioning
      this.messageQueue.push({ message: 'M3' }) // Drill on
    },
    stop() {
      console.log('ProcessController: Stopping drilling process')
      this.started = false
      this.playing = false

      this.messageQueue.push({ message: 'M5' }) // Drill off
      
      // Reset state of all holes
      this.holes.forEach(h => h.state = '')
    },
    end() {
      console.log('ProcessController: Ending drilling process')
      this.messageQueue.push({ message: 'M5' }) // Drill off
    },
    tick() { // Find next hole to drill
      if(!this.playing) return;

      holeLoop: for(var h in this.holes) {
        var hole = this.holes[h]
        
        stateMachine: switch(hole.state) {
          case 'positioning':
            hole.state = 'drilling-down'
            this.messageQueue.push({ message: `G0 Z${config.z_down}` })
            break holeLoop;
          case 'drilling-down':
            hole.state = 'drilling-up'
            this.messageQueue.push({ message: `G0 Z${config.z_up}` })
            break holeLoop;
          case 'drilling-up':
            hole.state = 'done'
            break;
          case 'done':
            if(h == this.holes.length) { // last hole
              this.end();
            }
            break;
          default: // No state yet, start positioning
            hole.state = 'positioning'
            console.log(`ProcessController: hole ${hole.optimizedIndex} state: ${hole.state} `)
            this.messageQueue.push({ message: `G0 X${mm2um(hole.x)} Y${mm2um(hole.y)}` })
            break holeLoop;
        }
      }
    }
  },
  watch: {
    messageQueue (queue) {
      console.log('ProcessController: messageQueue length:', queue.length)
      if(queue.length != 0) return; // Continue if the queue is empty

      // Send the next command
      this.tick()
    }
  }
}

</script>

<style scoped>

</style>
