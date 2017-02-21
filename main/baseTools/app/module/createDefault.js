/**
 * 生成原始配置文件。
 * author: weijianghong
 * date: 2016-11-11
 */
"use strict"

const fs = require('fs');

const superagent = require('superagent');
const charset = require('superagent-charset');
const cheerio = require('cheerio');

const core = require('../lib/core.js');
const Counter = require('../lib/counter.js');


//把charset方法写入superagent原型里。扩展功能
charset(superagent);

module.exports = {

	//生成配置文件ParseConfig.xml和ResourcePackageConfig.xml
	createConfigFiles: ( conf ) => {

		let fullName = conf.fullName;
		if(!conf.apiType) {
			new Error('没有指定接口类型');
			return;
		}

		let sourceFileMap = conf.sourceFileMap;
		let apiType = conf.apiType.toLowerCase();

		//不需要操作时，不用转码，直接写入文件。
		let parseConfigTpl = fs.readFileSync(sourceFileMap[apiType] || sourceFileMap['bill']);

		//读取默认的配置文件，然后用业务全称替换标记处。
		let sourceConfigTpl = fs.readFileSync(sourceFileMap['resourceConfig'])
		//转码
		let gbSourceConfig = core.buff2Str(sourceConfigTpl);
		// fullName = core.buff2Str(fullName);
		//替换
		gbSourceConfig = gbSourceConfig.replace(/{{fullName}}/g, fullName);
		//还原
		let buffSourceConfig = core.str2Buff(gbSourceConfig);

		//输出
		fs.writeFile('./'+fullName+'/ParseConfig.xml', parseConfigTpl, function() {})
		fs.writeFile('./'+fullName+'/ResourcePackageConfig.xml', buffSourceConfig, function() {})
		if(apiType === 'bill') {
			let configBuff = fs.readFileSync(sourceFileMap['config'])
			fs.writeFile('./'+fullName+'/'+conf.shortName+'.config', configBuff, function() {})
		}
	},

	//填充两个模板内容
	createTempleteFiles: ( conf, callback ) => {
		let couter = new Counter(1, callback);
		let fullName = conf.fullName;
		//爬取静态模板内容然后填充
		if( conf.webUrl ) {
			superagent.get(conf.webUrl)
				.charset(conf.charset)
				.end(function(err, res) {
					core.handleError(err, '获取web模板错误，请检查wap模板地址是否有误');

					fs.writeFile('./'+fullName+'/'+ fullName +'.html', core.str2Buff(res.text) , function() {
							couter.count();
					})
				})
		} else {
			couter.count();
		}
		

		if( conf.wapUrl ) {
			superagent.get(conf.wapUrl)
				.charset(conf.charset)
				.end(function(err, res) {
					core.handleError(err, '获取wap模板错误，请检查wap模板地址是否有误');

					fs.writeFile('./'+fullName+'/'+ fullName +'.qvga.html', core.str2Buff(res.text), function() {
							couter.count();
					})
				})
		} else {
			couter.count();
		}
		
		return;	

	},
	//只是生成一个空白的txt文件。用于保存报文
	createDataFile: ( fullName ) => {
		fs.writeFileSync('./'+fullName+'/data.txt', '');
	},
	//生成‘模板地址.html‘文件
	createTemplateStorageFile: ( conf ) => {

		let webUrl = conf.webUrl, 
			wapUrl = conf.wapUrl, 
			fullName = conf.fullName, 
			sourceFileMap = conf.sourceFileMap;
		let tpl = fs.readFileSync( sourceFileMap['tpl'] , {coding: 'UTF-8'}, function() {})

		let $ = cheerio.load(tpl);

		let result = '';

		if(webUrl) {
			$('#web').attr('href', webUrl);
			$('#web').html(webUrl);
		} else {
			$('#web').html('没有web模板地址');
		}
		
		if(wapUrl) {
			$('#wap').attr('href', wapUrl);
			$('#wap').html(wapUrl);
		} else {
			$('#wap').html('没有wap模板地址');
		}

		if(fullName) {
			$('#head').html(fullName)
		} else {
			$('#head').html("模板地址");
		}
		
		result = $("html").html();

		fs.writeFile('./'+fullName+'/模板地址.html', result, {coding: 'UTF-8'})
	}
}

