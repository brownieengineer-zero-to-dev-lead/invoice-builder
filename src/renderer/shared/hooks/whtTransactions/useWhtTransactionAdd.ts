import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { WhtTransaction, WhtTransactionAdd } from '../../types/whtTransaction';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseWhtTransactionAddParams extends RequestHook<Response<WhtTransaction>> {
  transaction?: WhtTransactionAdd;
}

export const useWhtTransactionAdd = ({ transaction, immediate = true, showLoader = true, onDone }: UseWhtTransactionAddParams) => {
  const asyncFn = useCallback(() => {
    if (!transaction) return Promise.resolve({ success: false });
    return getApi().addWhtTransaction(transaction);
  }, [transaction]);
  const { data, loading, execute } = useAsyncAction<Response<WhtTransaction>>(asyncFn, { immediate, showLoader, onDone });
  return { data: data?.data, loading, execute };
};
