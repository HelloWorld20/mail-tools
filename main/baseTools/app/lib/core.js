/**
 * baseTools核心函数
 */

"use strict"
var iconv = require('iconv-lite');
var fs = require('fs');

const {log} = require('../../../lib/core.js')

module.exports = {
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
			console.error(err);
			log('[Custom isError: ' + msg + ']')
			throw new Error('[Custom isError: ' + msg + ']')
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