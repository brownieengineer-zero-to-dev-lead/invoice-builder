import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UsePnd1RecordDeleteParams extends RequestHook<Response<unknown>> {
  id: number;
}

export const usePnd1RecordDelete = ({ id, immediate = true, showLoader = true, onDone }: UsePnd1RecordDeleteParams) => {
  const asyncFn = useCallback(() => getApi().deletePnd1Record(id), [id]);
  const { data, loading, execute } = useAsyncAction<Response<unknown>>(asyncFn, { immediate, showLoader, onDone });
  return { data, loading, execute };
};
