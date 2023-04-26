import { panel, text } from '@metamask/snaps-ui';

export const cleanData = async () => {
  const response = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([text('Do you want to clear the information?')]),
    },
  });
  if (response === true) {
    await snap.request({
      method: 'snap_manageState',
      params: { operation: 'clear' },
    });
  }
};
