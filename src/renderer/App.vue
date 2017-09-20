<template>
  <div id="app">
    <aside id="sidebar-left">
      <h1>Files</h1>
      <file-list></file-list>
    </aside>

    <section id="main">
      <!-- PCBViewer -->
      <!-- AlgorithmSelector -->
      <!-- HoleBrowser -->
      <!-- SizeMapper -->
    </section>

    <aside id="sidebar-right">
      <!-- ProcessController -->
      <!-- ManualControls -->
    </aside>
  </div>
</template>

<script>
  import FileList from '@/components/FileList'

  export default {
    name: 'pcbdm-ui',
    components: {
      FileList
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
  width: 320px;

  border-color: #d7d7d7;
  border-style: solid;
  border-width: 0;
  background: rgba(147, 128, 108, 0.098);
  box-shadow: inset 0 0 16px 0px #d0d0d0;
}

#main {
  box-flex: 1;  
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

</style>
