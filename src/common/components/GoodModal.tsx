import * as React from 'react';

import { Box, Button, Modal, ModalClose, ModalDialog, ModalOverflow, Typography } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';


/**
 * Base for out Modal components (Settings, Modeling, etc.)
 */
export function GoodModal(props: { title: string, open: boolean, onClose: () => void, sx?: SxProps, children: React.ReactNode }) {
  return (
    <Modal open={props.open} onClose={props.onClose}>
      <ModalOverflow>
        <ModalDialog
          sx={{
            minWidth: { xs: 360, sm: 500, md: 600, lg: 700 },
            maxWidth: 700,
            display: 'flex', flexDirection: 'column', gap: 3,
            ...props.sx,
          }}>

          <Box sx={{ mb: -1, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography level='h6'>
              {props.title}
            </Typography>
            <ModalClose sx={{ position: 'static', mr: -1 }} />
          </Box>

          {props.children}

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button variant='solid' color='neutral' onClick={props.onClose}>
              Close
            </Button>
          </Box>

        </ModalDialog>
      </ModalOverflow>
    </Modal>
  );
}