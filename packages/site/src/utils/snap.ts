import { RecoverParamsType, ParamsType } from '../../../../types/params.type';
import { defaultSnapOrigin } from '../config';
import { GetSnapsResponse, Snap } from '../types';

const Methods = {
  // USDC
  Approve:
    '0x095ea7b300000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc4500000000000000000000000000000000000000000000000000000000000f4240',
  Transfer:
    '0xa9059cbb000000000000000000000000fc43f5f9dd45258b3aff31bdbe6561d97e8b71de00000000000000000000000000000000000000000000000000000000000f4240',

  // WETH or WMATIC
  Deposit: '0xd0e30db0',
  Withdraw:
    '0x2e1a7d4d0000000000000000000000000000000000000000000000000de0b6b3a7640000',

  // Uniswap V3
  SwapETHForUSDC: '',
  SwapUSDCForUNI: '',
};

/**
 * Get the installed snaps in MetaMask.
 *
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (): Promise<GetSnapsResponse> => {
  return (await window.ethereum.request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
};

/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
  snapId: string = defaultSnapOrigin,
  params: Record<'version' | string, unknown> = {},
) => {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapId]: params,
    },
  });
};

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (version?: string): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(
      (snap) =>
        snap.id === defaultSnapOrigin && (!version || snap.version === version),
    );
  } catch (e) {
    console.log('Failed to obtain installed snap', e);
    return undefined;
  }
};

/**
 * Invoke the "hello" method from the example snap.
 */

export const sendHello = async () => {
  await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: { method: 'hello' },
    },
  });
};

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');
export const protectPrivateKeyAction = async (params: ParamsType) => {
  await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: { method: 'protect_private_key', params },
    },
  });
};

export const recoverAction = async (params: RecoverParamsType) => {
  await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: { method: 'recover', params },
    },
  });
};

export const sendTransaction = async (): Promise<void> => {
  const [from] = (await window.ethereum.request({
    method: 'eth_requestAccounts',
  })) as string[];
  const to = '0x25ba8c2C7c23d764d46E56B8DB6F8FE32F1690D8';
  const value = '0x0';

  try {
    // Send a transaction to MetaMask.
    await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from,
          to,
          value,
          data: Methods.Transfer,
        },
      ],
    });

    await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: defaultSnapOrigin,
        request: { method: 'check_address', params: { address: to } },
      },
    });
  } catch (error) {
    console.log('error en sendTrans', error);
  }
};

export const cleanData = async () => {
  await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: { method: 'clean_data' },
    },
  });
};

export const getAddresses = async () => {
  await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: { method: 'get_addresses' },
    },
  });
};

export const saveAddress = async () => {
  await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: { method: 'save_address' },
    },
  });
};
