/**
 * 获取生产线投递平台模板并且生成文件模块
 * author: weijianghong
 * date: 2016-11-08
 */

"use strict"

const core = require('../lib/core.js');
const superagent = require('superagent');

module.exports = {
	getTemplateFile: ( cookieCombine, conf, callback ) => {
		let fullName = conf.fullName;
		superagent.post( conf.templateView )
				.query( '.hdTemplateID=' + conf.yjmbID )
				.set( 'cookie', cookieCombine )	//需要登录时的cookie
				.end((err, res) => {
					core.handleError(err, 'Get' + conf.templateView + 'error!');

					let RecordSet = JSON.parse(res.text).RecordSet;
					if(!RecordSet) throw new Error("没有返回邮件模板内容，检查ID是否有误");

			        core.writeFile('./'+fullName+'/'+ fullName +'.html', core.str2Buff(RecordSet.DataTemplate));
			        core.writeFile('./'+fullName+'/'+ fullName +'.qvga', core.str2Buff(RecordSet.Qvga));

			        if( core.isFunction(callback) ) callback();
		    })

	},
	getConfigFile: ( cookieCombine, conf, callback ) => {
		let fullName = conf.fullName;
		superagent.post(conf.ResourceView)
				.query('.hdResourceID=' + conf.yjfzzyID)
				.set('cookie', cookieCombine)	//需要登录时的cookie
				.end((err, res) => {
					core.handleError(err, 'Get' + conf.ResourceView + 'error!')
					
					let RecordSet = JSON.parse(res.text).RecordSet;
					if(!RecordSet) throw new Error("没有返回邮件封装资源内容，检查ID是否有误");

			        core.writeFile('./'+fullName+'/ParseConfig.xml', core.str2Buff(RecordSet.ParseConfig));
			        core.writeFile('./'+fullName+'/ResourcePackageConfig.xml', core.str2Buff(RecordSet.ResourceConfig));

			        if( core.isFunction(callback) ) callback();
		    })
	}
}
