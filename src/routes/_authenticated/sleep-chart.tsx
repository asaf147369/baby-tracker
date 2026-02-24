import { createRoute } from '@tanstack/react-router'
import { authenticatedRoute } from '../_authenticated'
import { SleepChartPage } from '../../pages/SleepChartPage'

export const sleepChartRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/sleep-chart',
  component: SleepChartPage,
})
