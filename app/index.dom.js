"use strict"

const {ipcRenderer} = require('electron');

const core = require('./app/lib/core.js');
const tConfig = require('./main/tConfig.json');

//用于存储数据，以后要做成模块
// let store = {}

let $ = core.$;
let $$ = core.$$;

let counter = 0;

let main = {
	//webContent发送main消息到main Process。callback是处理main Process返回消息的方法
	send: (message, callback) => {
		ipcRenderer.send('main', message);
		if(callback) ipcRenderer.once('main-reply', callback);
	},

	mainListener: callback => {
	    ipcRenderer.on('main', callback);
	},

	removeMainListener: callback => {
	    ipcRenderer.removeListener('main', callback);
	},

	initListenerOne: (name, callback) => {
		ipcRenderer.once(name, callback);
	},

	initListener: (name, callback) => {
		ipcRenderer.on(name, callback);
	},

	removeListener: (name, callback) => {
		ipcRenderer.removeListener(name, callback);
	},


	//////////////////////////////
	// 初始化切换选项卡功能；
	initTabs: function() {
		let nav = $('#nav');

		nav.onclick = function(e) {
			e.preventDefault();

			if(e.target.tagName !== 'A') return;

			let panes = $$('.tab-pane');
			let tabs = $$('#nav li');
			tabs.forEach(function( item ) {
				core.removeClass( item, 'active');
			})
			panes.forEach(function( item ) {
				core.addClass( item, 'hide');
			})

			core.addClass( e.target.parentNode, 'active' );

			let paneId = e.target.getAttribute('data-href');

			core.removeClass( $(paneId), 'hide');
		}
	},
	//禁止表单默认提交事件
	disableSubmit: () => {
		$$("form").forEach( item => {
			item.onsubmit = e => {
				e.preventDefault();
			}
		})
	},

	//初始化拖拽方法。只是要获取文件路径不需要readFile API
	initDrag: function( selector, isLight, callback ) {
		
		let elem = $(selector);
		elem.counter = 0;

		$(selector).ondragenter = e => {
			e.preventDefault();
			e.stopPropagation();

			if(!isLight) return;

			elem.counter++;
			core.addClass( elem, 'highLight' )
		};

		$(selector).ondragleave = e => {
			e.preventDefault();
			e.stopPropagation();

			if(!isLight) return;
			//修正拖拽方法进入子元素时也会出发dragleave事件的方法
			elem.counter--;
			if(elem.counter === 0) {
				core.removeClass( elem, 'highLight' )			
			}
		};

		$(selector).ondragover = e => {
			e.preventDefault();
			e.stopPropagation();
		};

		$(selector).ondrop = e => {
			e.preventDefault();
			e.stopPropagation();

			elem.counter--;
			if(elem.counter === 0) {
				core.removeClass( elem, 'highLight' )
			}
			if(core.isFunction(callback)) callback(e);
		}
		
	},

	//挂载fileReader；
	// initReader: function( target , callback) {
	// 	let reader = new FileReader();

	// 	//当input包含的file有改变时才会触发
	// 	target.addEventListener('change', readFileText, false)
		
	// 	function readFileText() {
	// 		let file = this.files[0];
				
	// 		reader.readAsText(file);
	// 		reader.onload = function(e) {
	// 			if( core.isFunction( callback ) ) callback(e.target.result);
	// 		}
	// 	}
	// },

	//销毁fileReader
	destroyReader: selector => {
		$(selector).onchange = null;
	},

	//把页面内的配置数据转换成对象；
	getConfig: selector => {
		let domInputs = $$(selector);
		let result = {};
		domInputs.forEach( dom => {
			result[dom.getAttribute('name')] = dom.value;
		})

		return result;
	},

	//把配置内容写入前端页面
	setConfig: () => {
		let config = main.getTempConf();
		for(let i in config) {
			let elems = $$('input[name="'+i+'"]')
			if(elems !== 0) {
				elems.forEach( item => {
					item.setAttribute('value', config[i])
				} )
			}
		}
	},

	//读取默认配置文件
	getTempConf: () => {
		return core.extend({}, tConfig);
	},

	getCurrentConf: () => {
		let result = {};
		$$('input').forEach( item => {
			let name = item.getAttribute('name')
			let value = item.value
			if( name ) {
				result[name] = value;
			}
		})
		return result;
	},

	//设置默认配置文件
	setLocalConf: conf => {
		main.send( {method: 'setLocalConf', value: conf} );
	},

	//点击之后弹出文件夹对话框，然后返回路径
	initPathSelector: ( selector, callback ) => {
		$(selector).addEventListener('click', function() {
			main.send({method: 'dialog'});

			//路径包含在res里
			main.initListenerOne('path', (event, res) => {
				if(core.isFunction(callback)) callback( res );
			});

		}, false)
	},
	//再来一个，点击弹出文件选择对话框，然后返回路径
	initFileSelector: ( selector, callback ) => {
		$(selector).addEventListener('click', function() {
			main.send({method: 'fileDialog'});

			//路径包含在res里
			main.initListenerOne('path', (event, res) => {
				if(core.isFunction(callback)) callback( res );
			});

		}, false)
	},

	handleEml: filePath => {
		main.send({method: 'eml', value: filePath});
	}


}


// 入口
;(function(main) {

let htmlTpl, qvgaTpl, initConf, getFileConf, uploadConf, localConfig;



main.initTabs();
main.disableSubmit();
main.setConfig();		//页面加载时加载默认配置

localConfig = main.getCurrentConf();

//初始化拖拽方法
main.initDrag('body', false, e => true); 	//禁止拖拽到其他地方时跳转
main.initDrag('#dropHtml', true, (e) => {
	//有个小坑，必须直接读取到e.dataTransfer.files才能看到文件内容。直接打印e看不到
	let filePath = e.dataTransfer.files[0].path;

	if( filePath && (filePath.slice(-5).toLowerCase()) === '.html') {
		//把文件路径写到input里
		$("#uploadHtmlInput").value = filePath;
	}
	return false;
});
main.initDrag('#dropQvga', true, (e) => {
	let filePath = e.dataTransfer.files[0].path;

	if( filePath && (filePath.slice(-5).toLowerCase()) === '.qvga') {
		$("#uploadQvgaInput").value = filePath;
	}
	return false;
});
// main.initDrag('#dropMail', true, (e) => {
// 	let filePath = e.dataTransfer.files[0].path;

// 	if( filePath && (filePath.slice(-5).toLowerCase()) === '.html') {
// 		$("#mailHtmlInput").value = filePath;
// 	}
// 	return false;
// });
main.initDrag('#dropResource', true, (e) => {
	let filePath = e.dataTransfer.files[0].path;

	if( filePath && (filePath.slice(-15).toLowerCase()) === 'parseconfig.xml') {
		$("#uploadResourceInput").value = filePath;
	}
	return false;
});
main.initDrag('#dropEml', true, (e) => {
	let filePath = e.dataTransfer.files[0].path;

	if( filePath && (filePath.slice(-4).toLowerCase()) === '.eml') {
		main.handleEml(filePath);
	}
	return false;
});


// 挂载fileReader
// main.initReader( $("#uploadHtmlDrop") , main.handleReadHtml );
// main.initReader( $("#uploadQvgaDrop") , main.handleReadQvga );
// main.initReader( $("#testBtn"), function(e) {
// 	console.log(e)
// } )


//初始化 选择文件 按钮,注意是文件，不是文件夹
main.initFileSelector( '#uploadHtml', res => {
	$("#uploadHtmlInput").value = res;
})
main.initFileSelector( '#uploadQvga', res => {
	$("#uploadQvgaInput").value = res;
})
main.initFileSelector( '#uploadResource', res => {
	$("#uploadResourceInput").value = res;
})
// main.initFileSelector( '#mailHtml', res => {
// 	$("#mailHtmlInput").value = res;
// })

//页面加载时读取默认配置文件



//绑定一键生成初始文件按钮；
$("#init").onclick = function(e) {
	e.preventDefault();
	let conf = main.getConfig( '#initPage tbody input,#initPage tbody select' );

	main.send( {method: 'init', value: conf} );

}
//绑定生产线爬取按钮；
$("#getFile").onclick = function(e) {
	e.preventDefault();
	let conf = main.getConfig( '#getFilePage tbody input' );

	main.send( {method: 'getFile', value: conf} );

}
//绑定一键上传邮件模板按钮；
$("#upload").onclick = function(e) {
	e.preventDefault();
	let conf = main.getConfig( '#uploadFilePage tbody input' );

	main.send( {method: 'upload', value: conf} );

}
//绑定发送邮件按钮；
// $("#send").onclick = function(e) {
// 	e.preventDefault();
// 	let conf = main.getConfig( '#sendMailPage tbody input' );

// 	main.send( {method: 'sendMail', value: conf} );
// }

//事件捕获可以让父元素代理blur事件
//失焦的时候保存当前配置
$(".tab").addEventListener('blur', function(e) {
	let target = e.target,
		name = target.getAttribute('name'),
		value = target.value,
		temp = {},
		result = {};
		
	temp[name] = value;

	result = core.extend( main.getCurrentConf(), temp )

	main.setLocalConf(result)

}, true)

//接受的消息打印到消息盒子
ipcRenderer.on('log', (event, data) => {
	let inner = $("#msgBox").innerHTML;
	$("#msgBox").innerHTML = data.value + '<br>' + inner;
})



//////////////////////////////////////////
let vm = avalon.define({
	$id: 'more',
	input: '',
	sidebar: [],
	panel: '<h1>empty</h1>'
})


let allSiderbar = [];
//搜索功能，监听input
vm.$watch('input', function(newVal, oldVal) {
	let filted = allSiderbar.filter(function(value){
		return value[1].toLowerCase().indexOf(vm.input.toLowerCase()) != -1	
	})
	vm.sidebar = filted;
})


// 从markdown文章体提取标题和id的方法。不同的markdown解析方法不一样。
// 如果markdown文章（about.html）的html结构有变，则需要修改getHead方法。
function getHead(selector) {
	let head = $$(selector);
	let siderList = [];
	head.forEach(item => {
		siderList.push(['#'+item.id,item.innerText]);
	})
	return siderList;
}
///////////////////////////////////////////////////


//获取“更多说明”的html文件。
main.send({method: 'getMarkdown'});

//监听“更多说明”的html文件的返回
main.initListener('markdown', function(event, res) {
	// $("#article").innerHTML = res.value;
	vm.panel = res.value;
	//延迟执行，让视图先同步到dom上先。
	setTimeout(function() {
		//avalon写法，只要把getHead返回的数组填充到vm.sidebar和allSiderbar里即可生成侧边栏。
		//getHead返回的数组结构是['#(标题ID)','(标题正文)']
		vm.sidebar = allSiderbar = getHead("#more article h1,#more article h2,#more article h3");
	}, 20)
})

})(main);
