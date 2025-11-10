// هذا هو ملف src/utils/logger.ts من العقل القديم
import { ExecLog } from "./types"; // لاحظ إنه بيقرأ من الملف اللي لسه عاملينه

export function nowISO(){ return new Date().toISOString(); }

export function logEvent(logs: ExecLog[], msg: string, lvl: string = "INFO", detail?: any){
  logs.push({ t: nowISO(), lvl, msg, detail });
    // Uncomment for console debug:
      // console.log(`[${new Date().toLocaleTimeString()}] [${lvl}] ${msg}`, detail ? detail : '');
      }
