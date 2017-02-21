/**
 * description：从生产线上爬取文件
 * author：weijianghong
 * date：2016-11-18
 */

"use strict"

const superagent = require('superagent');
const config = require('./config.js');
const core = require('./lib/core.js');
const Counter = require('./lib/counter.js');

const spider = require('./module/spider.js');
const mkdir = require('./module/mkdir.js');
const getFile = require('./module/getFile.js');
const createTemplateStorageFile = require('./module/createDefault.js').createTemplateStorageFile;

const {log} = require('../../lib/core.js');

module.exports = ( conf, callback ) => {
	log('getFile.js');

	//就在入口处和并配置文件；
	let confCombine = core.extend( config, conf );
	
	//先创建目录，回调函数执行爬虫程序
	mkdir( confCombine.fullName, runSpider )

	function runSpider() {
		//爬取程序，需要传入回调函数，回调函数填充spider程序登录获得的关键cookie值
		spider( ( cookieCombine ) => {
			entry( cookieCombine, confCombine, callback)
		} )
	}
}


function entry( cookieCombine, conf, callback ) {
	let counter = new Counter(1, callback);

	if( conf.yjmbID ) {
		//带入登录的sessionID拿到template模板。
		getFile.getTemplateFile( cookieCombine, conf, function() {
			counter.count();
		});
	} else {
		throw new Error('没有邮件模板ID')
	}

	if( conf.yjfzzyID ) {
		//获取邮件封装资源；
		getFile.getConfigFile( cookieCombine, conf, function() {
			counter.count();
		});
	} else {
		throw new Error('没有邮件封装资源ID')
	}
	//生成“模板地址.html”文件
	createTemplateStorageFile( conf );

}



			