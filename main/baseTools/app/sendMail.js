/**
 * 下发邮件组件
 */
"use strict"
const config = require('./config.js');
const core = require('./lib/core.js');

const mail = require('./module/mail.js');

module.exports = ( conf, callback ) => {
	let confConbine = core.extend( config, conf );

	mail( confConbine, callback );
}