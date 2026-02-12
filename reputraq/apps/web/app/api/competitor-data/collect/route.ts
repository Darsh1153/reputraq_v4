import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { competitorKeywords, newsArticles } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { dataManager } from '../../../../services/dataManager';
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

export async function POST(request: Request) {
  try {
    console.log('🚀 Competitor data collection request received');

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
    const { competitorKeyword } = body;

    if (!competitorKeyword || !competitorKeyword.trim()) {
      return NextResponse.json(
        { error: 'Competitor keyword is required' },
        { status: 400 }
      );
    }

    console.log('🎯 Collecting data for competitor keyword:', competitorKeyword);

    const database = await db;

    // Try to create the competitor_keywords table if it doesn't exist
    try {
      await database.execute(sql`
        CREATE TABLE IF NOT EXISTS "competitor_keywords" (
          "id" serial PRIMARY KEY NOT NULL,
          "user_id" integer NOT NULL,
          "keyword" varchar(255) NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL
        );
      `);
    } catch (createError) {
      console.log('⚠️ Competitor keywords table creation error (might already exist):', createError);
    }

    // Try to create the news_articles table if it doesn't exist
    try {
      console.log('🔧 Attempting to create news_articles table...');
      await database.execute(sql`
        CREATE TABLE IF NOT EXISTS "news_articles" (
          "id" serial PRIMARY KEY NOT NULL,
          "user_id" integer NOT NULL,
          "keyword" varchar(255) NOT NULL,
          "article_id" varchar(50) NOT NULL,
          "title" text NOT NULL,
          "description" text,
          "url" text NOT NULL,
          "published_at" timestamp NOT NULL,
          "source_name" varchar(255) NOT NULL,
          "source_logo" text,
          "image" text,
          "sentiment_score" integer,
          "sentiment_label" varchar(50),
          "read_time" integer,
          "is_breaking" boolean DEFAULT false,
          "categories" jsonb,
          "topics" jsonb,
          "engagement" jsonb,
          "raw_data" jsonb,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      console.log('✅ News articles table creation successful or already exists');
    } catch (createError) {
      console.error('❌ News articles table creation error:', createError);
      console.error('❌ Table creation error details:', {
        message: createError.message,
        stack: createError.stack
      });
    }

    // Verify the competitor keyword exists for this user
    const keywordRecord = await database
      .select()
      .from(competitorKeywords)
      .where(and(
        eq(competitorKeywords.userId, parseInt(userId.toString())),
        eq(competitorKeywords.keyword, competitorKeyword.trim())
      ))
      .limit(1);

    if (keywordRecord.length === 0) {
      return NextResponse.json(
        { error: 'Competitor keyword not found for this user' },
        { status: 404 }
      );
    }

    console.log('✅ Competitor keyword verified:', keywordRecord[0]);

    // Test database connection by trying to query the news_articles table
    try {
      console.log('🔍 Testing database connection by querying news_articles table...');
      const testQuery = await database
        .select({ count: sql`count(*)` })
        .from(newsArticles)
        .where(eq(newsArticles.userId, parseInt(userId.toString())))
        .limit(1);
      console.log('✅ Database connection test successful:', testQuery);
    } catch (dbTestError) {
      console.error('❌ Database connection test failed:', dbTestError);
      return NextResponse.json({
        success: false,
        message: `Database connection test failed for competitor: ${competitorKeyword}`,
        competitorKeyword: competitorKeyword.trim(),
        articlesCollected: 0,
        articlesInserted: 0,
        articlesStored: 0,
        articles: [],
        error: `Database connection error: ${dbTestError.message}`,
        debug: {
          dbTestError: dbTestError.message,
          stack: dbTestError.stack
        }
      });
    }

    // Use the same data collection pipeline as normal keywords
    console.log('📡 Starting data collection for competitor:', competitorKeyword);

    try {
      // Step 1: Collect REAL data from APITube API (same as regular news)
      console.log('🔍 Fetching data from APITube API for competitor:', competitorKeyword);

      const apitubeKey = process.env.APITUBE_KEY || "api_live_OjeHlbtTqz6wIyLmJppEHQSbgj49er5AlFaNWdsNJbpT7Ub";
      const apitubeUrl = `https://api.apitube.io/v1/news/everything?per_page=10&sort.order=desc&title=${encodeURIComponent(competitorKeyword)}&api_key=${apitubeKey}`;
      console.log('📡 APITube URL:', apitubeUrl);

      const apitubeResponse = await axios.get(apitubeUrl, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        }
      });

      console.log('✅ APITube response received:', apitubeResponse.data.status);
      console.log('📊 Articles found:', apitubeResponse.data.results?.length || 0);

      const apiArticles = apitubeResponse.data.results || [];

      if (apiArticles.length === 0) {
        console.log('⚠️ No articles found from APITube for:', competitorKeyword);
        return NextResponse.json({
          success: false,
          message: `No news articles found for competitor: ${competitorKeyword}`,
          competitorKeyword: competitorKeyword.trim(),
          articlesCollected: 0,
          articlesInserted: 0,
          articlesStored: 0,
          articles: []
        });
      }

      // Transform APITube articles to match our database schema
      const transformedArticles = apiArticles.map((article: any) => ({
        id: article.id?.toString() || `apitube_${competitorKeyword}_${Math.random().toString(36).substr(2, 9)}`,
        title: article.title || 'No title',
        description: article.description || article.body || '',
        url: article.href || article.url || '#',
        publishedAt: new Date(article.published_at || new Date()),
        source: article.source?.name || 'Unknown Source',
        sourceLogo: article.source?.logo || article.source?.favicon || '',
        image: article.image || '',
        sentimentScore: article.sentiment?.overall?.score ? Math.round(article.sentiment.overall.score * 100) : 0,
        sentimentLabel: article.sentiment?.overall?.label || article.sentiment?.overall?.polarity || 'neutral',
        readTime: article.read_time || 3,
        isBreaking: article.is_breaking || false,
        categories: article.categories?.map((cat: any) => cat.name) || [],
        topics: article.topics?.map((topic: any) => topic.name) || [],
        engagement: {
          views: article.views || 0,
          shares: article.shares || 0,
          comments: article.comments || 0,
          likes: article.likes || 0
        },
        rawData: article
      }));

      console.log(`💾 Storing ${transformedArticles.length} real articles for competitor: ${competitorKeyword}`);

      const insertedArticles = [];
      for (const article of transformedArticles) {
        try {
          console.log(`🔄 Processing article: ${article.title}`);

          // First, try to delete any existing articles with the same articleId for this user/keyword
          console.log(`🗑️ Deleting existing articles for articleId: ${article.id}`);
          try {
            await database
              .delete(newsArticles)
              .where(and(
                eq(newsArticles.userId, parseInt(userId.toString())),
                eq(newsArticles.keyword, competitorKeyword.trim()),
                eq(newsArticles.articleId, article.id)
              ));
            console.log(`🗑️ Delete completed for articleId: ${article.id}`);
          } catch (deleteError) {
            console.log(`⚠️ Delete error (continuing anyway):`, deleteError.message);
          }

          // Then insert the new article with simplified data
          console.log(`➕ Inserting new article: ${article.title}`);

          // Simplify the data to avoid potential type issues
          const simplifiedArticle = {
            userId: parseInt(userId.toString()),
            keyword: competitorKeyword.trim(),
            articleId: article.id,
            title: article.title || 'No title',
            description: article.description || '',
            url: article.url || '#',
            publishedAt: article.publishedAt || new Date(),
            sourceName: article.source || 'Unknown Source',
            sourceLogo: article.sourceLogo || '',
            image: article.image || '',
            sentimentScore: article.sentimentScore || 0,
            sentimentLabel: article.sentimentLabel || 'neutral',
            readTime: article.readTime || 1,
            isBreaking: article.isBreaking || false,
            categories: article.categories || [],
            topics: article.topics || [],
            engagement: article.engagement || {},
            rawData: article.rawData || {}
          };

          console.log(`📝 Simplified article data:`, JSON.stringify(simplifiedArticle, null, 2));

          const [insertedArticle] = await database
            .insert(newsArticles)
            .values(simplifiedArticle)
            .returning();

          insertedArticles.push(insertedArticle);
          console.log(`✅ Successfully inserted article: ${article.title}`);
          console.log(`📊 Inserted article ID: ${insertedArticle.id}`);
        } catch (insertError) {
          console.error('❌ Error inserting sample article:', insertError);
          console.error('❌ Error details:', {
            message: insertError.message,
            stack: insertError.stack,
            article: article.title,
            articleId: article.id
          });
        }
      }

      // Fetch the stored competitor articles
      const storedArticles = await database
        .select()
        .from(newsArticles)
        .where(and(
          eq(newsArticles.userId, parseInt(userId.toString())),
          eq(newsArticles.keyword, competitorKeyword.trim())
        ))
        .orderBy(sql`${newsArticles.publishedAt} DESC`)
        .limit(50);

      console.log(`✅ Found ${storedArticles.length} stored articles for competitor: ${competitorKeyword}`);

      const success = insertedArticles.length > 0;
      const message = success
        ? `Successfully collected ${transformedArticles.length} articles from APITube for competitor: ${competitorKeyword}`
        : `Data collection completed but no articles were inserted for competitor: ${competitorKeyword}`;

      // If no articles were stored in database, return the transformed articles from API
      const articlesToReturn = storedArticles.length > 0 ? storedArticles : transformedArticles;

      return NextResponse.json({
        success: success,
        message: message,
        competitorKeyword: competitorKeyword.trim(),
        articlesCollected: transformedArticles.length,
        articlesInserted: insertedArticles.length,
        articlesStored: storedArticles.length,
        articles: articlesToReturn,
        source: 'APITube',
        debug: {
          apiArticlesCount: transformedArticles.length,
          insertedArticlesCount: insertedArticles.length,
          storedArticlesCount: storedArticles.length,
          articlesReturned: articlesToReturn.length,
          apiUsed: true
        }
      });

    } catch (collectionError) {
      console.error('❌ Error during APITube data collection:', collectionError);
      console.error('❌ Error details:', {
        message: collectionError.message,
        stack: collectionError.stack,
        competitorKeyword: competitorKeyword
      });

      return NextResponse.json({
        success: false,
        message: `Failed to collect data from APITube for competitor: ${competitorKeyword}. Error: ${collectionError.message}`,
        competitorKeyword: competitorKeyword.trim(),
        articlesCollected: 0,
        articlesInserted: 0,
        articlesStored: 0,
        articles: [],
        error: collectionError.message,
        source: 'APITube',
        debug: {
          errorType: collectionError.name,
          errorMessage: collectionError.message
        }
      });
    }

  } catch (error) {
    console.error('❌ Error in competitor data collection:', error);
    return NextResponse.json(
      { error: 'Failed to collect competitor data', details: error.message },
      { status: 500 }
    );
  }
}
