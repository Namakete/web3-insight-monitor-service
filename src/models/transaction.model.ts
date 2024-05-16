export interface Transaction {
  transactionHash: string;
  status: string;
  block: number;
  timestamp: Date;
  from: string;
  to: string;
  value: string;
  coin: string;
  transactionFee: string;
  gasPrice: string;
}
