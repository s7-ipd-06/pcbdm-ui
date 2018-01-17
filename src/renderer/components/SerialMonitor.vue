<template>
  <div id="serial-monitor">
    <div class="heading">
      <select v-model="currentPort">
        <option value="" disabled selected="selected">Select serial port...</option>
        <option v-for="port in ports" :value="port.comName">
          {{ port.comName }}
        </option>
      </select>
      <button @click="connect" class="butn connectbutton">{{ connected ? 'Disconnect' : 'Connect' }}</button>
    </div>

    <div id="messages">
      <div class="messages-wrapper">
        <div v-for="message in messageHistory" v-bind:class="message.type">
          {{ message.value }}
        </div>
      </div>
    </div>

    <div id="sendbar" class="heading">
      <form v-on:submit.prevent="sendMessage">
        <input type="text" v-model="messageToSend" placeholder="Custom command" />
        <input class="butn" type="submit" value="Send" />
      </form>
    </div>
  </div>
</template>

<script>

const SerialPort = require('serialport');

export default {
  name: 'serial-monitor',
  props: ['messageQueue'],
  data () {
    return {
      messageHistory: [
        //{type: 'incoming', value: 'Testblabla\\n'},
        //{type: 'outgoing', value: 'Blablatest\\n'},
      ],
      ports: [],
      port: null,
      connected: false,
      currentPort: '/dev/cu.usbmodem1411',
      messageToSend: ''
    }
  },
  created () {
    // Periodically refresh list of serial ports
    setInterval(() => {
      SerialPort.list((err, result) => {
        this.ports = result
      })
    }, 1000)
  },
  mounted () {
    this.connect()
  },
  methods: {
    connect () {
      // If port already exists: disconnect and stop
      if(this.port) {
        this.port = null
        this.connected = false
        return;
      }

      this.port = new SerialPort(this.currentPort, {
        baudrate: 115200,
        parser: SerialPort.parsers.readline('\n')
      })
      this.port.on('open', (err) => {
        console.log('Opened', err)
        this.connected = true;
      })
      this.port.on('data', (line) => {
        this.messageHistory.push({
          type: 'incoming',
          value: line
        })

        if(line.substr(0, 2) == 'ok') {
          console.log('SerialMonitor: Acknowledged')
          
          // Find the first message that needs to be acknowledged
          var messageToAcknowledge = this.messageQueue.find(m => !m.acknowledged)
          
          // Remove the message from the queue
          this.messageQueue.splice(this.messageQueue.indexOf(messageToAcknowledge), 1)
        }

        this.$emit('message', line)

        //document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
      })
    },
    sendMessage(msg) {
      if(typeof msg != 'string') msg = this.messageToSend
      
      if(!this.connected) {
        window.alert('Serial port not connected')
        return;
      }
      this.port.write(msg + '\n')

      this.messageHistory.push({
        type: 'outgoing',
        value: msg
      })

      //document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
    }
  },
  watch: {
    messageQueue (queue) {
      //console.log('SerialMonitor: messageQueue watcher:', queue)
      for(var q in queue) {
        var m = queue[q];
        
        // Don't do anything if there is still a message to be acknowledged that has been sent
        if(m.acknowledged === false) break;
        
        // Find the first message that has not been sent yet and send it
        if(!m.sent) {
          this.sendMessage(m.message)
          m.sent = true
          m.acknowledged = false;
          break;
        }
      }
    }
  }
}

</script>

<style scoped>

#messages {
  height: 250px;
  background: #fff;
  padding: 8px;
  box-shadow: inset 0 0 16px 0px #d0d0d0;
  overflow: scroll;
  font-family: Monaco;
  font-size: 0.9em;
  position: relative;
}

.messages-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
}

#messages .incoming {
  float: left;
  clear: both;
}

#messages .outgoing {
  float: right;
  clear: both;
}


.heading {
  /*border-bottom: 1px solid #000;*/
  background: rgb(75, 75, 75);
  overflow: hidden;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}

button.butn, input.butn[type=submit] {
  float: right;
}

button.butn, input.butn[type=submit] {
  background: #666;
  color: #fff;
  padding: 8px 10px;
  border: 0;
  border-radius: 0;
  font-size: 1em;
  cursor: pointer;
  height: 30px;
  /*font-weight: bold;*/
}

.connectbutton {
  width: 82px;
}

button.butn:active, input.butn[type=submit]:active {
  background: #777;
  box-shadow: inset 0 0 16px 0px #888;
}

input[type=text] {
  height: 30px;
  width: 231px;
  padding: 8px;
  font-size: 1em;
  border: none;
  box-shadow: inset 0 0 8px 0px #ddd;
}

input[type=text]:focus {
  box-shadow: inset 0 0 8px 0px #aaa;
}

select {
  height: 30px;
  padding: 8px;
  width: 198px;
  font-size: 1em;
  cursor: pointer;
  background: #fff;
  box-shadow: inset 0 0 8px 0px #ddd;
  border-radius: 0px;
  -webkit-appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, gray 50%),
    linear-gradient(135deg, gray 50%, transparent 50%);
  background-position:
    calc(100% - 20px) calc(1em + 2px),
    calc(100% - 15px) calc(1em + 2px);
  background-size:
    6px 6px,
    6px 6px;
  background-repeat: no-repeat;
}

</style>
