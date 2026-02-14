import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getBroRLWeights } from '../api/endpoints';

export function useBroRL() {
  return useQuery({
    queryKey: ['brorl-weights'],
    queryFn: getBroRLWeights,
    refetchInterval: 60_000,
    placeholderData: keepPreviousData,
  });
}
