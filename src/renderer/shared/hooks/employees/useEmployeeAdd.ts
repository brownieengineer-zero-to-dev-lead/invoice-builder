import { useCallback } from 'react';
import { getApi } from '../../api/restApi';
import type { Employee, EmployeeAdd } from '../../types/employee';
import type { RequestHook } from '../../types/requestHook';
import type { Response } from '../../types/response';
import { useAsyncAction } from '../ayncAction/useAsyncAction';

interface UseEmployeeAddParams extends RequestHook<Response<Employee>> {
  employee?: EmployeeAdd;
}

export const useEmployeeAdd = ({ employee, immediate = true, showLoader = true, onDone }: UseEmployeeAddParams) => {
  const asyncFn = useCallback(() => {
    if (!employee) return Promise.resolve({ success: false });
    return getApi().addEmployee(employee);
  }, [employee]);

  const { data, loading, execute } = useAsyncAction<Response<Employee>>(asyncFn, {
    immediate,
    showLoader,
    onDone
  });

  return { data: data?.data, loading, execute };
};
