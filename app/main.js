require('events').EventEmitter.prototype._maxListeners = 100;
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

// 排序方法
function keysrt(key,desc){
    return function(a,b){
      if(typeof a[key] == 'string' && typeof b[key] == 'string'){
        // console.log('string!');
        let arrA = [],arrB = [];
        for(let i=0,len=a[key].length;i<len;i++){
          if (!isNaN(a[key][i])) {
            // console.log(a[key][i])
            arrA.push(a[key][i]);
          }
        }
        for(let j=0,len=b[key].length;j<len;j++){
          if (!isNaN(b[key][j])) {
            arrB.push(b[key][j]);
          }
        }
        let strA = arrA.join('').replace(/\s?/g,'');
        let strB = arrB.join('').replace(/\s?/g,'');
        let A = parseInt(strA);
        let B = parseInt(strB);
        return !desc ? (A-B) : (B-A)
        //console.log(typeof A)
      }
    }
  }
// c创建窗口
function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({resizable:false, width: 800, height: 600,x:800,y:260,icon: '../thr/img/87.jpg'});
  // win 加载静态资源
  win.loadURL(`file://${__dirname}/index.html`);
  // 创建一个平台图标
  tray = new Tray(path.join(__dirname, '../thr/img/87.jpg'))
  // 图标 菜单

  tray.on('click',()=>{
    // console.log('click')
    win.focus()
  })

  const contextMenu = Menu.buildFromTemplate(
      [
        {label: '主界面',checked:true,click:()=>{
            win.webContents.send('showContent')
            }
        },
        {label: '注销',
          click:()=>{
            win.webContents.send('Logout')
            tray.setToolTip('消息助手')
            win.focus()
            undone = []
          }
        },
        {label: '设置',click:()=>{
            win.webContents.send('userSetting');
          }
        },
        {label: '退出',click:()=>{
            win.close()
            tray.destroy()
          }
        } // 退出
      ]
    );
  // 提示
  tray.setToolTip('消息助手');
  // 设置菜单到图标
  tray.setContextMenu(contextMenu);

  tray.on('balloon-click',()=>{
   win.focus() // 置顶（优先显示）
   win.webContents.send('stopBoy')
  })
  var changeIcon = function(){
    var empty = nativeImage.createEmpty();
    tray.setImage(empty)
  }
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
let undone = [];
ipcMain.on('newPush',(event,msg)=>{
    let user = msg[0];
    let newpush = msg[1];
    if (Array.isArray(undone) && undone.length === 0) {
      // 当初始 总数组 长度为 0 时 将新推送的数组先进行排序
      newpush.sort(keysrt('date',true));
      // console.log(1111)
      // 遍历新推送的数据 若某项 oper 值为 ‘delete’ 将其从数组中删除
      newpush.forEach((c,i)=>{
        c.oper === 'DELETE' && newpush.splice(i,1);
      });
      // console.log('ishere' + newpush)
      // console.log(2222)
      // 将处理好的数组返回给渲染进程
      event.returnValue = newpush;
    }else if(Array.isArray(undone) && undone.length > 0){
      // console.log(3333)
      // console.log(newpush)

      newpush.forEach((c,i)=>{
        // 遍历总数组 每一项单据
        // console.log('ishere?')
        undone.forEach((v,j)=>{
          // console.log(c.id +"==="+ v.id)
          // 未处理总数组的每项单据的 ID 与 新单据的 ID 不能相同
         // c.id === v.id && [undone.splice(i,1)];
          if (v.id === c.id){
            undone.splice(j,1);
            // console.log(000)
          } 
          
        })
        if (c.oper === 'DELETE')  newpush.splice(i,1);
         //当信推送的信息中有 oper 为 ‘delete’ 的 便将其从数组中删除
      });
      // console.log(undone)
      // 将查重之后的新单据数组拼接到总数组之后
      undone = undone.concat(newpush)
      undone.sort(keysrt('date',true));
      // 通知渲染进程 改变数组
     // win.webContents.send('checkLists',undone);
     event.returnValue = undone;
     // console.log(4444)
    }

    // 初始化拼接字符串
    let str = '';
    // 遍历新推送的数据
    newpush.forEach(c=>{
      // 将新单据中的数据拼接到 str 中
        str += `时间 -> ${c.date} \n项目 -> ${c.project} \n事由 -> ${c.cause} \n金额 -> ${c.amount} 元 \n经办人 -> ${c.creater}\n S`
    });
    // 将 str 中的数据按指定的字符 拆分 成数组
    let array = str.split('S');
    // 使用 生成器来控制单个输出
    function* Iterators(arr) {
      for(let i=0,len=arr.length;i<len;i++){
        yield arr.slice(i,i+1);
      }
    }
    let gen = Iterators(array);
    (function change(){
      try{
        if (Array.isArray(newpush) && newpush.length >0) {
          // 设置气泡提示信息
          tray.displayBalloon({
            icon:'../thr/img/87.jpg',
            title:` ${user} 您好,您有 ${newpush.length} 个新业务未处理.`,
            content:gen.next().value.join()
          });
          // 给渲染进程信号 让 提示音 响起
          win.webContents.send('playBoy')
          // 每 3s 弹出一个提示框
          setTimeout(change,3000);
        }
      }catch(e){
        // console.log(e)
      }
    })();

    // 页面窗口闪动提示
    newpush.length > 0 && win.flashFrame(true);
    // 设置鼠标悬浮 右下角 Icon 时显示的提示文字
    tray.setToolTip(`消息助手 - 当前用户 ( ${user} ) 待办事件 ${undone.length>0?undone.length:'无'}`)
})

ipcMain.on('FirstData',(event,msg)=>{
  // 当输入用户名之后将 undone 赋值为 最开始的未完成数组
  undone = msg;

  if (Array.isArray(undone) && undone.length >0) {
    event.returnValue =  undone.sort(keysrt('date',true));
    //console.log(undone.sort(keysrt('date',true)))
  }else if(Array.isArray(undone) && undone.length === 0){
    event.returnValue = undone;
  }
})
// 当用户点击输入密码上面的头像时回到输入账号的页面
ipcMain.on('Back',(event,msg)=>{
  // console.log('goBack');
  // 清空总数组
  undone = [];
  // 将右下角 Icon 提示文字 修改为默认文字
  tray.setToolTip('消息助手')
})
