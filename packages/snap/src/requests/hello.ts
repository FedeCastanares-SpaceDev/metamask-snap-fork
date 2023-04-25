import {
  panel,
  text,
  copyable,
  heading,
  divider,
  spinner,
} from '@metamask/snaps-ui';

export const helloSnap = async () => {
  await snap.request({
    method: 'snap_manageState',
    params: { operation: 'clear' },
  });

  return snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: panel([
        text('copyable:'),
        copyable('Text to be copied'),
        text('divider:'),
        divider(),
        text('Heading:'),
        heading('Heading'),
        text('spinner:'),
        spinner(),
        text('and text with **bold** and _italic_'),
      ]),
    },
  });
};
