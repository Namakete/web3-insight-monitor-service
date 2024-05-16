import { Balance } from '@models/balance.model';

export interface NetworkBalance {
  network: string;
  Value: Balance[];
}
