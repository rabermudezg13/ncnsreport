import { clsx,type ClassValue } from "clsx";import { twMerge } from "tailwind-merge";
export function cn(...inputs:ClassValue[]){return twMerge(clsx(inputs))}
export const normalizePhone=(v:string)=>v.replace(/\D/g,"");
export const offenderLevel=(count:number,thresholds={repeat:2,frequent:3,high:4})=>count>=thresholds.high?"High Frequency":count>=thresholds.frequent?"Frequent":count>=thresholds.repeat?"Repeat Offender":"First Incident";
