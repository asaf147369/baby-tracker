import { rootRoute } from './routes/__root'
import { loginRoute } from './routes/login'
import { authenticatedRoute } from './routes/_authenticated'
import { indexRoute } from './routes/_authenticated/index'
import { historyRoute } from './routes/_authenticated/history'

const authenticatedRouteWithChildren = authenticatedRoute.addChildren([
  indexRoute,
  historyRoute,
])

export const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRouteWithChildren,
])
