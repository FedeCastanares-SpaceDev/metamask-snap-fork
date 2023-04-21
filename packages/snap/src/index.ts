import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text, copyable, NodeType } from '@metamask/snaps-ui';
import { getBIP44AddressKeyDeriver } from '@metamask/key-tree';
import { ParamsType, RecoverParamsType } from '../../../types/params.type';

const slip39 = require('./slip39');
const assert = require('assert');

function slip39EncodeHex(str: any) {
  let bytes = [];
  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}

function slip39DecodeHex(arr: any) {
  let str = [];
  const hex = arr.toString().split(',');
  for (let i = 0; i < hex.length; i++) {
    str.push(String.fromCharCode(hex[i]));
  }
  return str.toString().replace(/,/g, '');
}

function recover(groupShares: any, pass: any, masterSecret: any) {
  const recoveredSecret: any = slip39.recoverSecret(groupShares, pass);
  console.log('\tMaster secret: ' + masterSecret);
  const recovered = slip39DecodeHex(recoveredSecret);
  console.log('\tRecovered one: ' + recovered);
  return recovered;
  // assert(masterSecret === slip39DecodeHex(recoveredSecret));
}

function printShares(shares: any) {
  shares.forEach((s: string, i: number) => console.log(`\t${i + 1}) ${s}`));
}

type arraySharesToTextAndCopyType = {
  value: string;
  type: NodeType.Copyable | NodeType.Text;
};
function arraySharesToTextAndCopy(
  array: string[],
): arraySharesToTextAndCopyType[] {
  const response: arraySharesToTextAndCopyType[] = [];
  array.forEach((item, index) => {
    response.push(text(`${index + 1}: `));
    response.push(copyable(`${item.toString()}`));
  });
  return response;
}

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  const ethNode = await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 60,
    },
  });

  const deriveAddress = await getBIP44AddressKeyDeriver(ethNode);

  const firstAccount = await deriveAddress(0);
  const secondAccount = await deriveAddress(1);

  switch (request.method) {
    case 'hello':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            text(`Hello, **${origin}**!`),
            text('This custom confirmation is just for display purposes.'),
            text(
              'But you can edit the snap source code to make it do something, if you want to!',
            ),
          ]),
        },
      });
    case 'custom':
      let threshold: ParamsType['threshold'] | undefined = undefined;
      let passphrase: ParamsType['passphrase'] | undefined = undefined;
      let groups: ParamsType['groups'] | undefined = undefined;

      if (request.params instanceof Array) {
        throw new Error('No lo esparaba');
      } else {
        Object.entries(request.params).forEach(([key, value]) => {
          if (key === 'groups' && value instanceof Array) {
            groups = value as ParamsType['groups'];
          }
          if (key === 'threshold' && typeof value === 'string') {
            threshold = value;
          }
          if (key === 'passphrase' && typeof value === 'string') {
            passphrase = value;
          }
        });
      }
      let params: ParamsType | undefined;
      if (threshold && groups && passphrase) {
        params = {
          threshold,
          groups,
          passphrase,
        };
      }

      if (!params) throw new Error('Error con los params');

      const slip = slip39.fromArray(slip39EncodeHex(firstAccount.privateKey), {
        passphrase: params.passphrase,
        threshold: params.threshold,
        groups: params.groups,
        title: 'Slip39 example for 2-level SSSS',
      });

      /*
       * Example of Case 1
       */
      // The 1st, and only, member-share (member 0) of the 1st group-share (group 0) + the 1st, and only, member-share (member 0) of the 2nd group-share (group 1)
      let aliceBothGroupShares = slip
        .fromPath('r/0/0')
        .mnemonics.concat(slip.fromPath('r/1/0').mnemonics);

      let requiredGroupShares = aliceBothGroupShares;

      console.log(
        `\n* Shares used by Alice alone for restoring the master secret (total of ${requiredGroupShares.length} member-shares):`,
      );
      printShares(requiredGroupShares);
      recover(requiredGroupShares, passphrase, firstAccount.privateKey);

      const requiredGroupSharesList: string[] = requiredGroupShares.map(
        (s: string, i: number) => `${s}`,
      );
      const shares = arraySharesToTextAndCopy([...requiredGroupSharesList]);

      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            text(`Hello Fede, from **${origin}**!`),
            text('JM 🥸'),
            text(' -------------------------------------- '),
            text(
              `Shares for restoring the master secret (total of ${requiredGroupShares.length.toString()} member-shares):`,
            ),
            ...shares,
          ]),
        },
      });
    case 'recover':
      let recoverPassphrase: RecoverParamsType['passphrase'] | undefined =
        undefined;
      let recoverShares: RecoverParamsType['shares'] | undefined = undefined;

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

      if (!recoverParams) throw new Error('Error con los params');

      const recovered = recover(
        recoverParams.shares,
        recoverParams.passphrase,
        firstAccount.privateKey,
      );

      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            text(`Hello, from **${origin}**!`),
            text('Your keys was recovered'),
            text(`Master:`),
            copyable(firstAccount.privateKey ?? ''),
            text('Recovered:'),
            copyable(recovered),
          ]),
        },
      });
    default:
      throw new Error('Method not found.');
  }
};
