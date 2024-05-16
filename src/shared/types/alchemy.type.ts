export interface TokenData {
  Amount: number;
  Price: number;
  USD: number;
}

export interface Balance {
  Token: string;
  Data: TokenData;
}

export interface NetworkBalance {
  network: string;
  Value: Balance[];
}

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
