// هذا هو ملف src/api/routes/analyze.ts من العقل القديم
// ولكنه معدل ليعمل كـ Next.js API Route

import { calculateUniversalCost } from "../core/costRouter";
import { advisePrice } from "../core/advisor";
import { logEvent } from "../core/logger";
import { InputJSON, ExecLog, FinancialReport } from "../core/types";
import { NextResponse } from 'next/server';

// دالة التشغيل (POST)
export async function POST(req: Request) {
  const input: InputJSON = await req.json();
    const logs: ExecLog[] = [];
      const start = Date.now();

        try {
            logEvent(logs, `[API] Incoming request for project: ${input.project_name || 'Untitled'}`, "INFO");

                const costResult = await calculateUniversalCost(
                        input.industry_type || 'retail',
                                input.target_country || 'US',
                                        input.cost_breakdown || {},
                                                logs
                                                    );

                                                        const advisorResult = advisePrice(
                                                                costResult.amount,
                                                                        Number(input.target_margin) || 60,
                                                                                Number(input.current_price) || 0,
                                                                                        logs
                                                                                            );

                                                                                                const report: FinancialReport = {
                                                                                                        project: input.project_name || "Untitled",
                                                                                                                country: input.target_country || "US",
                                                                                                                        industry: input.industry_type || "retail",
                                                                                                                                currency: costResult.currency,
                                                                                                                                        computed_cost: Number(costResult.amount.toFixed(2)),
                                                                                                                                                current_price: Number(input.current_price) || 0,
                                                                                                                                                        advisor: advisorResult,
                                                                                                                                                                logs: logs,
                                                                                                                                                                        timestamp: new Date().toISOString(),
                                                                                                                                                                                meta: { version: "v3.0 - Integrated", engine: "SmartPricingCore" }
                                                                                                                                                                                    };

                                                                                                                                                                                        logEvent(logs, `[API] Request completed in ${Date.now() - start}ms`, "SUCCESS");
                                                                                                                                                                                            
                                                                                                                                                                                                // إرجاع الرد كـ JSON
                                                                                                                                                                                                    return NextResponse.json(report);

                                                                                                                                                                                                      } catch (error: any) {
                                                                                                                                                                                                          logEvent(logs, `[API] CRITICAL FAILURE: ${error.message}`, "ERROR");
                                                                                                                                                                                                              
                                                                                                                                                                                                                  // إرجاع رد خطأ كـ JSON
                                                                                                                                                                                                                      return NextResponse.json(
                                                                                                                                                                                                                            { error: "Internal Server Error", details: error.message, logs },
                                                                                                                                                                                                                                  { status: 500 }
                                                                                                                                                                                                                                      );
                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                        }