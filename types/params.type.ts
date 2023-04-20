export type ParamsType = {
  threshold: string;
  passphrase: string;
  groups: [number, number, string][];
};

export type RecoverParamsType = {
  passphrase: string;
  shares: string[];
};
