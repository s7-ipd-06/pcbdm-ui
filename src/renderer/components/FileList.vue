<template>
  <div id="list" class="full-height">
    <div v-for="file in files" :class="{ file, active: file.isActive }">
      <div class="file-thumbnail" :style="{ backgroundImage: file.thumbnail }"></div>
      <div class="file-information">
        <div class="file-name" :title="file.name">{{ file.name }}</div>
      </div>
    </div>

    <div class="drop-here">
      <span class="drop-here-icon"></span>
      <br />
      <span>Drop your .brd file here</span>
    </div>
  </div>
</template>

<script>

export default {
  name: 'file-list',
  data () {
    return {
      files: [
        {name: 'Screen Shot 2017-08-20 at 19.33.1017-08-20 at 19.33.166.png'},
        {isActive: true, name: 'Screen Shot 2017-08-20 at 19.33.16.png'},
        {name: 'Screen Shot 2017-08-20 at 19.33.16.png'},
        {name: 'Screen Shot 2017-08-20 at 19.33.16.png'},
        {name: 'Screen Shot 2017-08-20 at 19.33.1017-08-20 at 19.33.166.png'}
      ]
    }
  },
  mounted () {
    const list = this.$el;
    
    list.addEventListener('drop', (e) => {
      e.preventDefault() // Prevent the page from actually trying to open and view the file
      e.stopPropagation() // Stop the event from propagating to parent elements

      list.classList.remove('dropTarget')

      for (let f of e.dataTransfer.files) {
        this.files.push(f)
        console.log(f)
      }
    })

    list.addEventListener('dragleave', (e) => {
      list.classList.remove('dropTarget')
    })
    
    list.addEventListener('dragover', (e) => {
      list.classList.add('dropTarget')
      e.preventDefault() // Prevent the page from actually trying to open and view the file
      e.stopPropagation() // Stop the event from propagating to parent elements
    })
  }
}

</script>

<style scoped>

#list {
  position: absolute;
  top: 38px;
  bottom: 0;
  width: 100%;
  overflow-y: scroll;
}

#list .drop-here {
  position: relative;
  top: 16px;
  margin: 0 16px;
  padding: 16px;
  border: 3px dashed #ccc;
  border-radius: 12px;
  text-align: center;
  color: #aaa;
}

#list .drop-here span {
  display: inline-block;
}

#list .drop-here .drop-here-icon {
  height: 50px;
  width: 50px;
  margin-bottom: 16px;

  -webkit-mask-image: url('/static/drop-file.svg');
  mask-image: url('/static/drop-file.svg');
  background-color: #ccc;
}

#list.dropTarget {
  box-shadow: inset 0 0 24px #888;
  background-color: #fafafa;
  transition: all 200ms;
}

.file {
  border-bottom: 1px solid #dfdfdf;
  display: flex;
}

.file.active {
  background: #fff;
}

.file-thumbnail {
  margin: 8px;
  border: 1px solid #ddd;
  height: 80px;
  width: 120px;
  box-shadow: inset 0 0 16px #ddd;
}

.file-information {;
  flex: 1;
  padding: 8px 8px 8px 0;
}

.file-name {
  display: inline-block;
  width: 164px;
  font-size: 1.1em;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>
