import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Tawi50EmployeeRecord, Tawi50EmployeeRecordAdd } from '../../types/tawi50EmployeeRecord';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseTawi50EmployeeRecordAddParams extends RequestHook<Response<Tawi50EmployeeRecord>> {
  record?: Tawi50EmployeeRecordAdd;
}

export const useTawi50EmployeeRecordAdd = ({ record, immediate = true, showLoader = true, onDone }: UseTawi50EmployeeRecordAddParams) => {
  const asyncFn = useCallback(() => {
    if (!record) return Promise.resolve({ success: false });
    return getApi().addTawi50EmployeeRecord(record);
  }, [record]);
  const { data, loading, execute } = useAsyncAction<Response<Tawi50EmployeeRecord>>(asyncFn, { immediate, showLoader, onDone });
  return { data: data?.data, loading, execute };
};
