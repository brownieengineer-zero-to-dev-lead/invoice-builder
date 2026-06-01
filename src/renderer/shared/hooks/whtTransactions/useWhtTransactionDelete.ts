import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseWhtTransactionDeleteParams extends RequestHook<Response<unknown>> {
  id: number;
}

export const useWhtTransactionDelete = ({ id, immediate = true, showLoader = true, onDone }: UseWhtTransactionDeleteParams) => {
  const asyncFn = useCallback(() => getApi().deleteWhtTransaction(id), [id]);
  const { data, loading, execute } = useAsyncAction<Response<unknown>>(asyncFn, { immediate, showLoader, onDone });
  return { data, loading, execute };
};
