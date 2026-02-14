import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getRedTeamResults, postRedTeamProbe } from '../api/endpoints';

export function useRedTeamResults() {
  return useQuery({
    queryKey: ['redteam-results'],
    queryFn: getRedTeamResults,
    refetchInterval: 60_000,
    placeholderData: keepPreviousData,
  });
}

export function useRedTeamProbe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (names?: string[]) => postRedTeamProbe(names),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redteam-results'] });
    },
  });
}
