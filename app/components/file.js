'use strict'
const vue = require('vue')
const filesize = require('file-size')
const clipboard = require('electron').clipboard
const nativeImage = require('electron').nativeImage
const shell = require('electron').shell
const globalSetting = require('remote').getGlobal('setting')

let image = ''

vue.component('file',{
  data: function () {
    return {
      locales: {
        en: {
          compressTitle: 'Compress:',
          uploadTitle: 'Upload:',
          copyURL: 'Copy Link',
          openInBrowser: 'Open In Browser',
          copyDataURL: 'Copy DataURL',
          saved: 'Saved:',
          uploadStatus: {
            progressing: 'Uploading',
            failed: 'Failed',
            done: 'Done',
            waiting: 'Waiting'
          },
          compressStatus: {
            progressing: 'Compressing',
            failed: 'Failed',
            done: 'Done',
            waiting: 'Waiting'
          }
        },
        zh: {
          compressTitle: '压缩状态：',
          uploadTitle: '上传状态：',
          copyURL: '复制地址',
          openInBrowser: '浏览器中打开',
          copyDataURL: '复制DataURL',
          saved: '节省：',
          uploadStatus: {
            progressing: '上传中',
            failed: '失败',
            done: '完成',
            waiting: '等待上传'
          },
          compressStatus: {
            progressing: '压缩中',
            failed: '失败',
            done: '完成',
            waiting: '等待压缩'
          }
        }
      },
      info: {
        fileSize: 0,
        error: ''
      },
      compress: {
        progressing: false,
        failed: false,
        done: false,
        error: '',
        diffSize: 0
      },
      upload: {
        progressing: false,
        failed: false,
        done: false,
        error: '',
        result: ''
      }
    }
  },
  props: {
    file: {
      required: true
    },
    setting: {
      required: true
    },
    auth: {
      required: false
    }
  },
  computed: {
    msg: function () {
      if (this.$data.locales[globalSetting.lang]) {
        return this.$data.locales[globalSetting.lang]
      } else {
        return this.$data.locales.en
      }
    },
    compressText: function (){
      if (this.$data.compress.progressing) {
        return this.msg.compressStatus.progressing
      } else if (this.$data.compress.failed) {
        return this.msg.compressStatus.failed
      } else if (this.$data.compress.done) {
        return this.msg.compressStatus.done
      } else {
        return this.msg.compressStatus.waiting
      }
    },
    uploadText: function (){
      if (this.$data.upload.progressing) {
        return this.msg.uploadStatus.progressing
      } else if (this.$data.upload.failed) {
        return this.msg.uploadStatus.failed
      } else if (this.$data.upload.done) {
        return this.msg.uploadStatus.done
      } else {
        return this.msg.uploadStatus.waiting
      }
    },
    formatSize: function () {
      return this.countSize(this.$data.info.fileSize)
    },
    imageSize: function () {
      image = nativeImage.createFromPath(this.file.path)
      return image.getSize()
    }
  },
  methods: {
    countSize: function (size) {
      return filesize(size).human('jedec')
    },
    compressImg: function () {
      this.$data.compress.progressing = true
      const Imagemin = require('imagemin')
      new Imagemin()
          .src(this.file.path)
          .dest(this.setting.compressPath)
          .use(Imagemin.jpegtran({progressive: true}))
          .use(Imagemin.gifsicle({interlaced: true}))
          .use(Imagemin.optipng({optimizationLevel: this.setting.optimizationLevel}))
          .use(Imagemin.svgo())
          .run((err, files) => {
            this.$data.compress.progressing = false
            if (err) {
              console.log(err)
              this.$data.compress.failed = true
              this.$data.compress.error = err
            } else {
              let file = files[0]
              let diff = this.file.size - file.contents.length
              this.$data.compress.done = true
              this.$data.compress.diffSize = (diff/this.file.size*100).toFixed(2) + '%'
              this.$data.info.fileSize = this.$data.info.fileSize - diff
              this.uploadImg(file.history.pop())
            }
          })
    },
    uploadImg: function (filePath) {
      this.$data.upload.progressing = true
      const Qn = require('../upload/qn')
      if (this.auth.accessKey) {
        Qn.auth(this.auth)
      }
      Qn.upload(filePath, (data) => {
        this.$data.upload.progressing = false
        this.$data.upload.done = true
        this.$data.upload.result = data.url
      }, (err) => {
        console.log(err)
        this.$data.upload.progressing = false
        this.$data.upload.failed = true
        this.$data.upload.error = err
      })
    },
    copy: function (content) {
      if (!this.$data.upload.done) {
        return false
      }else {
        clipboard.writeText(content)
      }
    },
    openInBrowser: function (url) {
      if (!this.$data.upload.done) {
        return false
      }else {
        shell.openExternal(url)
      }
    },
    toDataURL: function (){
      this.copy(image.toDataURL())
    }
  },
  ready: function () {
    this.$data.info.fileSize = this.file.size
    if (this.setting.needCompress) {
      this.compressImg()
    }else {
      this.uploadImg(this.file.path)
    }
  },
  template: '<div class="file">'+
              '<div class="img">'+
                '<img :src="file.path">'+
              '</div>'+
              '<div class="info">'+
                '<p class="line">'+
                  '<span class="key" v-text="file.name"></span>'+
                  '<span class="key" v-text="formatSize"></span>'+
                  '<span class="key">{{imageSize.width}}px*{{imageSize.height}}px</span>'+
                '</p>'+
                '<p class="line">'+
                  '<span class="status" v-if="setting.needCompress">'+
                    '<span v-text="msg.compressTitle"></span>'+
                    '<span v-text="compressText"></span>'+
                    '<i v-show="compress.done" class="fa fa-check icon"></i>'+
                    '<i v-show="compress.failed" class="fa fa-warning icon"></i>'+
                  '</span>'+
                  '<span class="status" v-if="setting.needCompress">'+
                    '<span v-text="msg.saved"></span>'+
                    '<span v-text="compress.diffSize"></span>'+
                  '</span>'+
                  '<span class="status">'+
                    '<span v-text="msg.uploadTitle"></span>'+
                    '<span v-text="uploadText"></span>'+
                    '<i v-show="upload.done" class="fa fa-check icon"></i>'+
                  '</span>'+
                '</p>'+
                '<p clas="line action">'+
                  '<a @click="copy(upload.result)" class="btn">'+
                    '<i class="fa fa-clipboard"></i>'+
                    '<span v-text="msg.copyURL"></span>'+
                  '</a>'+
                  '<a @click="openInBrowser(upload.result)" class="btn">'+
                    '<i class="fa fa-external-link"></i>'+
                    '<span v-text="msg.openInBrowser"></span>'+
                  '</a>'+
                  '<a @click="toDataURL" class="btn" v-if="info.fileSize <= setting.maxSizeToDataURL">'+
                    '<i class="fa fa-clipboard"></i>'+
                    '<span v-text="msg.copyDataURL"></span>'+
                  '</a>'+
                '</p>'+
              '</div>'+
            '</div>'
})