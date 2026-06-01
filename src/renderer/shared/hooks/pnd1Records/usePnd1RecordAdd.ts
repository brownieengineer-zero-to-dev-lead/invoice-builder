import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Pnd1Record, Pnd1RecordAdd } from '../../types/pnd1Record';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UsePnd1RecordAddParams extends RequestHook<Response<Pnd1Record>> {
  record?: Pnd1RecordAdd;
}

export const usePnd1RecordAdd = ({ record, immediate = true, showLoader = true, onDone }: UsePnd1RecordAddParams) => {
  const asyncFn = useCallback(() => {
    if (!record) return Promise.resolve({ success: false });
    return getApi().addPnd1Record(record);
  }, [record]);
  const { data, loading, execute } = useAsyncAction<Response<Pnd1Record>>(asyncFn, { immediate, showLoader, onDone });
  return { data: data?.data, loading, execute };
};
