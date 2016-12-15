const React = require('react')
const electron = require('electron');
// Module to control application life.
const {app} = electron;
// Module to create native browser window.
const {BrowserWindow} = electron;
const {Menu, Tray} = require('electron')
const MenuItem = electron.MenuItem
const path = require('path')
const ipcMain = require('electron').ipcMain;
// 保持全局的窗口对象，可以不显示，如果没有这个对象，窗口点击关闭的时候，js对象会被gc干掉
let win;
var tray = null;
function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600});
  // win 加载静态资源
  win.loadURL(`file://${__dirname}/index.html`);
  // 创建一个平台图标
  tray = new Tray(path.join(__dirname, '../thr/img/1.png'))
  // 图标 菜单
  const contextMenu = Menu.buildFromTemplate(
      [
        {label: '主界面',checked:true,click:()=>{win.webContents.send('showContent')}},
        {label: '注销',
          click:()=>{win.webContents.send('Logout')
                    tray.setToolTip('消息助手')
        }},
        {label: '设置',click:()=>{win.webContents.send('userSetting')}},
        {label: '退出',click:()=>{win.close()
                    tray.destroy()
        }} // 退出
      ]
    );
  // 提示
  console.log(1)
  tray.setToolTip('消息助手');
  // 设置菜单到图标
  console.log(2)
  tray.setContextMenu(contextMenu);
  tray.on('balloon-click',()=>{
    console.log(1111)
   win.focus() // 置顶（优先显示）
  })
  var changeIcon = function(){
    var empty = nativeImage.createEmpty();
    tray.setImage(empty)
  }
  tray.on('balloon-show',()=>{

  })
  // console.log(tray)

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
    tray.destroy()
  }
});
app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

ipcMain.on('close-main-window',function(){
	app.quit();
  tray.destroy()
})

// 用户登录时触发
ipcMain.on('userLogin',(event,msg)=>{
  tray.setToolTip(`消息助手 - 当前用户 ( ${msg} ) `);
})

// 档有新消息推送时触发事件
ipcMain.on('newPush',(event,msg)=>{
  var str = '',t;
  msg[1].forEach(c=>{
      str += `时间 -> ${c.date} \n项目 -> ${c.project} \n事由 -> ${c.cause} \n金额 -> ${c.amount} 元 \n经办人 -> ${c.creater}\n S`
  });
  var array = str.split('S');
  
  function* Iterators(arr) {
    for(let i=0,len=arr.length;i<len;i++){
      yield arr.slice(i,i+1);
    }
  }
  let gen = Iterators(array);
  (function change(){
    try{
      tray.displayBalloon({
        icon:'../thr/img/2.jpg',
        title:` ${msg[0]} 您好,您当前有 ${msg[1].length} 个待办业务未处理.`,
        content:gen.next().value.join()
      });
      setTimeout(change,5000);
    }catch(e){
      console.log(e)
    }
  })()


  msg[1].length > 0 && win.flashFrame(true) // 页面窗口闪动提示

 tray.setToolTip(`消息助手 - 当前用户 ( ${msg[0]} ) 待办事件 ${msg[1].length}`)
})
