import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Box, ListItem, ListItemButton, ListItemIcon, ListItemText, SwipeableDrawer, Typography, useMediaQuery, useTheme } from '@mui/material';
import { memo, type FC } from 'react';
import { PageHeader } from '../../../shared/components/layout/pageHeader/PageHeader';

interface Props {
  isOpen: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  onExportPDF12?: () => void;
  onExportPDF34?: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
}

const MoreActionDropdownComponent: FC<Props> = ({
  isOpen, onClose, onOpen, onExportPDF12, onExportPDF34, onDelete, showDelete = true
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const action = (fn?: () => void) => () => { fn?.(); onClose?.(); };

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
            height: '45%',
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
      <Box sx={{ mb: 2, mt: 2, display: 'flex', gap: 2, flexDirection: 'column' }}>
        <PageHeader
          title="การดำเนินการเพิ่มเติม"
          showBack={false}
          showSave={false}
          showClose={true}
          onClose={onClose}
        />
        <Box>
          <ListItemButton
            onClick={action(onExportPDF12)}
            sx={{ width: '100%', borderRadius: 1, display: 'flex', justifyContent: 'start', alignItems: 'start', flexDirection: 'column' }}
          >
            <ListItem sx={{ p: 0 }}>
              <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}><PictureAsPdfIcon color="error" /></ListItemIcon>
              <ListItemText
                primary={<Typography component="div" variant="body1" sx={{ fontWeight: 600 }}>Export PDF ฉบับ 1-2</Typography>}
                disableTypography sx={{ m: 0 }}
              />
            </ListItem>
          </ListItemButton>
          <ListItemButton
            onClick={action(onExportPDF34)}
            sx={{ width: '100%', borderRadius: 1, display: 'flex', justifyContent: 'start', alignItems: 'start', flexDirection: 'column' }}
          >
            <ListItem sx={{ p: 0 }}>
              <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}><PictureAsPdfIcon color="error" /></ListItemIcon>
              <ListItemText
                primary={<Typography component="div" variant="body1" sx={{ fontWeight: 600 }}>Export PDF ฉบับ 3-4</Typography>}
                disableTypography sx={{ m: 0 }}
              />
            </ListItem>
          </ListItemButton>
          {showDelete && (
            <ListItemButton
              onClick={action(onDelete)}
              sx={{ width: '100%', borderRadius: 1, display: 'flex', justifyContent: 'start', alignItems: 'start', flexDirection: 'column' }}
            >
              <ListItem sx={{ p: 0 }}>
                <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}><DeleteIcon color="error" /></ListItemIcon>
                <ListItemText
                  primary={<Typography component="div" variant="body1" sx={{ fontWeight: 600 }}>ลบ</Typography>}
                  disableTypography sx={{ m: 0 }}
                />
              </ListItem>
            </ListItemButton>
          )}
        </Box>
      </Box>
    </SwipeableDrawer>
  );
};

export const MoreActionDropdown = memo(MoreActionDropdownComponent);
