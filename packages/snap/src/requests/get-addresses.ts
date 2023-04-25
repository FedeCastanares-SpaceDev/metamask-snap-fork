import { text, copyable, panel, heading } from '@metamask/snaps-ui';
import { getData } from '../helpers/store-managment.helper';
import { arraySharesToTextAndCopyType } from '../types/text-and-copy.type';

export const getAddresses = async () => {
  const persistedData = await getData();
  const renderAddresses: arraySharesToTextAndCopyType[] = [];
  if (persistedData?.addresses && persistedData?.addresses instanceof Array) {
    persistedData.addresses.forEach((value: any) => {
      renderAddresses.push(text(`${value.name}: `));
      renderAddresses.push(copyable(value.address ?? ''));
    });
  }
  return snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: panel([heading('Addresses'), ...renderAddresses]),
    },
  });
};
