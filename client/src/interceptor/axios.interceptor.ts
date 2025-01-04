import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { getLocalStorageToken } from '../utils'
// import { errorAlertWithTimer } from '../component/alerts/Alerts'

export const AxiosInterceptor = () => {
  const updateHeaders = (config: AxiosRequestConfig) => {
    const token = getLocalStorageToken()
    const newHeaders = {
      Authorization: `Bearer ${token}`,
    }
    config.headers = newHeaders
    return config
  }
  axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (config.url?.includes('login')) {
      return config
    }
    return updateHeaders(config) as InternalAxiosRequestConfig
  })

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      return error.response.data.message.split('::')[1]
    }
  )
}
