/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🛑 DEPRECATED — PHASE 14H.4 🛑
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * THIS FILE IS DELETED/NEUTRALIZED.
 * 
 * SAP PFCG RULE: EXACT MATCH ONLY
 * - No permission inference
 * - No derived permissions
 * - No auto-add .read/.access
 * 
 * If you need permissions, use ONLY what is stored in DB.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * DEPRECATED: This function previously performed permission inference.
 * Now it simply returns the input array unchanged.
 * 
 * SAP PFCG: Exact match only. No inference.
 */
export function normalizePermissions(explicitPerms: string[]): string[] {
    // PHASE 14H.4: NO INFERENCE - return exact permissions only
    return [...explicitPerms];
}
