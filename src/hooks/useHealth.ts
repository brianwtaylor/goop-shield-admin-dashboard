import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getHealth } from '../api/endpoints';

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    refetchInterval: 10_000,
    placeholderData: keepPreviousData,
  });
}
