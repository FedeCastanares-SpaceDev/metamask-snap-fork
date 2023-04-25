import { JsonRpcRequest, Json } from '@metamask/snaps-types';
import { panel, text, copyable } from '@metamask/snaps-ui';
import { RecoverParamsType } from '../../../../types/params.type';
import { getUserAddress } from '../helpers/get-user-address.helper';

/**
 *
 * @param groupShares
 * @param pass
 * @param slip39
 */
function recover(groupShares: any, pass: any, slip39: any) {
  const recoveredSecret: any = slip39.recoverSecret(groupShares, pass);
  const recovered = slip39DecodeHex(recoveredSecret);
  return recovered;
}

/**
 *
 * @param arr
 */
function slip39DecodeHex(arr: any) {
  const str = [];
  const hex = arr.toString().split(',');
  for (let i = 0; i < hex.length; i++) {
    str.push(String.fromCharCode(hex[i]));
  }
  return str.toString().replace(/,/g, '');
}

export const recoverPrivateKey = async (
  request: JsonRpcRequest<Json[] | Record<string, Json>>,
  slip39: any,
) => {
  const firstAccount = await getUserAddress(0);

  let recoverPassphrase: RecoverParamsType['passphrase'] | undefined;
  let recoverShares: RecoverParamsType['shares'] | undefined;

  if (request.params instanceof Array) {
    throw new Error('No lo esparaba');
  } else {
    Object.entries(request.params).forEach(([key, value]) => {
      if (key === 'shares' && value instanceof Array) {
        recoverShares = value as RecoverParamsType['shares'];
      }

      if (key === 'passphrase' && typeof value === 'string') {
        recoverPassphrase = value;
      }
    });
  }
  let recoverParams: RecoverParamsType | undefined;
  if (recoverPassphrase && recoverShares) {
    recoverParams = {
      passphrase: recoverPassphrase,
      shares: recoverShares,
    };
  }

  if (!recoverParams) {
    throw new Error('Error con los params');
  }

  const recovered = recover(
    recoverParams.shares,
    recoverParams.passphrase,
    slip39,
  );

  const result = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        text('Your key was recovered'),
        text('Your private key:'),
        copyable(firstAccount.privateKey ?? ''),
        text('Recovered:'),
        copyable(recovered),
      ]),
    },
  });
  if (result === true) {
    // Do the action
  }
};
