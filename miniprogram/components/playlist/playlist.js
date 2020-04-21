

Component({
  properties: {
    playlist: Object
  },
  observers: {
    ['playlist.playCount'](num) {
      this.setData({
        _count: this._tranNumber(num, 2)
      })
    }
  },
  data: {
    _count: 0
  },
  methods: {
    _tranNumber(num, point) {
      let numStr = num.toString().split('.')[0]
      if (numStr.length < 6) {
        return numStr
      } else if (numStr.length >= 6 && numStr.length <= 8) {
        let decimal = numStr.substring(numStr.length - 4, numStr.length - 4 + point)
        return parseFloat(`${parseInt(num / 10000)}.${decimal}`) + '万'
      } else if (numStr.length > 8) {
        let decimal = numStr.substring(numStr.length - 8, numStr.length - 8 + point)
        return parseFloat(`${parseInt(num / 100000000)}.${decimal}`) + '亿'
      }
    },
    goToMusicList() {
      wx.navigateTo({
        url: `/pages/musiclist/musiclist?playlistId=${this.properties.playlist.id}`
      })
    }
  },
 
})
