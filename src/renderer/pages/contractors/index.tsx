import { useCallback, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CRUDPage } from '../../shared/components/layout/crudPage/CRUDPage';
import { FilterType } from '../../shared/enums/filterType';
import { useContractorAdd } from '../../shared/hooks/contractors/useContractorAdd';
import { useContractorDelete } from '../../shared/hooks/contractors/useContractorDelete';
import { useContractorsRetrieve } from '../../shared/hooks/contractors/useContractorsRetrieve';
import { useContractorUpdate } from '../../shared/hooks/contractors/useContractorUpdate';
import type { Contractor, ContractorAdd, ContractorUpdate } from '../../shared/types/contractor';
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

export const ContractorsPage: FC = () => {
  const { t } = useTranslation();

  const filters = createCommonFilters({ t, namespace: 'contractors', initial: FilterType.active });

  const useRetrieve = useCallback(
    (args: { filter?: FilterData[]; onDone?: (data: Response<Contractor[]>) => void }) => {
      const showArchived = filterToShowArchived(args.filter);
      const { contractors, execute } = useContractorsRetrieve({ showArchived, onDone: args.onDone });
      return { items: contractors, execute };
    },
    []
  );

  const useAdd = useCallback(
    (args: { item?: ContractorAdd; immediate?: boolean; onDone?: (data: Response<Contractor>) => void }) => {
      const { data, execute } = useContractorAdd({ contractor: args.item, immediate: args.immediate, onDone: args.onDone });
      return { data, execute };
    },
    []
  );

  const useUpdate = useCallback(
    (args: { item?: ContractorUpdate; immediate?: boolean; onDone?: (data: Response<Contractor>) => void }) => {
      const { execute } = useContractorUpdate({ contractor: args.item, immediate: args.immediate, onDone: args.onDone });
      return { execute };
    },
    []
  );

  const useDelete = useCallback(
    (args: { id: number; immediate?: boolean; onDone?: (data: Response<unknown>) => void }) => {
      const { execute } = useContractorDelete({ id: args.id, immediate: args.immediate, onDone: args.onDone });
      return { execute };
    },
    []
  );

  return (
    <CRUDPage<Contractor, ContractorAdd, ContractorUpdate>
      componentId="contractors"
      leftTitle="ผู้รับจ้าง"
      title="ผู้รับจ้าง"
      noItemText="ไม่พบผู้รับจ้าง"
      noItemButtonText="เพิ่มผู้รับจ้าง"
      searchField="name"
      filters={filters}
      sortOptions={[
        { label: 'ชื่อ', value: 'name' },
        { label: 'ประเภท', value: 'type' }
      ]}
      validateAndNormalize={async data => {
        const contractor = data as ContractorAdd | ContractorUpdate;
        if (!contractor?.name?.trim() || !contractor?.taxId?.trim()) return undefined;
        return contractor;
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
          contractor={item}
          onChange={({ changedData, isFormValid }) => {
            const data: ContractorAdd | ContractorUpdate = item
              ? { ...changedData, id: item.id }
              : changedData;
            onChange({ changedData: data, isFormValid });
          }}
        />
      )}
    />
  );
};
