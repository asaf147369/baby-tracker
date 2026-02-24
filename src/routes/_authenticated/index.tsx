import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from '../_authenticated'
import { HomePage } from '../../pages/HomePage'

export const indexRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  validateSearch: (s: Record<string, unknown>) => ({ tab: typeof s?.tab === 'string' ? s.tab : undefined }),
  component: HomePage,
})
