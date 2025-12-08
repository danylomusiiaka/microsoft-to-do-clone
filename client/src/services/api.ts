import Axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import Cookies from "js-cookie";

import { backendUrl } from "@/constants/app-config";

class ApiService {
  private getHeaders(customHeaders: any = {}) {
    const token = Cookies.get("token");
    return {
      Authorization: `Bearer ${token}`,
      ...customHeaders,
    };
  }

  private async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    url: string,
    data: any = null,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<any>> {
    try {
      const response = await Axios({
        method,
        url: `${backendUrl}${url}`,
        data,
        headers: this.getHeaders(config.headers),
        ...config,
      });

      return response;
    } catch (error: any) {
      const status = error.response?.status || error.status;

      if (status === 401) {
        try {
          const oldToken = Cookies.get("token");

          const refreshResponse = await Axios.get(`${backendUrl}/user/refresh`, {
            headers: { Authorization: `Bearer ${oldToken}` },
          });

          if (refreshResponse.status === 200) {
            const { token: newToken } = refreshResponse.data;

            Cookies.set("token", newToken, {
              secure: true,
              sameSite: "None",
            });

            return await this.request<T>(method, url, data, config);
          }
        } catch (refreshError) {
          console.error("Session expired, redirecting...", refreshError);
          Cookies.remove("token");
          window.location.href = "/auth";
        }
      } else {
        Cookies.remove("token");
        window.location.href = "/auth";
      }

      throw error;
    }
  }

  public async get<T>(url: string, config: AxiosRequestConfig = {}) {
    return this.request<T>("GET", url, null, config);
  }

  public async post<T>(url: string, data: any, config: AxiosRequestConfig = {}) {
    return this.request<T>("POST", url, data, config);
  }

  public async put<T>(url: string, data: any, config: AxiosRequestConfig = {}) {
    return this.request<T>("PUT", url, data, config);
  }

  public async delete<T>(url: string, config: AxiosRequestConfig = {}) {
    return this.request<T>("DELETE", url, null, config);
  }
}

export const api = new ApiService();
