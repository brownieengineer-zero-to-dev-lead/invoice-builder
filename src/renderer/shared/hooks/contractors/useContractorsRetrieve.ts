import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Contractor } from '../../types/contractor';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseContractorsRetrieveParams extends RequestHook<Response<Contractor[]>> {
  showArchived?: boolean;
}

export const useContractorsRetrieve = ({ showLoader = true, immediate = true, showArchived, onDone }: UseContractorsRetrieveParams) => {
  const asyncFn = useCallback(() => getApi().getAllContractors(showArchived), [showArchived]);
  const { data: contractors, execute } = useAsyncAction<Response<Contractor[]>>(asyncFn, { showLoader, immediate, onDone });
  return { contractors: contractors?.data ?? [], execute };
};
