import { createHash, randomBytes } from "crypto";

export function generateInviteToken(): string {
    return randomBytes(32).toString("base64url");
}

export function hashInviteToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

export function buildQuestionnaireUrl(token: string): string {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return `${baseUrl}/supplier/questionnaire/${token}`;
}
