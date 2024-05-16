export interface TokenData {
  Amount: number;
  Price: number;
  USD: number;
}

export interface Balance {
  Token: string;
  Data: TokenData;
}
