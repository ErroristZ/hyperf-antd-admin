//跨域代理前缀
// const API_PROXY_PREFIX = '/api'
// const BASE_URL = process.env.NODE_ENV === 'production' ? process.env.VUE_APP_API_BASE_URL : API_PROXY_PREFIX

const BASE_URL = process.env.VUE_APP_API_BASE_URL
// const BASE_URL = process.env.VUE_APP_API_BASE_URL
module.exports = {
  LOGIN: `${BASE_URL}/staff/login`,
  USERINFO: `${BASE_URL}/staff/initialization`,
  ROUTES: `${BASE_URL}/staff/routers`,
  GOODS: `${BASE_URL}/goods`,
  GOODS_COLUMNS: `${BASE_URL}/columns`,
  WELCOME: `${BASE_URL}/staff/welcome`,
  ROLE: `${BASE_URL}/staff/role`,
  USER: `${BASE_URL}/staff/user`,
  MENU: `${BASE_URL}/staff/menu`,
  Log: `${BASE_URL}/staff/log`,
  MESSAGE: `${BASE_URL}/staff/message`,

  UPLOAD_PIC: `${BASE_URL}/index/file/upload`,

  SOCKET_MESSAGE: `ws://swoole.io:80/message` //websocket消息通知
}
