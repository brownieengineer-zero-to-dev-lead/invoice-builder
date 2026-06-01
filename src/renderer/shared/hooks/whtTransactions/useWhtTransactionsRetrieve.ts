import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { WhtTransaction } from '../../types/whtTransaction';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseWhtTransactionsRetrieveParams extends RequestHook<Response<WhtTransaction[]>> {
  filter?: { contractorId?: number; pndType?: string; month?: number; year?: number };
}

export const useWhtTransactionsRetrieve = ({ showLoader = true, immediate = true, filter, onDone }: UseWhtTransactionsRetrieveParams) => {
  const asyncFn = useCallback(() => getApi().getAllWhtTransactions(filter), [filter]);
  const { data: transactions, execute } = useAsyncAction<Response<WhtTransaction[]>>(asyncFn, { showLoader, immediate, onDone });
  return { transactions: transactions?.data ?? [], execute };
};
