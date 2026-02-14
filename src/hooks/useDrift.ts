import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getDriftReport } from '../api/endpoints';

export function useDrift() {
  return useQuery({
    queryKey: ['drift-report'],
    queryFn: getDriftReport,
    refetchInterval: 60_000,
    placeholderData: keepPreviousData,
  });
}
