import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const data = await res.json();
      throw new Error(data.message || `${res.status}: ${res.statusText}`);
    } catch (e) {
      if (e instanceof Error) {
        throw e;
      }
      // If we can't parse JSON, just use the status text
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest(
  url: string,
  options?: RequestInit
): Promise<Response> {
  console.log(`Making API request: ${options?.method || 'GET'} ${url}`);
  
  try {
    const res = await fetch(url, {
      ...options,
      credentials: "include",
    });
    
    // Throw for bad responses
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API request failed: ${options?.method || 'GET'} ${url}`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
