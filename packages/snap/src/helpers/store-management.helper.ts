export const getData = async () => {
  try {
    const data = await snap.request({
      method: 'snap_manageState',
      params: { operation: 'get' },
    });
    return data;
  } catch (error) {
    return undefined;
  }
};

export const saveAddressStoreManagement = async (newAddress: {
  name: string;
  address: string;
}) => {
  const persistedData = await getData();

  if (!persistedData) {
    try {
      await snap.request({
        method: 'snap_manageState',
        params: {
          operation: 'update',
          newState: { addresses: [newAddress] },
        },
      });
    } catch (error) {
      console.error('error updating: ', error.message);
    }
  } else if (
    persistedData.addresses &&
    persistedData.addresses instanceof Array
  ) {
    const addresessCopy = persistedData.addresses;
    try {
      await snap.request({
        method: 'snap_manageState',
        params: {
          operation: 'update',
          newState: {
            addresses: [...addresessCopy, newAddress],
          },
        },
      });
    } catch (error) {
      console.error('error updating: ', error.message);
    }
  }
};
