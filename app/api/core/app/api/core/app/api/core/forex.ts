// هذا هو ملف src/engines/forex.ts من العقل القديم
import { ExecLog } from "./types";
import { logEvent } from "./logger";

export class ForexLive {
  private static FALLBACK_RATES: Record<string, number> = {
        "USD": 1, "EGP": 48.50, "SAR": 3.75, "AED": 3.67, "EUR": 0.92, "GBP": 0.79
          };

            static async getRate(targetCurrency: string, logs: ExecLog[]): Promise<number> {
                  if (targetCurrency === "USD") return 1;
                        const rate = this.FALLBACK_RATES[targetCurrency] || 1;
                              if (rate === 1 && targetCurrency !== "USD") {
                                        logEvent(logs, `[FOREX] Warning: No rate found for ${targetCurrency}, defaulting to 1.0`, "WARN");
                                              }
                                                    return rate;
                                                      }

                                                        static async convertFromUSD(amountUSD: number, targetCurrency: string, logs: ExecLog[]): Promise<number> {
                                                              const rate = await this.getRate(targetCurrency, logs);
                                                                    const converted = amountUSD * rate;
                                                                          logEvent(logs, `[FOREX] Converted $${amountUSD.toFixed(2)} -> ${converted.toFixed(2)} ${targetCurrency} (Rate: ${rate})`, "INFO");
                                                                                return converted;
                                                                                  }
                                                                                  }
                                                                                  