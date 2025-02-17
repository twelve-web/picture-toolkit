<template>
  <div>
    <h1> Vue Demo!</h1>
    <div class="container" ref="container"></div>
    <input type="file" @change="handleFileChange" />
  </div>
</template>
<script  lang="ts">
// 从本地包引入earser
import {Eraser} from 'picture-toolkit'

export default {
  name: 'App',
  data() {
    return {
      imgFile: null,
      eraser: null
    }
  },
  methods: {
    handleFileChange(e:any) {
      this.imgFile = e.target.files[0]
      this.initEarser()
    },
    initEarser() {
      if(this.imgFile) {
        this.eraser = new Eraser({
          imgFile: this.imgFile,
          onMaskChange: (originalBase64, maskBase64) => {
            console.log(originalBase64, maskBase64,'===')
          }
        })
        this.$nextTick(() => {
          this.eraser.mount(this.$refs.container)
        })
      }
    },
  },
}
</script>

<style scoped>
.container {
  width: 500px;
  height: 500px;
  border: 1px solid #000;
}
</style> 
