import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format: PH26-YY-NNNN
 * PH26 = PROTOHACK 2026
 * YY = Year of study (01 for 1st Year, 02 for 2nd Year, etc.)
 * NNNN = Normal order sequence number (0001, 0002, ...)
 */
export function formatParticipantId(yearOfStudy: number | string, sequence: number): string {
  const yearNum = typeof yearOfStudy === "string" ? parseInt(yearOfStudy, 10) || 1 : yearOfStudy;
  const yearPad = yearNum.toString().padStart(2, "0");
  const orderPad = sequence.toString().padStart(4, "0");
  return `PH26-${yearPad}-${orderPad}`;
}

/**
 * Format: XXXXXX
 * 6-character uppercase alphanumeric unique code
 */
export function generateTeamCode(teamNumber: number = 1): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomCode = "";
  for (let i = 0; i < 6; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randomCode;
}
