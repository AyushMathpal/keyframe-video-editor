/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import axios, {
  type AxiosRequestConfig,
  type RawAxiosRequestHeaders,
} from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_HOST ?? "http://localhost:8000";

const service = axios.create({
  baseURL,
  withCredentials: true,
});

const baseRoute = "";

const request = {
  get<T, U>(
    url: string,
    params?: T,
    headers: RawAxiosRequestHeaders = {},
    responseType?: AxiosRequestConfig["responseType"],
  ): Promise<U> {
    return (async () => {
      if (!url) {
        throw new Error("URL is required");
      }

      const response = await service.get<U>(`${baseRoute}${url}`, {
        params,
        headers,
        responseType,
      });

      return response.data;
    })();
  },

  post<T, U>(
    url: string,
    data: T,
    params?: AxiosRequestConfig["params"],
    headers: RawAxiosRequestHeaders = {},
  ): Promise<U> {
    return (async () => {
      if (!url) {
        throw new Error("URL is required");
      }

      const response = await service.post<U, typeof service.defaults, T>(
        `${baseRoute}${url}`,
        data,
        {
          params,
          headers,
        },
      );

      return response.data;
    })();
  },

  put<T, U>(
    url: string,
    data: T,
    params?: AxiosRequestConfig["params"],
    headers: RawAxiosRequestHeaders = {},
  ): Promise<U> {
    return (async () => {
      if (!url) {
        throw new Error("URL is required");
      }

      const response = await service.put<U, typeof service.defaults, T>(
        `${baseRoute}${url}`,
        data,
        {
          params,
          headers,
        },
      );

      return response.data;
    })();
  },

  delete<T, U>(
    url: string,
    data?: T,
    headers: RawAxiosRequestHeaders = {},
  ): Promise<U> {
    return (async () => {
      if (!url) {
        throw new Error("URL is required");
      }

      const response = await service.delete<U>(`${baseRoute}${url}`, {
        data,
        headers,
      });

      return response.data;
    })();
  },
};

const getFullEndpoint = (endpoint: string) => {
  return `${baseURL}${baseRoute}${endpoint}`;
};

export default request;
export { getFullEndpoint };
