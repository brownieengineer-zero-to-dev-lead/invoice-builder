import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseContractorDeleteParams extends RequestHook<Response<unknown>> {
  id: number;
}

export const useContractorDelete = ({ id, immediate = true, showLoader = true, onDone }: UseContractorDeleteParams) => {
  const asyncFn = useCallback(() => getApi().deleteContractor(id), [id]);
  const { data, loading, execute } = useAsyncAction<Response<unknown>>(asyncFn, { immediate, showLoader, onDone });
  return { data, loading, execute };
};
