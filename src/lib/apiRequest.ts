// src/lib/apiRequest.ts
import axios from 'axios'

const apiRequest = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
    'http://192.168.20.157:4000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default apiRequest
