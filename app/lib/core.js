/**
 * description：我的核心函数库
 * author：weijianghong
 * date：2016-11-17
 * list：getClass;hasClass;addClass;removeClass;extend;queue;throttle;debounc;ajax;isArray;isFunction;isObject;isElement;
 */

"use strct"

module.exports = {
    $: function ( selector ) {
        return document.querySelector( selector );
    },

    $$: function ( selector ) {
        return document.querySelectorAll( selector );
    },
    /**
     * [getClass 获取节点class]
     * @param  {[type]} elem [dom节点]
     * @return {[type]}      [class字符串]
     */
    getClass: function( elem ) {
        //trim方法不兼容低版本浏览器。故getCLass系列都不支持
        return elem.className.trim();
    },
    /**
     * [hasClass 是否存在class]
     * @param  {[type]}  elem  [dom节点]
     * @param  {[type]}  value [要查询的class值]
     * @return {Boolean}       [bool结果]
     */
    hasClass: function( elem, value ) {
        if( !this.isElement( elem ) ) return false;
        
        var className = this.getClass( elem );

        //首尾加上空格，就能直接用indexOf找到
        className = ' ' + className + ' ';
        value = ' ' + value + ' ';

        if(className.indexOf(value) !== -1) {
            return true;
        }

        return false;
    },

    /**
     * [addClass 添加class]
     * @param {[type]} elem  [dom节点]
     * @param {[type]} value [要添加的class值]
     */
    addClass: function( elem, value ) {
        if( this.hasClass( elem, value ) ) return true;

        var className;

        className = this.getClass( elem );

        className += ' ' + value;

        elem.className = className;

        return elem;
    },

    /**
     * [removeClass 删除dom节点的class]
     * @param  {[type]} elem  [dom节点]
     * @param  {[type]} value [要删除的class]
     * @return {[type]}       [dom节点]
     */
    removeClass: function( elem, value ) {
        if( !this.hasClass ( elem, value ) ) return false;

        var className;

        className = this.getClass( elem );

        //首尾加上空格就能直接用下标找到
        className = ' ' + className + ' ';
        value = ' ' + value + ' ';

        className = className.replace(value, ' ');

        elem.className = className;

        return elem;
    },

    /**
     * [extend 合并对象]
     * @param  {[type]} target  [对象1，相同属性会被覆盖]
     * @param  {[type]} options [对象2]
     * @return {[type]}         [合并后的对象]
     */
    extend: function( target, options ) {
        var result = new Object();  //return一个新对象，隔断引用

        for( var property in target ) {

            if( this.isObject( target[ property ] || this.isArray( target[ property ] ) ) ) {
                //如果属性是对象和对象则递归调用，防止直接赋值引用。
                result[ property ] = this.extend( {}, target[ property ] );  
            } else {
                result[ property ] = target[ property ];
            }
            
        }

        for( var property in options ) {

            if( this.isObject( options[ property ] || this.isArray( target[ property ] ) ) ) {
                //如果属性是对象和对象则递归调用，防止直接赋值引用。
                result[ property ] = this.extend( {}, options[ property ] );
            } else {
                result[ property ] = options[ property ];
            }
            
        }

        return result;
    },

    /**
     * [css 获取dom节点的指定样式值或者给dom节点添加样式]
     * @param  {[type]} elem  [dom节点]
     * @param  {[type]} style [样式名称]
     * @param  {[type]} value [样式值，如果为空，则是读取样式]
     * @return {[type]}       [dom节点]
     */
    css: function( elem, style, value ) {
        if( !isElement( elem ) ) return false;

        if( !value ) {
            //两个参数读取参数
            return window.getComputedStyle( elem )[style];
        } else {
            //三个参数写参数
            elem.style[style] = value;
        }

        return elem;
    },

    /**
     * [queue 排队函数，用于把参数函数放到任务队列的最后。]
     * @param  {[type]} func [要延迟执行的函数]
     * @return {[type]}      [是否成功]
     */
    queue: function( func ) {
        if( !isFunction( func ) ) return false;

        setTimeout( function() {
            try{
                func();
            } catch ( e ) {
                throw new Error( 'Custom Error: queue error; ' + e );
            }
        }, 10 );

        return true;
    },

    /**
     * [throttle 函数节流，使用方法：throttle( function(){}, 50); ]
     * @param  {[type]} func  [要节流执行的函数]
     * @param  {[type]} delay [间隔时间]
     * @return {[type]}       [undefined]
     */
    throttle: (function() {
        var wating = false;     //是否在等待执行中
        var timer;              //
        var hasTimer = false;   //有没有设置定时器

        return function( func, delay ) {

            if( !isFunction( func ) ) return false;

            var delay = delay || 200;

            if( wating ) { 

               if(!hasTimer) {
                    timer = setTimeout( function() { wating = false; hasTimer = false }, delay );
                    hasTimer = true;
               }
               //正在等待且已经设置过定时器则直接返回。
               return;

            } else {  

                func();
                clearTimeout( timer );
                wating = true;

            }
        }
    })(),

    /**
     * [debounc 函数防抖，在频繁调时不会执行，只有停止调用后再执行。使用方法：debounc( function(){}, 50); ]
     * @param {[type]} func [description]
     */
    debounc: ( function () {
        var timer = null;
        //这种方法虽然频繁设置和删除定时器，但是通过Profiles性能观测，性能没有太大影响。
        return function ( func, delay ) {
            if( !isFunction( func ) ) return false;

            var delay = delay || 200;

            clearTimeout( timer );
            timer = setTimeout(function() {
                func();
            }, delay );
        }
    })(),



    isArray: function( obj ) {
        return Object.prototype.toString.call( obj ) === '[object Array]'
    },

    isFunction: function( obj ) {
        return Object.prototype.toString.call( obj ) === '[object Function]';
    },

    isObject: function( obj ) {
        return Object.prototype.toString.call( obj ) === '[object Object]';
    },

    //是否是html对象
    isElement: function( obj ) {
        return Object.prototype.toString.call(obj).indexOf('HTML') !== -1;
    },

    /**
     * [ajax 网上抄的，]
     * @param  {[type]} type    [get/post]
     * @param  {[type]} url     [url]
     * @param  {[type]} data    [参数对象]
     * @param  {[type]} success [成功回调函数，返回200和304时执行]
     * @param  {[type]} failed  [失败回调函数]
     * @return {[type]}         [description]
     */
    ajax: function(type, url, data, success, failed){
        // 创建ajax对象
        var xhr = null;
        if(window.XMLHttpRequest){
            xhr = new XMLHttpRequest();
        } else {
            xhr = new ActiveXObject('Microsoft.XMLHTTP')
        }
     
        var type = type.toUpperCase();
        // 用于清除缓存
        var random = Math.random();
     
        if(typeof data == 'object'){
            var str = '';
            for(var key in data){
                str += key+'='+data[key]+'&';
            }
            data = str.replace(/&$/, '');
        }
     
        if(type == 'GET'){
            if(data){
                xhr.open('GET', url + '?' + data, true);
            } else {
                xhr.open('GET', url + '?t=' + random, true);
            }
            xhr.send();
     
        } else if(type == 'POST'){
            xhr.open('POST', url, true);
            // 如果需要像 html 表单那样 POST 数据，请使用 setRequestHeader() 来添加 http 头。
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(data);
        }
     
        // 处理返回数据
        xhr.onreadystatechange = function(){
            if(xhr.readyState == 4){
                if(xhr.status == 200 || xhr.status == 304){
                    success(xhr.responseText);
                } else {
                    if(failed){
                        failed(xhr.status);
                    }
                }
            }
        }
    }
}


