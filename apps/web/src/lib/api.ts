const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
  [key: string]: any;
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sih_auth_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      let errorMsg = data.message || `HTTP error: ${res.status}`;
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        const detailStr = data.errors
          .map((e: any) => (typeof e === 'string' ? e : e.message || JSON.stringify(e)))
          .join('\n• ');
        errorMsg += `:\n• ${detailStr}`;
      }
      throw new Error(errorMsg);
    }

    return data;
  } catch (err: any) {
    console.error(`[API_FETCH_ERROR] ${endpoint}:`, err);
    throw err;
  }
}

