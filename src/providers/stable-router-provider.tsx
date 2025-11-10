import { useLayoutEffect } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'

import { setNavigate, setRoute } from '~/atoms/route'

declare global {
  export const router: {
    navigate: NavigateFunction
  }
  interface Window {
    router: typeof router
  }
}
window.router = {
  navigate() {},
}

export const StableRouterProvider = () => {
  const [searchParams] = useSearchParams()
  const params = useParams()
  const nav = useNavigate()
  const location = useLocation()

  useLayoutEffect(() => {
    window.router.navigate = nav

    setRoute({
      params,
      searchParams,
      location,
    })
    setNavigate({ fn: nav })
  }, [searchParams, params, location, nav])

  return null
}
