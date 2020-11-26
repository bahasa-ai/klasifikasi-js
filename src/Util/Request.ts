import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

export function createRequest(baseURL: string, headers?: { [key: string]: any }, config?: AxiosRequestConfig): AxiosInstance {
  return axios.create({
    baseURL,
    timeout: 15000,
    headers: {
      ['Content-Type']: 'application/json',
      ['Accept']: 'application/json',
      ...headers
    },
    ...config
  })
}
