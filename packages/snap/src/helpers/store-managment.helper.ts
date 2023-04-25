export async function getData() {
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
