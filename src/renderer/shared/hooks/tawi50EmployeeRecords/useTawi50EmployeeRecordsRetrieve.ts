import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Tawi50EmployeeRecord } from '../../types/tawi50EmployeeRecord';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseTawi50EmployeeRecordsRetrieveParams extends RequestHook<Response<Tawi50EmployeeRecord[]>> {
  filter?: { employeeId?: number; taxYear?: number };
}

export const useTawi50EmployeeRecordsRetrieve = ({ showLoader = true, immediate = true, filter, onDone }: UseTawi50EmployeeRecordsRetrieveParams) => {
  const asyncFn = useCallback(() => getApi().getAllTawi50EmployeeRecords(filter), [filter]);
  const { data: records, execute } = useAsyncAction<Response<Tawi50EmployeeRecord[]>>(asyncFn, { showLoader, immediate, onDone });
  return { records: records?.data ?? [], execute };
};
