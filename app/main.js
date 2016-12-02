//import React from 'react';
//require('rctui');
//import ReactDOM from  'react-dom';
//import { Router, Route, hashHistory} from "react-router";
//import Home  from '../components/HelloWorld.js';
//import login  from '../components/login.js';
//import content  from '../components/content.js';
//import userSetting  from '../components/userSetting.js';
const electron = require('electron');
// Module to control application life.
const {app} = electron;
// Module to create native browser window.
const {BrowserWindow} = electron;
const {Menu, Tray} = require('electron')
const MenuItem = electron.MenuItem
const path = require('path')
const ipcMain = require('electron').ipcMain;
//class App extends React.Component{
//	render(){
//		return(
//			<Router history={hashHistory}>
//  			<Route path="/" component={Home} />
//  			<Route path="/login" component={login} />
//  			<Route path="/content" component={content} />
//  			<Route path="/userSetting" component={userSetting} />
//			</Router>
//		);
//	}
//}
//ReactDOM.render(<App />, document.querySelector("#example"));

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
	
tray = new Tray(path.join(__dirname, '../thr/img/app.png'))
//const menu = new Menu();
//menu.append(new MenuItem({ label: '首页', type: 'checkbox', checked: true }))
//menu.append(new MenuItem({ label: '注销', type: 'checkbox', checked: false }))
//menu.append(new MenuItem({ label: '设置', type: 'checkbox', checked: false }))
//menu.append(new MenuItem({ label: '退出', type: 'checkbox', checked: false }))
const contextMenu = Menu.buildFromTemplate([{label: '主界面',type:'radio',checked:true,click:function(){
                                   	console.log(111111111)
                                   }},
                                   {label: '注销',type:'radio',click:function(){
                                   	console.log(111111111)
                                   }},
                                   {label: '设置',type:'radio',click:function(){
                                   	console.log(111111111)
                                   }},
                                   {label: '退出',type:'radio',click:()=>{
                                   	win.close(); //关闭窗口
                                   }}])
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
