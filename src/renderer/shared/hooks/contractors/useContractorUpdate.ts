import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Contractor, ContractorUpdate } from '../../types/contractor';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseContractorUpdateParams extends RequestHook<Response<Contractor>> {
  contractor?: ContractorUpdate;
}

export const useContractorUpdate = ({ contractor, immediate = true, showLoader = true, onDone }: UseContractorUpdateParams) => {
  const asyncFn = useCallback(() => {
    if (!contractor) return Promise.resolve({ success: false });
    return getApi().updateContractor(contractor);
  }, [contractor]);
  const { data, loading, execute } = useAsyncAction<Response<Contractor>>(asyncFn, { immediate, showLoader, onDone });
  return { data: data?.data, loading, execute };
};
