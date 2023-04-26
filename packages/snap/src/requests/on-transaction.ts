import { Json } from '@metamask/snaps-types';
import { panel, heading, text } from '@metamask/snaps-ui';
import { getData } from '../helpers/store-management.helper';

export const onTransactionHandler = async (transaction: {
  [key: string]: Json;
}) => {
  const persistedData = await getData();
  const txTo = transaction.to;
  let addressIsStored: { name: string; address: string } | undefined;

  if (
    persistedData?.addresses &&
    persistedData?.addresses instanceof Array &&
    persistedData?.addresses.length > 0
  ) {
    persistedData.addresses.forEach((value: any) => {
      if (
        value.address.toLowerCase() ===
        JSON.stringify(txTo)
          .substring(1, JSON.stringify(txTo).length - 1)
          .toLowerCase()
      ) {
        addressIsStored = { name: value.name, address: value.address };
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
      text(`**${addressIsStored?.name ?? ''}**`),
    ]),
  };
};
