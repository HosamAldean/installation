// frontend/src/pages/Login.tsx
import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useLanguage } from '~/context/LanguageContext'

// Automatically select API URL based on environment
const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:4000'

interface LoginForm {
  username: string
  password: string
}

interface User {
  id?: number
  username?: string
  email?: string
  [key: string]: any
}

export default function Login() {
  const navigate = useNavigate()
  const { strings, language, toggleLanguage } = useLanguage()
  const [form, setForm] = useState<LoginForm>({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await axios.post<{ token: string; user: User }>(
        `${API_URL}/api/auth/login`,
        form,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        },
      )

      const { token, user } = res.data
      if (!token) throw new Error('No token returned from server')

      localStorage.setItem('accessToken', token)
      if (user) localStorage.setItem('user', JSON.stringify(user))

      toast.success(strings.success)
      navigate('/')
    } catch (err: any) {
      console.error('Login Error:', err)
      const message =
        err.response?.data?.message ||
        (err.code === 'ECONNABORTED'
          ? strings.serverTimeout
          : err.message || strings.failed)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`flex min-h-screen items-center justify-center p-4 ${
        language === 'ar'
          ? 'font-[Cairo] direction-rtl'
          : 'font-sans direction-ltr'
      } bg-gradient-to-br from-gray-50 to-blue-100 transition-colors`}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-100 transition-all duration-300"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            {strings.welcome}
          </h2>
          <button
            type="button"
            className="px-3 py-1 rounded-md border border-border bg-fill hover:bg-fill-secondary transition"
            onClick={toggleLanguage}
          >
            {strings.changeLang}
          </button>
        </div>

        <p className="text-center text-gray-500 mb-6">{strings.subtitle}</p>

        {loading && (
          <div className="text-center mb-4 text-blue-500 font-medium animate-pulse">
            {strings.loggingIn}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {strings.username}
          </label>
          <input
            type="text"
            name="username"
            placeholder={strings.usernamePlaceholder}
            className="border border-gray-300 rounded-lg w-full p-2.5 focus:ring-2 focus:ring-blue-400 focus:outline-none placeholder-gray-400"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {strings.password}
          </label>
          <input
            type="password"
            name="password"
            placeholder={strings.passwordPlaceholder}
            className="border border-gray-300 rounded-lg w-full p-2.5 focus:ring-2 focus:ring-blue-400 focus:outline-none placeholder-gray-400"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 rounded-lg text-white font-semibold shadow-md ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all duration-200'
          }`}
        >
          {loading ? strings.loggingIn : strings.button}
        </button>
      </form>
    </div>
  )
}
