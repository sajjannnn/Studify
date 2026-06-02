import axios from "axios"
import { API_BASE_URL } from "./constants"

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("studify-token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("studify-token")
      localStorage.removeItem("studify-user")
      window.location.href = "/auth/login"
    }
    return Promise.reject(error)
  },
)

export default apiClient
