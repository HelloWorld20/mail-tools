/**
 * description：上传模板到测试线
 * author：weijianghong
 * date：2016-12-06
 */

"use strict"


const fs = require('fs');
const superagent = require('superagent');
const iconv = require('iconv-lite');

const core = require('./lib/core.js');
const config = require('./config.js');

const spider = require('./module/spider.js');
const Counter = require('./lib/counter.js');

const {log} = require('../../lib/core.js');


//以下都是为了异步传值的全局变量。暂时这么用
let TemplateIDGlo = -1;
let cookieCombineGlo = '';
let queryMessageGlo = {};			//上传邮件模板的信息
let resouceQueryMessageGlo = {};	//上传封装资源的信息
let resourceIDGlo = -1;
let uploadHtml = '';
let uploadQvga = '';
let uploadResource = '';


//流程1：获取登录信息=>用模板名称去搜索模板列表=》取第一个模板ID=》获取模板详情，获得足够上传参数=>上传模板=》审核
//流程2：获取登录信息=>用模板名称去搜索模板列表=》对应封装资源ID=》获取详情，获得参数=》上传封装资源=》审核


module.exports = ( conf, callback ) => {

	log('upload.js');

	//就在入口处和并配置文件；
	let confCombine = core.extend( config, conf );

	let counter = new Counter(1, verify);

	//邮件模板流程
	function* ProcessTpl() {
		console.time('upload');	
		yield getTemplateList();			//获取模板列表
		yield getTemplateInfo();			//进入模板详情页，组成信息				
		yield uploadTemplate();				//上传模板
		return 'ending'
	}

	//封装资源流程
	function* ProcessResouce() {
		yield getResouceInfo();				//获取封装资源详情，
		yield uploadResourceFile();			//上传封装资源文件
		return 'ending'
	}

	let procTpl = ProcessTpl();
	let procRes = ProcessResouce();


	readFile();
	//先读取要上传的文件名
	function readFile() {
		if( confCombine.uploadHtml ) {
			uploadHtml = core.buff2Str(fs.readFileSync( confCombine.uploadHtml ));
		}
		if( confCombine.uploadQvga ) {
			uploadQvga = core.buff2Str(fs.readFileSync( confCombine.uploadQvga ));
		}
		if( confCombine.uploadResource ) {
			uploadResource = core.buff2Str(fs.readFileSync( confCombine.uploadResource ))
		}
		
		login()
	}

	//获取登录session
	function login() {
		spider( entry , true);
	}

	//搜索模板列表，获取第一条记录的模板ID
	function entry( cookieCombine ) {
		cookieCombineGlo = cookieCombine;
		//上传邮件模板流程分支
		procTpl.next();
	}


	//获取邮件模板列表
	function getTemplateList( cookieCombine ) {
		log('正在获取邮件模板列表....');

		superagent.post( confCombine.searchPageUrlTest )
				.set( 'cookie', cookieCombineGlo )	//需要登录时的cookie
				.query( getListQuery( confCombine.tplName ) )
				.end( ( err, res ) => {
					core.handleError(err, 'get template ID fail...');

					let RecordSet = JSON.parse(res.text).RecordSet;
					//如果有两条记录
					if( RecordSet && RecordSet[1] ) {
						log('该模板文件名搜索出两条记录，请上投递平台核实邮件模板是否正确。')
					}
					if( RecordSet && RecordSet[0] ) {
						//暂时用全局变量存储传值
						TemplateIDGlo = RecordSet[0].TemplateID;
						log('获取模板列表成功;模板ID：' + TemplateIDGlo);

						procTpl.next();
					} else {
						//中断流程generator函数
						procTpl = null;
						log('没有找到对应的模板ID');
						return false;
					}

					return true;
				} )
	}


	//利用模板ID获取模板详细信息；
	function getTemplateInfo() {
		log('正在获取模板详情。。。');

		superagent.post( confCombine.templateViewTest )
				.set( 'cookie', cookieCombineGlo )
				.query( '.hdTemplateID=' + TemplateIDGlo )
				.end( (err, res) => {
					core.handleError(err, 'get template detail fail...');

					let RecordSet = JSON.parse(res.text).RecordSet;

					//对应的邮件封装资源ID，审核时用到；
					resourceIDGlo = RecordSet.ConvertResourceID;		
					queryMessageGlo =  getUploadQuery( RecordSet ,uploadHtml ,uploadQvga );

					if(!uploadHtml && !uploadResource) {
						return;
					}

					if (!!uploadHtml) {
						procTpl.next();		//继续邮件模板上传流程
					} else {
						counter.count();
					}

					if (!!uploadResource) {
						procRes.next();		//在这获得对应封装资源ID后进入上传封装资源流程。
					} else {
						counter.count();
					}
					
					return;
				})
		
	}

	//获取封装资源详情，
	function getResouceInfo() {		
		
		log('正在获取封装资源详情....');

		superagent.post( confCombine.ResourceViewTest )
				.set( 'cookie', cookieCombineGlo )
				.query( '.hdResourceID=' + resourceIDGlo )
				.end( ( err, res ) =>{
					core.handleError(err, 'get template detail fail...');

					let RecordSet = JSON.parse(res.text).RecordSet;

					resouceQueryMessageGlo = getUploadResourceQuery( RecordSet, uploadResource );
					
					procRes.next();
					return;
				})
	}

	//合并模板信息，并上传修改模板；
	function uploadTemplate() {
		log('正在上传模板数据。。。');

		superagent.post( confCombine.templateEditUrlTest )
				.set( 'cookie', cookieCombineGlo )
				.send( queryMessageGlo )
				.end( (err, res) => {
					core.handleError(err, 'upload files fail...');
	
					let ret = JSON.parse(res.text);

					if( ret.Result ) {
						log('上传邮件模板成功....');

						counter.count();
					} else {
						log('上传邮件模板失败....');
						console.log(res.text);

					}

				} )
		
	}

	//上传封装资源文件
	function uploadResourceFile() {
		log('正在上传封装资源数据。。。');

		superagent.post( confCombine.ResourceEditTest )
				.set( 'cookie', cookieCombineGlo )
				.send( resouceQueryMessageGlo )
				.end( (err, res) => {
					core.handleError(err, 'upload resource files fail...');
	
					let ret = JSON.parse(res.text);

					if( ret.Result ) {
						log('上传封装资源成功....');

						counter.count();
					} else {
						log('上传封装资源文件失败....');
						console.log(res.text);
					}

				} )
	}

	//审核
	function verify() {
		log('审核中....');
		superagent.post( confCombine.verifyUrlTest )
				.set( 'cookie', cookieCombineGlo )
				.send( 'ResourceID=' + resourceIDGlo )
				.end( ( err, res ) => {
					core.handleError(err, 'verify fail...');

					let ret = JSON.parse(res.text);

					if( ret.Result ) {
						log( '审核成功，上传流程已经完成....' );
						if( core.isFunction(callback) ) callback();
						procTpl.next();
					} else {
						log('verify fail....');
						console.log(res.text);
					}
					//结束计时
					console.timeEnd('upload');
					log('上传成功时间节点: ' + new Date())
				} )
	}

	
	


	//上传模板时需要传递的信息。
	function getUploadQuery( source, webTpl, wapTpl ) {
		let result = "";

		result += '.hdTemplateID=' + encodeURIComponent(source.TemplateID);
		result += '&';
		result += '.hdResourceID=' + encodeURIComponent(source.ConvertResourceID);
		result += '&';
		result += '.hdOrigResourceID=' + encodeURIComponent(source.OrigResourceID);
		result += '&';
		result += '.hdCompanyID=' + encodeURIComponent(source.CompanyID);
		result += '&';
		result += '.hdBusinessID=' + encodeURIComponent(source.BusinessID);
		result += '&';
		result += '.hdUploadType=' + '0' //source.UploadType;
		result += '&';
		result += '.txtRemark=' + encodeURIComponent(source.Remark);
		result += '&';
		result += '.txtSynUrl=' + encodeURIComponent(source.SynUrl);
		result += '&';
		result += '.txtPath=' + encodeURIComponent(source.Path);
		result += '&';
		result += '.txtWapScript=' + encodeURIComponent(source.WapScript);
		result += '&';
		result += '.txtQvgaUrl=' + encodeURIComponent(source.QvgaUrl);
		result += '&';
		result += '.txtTemplateName=' + encodeURIComponent(source.TemplateName);
		result += '&';
		result += '.txtCode=' + ( webTpl ? encodeURIComponent(webTpl) : encodeURIComponent(source.DataTemplate));
		result += '&';
		result += '.txtQvga=' +( wapTpl ? encodeURIComponent(wapTpl) : encodeURIComponent(source.Qvga));

		return result;
	}

	//上传封装资源时需要传递的信息。
	function getUploadResourceQuery( source, resourceStr ) {
		let result = "";

		result += '.hdResourceID=' + encodeURIComponent(source.ConvertResourceID);
		result += '&';
		result += '.hdBusinessID=' + encodeURIComponent(source.BusinessID);
		result += '&';
		result += '.txtResourceConfig=' + encodeURIComponent(source.ResourceConfig);
		result += '&';
		result += '.txtParseConfig='+(resourceStr ? encodeURIComponent(resourceStr) : encodeURIComponent(source.ParseConfig));
		result += '&';
		result += '.txtRemark=' + encodeURIComponent(source.Remark);
		result += '&';
		result += '.hdHttpUrl=' + encodeURIComponent(source.HttpUrl);
		result += '&';
		result += '.hdUrl0=';
		result += '&';
		result += '.hdUrl1=';
		result += '&';
		result += '.hdUrl2=';
		result += '&';
		result += '.txtFilePath=';

		return result;
	}



	//搜索邮件模板时需要的参数
	function getListQuery( value ) {
		let result = {};

		result['.hdCompanyID'] = 0
		result['.hdBusinessID'] = 0
		result['.hdResourceID'] = 0
		result['.hdBusinessTypeID'] = 0
		result['.txtTemplateID:'] = ''
		result['.txtTemplateName'] = escape( value )
		result['.txtSender:'] = null
		result['.txtStartDate:'] = null
		result['.txtEndDate:'] = null
		result['CurPage'] = 0
		result['PageSize'] = 2

		return result;
	}

	function getResourceListQuery( value ) {
		let result = {};

		result['.hdCompanyID'] = 0
		result['.hdBusinessID'] = 0
		result['.txtSender'] = null
		result['.txtStartDate:'] = null
		result['.txtEndDate:'] = null
		result['.hdBusinessTypeID'] = 0
		result['.selectTag%20.EncapsulateMailResourceType'] = 0
		result['.txtResourceName'] = escape( value )
		result['CurPage'] = 0
		result['PageSize'] = 2

		return result;
	}


};

