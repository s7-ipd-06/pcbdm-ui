<template>
  <div id="process-controller">
    <h5>{{ file.name }}</h5>

    <button type="button" :class="['btn', playing ? 'btn-danger' : 'btn-success']" v-on:click="playPause">
      <span class="glyphicon" :class="[playing ? 'glyphicon-pause' : 'glyphicon-play']" aria-hidden="true"></span>
    </button>
    <button type="button" class="btn" v-on:click="stop">
      <span class="glyphicon glyphicon-stop" aria-hidden="true"></span>
    </button>
    <br /><br />
    <div class="progress">
      <div class="progress-bar" role="progressbar" :style="{ width: progress + '%' }" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">{{ progress }}%</div>
    </div>
    Drilled {{ holesDone }} of {{ holes.length }} holes.<br />
    Drilled {{ distanceCovered}} of {{ totalDistance }} mm<br />
    Average time per/m incl. drilling: {{ Math.round(durationPerMM*1000) }}ms<br />
    {{ Math.round(timeElapsed/1000) }}s of estimated {{ Math.round((timeElapsed + timeRemaining)/1000) }}s elapsed<br />
    Average time per hole: {{ averageTimePerHole }} ms<br />

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
      started: false,
      startTime: 0,
      endTime: 0
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
      this.startTime = Date.now()
      console.log(this.playing)
      this.messageQueue.push({ message: 'G90' }) // Absolute positioning
      this.messageQueue.push({ message: 'G28' }) // Home
    },
    pause() {
      this.endTime = Date.now()
      console.log('ProcessController: Pausing drilling process')
    },
    resume() {
      var previousDuration = this.endTime - this.startTime
      this.startTime = Date.now - previousDuration
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
      this.endTime = Date.now()
      console.log('ProcessController: Ending drilling process')
      this.messageQueue.push({ message: 'M5' }) // Drill off
    },
    tick() { // Find next hole to drill
      if(!this.playing) return;
      this.endTime = Date.now()
      holeLoop: for(var h in this.holes) {
        var hole = this.holes[h]
        
        stateMachine: switch(hole.state) {
          case 'positioning':
            hole.state = 'drilling-down'
            hole.startTime = Date.now()
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
            hole.endTime = Date.now()
            hole.duration = hole.endTime - hole.startTime
            hole.durationPerMM = hole.duration / hole.distance

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
  computed: {
    holesDone () {
      return this.holes.reduce((i, h) => i += h.state == 'done', 0)
    },
    distanceCovered () {
      return Math.round(this.holes.reduce((d, h) => d += (h.state == 'done' ? h.distance : 0), 0))
    },
    progress () {
      return  Math.round(100 * this.distanceCovered / this.totalDistance)
      //return Math.round(100 * this.holesLeft / this.holes.length);
    },
    totalDistance () {
      return Math.round(this.holes.reduce((d, h) => d += h.distance, 0))
    },
    timeElapsed () {
      return this.endTime - this.startTime
    },
    durationPerMM () {
      return this.timeElapsed == 0 ? 0 : (this.distanceCovered / this.timeElapsed)
    },
    timeRemaining () {
      return 1000 * this.durationPerMM * (this.totalDistance - this.distanceCovered)
    },
    averageTimePerHole () {
      return Math.round(this.timeElapsed / this.holesDone)
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

#process-controller {
  padding: 8px;
}

</style>
