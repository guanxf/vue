
// 定义工具
var Util = {
	// 获取模板工具
	tpl : function(id){
		return document.getElementById(id).innerHTML;
	},
	// 获取数据工具
	ajax : function(url,fn){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if (xhr.readyState === 4) {
				if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
					var data = JSON.parse(xhr.responseText);
					fn && fn(data);
				};
			};
		}
		xhr.open('get',url,true);
		xhr.send(null);
	}
}
// 定义过滤器
Vue.filter('price',function(str){
	return str + '元'
})
Vue.filter('orignPrice',function(str){
	return '门市价: ' + str + '元'
})
Vue.filter('sales',function(str){
	return '已售' + str
})

// 创建路由
// ‘’ 或者 #/home  	进入home组件
//  #list/type/1    	进入list组件
//  #/product/2  	进入product组件
function router(){
	var str = location.hash;
	str = str.slice(1).replace(/^\//,'');
	str = str.split('/');
	// 在vue中保留query
	app.query = str.slice(1);
	var map = {
		home : true,
		list : true,
		product : true
	};
	if (map[str[0]]) {
		app.view = str[0];
	} else {
		app.view = 'home';
	};
}

// 创建home页面组件
var HomeComponent = Vue.extend({
	template : Util.tpl('tpl_home'),
	// 静态页面的数据直接渲染,不用读取,但是组件内必须是作为函数的返回值
	data : function(){
		return  {
			types: [
				{id: 1, title: '美食', url: '01.png'},
				{id: 2, title: '电影', url: '02.png'},
				{id: 3, title: '酒店', url: '03.png'},
				{id: 4, title: '休闲娱乐', url: '04.png'},
				{id: 5, title: '外卖', url: '05.png'},
				{id: 6, title: 'KTV', url: '06.png'},
				{id: 7, title: '周边游', url: '07.png'},
				{id: 8, title: '丽人', url: '08.png'},
				{id: 9, title: '小吃快餐', url: '09.png'},
				{id: 10, title: '火车票', url: '10.png'}
			],
			ad: [],
			list: []
		}
	},
	// 组件渲染完毕的回调函数
	created : function(){
		// 隐藏搜索框
		this.$dispatch('show-search', true);
		// this指的是组件实例化对象
		var self = this;
		Util.ajax('data/home.json',function(res){
			if (res && res.errno === 0) {
				// 添加到实例化对象的数据中
				// 方法1
				// self.ad = res.data.ad;
				// self.list = res.data.list;
				// 方法二
				self.$set('ad',res.data.ad);
				self.$set('list',res.data.list);
			};
		})
	}
})
// 创建list页面组件
var ListComponent = Vue.extend({
	template : Util.tpl('tpl_list'),
	// 引入父容器的input的value值
	props : ['csearch'],
	data : function(){
		return  {
			types: [
				{value: '价格排序', key: 'price'},
				{value: '销量排序', key: 'sales'},
				{value: '好评排序', key: 'evaluate'},
				{value: '优惠排序', key: 'discount'}
			],
			// 默认保留前三个
			list: [],
			// 保留剩下的
			other: []
		}
	},
	created : function(){
		// 隐藏搜索框
		this.$dispatch('show-search', true);
		// this指的是组件实例化对象
		var self = this;
		// 得到父组件的query
		var query = self.$parent.query;
		// console.log(query)
		// str 保留query字段 ?type=1
		// 设置这个是根据不同的选项获取不同的json数据
		var str = '?' + query[0] + '=' + query[1] ;
		// console.log(str)
		Util.ajax('data/list.json' + str,function(res){
			if (res && res.errno === 0) {
				// 添加到实例化对象的数据中
				self.$set('list',res.data.slice(0,3));
				self.$set('other',res.data.slice(3));
				// console.log(self)
			};
		})
	},
	methods : {
		// 加载更多的事件
		loadmore :function(){
			this.list = this.list.concat(this.other);
			this.other = [];

		},
		sortBy : function(type){
			if (type === "discount") {
				this.list.sort(function(a,b){
					// 优惠排序，市场价 - 现价
					var ap = a.orignPrice - a.price;
					var bp = b.orignPrice - b.price;
					return bp - ap
				})
			} else{
				this.list.sort(function(a,b){
					// 正序
					// return a[type] - b[type];
					// 倒序
					return b[type] - a[type]
				})
				
			};
		}
	}
})
// 创建product页面组件
var ProductComponent = Vue.extend({
	template : Util.tpl('tpl_product'),
	data : function(){
		return {
			data :{
				src : '01.jpg'
			}
		}
	},
	created : function(){
		// 隐藏搜索框
		this.$dispatch('show-search', false);
		var self = this;
		Util.ajax("data/product.json",function(res){
			if (res && res.errno === 0) {
				self.data = res.data;
				// console.log(self.data)
			};
		})
	}
})

// 注册页面模板
Vue.component('home',HomeComponent);
Vue.component('list',ListComponent);
Vue.component('product',ProductComponent);

// 实例化Vue
var app = new Vue({
	el : '#app',
	data : {
		view : '',
		search : '',
		dealSearch : '',
		showSearch : true
	},
	methods : {
		goSearch : function(){
			this.dealSearch = this.search;
		},
		goBack : function(){
			history.go(-1);
		}
	},
	events : {
		'show-search' : function(val){
			this.showSearch = val;
		}
	}
})
// 页面进入的时候，会触发load事件，我们要根据hash来决定进入那个页面
window.addEventListener('load', router);
// hash改变时候的事件交hashChange事件
window.addEventListener('hashchange', router);