import { NodeType } from '@metamask/snaps-ui';

export type arraySharesToTextAndCopyType = {
  value: string;
  type: NodeType.Copyable | NodeType.Text;
};
