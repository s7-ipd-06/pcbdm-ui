<template>
  <div id="manual-controls">
    <div class="keypad-wrapper">
      <div class="key key-tl" @click="sendMessage(['G91', 'G0 X100000'])"></div>
      <div class="key key-tr"></div>
      <div style="clear: both"></div>
      <div class="key key-bl"></div>
      <div class="key key-br" @click="sendMessage(['G91', 'G0 X-100000'])"></div>
      <div class="keypad">
        <div class="key key-tl" @click="sendMessage(['G91', 'G0 X10000'])"></div>
        <div class="key key-tr"></div>
        <div style="clear: both"></div>
        <div class="key key-bl"></div>
        <div class="key key-br" @click="sendMessage(['G91', 'G0 X-10000'])"></div>
        <div class="keypad">
          <div class="key key-tl" @click="sendMessage(['G91', 'G0 X1000'])"></div>
          <div class="key key-tr"></div>
          <div style="clear: both"></div>
          <div class="key key-bl"></div>
          <div class="key key-br" @click="sendMessage(['G91', 'G0 X-1000'])"></div>
        </div>
      </div>
    </div>
    <button class="btn btn-large btn-default">
      <span class="glyphicon glyphicon-home" aria-hidden="true" @click="sendMessage('G28')"></span>
    </button>
  </div>
</template>

<script>

export default {
  name: 'manual-controls',
  props: ['messageQueue'],
  created () {
    
  },
  methods: {    
    sendMessage(msgs) {
      if(typeof msgs == 'string') msgs = [msgs]

      msgs.forEach(m => {
        this.messageQueue.push({ message: m })
      })
    }
  }
}

</script>

<style scoped>

.keypad-wrapper {
  position: relative;
  margin: 40px auto;
  height: 198px;
  width: 198px;
  transform: rotate(45deg);
  box-shadow: 0 0 15px #555;
}

.keypad-wrapper > .key {
  background: #aaa;
}

.keypad {
  position: absolute;
  height: 70%;
  width: 70%;
  top: 15%;
  left: 15%;
  box-shadow: 0 0 15px #555;
}

.keypad > .key {
  background: #777;
}

.keypad > .keypad {
  height: 60%;
  width: 60%;
  top: 20%;
  left: 20%;
}

.keypad > .keypad > .key {
  background: #555;
}

.keypad-wrapper > .key {

}
  .key {
    box-sizing: border-box;
    float: left;
    height: 50%;
    width: 50%;
    cursor: pointer;
  }

  .key:hover {
    opacity: 0.9;
  }
  .key:active {
    opacity: 0.75;
  }

  .key-tl, .key-bl {
    border-right: 1px solid #333;
  }

  .key-tl, .key-tr {
    border-bottom: 1px solid #333;
  }

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
