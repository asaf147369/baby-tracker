import { Link, useRouterState } from '@tanstack/react-router'

function getTabFromSearch(search: unknown): string | undefined {
  if (search && typeof search === 'object' && 'tab' in search) return (search as { tab?: string }).tab
  if (typeof search === 'string') return new URLSearchParams(search).get('tab') ?? undefined
  return undefined
}

export function BottomNav() {
  const { location } = useRouterState()
  const pathname = location.pathname
  const tabParam = getTabFromSearch(location.search)
  const isAdd = pathname === '/' && tabParam !== 'info'
  const isInfo = pathname === '/' && tabParam === 'info'
  const isHistory = pathname === '/history'
  const isChart = pathname === '/sleep-chart'

  return (
    <nav className="bottom-nav" role="navigation" aria-label="ניווט ראשי">
      <Link
        to="/"
        search={{}}
        className={`bottom-nav-item ${isAdd ? 'bottom-nav-item-active' : ''}`}
      >
        <span className="bottom-nav-label">הוסף</span>
      </Link>
      <Link
        to="/"
        search={{ tab: 'info' }}
        className={`bottom-nav-item ${isInfo ? 'bottom-nav-item-active' : ''}`}
      >
        <span className="bottom-nav-label">מידע</span>
      </Link>
      <Link
        to="/history"
        className={`bottom-nav-item ${isHistory ? 'bottom-nav-item-active' : ''}`}
      >
        <span className="bottom-nav-label">היסטוריה</span>
      </Link>
      <Link
        to="/sleep-chart"
        className={`bottom-nav-item ${isChart ? 'bottom-nav-item-active' : ''}`}
      >
        <span className="bottom-nav-label">גרף</span>
      </Link>
    </nav>
  )
}
