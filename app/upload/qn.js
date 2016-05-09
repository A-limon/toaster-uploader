'use strict'
const qn = require('qn')
const fs = require('fs')
const electron = require('electron')
let setting = electron.remote.getGlobal('setting')
let authInfo = null
let client = null

// init client
function initClient () {
  client = qn.create({
    accessKey: authInfo ? authInfo.accessKey : setting.qn.accessKey,
    secretKey: authInfo ? authInfo.secretKey : setting.qn.secretKey,
    bucket: authInfo ? authInfo.bucket : setting.qn.bucket,
    origin:  authInfo ? authInfo.origin : setting.qn.bucket.origin,
    uploadURL: authInfo ? authInfo.uploadURL : setting.qn.bucket.uploadURL
    // timeout: 3600000, // default rpc timeout: one hour, optional
  })
}

// update auto info
exports.auth = function (info) {
  if (info) {
     authInfo = info
  }
}

// upload files
exports.upload = function (filepath, successCb, errorCb) {
  initClient()
  client.upload(fs.createReadStream(filepath), (err, result) => {
    if (err) {
      console.log(err)
      alert(result.error)
      errorCb(err)
    } else {
      successCb(result)
    }
  })
}

// list files
exports.list = function (path, successCb, errorCb) {
  initClient()
  client.list('/', (err, result) => {
     if (err) {
      console.log(err)
      errorCb(err)
    } else {
      successCb(result)
    }
  })
}


