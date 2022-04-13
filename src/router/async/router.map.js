// 视图组件
const view = {
  tabs: () => import('@/layouts/tabs'),
  blank: () => import('@/layouts/BlankView'),
  page: () => import('@/layouts/PageView')
}

// 路由组件注册
const routerMap = {
  login: {
    authority: '*',
    name: '登录',
    path: '/login',
    component: () => import('@/pages/login')
  },
  exp403: {
    authority: '*',
    name: 'exp403',
    path: '403',
    component: () => import('@/pages/exception/403')
  },
  exp404: {
    authority: '*',
    name: 'exp404',
    path: '404',
    component: () => import('@/pages/exception/404')
  },
  exp500: {
    authority: '*',
    name: 'exp500',
    path: '500',
    component: () => import('@/pages/exception/500')
  },
  root: {
    path: '/',
    name: '首页',
    redirect: '/login',
    component: view.tabs
  },
  dashboard: {
    path: 'dashboard',
    name: '控制台',
    meta: {
      icon: 'dashboard'
    },
    component: view.blank
  },
  workplace: {
    path: 'workplace',
    name: '工作台',
    meta: {
      page: {
        closable: false
      }
    },
    component: () => import('@/pages/dashboard/workplace')
  },
  analysis: {
    path: 'analysis',
    name: '分析页',
    component: () => import('@/pages/dashboard/analysis')
  }
}
export default routerMap
