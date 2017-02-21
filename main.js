// 
//                                  _oo8oo_
//                                 o8888888o
//                                 88" . "88
//                                 (| -_- |)
//                                 0\  =  /0
//                               ___/'==='\___
//                             .' \\|     |// '.
//                            / \\|||  :  |||// \
//                           / _||||| -:- |||||_ \
//                          |   | \\\  -  /// |   |
//                          | \_|  ''\---/''  |_/ |
//                          \  .-\__  '-'  __/-.  /
//                        ___'. .'  /--.--\  '. .'___
//                     ."" '<  '.___\_<|>_/___.'  >' "".
//                    | | :  `- \`.:`\ _ /`:.`/ -`  : | |
//                    \  \ `-.   \_ __\ /__ _/   .-` /  /
//                =====`-.____`.___ \_____/ ___.`____.-`=====
//                                  `=---=`
// 
// 
//               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
//                          佛祖保佑         永不宕机/永无bug
//

/**
 * description：electron后台进程。
 */
"use strict"

// 载入electron模块
const {app,ipcMain,dialog}=require("electron");
const {get,mainInit} = require('./main/lib/core.js');
const route = require('./main/route.js');

const superagent = require('superagent');

const {handleDialog,handleInit,handleUpload,handleFileDialog,handleGetFile,test,handleSetLocalConf,handleSendMail,handleConverEml,handleGetMarkdown} = route;

let mainWindow;

//自定义方法入口
function entry() {

    //监听前端页面传过来的方法。分开处理请求
    get( (event, res) => {
        let method = res.method;
        let value = res.value;

        if(method === 'dialog') {   //打开选择文件夹对话框
            handleDialog( event, mainWindow );
        } else if (method === 'fileDialog') {       //弹出对话框，返回文件路径
            handleFileDialog( event, mainWindow );
        } else if (method === 'init') {     //初始化关键文件
            handleInit( value );
        } else if (method === 'upload') {       //上传文件
            handleUpload( value );
        } else if (method === 'getFile') {      //爬取文件
            handleGetFile( value );
        } else if (method === 'test' ) {        //测试
            test( value );
        } else if (method === 'setLocalConf' ) {    //保存至本地配置
            handleSetLocalConf( value );
        } else if (method === 'sendMail' ) {        //发送邮件
            handleSendMail( value );
        } else if (method === 'eml') {
            handleConverEml(value);
        } else if (method === 'getMarkdown') {
            handleGetMarkdown();
        }

    })
    

}


// 定义一个创建浏览器窗口的方法
function createWindow(){
    //把所有初始化的东西都放到core里，为的是让窗口对象mainWindow可以全局访问;
    mainWindow = mainInit( 'file://'+__dirname+'/index.html', entry );
}

// 监听应用程序对象是否初始化完成，初始化完成之后即可创建浏览器窗口
app.on("ready",createWindow);

// 监听应用程序对象中的所有浏览器窗口对象是否全部被关闭，如果全部被关闭，则退出整个应用程序。该
app.on("window-all-closed",function(){
    // 判断当前操作系统是否是window系统，因为这个事件只作用在window系统中
    if(process.platform!="darwin"){
        // 退出整个应用程序
        app.quit();
    }
});

// 监听应用程序图标被通过点或者没有任何浏览器窗口显示在桌面上，那我们应该重新创建并打开浏览器窗口，避免Mac OS X系统回收或者销毁浏览器窗口
app.on("activate",function(){
    if(mainWindow===null){
        createWindow();
    }
});


