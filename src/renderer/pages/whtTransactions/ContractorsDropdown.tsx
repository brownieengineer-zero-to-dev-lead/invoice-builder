import { SwipeableDrawer, useMediaQuery, useTheme } from '@mui/material';
import { memo, type FC } from 'react';
import { CRUDPage } from '../../shared/components/layout/crudPage/CRUDPage';
import { useContractorsRetrieve } from '../../shared/hooks/contractors/useContractorsRetrieve';
import type { Contractor, ContractorAdd, ContractorUpdate } from '../../shared/types/contractor';
import type { Response } from '../../shared/types/response';
import { List as ContractorList } from '../contractors/List';

interface Props {
  isOpen: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  onClick?: (contractor: Contractor) => void;
}

const ContractorsDropdownComponent: FC<Props> = ({ isOpen, onClose, onOpen, onClick }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const useRetrieve = (args: { onDone?: (data: Response<Contractor[]>) => void }) => {
    const { contractors, execute } = useContractorsRetrieve({ showArchived: false, onDone: args.onDone });
    return { items: contractors, execute };
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
      <CRUDPage<Contractor, ContractorAdd, ContractorUpdate>
        componentId="whtTransactions:contractors"
        showRightSide={false}
        showAddButton={false}
        searchField="name"
        useRetrieve={useRetrieve}
        sortOptions={[
          { label: 'ชื่อ', value: 'name' },
          { label: 'ประเภท', value: 'type' }
        ]}
        noItemText="ไม่พบผู้รับจ้าง"
        renderListItem={(item, selectedItem) => (
          <ContractorList
            key={item.id}
            item={item}
            selectedItem={selectedItem}
            onEdit={c => onClick?.(c)}
          />
        )}
      />
    </SwipeableDrawer>
  );
};

export const ContractorsDropdown = memo(ContractorsDropdownComponent);
