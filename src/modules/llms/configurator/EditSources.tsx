import * as React from 'react';
import { shallow } from 'zustand/shallow';

import { Box, Button, IconButton, ListItemDecorator, Menu, MenuItem, Option, Select, Typography } from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import ComputerIcon from '@mui/icons-material/Computer';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { hideOnDesktop, hideOnMobile } from '~/common/theme';

import { ConfirmationModal } from '~/common/components/ConfirmationModal';
import { DModelSource, DModelSourceId, findUniqueSourceId, useModelsStore } from '../store-models';
import { findVendor, ModelVendor, ModelVendorId, rankedVendors } from '../vendors-registry';


function locationIcon(vendor?: ModelVendor | null) {
  return !vendor ? null : vendor.location === 'local' ? <ComputerIcon /> : <CloudOutlinedIcon />;
}


export function EditSources(props: {
  selectedSourceId: DModelSourceId | null, setSelectedSourceId: (sourceId: DModelSourceId | null) => void,
}) {

  // state
  const [vendorsMenuAnchor, setVendorsMenuAnchor] = React.useState<HTMLElement | null>(null);
  const [confirmDeletionSourceId, setConfirmDeletionSourceId] = React.useState<DModelSourceId | null>(null);

  // external state
  const { modelSources, addModelSource, removeModelSource } = useModelsStore(state => ({
    modelSources: state.sources, addModelSource: state.addSource, removeModelSource: state.removeSource,
  }), shallow);


  const handleShowVendors = (event: React.MouseEvent<HTMLElement>) => setVendorsMenuAnchor(event.currentTarget);

  const closeVendorsMenu = () => setVendorsMenuAnchor(null);

  const handleAddSourceFromVendor = React.useCallback((vendorId: ModelVendorId) => {
    closeVendorsMenu();
    const modelSources = useModelsStore.getState().sources;
    const { id, count } = findUniqueSourceId(vendorId, modelSources);
    const source = findVendor(vendorId)?.createSource(id, count);
    if (source) {
      addModelSource(source);
      props.setSelectedSourceId(id);
    }
  }, [addModelSource, props]);


  const enableDeleteButton = !!props.selectedSourceId && modelSources.length > 1;

  const handleDeleteSource = (id: DModelSourceId) => setConfirmDeletionSourceId(id);

  const handleDeleteSourceConfirmed = React.useCallback(() => {
    if (confirmDeletionSourceId) {
      props.setSelectedSourceId(modelSources.find(source => source.id !== confirmDeletionSourceId)?.id ?? null);
      removeModelSource(confirmDeletionSourceId);
      setConfirmDeletionSourceId(null);
    }
  }, [confirmDeletionSourceId, modelSources, props, removeModelSource]);


  // vendor list items
  const vendorItems = React.useMemo(() => rankedVendors().map(vendor => {
    const sourceCount = modelSources.filter(source => source.vendorId === vendor.id).length;
    const enabled = (vendor.multiple || sourceCount < 1) && sourceCount < 2 && !!vendor.enabled;
    return {
      vendor,
      enabled,
      sourceCount,
      component: (
        <MenuItem key={vendor.id} disabled={!enabled} onClick={() => handleAddSourceFromVendor(vendor.id)}>
          <ListItemDecorator>
            {locationIcon(vendor)}
          </ListItemDecorator>
          {vendor.name}
        </MenuItem>
      ),
    };
  }), [handleAddSourceFromVendor, modelSources]);


  // source items
  const sourceItems = React.useMemo(() => modelSources.map((source: DModelSource) => {
    return {
      source,
      icon: locationIcon(findVendor(source.vendorId)),
      component: <Option key={source.id} value={source.id}>{source.label}</Option>,
    };
  }), [modelSources]);
  const selectedSourceItem = sourceItems.find(item => item.source.id === props.selectedSourceId);


  const noSources = !modelSources.length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>

      <Typography sx={{ mr: 1, ...hideOnMobile }}>
        Source
      </Typography>

      <Select
        variant='outlined'
        value={props.selectedSourceId}
        disabled={noSources}
        onChange={(event, value) => value && props.setSelectedSourceId(value)}
        startDecorator={selectedSourceItem?.icon}
        slotProps={{
          root: { sx: { minWidth: 190 } },
          indicator: { sx: { opacity: 0.5 } },
        }}
      >
        {sourceItems.map(item => item.component)}
      </Select>


      <IconButton variant={noSources ? 'solid' : 'plain'} onClick={handleShowVendors} sx={{ ...hideOnDesktop }}>
        <AddIcon />
      </IconButton>
      <Button variant={noSources ? 'solid' : 'plain'} onClick={handleShowVendors} startDecorator={<AddIcon />} sx={{ ...hideOnMobile }}>
        Add
      </Button>

      <IconButton
        variant='plain' color='neutral' disabled={!enableDeleteButton} sx={{ ml: 'auto' }}
        onClick={() => props.selectedSourceId && handleDeleteSource(props.selectedSourceId)}
      >
        <DeleteOutlineIcon />
      </IconButton>


      {/* vendors popup, for adding */}
      <Menu
        variant='outlined' color='neutral' size='lg' placement='bottom-start' sx={{ minWidth: 280, zIndex: 10000 }}
        open={!!vendorsMenuAnchor} anchorEl={vendorsMenuAnchor} onClose={closeVendorsMenu}
        disablePortal={false}
      >
        {vendorItems.map(item => item.component)}
      </Menu>

      {/* source delete confirmation */}
      <ConfirmationModal
        open={!!confirmDeletionSourceId} onClose={() => setConfirmDeletionSourceId(null)} onPositive={handleDeleteSourceConfirmed}
        confirmationText={'Are you sure you want to remove these models? The configuration data will be lost and you may have to enter it again.'} positiveActionText={'Remove'}
      />

    </Box>
  );
}