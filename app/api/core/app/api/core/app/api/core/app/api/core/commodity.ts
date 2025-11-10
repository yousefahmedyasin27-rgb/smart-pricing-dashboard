// هذا هو ملف src/engines/commodity.ts من العقل القديم
import axios from "axios";
import { ExecLog } from "./types";
import { logEvent } from "./logger";
import { ForexLive } from "./forex";

const TROY_OUNCE_IN_GRAMS = 31.1035;

async function getLiveMetalData(metal: "gold"|"silver", logs: ExecLog[]) {
    try {
            const apiKey = process.env.METAL_API_KEY;
                    if (!apiKey) throw new Error("No API Key");

                            // Production: replace with real API call using axios and apiKey
                                    // Example (commented):
                                            // const symbol = metal === 'gold' ? 'XAU' : 'XAG';
                                                    // const url = `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=USD&currencies=${symbol}`;
                                                            // const res = await axios.get(url, { timeout: 5000 });
                                                                    // return res.data.rates[symbol] / TROY_OUNCE_IN_GRAMS;

                                                                            throw new Error("API Key missing (simulating fallback)");
                                                                                } catch (e:any) {
                                                                                        logEvent(logs, `[COMMODITY] Live fetch failed, using fallback for ${metal}`, "WARN");
                                                                                                return metal === 'gold' ? 65.50 : 1.25; // fallback USD per gram
                                                                                                    }
                                                                                                    }

                                                                                                    export async function calculateDynamicCost(jewelryModel: any, targetCurrency: string, logs: ExecLog[]): Promise<number> {
                                                                                                      const type = (jewelryModel.material_type || "").toLowerCase();
                                                                                                        const weight = Number(jewelryModel.material_weight_g || jewelryModel.material_weight || 0);
                                                                                                          const localMfgCost = Number(jewelryModel.manufacturing_cost || jewelryModel.mfg_cost || 0);

                                                                                                            let rateUSD = 0;
                                                                                                              if (type.includes("gold")) rateUSD = await getLiveMetalData("gold", logs);
                                                                                                                else if (type.includes("silver")) rateUSD = await getLiveMetalData("silver", logs);
                                                                                                                  else {
                                                                                                                        rateUSD = Number(jewelryModel.current_market_rate || 0);
                                                                                                                              logEvent(logs, `[COMMODITY] Unknown material '${type}', using provided rate: $${rateUSD}`, "INFO");
                                                                                                                                }

                                                                                                                                  const rawUSD = weight * rateUSD;
                                                                                                                                    const rawLocal = await ForexLive.convertFromUSD(rawUSD, targetCurrency, logs);
                                                                                                                                      const total = rawLocal + localMfgCost;

                                                                                                                                        logEvent(logs, `[COMMODITY] Finished: ${weight}g * $${rateUSD}/g = $${rawUSD.toFixed(2)} -> ${rawLocal.toFixed(2)} ${targetCurrency} + Mfg(${localMfgCost}) = ${total.toFixed(2)} ${targetCurrency}`, "INFO");
                                                                                                                                          return total;
                                                                                                                                          }
                                                                                                                                          