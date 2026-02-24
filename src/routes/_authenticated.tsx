import { createRoute, Outlet, redirect } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { auth } from '../lib/firebase'
import { BottomNav } from '../components/BottomNav'

export const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  beforeLoad: async () => {
    await auth.authStateReady()
    if (!auth.currentUser) {
      throw redirect({ to: '/login' })
    }
  },
  component: () => (
    <>
      <Outlet />
      <BottomNav />
    </>
  ),
})
