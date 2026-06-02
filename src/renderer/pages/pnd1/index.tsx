import ClearIcon from '@mui/icons-material/Clear';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, Chip, FormControl, IconButton, InputLabel, MenuItem, Select, Tooltip } from '@mui/material';
import { useCallback, useRef, useState, type FC } from 'react';
import { CRUDPage } from '../../shared/components/layout/crudPage/CRUDPage';
import { usePnd1RecordAdd } from '../../shared/hooks/pnd1Records/usePnd1RecordAdd';
import { usePnd1RecordDelete } from '../../shared/hooks/pnd1Records/usePnd1RecordDelete';
import { usePnd1RecordsRetrieve } from '../../shared/hooks/pnd1Records/usePnd1RecordsRetrieve';
import { usePnd1RecordUpdate } from '../../shared/hooks/pnd1Records/usePnd1RecordUpdate';
import type { Employee } from '../../shared/types/employee';
import type { Pnd1Record, Pnd1RecordAdd, Pnd1RecordUpdate } from '../../shared/types/pnd1Record';
import type { Response } from '../../shared/types/response';
import { MoreActionDropdown } from './Dropdowns/MoreActionDropdown';
import { EmployeesDropdown } from './EmployeesDropdown';
import { Form } from './Form';
import { List } from './List';

const MONTH_THAI = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const currentBEYear = new Date().getFullYear() + 543;
const YEARS = Array.from({ length: 5 }, (_, i) => currentBEYear - i);

export const Pnd1Page: FC = () => {
  const [isMoreActionOpen, setIsMoreActionOpen] = useState(false);
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const onDeleteRef = useRef<((id: number) => void) | null>(null);
  const selectedItemRef = useRef<Pnd1Record | undefined>(undefined);

  const [filterEmployee, setFilterEmployee] = useState<Employee | undefined>(undefined);
  const [filterMonth, setFilterMonth] = useState<number | ''>('');
  const [filterYear, setFilterYear] = useState<number | ''>('');

  // Keep filter ref in sync during render so useRetrieve (stable callback) always reads latest values.
  // Creating a new object each render ensures usePnd1RecordsRetrieve detects the change and re-fetches.
  const filterRef = useRef<{ employeeId?: number; month?: number; year?: number }>({});
  filterRef.current = {
    employeeId: filterEmployee?.id,
    month: filterMonth !== '' ? filterMonth : undefined,
    year: filterYear !== '' ? filterYear : undefined,
  };

  const useRetrieve = useCallback(
    (args: { onDone?: (data: Response<Pnd1Record[]>) => void }) => {
      const { records, execute } = usePnd1RecordsRetrieve({
        immediate: true,
        filter: filterRef.current,
        onDone: args.onDone,
      });
      return { items: records, execute };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const useAdd = useCallback(
    (args: { item?: Pnd1RecordAdd; immediate?: boolean; onDone?: (data: Response<Pnd1Record>) => void }) => {
      const { data, execute } = usePnd1RecordAdd({ record: args.item, immediate: args.immediate, onDone: args.onDone });
      return { data, execute };
    },
    []
  );

  const useUpdate = useCallback(
    (args: { item?: Pnd1RecordUpdate; immediate?: boolean; onDone?: (data: Response<Pnd1Record>) => void }) => {
      const { execute } = usePnd1RecordUpdate({ record: args.item, immediate: args.immediate, onDone: args.onDone });
      return { execute };
    },
    []
  );

  const useDelete = useCallback(
    (args: { id: number; immediate?: boolean; onDone?: (data: Response<unknown>) => void }) => {
      const { execute } = usePnd1RecordDelete({ id: args.id, immediate: args.immediate, onDone: args.onDone });
      return { execute };
    },
    []
  );

  const hasFilter = filterEmployee !== undefined || filterMonth !== '' || filterYear !== '';

  const filterBar = (
    <Box sx={{ display: 'grid', gap: 1, gridRow: 3, alignItems: 'center' }}>
      {/* Employee chip — opens drawer to pick */}
      <Chip
        label={filterEmployee ? filterEmployee.name : 'พนักงาน: ทั้งหมด'}
        onClick={() => setIsEmployeeDropdownOpen(true)}
        onDelete={filterEmployee ? () => setFilterEmployee(undefined) : undefined}
        variant={filterEmployee ? 'filled' : 'outlined'}
        color={filterEmployee ? 'primary' : 'default'}
        size="small"
      />

      {/* Month */}
      <FormControl size="small" sx={{ minWidth: 110 }}>
        <InputLabel>เดือน</InputLabel>
        <Select
          label="เดือน"
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value as number | '')}
        >
          <MenuItem value="">ทั้งหมด</MenuItem>
          {MONTH_THAI.map((m, i) => (
            <MenuItem key={i + 1} value={i + 1}>{m}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Year */}
      <FormControl size="small" sx={{ minWidth: 110 }}>
        <InputLabel>ปี (พ.ศ.)</InputLabel>
        <Select
          label="ปี (พ.ศ.)"
          value={filterYear}
          onChange={e => setFilterYear(e.target.value as number | '')}
        >
          <MenuItem value="">ทั้งหมด</MenuItem>
          {YEARS.map(y => (
            <MenuItem key={y} value={y}>{y}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Clear all */}
      {hasFilter && (
        <Tooltip title="ล้าง filter">
          <IconButton
            size="small"
            onClick={() => {
              setFilterEmployee(undefined);
              setFilterMonth('');
              setFilterYear('');
            }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  return (
    <>
      <CRUDPage<Pnd1Record, Pnd1RecordAdd, Pnd1RecordUpdate>
        componentId="pnd1"
        renderCustomButtons={selectedItem => {
          selectedItemRef.current = selectedItem;
          return selectedItem ? (
            <Tooltip title="การดำเนินการเพิ่มเติม">
              <IconButton size="small" onClick={() => setIsMoreActionOpen(true)}>
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
          ) : null;
        }}
        leftTitle="รายการเงินเดือน"
        title="รายการเงินเดือน"
        noItemText="ไม่พบข้อมูลรายการเงินเดือน"
        noItemButtonText="เพิ่มรายการเงินเดือน"
        searchField="employeeName"
        inlineOnAdd={true}
        validateAndNormalize={async data => {
          const record = data as Pnd1RecordAdd | Pnd1RecordUpdate;
          if (!record || !record.employeeId) return undefined;
          return record;
        }}
        sortOptions={[
          { label: 'เดือน', value: 'month' },
          { label: 'ปี', value: 'year' },
          { label: 'ชื่อพนักงาน', value: 'employeeName' }
        ]}
        renderAboveSort={filterBar}
        useRetrieve={useRetrieve}
        useAdd={useAdd}
        useUpdate={useUpdate}
        useDelete={useDelete}
        renderListItem={(item, selectedItem, onEdit) => (
          <List
            key={item.id}
            item={item}
            isSelected={item.id === selectedItem?.id}
            onEdit={onEdit}
          />
        )}
        form={({ item, onChange, onDelete }) => {
          onDeleteRef.current = onDelete ?? null;
          return (
            <Form
              record={item}
              onChange={({ changedData, isFormValid }) =>
                onChange({ changedData, isFormValid })
              }
            />
          );
        }}
      />
      <MoreActionDropdown
        isOpen={isMoreActionOpen}
        onClose={() => setIsMoreActionOpen(false)}
        onOpen={() => setIsMoreActionOpen(true)}
        onDelete={() => {
          const record = selectedItemRef.current;
          if (record?.id) onDeleteRef.current?.(record.id);
        }}
      />
      <EmployeesDropdown
        isOpen={isEmployeeDropdownOpen}
        onClose={() => setIsEmployeeDropdownOpen(false)}
        onOpen={() => setIsEmployeeDropdownOpen(true)}
        onClick={emp => {
          setFilterEmployee(emp);
          setIsEmployeeDropdownOpen(false);
        }}
      />
    </>
  );
};
