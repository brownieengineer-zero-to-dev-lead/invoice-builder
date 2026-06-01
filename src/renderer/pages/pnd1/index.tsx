import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Tooltip } from '@mui/material';
import { useCallback, useRef, useState, type FC } from 'react';
import { CRUDPage } from '../../shared/components/layout/crudPage/CRUDPage';
import { usePnd1RecordAdd } from '../../shared/hooks/pnd1Records/usePnd1RecordAdd';
import { usePnd1RecordDelete } from '../../shared/hooks/pnd1Records/usePnd1RecordDelete';
import { usePnd1RecordsRetrieve } from '../../shared/hooks/pnd1Records/usePnd1RecordsRetrieve';
import { usePnd1RecordUpdate } from '../../shared/hooks/pnd1Records/usePnd1RecordUpdate';
import type { Pnd1Record, Pnd1RecordAdd, Pnd1RecordUpdate } from '../../shared/types/pnd1Record';
import type { Response } from '../../shared/types/response';
import { MoreActionDropdown } from './Dropdowns/MoreActionDropdown';
import { Form } from './Form';
import { List } from './List';

export const Pnd1Page: FC = () => {
  const [isMoreActionOpen, setIsMoreActionOpen] = useState(false);
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
    </>
  );
};
