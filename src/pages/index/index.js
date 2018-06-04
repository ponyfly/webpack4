require('./index.css')
import Vue from 'vue'
import BScroll from 'better-scroll'
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
    isFullScreen: false
  },
  methods: {
    _initStaticVal() {
      const ua = navigator.userAgent.toLowerCase();
      this.worksId = TOOLS._GetQueryString('id') || 80569
      this.shareUserId = TOOLS._GetQueryString('shareUserId') || ''
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
    _getWorksShareDetail(){
      const config = {
        method: 'post',
        url: TOOLS.apis.worksShareDetail,
        data: JSON.stringify({
          worksId: this.worksId,
          shareUserId: this.shareUserId
        })
      }
      TOOLS._ajaxGetData(config)
        .then(({data}) => {
          this.works = data.works
        })
    },
    _getReplyList() {
      if(this.loadedAll){
        console.log('加载完了...')
        return
      }
      const config = {
        method: 'post',
        url: TOOLS.apis.replyList,
        data: JSON.stringify({
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
          this.$nextTick(() => {
            this._initScroll()
          })
        })
    },
    _initScroll(){
      if(!this.scroll) {
        this.scroll = new BScroll(this.$refs.ScrollContainer,{
          click: true,
          bounce: false,
          pullUpLoad: {
            threshold: 300,
          },
        })
        this.scroll.on('touchEnd', (pos) => {
          if(Math.abs(pos.y) - this.lastPostY > 300) {
            this.lastPostY = Math.abs(pos.y)
            this._getReplyList()
          }
        })
      } else {
        this.scroll.refresh()
      }
    },
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
    controlVideo() {
      if(this.showPlayIcon) {
        this.$refs.BalalaVideo.play()
      } else {
        this.$refs.BalalaVideo.pause()
      }
      this.showPlayIcon = !this.showPlayIcon
    },
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
    closeFixBottom() {
      this.showFixBottom = false
    },
    changeHeight(isActive) {
      TOOLS._send1_1('Click_Comment')
      this.showActiveClass = isActive
    },
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
      this.$nextTick(()=> {
        this.scroll.refresh()
      })
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
    controlTipPanel(text) {
      this.tipContent = text
      this.showTipPanel = true
      setTimeout(() => {
        this.tipContent = ''
        this.showTipPanel = false
      },1000)
    },
    videoEndHandler() {
      this.showPlayIcon = true
      this.videoLoading = false
    },
    exitHandler() {
      this.showPlayIcon = true
      this.videoLoading = false
      this.isFullScreen = false
      this.$refs.BalalaVideo.pause()
    },
    enterHandler() {
      this.isFullScreen = true
    },
    showLike() {
      this.works.likeCount++
      this.isLike = true
      this.maskType = 'like'
      TOOLS._send1_1('Click_Like')
      this.attentionOn()
    },
    closeMask() {
      this.maskType = ''
      this.showActiveClass = false
    },
    _getNewestUserId() {
      let newUserId = localStorage.getItem('newUserId') || ''
      if(newUserId) {
        this.newUser.id = newUserId
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
            localStorage.setItem('newUserId', data.userId)
            console.log('ajax:' + data.userId)
          })
      }
    },
    goToUserCenter(index){
      if(index === -1) {
        TOOLS._send1_1('Click_nickname')
        window.location.href = 'https://balala.j.cn/sharepage/user.html?userId=' + this.works.user.id
      } else{
        window.location.href = 'https://balala.j.cn/sharepage/user.html?userId=' + this.commentList[index].id
      }
    },
    attentionOn() {
      const config = {
        method: 'post',
        url: TOOLS.apis.attentionOn,
        data: JSON.stringify({
          "objId": this.works.id,
          "type": 0,
          "userInfo": {
            "id": this.newUser.id,
            "nickName": "qingsongyan", //不同平台不同用户名 默认default
            "headUrl": "http://tvax2.sinaimg.cn/crop.5.0.1232.1232.1024/9b9e180dly8fjltddk5rnj20yi0y8dhq.jpg",
          },
        })
      }
      TOOLS._ajaxGetData(config)
        .then(({data}) => {
          console.log(data.bizStatus)
        })

    },
    waitingHandler() {
     this.videoLoading = true
    },
    playingHandler() {
      this.videoLoading = false
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
  mounted(){}
})





if (module.hot) {
   module.hot.accept()
}
