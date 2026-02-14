import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getAuditEvents } from '../api/endpoints';

export function useAuditEvents(params?: {
  limit?: number;
  offset?: number;
  action?: string;
  classification?: string;
}) {
  return useQuery({
    queryKey: ['audit-events', params],
    queryFn: () => getAuditEvents(params),
    refetchInterval: 30_000,
    placeholderData: keepPreviousData,
  });
}
