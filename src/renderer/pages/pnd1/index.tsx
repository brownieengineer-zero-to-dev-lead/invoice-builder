import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Tooltip } from '@mui/material';
import { useCallback, useRef, useState, type FC } from 'react';
import { getApi } from '../../shared/api/restApi';
import { InvoiceFormMode } from '../../shared/enums/invoiceFormMode';
import { CRUDPage } from '../../shared/components/layout/crudPage/CRUDPage';
import { usePnd1RecordAdd } from '../../shared/hooks/pnd1Records/usePnd1RecordAdd';
import { usePnd1RecordDelete } from '../../shared/hooks/pnd1Records/usePnd1RecordDelete';
import { usePnd1RecordsRetrieve } from '../../shared/hooks/pnd1Records/usePnd1RecordsRetrieve';
import { usePnd1RecordUpdate } from '../../shared/hooks/pnd1Records/usePnd1RecordUpdate';
import type { Pnd1Record, Pnd1RecordAdd, Pnd1RecordUpdate } from '../../shared/types/pnd1Record';
import type { Response } from '../../shared/types/response';
import { exportPnd1 } from '../../shared/utils/whtPdfExport';
import { EditPreviewToggle } from '../invoices/Form/EditPreviewToggle';
import { MoreActionDropdown } from './Dropdowns/MoreActionDropdown';
import { NewActionDropdown } from './Dropdowns/NewActionDropdown';
import { Form } from './Form';
import { List } from './List';

export const Pnd1Page: FC = () => {
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [isMoreActionOpen, setIsMoreActionOpen] = useState(false);
  const [openDefaultAdd, setOpenDefaultAdd] = useState<(() => void) | null>(null);
  const [mode, setMode] = useState<InvoiceFormMode>(InvoiceFormMode.edit);

  const onDeleteRef = useRef<((id: number) => void) | null>(null);
  const selectedItemRef = useRef<Pnd1Record | undefined>(undefined);

  const useRetrieve = useCallback(
    (args: { onDone?: (data: Response<Pnd1Record[]>) => void }) => {
      const { records, execute } = usePnd1RecordsRetrieve({ immediate: true, onDone: args.onDone });
      return { items: records, execute };
    },
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
    await exportPnd1(record, employee, business);
  };

  return (
    <>
      <CRUDPage<Pnd1Record, Pnd1RecordAdd, Pnd1RecordUpdate>
        componentId="pnd1"
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
        leftTitle="ภ.ง.ด.1"
        title="ภ.ง.ด.1"
        noItemText="ไม่พบข้อมูล ภ.ง.ด.1"
        noItemButtonText="เพิ่มข้อมูล ภ.ง.ด.1"
        searchField="employeeName"
        inlineOnAdd={true}
        validateAndNormalize={async data => {
          const record = data as Pnd1RecordAdd | Pnd1RecordUpdate;
          if (!record || !record.employeeId) return undefined;
          return record;
        }}
        onAddClick={defaultOnAdd => {
          setOpenDefaultAdd(() => defaultOnAdd);
          setIsAddDropdownOpen(true);
        }}
        sortOptions={[
          { label: 'เดือน', value: 'month' },
          { label: 'ปี', value: 'year' },
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
