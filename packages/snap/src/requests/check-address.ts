import { JsonRpcRequest, Json } from '@metamask/snaps-types';
import { panel, heading, copyable } from '@metamask/snaps-ui';
import { getData, saveAddressStoreManagement } from '../helpers/store-management.helper';

export const checkAddress = async (
  request: JsonRpcRequest<Json[] | Record<string, Json>>,
): Promise<void> => {
  const persistedData = await getData();
  let addressTo = '';
  let thisAddressExist: boolean = false;

  // Read the address to which the transaction was made
  if (request.params instanceof Array) {
    throw new Error('');
  } else {
    Object.entries(request.params).forEach(([key, value]) => {
      if (key === 'address' && typeof value === 'string') {
        addressTo = value;
      }
    });
  }

  // We look for this address in our data
  if (persistedData?.addresses && persistedData?.addresses instanceof Array) {
    const exist = persistedData.addresses.find(
      (value: any) => value.address.toLowerCase() === addressTo.toLowerCase(),
    );
    exist ? (thisAddressExist = true) : (thisAddressExist = false);
  }

  if (!thisAddressExist) {
    const response = await snap.request({
      method: 'snap_dialog',
      params: {
        type: 'confirmation',
        content: panel([heading('Save this address?'), copyable(addressTo)]),
      },
    });

    if (response === true) {
      const name = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'prompt',
          content: panel([heading('Save the address for:')]),
          placeholder: 'Name',
        },
      });
      if (!name) return;

      await saveAddressStoreManagement({ name: name.toString(), address: addressTo });
    }
  }
};
