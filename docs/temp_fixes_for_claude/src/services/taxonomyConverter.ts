import { convertToMFA } from '../api/codeMapping';

export const formatNNAAddress = (layer: string, category: string, subcategory: string, sequential: string = '000'): { hfn: string; mfa: string } => {
  const hfn = `${layer}.${category}.${subcategory}.${sequential}`;
  const mfa = convertToMFA(layer, category, subcategory, sequential);
  return { hfn, mfa };
};