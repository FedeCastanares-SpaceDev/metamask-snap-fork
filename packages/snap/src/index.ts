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

import { Slip39 as slip39 } from './slip39';
import { cleanData } from './requests/clean-data';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    // snap_dialog
    case 'hello':
      return await helloSnap();
    // snap_getBip44Entropy - snap_dialog
    case 'protect_private_key':
      return await generateShares(request, slip39);
    // snap_getBip44Entropy - snap_dialog
    case 'recover':
      return await recoverPrivateKey(request, slip39);
    // snap_manageState - snap_dialog
    case 'clean_data':
      return await cleanData();
    // snap_manageState - snap_dialog
    case 'check_address':
      return await checkAddress(request);
    // snap_manageState - snap_dialog
    case 'get_addresses':
      return await getAddresses();
    // snap_manageState - snap_dialog
    case 'save_address':
      return await saveAddress();
    default:
      throw new Error('Method not found.');
  }
};

// endowment:transaction-insight
export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  return onTransactionHandler(transaction);
};
