var ipcRender = require('ipcRenderer');
var closeEl = document.querySelector('.close');
closeEl.addEventListener('click',()=>{
	alert(111)
	ipcRender.send('close-main-window');
})
