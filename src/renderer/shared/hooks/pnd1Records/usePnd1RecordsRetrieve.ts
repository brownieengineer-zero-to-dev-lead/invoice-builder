import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Pnd1Record } from '../../types/pnd1Record';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UsePnd1RecordsRetrieveParams extends RequestHook<Response<Pnd1Record[]>> {
  filter?: { employeeId?: number; month?: number; year?: number };
}

export const usePnd1RecordsRetrieve = ({ showLoader = true, immediate = true, filter, onDone }: UsePnd1RecordsRetrieveParams) => {
  const asyncFn = useCallback(() => getApi().getAllPnd1Records(filter), [filter]);
  const { data: records, execute } = useAsyncAction<Response<Pnd1Record[]>>(asyncFn, { showLoader, immediate, onDone });
  return { records: records?.data ?? [], execute };
};
