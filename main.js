'use strict'

const app = require('electron').app
const BrowserWindow = require('electron').BrowserWindow
const ipcMain = require('electron').ipcMain
const fs = require('fs')
const Menu = require('menu')
let storage = require('./app/config/storage')

let mainWindow = null
let authWindow = null

let forceQuit = false

let globalSetting = {
  lang: 'en',
  userDataPath: app.getPath('userData'),
  drop: {
    maxFilesOnce: 20,
    availableType: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/svg']
  },
  qn: storage.get('qn'),
  needCompress: storage.get('needCompress') !== null ? storage.get('needCompress') : true,
  compressPath: app.getPath('temp'),
  compressLevel: 4,
  maxSizeToDataURL: 10 * 1024
}

// global setting
global.setting = globalSetting

console.log(app.getPath('userData'))

// set menu
let menu = Menu.buildFromTemplate([
  {
    label: 'Setting',
    submenu: [
      {
        label: 'Edit Qiniu Auth', 
        click: function () { initAuth() }
      },
      {
        label: 'Need Compress',
        type: 'checkbox',
        checked: global.setting.needCompress,
        click: function () { setCompress() }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: (function () {
          if (process.platform === 'darwin')
            return 'Alt+Command+I'
          else
            return 'Ctrl+Shift+I'
        })(),
        click: function (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools()
        }
      },
      {
        label: 'Quit', 
        accelerator: 'CmdOrCtrl+Q', 
        click: function () { app.quit() }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      },
    ]
  },
  {
    label: 'About',
    submenu: [
      {
        label: 'About',
        selector: 'orderFrontStandardAboutPanel:'
      },
      {
        label: 'Learn More', 
        click: function () { require('electron').shell.openExternal('https://github.com/A-limon/toaster-uploader') }
      }
    ]
  },
])

// setting the default language, only support simplified Chinese and English for now
function setDefaultLang () {
  if (app.getLocale() === 'zh-CN') {
    global.setting.lang = 'zh'
  } else {
    global.setting.lang = 'en'
  }
}

// compress settting
function setCompress () {
  global.setting.needCompress = !global.setting.needCompress
  storage.set('needCompress', global.setting.needCompress )
}

// clear local cache
function clearCompresseFiles (dirPath) {
  try {
    var files = fs.readdirSync(dirPath)
  }
  catch(e) {
    console.log(e)
    return
  }
  if (files.length > 0)
    for (var i = 0; i < files.length; i++) {
      var filePath = dirPath + '/' + files[i]
      if (fs.statSync(filePath).isFile())
        fs.unlinkSync(filePath)
    }
}

// init main window
function initMain () {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 500,
    resizable: false,
    fullscreenable: false,
    hasShadow: true,
    title: 'Toaster Uploader',
    icon: process.platform === 'darwin' ? __dirname + '/icon.icns' : __dirname + '/icon.png'
  })
  mainWindow.loadURL('file://' + __dirname + '/index.html')

  mainWindow.on('close', (e) => {
    if(!forceQuit){
      e.preventDefault()
      mainWindow.hide()
    }
  })
}

// init the auth window
function initAuth () {
  if (authWindow) return

  // tell main window auto info
  mainWindow.webContents.send('auth-info', {
    code: 'waiting'
  })

  authWindow = new BrowserWindow({
    width: 600,
    height: 600,
    resizable: false,
    fullscreenable: false,
    hasShadow: true
  })

  authWindow.loadURL('file://' + __dirname + '/auth.html')

  authWindow.on('closed', () => {
    authWindow = null
  })
}

// close the auth window when auth finished
ipcMain.on('auth-finish', (event, arg) => {
  global.setting.qn = storage.get('qn')
  authWindow.close()
  // sent auth result to main window 
  // when update auth info in auth window, the global setting can't be updated as expect
  mainWindow.webContents.send('auth-info', {
    code: 'success',
    auth: arg
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  mainWindow = null
  authWindow = null
})

app.on('ready', () => {

  Menu.setApplicationMenu(menu)

  setDefaultLang()

  initMain()

  if (!global.setting.qn) {
    initAuth()
  }

  if (global.setting.needCompress) {
    clearCompresseFiles(global.setting.compressPath)
  }

  app.on('before-quit', (e) => {
    forceQuit = true
  })

  app.on('activate', (e) => {
    mainWindow.show()
  })
})