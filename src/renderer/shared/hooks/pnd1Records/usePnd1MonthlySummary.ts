import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Pnd1MonthlySummary } from '../../types/pnd1Record';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UsePnd1MonthlySummaryParams extends RequestHook<Response<Pnd1MonthlySummary>> {
  filter?: { month: number; year: number; businessId: number };
}

export const usePnd1MonthlySummary = ({ showLoader = true, immediate = false, filter, onDone }: UsePnd1MonthlySummaryParams) => {
  const asyncFn = useCallback(
    () => filter ? getApi().getPnd1MonthlySummary(filter) : Promise.resolve({ success: false } as Response<Pnd1MonthlySummary>),
    [filter?.month, filter?.year, filter?.businessId]
  );
  const { data, execute } = useAsyncAction<Response<Pnd1MonthlySummary>>(asyncFn, { showLoader, immediate: immediate && !!filter, onDone });
  return { summary: data?.data ?? null, execute };
};
