export interface Transaction {
  hash: string;
  isError: string;
  blockNumber: string;
  timeStamp: number;
  from: string;
  to: string;
  value: string;
  gasUsed: number;
  gasPrice: string;
}

export interface MappedTransaction {
  transactionHash: string;
  status: 'Success' | 'Failed';
  block: number;
  timestamp: Date;
  from: string;
  to: string;
  value: string;
  coin: string;
  transactionFee: string;
  gasPrice: string;
}
