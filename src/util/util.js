import axios from 'axios'
const debug = 1
const urlOrigin = debug ? 'https://snaptest.j.cn' : 'https://snap.j.cn'
let apis = {
  worksShareDetail: urlOrigin + '/api/worksShareDetail',
  replyList: urlOrigin + '/api/replyList',
  sendReply: urlOrigin + '/api/sendReply',
  personalNewsList: urlOrigin + '/api/personalNewsList',
  getNewestUserId: urlOrigin + '/api/getNewestUserId',
  attentionOn: urlOrigin + '/api/attentionOn',
  fetchWechatUserInfo: urlOrigin + '/api/fetchWechatUserInfo',
  fetchQQUserInfo: urlOrigin + '/api/fetchQQUserInfo',
}
class Tools {

  constructor(apis) {
    this.apis = apis
    this.channel = 'balalatest'
  }

  /**
   * 获取连接参数
   * @return {[type]} [description]
   */
  _GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
  }

  /*获取数据*/
  _ajaxGetData(config) {
    return axios(config)
  }

  /**
   * 1x1统计
   * @param  {[type]}   name     [description]
   * @param  {[type]}   val      [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  _send1_1(val, name, callback) {
    var that = this;
    name = that.channel || name
    //获取本地uuid
    var get_uuid = localStorage.getItem('uuid') || that._getCookie('uuid');
    var set_uuid = that._uuid();

    function getUuid() {
      if (get_uuid == null) {
        if (window.localStorage) {
          //写入localStorage
          localStorage.setItem('uuid', set_uuid);
        } else {
          //写入cookie
          that._setCookie('uuid', set_uuid);
        }
        return set_uuid
      } else {
        return get_uuid
      }
    }
    //设置统计参数
    var jcnappid = that._GetQueryString('jcnappid') == null ? getUuid() : that._GetQueryString('jcnappid'),
      jcnuserid = that._GetQueryString('jcnuserid') == null ? getUuid() : that._GetQueryString('jcnuserid');

    var img1x1 = new Image();
    img1x1.onload = function() {
      if (callback) {
        callback();
      }
    };
    if (val && typeof val == "string") {
      console.log(name, val)
      img1x1.src = location.protocol + "//share.j.cn/js/1x1.gif?ucs=UTF-8&un=statistic_channel." + name + "_logname." + val + "_login.0&timestamp=" + (new Date() - 0) + "&jcnappid=" + jcnappid + "&jcnuserid=" + jcnuserid;
    }
  }

  /**
   * 生成用户uuid
   * @return {[type]} [description]
   */
  _uuid() {
    // Private array of chars to use
    var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

    Math.uuid = function(len, radix) {
      var chars = CHARS,
        uuid = [],
        i;
      radix = radix || chars.length;

      if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
      } else {
        // rfc4122, version 4 form
        var r;

        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
          if (!uuid[i]) {
            r = 0 | Math.random() * 16;
            uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
          }
        }
      }

      return uuid.join('');
    };

    // A more performant, but slightly bulkier, RFC4122v4 solution.  We boost performance
    // by minimizing calls to random()
    Math.uuidFast = function() {
      var chars = CHARS,
        uuid = new Array(36),
        rnd = 0,
        r;
      for (var i = 0; i < 36; i++) {
        if (i == 8 || i == 13 || i == 18 || i == 23) {
          uuid[i] = '-';
        } else if (i == 14) {
          uuid[i] = '4';
        } else {
          if (rnd <= 0x02) rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
          r = rnd & 0xf;
          rnd = rnd >> 4;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
      return uuid.join('');
    };

    // A more compact, but less performant, RFC4122v4 solution:
    Math.uuidCompact = function() {
      return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
          v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
    return Math.uuidCompact()
  }

  /**
   * 写cookies
   * @param name
   * @param value
   * @private
   */
  _setCookie(name, value) {
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
  }

  /**
   * 读取cookies
   * @param name
   * @returns {null}
   * @private
   */
  _getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
      return unescape(arr[2]);
    else
      return null;
  }

  /**
   * 删除cookies
   * @param name
   * @private
   */
  _delCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);
    if (cval != null)
      document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
  }

  /**
   * 获取用户jcnappid和jcnuserid
   * @returns {{jcnappid: type[], jcnuserid: type[]}}
   * @private
   */
  _getJcn () {
    var that = this;
    //获取本地uuid
    var get_uuid = localStorage.getItem('uuid') || that._getCookie('uuid');
    var set_uuid = that._uuid();

    function getUuid() {
      if (get_uuid == null) {
        if (window.localStorage) {
          //写入localStorage
          localStorage.setItem('uuid', set_uuid);
        } else {
          //写入cookie
          that._setCookie('uuid', set_uuid);
        }
        return set_uuid
      } else {
        return get_uuid
      }
    }
    //设置统计参数
    var jcnappid = that._GetQueryString('jcnappid') == null ? getUuid() : that._GetQueryString('jcnappid'),
      jcnuserid = that._GetQueryString('jcnuserid') == null ? getUuid() : that._GetQueryString('jcnuserid');
    return {
      jcnappid: jcnappid,
      jcnuserid: jcnuserid
    }
  }

  /**
   * 获取参数对象
   * @returns {{}}
   * @private
   */
  _getQueryObj() {
    if(location.search === '') return {}
    var arr = location.search.slice(1).split('&')
    var o = {}
    arr.forEach(function(item){
      var n = item.indexOf("=")
      var pro = n === -1 ? item : item.slice(0,n)
      var val = n === -1 ? null : item.slice(n+1)
      o[pro] = val
    })
    return o
  }
}
const TOOLS = new Tools(apis)
export default TOOLS