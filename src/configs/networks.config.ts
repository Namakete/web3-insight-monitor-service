import { Injectable } from '@nestjs/common';
import { NETWORKS_CONFIG } from '@shared/constants/networks.constant';

@Injectable()
export class NetworksConfigService {
  getNetworksConfig = () => NETWORKS_CONFIG;
}
