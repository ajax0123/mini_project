import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatINR(amount: number): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "0";
  const num = Math.round(amount);
  const numStr = num.toString();

  if (numStr.length <= 3) return numStr;

  const lastThree = numStr.slice(-3);
  const remaining = numStr.slice(0, -3);
  const formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return formatted + "," + lastThree;
}

export function calcEMI(principal: number, ratePerAnnum: number, tenureMonths: number): string {
  const r = ratePerAnnum / 12 / 100;
  if (r === 0) return formatINR(principal / tenureMonths);
  const emi = (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
  return formatINR(Math.round(emi));
}
