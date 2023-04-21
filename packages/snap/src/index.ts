import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text, copyable, NodeType } from '@metamask/snaps-ui';
import { getBIP44AddressKeyDeriver } from '@metamask/key-tree';
import { ParamsType, RecoverParamsType } from '../../../types/params.type';

const slip39 = require('./slip39');

function generateSecretKeys(slip: any, groups: [number, number, string][]) {
  let secret;
  let numberOfParticipants;
  const secretCodeList: string[][] = [];
  for (let i = 0; i < groups.length; i++) {
    numberOfParticipants = groups[i][1];
    secretCodeList.push([]);
    secretCodeList[i].push(
      `${groups[i][2]} (Participantes: ${numberOfParticipants})`,
    );

    for (let j = 0; j < numberOfParticipants; j++) {
      secret = slip.fromPath(`r/${i}/${j}`).mnemonics;
      secretCodeList[i].push(secret[0]);
    }
  }
  return secretCodeList;
}

function slip39EncodeHex(str: any) {
  const bytes = [];
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
  const recovered = slip39DecodeHex(recoveredSecret);
  return recovered;
}

type arraySharesToTextAndCopyType = {
  value: string;
  type: NodeType.Copyable | NodeType.Text;
};
function arraySharesToTextAndCopy(
  array: string[][],
): arraySharesToTextAndCopyType[][] {
  const response: arraySharesToTextAndCopyType[][] = [];
  array.forEach((share, index) =>
    share.forEach((code, i) => {
      if (i === 0) {
        response.push([text(code)]);
      } else {
        response[index].push(text(`${i} ) `));
        response[index].push(copyable(code));
      }
    }),
  );
  return response;
}

function sharesToList(
  array: arraySharesToTextAndCopyType[][],
): arraySharesToTextAndCopyType[] {
  const response: arraySharesToTextAndCopyType[] = [];
  array.forEach((group) => group.forEach((item) => response.push(item)));
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

      const secretCodeList = generateSecretKeys(slip, params.groups);

      const shares = arraySharesToTextAndCopy(secretCodeList);

      const sharesList = sharesToList(shares);

      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            text(`Hi your share list is:`),
            text(' -------------------------------------- '),
            ...sharesList,
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
            text('Your key was recovered'),
            text('Recovered:'),
            copyable(recovered),
          ]),
        },
      });
    default:
      throw new Error('Method not found.');
  }
};
