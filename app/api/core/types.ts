// هذا الملف هو "اللغة المشتركة" للنظام كله
// (هو هو نفس ملف src/types/index.ts من العقل القديم)

export type ExecLog = { t: string; lvl: string; msg: string; detail?: any };

export interface InputJSON {
  project_name?: string;
    industry_type?: string;
      target_country?: string;
        target_margin?: number | string;
          current_price?: number | string;
            cost_breakdown?: any;
              currency_symbol?: string;
                feedback_outcomes?: any[];
                  project_id?: string;
                  }

                  export interface FinancialReport {
                    project: string;
                      country: string;
                        industry: string;
                          currency: string;
                            computed_cost: number;
                              current_price: number;
                                advisor: {
                                    recommendedPrice: number;
                                        targetMargin: number;
                                            action: string;
                                                priceDifference: number;
                                                  };
                                                    logs: ExecLog[];
                                                      timestamp: string;
                                                        meta: {
                                                            version: string;
                                                                engine: string;
                                                                  };
                                                                  }
                                                                  