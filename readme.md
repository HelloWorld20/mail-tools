自己实现的一个基于electron的工具程序，用于辅助开发139投递平台邮件模板的配置工作。没什么伟大的功能，只是为了减轻一下自己的工作量，同时学学新技术，练练手。

#安装
##node.js和npm
Node 是服务器的 JavaScript 运行环境。

[node.js官网](https://nodejs.org/en/)，或自行百度。下载双击运行。安装程序会自动配置环境变量。

安装完成后在控制台中执行

    node -v

如果出现版本号，说明安装成功。

安装node.js会同时安装npm（是 Node 的模块管理器，相当于node程序的应用商店，下载和管理node模块的必备工具），

    npm -v

保证node和npm都成功安装。

##npm淘宝镜像
![淘宝npm镜像](https://zos.alipayobjects.com/rmsportal/UQvFKvLLWPPmxTM.png)

由于国内互联网环境使然，npm很可能不能正常使用。需安装npm淘宝镜像。

[npm淘宝镜像官网](https://npm.taobao.org/)

在控制台中执行

    npm install -g cnpm --registry=https://registry.npm.taobao.org

##electron
![electron](https://camo.githubusercontent.com/5dd01312b30468423cb45b582b83773f5a9019bb/687474703a2f2f656c656374726f6e2e61746f6d2e696f2f696d616765732f656c656374726f6e2d6c6f676f2e737667)

electron是基于node和chrome开发的一套开发框架，实质上就是一个能让JavaScript拥有操作系统API的chrome浏览器。

[electron官方网站](http://electron.atom.io/)

在控制台中执行

    cnpm install electron -g

如果能成功安装，在控制台中执行

    electron

会打开一个electron简介页面。

##安装依赖包
打开控制台，切换到项目目录下（有package.json的目录）。执行

    cnpm install

安装必要的依赖包。

#修改账号和密码

因为此工具基本不会变动账号和密码，所以直接写死在配置文件里。

需要在main/baseTools/app/config.js里修改账户名和密码

    username: '(账户名)',       //投递平台的用户名
    password: '(密码的BASE64)',   //投递平台的密码的32位MD5
    
    loginMessage: '.UserLogin%2520.txtUserName=(账户名)&.UserLogin%2520.txtPassword=(密码的BASE64)',  //登录投递平台需要的登录账号密码信息。
    
    loginMessageTest: '.UserLogin%2520.txtUserName=(账户名)&.UserLogin%2520.txtPassword=(密码明文)!',    //登录测试线需要的信息

#运行
以上内容安装完成后，打开控制台，切换到项目目录下，执行

    electron .

或者在任意路径下执行

    electron (项目路径根目录)

即可运行程序。

#其他

* 打包功能有问题。暂不能打包。只能运行开发版本
* 此程序在Windows10环境下开发，不保证在Linux和Mac环境下能完美运行。

