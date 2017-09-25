<template>
  <div id="serial-monitor">
    <div class="heading">
      <select v-model="currentPort">
        <option disabled value="">Select serial port...</option>
        <option v-for="port in ports" :value="port.comName">
          {{ port.comName }}
        </option>
      </select>
      <button>Connect</button>
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
      ports: [],
      send_message: ''
    }
  },
  created () {
    SerialPort.list((err, result) => {
      this.ports = result
    })
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
  /*font-weight: bold;*/
}

button:active, input[type=submit]:active {
  background: #777;
  box-shadow: inset 0 0 16px 0px #888;
}

input[type=text] {
  width: 227px;
  padding: 8px;
  font-size: 1em;
  border: none;
  box-shadow: inset 0 0 8px 0px #ddd;
}

input[type=text]:focus {
  box-shadow: inset 0 0 8px 0px #aaa;
}

</style>
