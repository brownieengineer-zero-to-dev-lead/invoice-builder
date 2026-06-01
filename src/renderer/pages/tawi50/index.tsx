import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Tooltip } from '@mui/material';
import { useCallback, useRef, useState, type FC } from 'react';
import { getApi } from '../../shared/api/restApi';
import { InvoiceFormMode } from '../../shared/enums/invoiceFormMode';
import { CRUDPage } from '../../shared/components/layout/crudPage/CRUDPage';
import { useTawi50EmployeeRecordAdd } from '../../shared/hooks/tawi50EmployeeRecords/useTawi50EmployeeRecordAdd';
import { useTawi50EmployeeRecordDelete } from '../../shared/hooks/tawi50EmployeeRecords/useTawi50EmployeeRecordDelete';
import { useTawi50EmployeeRecordsRetrieve } from '../../shared/hooks/tawi50EmployeeRecords/useTawi50EmployeeRecordsRetrieve';
import { useTawi50EmployeeRecordUpdate } from '../../shared/hooks/tawi50EmployeeRecords/useTawi50EmployeeRecordUpdate';
import type { Tawi50EmployeeRecord, Tawi50EmployeeRecordAdd, Tawi50EmployeeRecordUpdate } from '../../shared/types/tawi50EmployeeRecord';
import type { Response } from '../../shared/types/response';
import { exportTawi50Employee } from '../../shared/utils/whtPdfExport';
import { EditPreviewToggle } from '../invoices/Form/EditPreviewToggle';
import { MoreActionDropdown } from './Dropdowns/MoreActionDropdown';
import { NewActionDropdown } from '../pnd1/Dropdowns/NewActionDropdown';
import { Form } from './Form';
import { List } from './List';

export const Tawi50Page: FC = () => {
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [isMoreActionOpen, setIsMoreActionOpen] = useState(false);
  const [openDefaultAdd, setOpenDefaultAdd] = useState<(() => void) | null>(null);
  const [mode, setMode] = useState<InvoiceFormMode>(InvoiceFormMode.edit);

  const onDeleteRef = useRef<((id: number) => void) | null>(null);
  const selectedItemRef = useRef<Tawi50EmployeeRecord | undefined>(undefined);

  const useRetrieve = useCallback(
    (args: { onDone?: (data: Response<Tawi50EmployeeRecord[]>) => void }) => {
      const { records, execute } = useTawi50EmployeeRecordsRetrieve({ immediate: true, onDone: args.onDone });
      return { items: records, execute };
    },
    []
  );

  const useAdd = useCallback(
    (args: { item?: Tawi50EmployeeRecordAdd; immediate?: boolean; onDone?: (data: Response<Tawi50EmployeeRecord>) => void }) => {
      const { data, execute } = useTawi50EmployeeRecordAdd({ record: args.item, immediate: args.immediate, onDone: args.onDone });
      return { data, execute };
    },
    []
  );

  const useUpdate = useCallback(
    (args: { item?: Tawi50EmployeeRecordUpdate; immediate?: boolean; onDone?: (data: Response<Tawi50EmployeeRecord>) => void }) => {
      const { execute } = useTawi50EmployeeRecordUpdate({ record: args.item, immediate: args.immediate, onDone: args.onDone });
      return { execute };
    },
    []
  );

  const useDelete = useCallback(
    (args: { id: number; immediate?: boolean; onDone?: (data: Response<unknown>) => void }) => {
      const { execute } = useTawi50EmployeeRecordDelete({ id: args.id, immediate: args.immediate, onDone: args.onDone });
      return { execute };
    },
    []
  );

  const handleExportPDF = async () => {
    const record = selectedItemRef.current;
    if (!record) return;
    const [empRes, bizRes] = await Promise.all([
      getApi().getAllEmployees(false),
      getApi().getAllBusinesses()
    ]);
    const employee = empRes.data?.find(e => e.id === record.employeeId);
    if (!employee || !bizRes.data?.length) return;
    const business = bizRes.data.find(b => b.id === employee.businessId);
    if (!business) return;
    await exportTawi50Employee(record, employee, business);
  };

  return (
    <>
      <CRUDPage<Tawi50EmployeeRecord, Tawi50EmployeeRecordAdd, Tawi50EmployeeRecordUpdate>
        componentId="tawi50"
        renderCustomButtons={selectedItem => {
          selectedItemRef.current = selectedItem;
          return (
            <>
              <EditPreviewToggle mode={mode} setMode={setMode} />
              {selectedItem && (
                <Tooltip title="การดำเนินการเพิ่มเติม">
                  <IconButton size="small" onClick={() => setIsMoreActionOpen(true)}>
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>
              )}
            </>
          );
        }}
        leftTitle="50 ทวิ"
        title="50 ทวิ"
        noItemText="ไม่พบข้อมูล 50 ทวิ"
        noItemButtonText="เพิ่มข้อมูล 50 ทวิ"
        searchField="employeeName"
        inlineOnAdd={true}
        validateAndNormalize={async data => {
          const record = data as Tawi50EmployeeRecordAdd | Tawi50EmployeeRecordUpdate;
          if (!record || !record.employeeId) return undefined;
          return record;
        }}
        onAddClick={defaultOnAdd => {
          setOpenDefaultAdd(() => defaultOnAdd);
          setIsAddDropdownOpen(true);
        }}
        sortOptions={[
          { label: 'ปีภาษี', value: 'taxYear' },
          { label: 'ชื่อพนักงาน', value: 'employeeName' }
        ]}
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
              mode={mode}
              onChange={({ changedData, isFormValid }) =>
                onChange({ changedData, isFormValid })
              }
            />
          );
        }}
      />
      <NewActionDropdown
        isOpen={isAddDropdownOpen}
        onClose={() => setIsAddDropdownOpen(false)}
        onOpen={() => setIsAddDropdownOpen(true)}
        onNew={() => {
          setIsAddDropdownOpen(false);
          if (openDefaultAdd) openDefaultAdd();
        }}
      />
      <MoreActionDropdown
        isOpen={isMoreActionOpen}
        onClose={() => setIsMoreActionOpen(false)}
        onOpen={() => setIsMoreActionOpen(true)}
        onExportPDF={handleExportPDF}
        onDelete={() => {
          const record = selectedItemRef.current;
          if (record) onDeleteRef.current?.(record.id);
        }}
        showDelete={!!selectedItemRef.current}
      />
    </>
  );
};
