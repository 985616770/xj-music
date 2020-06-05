// pages/player/player.js
// 唯一对象(音频)
let bgAudioManger = wx.getBackgroundAudioManager()
let nowPlayingIndex = 0
let musicList = null

let app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    isPlaying: false, // 是否播放
    isLyricShow: false, // 是否展示歌词
    lyric: '',
    isSame: false // 是否同一首歌
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    // 获取索引
    nowPlayingIndex = options.index
    // 获取存储中的资源
    musicList = wx.getStorageSync('musiclist')

    this._loadMusicDetail(options.musicid)
  },
  /**
   *
   * @param {Object} playlist 歌曲列表
   * @param {number} index 索引
   * @param {Number} musicId  音乐标识符
   */
  _loadMusicDetail(musicId) {
    if (parseInt(musicId) === parseInt(app.getPlayingMusicId())) {
      this.setData({
        isSame: true
      })
    } else {
      this.setData({
        isSame: false
      })
    }
    if (!this.data.isSame) {
      bgAudioManger.stop()
    }
    let music = musicList[nowPlayingIndex]

    wx.setNavigationBarTitle({
      title: music.name
    })

    this.setData({
      picUrl: music.al.picUrl,
      isPlaying: false
    })

    app.setPlayingMusicId(musicId)

    wx.showLoading({
      title: '正在加载音乐'
    })
    wx.cloud
      .callFunction({
        name: 'music',
        data: {
          musicId,
          $url: 'musicUrl'
        }
      })
      .then(res => {
        if (!res.result.data[0].url) {
          wx.showToast({
            title: '无权限播放'
          })
        }
        if (!this.data.isSame) {
          bgAudioManger.src = res.result.data[0].url
          bgAudioManger.title = music.name
          bgAudioManger.coverImgUrl = this.data.picUrl
          bgAudioManger.singer = music.ar[0].name
          bgAudioManger.epname = music.al.name

          // 保存播放历史
          this.savePlayHistory()
        }

        this.setData({
          isPlaying: true
        })
        wx.hideLoading()
        wx.cloud
          .callFunction({
            name: 'music',
            data: {
              $url: 'lyric',
              musicId
            }
          })
          .then(res => {
            let lyric = '暂无歌词'
            
            const { lrc } = res.result

            if (lrc) {
              lyric = lrc.lyric
            }
            this.setData({
              lyric
            })
          })
      })
  },

  togglePlaying() {
    let playing = this.data.isPlaying

    playing === true ? bgAudioManger.pause() : bgAudioManger.play()

    this.setData({
      isPlaying: !playing
    })
  },

  prevMusic() {
    nowPlayingIndex--
    this._getPlayingMusic()
  },
  nextMusic() {
    nowPlayingIndex++
    this._getPlayingMusic()
  },
  _getPlayingMusic() {
    if (nowPlayingIndex < 0) {
      nowPlayingIndex = musicList.length - 1
    } else if (nowPlayingIndex > musicList.length - 1) {
      nowPlayingIndex = 0
    }
    this._loadMusicDetail(musicList[nowPlayingIndex].id)
  },
  onChangeLyrics() {
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },
  timeUpdate(event) {
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },
  musicPlay() {
    this.setData({
      isPlaying: true
    })
  },
  musicPause() {
    this.setData({
      isPlaying: false
    })
  },
  /**
   * 保存播放历史
   */
  savePlayHistory() {
    // 当前播放的歌曲
    const music = musicList[nowPlayingIndex]
    const { openid } = app.globalData
    const history = wx.getStorageSync(openid)
    let bHave = false
    for (let i = 0, len = history.length; i < len; i++) {
      if (history[i].id === music.id) {
        bHave = true
        break
      }
    }
    if (!bHave) {
      history.unshift(music)
      wx.setStorage({
        key: openid,
        data: history
      })
    }
  }
})
