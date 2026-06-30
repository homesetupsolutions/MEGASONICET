const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const { spawn } = require('child_process')

let mainWindow
let nextProcess

const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: '#0a0a0f',
    titleBarStyle: 'hiddenInset',
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'icon.ico'),
  })

  mainWindow.setMenuBarVisibility(false)

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadURL(`file://${path.join(__dirname, '../.next/server/app/index.html')}`)
  }

  mainWindow.on('closed', () => { mainWindow = null })
}

function startNextServer() {
  if (isDev) return
  nextProcess = spawn('node', [path.join(__dirname, '../node_modules/.bin/next'), 'start'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: '3000' },
  })
  nextProcess.stdout.on('data', (data) => console.log(`Next: ${data}`))
  nextProcess.stderr.on('data', (data) => console.error(`Next Error: ${data}`))
}

app.whenReady().then(() => {
  startNextServer()
  setTimeout(createWindow, isDev ? 0 : 3000)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (nextProcess) nextProcess.kill()
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('minimize-window', () => mainWindow?.minimize())
ipcMain.on('maximize-window', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize()
  else mainWindow?.maximize()
})
ipcMain.on('close-window', () => mainWindow?.close())
ipcMain.on('open-external', (_, url) => shell.openExternal(url))
