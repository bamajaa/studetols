const API_BASE = '';

export function getToken(): string | null {
  return localStorage.getItem('studetols_token');
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res: Response) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
  return data;
}

export const api = {
  get: async (url: string) => {
    const res = await fetch(API_BASE + url, { headers: authHeaders() });
    return handleResponse(res);
  },
  post: async (url: string, body?: any) => {
    const res = await fetch(API_BASE + url, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
  put: async (url: string, body?: any) => {
    const res = await fetch(API_BASE + url, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
  delete: async (url: string) => {
    const res = await fetch(API_BASE + url, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse(res);
  },
};
