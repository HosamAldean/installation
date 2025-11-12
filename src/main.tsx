// src/main.tsx
import './styles/index.css'

import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { UserProvider } from '~/context/UserContext' // <-- import UserProvider

import { router } from './router'

const $container = document.querySelector('#root') as HTMLElement

createRoot($container).render(
  <React.StrictMode>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  </React.StrictMode>,
)
