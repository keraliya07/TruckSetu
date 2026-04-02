import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import * as returnLoadApi from '../api/returnLoad.api';
import { useSocket } from './useSocket';

export function useReturnLoad({ tripId, status = 'PENDING' } = {}) {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [hasNewMatches, setHasNewMatches] = useState(false);

  const query = useQuery({
    queryKey: ['return-loads', { tripId: tripId || '', status }],
    queryFn: () =>
      returnLoadApi.getReturnLoadMatches({
        ...(tripId ? { tripId } : {}),
        ...(status ? { status } : {}),
      }),
    staleTime: 30000,
  });

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const handleAvailable = (payload) => {
      if (!tripId || payload?.tripId === tripId) {
        setHasNewMatches(true);
        query.refetch().catch(() => {});
      }
    };

    socket.on('returnLoad:available', handleAvailable);

    return () => {
      socket.off('returnLoad:available', handleAvailable);
    };
  }, [query, socket, tripId]);

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['return-loads'],
    });
    setHasNewMatches(false);
  };

  const acceptMutation = useMutation({
    mutationFn: (matchId) => returnLoadApi.acceptReturnLoad(matchId),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: (matchId) => returnLoadApi.rejectReturnLoad(matchId),
    onSuccess: invalidate,
  });

  return {
    acceptMatch: acceptMutation.mutateAsync,
    acceptedResult: acceptMutation.data,
    hasNewMatches,
    isAccepting: acceptMutation.isPending,
    isLoading: query.isLoading,
    isRefetching: query.isFetching,
    isRejecting: rejectMutation.isPending,
    matches: query.data?.matches || [],
    refetch: query.refetch,
    rejectMatch: rejectMutation.mutateAsync,
    setHasNewMatches,
    error:
      query.error?.message ||
      acceptMutation.error?.message ||
      rejectMutation.error?.message ||
      '',
  };
}
