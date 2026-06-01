import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Employee, EmployeeUpdate } from '../../types/employee';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseEmployeeUpdateParams extends RequestHook<Response<Employee>> {
  employee?: EmployeeUpdate;
}

export const useEmployeeUpdate = ({ employee, immediate = true, showLoader = true, onDone }: UseEmployeeUpdateParams) => {
  const asyncFn = useCallback(() => {
    if (!employee) return Promise.resolve({ success: false });
    return getApi().updateEmployee(employee);
  }, [employee]);

  const { data, loading, execute } = useAsyncAction<Response<Employee>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data: data?.data, loading, execute };
};
