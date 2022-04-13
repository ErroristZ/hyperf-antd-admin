import routerMap from './router.map'
import { parseRoutes } from '@/utils/routerUtil'

// 异步路由配置
const routesConfig = [
  'login',
  {
    router: 'exp404',
    path: '*',
    name: '404'
  },
  {
    router: 'exp403',
    path: '/403',
    name: '403'
  },
  {
    router: 'root',
    children: [
      {
        router: 'dashboard',
        children: ['workplace', 'analysis']
      }
    ]
  }
]

const options = {
  routes: parseRoutes(routesConfig, routerMap)
}

export default options
