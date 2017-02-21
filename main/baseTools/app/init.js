/**
 * 生成原始配置文件
 */

"use strict"

const fs = require('fs');
const core = require('./lib/core.js');
const config = require('./config.js');
const mkdir = require('./module/mkdir.js');
const createDefault = require('./module/createDefault.js');

const {log} = require('../../lib/core.js');

/**
 * [生成原始配置文件]
 * @param  {[object]} conf [自定义配置文件]
 * @return {[type]}      [description]
 */
module.exports = ( conf, callback ) => {
	log('init.js');

	//就在入口处和并配置文件；
	let confCombine = core.extend( config, conf );

	mkdir( confCombine.fullName, () => {
		createFiles( confCombine, callback )
	});

}

function createFiles( conf, callback ) {
	createDefault.createConfigFiles( conf );
	createDefault.createTempleteFiles( conf, callback );
	createDefault.createTemplateStorageFile( conf );
	createDefault.createDataFile( conf.fullName );
}