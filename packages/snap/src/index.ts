import {
  OnRpcRequestHandler,
  OnTransactionHandler,
} from '@metamask/snaps-types';
import {
  panel,
  text,
  copyable,
  NodeType,
  heading,
  divider,
  spinner,
} from '@metamask/snaps-ui';
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

      const customResult = await snap.request({
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
      if (customResult === true) {
        // Do the action
      }
      break;
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

      const result = await snap.request({
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
      if (result === true) {
        // Do the action
      }
      break;
    case 'check_address':
      const persistedDataAddresses = await getData();
      let addressTo: string = '';
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
        persistedDataAddresses &&
        persistedDataAddresses.addresses &&
        persistedDataAddresses.addresses instanceof Array
      ) {
        persistedDataAddresses.addresses.find(
          (value: any) =>
            value.address.toLowerCase() === addressTo.toLowerCase(),
        );
      }

      if (!!addressTo) {
        const respOfSave = await snap.request({
          method: 'snap_dialog',
          params: {
            type: 'confirmation',
            content: panel([
              heading('Save this address?'),
              copyable(addressTo),
            ]),
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
              return snap.request({
                method: 'snap_manageState',
                params: {
                  operation: 'update',
                  newState: { addresses: [{ name, addressTo }] },
                },
              });
            } catch (error) {}
          } else if (
            persistedDataAddresses.addresses &&
            persistedDataAddresses.addresses instanceof Array
          ) {
            const addresessCopy = persistedDataAddresses.addresses;
            try {
              return snap.request({
                method: 'snap_manageState',
                params: {
                  operation: 'update',
                  newState: {
                    addresses: [...addresessCopy, { name, address: addressTo }],
                  },
                },
              });
            } catch (error) {}
          }
        }
      }
      break;
    case 'get_addresses':
      const persistedData = await getData();
      let renderAddresses: arraySharesToTextAndCopyType[] = [];
      if (
        persistedData &&
        persistedData.addresses &&
        persistedData.addresses instanceof Array
      ) {
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
    case 'save_address':
      const name = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'prompt',
          content: panel([heading('Save the address for:')]),
          placeholder: 'Name',
        },
      });
      const address = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'prompt',
          content: panel([heading('Address:')]),
          placeholder: '0x...',
        },
      });

      const saveresult = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            heading('Save:'),
            text('Name:'),
            copyable(name?.toString() ?? ''),
            text('Address:'),
            copyable(address?.toString() ?? ''),
          ]),
        },
      });

      if (saveresult === true) {
        const persistedData = await getData();
        if (!persistedData) {
          try {
            return snap.request({
              method: 'snap_manageState',
              params: {
                operation: 'update',
                newState: { addresses: [{ name, address }] },
              },
            });
          } catch (error) {}
        } else if (
          persistedData.addresses &&
          persistedData.addresses instanceof Array
        ) {
          const addresessCopy = persistedData.addresses;
          try {
            return snap.request({
              method: 'snap_manageState',
              params: {
                operation: 'update',
                newState: { addresses: [...addresessCopy, { name, address }] },
              },
            });
          } catch (error) {}
        }
      }

      break;
    default:
      throw new Error('Method not found.');
  }
};

export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
  transactionOrigin,
}) => {
  console.log({ transaction, chainId, transactionOrigin });
  const persistedData = await getData();
  const txTo = transaction.to;
  let addressIsStored: { name: string; address: string } | undefined;
  if (
    persistedData &&
    persistedData.addresses &&
    persistedData.addresses instanceof Array
  ) {
    persistedData.addresses.forEach((value: any) => {
      if (
        value.address.toLowerCase() ===
        JSON.stringify(txTo)
          .substring(1, JSON.stringify(txTo).length - 1)
          .toLowerCase()
      ) {
        addressIsStored = { name: value.name, address: value.address };
        return;
      }
    });
  } else {
    addressIsStored = undefined;
  }

  return {
    content: panel([
      heading(addressIsStored ? 'Address existente' : 'Nueva address'),
      text(
        addressIsStored
          ? `Esta address pertenece a:`
          : 'Esta address no esta guardada, luego de la transaccion te preguntaremos si la quieres guardar',
      ),
      heading(addressIsStored?.name ?? ''),
    ]),
  };
};

async function getData() {
  try {
    const data = await snap.request({
      method: 'snap_manageState',
      params: { operation: 'get' },
    });
    return data;
  } catch (error) {
    return undefined;
  }
}
