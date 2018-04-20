'use strict';
var exports = module.exports = {};
var request = require('request');
const jsdom = require('jsdom');
const TodayUtil = require('../util/TodayUtil');
const {
    JSDOM
} = jsdom;
//const redis = require('../redis-client.js').client;
const redis = require("redis").createClient(6379,'redis1');
var options = {};

var promiseArray = [];

var response = {
     //key: params.key,
     errorcode: 0,
     errormessage: "success",
     data : {
       menu : []
     }
 };


var menu = function(guroMenuIndex, params, callBack){

  for (var i = 0; i < guroMenuIndex; i++) {
    console.log('promise for');
    var promise = Post.sendPost(i + 1);
    promiseArray.push(promise);
  }

  Promise.all(promiseArray).then(function(value) {

    //console.log('promiseArray', promiseArray);

    Post.addArray(value);
    Post.empty();
    //Post.regExp(Post.array()[0][0]);
    response.key = params.key;

    response.data.menu = [];

    let redisArray = [];
    for(var i = 0; i < Post.array()[0].length; i++){

      console.log('post array', Post.array()[0][i]);
      if(Post.array()[0][i].length != 0 ){
        for(var key in Post.array()[0][i]){
          let obj = {};
          obj.menu = Post.array()[0][i][key].menu;
          obj.type = Post.array()[0][i][key].type;
          redisArray.push(obj);
          response.data.menu.push(obj);
        }

      }
    }

    //can not get menu
    if(redisArray.length === 0){

      console.log('menu null');
      let obj = {};
      obj.type = -1;
      obj.menu = '식단 정보가 없습니다.';
      redisArray.push(obj);
      response.data.menu.push(obj);

    }

    let expireTime = TodayUtil.getRemainSeconds();
    for(var i = 0 ;i < redisArray.length; i++ ){

      redis.hset("today", redisArray[i].type, redisArray[i].menu, redis.print);

      if(redisArray[i].type === -1){
        expireTime = 2 * 60 * 60;
      }
    }
    redis.expire("today", expireTime);

    //redis.quit();

    callBack(response);

    Post.initArray();
    //redis.quit();

  }).catch(function(error) {
    console.log('error : ', error);
  });
}

exports.requestMenu = function(params, callBack){

  redis.hgetall('today', (err,replies) =>{

    console.log('err', err);
    if(replies === null){
      Post.initPost(params, callBack);
    }else if(!err && replies){

      response.key = params.key;
      response.data = {};
      response.data.menu = [];
      for (var key in replies) {

        var obj = {};
        obj.type = key;
        obj.menu = replies[key];
        response.data.menu.push(obj)
      }
      //redis.quit();
      return process.nextTick(callBack, response);
    }

  });

}

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

    var initArray = function() {
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

    var empty = function() {
        //var object = menuArray]0];
        for (var i in menuArray[0]) {
            //if (JSON.stringify(menuArray[0][i]) === JSON.stringify({})) {
            if (menuArray[0][i].length == 0) {
                menuArray[0].remove(i);
            }
        }
    }

    var regExp = function(obj) {

        for (var key in obj) {
            obj[key] = obj[key].replace(/\n|\t/g, '');
            //	console.log('obj key', obj[key]);
        }

    }

    var sendPost = function(index) {

        options.url = 'http://www.guro.hs.kr/17572/subMenu.do?viewType=list&siteId=SEI_00000919&pageIndex=' + index + '&arrMlsvId=0&srhMlsvYear=' + TodayUtil.getYearStr() + '&srhMlsvMonth=' + TodayUtil.getMonthStr();
        // options.url = 'http://www.guro.hs.kr/17572/subMenu.do?viewType=list&siteId=SEI_00000919&pageIndex=' + index + '&arrMlsvId=0&srhMlsvYear=2018&srhMlsvMonth=03';
        var promise = new Promise(function(resolve, reject) {

            request.post(options, function(error, response, body) {

                if (!error && response.statusCode == 200) {

                    const dom = new JSDOM(body);

                    var menu = new Menu(dom.window.document.querySelectorAll('.board_type01_tb_list tbody tr'));

                    //addArray(menu.menuObject());
                    //console.log('getArray', getArray());

                    //console.log('pageIndex', pageIndex);
                    resolve(menu.getMenuObject());
                }
            });
            // do a thing, possibly async, then…

        });

        return promise;
    }

    var initPost = function(params, callBack){

      options = {
          url: 'http://www.guro.hs.kr/17572/subMenu.do?viewType=list&siteId=SEI_00000919&pageIndex=1&arrMlsvId=0&srhMlsvYear=' + TodayUtil.getYearStr() + '&srhMlsvMonth=' + TodayUtil.getMonthStr(),
        // url : 'http://www.guro.hs.kr/17572/subMenu.do?viewType=list&siteId=SEI_00000919&pageIndex=1&arrMlsvId=0&srhMlsvYear=2018&srhMlsvMonth=03',
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
          console.log('request');
          let guroMenuIndex = 0;
          guroMenuIndex = dom.window.document.querySelectorAll('.board_type01_pagenate a').length;

          menu(guroMenuIndex, params, (s) => process.nextTick(callBack, s) );
        }

      });

    }

    return {
        sendPost: sendPost,
        index: getIndex,
        addIndex: addIndex,
        addArray: addArray,
        array: getArray,
        initArray: initArray,
        empty: empty,
        regExp: regExp,
        initPost : initPost
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

        var result ={};
        //console.log(this.dom[0].innerHTML);
        //console.log(this.dom[0].querySelctorAll('td'));
        let index = 0;
        for (let i = 0; i < this.dom.length; i++) {

            //console.log(this.dom[i].innerHTML);
            //trDom = new JSDOM(this.dom[i].innerHTML);
            const trDom = new JSDOM('<table>' + this.dom[i].innerHTML + '</table>');
            var td = trDom.window.document.querySelectorAll('td');

            //console.log(trDom.window.document.querySelectorAll('td').length);
            //console.log(trDom.window.document.querySelectorAll('td')[0].innerHTML);
            //console.log(td);
            //console.log(trDom.window.document.querySelectorAll('td')[0].textContent );
            //console.log('textcontent',td[0].textContent);
            var object = {};
            if (td[0].textContent.trim() === /**Today.fullStr()*/ '2018.03.05') {
                object.date = td[0].textContent;
                object.type = (td[1].textContent.trim() === "중식"? "1" : td[1].textContent.trim() === "석식" ? "2" : "0");
                object.menu = td[3].textContent;
                object.kal = td[4].textContent;

                Post.regExp(object);
                //result.push(object);
                result[index] = object;
            }

            if(i == this.dom.length -1 &&  result.length == 0){
              //result.push(object);
              result[index] = object
            }

        }

        return result;
        //console.log('object', object);

        //console.log('this.menu',this.menu);

    }

    return {
        menuList: getMenuList,
        getMenuObject: getMenuObject
    }

}();
