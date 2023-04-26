import { JsonRpcRequest, Json } from '@metamask/snaps-types';
import { panel, heading, copyable } from '@metamask/snaps-ui';
import { getData } from '../helpers/store-managment.helper';

export const checkAddress = async (
  request: JsonRpcRequest<Json[] | Record<string, Json>>,
): Promise<void> => {
  const persistedDataAddresses = await getData();
  let addressTo = '';
  let thisAddressExist: boolean = false;
  if (request.params instanceof Array) {
    throw new Error('No lo esparaba');
  } else {
    Object.entries(request.params).forEach(([key, value]) => {
      if (key === 'address' && typeof value === 'string') {
        addressTo = value;
      }
    });
  }

  if (
    persistedDataAddresses?.addresses &&
    persistedDataAddresses?.addresses instanceof Array
  ) {
    const exist = persistedDataAddresses.addresses.find(
      (value: any) => value.address.toLowerCase() === addressTo.toLowerCase(),
    );
    exist ? (thisAddressExist = true) : (thisAddressExist = false);
  }

  if (addressTo !== '' && !thisAddressExist) {
    const respOfSave = await snap.request({
      method: 'snap_dialog',
      params: {
        type: 'confirmation',
        content: panel([heading('Save this address?'), copyable(addressTo)]),
      },
    });

    if (respOfSave === true) {
      const name = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'prompt',
          content: panel([heading('Save the address for:')]),
          placeholder: 'Name',
        },
      });

      if (!persistedDataAddresses) {
        try {
          await snap.request({
            method: 'snap_manageState',
            params: {
              operation: 'update',
              newState: { addresses: [{ name, address: addressTo }] },
            },
          });
        } catch (error) {
          console.error('error updating: ', error.message);
        }
      } else if (
        persistedDataAddresses.addresses &&
        persistedDataAddresses.addresses instanceof Array
      ) {
        const addresessCopy = persistedDataAddresses.addresses;
        try {
          await snap.request({
            method: 'snap_manageState',
            params: {
              operation: 'update',
              newState: {
                addresses: [...addresessCopy, { name, address: addressTo }],
              },
            },
          });
        } catch (error) {
          console.error('error updating: ', error.message);
        }
      }
    }
  }
};
