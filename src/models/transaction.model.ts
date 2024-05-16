export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: number;
  asset: string;
  category: string;
  blockNum: string;
  timestamp: string;
}
