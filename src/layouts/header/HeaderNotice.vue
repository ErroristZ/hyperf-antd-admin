<template>
  <a-dropdown :trigger="['click']" v-model="show">
    <div slot="overlay">
      <a-spin :spinning="loading">
        <a-tabs class="dropdown-tabs" :tabBarStyle="{textAlign: 'center'}" :style="{width: '350px'}" @change="tabChange">
          <a-tab-pane tab="消息" key="1">
            <a-list class="tab-pane" item-layout="vertical">
              <a-list-item v-for="(v, k) in messageData[1].list" :key="k">
                <a-list-item-meta :title="v.title" :description="v.content" />
                <template slot="actions">
                  <span v-text="dateFormat(v.createTime)"></span>
                </template>
              </a-list-item>
              <div style="text-align: center;" v-if="messageData[1].total > 0">
                <a-button @click="onLoadMore" size="small" style="margin-top: 8px;">
                  {{messageData[1].conditions.page >=
                  (Math.ceil(messageData[1].total /
                  messageData[1].conditions.limit)) ? '已加载全部内容' :
                  '加载更多'}}
                </a-button>
              </div>
            </a-list>
          </a-tab-pane>
          <a-tab-pane tab="通知" key="2">
            <a-list class="tab-pane" item-layout="vertical">
              <a-list-item v-for="(v, k) in messageData[2].list" :key="k">
                <a-list-item-meta :title="v.title" :description="v.content" />
                <template slot="actions">
                  <span v-text="dateFormat(v.createTime)"></span>
                </template>
              </a-list-item>
              <div style="text-align: center;" v-if="messageData[2].total > 0">
                <a-button @click="onLoadMore" size="small" style="margin-top: 8px;">
                  {{messageData[1].conditions.page >=
                  (Math.ceil(messageData[2].total /
                  messageData[2].conditions.limit)) ? '已加载全部内容' :
                  '加载更多'}}
                </a-button>
              </div>
            </a-list>
          </a-tab-pane>
          <a-tab-pane tab="待办" key="3">
            <a-list class="tab-pane" item-layout="vertical">
              <a-list-item v-for="(v, k) in messageData[3].list" :key="k">
                <a-list-item-meta :title="v.title" :description="v.content" />
                <template slot="actions">
                  <span v-text="dateFormat(v.createTime)"></span>
                </template>
              </a-list-item>
              <div style="text-align: center;" v-if="messageData[3].total > 0">
                <a-button @click="onLoadMore" size="small" style="margin-top: 8px;">
                  {{messageData[3].conditions.page >=
                  (Math.ceil(messageData[3].total /
                  messageData[3].conditions.limit)) ? '已加载全部内容' :
                  '加载更多'}}
                </a-button>
              </div>
            </a-list>
          </a-tab-pane>
        </a-tabs>
      </a-spin>
    </div>
    <span @click="fetchNotice" class="header-notice">
      <a-badge class="notice-badge" :count="notReadTotal">
        <a-icon :class="['header-notice-icon']" type="bell" />
      </a-badge>
    </span>
  </a-dropdown>
</template>

<script>
import Cookie from 'js-cookie'
import { xsrfHeaderName } from '@/utils/request'
import { dateFormat } from '@/utils/util'
import { SOCKET_MESSAGE } from '@/services/api'
import App from '@/App'

export default {
  name: 'HeaderNotice',
  data() {
    return {
      socket: null, //建立的连接
      lockReconnect: false, //是否真正建立连接
      timeout: 5 * 1000, //30秒一次心跳
      timeoutObj: null, //心跳心跳倒计时
      serverTimeoutObj: null, //心跳倒计时
      timeoutNum: null, //断开 重连倒计时
      loading: false,
      show: false,
      notReadTotal: '',
      activeKey: 1,
      loadingMore: false,
      messageData: {
        1: {
          conditions: {
            page: 1,
            limit: 10,
            type: 1
          },
          init: true,
          total: 0,
          list: []
        },
        2: {
          conditions: {
            page: 1,
            limit: 10,
            type: 2
          },
          init: true,
          total: 0,
          list: []
        },
        3: {
          conditions: {
            page: 1,
            limit: 10,
            type: 3
          },
          init: true,
          total: 0,
          list: []
        }
      }
    }
  },
  created() {
    this.initWebSocket()
  },
  computed: {},
  destroyed() {
    const that = this
    //页面销毁时关闭长连接
    that.socket.close()
  },
  methods: {
    initWebSocket: function () {
      const that = this
      if (typeof WebSocket === 'undefined') {
        alert('您的浏览器不支持socket')
      } else {
        // 实例化socket
        that.socket = new WebSocket(SOCKET_MESSAGE)
        // 监听socket连接
        that.socket.onopen = that.webSocketOpen
        // 监听socket关闭
        that.socket.onclose = that.webSocketClose
        // 监听socket消息
        that.socket.onmessage = that.webSocketMessage
        // 监听socket错误信息
        that.socket.onerror = that.webSocketError
        // 将socket赋予到窗口全局 方便调用
        window.socketNotice = that.socket
      }
    },
    //重新连接
    reconnectSocket() {
      const that = this
      if (that.lockReconnect) {
        return
      }
      that.lockReconnect = true
      //没连接上会一直重连，设置延迟避免请求过多
      that.timeoutNum && clearTimeout(that.timeoutNum)
      that.timeoutNum = setTimeout(function () {
        //新连接
        that.initWebSocket()
        that.lockReconnect = false
      }, 5000)
    },
    //重置心跳
    resetHeartbeat() {
      const that = this
      //清除时间
      clearTimeout(that.timeoutObj)
      clearTimeout(that.serverTimeoutObj)
      //重启心跳
      that.startHeartbeat()
    },
    //开启心跳
    startHeartbeat() {
      const that = this
      that.timeoutObj && clearTimeout(that.timeoutObj)
      that.serverTimeoutObj && clearTimeout(that.serverTimeoutObj)
      that.timeoutObj = setTimeout(function () {
        //这里发送一个心跳，后端收到后，返回一个心跳消息，
        if (that.socket.readyState === 1) {
          //如果连接正常
          const sendData = {
            cmd: 'message.heartbeat',
            data: {
              token: Cookie.get(xsrfHeaderName)
            }
          }
          that.webSocketSend(sendData)
        } else if (Cookie.get(xsrfHeaderName)) {
          //否则重连
          that.reconnectSocket()
        }
        that.serverTimeoutObj = setTimeout(function () {
          //超时关闭
          console.log('超时关闭')
          that.socket.close()
        }, that.timeout)
      }, that.timeout)
    },
    // 监听socket连接
    webSocketOpen: function () {
      const that = this
      if (!Cookie.get(xsrfHeaderName)) {
        that.socket.close()
        return false
      }
      const sendData = {
        cmd: 'message.bind',
        data: {
          token: Cookie.get(xsrfHeaderName)
        }
      }
      that.webSocketSend(sendData)
      that.startHeartbeat()
    },
    // 监听socket关闭
    webSocketClose: function () {
      const that = this
      that.reconnectSocket()
    },
    // 监听socket消息
    webSocketMessage: function (message) {
      const that = this
      //收到服务器信息，心跳重置
      that.resetHeartbeat()
      const data = JSON.parse(message.data)
      if (data.code !== 200) {
        that.loading = false
        that.$message.error(data.message, 3)
        that.socket.close()
        return false
      }
      if (data.data.cmd === 'message.bind') {
        that.notReadTotal = data.data.data.notReadTotal
        return false
      }
      if (data.data.cmd === 'message.fetch') {
        that.loading = false
        that.$set(that.messageData[that.activeKey], 'init', false)
        const arrList = that.messageData[that.activeKey].list.concat(data.data.data.list)
        that.$set(that.messageData[that.activeKey], 'list', arrList)
        that.$set(that.messageData[that.activeKey], 'total', data.data.data.total)
        that.notReadTotal = data.data.data.notReadTotal
        return false
      }
      if (data.data.cmd === 'message.resetNotReadTotal') {
        that.notReadTotal = data.data.data.notReadTotal
        that.resetMessageData()
        return false
      }
    },
    // 监听socket错误信息
    webSocketError: function () {
      const that = this
      that.reconnectSocket()
    },
    // 监听socket发送消息
    webSocketSend: function (sendData) {
      const that = this
      that.socket.send(JSON.stringify(sendData))
    },

    /**
     * 展开
     */
    fetchNotice() {
      const that = this
      if (!that.messageData[that.activeKey].init) {
        return false
      }
      that.loading = true
      const sendData = {
        cmd: 'message.fetch',
        data: that.messageData[that.activeKey].conditions
      }
      that.webSocketSend(sendData)
    },

    /**
     * 选项卡切换
     */
    tabChange(key) {
      const that = this
      that.activeKey = parseInt(key)
      that.fetchNotice()
    },

    /**
     * 格式化时间戳
     * @param timestamp
     */
    dateFormat(timestamp) {
      return dateFormat(timestamp, 'Y-m-d H:i:s')
    },

    /**
     * 加载更多
     */
    onLoadMore() {
      const that = this
      const page = parseInt(that.messageData[that.activeKey].conditions.page)
      const limit = parseInt(that.messageData[that.activeKey].conditions.limit)
      const total = parseInt(that.messageData[that.activeKey].total)
      const totalPage = Math.ceil(total / limit)
      if (page >= totalPage) {
        return false
      }
      that.$set(that.messageData[that.activeKey].conditions, 'page', page + 1)
      that.loading = true
      const sendData = {
        cmd: 'message.fetch',
        data: that.messageData[that.activeKey].conditions
      }
      that.webSocketSend(sendData)
    },

    /**
     * 重置消息数据
     */
    resetMessageData() {
      const that = this
      that.$set(that.messageData[1].conditions, 'page', 1)
      that.$set(that.messageData[1], 'init', true)
      that.$set(that.messageData[1], 'total', 0)
      that.$set(that.messageData[1], 'list', [])
      that.$set(that.messageData[2].conditions, 'page', 1)
      that.$set(that.messageData[2], 'init', true)
      that.$set(that.messageData[2], 'total', 0)
      that.$set(that.messageData[2], 'list', [])
      that.$set(that.messageData[3].conditions, 'page', 1)
      that.$set(that.messageData[3], 'init', true)
      that.$set(that.messageData[3], 'total', 0)
      that.$set(that.messageData[3], 'list', [])
      if (App.pages && App.pages['/system/message']) {
        App.pages['/system/message'].getList()
      }
    }
  }
}
</script>

<style lang="less">
.header-notice {
  display: inline-block;
  transition: all 0.3s;

  span {
    vertical-align: initial;
  }

  .notice-badge {
    color: inherit;

    .header-notice-icon {
      font-size: 16px;
      padding: 4px;
    }
  }
}

.dropdown-tabs {
  background-color: @base-bg-color;
  box-shadow: 0 2px 8px @shadow-color;
  border-radius: 4px;

  .tab-pane {
    padding: 0 24px 12px;
    min-height: 250px;
  }
}
</style>
