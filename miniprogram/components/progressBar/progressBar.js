// components/processBar/processBar.js
let movableAreaWidth = 0
let movableViewWidth = 0
const bgAudioManger = wx.getBackgroundAudioManager()
let currentSec = -1 // 当前秒数
let totalTime = 0 // 总秒数
let isMoving = false // 只允许一种行为
Component({
  properties: {
    isSame: Boolean
  },
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00'
    },
    movableDis: 0,
    progress: 0
  },

  methods: {
    _getMovableDis() {
      // 查询宽度
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec(rect => {
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
      })
    },
    _bindBGMEvent() {
      bgAudioManger.onPlay(() => {
        console.log('onPlay')
        isMoving = false
        this.triggerEvent('musicPlay')
      })
      bgAudioManger.onStop(() => {
        console.log('onStop')
      })
      bgAudioManger.onPause(() => {
        console.log('onPause')
        this.triggerEvent('musicPause')
      })
      bgAudioManger.onWaiting(() => {
        console.log('onWaiting')
      })
      bgAudioManger.onCanplay(() => {
        if (bgAudioManger.duration === undefined) {
          setTimeout(() => {
            this._setTime()
          }, 1000)
        } else {
          this._setTime()
        }
        console.log('onCanplay')
      })
      bgAudioManger.onTimeUpdate(() => {
        if (!isMoving) {
          const { currentTime, duration } = bgAudioManger
          const { m, s } = this._dateFormat(currentTime)
          const sec = currentTime.toString().split('.')[0]
          // 节流
          if (sec != currentSec) {
            this.setData({
              movableDis: ((movableAreaWidth - movableViewWidth) * currentTime) / duration,
              progress: (currentTime / duration) * 100,
              ['showTime.currentTime']: `${m}:${s}`
            })
            currentSec = sec
            this.triggerEvent('timeUpdate', {
              currentTime
            })
          }
        }
      })
      bgAudioManger.onEnded(() => {
        this.triggerEvent('musicEnd')
        console.log('onEnded')
      })
      bgAudioManger.onError(res => {
        console.error(res.errMsg)
        console.error(res.errCode)
        wx.showToast({
          title: 'misTask: ' + res.errCode
        })
      })
    },
    _setTime() {
      const { duration } = bgAudioManger
      totalTime = duration
      const { m, s } = this._dateFormat(duration)
      this.setData({
        ['showTime.totalTime']: `${m}:${s}`
      })
    },
    _dateFormat(time) {
      // 分
      let m = Math.floor(time / 60)
      // 秒
      let s = Math.floor(time % 60)
      m = m < 10 ? `0${m}` : m
      s = s < 10 ? `0${s}` : s
      return {
        m,
        s
      }
    },
    onChange(event) {
      if (event.detail.source === 'touch') {
        this.data.progress = (event.detail.x / (movableAreaWidth - movableViewWidth)) * 100
        this.data.movableDis = event.detail.x
        isMoving = true
      }
    },
    onTouchend(event) {
      const { s, m } = this._dateFormat(bgAudioManger.currentTime)

      this.setData({
        progress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: `${m}:${s}`
      })
      console.log(this.data.progress)

      bgAudioManger.seek(totalTime * (this.data.progress / 100))
      isMoving = false
    }
  },

  lifetimes: {
    ready() {
      if (this.properties.isSame && this.data.showTime.totalTime === '00:00') {
        this._setTime()
      }
      this._getMovableDis()
      this._bindBGMEvent()
    }
  }
})
