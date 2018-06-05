require('./index.css')
import Vue from 'vue'
import BScroll from 'better-scroll'
import TOOLS from '../../util/util'

const vm = new Vue({
  el: "#app",
  data: {
    personalInfos:{},
    itemList: [],
    worksType: 0,
    nextPageRecord: '',
    isLoadAll: false,
    lastPostY:0
  },
  methods: {
    linkToAppStore() {
      TOOLS._send1_1('Download_follow')
      window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=cn.j.tock&ckey=CK1385982821822'
    },
    _initStaticVal() {
      this.userId = TOOLS._GetQueryString('userId') || 7
    },
    _getPersonalNewsList(arg) {
      if(this.isLoadAll) {
        console.log('没有更多视频了')
        return
      }
      const config = {
        method: 'post',
        url: TOOLS.apis.personalNewsList,
        data: JSON.stringify({
          listType:this.worksType,
          pageRecord: this.nextPageRecord || '',
          pageSize: 20,
          personalId: this.userId
        })
      }
      TOOLS._ajaxGetData(config)
        .then(({data}) => {
          let {itemList, nextPageRecord, ...personalInfos} = data
          if(arg === 'init') {
            this.personalInfos = personalInfos
          }
          this.itemList = this.itemList.concat(itemList)
          this.nextPageRecord = nextPageRecord
          this.isLoadAll = !(nextPageRecord || '').trim()
          this.$nextTick(() => {
            this._initScroll()
          })
        })
    },
    _initScroll(){
      if(!this.scroll) {
        this.scroll = new BScroll(this.$refs.scrollContainer,{
          click: true,
          bounce: false
        })
        this.scroll.on('touchEnd', (pos) => {
          if(Math.abs(pos.y) - this.lastPostY > 300) {
            this.lastPostY = Math.abs(pos.y)
            this._getPersonalNewsList()
          }
        })
      } else {
        this.scroll.refresh()
      }
    },
    linkToIndex(e) {
      if(e.target.className === 'poster') {
        const worksId = this.itemList[e.target.getAttribute('data-index')].id
        TOOLS._send1_1('Click_video_worksId')
        window.location.href = 'https://balala.j.cn/sharepage/index.html?id=' + worksId
      }
    },
  },
  filters: {
    formatImg(imgSrc) {
      return (imgSrc.lastIndexOf('webp') > -1) ? imgSrc.match(/(.*)80\/format\/webp/)[1] + '60' : imgSrc
    }
  },
  created() {
    this._initStaticVal()
    this._getPersonalNewsList('init')
  }
})