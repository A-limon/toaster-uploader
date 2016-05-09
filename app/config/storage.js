const electron = require('electron')
const fs = require('fs')
const path = require('path')

let dataFilePath = ''

if (electron.app) {
  dataFilePath = path.join(electron.app.getPath('userData'), 'data.json')
} else {
  dataFilePath = path.join(electron.remote.getGlobal('setting').userDataPath, 'data.json')
}

let data = null

function load () {
  if (data !== null) {
    return
  }

  if (!fs.existsSync(dataFilePath)) {
    data = {}
    return
  }

  data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'))
}

function save () {
  fs.writeFileSync(dataFilePath, JSON.stringify(data))
}

exports.set = function (key, value) {
  load()
  data[key] = value
  save()
}

exports.get = function (key) { 
  load()
  let value = null
  if (key in data) {
    value = data[key]
  }
  return value
}

exports.unset = function (key) { 
  load()
  if (key in data) {
    delete data[key]
    save()
  }
}