import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { newsArticles, keywords, competitorKeywords } from '@/lib/db/schema';
import { eq, and, desc, gte, or, ilike } from 'drizzle-orm';
import axios from 'axios';

function getUserIdFromRequest(request: Request): number | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = JSON.parse(atob(token));
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

// Function to create intelligent keyword matching conditions
function createKeywordMatchConditions(keyword: string) {
  // Normalize the keyword for better matching
  const normalizedKeyword = keyword.toLowerCase().trim();
  
  console.log('🔍 Creating keyword match conditions for:', keyword);
  
  // Create OR conditions with priority order
  return or(
    // 1. Exact keyword match (highest priority)
    eq(newsArticles.keyword, keyword),
    
    // 2. Case-insensitive exact keyword match
    eq(newsArticles.keyword, normalizedKeyword),
    
    // 3. Keyword field contains the search term (for broader matches)
    ilike(newsArticles.keyword, `%${normalizedKeyword}%`),
    
    // 4. Only check title/description if keyword is substantial (3+ characters)
    // and use word boundary matching to avoid false positives
    ...(normalizedKeyword.length >= 3 ? [
      // Title contains keyword with word boundaries
      ilike(newsArticles.title, `%${normalizedKeyword}%`),
      // Description contains keyword with word boundaries  
      ilike(newsArticles.description, `%${normalizedKeyword}%`)
    ] : [])
  );
}

async function fetchArticlesMatchingStoredKeyword(params: {
  database: any;
  userId: number;
  keyword: string;
  limit?: number;
}) {
  const { database, userId, keyword, limit = 2000 } = params;
  const normalized = keyword.toLowerCase().trim();

  // Media Monitoring is driven by the stored `newsArticles.keyword` values (the keyword used during collection).
  // To keep both pages consistent, prioritize keyword-column matching (case-insensitive / contains).
  return database
    .select()
    .from(newsArticles)
    .where(
      and(
        eq(newsArticles.userId, userId),
        or(
          eq(newsArticles.keyword, keyword),
          eq(newsArticles.keyword, normalized),
          ilike(newsArticles.keyword, `%${normalized}%`)
        )
      )
    )
    .orderBy(desc(newsArticles.publishedAt))
    .limit(limit);
}

interface SentimentAnalysis {
  positive: number;
  negative: number;
  neutral: number;
  averageScore: number;
  totalArticles: number;
  sentimentDistribution: {
    veryPositive: number;    // > 50
    positive: number;        // 10 to 50
    slightlyPositive: number; // 0 to 10
    neutral: number;         // -10 to 10
    slightlyNegative: number; // -10 to 0
    negative: number;        // -50 to -10
    veryNegative: number;    // < -50
  };
  topPositiveArticles: any[];
  topNegativeArticles: any[];
  recentArticles: any[];
}

function calculateSentimentAnalysis(articles: any[], keyword: string): SentimentAnalysis {
  if (articles.length === 0) {
    return { 
      positive: 0, 
      negative: 0, 
      neutral: 0, 
      averageScore: 0,
      totalArticles: 0,
      sentimentDistribution: {
        veryPositive: 0,
        positive: 0,
        slightlyPositive: 0,
        neutral: 0,
        slightlyNegative: 0,
        negative: 0,
        veryNegative: 0
      },
      topPositiveArticles: [],
      topNegativeArticles: [],
      recentArticles: []
    };
  }

  let positive = 0;
  let negative = 0;
  let neutral = 0;
  let totalScore = 0;
  
  const sentimentDistribution = {
    veryPositive: 0,    // > 50
    positive: 0,        // 10 to 50
    slightlyPositive: 0, // 0 to 10
    neutral: 0,         // -10 to 10
    slightlyNegative: 0, // -10 to 0
    negative: 0,        // -50 to -10
    veryNegative: 0     // < -50
  };

  const articlesWithScores = articles.map(article => ({
    ...article,
    sentimentScore: article.sentimentScore || 0,
    sentimentLabel: article.sentimentLabel || 'neutral'
  }));

  articlesWithScores.forEach(article => {
    const score = article.sentimentScore;
    totalScore += score;

    // Categorize sentiment
    if (score > 50) {
      sentimentDistribution.veryPositive++;
      positive++;
    } else if (score > 10) {
      sentimentDistribution.positive++;
      positive++;
    } else if (score > 0) {
      sentimentDistribution.slightlyPositive++;
      neutral++;
    } else if (score >= -10) {
      sentimentDistribution.neutral++;
      neutral++;
    } else if (score > -50) {
      sentimentDistribution.negative++;
      negative++;
    } else {
      sentimentDistribution.veryNegative++;
      negative++;
    }
  });

  // Sort articles by sentiment score
  const sortedBySentiment = [...articlesWithScores].sort((a, b) => b.sentimentScore - a.sentimentScore);
  const sortedByDate = [...articlesWithScores].sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return {
    positive,
    negative,
    neutral,
    averageScore: totalScore / articles.length,
    totalArticles: articles.length,
    sentimentDistribution,
    topPositiveArticles: sortedBySentiment.slice(0, 5),
    topNegativeArticles: sortedBySentiment.slice(-5).reverse(),
    recentArticles: sortedByDate.slice(0, 10)
  };
}

async function collectAndStoreCompetitorNews({
  userId,
  competitorKeyword,
}: {
  userId: number;
  competitorKeyword: string;
}): Promise<{ collected: number; inserted: number }> {
  const trimmed = competitorKeyword.trim();
  if (!trimmed) return { collected: 0, inserted: 0 };

  const apitubeKey =
    process.env.APITUBE_KEY ||
    'api_live_OjeHlbtTqz6wIyLmJppEHQSbgj49er5AlFaNWdsNJbpT7Ub';

  // Keep parity with existing competitor collection endpoint: title search, 10 articles.
  const apitubeUrl = `https://api.apitube.io/v1/news/everything?per_page=10&sort.order=desc&title=${encodeURIComponent(
    trimmed,
  )}&api_key=${apitubeKey}`;

  const apitubeResponse = await axios.get(apitubeUrl, {
    timeout: 30000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'application/json',
    },
  });

  const apiArticles: any[] = apitubeResponse.data?.results || [];
  if (apiArticles.length === 0) return { collected: 0, inserted: 0 };

  const database = await db;
  let inserted = 0;

  for (const article of apiArticles) {
    const articleId = String(
      article.id?.toString() ||
        `apitube_${trimmed}_${Math.random().toString(36).slice(2, 9)}`,
    );

    const simplifiedArticle = {
      userId,
      keyword: trimmed,
      articleId,
      title: article.title || 'No title',
      description: article.description || article.body || '',
      url: article.href || article.url || '#',
      publishedAt: new Date(article.published_at || new Date()),
      sourceName: article.source?.name || 'Unknown Source',
      sourceLogo: article.source?.logo || article.source?.favicon || '',
      image: article.image || '',
      sentimentScore: article.sentiment?.overall?.score
        ? Math.round(article.sentiment.overall.score * 100)
        : 0,
      sentimentLabel:
        article.sentiment?.overall?.label ||
        article.sentiment?.overall?.polarity ||
        'neutral',
      readTime: article.read_time || 1,
      isBreaking: article.is_breaking || false,
      categories: (article.categories || []).map((c: any) => c?.name || c).filter(Boolean),
      topics: (article.topics || []).map((t: any) => t?.name || t).filter(Boolean),
      engagement: {
        views: article.views || 0,
        shares: article.shares || 0,
        comments: article.comments || 0,
        likes: article.likes || 0,
      },
      rawData: article,
    };

    try {
      // Avoid duplicates for this user + keyword + articleId
      await database
        .delete(newsArticles)
        .where(
          and(
            eq(newsArticles.userId, userId),
            eq(newsArticles.keyword, trimmed),
            eq(newsArticles.articleId, articleId),
          ),
        );

      const insertedRows = await database
        .insert(newsArticles)
        .values(simplifiedArticle)
        .returning();

      if (insertedRows?.length) inserted += 1;
    } catch (e) {
      // Keep best-effort: some articles may fail due to schema/type issues.
      console.error('❌ Failed inserting competitor article:', {
        competitorKeyword: trimmed,
        articleId,
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return { collected: apiArticles.length, inserted };
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Competitor VS News comparison request received');
    
    const userId = getUserIdFromRequest(request);
    console.log('👤 User ID from request:', userId);
    
    if (!userId) {
      console.log('❌ No user ID found in request');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { brandKeyword, competitorKeyword } = body;

    if (!brandKeyword || !competitorKeyword) {
      return NextResponse.json(
        { error: 'Both brand and competitor keywords are required' },
        { status: 400 }
      );
    }

    console.log('🎯 Comparing:', { brandKeyword, competitorKeyword });

    const database = await db;

    console.log('📰 Fetching brand articles (match stored keyword):', brandKeyword);
    let finalBrandArticles = await fetchArticlesMatchingStoredKeyword({
      database,
      userId,
      keyword: brandKeyword,
      limit: 2000,
    });
    console.log('📊 Found brand articles:', finalBrandArticles.length);

    // If brand has no stored articles, best-effort collect (keeps parity with competitor auto-collection).
    if (finalBrandArticles.length === 0) {
      console.log('⚠️ No brand articles found. Auto-collecting from APITube...', {
        brandKeyword,
        userId,
      });

      try {
        const { collected, inserted } = await collectAndStoreCompetitorNews({
          userId,
          competitorKeyword: brandKeyword,
        });
        console.log('✅ Brand auto-collection finished:', { collected, inserted });

        if (inserted > 0) {
          finalBrandArticles = await fetchArticlesMatchingStoredKeyword({
            database,
            userId,
            keyword: brandKeyword,
            limit: 2000,
          });
          console.log('📊 Brand articles after auto-collection:', finalBrandArticles.length);
        }
      } catch (e) {
        console.error('❌ Brand auto-collect failed (continuing with empty brand set):', {
          brandKeyword,
          message: e instanceof Error ? e.message : String(e),
        });
      }
    }

    console.log('📰 Fetching competitor articles (match stored keyword):', competitorKeyword);
    let finalCompetitorArticles = await fetchArticlesMatchingStoredKeyword({
      database,
      userId,
      keyword: competitorKeyword,
      limit: 2000,
    });
    console.log('📊 Found competitor articles:', finalCompetitorArticles.length);

    // If competitor has no stored articles, auto-collect (to match Media Monitoring expectations)
    if (finalCompetitorArticles.length === 0) {
      console.log('⚠️ No competitor articles found. Auto-collecting from APITube...', {
        competitorKeyword,
        userId,
      });

      try {
        const { collected, inserted } = await collectAndStoreCompetitorNews({
          userId,
          competitorKeyword,
        });
        console.log('✅ Auto-collection finished:', { collected, inserted });

        if (inserted > 0) {
          finalCompetitorArticles = await fetchArticlesMatchingStoredKeyword({
            database,
            userId,
            keyword: competitorKeyword,
            limit: 2000,
          });
          console.log('📊 Competitor articles after auto-collection:', finalCompetitorArticles.length);
        }
      } catch (e) {
        console.error('❌ Auto-collect failed (continuing with empty competitor set):', {
          competitorKeyword,
          message: e instanceof Error ? e.message : String(e),
        });
      }
    }

    // Calculate comprehensive sentiment analysis for both
    const brandSentiment = calculateSentimentAnalysis(finalBrandArticles, brandKeyword);
    const competitorSentiment = calculateSentimentAnalysis(finalCompetitorArticles, competitorKeyword);

    console.log('📈 Brand sentiment analysis:', {
      totalArticles: brandSentiment.totalArticles,
      averageScore: brandSentiment.averageScore,
      positive: brandSentiment.positive,
      negative: brandSentiment.negative,
      neutral: brandSentiment.neutral
    });
    
    console.log('📈 Competitor sentiment analysis:', {
      totalArticles: competitorSentiment.totalArticles,
      averageScore: competitorSentiment.averageScore,
      positive: competitorSentiment.positive,
      negative: competitorSentiment.negative,
      neutral: competitorSentiment.neutral
    });

    // Determine comprehensive comparison results
    const sentimentDifference = brandSentiment.averageScore - competitorSentiment.averageScore;
    const brandAdvantage = sentimentDifference > 0;
    const competitorAdvantage = sentimentDifference < 0;
    
    // More sophisticated winner determination
    let overallWinner: string;
    let confidence: string;
    
    if (Math.abs(sentimentDifference) < 0.5) {
      overallWinner = 'Tie';
      confidence = 'Low';
    } else if (Math.abs(sentimentDifference) < 2) {
      overallWinner = brandAdvantage ? brandKeyword : competitorKeyword;
      confidence = 'Medium';
    } else {
      overallWinner = brandAdvantage ? brandKeyword : competitorKeyword;
      confidence = 'High';
    }

    // Calculate additional metrics
    const brandPositiveRatio = brandSentiment.totalArticles > 0 ? 
      (brandSentiment.positive / brandSentiment.totalArticles) * 100 : 0;
    const competitorPositiveRatio = competitorSentiment.totalArticles > 0 ? 
      (competitorSentiment.positive / competitorSentiment.totalArticles) * 100 : 0;

    const brandNegativeRatio = brandSentiment.totalArticles > 0 ? 
      (brandSentiment.negative / brandSentiment.totalArticles) * 100 : 0;
    const competitorNegativeRatio = competitorSentiment.totalArticles > 0 ? 
      (competitorSentiment.negative / competitorSentiment.totalArticles) * 100 : 0;

    const comparisonResult = {
      brandKeyword,
      competitorKeyword,
      brandSentiment,
      competitorSentiment,
      comparison: {
        sentimentDifference,
        brandAdvantage,
        competitorAdvantage,
        overallWinner,
        confidence,
        brandPositiveRatio,
        competitorPositiveRatio,
        brandNegativeRatio,
        competitorNegativeRatio,
        totalArticlesAnalyzed: brandSentiment.totalArticles + competitorSentiment.totalArticles
      },
      brandArticles: brandSentiment.recentArticles, // Real recent articles
      competitorArticles: competitorSentiment.recentArticles, // Real recent articles
      analysisDate: new Date().toISOString(),
      dataSource: 'Real API Data from News Articles Database'
    };

    console.log('✅ Comprehensive comparison completed:', {
      sentimentDifference: sentimentDifference.toFixed(3),
      overallWinner,
      confidence,
      brandArticlesCount: brandSentiment.totalArticles,
      competitorArticlesCount: competitorSentiment.totalArticles,
      totalArticlesAnalyzed: brandSentiment.totalArticles + competitorSentiment.totalArticles
    });

    return NextResponse.json(comparisonResult);

  } catch (error) {
    console.error('❌ Error performing comparison:', error);
    return NextResponse.json(
      { error: 'Failed to perform comparison', details: error.message },
      { status: 500 }
    );
  }
}
