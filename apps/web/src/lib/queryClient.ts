import { QueryClient } from '@tanstack/react-query';

/** The app's one query cache. Cleared on sign-out so the next person never sees someone else's data. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
  },
});
