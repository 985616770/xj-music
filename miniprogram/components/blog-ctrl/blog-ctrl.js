// components/blog-ctrl/blog-ctrl.js
let userInfo = ''
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 登入组件
    loginShow: false,
    // 底部弹出层
    modalShow: false,
    content: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoginsuccess(event) {
      userInfo = event.detail
      this.setData({
        loginShow: false
      })
    },
    onLoginfail() {
      wx.showModal({
        title: '授权用户才能进行评价...',
        content: ''
      })
    },
    onSend() {
      const { nickName, avatarUrl } = userInfo
      const { blogId } = this.properties
      // 插入数据库
      let content = this.data.content
      if (content.trim() === '') {
        wx.showModal({
          title: '评论内容不能为空...',
          content: '',
          showCancel: true,
          cancelText: '取消',
          cancelColor: '#000000',
          confirmText: '确定',
          confirmColor: '#3CC51F'
        })
        return
      }

      wx.showLoading({
        title: '评论中...',
        mask: true
      })

      // 订阅消息,且添加到云数据库,云调用推送订阅消息
      wx.requestSubscribeMessage({
        tmplIds: ['wTwcu4XORo_PrHxubLki2YAGDI4ZQAMIjTRTs9hD9Is'],
        success: res => {
          if (res.errMsg === 'requestSubscribeMessage:ok') {
            // 这里将订阅的课程信息调用云函数存入云开发数据
            db.collection('blog-comment').add({
              data: {
                content,
                createTime: db.serverDate(),
                blogId,
                nickName,
                avatarUrl
              }
            })
            wx.cloud
              .callFunction({
                name: 'sendMessage',
                data: {
                  content,
                  nickName,
                  blogId
                }
              })
              .then(res => {
                wx.hideLoading()
                // 刷新页面'
                this.triggerEvent('refreshCommentList')
                wx.showToast({
                  title: '评论成功',
                  icon: 'none',
                  image: '',
                  duration: 1500,
                  mask: false
                })
                this.setData({
                  content: '',
                  modalShow: false
                })
              })
          }
        }
      })
    },
    onInput(event) {
      this.setData({
        content: event.detail.value
      })
    },
    onComment() {
      // 判断用户是否授权
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              withCredentials: 'false',
              lang: 'zh_CN',
              timeout: 10000,
              success: res => {
                userInfo = res.userInfo
                this.setData({
                  modalShow: true
                })
              }
            })
          } else {
            this.setData({
              loginShow: true
            })
          }
        }
      })
    }
  },
  options: {
    // 使用外部样式
    addGlobalClass: true
  }
})
