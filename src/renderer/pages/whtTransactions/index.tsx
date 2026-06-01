import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Tooltip } from '@mui/material';
import { useCallback, useRef, useState, type FC } from 'react';
import { getApi } from '../../shared/api/restApi';
import { InvoiceFormMode } from '../../shared/enums/invoiceFormMode';
import { CRUDPage } from '../../shared/components/layout/crudPage/CRUDPage';
import { useWhtTransactionAdd } from '../../shared/hooks/whtTransactions/useWhtTransactionAdd';
import { useWhtTransactionDelete } from '../../shared/hooks/whtTransactions/useWhtTransactionDelete';
import { useWhtTransactionsRetrieve } from '../../shared/hooks/whtTransactions/useWhtTransactionsRetrieve';
import { useWhtTransactionUpdate } from '../../shared/hooks/whtTransactions/useWhtTransactionUpdate';
import type { WhtTransaction, WhtTransactionAdd, WhtTransactionUpdate } from '../../shared/types/whtTransaction';
import type { Response } from '../../shared/types/response';
import { exportTawi50ContractorCopies12, exportTawi50ContractorCopies34 } from '../../shared/utils/whtPdfExport';
import { MoreActionDropdown } from './Dropdowns/MoreActionDropdown';
import { WhtEditPreviewToggle } from './WhtEditPreviewToggle';
import { NewActionDropdown } from '../pnd1/Dropdowns/NewActionDropdown';
import { Form } from './Form';
import { List } from './List';

export const WhtTransactionsPage: FC = () => {
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [isMoreActionOpen, setIsMoreActionOpen] = useState(false);
  const [openDefaultAdd, setOpenDefaultAdd] = useState<(() => void) | null>(null);
  const [mode, setMode] = useState<InvoiceFormMode>(InvoiceFormMode.edit);

  const onDeleteRef = useRef<((id: number) => void) | null>(null);
  const selectedItemRef = useRef<WhtTransaction | undefined>(undefined);

  const useRetrieve = useCallback(
    (args: { onDone?: (data: Response<WhtTransaction[]>) => void }) => {
      const { transactions, execute } = useWhtTransactionsRetrieve({ immediate: true, onDone: args.onDone });
      return { items: transactions, execute };
    },
    []
  );

  const useAdd = useCallback(
    (args: { item?: WhtTransactionAdd; immediate?: boolean; onDone?: (data: Response<WhtTransaction>) => void }) => {
      const { data, execute } = useWhtTransactionAdd({ transaction: args.item, immediate: args.immediate, onDone: args.onDone });
      return { data, execute };
    },
    []
  );

  const useUpdate = useCallback(
    (args: { item?: WhtTransactionUpdate; immediate?: boolean; onDone?: (data: Response<WhtTransaction>) => void }) => {
      const { execute } = useWhtTransactionUpdate({ transaction: args.item, immediate: args.immediate, onDone: args.onDone });
      return { execute };
    },
    []
  );

  const useDelete = useCallback(
    (args: { id: number; immediate?: boolean; onDone?: (data: Response<unknown>) => void }) => {
      const { execute } = useWhtTransactionDelete({ id: args.id, immediate: args.immediate, onDone: args.onDone });
      return { execute };
    },
    []
  );

  const fetchContractorAndBusiness = async (record: WhtTransaction) => {
    const [empRes, bizRes] = await Promise.all([
      getApi().getAllContractors(false),
      getApi().getAllBusinesses()
    ]);
    const contractor = empRes.data?.find(c => c.id === record.contractorId);
    const business = bizRes.data?.find(b => b.id === record.businessId);
    return { contractor, business };
  };

  const handleExportPDF12 = async () => {
    const record = selectedItemRef.current;
    if (!record) return;
    const { contractor, business } = await fetchContractorAndBusiness(record);
    if (!contractor || !business) return;
    await exportTawi50ContractorCopies12(record, contractor, business);
  };

  const handleExportPDF34 = async () => {
    const record = selectedItemRef.current;
    if (!record) return;
    const { contractor, business } = await fetchContractorAndBusiness(record);
    if (!contractor || !business) return;
    await exportTawi50ContractorCopies34(record, contractor, business);
  };

  return (
    <>
      <CRUDPage<WhtTransaction, WhtTransactionAdd, WhtTransactionUpdate>
        componentId="whtTransactions"
        renderCustomButtons={selectedItem => {
          selectedItemRef.current = selectedItem;
          return (
            <>
              <WhtEditPreviewToggle mode={mode} setMode={setMode} />
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
        leftTitle="ธุรกรรม WHT"
        title="ธุรกรรม WHT"
        noItemText="ไม่พบข้อมูลธุรกรรม"
        noItemButtonText="เพิ่มธุรกรรม"
        searchField="contractorName"
        inlineOnAdd={true}
        validateAndNormalize={async data => {
          const record = data as WhtTransactionAdd | WhtTransactionUpdate;
          if (!record || !record.businessId || !record.contractorId) return undefined;
          return record;
        }}
        onAddClick={defaultOnAdd => {
          setOpenDefaultAdd(() => defaultOnAdd);
          setIsAddDropdownOpen(true);
        }}
        sortOptions={[
          { label: 'วันที่จ่าย', value: 'payDate' },
          { label: 'ผู้รับจ้าง', value: 'contractorName' },
          { label: 'ประเภท', value: 'pndType' }
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
        onExportPDF12={handleExportPDF12}
        onExportPDF34={handleExportPDF34}
        onDelete={() => {
          const record = selectedItemRef.current;
          if (record) onDeleteRef.current?.(record.id);
        }}
        showDelete={!!selectedItemRef.current}
      />
    </>
  );
};
