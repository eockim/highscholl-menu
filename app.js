var express = require('express'),
    http = require('http'),
    request = require('request');
//DOMParser = require('dom-parser');
//querySelectorAll = require('query-selector');
const jsdom = require('jsdom');
const {
    JSDOM
} = jsdom;
//jsdom = require('jsdom');
//https = require('https');

var app = express(),
    server = http.createServer(app);
var options = {};
let guroMenuIndex = 0;
//server = https.createServer(app);

app.use('/components', express.static(__dirname + '/bower_components'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/videos', express.static(__dirname + '/videos'));

var fs = require('fs');

app.get('/', function(req, res) {
    //	console.log(Today.fullStr());
		promiseArray = [];
    for (var i = 0; i < guroMenuIndex; i++) {
        // Post.post(i + 1);
        // Post.addIndex();
        // //console.log(Post.menuObject());
        // console.log('post for', Post.array());

				var promise = Post.post(i+1);
				promiseArray.push(promise);
    }

		// var endPromise = new Promise(function(resolve, reject){
		// 	resolve('end');
		// });
		// promiseArray.push(endPromise);

		//var result = [];
		Promise.all(promiseArray).then(function(value){
			//console.log('promise');
			//console.log('value', value);

			Post.addArray(value);
			Post.empty();
			Post.regExp(Post.array()[0][0]);

			res.send(Post.array()[0][0]);

			Post.initArray();

			res.end();

		}).catch(function(error){
			console.log('error : ', error);
		})

		//if(value === 'end'){

		//}


    //	PostCode();

});
//viewType=list&siteId=SEI_00000919&pageIndex=1&arrMlsvId=0&srhMlsvYear=2018&srhMlsvMonth=03

app.get('/image', function(req, res) {
    console.log('/image');
    console.log('/image');
});

server.listen(180, function() {
    console.log('ddok server start');
    console.log(__dirname);

    console.log(Today.yearStr());
    console.log(Today.monthStr());
    console.log(Today.dateStr());
    console.log(Today.fullStr());
    console.log('guroMenuIndex', guroMenuIndex);

    options = {
        url: 'http://www.guro.hs.kr/17572/subMenu.do?viewType=list&siteId=SEI_00000919&pageIndex=1&arrMlsvId=0&srhMlsvYear=' + Today.yearStr() + '&srhMlsvMonth=' + Today.monthStr(),
        method: 'POST',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
        }
    };



    request.post(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {

            const dom = new JSDOM(body);

            //getMenu(dom.window.document.querySelectorAll('.board_type01_tb_list tbody tr') );
            //querySelectorAll('.board_type01_pagenate a').length

            //var index =
            guroMenuIndex = dom.window.document.querySelectorAll('.board_type01_pagenate a').length;
            console.log('guroMenuIndex', guroMenuIndex);

        }

    });

});

var Today = (function() {

    var date = new Date();

    var getYearStr = function() {
        return date.getFullYear();
    }

    var getMonthStr = function() {
        return date.getMonth() + 1 < 10 ? '0' + (date.getMonth() * 1 + 1) : date.getMonth();
    }


    var getDateStr = function() {
        return date.getDate() + 1 < 10 ? '0' + (date.getDate() * 1) : date.getDate();
    }

    var getFullStr = function() {
        return getYearStr() + '.' + getMonthStr() + '.' + getDateStr();
    }

    return {
        yearStr: getYearStr,
        monthStr: getMonthStr,
        dateStr: getDateStr,
        fullStr: getFullStr
    };

})();

var HighObject = (function() {

    var isEmpty = function(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }



    return {
        isEmpty : isEmpty
    };

})();

var Post = (function() {

    var pageIndex = 0;
    var menuArray = [];

		Array.prototype.remove = function(from, to) {
  		var rest = this.slice((to || from) + 1 || this.length);
  		this.length = from < 0 ? this.length + from : from;
  		return this.push.apply(this, rest);
		};

    var addIndex = function() {
        //console.log('pageIndex', pageIndex);
        return pageIndex++;
    };

    var getIndex = function() {
        return pageIndex;
    }

		var initArray = function(){
			menuArray = [];
		}

    var addArray = function(object) {
        menuArray.push(object);
    }

    var getArray = function() {
        //console.log('getArray', menuArray);
        return menuArray;
    }

    var isEmpty = function(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }

		var empty = function(){
			//var object = menuArray]0];
			for(var i in menuArray[0]){
				if(JSON.stringify(menuArray[0][i]) === JSON.stringify({})){
					 menuArray[0].remove(i);
				}
			}
		}

		var regExp = function(obj){

			for(var key in obj){
				obj[key] = obj[key].replace(/\n|\t/g, '');
			//	console.log('obj key', obj[key]);
			}

		}

    var sendPost = function(index) {

			//console.log('index',index);
			options.url = 'http://www.guro.hs.kr/17572/subMenu.do?viewType=list&siteId=SEI_00000919&pageIndex=' + index + '&arrMlsvId=0&srhMlsvYear=' + Today.yearStr() + '&srhMlsvMonth=' + Today.monthStr();
			var promise = new Promise(function(resolve, reject) {

				request.post(options, function(error, response, body) {

					if (!error && response.statusCode == 200) {

						const dom = new JSDOM(body);

						var menu = new Menu(dom.window.document.querySelectorAll('.board_type01_tb_list tbody tr'));

					//console.log('menuobject', menu.menuObject());
					//addArray(menu.menuObject());
					//console.log('getArray', getArray());

					//console.log('pageIndex', pageIndex);
						resolve(menu.menuObject());
					}
				});
				// do a thing, possibly async, then…

			});

			return promise;
    }

    return {
        post: sendPost,
        index: getIndex,
        addIndex: addIndex,
        addArray: addArray,
        array: getArray,
				initArray : initArray,
				empty : empty,
				regExp : regExp
    };

})();

var Menu = function(object) {
    this.dom = object;
    this.menu = [];
}

Menu.prototype = function() {



    var getMenuList = function(object) {
        return this.dom;
        // console.log(this.dom.length);
        // console.log(this.dom[0].textContent);
    };

    var getMenuObject = function() {

        var object = {};
        //console.log(this.dom[0].innerHTML);
        //console.log(this.dom[0].querySelctorAll('td'));
        for (var i = 0; i < this.dom.length; i++) {

            //console.log(this.dom[i].innerHTML);
            //trDom = new JSDOM(this.dom[i].innerHTML);
            const trDom = new JSDOM('<table>' + this.dom[i].innerHTML + '</table>');
            td = trDom.window.document.querySelectorAll('td');

            //console.log(trDom.window.document.querySelectorAll('td').length);
            //console.log(trDom.window.document.querySelectorAll('td')[0].innerHTML);
            //console.log(td);
            //console.log(trDom.window.document.querySelectorAll('td')[0].textContent );
            //console.log('textcontent',td[0].textContent);
            if (td[0].textContent.trim() === Today.fullStr()) {
                object.date = td[0].textContent;
                object.type = td[1].textContent;
                object.menu = td[3].textContent;
                object.kal = td[4].textContent;

                //this.menu.push(object);
            }

        }
        return object;
        //console.log('object', object);

        //console.log('this.menu',this.menu);

    }

    var getMenuArray = function() {
        return this.menu;
    }

    return {
        menuList: getMenuList,
        menuObject: getMenuObject,
        menuArray: getMenuArray
    }

}();
