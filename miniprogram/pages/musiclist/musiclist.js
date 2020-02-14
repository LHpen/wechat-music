 // pages/musiclist/musiclist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    musiclist: [],//歌曲
    listInfo: {},//封面信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'music',
      data: {
        playlistId: options.playlistId,
        $url: 'musiclist'
      }
    }).then((res) =>{
      const pl = res.result.playlist
      this.setData({
        musiclist: pl.tracks,
        listInfo: {
        coverImgUrl: pl.coverImgUrl, //封面
            name: pl.name,
          }
        })
        this._setMusiclist()
        wx.hideLoading()
      })
  },
//存入本地缓存
  _setMusiclist() {
    wx.setStorageSync('musiclist', this.data.musiclist)
  },


})