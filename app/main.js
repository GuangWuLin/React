//import React from 'react';
//require('rctui');
//import ReactDOM from  'react-dom';
// import { Router, Route, hashHistory} from "react-router";
const React = require('react')
const Router = require('react-router');
const Route = require('react-router');
const hashHistory = require('react-router');

const electron = require('electron');
// Module to control application life.
const {app} = electron;
// Module to create native browser window.
const {BrowserWindow} = electron;
const {Menu, Tray} = require('electron')
const MenuItem = electron.MenuItem
const path = require('path')
const ipcMain = require('electron').ipcMain;

let win;
let tray;
function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600});
  win.loadURL(`file://${__dirname}/index.html`);
  // Open the DevTools.
  win.webContents.openDevTools();
  // Emitted when the window is closed.
   win.on('closed', () => {
    win = null;
  });
}
app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});


function createWindow() {
  // Create the browser window.创建一个新的浏览器窗口
  win = new BrowserWindow({width: 705, height: 525});
  	
  tray = new Tray(path.join(__dirname, '../thr/img/1.png'))

  const contextMenu = Menu.buildFromTemplate(
      [
        {label: '主界面',checked:true,click:()=>{win.webContents.send('HelloMan')}},
        {label: '注销',click:()=>{win.webContents.send('sayWhat')}},
        {label: '设置',click:()=>{console.log(111111111)}},
        {label: '退出',click:()=>{win.close()}} // 退出
      ]
    );

  tray.setToolTip('消息助手（刘某）：暂无待办事项')
  tray.setContextMenu(contextMenu);
  // 并且装载应用的index.html
  win.loadURL(`file://${__dirname}/index.html`);

  // 打开开发者工具页面(屏蔽)
  //win.webContents.openDevTools();

  // 当窗口关闭时调用的方法
  win.on('closed', () => {
  		console.log('Hehe')
      // 解除窗口对象的引用，通常而言如果应用支持多个窗口的话，你会在一个数组里
      //存放窗口对象，在窗口关闭的时候
      // 应当删除相应的元素。
      win = null;
  });
}

ipcMain.on('close-main-window',function(){
	app.quit();
})

ipcMain.on('sayHi',function(){
  console.log('Hi')
})
