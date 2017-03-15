/**
 * eml转html核心函数
 * author: weijianghong
 * date: 2016-12-15 
 */

"use strict"
const path = require('path');
const iconv = require('iconv-lite');
const {log} = require('../../../lib/core.js')

const core = require('../lib/core.js');


module.exports = (filePath, callback) => {
	let eml = core.loadFile(filePath, 'read eml file fail....');

	let basename = path.basename(filePath);

	let emlArr = escape(iconv.decode(eml, 'utf-8')).split('%0D%0A');

	let flagBlank = false;
	let flagText = false;
	
	let result = "";
	emlArr.forEach(item => {

		if( item.indexOf('text/html') !== -1 ) {	//找到开始的关键字
			flagText = !flagText;
		}
		//如果找到text/html之后再找到空格之后就可以读值了。
		if(flagText && item === "") {		
			flagBlank = !flagBlank;
		}

		if(flagBlank && flagText) {
			//开始读取值
			result += unescape(item)
		}

		//如果再遇到空白
		if(flagBlank && flagText && item === "") {				
			return;
		}

	})

	let resultGbBuff = iconv.encode(result, 'base64');

	//	从html中提取QVGA，转换成html
	let forehead = resultGbBuff.indexOf('<WEB TYPE="QVGA">');
	let backword = resultGbBuff.indexOf('</WEB>')

	//如果有的话，
	if(forehead !== -1 && backword !== -1) {
		let qvgaResult = resultGbBuff.slice(forehead + 17, backword)

		let qvgaGbBuff = iconv.encode(qvgaResult, 'base64');
		core.writeFile( basename + '.qvga.html', qvgaGbBuff, "convert eml to qvga.html fail....");
	} else {
		log('当前eml中未包含qvga邮件!!')
	}



	core.writeFile( basename + '.html', resultGbBuff, "convert eml to html fail....");

	if(core.isFunction(callback)) callback();

	return resultGbBuff;
}