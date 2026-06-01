import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { WhtTransaction, WhtTransactionUpdate } from '../../types/whtTransaction';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseWhtTransactionUpdateParams extends RequestHook<Response<WhtTransaction>> {
  transaction?: WhtTransactionUpdate;
}

export const useWhtTransactionUpdate = ({ transaction, immediate = true, showLoader = true, onDone }: UseWhtTransactionUpdateParams) => {
  const asyncFn = useCallback(() => {
    if (!transaction) return Promise.resolve({ success: false });
    return getApi().updateWhtTransaction(transaction);
  }, [transaction]);
  const { data, loading, execute } = useAsyncAction<Response<WhtTransaction>>(asyncFn, { immediate, showLoader, onDone });
  return { data: data?.data, loading, execute };
};
