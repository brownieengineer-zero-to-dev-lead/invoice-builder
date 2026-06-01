import { SwipeableDrawer, useMediaQuery, useTheme } from '@mui/material';
import { memo, type FC } from 'react';
import { CRUDPage } from '../../shared/components/layout/crudPage/CRUDPage';
import { useEmployeesRetrieve } from '../../shared/hooks/employees/useEmployeesRetrieve';
import type { Employee, EmployeeAdd, EmployeeUpdate } from '../../shared/types/employee';
import type { Response } from '../../shared/types/response';
import { List as EmployeeList } from '../employees/List';

interface Props {
  isOpen: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  onClick?: (employee: Employee) => void;
}

const EmployeesDropdownComponent: FC<Props> = ({ isOpen, onClose, onOpen, onClick }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const useRetrieve = (args: { onDone?: (data: Response<Employee[]>) => void }) => {
    const { employees, execute } = useEmployeesRetrieve({ showArchived: false, onDone: args.onDone });
    return { items: employees, execute };
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={isOpen}
      onClose={() => onClose?.()}
      onOpen={() => onOpen?.()}
      slotProps={{
        paper: {
          sx: {
            maxWidth: isDesktop ? '40%' : '100%',
            height: '80%',
            mx: 'auto',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            p: 3
          }
        }
      }}
    >
      <CRUDPage<Employee, EmployeeAdd, EmployeeUpdate>
        componentId="pnd1:employees"
        showRightSide={false}
        showAddButton={false}
        searchField="name"
        useRetrieve={useRetrieve}
        sortOptions={[
          { label: 'ชื่อ', value: 'name' },
          { label: 'เงินเดือน', value: 'baseSalary' }
        ]}
        noItemText="ไม่พบพนักงาน"
        renderListItem={(item, selectedItem) => (
          <EmployeeList
            key={item.id}
            item={item}
            selectedItem={selectedItem}
            onEdit={emp => onClick?.(emp)}
          />
        )}
      />
    </SwipeableDrawer>
  );
};

export const EmployeesDropdown = memo(EmployeesDropdownComponent);
