import { panel, heading, text, copyable } from '@metamask/snaps-ui';
import { getData } from '../helpers/store-managment.helper';

export const saveAddress = async (): Promise<void> => {
  const name = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'prompt',
      content: panel([heading('Save the address for:')]),
      placeholder: 'Name',
    },
  });
  if (!name) return;

  const address = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'prompt',
      content: panel([heading('Address:')]),
      placeholder: '0x...',
    },
  });
  if (!address) return;

  const saveresult = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Save:'),
        text('Name:'),
        copyable(name?.toString() ?? ''),
        text('Address:'),
        copyable(address?.toString() ?? ''),
      ]),
    },
  });

  if (saveresult === true) {
    const persistedData = await getData();
    if (!persistedData) {
      try {
        await snap.request({
          method: 'snap_manageState',
          params: {
            operation: 'update',
            newState: { addresses: [{ name, address }] },
          },
        });
      } catch (error) {}
    } else if (
      persistedData.addresses &&
      persistedData.addresses instanceof Array
    ) {
      const addresessCopy = persistedData.addresses;
      try {
        await snap.request({
          method: 'snap_manageState',
          params: {
            operation: 'update',
            newState: { addresses: [...addresessCopy, { name, address }] },
          },
        });
      } catch (error) {}
    }
  }
};
