'use strict'

import {
  app,
  protocol,
  BrowserWindow,
  dialog
} from 'electron'
import {
  createProtocol
} from 'vue-cli-plugin-electron-builder/lib'
// import installExtension, {
//   VUEJS3_DEVTOOLS
// } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
import {
  autoUpdater
} from 'electron-updater'
var logger = require('@/utils/log4js').getLogger()
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{
  scheme: 'app',
  privileges: {
    secure: true,
    standard: true
  }
}])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  // if (isDevelopment && !process.env.IS_TEST) {
  //   // Install Vue Devtools
  //   try {
  //     await installExtension(VUEJS3_DEVTOOLS)
  //   } catch (e) {
  //     console.error('Vue Devtools failed to install:', e.toString())
  //   }
  // }
  createWindow()
  logger.info('开始检查更新')
  autoUpdater.checkForUpdates()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
autoUpdater.autoInstallOnAppQuit = false
autoUpdater.on('checking-for-update', () => {
  logger.info('正在检查更新……')
})
autoUpdater.on('update-available', (ev, info) => {
  logger.info('下载更新包成功')
})
autoUpdater.on('update-not-available', (ev, info) => {
  logger.info('现在使用的就是最新版本，不用更新')
})
autoUpdater.on('error', (ev, err) => {
  logger.info('检查更新出错')
  logger.info(ev)
  logger.info(err)
})
autoUpdater.on('download-progress', (ev, progressObj) => {
  logger.info('正在下载...')
})
autoUpdater.on('update-downloaded', (ev, releaseNotes, releaseName) => {
  logger.info('下载完成，更新开始')
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 5 seconds.
  // You could call autoUpdater.quitAndInstall(); immediately
  const options = {
    type: 'info',
    buttons: ['确定', '取消'],
    title: '应用更新',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: '发现有新版本，是否更新？'
  }
  dialog.showMessageBox(options).then(returnVal => {
    if (returnVal.response === 0) {
      logger.info('开始更新')
      setTimeout(() => {
        autoUpdater.quitAndInstall()
      }, 5000);
    } else {
      logger.info('取消更新')
      return
    }
  })
});
