import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Employee } from '../../types/employee';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseEmployeesRetrieveParams extends RequestHook<Response<Employee[]>> {
  showArchived?: boolean;
}

export const useEmployeesRetrieve = ({
  showLoader = true,
  immediate = true,
  showArchived,
  onDone
}: UseEmployeesRetrieveParams) => {
  const asyncFn = useCallback(() => getApi().getAllEmployees(showArchived), [showArchived]);
  const { data: employees, execute } = useAsyncAction<Response<Employee[]>>(asyncFn, {
    showLoader,
    immediate,
    onDone
  });
  return { employees: employees?.data ?? [], execute };
};
