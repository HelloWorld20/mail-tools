/**
 * description: 主线程核心函数
 */

"use strict"

const iconv = require('iconv-lite');
const fs = require('fs');
const {ipcMain,dialog,BrowserWindow} = require('electron');

let mainWindow;

let core = {
	mainInit: ( path, callback ) => {
		// 创建一个浏览器窗口对象，并指定窗口的大小
		mainWindow = new BrowserWindow({
	        width:1000,
	        height:700
	    });

	    // 通过浏览器窗口对象加载index.html文件，同时也是可以加载一个互联网地址的
	    mainWindow.loadURL( path ); 
	    // 同时也可以简化成：mainWindow.loadURL('./index.html');

	    // 监听浏览器窗口对象是否关闭，关闭之后直接将mainWindow指向空引用，也就是回收对象内存空间
	    mainWindow.on("closed",function(){
	        mainWindow = null;
	    });


	    // mainWindow.openDevTools();

	    if(core.isFunction( callback )) callback();

	    return mainWindow;
	},
	//返回主页面对象
	getWindow: () => mainWindow,

	send: (channal, msg) => {
		mainWindow.webContents.send(channal, {value: msg})
	},

	//后台向前台发送信息
	log: function( msg ) {
		console.log('log: '+ msg );
		mainWindow.webContents.send('log', {value: msg});
	},
	//读取前台传来的值，handleRes：处理信息的方法；reply：回执信息。
	get: (handleRes, reply) => {
		ipcMain.on('main', (event, res) => {
		    handleRes(event, res);
		    if(reply) event.sender.send('main-reply', reply);
		})
	},

	//字符串转换成二进制。
	str2Buff: (str) => {
		return iconv.encode(str, 'gb2312')
	},
	//二进制转化成gb2312编码的字符串。
	buff2Str: (buff) => {
		return iconv.decode(buff, 'gb2312')
	},

	loadFile: (filePath, errMsg) => {
		if(!errMsg) {
			errMsg = 'loadFile error...'
		}
		return fs.readFileSync(filePath, {}, function(err) {
			if(err) {
				console.log(errMsg);
				throw new Error('loadFile Error: ' + err);
			} else {
				return true;
			}
		})
	},

	writeFile: (filePath, content, errMsg) => {
		if(!errMsg) {
			errMsg = 'writeFile error...'
		}
		fs.writeFileSync(filePath, content, {}, function(err) {
			if(err) {
				console.log(errMsg);
				throw new Error('loadFile Error: ' + err);
			} else {
				return true;
			}
		})
	},

	handleError: (err, msg) => {
		if(err) {
			core.log(msg);
			throw new Error('[Custom Error: ' + msg + ']')
		}
	},
	
	extend: function( target, options ) {
	    let result = new Object();  //return一个新对象，隔断引用

	    for( let property in target ) {

	        if( this.isObject( target[ property ] || this.isArray( target[ property ] ) ) ) {
	            //如果属性是对象和对象则递归调用，防止直接赋值引用。
	            result[ property ] = this.extend( {}, target[ property ] );  
	        } else {
	            result[ property ] = target[ property ];
	        }
	        
	    }

	    for( let property in options ) {

	        if( this.isObject( options[ property ] || this.isArray( target[ property ] ) ) ) {
	            //如果属性是对象和对象则递归调用，防止直接赋值引用。
	            result[ property ] = this.extend( {}, options[ property ] );
	        } else {
	            result[ property ] = options[ property ];
	        }
	        
	    }

	    return result;
	},

	//后台给前台的alert
	showMsg: (title, message) => {
		if( message == undefined ) {
			message = title;
			title = '提示';
		}
		dialog.showMessageBox({
	        type: 'info',
	        buttons: ['确定'],
	        title: title,
	        message: message,
	    });
	    core.log(message);
	},

	isArray: obj => {
    	return Object.prototype.toString.call( obj ) === '[object Array]'
	},

	isFunction: obj => {
	    return Object.prototype.toString.call( obj ) === '[object Function]';
	},

	isObject: obj => {
	  	return Object.prototype.toString.call( obj ) === '[object Object]';
	}

}

module.exports = core;