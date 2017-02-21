/**
 * description：设置一个计数器，计数器为0时，执行callback
 * date：2016-11-22
 * 
 */

"use strict"
const core = require('./core.js');

/**
 * [Counter description]
 * @param {[type]}   counter  [计数counter-1次后才执行callback函数。counter应始终大于0。如果小于0。则无限计数]
 * @param {Function} callback [延迟执行的回调函数]
 */
function Counter( counter, callback ){
	this.counter = counter;
	this.callback = callback;
}

//计数为等于0时每次执行，计数减一。计数计数后，执行callback
Counter.prototype.count = function() {
	if( this.counter === 0 ) {
		if( core.isFunction(this.callback) ) this.callback();
	} else {
		this.counter--;
	}
}

module.exports = Counter;