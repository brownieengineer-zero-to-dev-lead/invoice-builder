import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseTawi50EmployeeRecordDeleteParams extends RequestHook<Response<unknown>> {
  id: number;
}

export const useTawi50EmployeeRecordDelete = ({ id, immediate = true, showLoader = true, onDone }: UseTawi50EmployeeRecordDeleteParams) => {
  const asyncFn = useCallback(() => getApi().deleteTawi50EmployeeRecord(id), [id]);
  const { data, loading, execute } = useAsyncAction<Response<unknown>>(asyncFn, { immediate, showLoader, onDone });
  return { data, loading, execute };
};
