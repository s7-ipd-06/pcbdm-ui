<template>
  <div id="serial-monitor">
    <div class="heading">
      <select v-model="currentPort">
        <option disabled value="">Select serial port...</option>
        <option v-for="port in ports" :value="port.comName">
          {{ port.comName }}
        </option>
      </select>
      <button @click="connect">{{ connected ? 'Disconnect' : 'Connect' }}</button>
    </div>

    <div id="messages">
      <div v-for="message in messages">
        {{ message.value }}
      </div>
    </div>

    <div id="sendbar" class="heading">
      <form>
        <input type="text" :value="send_message" placeholder="Custom command" />
        <input type="submit" value="Send" />
      </form>
    </div>
  </div>
</template>

<script>

const SerialPort = require('serialport');

export default {
  name: 'serial-monitor',
  data () {
    return {
      messages: [
        {type: 'incoming', value: 'Testblabla\\n'},
        {type: 'outgoing', value: 'Blablatest\\n'},
      ],
      ports: [
        {comName: '/dev/ttys004'}
      ],
      port: null,
      connected: false,
      currentPort: null,
      send_message: ''
    }
  },
  created () {
    //setInterval(() => {
      SerialPort.list((err, result) => {
        this.ports = [...this.ports, ...result]
      })
    //}, 1000)
  },
  methods: {
    connect () {
      if(this.port) {
        this.port = null
        this.connected = false
        return;
      }
      this.port = new SerialPort(this.currentPort, {})
      this.port.on('open', (err) => {
        console.log('Opened', err)
        this.connected = true
      })
      this.port.on('data', (data) => {
        console.log('Received: ', data)
      })
    }
  }
}

</script>

<style scoped>

#messages {
  height: 300px;
  background: #fff;
  padding: 8px;
  box-shadow: inset 0 0 16px 0px #d0d0d0;
  overflow: scroll;
}

.heading {
  /*border-bottom: 1px solid #000;*/
  background: rgb(75, 75, 75);
  overflow: hidden;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}

button, input[type=submit] {
  float: right;
}

button, input[type=submit] {
  background: #666;
  color: #fff;
  padding: 8px 12px;
  border: 0;
  border-radius: 0;
  font-size: 1em;
  cursor: pointer;
  height: 30px;
  /*font-weight: bold;*/
}

button:active, input[type=submit]:active {
  background: #777;
  box-shadow: inset 0 0 16px 0px #888;
}

input[type=text] {
  height: 30px;
  width: 227px;
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
  width: 208px;
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
