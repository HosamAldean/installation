// src/components/profile/AvatarUpload.tsx
import * as React from 'react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '~/components/ui/button/Button'
import { useLanguage } from '~/context/LanguageContext'

type Props = {
  initial?: string
  onSaved?: (avatarUrl: string) => void
  accessToken?: string
}

export const AvatarUpload: React.FC<Props> = ({
  initial,
  onSaved,
  accessToken,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [preview, setPreview] = useState<string | undefined>(initial)
  const [loading, setLoading] = useState(false)
  const { strings } = useLanguage()
  const base =
    import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
    'http://192.168.20.157:4000'

  // Ensure preview is always a full URL
  const getFullUrl = (url: string) => {
    if (!url.startsWith('http'))
      return `${base}${url.startsWith('/') ? '' : '/'}${url}`
    return url
  }

  // Fetch avatar if missing
  useEffect(() => {
    if (!accessToken) return // only fetch if token exists
    if (preview) return // skip if already have preview

    let cancelled = false

    const fetchAvatar = async () => {
      try {
        const res = await fetch(`${base}/api/users/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (!res.ok) return
        const json = await res.json()
        if (!cancelled && json.avatarUrl) setPreview(getFullUrl(json.avatarUrl))
      } catch (err) {
        console.error('Failed to fetch avatar', err)
      }
    }

    fetchAvatar()

    return () => {
      cancelled = true // cancel if component unmounts
    }
  }, [accessToken]) // only run when accessToken changes

  const openFilePicker = () => inputRef.current?.click()

  const handleFile = async (file?: File) => {
    if (!file || !accessToken) return

    setLoading(true)
    try {
      const form = new FormData()
      form.append('avatar', file)

      const res = await fetch(`${base}/api/upload-avatar`, {
        method: 'POST',
        body: form,
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (!res.ok) throw new Error(await res.text())

      const json = await res.json()
      const avatarUrl = json?.avatarUrl
      if (avatarUrl) {
        setPreview(getFullUrl(avatarUrl))
        onSaved?.(getFullUrl(avatarUrl))
      }
    } catch (err) {
      console.error('Avatar upload failed', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full overflow-hidden bg-fill flex items-center justify-center">
        {preview ? (
          <img
            src={preview}
            alt="avatar"
            className="w-full h-full object-cover"
            onError={() => setPreview(undefined)}
          />
        ) : (
          <span className="text-sm text-zinc-700">No</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="hidden"
        />
        <Button onClick={openFilePicker} variant="ghost" className="px-3 py-1">
          {loading ? 'Uploading...' : strings.changeAvatar}
        </Button>
      </div>
    </div>
  )
}

export default AvatarUpload
