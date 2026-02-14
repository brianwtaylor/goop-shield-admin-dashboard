import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getSupplyChainReport } from '../api/endpoints';

export function useSupplyChain() {
  return useQuery({
    queryKey: ['supply-chain'],
    queryFn: getSupplyChainReport,
    refetchInterval: 120_000,
    placeholderData: keepPreviousData,
  });
}
