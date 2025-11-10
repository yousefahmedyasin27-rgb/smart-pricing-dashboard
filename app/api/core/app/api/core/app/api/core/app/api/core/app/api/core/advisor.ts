// هذا هو ملف src/engines/advisor.ts من العقل القديم
import { ExecLog } from "./types";
import { logEvent } from "./logger";

export function advisePrice(cost: number, targetMarginPct: number, currentPrice: number = 0, logs: ExecLog[]) {
  const target = (targetMarginPct >= 5 && targetMarginPct <= 95) ? Number(targetMarginPct) : 60;
    if (target !== Number(targetMarginPct)) logEvent(logs, `[ADVISOR] Adjusted suspicious target margin from ${targetMarginPct}% to ${target}%`, "WARN");

      const recommended = cost / (1 - (target / 100));
        
          let action = "HOLD";
            let diff = 0;

              if (currentPrice > 0) {
                    diff = recommended - currentPrice;
                          if (Math.abs(diff / currentPrice) < 0.01) {
                                    action = "MAINTAIN";
                                          } else if (recommended > currentPrice) {
                                                    action = "RAISE";
                                                          } else {
                                                                    action = "LOWER";
                                                                          }
                                                                            } else {
                                                                                  action = "SET_PRICE";
                                                                                    }

                                                                                      logEvent(logs, `[ADVISOR] Decision: ${action} (Current: ${currentPrice} | Rec: ${recommended.toFixed(2)})`, "INFO");
                                                                                        return { 
                                                                                              recommendedPrice: Number(recommended.toFixed(2)), 
                                                                                                    targetMargin: target, 
                                                                                                          action, 
                                                                                                                priceDifference: Number(diff.toFixed(2)) 
                                                                                                                  };
                                                                                                                  }
                                                                                                                  