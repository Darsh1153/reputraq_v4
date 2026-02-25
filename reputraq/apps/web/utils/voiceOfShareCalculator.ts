/**
 * Share of Voice Calculator Utility
 * 
 * Calculates Share of Voice metric based on article reach and publication monthly reach
 * Uses tiered percentage system as specified in the requirements
 */

export interface VoiceOfShareResult {
  totalVoiceOfShare: number;
  averageVoiceOfShare: number;
  articleCount: number;
  breakdown: {
    tier: string;
    articleCount: number;
    totalReach: number;
  }[];
}

/**
 * Reach percentage multipliers based on monthly reach ranges
 * Based on the tiered system:
 * - More than 25mn: 1%
 * - Between 15mn and 25mn: 1.5%
 * - Between 5mn and 15mn: 2%
 * - Between 1mn and 5mn: 2.5%
 * - Between 500k to 1mn: 3%
 * - Between 250k to 500k: 5%
 * - Between 10k to 250k: 10%
 */
const VOICE_OF_SHARE_MULTIPLIERS = [
  { min: 25000000, max: Infinity, percentage: 0.01, label: 'More than 25mn' },
  { min: 15000000, max: 25000000, percentage: 0.015, label: '15mn - 25mn' },
  { min: 5000000, max: 15000000, percentage: 0.02, label: '5mn - 15mn' },
  { min: 1000000, max: 5000000, percentage: 0.025, label: '1mn - 5mn' },
  { min: 500000, max: 1000000, percentage: 0.03, label: '500k - 1mn' },
  { min: 250000, max: 500000, percentage: 0.05, label: '250k - 500k' },
  { min: 10000, max: 250000, percentage: 0.1, label: '10k - 250k' },
];

/**
 * Generate a deterministic hash from a string
 * This ensures consistent values for the same input
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate deterministic bounce and drop rates based on article properties
 * This ensures the same article always gets the same rates
 */
function getDeterministicRates(sourceName: string, keyword: string, url: string): { bounceRate: number; dropRate: number } {
  // Create a unique identifier from article properties
  const identifier = `${sourceName}|${keyword}|${url}`;
  const hash = hashString(identifier);
  
  // Generate deterministic rates within specified ranges
  // Use hash to create consistent values between 0 and 1
  const normalizedHash = (hash % 10000) / 10000; // 0 to 1
  
  // Bounce rate: 50-60% (0.5 to 0.6)
  const bounceRate = 0.5 + (normalizedHash * 0.1);
  
  // Drop rate: 35-38% (0.35 to 0.38)
  // Use a different part of the hash for drop rate
  const dropHash = hashString(`${identifier}_drop`);
  const normalizedDropHash = (dropHash % 10000) / 10000;
  const dropRate = 0.35 + (normalizedDropHash * 0.03);
  
  return { bounceRate, dropRate };
}

/**
 * Get percentage multiplier and tier label based on monthly reach
 */
function getVoiceOfShareMultiplier(monthlyReach: number): { percentage: number; tier: string } {
  for (const range of VOICE_OF_SHARE_MULTIPLIERS) {
    if (monthlyReach >= range.min && monthlyReach < range.max) {
      return { percentage: range.percentage, tier: range.label };
    }
  }
  // Default to lowest tier if below 10k
  return { percentage: 0.1, tier: 'Below 10k' };
}

/**
 * Calculate Share of Voice for a single article
 * 
 * @param monthlyReach - Monthly website visits of the publication
 * @param sourceName - Source name for deterministic calculation
 * @param keyword - Keyword for deterministic calculation
 * @param url - URL for deterministic calculation
 * @param bounceRate - Bounce rate (optional, will be calculated deterministically if not provided)
 * @param dropRate - Drop rate (optional, will be calculated deterministically if not provided)
 * @returns Estimated article reach (Share of Voice)
 */
export function calculateArticleVoiceOfShare(
  monthlyReach: number,
  sourceName?: string,
  keyword?: string,
  url?: string,
  bounceRate?: number,
  dropRate?: number
): number {
  console.log('Calculating Share of Voice for monthly reach:', monthlyReach);
  
  // Use provided rates or generate deterministic rates based on article properties
  let finalBounceRate: number;
  let finalDropRate: number;
  
  if (bounceRate !== undefined && dropRate !== undefined) {
    // Use provided rates
    finalBounceRate = bounceRate;
    finalDropRate = dropRate;
  } else if (sourceName && keyword && url) {
    // Generate deterministic rates based on article properties
    const rates = getDeterministicRates(sourceName, keyword, url);
    finalBounceRate = rates.bounceRate;
    finalDropRate = rates.dropRate;
  } else {
    // Fallback: use average rates (55% bounce, 36.5% drop)
    finalBounceRate = 0.55;
    finalDropRate = 0.365;
  }
  
  // Get percentage multiplier based on monthly reach
  const { percentage } = getVoiceOfShareMultiplier(monthlyReach);
  
  // Calculate base estimated reach: monthlyReach * percentage
  const baseEstimatedReach = monthlyReach * percentage;
  
  // Apply bounce rate: visitors leaving from home page
  const afterBounceRate = baseEstimatedReach * (1 - finalBounceRate);
  
  // Apply drop rate: visitors not reaching article due to distraction
  const finalEstimatedReach = afterBounceRate * (1 - finalDropRate);
  
  console.log('Share of Voice calculation:', {
    monthlyReach,
    percentage,
    baseEstimatedReach,
    bounceRate: finalBounceRate,
    dropRate: finalDropRate,
    finalEstimatedReach
  });
  
  return Math.round(finalEstimatedReach);
}

/**
 * Calculate total Share of Voice across all articles
 * 
 * @param articles - Array of articles with estimatedReach or monthlyReach data
 * @returns VoiceOfShareResult with total, average, and breakdown
 */
export function calculateTotalVoiceOfShare(articles: any[]): VoiceOfShareResult {
  console.log('Calculating total Share of Voice for', articles.length, 'articles');
  
  if (articles.length === 0) {
    return {
      totalVoiceOfShare: 0,
      averageVoiceOfShare: 0,
      articleCount: 0,
      breakdown: []
    };
  }
  
  // Track breakdown by tier
  const tierBreakdown: Record<string, { count: number; totalReach: number }> = {};
  
  let totalVoiceOfShare = 0;
  
  articles.forEach(article => {
    // Check if Share of Voice is already calculated and stored
    let articleVoiceOfShare = article.estimatedReach?.voiceOfShare;
    
    if (articleVoiceOfShare === undefined) {
      // Need to calculate Share of Voice
      // Get monthly reach from article's estimatedReach or calculate it
      let monthlyReach = 0;
      
      if (article.estimatedReach?.monthlyReach) {
        monthlyReach = article.estimatedReach.monthlyReach;
      } else if (article.estimatedReach?.finalEstimatedReach) {
        // Reverse calculate monthly reach from final estimated reach
        // This is approximate, but gives us a baseline
        const finalReach = article.estimatedReach.finalEstimatedReach;
        // Approximate: finalReach ≈ monthlyReach * percentage * (1 - bounce) * (1 - drop)
        // Assuming average bounce (55%) and drop (36.5%)
        monthlyReach = finalReach / (0.01 * 0.45 * 0.635); // Rough approximation
      } else {
        // Estimate monthly reach from source name if available
        try {
          const { estimatePublicationMonthlyReach } = require('./reachCalculator');
          monthlyReach = estimatePublicationMonthlyReach(
            article.sourceName || 'Unknown Source',
            article.url,
            article.keyword,
            article.engagement
          );
        } catch (error) {
          console.log('Error estimating monthly reach:', error);
          // Fallback: use a default estimate based on source name
          monthlyReach = 100000; // Default 100k monthly reach
        }
      }
      
      // Calculate Share of Voice deterministically using article properties
      articleVoiceOfShare = calculateArticleVoiceOfShare(
        monthlyReach,
        article.sourceName || 'Unknown Source',
        article.keyword,
        article.url
      );
      
      // Store the calculated value in the article (for future use)
      if (article.estimatedReach) {
        article.estimatedReach.voiceOfShare = articleVoiceOfShare;
      } else {
        article.estimatedReach = {
          monthlyReach,
          finalEstimatedReach: 0,
          reachRange: '',
          percentageMultiplier: 0,
          voiceOfShare: articleVoiceOfShare
        };
      }
    }
    
    totalVoiceOfShare += articleVoiceOfShare;
    
    // Track by tier (need monthly reach for tier)
    let monthlyReach = article.estimatedReach?.monthlyReach || 100000;
    const { tier } = getVoiceOfShareMultiplier(monthlyReach);
    if (!tierBreakdown[tier]) {
      tierBreakdown[tier] = { count: 0, totalReach: 0 };
    }
    tierBreakdown[tier].count += 1;
    tierBreakdown[tier].totalReach += articleVoiceOfShare;
  });
  
  // Convert breakdown to array format
  const breakdown = Object.entries(tierBreakdown).map(([tier, data]) => ({
    tier,
    articleCount: data.count,
    totalReach: data.totalReach
  })).sort((a, b) => b.totalReach - a.totalReach);
  
  const averageVoiceOfShare = totalVoiceOfShare / articles.length;
  
  console.log('Total Share of Voice calculated:', {
    totalVoiceOfShare,
    averageVoiceOfShare,
    articleCount: articles.length,
    breakdown
  });
  
  return {
    totalVoiceOfShare: Math.round(totalVoiceOfShare),
    averageVoiceOfShare: Math.round(averageVoiceOfShare),
    articleCount: articles.length,
    breakdown
  };
}

/**
 * Format number for display
 */
export function formatVoiceOfShareNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

