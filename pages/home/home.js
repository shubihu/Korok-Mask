import {CDN_PATH} from '../../config/appConfig';
var QQMapWX = require('../../config/qqmap-wx-jssdk.js');
var qqmapsdk = new QQMapWX({
  key: 'S6EBZ-ONXW3-ZCC3V-YBPBW-LNYTH-KSFO3' // 必填
}); 
const img = '../../image/marker.png'
Page({
	data: {
    imgs: {
      locationIcon:`../../image/local.png`,
			plus: `${CDN_PATH}/btn_plus@3x.png`,
			minus: `${CDN_PATH}/btn_minus@3x.png`
    },
		longitude: null,
    latitude: null,
    scale: 15,
    markers:[],
    current_info: null,
    info:[]
  },

  //获取marker位置信息
  getMarkerInfo(latitude,longitude){//传入自身定位坐标
    var that = this
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (res) {
        console.log(JSON.stringify(res));
        // let province = res.result.ad_info.province
        let city = res.result.ad_info.city
        let district = res.result.ad_info.district
        // let city = '上海市浦东新区'
        wx.request({
          url: 'http://gjzwfw.www.gov.cn/fwmh/healthCode/getNucleic.do',
          data: `regionCode=00&keyword=${city}&pagenum=1&pagesize=100000`,
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function(res) {//成功后的回调
            // console.log(res.data.params.data);
            var arr = res.data.params.data
            var info_list = []
            arr.forEach(function (item, i) {
              var latitudeAndLongitude = item.latitudeAndLongitude.split(',')
              var latitude = parseFloat(latitudeAndLongitude[1])
              var longitude = parseFloat(latitudeAndLongitude[0])
              var name = item.orgName
              var phone = item.orgPhone
              var add = item.orgAddress

              var marker_dict = { 'id': i,
                                  'latitude': latitude,
                                  'longitude': longitude,
                                  'name': name,
                                  'phone': phone,
                                  'add': add}
              info_list.push(marker_dict)
            });
            that.setData({
              info: info_list
            });
            that.addMarkers();
        // 使用默认聚合效果时可注释下一句
            // that.bindEvent();
          }
        })
      },
    }); 
  },

  onLoad: function () {
    var self=this;
    this.mapCtx = wx.createMapContext('map');
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        self.setData({
          latitude : res.latitude,
          longitude : res.longitude,
        });
        self.getMarkerInfo(res.latitude, res.longitude)
      }
    })
    // this.getMarkerInfo(res.latitude, res.longitude)
  },

	moveTolocation: function () { //回到当前定位坐标
    //mapId 就是你在 map 标签中定义的 id
    var mapCtx = wx.createMapContext('map');
    mapCtx.moveToLocation();
  },
  onIncreaseScale: function () {//增加缩放
    var that = this;
    this.mapCtx.getScale ({
      success: function (res) {
        // console.log(res.scale);
        that.setData({ scale: res.scale + 1})
      }
    })
  },
  onDecreaseScale: function () {//减小缩放
    var that = this;
    this.mapCtx.getScale({
      success: function (res) {
        // console.log(res.scale);
        that.setData({ scale: res.scale -1})
      }
    })
  },

  addMarkers() {
    const marker = {
      id: null,
      iconPath: img,
      width: 30,
      height: 30,
      joinCluster: true, // 指定了该参数才会参与聚合
      // label:{
      //   width: 50,
      //   height: 30,
      //   borderWidth: 1,
      //   borderRadius: 10,
      //   bgColor: '#ffffff'
      // }
    }

    const markers = []
    // console.log(this.data.info)
    this.data.info.forEach((p, i, array) => {
      // const newMarker = Object.assign(marker, p)
      // newMarker.id = i + 1
      // newMarker.label.content = `label ${i + 1}`
      const a = {};
      const newMarker = Object.assign(a, marker, p); //小程序开发文档Object.assign(marker, p)因为浅拷贝的问题会出现markers数组内元素完全一样的现象，改成这样即可
      newMarker.latitude = p.latitude;
      newMarker.longitude = p.longitude;
      newMarker.id = p.id;
      markers.push(newMarker)

      this.mapCtx.addMarkers({
        markers,
        clear: false,
        complete(res) {
          // console.log('addMarkers', res)
        }
      })
    })
  },

  onMarkerTap(e) {
    console.log(this.data.info[e.markerId])
    this.setData({
      current_info: this.data.info[e.markerId]
    })
  },

  gotohere:function(res){
    console.log(res);
    let markerId = res.markerId;// 获取点击的markers  id
    let markers = this.data.info

    for (let item of markers){
      if (item.id === markerId) {
        let lat = item.latitude;
        let lon = item.longitude;
        let name = item.name;
        let address = item.add;
        // phone = item.phone
        // console.log(item)
        wx.openLocation({ // 打开微信内置地图，实现导航功能（在内置地图里面打开地图软件）
          latitude: lat,
          longitude: lon,
          name:name,
          address: address,
          success:function(res){
            console.log(res);
          },
          fail:function(res){
            console.log(res);
          }
        })
        break;
      }
    }
  },

});

