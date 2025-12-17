
import { app, BrowserWindow } from 'electron';
import { startServer } from './app.js';

import dotenv from 'dotenv';
dotenv.config();

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  })

  win.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
  startServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})