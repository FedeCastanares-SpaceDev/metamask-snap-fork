import { getBIP44AddressKeyDeriver } from "@metamask/key-tree";

export const getUserAddress = async (index: number) => {
  const ethNode = await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 60,
    },
  });

  const deriveAddress = await getBIP44AddressKeyDeriver(ethNode);

  return deriveAddress(index)
};
