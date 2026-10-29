/**
 * CampusVault Rule-12-Compliant AI Copilot
 * 
 * Complies with Rule 12:
 * Every AI recommendation must include the advisory badge:
 * "AI Advisory Only — Final Decision Requires Authorized Human Manager Approval"
 * 
 * Supports Google Gemini API if GEMINI_API_KEY is present in environment,
 * with deterministic rule-based fallback so the system is 100% operational in any state.
 */

const RULE_12_DISCLAIMER = 'AI Advisory Only — Final Decision Requires Authorized Human Manager Approval';

/**
 * Natural language resource matching
 */
async function matchResourcesForQuery(query, resources = [], currentUser = {}) {
  const normalizedQuery = (query || '').toLowerCase().trim();

  // Try Gemini API if key is configured
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const geminiResult = await callGeminiMatcher(normalizedQuery, resources, currentUser, apiKey);
      if (geminiResult && geminiResult.length > 0) {
        return {
          matches: geminiResult,
          mode: 'gemini-live',
          disclaimer: RULE_12_DISCLAIMER,
        };
      }
    } catch (apiErr) {
      console.warn('[AI Copilot] Gemini API call failed, falling back to deterministic engine:', apiErr.message);
    }
  }

  // Deterministic Rule-Based Fallback
  const matches = resources.map((resource) => {
    let score = 20;
    const nameLower = resource.name.toLowerCase();
    const categoryLower = resource.category.toLowerCase();
    const rulesLower = (resource.usageRules || '').toLowerCase();
    const locationLower = (resource.location || '').toLowerCase();

    // Keyword matching rules
    const keywords = normalizedQuery.split(/\s+/).filter((w) => w.length > 2);
    let matchedKeywords = [];

    keywords.forEach((word) => {
      if (nameLower.includes(word)) {
        score += 35;
        matchedKeywords.push(word);
      } else if (categoryLower.includes(word)) {
        score += 25;
        matchedKeywords.push(word);
      } else if (rulesLower.includes(word) || locationLower.includes(word)) {
        score += 15;
        matchedKeywords.push(word);
      }
    });

    // Semantic domain associations
    if (/drone|frame|cnc|mill|metal|precision|cut|carbon/i.test(normalizedQuery)) {
      if (resource.category === 'Fabrication' || nameLower.includes('cnc')) score += 30;
    }
    if (/print|3d|sls|pla|rapid|prototype|model/i.test(normalizedQuery)) {
      if (nameLower.includes('3d') || nameLower.includes('sls') || resource.category === 'Fabrication') score += 35;
    }
    if (/laser|acrylic|engrave|sheet|box/i.test(normalizedQuery)) {
      if (nameLower.includes('laser') || resource.category === 'Fabrication') score += 35;
    }
    if (/circuit|voltage|oscilloscope|frequency|solder|pcb|test|signal/i.test(normalizedQuery)) {
      if (resource.category === 'Lab Equipment' || nameLower.includes('oscilloscope')) score += 35;
    }
    if (/video|camera|sony|film|shoot|audio|mic|podcast|cinema/i.test(normalizedQuery)) {
      if (resource.category === 'Media Gear' || nameLower.includes('sony') || nameLower.includes('cinema')) score += 35;
    }
    if (/meeting|pitch|seminar|presentation|team|collab|study/i.test(normalizedQuery)) {
      if (resource.category === 'Space' || nameLower.includes('pod') || nameLower.includes('pitch')) score += 35;
    }

    // Badge eligibility check for current user
    const userBadges = Array.isArray(currentUser.badges) ? currentUser.badges : [];
    const missingBadges = (resource.requiredBadges || []).filter((b) => !userBadges.includes(b));
    const isEligible = missingBadges.length === 0;

    // Reason formulation
    let matchReason = `Matches project needs in category "${resource.category}" at ${resource.location}.`;
    if (matchedKeywords.length > 0) {
      matchReason = `Direct match for keywords: [${matchedKeywords.join(', ')}] with ${resource.category} specifications.`;
    }

    return {
      resourceId: resource._id,
      name: resource.name,
      category: resource.category,
      location: resource.location,
      riskTier: resource.riskTier,
      status: resource.status,
      matchScore: Math.min(98, score),
      matchReason,
      isEligible,
      missingBadges,
      requiredBadges: resource.requiredBadges || [],
    };
  });

  // Sort descending by matchScore
  matches.sort((a, b) => b.matchScore - a.matchScore);

  return {
    query,
    matches: matches.slice(0, 4),
    mode: 'deterministic-fallback',
    disclaimer: RULE_12_DISCLAIMER,
  };
}

/**
 * Incident & Condition Diff Analysis
 */
async function generateIncidentAndConditionAdvisory(conditionLog = {}, incidentDescription = '') {
  const beforeRating = conditionLog.checkInRating || 'GOOD';
  const afterRating = conditionLog.checkOutRating || 'GOOD';
  const beforeNotes = conditionLog.checkInNotes || 'Clean check-in';
  const afterNotes = conditionLog.checkOutNotes || '';
  const damageFlagged = conditionLog.damageFlagged || afterRating === 'DAMAGED';

  let severity = 'LOW';
  let recommendedAction = 'Mark as Clean Return, Restore Resource to Available Status.';
  let summary = `Equipment returned in ${afterRating} condition compared to ${beforeRating} at check-in. Standard wear verified within normal educational thresholds.`;

  if (damageFlagged || afterRating === 'DAMAGED') {
    severity = 'CRITICAL';
    recommendedAction = 'Place Resource on MAINTENANCE_HOLD immediately. Inspect hardware physically, deduct repair estimate from student security deposit if applicable, and reschedule downstream bookings.';
    summary = `Damage detected during checkout! Before: ${beforeRating} ("${beforeNotes}") vs After: ${afterRating} ("${afterNotes || incidentDescription}"). Potential mechanical/optical degradation flagged.`;
  } else if (afterRating === 'MINOR_WEAR' && beforeRating === 'MINT') {
    severity = 'MEDIUM';
    recommendedAction = 'Perform routine surface wipe-down and calibration check before next user.';
    summary = `Minor cosmetic wear detected. Cleanliness and calibration check recommended before high-precision jobs.`;
  }

  return {
    severity,
    summary,
    recommendedAction,
    damageFlagged,
    beforeState: { rating: beforeRating, notes: beforeNotes },
    afterState: { rating: afterRating, notes: afterNotes },
    disclaimer: RULE_12_DISCLAIMER,
  };
}

/**
 * Helper to call Google Gemini API if user provides GEMINI_API_KEY
 */
async function callGeminiMatcher(query, resources, currentUser, apiKey) {
  const prompt = `You are CampusVault AI Copilot. A student asks: "${query}".
Available Campus Resources:
${JSON.stringify(resources.map(r => ({ id: r._id, name: r.name, category: r.category, location: r.location, badges: r.requiredBadges, risk: r.riskTier })))}
User Badges: ${JSON.stringify(currentUser.badges || [])}
Return a valid JSON array of top matching items, each with: { "resourceId": string, "matchScore": number (50-100), "matchReason": string }. Return ONLY valid JSON.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const jsonMatch = rawText.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return null;
}

module.exports = {
  matchResourcesForQuery,
  generateIncidentAndConditionAdvisory,
  RULE_12_DISCLAIMER,
};
