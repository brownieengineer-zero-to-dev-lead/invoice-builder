import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Contractor, ContractorAdd } from '../../types/contractor';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseContractorAddParams extends RequestHook<Response<Contractor>> {
  contractor?: ContractorAdd;
}

export const useContractorAdd = ({ contractor, immediate = true, showLoader = true, onDone }: UseContractorAddParams) => {
  const asyncFn = useCallback(() => {
    if (!contractor) return Promise.resolve({ success: false });
    return getApi().addContractor(contractor);
  }, [contractor]);
  const { data, loading, execute } = useAsyncAction<Response<Contractor>>(asyncFn, { immediate, showLoader, onDone });
  return { data: data?.data, loading, execute };
};
