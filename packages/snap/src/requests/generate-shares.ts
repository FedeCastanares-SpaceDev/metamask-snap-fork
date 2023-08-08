import { Json, JsonRpcRequest } from '@metamask/snaps-types';
import { copyable, heading, panel, text } from '@metamask/snaps-ui';
import { ParamsType } from '../../../../types/params.type';
import { arraySharesToTextAndCopyType } from '../types/text-and-copy.type';

/**
 * Enconde from string to bytes
 *
 * Enconde from string to bytes
 *
 * @param str
 * @returns bytes number[]
 */
function slip39EncodeHex(str: any) {
  const bytes = [];
  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}

/**
 * Generate secret keys by groups
 *
 * @param slip
 * @param groups
 * @returns secretCodeList the code list
 */
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

/**
 *
 * @param array
 */
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

/**
 *
 * @param array
 */
function sharesToList(
  array: arraySharesToTextAndCopyType[][],
): arraySharesToTextAndCopyType[] {
  const response: arraySharesToTextAndCopyType[] = [];
  array.forEach((group) => group.forEach((item) => response.push(item)));
  return response;
}

export const generateShares = async (
  request: JsonRpcRequest<Json[] | Record<string, Json>>,
  slip39: any,
) => {
  const privateKey = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'prompt',
      content: panel([heading('Your private key:')]),
      placeholder: '9a2b3e21f57a...',
    },
  });
  if (!privateKey) return;

  let threshold: ParamsType['threshold'] | undefined;
  let passphrase: ParamsType['passphrase'] | undefined;
  let groups: ParamsType['groups'] | undefined;

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

  if (!params) {
    throw new Error('Error con los params');
  }

  const slip = slip39.fromArray(slip39EncodeHex(privateKey), {
    passphrase: params.passphrase,
    threshold: params.threshold,
    groups: params.groups,
    title: 'Slip39 example for 2-level SSSS',
  });

  const secretCodeList = generateSecretKeys(slip, params.groups);

  const shares = arraySharesToTextAndCopy(secretCodeList);

  const sharesList = sharesToList(shares);

  await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: panel([
        text(`Hi your share list is:`),
        text(' -------------------------------------- '),
        ...sharesList,
      ]),
    },
  });
};
