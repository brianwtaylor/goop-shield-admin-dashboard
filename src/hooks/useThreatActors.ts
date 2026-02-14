import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getThreatActors } from '../api/endpoints';

export function useThreatActors() {
  return useQuery({
    queryKey: ['threat-actors'],
    queryFn: getThreatActors,
    refetchInterval: 60_000,
    placeholderData: keepPreviousData,
  });
}
