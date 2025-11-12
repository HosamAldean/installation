// src/App.tsx
import type { FC } from 'react'
import { Outlet } from 'react-router-dom'

import { Footer } from './components/common/Footer'
import { RootProviders } from './providers/root-providers'

export const App: FC = () => {
  return (
    <RootProviders>
      <Outlet />
      <Footer />
    </RootProviders>
  )
}

export default App
