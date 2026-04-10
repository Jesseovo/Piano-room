import ky from "ky";

const api = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 15000,
  hooks: {
    beforeRequest: [
      (request) => {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token");
          if (token) {
            request.headers.set("Authorization", `Bearer ${token}`);
          }
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401 && typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      },
    ],
  },
});

export interface ApiResult<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

export interface PageData<T> {
  total: number;
  rows: T[];
}

export async function get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<ApiResult<T>> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== "") {
        searchParams.set(key, String(val));
      }
    });
  }
  return api.get(path, { searchParams }).json<ApiResult<T>>();
}

export async function post<T>(path: string, body?: unknown): Promise<ApiResult<T>> {
  return api.post(path, { json: body }).json<ApiResult<T>>();
}

export async function put<T>(path: string, body?: unknown): Promise<ApiResult<T>> {
  return api.put(path, { json: body }).json<ApiResult<T>>();
}

export async function del<T>(path: string, body?: unknown): Promise<ApiResult<T>> {
  return api.delete(path, { json: body }).json<ApiResult<T>>();
}

export default api;
