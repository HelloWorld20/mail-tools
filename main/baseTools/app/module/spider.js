/**
 * description：登录获取cookie模块
 * author: weijianghong
 * date: 2016-11-8
 */

"use strict"

const superagent = require('superagent');
const config = require('../config.js');
const core = require('../lib/core.js');

const {log} = require('../../../lib/core.js');

/**
 * [登录程序，访问登录服务器，获取sessionID，拼接关键的cookie]
 * @param  {Function} callback [回调函数，登录成功后会把关键的cookie值填充给callback]
 * @param  {Boolean}  isTest   [是否登录测试线，true：测试线；false：生产线]
 * @return {[type]}            [description]
 */
module.exports = (callback, isTest) => {
	let loginServer = '',
		loginMessage = ''

	if( isTest ) {
		//测试线地址
		loginMessage = config.loginMessageTest;
		loginServer = config.loginServerTest;
	} else {
		loginMessage = config.loginMessage;
		loginServer = config.loginServer;
	}
	log('正在登录。。。');
	superagent.post(loginServer)	
			.query(loginMessage)
			.end((err, res) => {
				core.handleError(err, 'login fail...');
				let cookie = res.headers['set-cookie'];
				if( !cookie ) throw new Error('系统未正确响应，登录时没有返回set-cookie');
				
				//组合cookie
				let cookieCombine = '';
				//cookie里只需要LoggedName和ASP.NET_SessionId就可以，多点无所谓；
				cookieCombine = cookie[0] + '; LoggedName=' + config.username; 

				log('登录成功：' + cookieCombine);
				//如果参数是函数，生成的组合cookie传给回调函数
				if( core.isFunction( callback ) )  callback( cookieCombine );

			})
}

//B0AA38EEB4DA24AC7A89A51656320621
//B0AA38EEB4DA24AC7A89A51656320621