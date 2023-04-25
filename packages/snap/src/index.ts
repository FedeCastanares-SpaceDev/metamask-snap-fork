import {
  OnRpcRequestHandler,
  OnTransactionHandler,
} from '@metamask/snaps-types';
import { helloSnap } from './requests/hello';
import { generateShares } from './requests/generate-shares';
import { recoverPrivateKey } from './requests/recover';
import { checkAddress } from './requests/check-address';
import { getAddresses } from './requests/get-addresses';
import { saveAddress } from './requests/save-address';
import { onTransactionHandler } from './requests/on-transaction';

const slip39 = require('./slip39');

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
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'hello':
      return await helloSnap();
    case 'custom':
      return await generateShares(request, slip39);
    case 'recover':
      return await recoverPrivateKey(request, slip39);
    case 'check_address':
      return await checkAddress(request);
    case 'get_addresses':
      return await getAddresses();
    case 'save_address':
      return await saveAddress();
    default:
      throw new Error('Method not found.');
  }
};

export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  return onTransactionHandler(transaction);
};
