import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import { fileURLToPath } from 'node:url'
import path, { resolve } from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import Store from 'electron-store'

import { windowStateKeeper } from './windowStateKeeper'

// import type { FileListItem } from '../../types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const store = new Store()

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

async function createWindow() {
  const mainWindowStateKeeper = await windowStateKeeper('main')
  win = new BrowserWindow({
    title: 'Main window',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    x: mainWindowStateKeeper.x,
    y: mainWindowStateKeeper.y,
    width: mainWindowStateKeeper.width,
    height: mainWindowStateKeeper.height,
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      contextIsolation: true,
    },
  })
  mainWindowStateKeeper.track(win)

  if (VITE_DEV_SERVER_URL) { // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.setMenu(null)
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

ipcMain.handle('selectPdfFolder', () => {
  return dialog.showOpenDialog(win, { properties: ['openDirectory'] })
    .then((result) => {
      // Bail early if user cancels dialog
      if (result.canceled) return false
      else return result.filePaths[0]
    })
})

ipcMain.handle('saveUserSettings', (_, user) => {
  store.set('userSettings', user)
})

ipcMain.handle('getUserSettings', () => {
  const settings = store.get('userSettings')
  if (settings) return JSON.parse(settings)
  return {
    selectedPdfFolderPath: '',
    smtpHost: '',
    smtpLogin: '',
    smtpPassword: '',
    theme: 'light',
    mailSubject: '',
    mailBody: '',
  }
})

ipcMain.handle('downloadFile', async (_, arrayBuffer, filename) => {
  saveArrayBufferToFile(arrayBuffer, filename)
})

function saveArrayBufferToFile(arrayBuffer: ArrayBuffer, filename: string, encoding = 'utf8') {
  return new Promise(async (resolve, reject) => {
    const buffer = Buffer.from(arrayBuffer)
    const { selectedPdfFolderPath } = JSON.parse(store.get('userSettings'))

    let fullPath = path.join(selectedPdfFolderPath, filename)
    if (await checkFileExist(fullPath)) {
      const tempFilename = `${filename.split('.pdf')[0]}_${(Math.random()*10000).toFixed(0)}.pdf`
      fullPath = path.join(selectedPdfFolderPath, tempFilename)
    }
    fs.writeFile(fullPath, buffer, { encoding }, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(true)
      }
    })
  })
}

async function checkFileExist(fullPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    fs.promises.access(fullPath).then(() => {
      return resolve(true)
    }).catch(() => {
      return resolve(false)
    })
  })
  
}

ipcMain.handle('removeFile', (_, filePath) => {
  removeFile(filePath)
})

function removeFile(filePath: string) {
  fs.unlink(filePath, (err) => {
    if (err) console.log(err)
  })
}
