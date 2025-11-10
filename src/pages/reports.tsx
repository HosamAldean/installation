import React from 'react'
import { useLanguage } from '~/context/LanguageContext'

export default function Reports() {
  const { strings } = useLanguage()
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">{strings.reports}</h1>
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border dark:border-zinc-700">
          Reports page placeholder.
        </div>
      </div>
    </div>
  )
}