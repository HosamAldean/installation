// src/components/profile/ProfileDropdown.tsx
import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '~/components/ui/button/Button'
import { useLanguage } from '~/context/LanguageContext'

export type UserInfo = {
  username?: string
  firstName?: string
  lastName?: string
  email?: string
  avatar?: string
  avatarUrl?: string
}

const SERVER_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
  'http://192.168.20.157:4000'

type Props = {
  user?: UserInfo | null
}

export const ProfileDropdown: React.FC<Props> = ({ user: userProp }) => {
  const { strings, language } = useLanguage()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  const isRTL = language === 'ar'

  /** Use userProp directly without local state to avoid setState inside effect */
  const user = userProp

  /** ✅ Unified avatar logic */
  const getAvatarUrl = (user?: UserInfo | null) => {
    const url = user?.avatarUrl || user?.avatar
    if (!url) return '/default-avatar.png'
    if (url.startsWith('http')) return url
    return `${SERVER_URL}/${url.replace(/^\/+/, '')}`
  }

  /** Close dropdown when clicking outside */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  /** Logout handler */
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  /** Dropdown display name */
  const displayName = user?.firstName || user?.username || 'Guest'

  /** Dropdown position (responsive & RTL) */
  const [dropdownPositionClass, setDropdownPositionClass] = useState('')
  useEffect(() => {
    const updatePosition = () => {
      const isMobile = window.innerWidth < 1024
      setDropdownPositionClass(
        isMobile
          ? isRTL
            ? 'left-0 origin-top-left'
            : 'right-0 origin-top-right'
          : isRTL
            ? 'right-0 origin-top-right'
            : 'left-0 origin-top-left',
      )
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
  }, [isRTL])

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-2 rounded-md hover:bg-fill px-2 py-1 transition"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-fill flex items-center justify-center">
          <img
            src={getAvatarUrl(user)}
            alt="avatar"
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
          />
        </div>
        <i
          className={`i-mingcute-down-line w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className={`absolute mt-2 w-64 bg-white dark:bg-zinc-900 border dark:border-zinc-700 rounded-md shadow-lg p-3 z-50 ${dropdownPositionClass}`}
        >
          <div className="flex flex-col items-center mb-3">
            <div className="w-20 h-20 rounded-full overflow-hidden border border-zinc-300 dark:border-zinc-700">
              <img
                src={getAvatarUrl(user)}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
              />
            </div>
            <div className="mt-2 text-sm font-medium">{displayName}</div>
            <div className="text-xs text-zinc-500">{user?.email}</div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => navigate('/profile')}
              variant="ghost"
              className="justify-start"
            >
              {strings.profile}
            </Button>
            <Button
              onClick={() => navigate('/settings')}
              variant="ghost"
              className="justify-start"
            >
              {strings.settings}
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="justify-start"
            >
              {strings.logout}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
