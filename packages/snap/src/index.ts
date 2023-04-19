import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text } from '@metamask/snaps-ui';
import { getBIP44AddressKeyDeriver } from '@metamask/key-tree';
import { ParamsType } from '../../../types/params.type';

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

function recover(groupShares, pass) {
  const recoveredSecret = slip39.recoverSecret(groupShares, pass);
  console.log('\tMaster secret: ' + slip39DecodeHex(masterSecret));
  console.log('\tRecovered one: ' + slip39DecodeHex(recoveredSecret));
  assert(slip39DecodeHex(masterSecret) === slip39DecodeHex(recoveredSecret));
}

function printShares(shares) {
  shares.forEach((s, i) => console.log(`\t${i + 1}) ${s}`));
}

const groupThreshold = 2;
const masterSecret = slip39EncodeHex(
  '6626f01ba2d71341214940a95f6a228c1fdeaae57eee2a331c8c8be9df2e1ff4',
);
const passphrase = 'Hola1234';

const groups = [
  // Alice group-shares. 1 is enough to reconstruct a group-share,
  // therefore she needs at least two group-shares to reconstruct the master secret.
  [1, 1, 'Alice personal group share 1'],
  [1, 1, 'Alice personal group share 2'],
  // 3 of 5 Friends' shares are required to reconstruct this group-share
  [3, 5, 'Friends group share for Bob, Charlie, Dave, Frank and Grace'],
  // 2 of 6 Family's shares are required to reconstruct this group-share
  [2, 6, 'Family group share for mom, dad, brother, sister and wife'],
];

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

      // JM code
      console.log(request);
      const slip = slip39.fromArray(masterSecret, {
        passphrase: params.passphrase,
        threshold: params.threshold,
        groups: params.groups,
        title: 'Slip39 example for 2-level SSSS',
      });
      console.log(slip);

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
      recover(requiredGroupShares, passphrase);

      const ethNode = await snap.request({
        method: 'snap_getBip44Entropy',
        params: {
          coinType: 60,
        },
      });

      const deriveAddress = await getBIP44AddressKeyDeriver(ethNode);

      // Derive the second Dogecoin address, which has index 1.
      const secondAccount = await deriveAddress(1);
      // JM code

      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            text(`Hello Fede, from **${origin}**!`),
            text(`your private key is: ${secondAccount.privateKey}`),
            text('JM 🥸'),
            text(`threshold: ${params.threshold}`),
            text(`passphrase: ${params.passphrase}`),
            text(`groups:`),
            text(`${params.groups.map((group) => `${group.toString()} || `)}`),
          ]),
        },
      });
    default:
      throw new Error('Method not found.');
  }
};
