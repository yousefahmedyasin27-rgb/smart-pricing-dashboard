// هذا هو ملف src/core/costRouter.ts من العقل القديم
import { ExecLog } from "./types";
import { logEvent } from "./logger";
import { calculateDynamicCost } from "./commodity"; // تأكد أن اسم الملف صحيح
import { ForexLive } from "./forex";

const COUNTRY_TO_CURRENCY: Record<string, string> = {
    "EG": "EGP", "SA": "SAR", "AE": "AED", "US": "USD", "UK": "GBP", "EU": "EUR"
    };

    export async function calculateUniversalCost(industry: string, country: string, breakdown: any, logs: ExecLog[]) {
      const targetCurrency = COUNTRY_TO_CURRENCY[country] || "USD";

        if ((industry || "").toLowerCase() === "jewelry") {
              logEvent(logs, `[ROUTER] Routing '${industry}' project to Commodity Engine`, "INFO");
                    // نمرر العملة المستهدفة لمحرك السلع
                          const cost = await calculateDynamicCost(breakdown, targetCurrency, logs);
                                return { amount: cost, currency: targetCurrency };
                                  }

                                    logEvent(logs, `[ROUTER] Routing '${industry}' project to General Summation`, "INFO");
                                      let total = 0;
                                        for (const key in breakdown) {
                                              const val = Number(breakdown[key]);
                                                    if (!isNaN(val)) total += val;
                                                      }
                                                        
                                                          return { amount: total, currency: targetCurrency };
                                                          }