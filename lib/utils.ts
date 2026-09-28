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
 * Format: PHTNN-XXXX
 * PHT = ProtoHack Team
 * NN = Team sequential number (01, 02, ...)
 * XXXX = Unique 4-character uppercase alphanumeric code (e.g. DWFW)
 */
export function generateTeamCode(teamNumber: number = 1): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomSuffix = "";
  for (let i = 0; i < 4; i++) {
    randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const teamNumPad = (teamNumber % 100).toString().padStart(2, "0");
  return `PHT${teamNumPad}-${randomSuffix}`;
}
