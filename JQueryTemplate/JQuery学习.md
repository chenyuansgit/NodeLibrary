#JQuery学习笔记 http://book.learningjquery.com
***
1. 准备工作

	[jQuery官网地址](http://jquery.com)
	
	[jQuery API文档](http://api.jquery.com)
	
	
	从官网下载jQuery文件到本地js/jquery.js
	
		index.js:
		    <!DOCTYPE html>
			<html>
   				<head>
        			<meta charset="utf-8">
       				<link rel="stylesheet" type="text/css" href="01.css">

        			<script type="text/javascript" src="../js/jquery-2.2.3.min.js"></script>
        			<script type="text/javascript" src="../js/01.js"></script>
    			</head>
   			 <body>
       			 <p>Hello, JQuery!</p>
    		</body>
		</html>
		    
		    		    
		
	>引用jQuery库文件的`<script>`标签,必须放在引用自定义脚本文件的`<script>`标签之前。否则,在我们编 写的代码中将引用不到jQuery框架。
	
		01.js:
	    $(document).ready(function(){
    		$('p').addClass('highlight');
		});
	    
	
	    01.css:
	    .highlight {
    		background-color: #ccc;
    		border: 1px solid #888;
    		font-style: italic;
		}
	***
2. 特性
	1.	选择元素：
	
		基本选择符：标签名，id，类
		
		子元素选择符：>
		
		否定式伪类选择符： :not(.className)
		
		属性选择符：a[href^="前缀:"][href$=".后缀"][href*="包含字符"]
		
		自定义选择符：http://api.jquery.com/category/selectors/
		
			:eq(1) 元素位置，js数组从0开始计数
			:nth-child(1) 子元素序号，css从1开始计数
			:odd  偶数
			:even 奇数
			
			:contains(字符) 包含字符串
			:has(td) 包含标签
			:not(bool)  取反: 参数可以是一个函数
			
			:visible 可见元素
			:hidden  隐藏元素，包括display的值为none以及width和height属性被设置为0
		
		
		表单选择符：
			
			:input   输入字段／文本区／选择列表／按钮元素
			:button  按钮元素／type属性为button的输入元素
			:enabled  启用的表单元素
			:disabled 禁用的表单元素
			:checked  勾选的单选按钮或复选框
			:selected 选择的选项元素
			
			
		遍历方法：http://api.jquery.com/ category/traversing
			
			.filter() 过滤函数
			.first() 第一个元素
			.next() 下一个最接近的同辈元素
			.nextAll() 接下来所有的同辈元素
			.prev()
			.prevAll()
			.addBack() 包含原来的元素
			.parent() 父元素
			.children() 子元素			
			.siblings() 相邻节点
			
			.end() 结束当前链条中的最近的筛选操作，并将匹配元素集还原为之前的状态。
			.addBack() 将前一组遍历堆栈中的DOM元素被添加到当前组
			.closest('li') 获得匹配选择器的第一个祖先元素，从当前元素开始沿 DOM 树向上。
			 
			
		> 所有选择符表达式和多数jquery方法都返回一个jquery对象
		
		> $(selector1, selector2)
		
		通过jquery对象获取DOM元素：
			
			$('xxx').get(0)
			$('xxx')[0]
		
		jQuery对象属性：
			
			.context :搜索的开始dom节点，通常是document
			.selector :选择符表达式
			.prevObject :调用遍历方法的jQuery对象
	
	2.	事件
	
			事件绑定：
			$('xxx').on('事件名','事件委托选择符',function(){
				// this: dom元素
				// $(this): jquery对象
				$(this).addClass('xxx');
			});
			
			// 简写事件方法
			$('xxx').click(function(){
				// this: dom元素
				// $(this): jquery对象
				$(this).toggleClass('xxx');
			});
			
			解除事件绑定：
			$('xxx').off('click.命名空间');
			

			事件捕获
			事件冒泡：
			if(event.target == this){}
			if($(event.target).is('button')){}
			event.stopPropagation();// 阻止事件冒泡
			event.preventDefault();//终止默认操作
			模拟事件：
				$('xxx').trigger('click')
				$('xxx').click();//不带参数为触发事件
			
			
			
		页面准备就绪事件：$(document).ready(function(){});
		
		鼠标事件:
		
			click：鼠标点击
			dblclick: 鼠标双击
			hover：鼠标悬停
			mouseenter
			mouseleave
			mousemove
			
			$(window).scroll: 滚动事件
			resize: 改变页面大小
			
			
		键盘事件:
		
			keyup
			keydown
			keypress:event.which/event.keyCode
		
		自定义事件：
		
			// 定义事件
			$(document).on('newEventName',function(){
				...
			});
			// 触发事件
			$('xxx').trigger('newEventName');
			
		扩展特殊事件：
		
			$.event.special.事件名 = {
				setup: function(){},
				teardown: function(){},
				add: function(){},
				remove: function(){},
				_default: function(){}
			};
			// 触发
			$(window).on('事件名', function(){}).trigger('事件名');
	
	3.	操作DOM元素
		
		创建元素
			
			创建：$('<a>back to top</a>')
			添加：
				 新元素.insertAfter(指定元素)/.insertBefore() 在指定元素外插入新元素
				 新元素.appendTo(指定元素)/.prependTo() 在指定元素内部插入新元素
			
			添加的反向方法：
				指定元素.append(新元素)
				指定元素.before(新元素)
				 
		移动元素
				
				$('要移动的元素').insertBefore('p') 从DOM组从上到下依次插入
				显示为单独一行｛display:block｝
        		.each(function(index){})
        包装元素
				要包装的元素组.wrapAll(最外层元素) 包装元素组
				.wrap()    包装单个元素
				
				$('span.footnote')        		.insertBefore('#footer')        		.wrapAll('<ol id="notes"></ol>') //将复制的元素合并到一个ol        		.wrap('<li></li>'); //对单个元素分别包装到li        
        复制元素
        		.clone(true)   //复制:bool参数代表是否复制元素或后代绑定的事件
				.insertBefore() // 粘贴	
				
		寻找元素
				
				.find()	// 查找元素集合
					.html(文本) // 替换文本内容	
				.end() //返回元素集合
				
		替换元素
				
				替换文本：
				.html()
				.text()
				
				替换元素：
				.replaceAll()
				.replaceWith()
				
				.html()和.text()的区别是：.text()取得的内容是纯文本，html标签被忽略
		删除元素
		
				删除指定元素中的元素：
				.empty() 
				
				移除元素及其后代：(实际并不删除)
				.remove()
				.detach()
				
		操作元素属性：
		
			类属性：addClass()/removeClass()/toggleClass()
			css属性：.css(key[,value])
			修改链接属性(id,rel,title)：.attr()/removeAttr()支持回调
			DOM属性：.prop(key[,value])支持回调id:function(index,oldVlue){return newId;}
			表单的值：.val([value])
		其他：
			.text() 取得元素文档内容
			.show() 显示元素
			.hide() 隐藏元素
			
	
	4.	动画效果
		
		动态修改元素样式：
				
				获取元素样式：
				 .css('property')
				 .css(['property1','property2'])
				设置元素样式：
				 .css('key':'value')
				 .css({
				 	key1:value1,
				 	key2:value2
				 })
				 
		隐藏和显示元素
				
				.show(param):参数可以是‘fast’,'slow',850
				.hide()
				.toggle()
		淡入淡出：
				
				.fadeIn()
				.fadeOut()
		滑上滑下：
				
				.slideUp()
				.slideDown()
				.slideToggle()
				
		自定义元素动画
				
				.animate(样式对象，时长，缓动，回调函数)
				.animate({      				property1: 'value1',      				property2: 'value2'	    			}, {     				duration: 'value',      				easing: 'value',      				specialEasing: {        				property1: 'easing1',        				property2: 'easing2'      				},      				complete: function() {        				alert('The animation is finished.');      				},      				queue: true,//设置为false可让当前动画与之前动画同时开始      				step: callback				});
			
			
		效果排队
				
				同组元素：
				.animate(...).fadeTo(...).queue(function(next){})
				多组元素：默认为同时发生
				.fadeTo(..., function(){
					// 其他元素的动画
				})
		
	5.	Ajax
	
		从服务器获取静态文件
			
			$('xxx').load('xxx.html .class') // 请求html文档,可部分请求
			$.getJSON(‘xxx.json’,function(data){ // 请求json文件 
				$.each(data, function(index, itemData){
					...
				});
			}) 
			$.getScript('xxx.js') // 加载执行js文件
			$.get('xxx.xml', callback) // 请求xml文件
			
			
					
		执行GET请求
		        	$.get('xxx.php', {param: value}, function(data) {	
			});
		
		执行POST请求
		
			$.post('xxx.php', {param: value}, function(data) {	
			});		
			或者
			$('xxx').load('xxx.php', {param: value});// 默认使用post请求
			
		处理表单请求：默认的表单提交会刷新整个页面
			
			 $('form').submit(function(event){
			 	event.preventDefault();
			 	var formValues = $(this).serialize();//将请求元素转换格式
			 	$.get('xxx.php',formValues， functon(data){
			 		...
			 	});
			 });
			
		服务器判断是否是ajax请求：
		
			$bAjax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) &&    		$_SERVER['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest';
    		
		ajax事件：
		
			$(document).ajaxStart(function(){});
			$(document).ajaxStop(function(){});
			$(document).ajaxError(function(jqXHR){})    		
			例子：ajax通信的反馈信息    		$(document).ready(function() {    		    // 创建节点      			var $loading = $('<div id="loading">Loading...</div>')        		.insertBefore('#dictionary');        		      			$(document).ajaxStart(function() {        			$loading.show();				}).ajaxStop(function() {    				$loading.hide();				}); 			});
					其他函数：http://api.jquery.com/jQuery.Ajax/
			
			$.ajax(paramObject);//避免缓存，抑制触发ajaxStart等全局事件			$.ajaxSetup(paramObject); // 修改ajax方法的默认值	
		
	
		ajax错误处理：
		
			$.get(...)
			.fail(function(jqXHR){...}) //发生错误：jqXHR.responseText
			.status() // 返回的状态码
			.done()
			.always()
			
		为ajax生成的页面绑定事件：
		
			事件委托：把事件处理程序绑定到祖先元素
			$('body').on('click', 'h3.term', function() {        		$(this).siblings('.definition').slideToggle();      		});
			
		
	6.	jQuery插件：http://plugins.jquery.com/
		
		下载插件:http://plugins.jquery.com/
		安装插件
		
			<script src="jquery.js"></script>      		<script src="jquery.cycle.all.js"></script>      		<script src="07.js"></script>
		
		插件：cycle, Cookie...
		
		jQuery UI:  http://jqueryui.com/
		
			安装：
				下载ui文件夹
				导入js文件
				<script type="text/javascript" src="../js/jquery.js"></script>
        		<script type="text/javascript" src="../jquery-ui/jquery-ui.js"></script>
        		<script type="text/javascript" src="../js/04.js"></script>
		
			效果：
				.animate增加了样式属性：borderTopColor,backgroundColor,color
				addClass()等类操作函数：添加第二个可选属性控制动画时长‘slow’
				slideUp()等操作函数：添加一个个可选参数控制加速减速‘easeInExpo’
				其他效果：.effect()	
			
			交互组件：		
				Resizable： .resizable({handles: 's'}) // 添加拖动手柄(s:底部)
				Draggable 
				Droppable 
				Sortable
				
			部件：
				button
				slider
				...
				
			主题卷轴：http://jqueryui.com/themeroller/
				
		
		jQuery Mobile： http://jquerymobile.com
	
	
	7.  开发插件
	
			导入ui插件库
				导入js文件
				<script type="text/javascript" src="../js/jquery.js"></script>
        		<script type="text/javascript" src="../jquery-ui/jquery-ui.js"></script>
        		<script type="text/javascript" src="../js/ljq.自定义插件.js"></script>
        		<script type="text/javascript" src="../js/04.js"></script>
        		
			添加全局函数:
			a.将新函数指定为jQuery对象的一个属性
				(function($){
					$.newFunction = function(){
				 	...
					};
				})(jQuery);
			b.使用$.extend()函数：会替换同名函数
				(function($){
					$.extend({
						newFunction : function(){
				 		...
						};
					});
				})(jQuery);
			c.使用命名空间
				(function($){
					$.命名空间({
						newFunction : function(){
				 		...
						};
					});
				})(jQuery);
			调用：$.命名空间.newFunction();
			
			
			添加jquery对象的方法：
				(function($){
					$.fn.newFunction = function(){
					...
					return jQuery object to support 连缀
					};
				})(jQuery);
			
			创建插件
				(function($){
					$.widget('命名空间.部件名', {
						_create: function(){
							var param = this.options.key;
							// 事件
							this._trigger('close');
						}
					});
				})(jQuery);
				
				调用公有子方法：.部件名('子方法名')
				传递参数：.部件名({key:value})
			
			发布插件:  http://plugins.jquery.com/docs/publish/
	
	8.	开发选择符插件
			
			// 为table每隔n行变色
			(function($){
    			$.extend($.expr[':'],{
        		group: function(element, index, matches, set){
            		var num = parseInt(matches[3], 10);
            		if(isNaN(num)) {
                		return false;
            		}
            		return index % (num*2) <num;
        		}
    			});
			})(jQuery);
			使用：$('#news tr:group(2)')
			
		> index总是为0，和jQuery版本有关，只在 1.8.0 之前有效
	
	9.	开发插件
	
	***
	
3. 高级特性
