import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);
  private readonly baseUrl =
    'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';
  private readonly apiKey = process.env.COINMARKETCAP_API_KEY;
  private readonly maxRetries = 5;
  private readonly retryDelay = 2000;
  private priceCache: { [key: string]: { price: number; timestamp: number } } =
    {};
  private cacheExpiry = 300000;

  async getPrices(symbols: string[]): Promise<{ [key: string]: number }> {
    const now = Date.now();
    const { cachedPrices, symbolsToFetch } = this.getCachedPrices(symbols, now);

    if (symbolsToFetch.length === 0) return cachedPrices;

    await this.fetchAndCachePrices(symbolsToFetch, now);

    return { ...cachedPrices, ...this.getUpdatedPrices(symbols) };
  }

  private getCachedPrices(symbols: string[], now: number) {
    const cachedPrices: { [key: string]: number } = {};
    const symbolsToFetch = symbols.filter((symbol) => {
      if (
        this.priceCache[symbol] &&
        now - this.priceCache[symbol].timestamp < this.cacheExpiry
      ) {
        cachedPrices[symbol] = this.priceCache[symbol].price;
        return false;
      }
      return true;
    });
    return { cachedPrices, symbolsToFetch };
  }

  private async fetchAndCachePrices(
    symbols: string[],
    timestamp: number,
  ): Promise<void> {
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await axios.get(this.baseUrl, {
          params: { symbol: symbols.join(','), convert: 'USD' },
          headers: { 'X-CMC_PRO_API_KEY': this.apiKey },
        });

        this.logger.debug(
          'CoinMarketCap API response:',
          JSON.stringify(response.data, null, 2),
        );

        symbols.forEach((symbol) => {
          const upperSymbol = symbol.toUpperCase();
          const priceData = response.data.data[upperSymbol]?.quote.USD?.price;
          if (priceData !== undefined) {
            this.priceCache[symbol] = { price: priceData, timestamp };
          } else {
            this.logger.warn(`Price data for symbol ${symbol} not found.`);
          }
        });

        return;
      } catch (error) {
        if (error.response?.status === 429) {
          this.logger.warn(
            `Rate limit exceeded. Retrying in ${this.retryDelay / 1000} seconds...`,
          );
          await this.sleep(this.retryDelay);
        } else {
          this.logger.error(`Error fetching prices: ${error.message}`, error);
          throw new Error(`Error fetching prices: ${error.message}`);
        }
      }
    }
    throw new Error('Failed to fetch prices after multiple attempts.');
  }

  private getUpdatedPrices(symbols: string[]): { [key: string]: number } {
    return symbols.reduce((acc, symbol) => {
      acc[symbol] = this.priceCache[symbol]?.price || 0;
      return acc;
    }, {});
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
