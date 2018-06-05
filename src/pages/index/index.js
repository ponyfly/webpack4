require('./index.css')
import Vue from 'vue'
import TOOLS from '../../util/util'
import defaultHeadUrl from '../../imgs/default-avator.png'

const vm = new Vue({
  el: "#app",
  data: {
    showPlayIcon: true,
    showFixBottom: true,
    showActiveClass: false,
    commentText: '',
    showTipPanel: false,
    tipContent: '',
    isLike: false,
    works:{},
    maskType: '',
    nextPageRecord: '',
    loadedAll: false,
    commentList: [],
    lastPostY:0,
    newUser: {
      nickName: 'defaultName',
      headUrl: defaultHeadUrl
    },
    videoLoading: false,
    isFullScreen: false,
    loadMore: {
      startY: 0,
      endY: 0
    },
    runningEnv: {},
    isFirstClickVideo: true
  },
  methods: {
    /**
     * 初始化静态数据
     * @private
     */
    _initStaticVal() {
      const ua = navigator.userAgent.toLowerCase();
      this.worksId = TOOLS._GetQueryString('id') || 504533
      this.originHref = location.href
      this.runningEnv = {
        'weixin': ua.indexOf('micromessenger') > -1,
        'qq': ua.indexOf('qq') > -1 && ua.indexOf('micromessenger') === -1,
        'weibo': ua.indexOf('weibo') > -1,
        'iphone': ua.indexOf('iphone') > -1,
        'android': ua.indexOf('android') > -1,
        'uc':ua.indexOf('ucbrowser') > -1,
        'baidu': ua.indexOf('baidu') > -1,
        'pc': window.screen.width > 768,
        'momo': ua.indexOf('momowebview') > -1,
      };
    },
    /**
     * 获取作品信息
     * @private
     */
    _getWorksShareDetail(){
      const config = {
        method: 'post',
        url: TOOLS.apis.worksShareDetail,
        data: JSON.stringify({
          cu: this.newUser.id,
          worksId: this.worksId,
        })
      }
      TOOLS._ajaxGetData(config)
        .then(({data}) => {
          this.works = data.works
        })
    },
    /**
     * 获取评论列表
     * @private
     */
    _getReplyList() {
      if(this.loadedAll){
        console.log('加载完了...')
        return
      }
      const config = {
        method: 'post',
        url: TOOLS.apis.replyList,
        data: JSON.stringify({
          cu: this.newUser.id,
          worksId: this.worksId,
          pageSize: 20,
          pageRecord: this.nextPageRecord || ''
        })
      }
      TOOLS._ajaxGetData(config)
        .then(({data}) => {
          this.commentList = this.commentList.concat(data.list)
          this.nextPageRecord = data.nextPageRecord
          this.loadedAll = !(data.nextPageRecord).trim()
        })
    },
    /**
     * 获取微信、QQ平台认证
     * @param cb
     * @private
     */
    _tryAuth(cb){
      const code = TOOLS._GetQueryString('code')
      if (code) {
        if(this.runningEnv.weixin){
          const config = {
            url: TOOLS.apis.fetchWechatUserInfo,
            method: 'POST',
            data: JSON.stringify({code: code})
          }
          TOOLS._ajaxGetData(config)
            .then(({data}) =>{
              this.newUser.nickName = data.userInfo.nickName
              this.newUser.headUrl = data.userInfo.headUrl
            })
        }else if(this.runningEnv.qq){
          const config = {
            url: TOOLS.apis.fetchQQUserInfo,
            method: 'POST',
            data: JSON.stringify({
              code: code,
              redirectUri: encodeURIComponent(this.originHref)
            })
          }
          TOOLS._ajaxGetData(config)
            .then(({data}) =>{
              this.newUser.nickName = data.userInfo.nickName
              this.newUser.headUrl = data.userInfo.headUrl
            })
        }
        cb && cb()
      } else {
        if (this.runningEnv.qq) {
          window.location.href = 'https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=101404274&redirect_uri=' + encodeURIComponent(this.originHref) +'&scope=get_user_info'
        } else if (this.runningEnv.weixin) {
          window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxebd42ca0b55bd02f&redirect_uri='+ encodeURIComponent(this.originHref) +'&response_type=code&scope=snsapi_userinfo&state=test#wechat_redirect';
        } else {
          //微博
          cb && cb()
        }
      }
    },
    /**
     * 视频播放控制
     */
    controlVideo() {
      if(this.showPlayIcon) {
        if (this.isFirstClickVideo) {
          this.postCommonStats()
          this.isFirstClickVideo = false
        }
        this.$refs.BalalaVideo.play()
      } else {
        this.$refs.BalalaVideo.pause()
      }
      this.showPlayIcon = !this.showPlayIcon
    },
    /**
     * 跳转到应用商店
     * @param opt 点击位置
     */
    linkToAppStore(opt) {
      if(opt === 'get') {
        TOOLS._send1_1('Download_get')
      } else if(opt === 'like') {
        TOOLS._send1_1('Download_tan_zan')
      } else if(opt === 'comment') {
        TOOLS._send1_1('Download_tan_ping')
      }
      window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=cn.j.tock&ckey=CK1385982821822'
    },
    /**
     * 关闭底部广告
     */
    closeFixBottom() {
      this.showFixBottom = false
    },
    /**
     * 控制输入框高度变化
     */
    changeHeight() {
      this.showActiveClass = true
      TOOLS._send1_1('Click_Comment')
    },
    /**
     * 发表评论
     */
    publishComment() {
      const commentLength = this.commentText.trim().length
      if(commentLength === 0) {
        this.controlTipPanel('请填入评论内容')
        return
      } else if(commentLength > 120) {
        this.controlTipPanel('不能超过120字')
        return
      }
      const newComment = {
        "content": this.commentText,
        "user": this.newUser,
        "replyTime": "刚刚"
      }
      this.commentList.unshift(newComment)
      alert(JSON.stringify(newComment))
      const config = {
        method: 'post',
        url: TOOLS.apis.sendReply,
        data: JSON.stringify({
          worksId: this.worksId,
          content: this.commentText,
          userInfo: this.newUser
        })
      }
      TOOLS._ajaxGetData(config)
        .then(() => {
          this.commentText = ''
          this.showActiveClass = false
          this.maskType = 'comment'
        })
      TOOLS._send1_1('Click_Comment_finish')
    },
    /**
     * 控制error弹框
     * @param text
     */
    controlTipPanel(text) {
      this.tipContent = text
      this.showTipPanel = true
      setTimeout(() => {
        this.tipContent = ''
        this.showTipPanel = false
      },1000)
    },
    /**
     * 视频结束事件
     */
    videoEndHandler() {
      this.showPlayIcon = true
      this.videoLoading = false
    },
    /**
     * 退出全屏事件
     */
    exitHandler() {
      this.showPlayIcon = true
      this.videoLoading = false
      this.isFullScreen = false
      this.$refs.BalalaVideo.pause()
    },
    /**
     * 进入全屏事件
     */
    enterHandler() {
      this.isFullScreen = true
    },
    /**
     * 喜欢该作品
     */
    showLike() {
      console.log('like')
      this.works.likeCount++
      this.isLike = true
      this.maskType = 'like'
      TOOLS._send1_1('Click_Like')
      this.attentionOn()
    },
    /**
     * 关闭遮罩
     */
    closeMask() {
      this.maskType = ''
      this.showActiveClass = false
    },
    /**
     * 生成用户id
     * @private
     */
    _getNewestUserId() {
      let newUserId = localStorage.getItem('newUserId') || ''
      if(newUserId) {
        this.newUser.id = newUserId
        this.newUser.nickName = '微博用户' + newUserId
        console.log('storage: ' + newUserId)
      } else {
        const config = {
          method: 'post',
          url: TOOLS.apis.getNewestUserId,
          data: JSON.stringify({})
        }
        TOOLS._ajaxGetData(config)
          .then(({data}) => {
            this.newUser.id = data.userId
            this.newUser.nickName = '微博用户' + newUserId
            localStorage.setItem('newUserId', data.userId)
            console.log('ajax:' + data.userId)
          })
      }
    },
    /**
     * 跳转到用户中心页面
     * @param index
     */
    goToUserCenter(index){
      if(index === -1) {
        TOOLS._send1_1('Click_nickname')
        window.location.href = 'https://balala.j.cn/sharepage/user.html?userId=' + this.works.user.id
      } else{
        if (this.commentList[index].user.sourceFrom === 1) return
        window.location.href = 'https://balala.j.cn/sharepage/user.html?userId=' + this.commentList[index].user.id
      }
    },
    /**
     * 喜欢（关注）该作品
     */
    attentionOn() {
      const config = {
        method: 'post',
        url: TOOLS.apis.attentionOn,
        data: JSON.stringify({
          "objId": this.works.id,
          "type": 0,
          "userInfo": this.newUser,
        })
      }
      TOOLS._ajaxGetData(config)
        .then(({data}) => {
          console.log(data.bizStatus)
        })

    },
    /**
     * 播放等待中事件
     */
    waitingHandler() {
     this.videoLoading = true
    },
    /**
     * 播放中事件
     */
    playingHandler() {
      this.videoLoading = false
    },
    /**
     * 手指按下事件
     * @param e
     */
    touchStart(e){
      if (!/评论|发表|喜欢/.test(e.target.dataset.a)){
        if (this.showActiveClass) {
          this.$refs.textArea.blur()
        }
      }
      this.startY = e.targetTouches[0].pageY
    },
    /**
     * 手指离开事件
     * @param e
     */
    touchEnd(e){
      this.endY = e.changedTouches[0].pageY
      if (this.endY - this.startY < -300) {
        this._getReplyList()
      }
    },
    /**
     * 评论框失焦事件
     */
    blurHandler() {
      this.showActiveClass = false
    },
    /**
     * 点击播放视频，播放总次数加1
     * @param id
     * @param jcntarget
     * @param jcnapp
     */
    postCommonStats() {
      const jcntarget = TOOLS._GetQueryString('jcntarget') || ''
      const jcnapp = TOOLS._GetQueryString('jcnapp') || ''
      const {jcnappid, jcnuserid} = TOOLS._getJcn()
      const config = {
        method: 'post',
        url: TOOLS.apis.commonStats,
        data: JSON.stringify({
          'itemId': this.works.id,
          'action': 'h5detail',
          'target': jcntarget,
          'typeId': this.works.scenario.id,
          'app': jcnapp,
          'from': 'h5',
          'clientEnv': {
            'jcnappid': jcnappid + '',
            'jcnuserid': jcnuserid + '',
            'latitude': '0',
            'longitude': '0',
            'net': '',
            'v': '0'
          },
          'userid': this.newUser.id
        })
      }
      TOOLS._ajaxGetData(config)
        .then(({statusCode}) => console.log)
    }
},
  filters: {
    formatImg(imgSrc) {
      return (imgSrc.lastIndexOf('webp') > -1) ? imgSrc.match(/(.*)80\/format\/webp/)[1] + '60' : imgSrc
    }
  },
  created() {
    this._initStaticVal()
    this._tryAuth(() => {
      this._getNewestUserId()
      this._getWorksShareDetail()
      this._getReplyList()
    })
  },
  watch: {},
  mounted(){}
})





if (module.hot) {
   module.hot.accept()
}
