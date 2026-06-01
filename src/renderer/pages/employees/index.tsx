import { useCallback, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CRUDPage } from '../../shared/components/layout/crudPage/CRUDPage';
import { FilterType } from '../../shared/enums/filterType';
import { useEmployeeAdd } from '../../shared/hooks/employees/useEmployeeAdd';
import { useEmployeeDelete } from '../../shared/hooks/employees/useEmployeeDelete';
import { useEmployeesRetrieve } from '../../shared/hooks/employees/useEmployeesRetrieve';
import { useEmployeeUpdate } from '../../shared/hooks/employees/useEmployeeUpdate';
import type { Employee, EmployeeAdd, EmployeeUpdate } from '../../shared/types/employee';
import type { FilterData } from '../../shared/types/filter';
import type { Response } from '../../shared/types/response';
import { createCommonFilters } from '../../shared/utils/filterSortFunctions';
import { Form } from './Form';
import { List } from './List';

const filterToShowArchived = (filter?: FilterData[]): boolean | undefined => {
  const type = filter?.[0]?.type;
  if (type === FilterType.archived) return true;
  if (type === FilterType.active) return false;
  return undefined;
};

export const EmployeesPage: FC = () => {
  const { t } = useTranslation();

  const filters = createCommonFilters({ t, namespace: 'employees', initial: FilterType.active });

  const useRetrieve = useCallback(
    (args: { filter?: FilterData[]; onDone?: (data: Response<Employee[]>) => void }) => {
      const showArchived = filterToShowArchived(args.filter);
      const { employees, execute } = useEmployeesRetrieve({ showArchived, onDone: args.onDone });
      return { items: employees, execute };
    },
    []
  );

  const useAdd = useCallback(
    (args: { item?: EmployeeAdd; immediate?: boolean; onDone?: (data: Response<Employee>) => void }) => {
      const { data, execute } = useEmployeeAdd({ employee: args.item, immediate: args.immediate, onDone: args.onDone });
      return { data, execute };
    },
    []
  );

  const useUpdate = useCallback(
    (args: { item?: EmployeeUpdate; immediate?: boolean; onDone?: (data: Response<Employee>) => void }) => {
      const { execute } = useEmployeeUpdate({ employee: args.item, immediate: args.immediate, onDone: args.onDone });
      return { execute };
    },
    []
  );

  const useDelete = useCallback(
    (args: { id: number; immediate?: boolean; onDone?: (data: Response<unknown>) => void }) => {
      const { execute } = useEmployeeDelete({ id: args.id, immediate: args.immediate, onDone: args.onDone });
      return { execute };
    },
    []
  );

  return (
    <CRUDPage<Employee, EmployeeAdd, EmployeeUpdate>
      componentId="employees"
      leftTitle="พนักงาน"
      title="พนักงาน"
      noItemText="ไม่พบพนักงาน"
      noItemButtonText="เพิ่มพนักงาน"
      searchField="name"
      filters={filters}
      sortOptions={[
        { label: 'ชื่อ', value: 'name' },
        { label: 'เงินเดือน', value: 'baseSalary' }
      ]}
      validateAndNormalize={async data => {
        const employee = data as EmployeeAdd | EmployeeUpdate;
        if (!employee?.name?.trim() || !('taxId' in employee) || !(employee as EmployeeAdd).taxId?.trim()) return undefined;
        return employee;
      }}
      useRetrieve={useRetrieve}
      useAdd={useAdd}
      useUpdate={useUpdate}
      useDelete={useDelete}
      renderListItem={(item, selectedItem, onEdit) => (
        <List
          key={item.id}
          item={item}
          selectedItem={selectedItem}
          onEdit={onEdit}
        />
      )}
      form={({ item, onChange }) => (
        <Form
          employee={item}
          onChange={({ changedData, isFormValid }) => {
            const data: EmployeeAdd | EmployeeUpdate = item
              ? { ...changedData, id: item.id }
              : changedData;
            onChange({ changedData: data, isFormValid });
          }}
        />
      )}
    />
  );
};
