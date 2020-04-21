// components/lyric/lyric.js
let realPx = 0
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow: {
      type: Boolean,
      value: false
    },
    lyric: String
  },
  observers: {
    lyric(lrc) {
      if (lrc === '暂无歌词') {
        this.setData({
          lrcList: [
            {
              lrc,
              time: 0
            }
          ],
          nowLyricIndex: -1
        })
      }
      this._parseLrc(lrc)
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    lrcList: null,
    nowLyricIndex: 0,
    scrollTop: 0
  },
  lifetimes: {
    // 750rpx
    ready() {
      wx.getSystemInfo({
        complete: res => {
          // console.log(res)

          realPx = (res.screenWidth / 750) * 64
        }
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _parseLrc(lrc) {
      let line = lrc.split('\n')
      let _lrcList = []
      line.forEach(item => {
        let time = item.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        if (time !== null) {
          let lrc = item.split(time)[1]
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)

          // 格式化回到秒数
          let time2Seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000
          _lrcList.push({
            time: time2Seconds,
            lrc
          })
        }
      })
      this.setData({
        lrcList: _lrcList
      })
    },
    update(currentTime) {
      let lrcList = this.data.lrcList
      if (lrcList.length === 0) {
        return
      }
      if (currentTime > lrcList[lrcList.length - 1].time) {
        if (this.data.nowLyricIndex !== -1) {
          this.setData({
            nowLyricIndex: -1,
            scrollTop: lrcList.length * realPx
          })
        }
      }
      for (let i = 0; i < lrcList.length; i++) {
        const time = lrcList[i].time
        if (currentTime < time) {
          console.log(realPx, this.data.scrollTop)

          this.setData({
            nowLyricIndex: i - 1,
            scrollTop: (i - 1) * realPx
          })
          break
        }
      }
    }
  }
})
