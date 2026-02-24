import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from '../_authenticated'
import { HomePage } from '../../pages/HomePage'

export const indexRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  component: HomePage,
})
