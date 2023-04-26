import { panel, heading, text, copyable } from '@metamask/snaps-ui';
import { saveAddressStoreManagement } from '../helpers/store-management.helper';

export const saveAddress = async (): Promise<void> => {
  const name = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'prompt',
      content: panel([heading('Save this address for:')]),
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
    await saveAddressStoreManagement({
      name: name.toString(),
      address: address.toString(),
    });
  }
};
