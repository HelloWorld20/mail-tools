/**
 * description: 根据情况生成目标文件夹，generator版本；
 * author: weijianghong
 * date: 2016-11-8
 */

"use strict"

const fs = require('fs');
const rimraf = require('rimraf');

module.exports = ( dirName, callback ) => {

	//generator函数
	function* makeDir() {

		yield first();

		yield second();

		return 'ending'
	}

	var md = makeDir();

	md.next();	//首次调用。

	function first() {
		fs.stat('./' + dirName, ( err, stat ) => {
			if( stat ) {
				//如果已经有目标文件，则跳转下一步，判断生成oldVersion版。
				md.next();
			} else {
				//不存在目标文件夹，即第一次新建
				fs.mkdirSync('./'+ dirName);
				callback();
			}
		})
	}

	function second() {
		fs.stat('./'+ dirName + '_oldVersion', ( err, stat ) => {

			if( stat ) {
				//存在oldVertion的情况
				//强制删除非空文件夹。
				rimraf('./'+ dirName + '_oldVersion', err => {
						if( err ) throw new Error('rm oldVersion folder fail...')
						fs.renameSync('./'+dirName, './'+ dirName + '_oldVersion');
		    			fs.mkdirSync('./'+ dirName);
					});
				callback();
			} else {
				//不存在oldVertion的情况
				fs.renameSync('./'+dirName, './'+ dirName + '_oldVersion');
	    		fs.mkdirSync('./'+ dirName);
				callback();

			}
		})
	}

}