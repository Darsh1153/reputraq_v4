/**
 * Article Reach Enrichment Helper
 * 
 * Adds estimated reach data to articles
 */

import { NewsArticle } from '@/lib/store/slices/newsSlice';
import { calculateArticleReachAuto } from '@/utils/reachCalculator';
import { calculateArticleVoiceOfShare } from '@/utils/voiceOfShareCalculator';

/**
 * Enrich a single article with estimated reach data
 */
export function enrichArticleWithReach(article: NewsArticle | any): NewsArticle {
  // If voiceOfShare is already calculated, skip enrichment
  if (article.estimatedReach?.voiceOfShare !== undefined) {
    return article;
  }

  try {
    let reachResult;
    let monthlyReach = 0;

    // If estimatedReach exists but voiceOfShare is missing, use existing monthlyReach
    if (article.estimatedReach?.monthlyReach) {
      monthlyReach = article.estimatedReach.monthlyReach;
      reachResult = {
        monthlyReach: article.estimatedReach.monthlyReach,
        finalEstimatedReach: article.estimatedReach.finalEstimatedReach,
        reachRange: article.estimatedReach.reachRange,
        percentageMultiplier: article.estimatedReach.percentageMultiplier,
      };
    } else {
      // Calculate reach from scratch
      reachResult = calculateArticleReachAuto(
        article.sourceName || 'Unknown Source',
        article.url,
        article.keyword,
        article.engagement
      );
      monthlyReach = reachResult.monthlyReach;
    }

    // Calculate Share of Voice deterministically
    const voiceOfShare = calculateArticleVoiceOfShare(
      monthlyReach,
      article.sourceName || 'Unknown Source',
      article.keyword,
      article.url
    );

    return {
      ...article,
      estimatedReach: {
        monthlyReach: reachResult.monthlyReach,
        finalEstimatedReach: reachResult.finalEstimatedReach,
        reachRange: reachResult.reachRange,
        percentageMultiplier: reachResult.percentageMultiplier,
        voiceOfShare: voiceOfShare, // Store Share of Voice for consistency
      },
    };
  } catch (error) {
    console.error('Error calculating reach for article:', error);
    return article;
  }
}

/**
 * Enrich multiple articles with estimated reach data
 */
export function enrichArticlesWithReach(articles: (NewsArticle | any)[]): NewsArticle[] {
  console.log('Enriching articles with reach data:', articles.length);
  return articles.map(enrichArticleWithReach);
}

