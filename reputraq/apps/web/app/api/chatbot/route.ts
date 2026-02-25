import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, newsArticles, socialPosts, keywords } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function getUserIdFromRequest(request: Request): number | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = JSON.parse(atob(token));
    return decoded.userId || null;
  } catch (error) {
    console.error('Error decoding auth token:', error);
    return null;
  }
}

async function getRelevantData(userId: number, query: string) {
  try {
    console.log('🔍 Fetching comprehensive dashboard data for user:', userId);
    const database = await db;
    
    // Get user's keywords
    const userKeywords = await database
      .select()
      .from(keywords)
      .where(eq(keywords.userId, userId));

    if (!Array.isArray(userKeywords) || userKeywords.length === 0) {
      console.log('⚠️ No keywords found for user');
      return { keywords: [], newsArticles: [], socialPosts: [], metrics: null };
    }

    const keywordStrings = Array.isArray(userKeywords) ? userKeywords.map(k => k.keyword) : [];
    console.log('📊 Keywords found:', keywordStrings);

    // Get all news articles (not just recent, for comprehensive analysis)
    const allNews = await database
      .select()
      .from(newsArticles)
      .where(eq(newsArticles.userId, userId))
      .orderBy(desc(newsArticles.publishedAt));

    // Get all social posts
    const allSocial = await database
      .select()
      .from(socialPosts)
      .where(eq(socialPosts.userId, userId))
      .orderBy(desc(socialPosts.publishedAt));

    // Get recent articles (last 30 days) for detailed analysis
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentNews = allNews.filter(article => 
      new Date(article.publishedAt) >= thirtyDaysAgo
    );
    const recentSocial = allSocial.filter(post => 
      new Date(post.publishedAt) >= thirtyDaysAgo
    );

    // Calculate comprehensive metrics
    const allArticles = [...allNews];
    const allPosts = [...allSocial];
    
    // Sentiment analysis
    const sentimentBreakdown = {
      positive: allArticles.filter(a => (a.sentimentScore || 0) > 10).length,
      negative: allArticles.filter(a => (a.sentimentScore || 0) < -10).length,
      neutral: allArticles.filter(a => (a.sentimentScore || 0) >= -10 && (a.sentimentScore || 0) <= 10).length
    };
    
    const avgSentiment = allArticles.length > 0
      ? allArticles.reduce((sum, a) => sum + (a.sentimentScore || 0), 0) / allArticles.length
      : 0;

    // Social sentiment
    const socialSentimentBreakdown = {
      positive: allPosts.filter(p => (p.sentimentScore || 0) > 10).length,
      negative: allPosts.filter(p => (p.sentimentScore || 0) < -10).length,
      neutral: allPosts.filter(p => (p.sentimentScore || 0) >= -10 && (p.sentimentScore || 0) <= 10).length
    };

    // Top sources
    const sourceCounts = allArticles.reduce((acc, article) => {
      const source = article.sourceName || 'Unknown Source';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topSources = Object.entries(sourceCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Platform distribution
    const platformCounts = allPosts.reduce((acc, post) => {
      const platform = post.platformName || 'Unknown';
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topPlatforms = Object.entries(platformCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Engagement metrics
    const totalEngagement = allArticles.reduce((sum, article) => {
      const engagement = article.engagement || {};
      return sum + (engagement.views || 0) + (engagement.shares || 0) + (engagement.comments || 0);
    }, 0);

    const totalSocialEngagement = allPosts.reduce((sum, post) => {
      const engagement = post.engagement || {};
      return sum + (engagement.views || 0) + (engagement.shares || 0) + (engagement.comments || 0) + (engagement.likes || 0);
    }, 0);

    // Keyword performance
    const keywordPerformance = keywordStrings.map(keyword => {
      const keywordArticles = allArticles.filter(a => a.keyword === keyword);
      const keywordPosts = allPosts.filter(p => p.keyword === keyword);
      const keywordSentiment = keywordArticles.length > 0
        ? keywordArticles.reduce((sum, a) => sum + (a.sentimentScore || 0), 0) / keywordArticles.length
        : 0;
      return {
        keyword,
        newsCount: keywordArticles.length,
        socialCount: keywordPosts.length,
        avgSentiment: keywordSentiment,
        totalMentions: keywordArticles.length + keywordPosts.length
      };
    });

    // Time-based trends (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const dailyMentions = last7Days.map(date => {
      const dayArticles = allArticles.filter(article => 
        new Date(article.publishedAt).toISOString().split('T')[0] === date
      );
      const dayPosts = allPosts.filter(post => 
        new Date(post.publishedAt).toISOString().split('T')[0] === date
      );
      return {
        date,
        newsCount: dayArticles.length,
        socialCount: dayPosts.length,
        total: dayArticles.length + dayPosts.length
      };
    });

    // Get user info
    const user = await database
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const metrics = {
      totalArticles: allArticles.length,
      totalSocialPosts: allPosts.length,
      recentArticles: recentNews.length,
      recentSocialPosts: recentSocial.length,
      sentimentBreakdown,
      socialSentimentBreakdown,
      avgSentiment: Math.round(avgSentiment * 10) / 10,
      topSources,
      topPlatforms,
      totalEngagement,
      totalSocialEngagement,
      keywordPerformance,
      dailyMentions,
      breakingNews: allArticles.filter(a => a.isBreaking).length,
      uniqueSources: Object.keys(sourceCounts).length,
      dateRange: {
        oldest: allArticles.length > 0 ? allArticles[allArticles.length - 1]?.publishedAt : null,
        newest: allArticles.length > 0 ? allArticles[0]?.publishedAt : null
      }
    };

    console.log('📊 Calculated metrics:', {
      totalArticles: metrics.totalArticles,
      totalSocialPosts: metrics.totalSocialPosts,
      avgSentiment: metrics.avgSentiment,
      topSourcesCount: metrics.topSources.length
    });

    return {
      keywords: keywordStrings,
      newsArticles: allNews.slice(0, 100), // Limit for context but keep more for analysis
      socialPosts: allPosts.slice(0, 100),
      recentNews: recentNews.slice(0, 20),
      recentSocial: recentSocial.slice(0, 20),
      metrics,
      user: user[0] || null
    };
  } catch (error) {
    console.error('❌ Error fetching relevant data:', error);
    return { keywords: [], newsArticles: [], socialPosts: [], metrics: null };
  }
}

function formatDataForPrompt(data: any) {
  const { keywords, newsArticles, socialPosts, recentNews, recentSocial, metrics, user } = data;
  
  console.log('📝 Formatting data for AI prompt...');
  
  let context = `# BRAND REPUTATION DASHBOARD SUMMARY\n\n`;
  context += `**User:** ${user?.name || 'Unknown'}\n`;
  context += `**Company:** ${user?.companyName || 'Not specified'}\n`;
  context += `**Keywords Monitored:** ${Array.isArray(keywords) ? keywords.join(', ') : 'None'}\n`;
  context += `**Report Generated:** ${new Date().toLocaleString()}\n\n`;
  
  if (metrics) {
    context += `## EXECUTIVE SUMMARY\n\n`;
    context += `### Overall Brand Presence\n`;
    context += `- **Total News Articles:** ${metrics.totalArticles}\n`;
    context += `- **Total Social Media Posts:** ${metrics.totalSocialPosts}\n`;
    context += `- **Total Mentions:** ${metrics.totalArticles + metrics.totalSocialPosts}\n`;
    context += `- **Recent Activity (Last 30 Days):** ${metrics.recentArticles} news articles, ${metrics.recentSocialPosts} social posts\n`;
    context += `- **Breaking News:** ${metrics.breakingNews} articles\n`;
    context += `- **Unique News Sources:** ${metrics.uniqueSources}\n\n`;
    
    context += `### Sentiment Analysis\n`;
    context += `- **Average Sentiment Score:** ${metrics.avgSentiment}/100\n`;
    context += `- **News Sentiment Breakdown:**\n`;
    context += `  - Positive: ${metrics.sentimentBreakdown.positive} articles (${Math.round((metrics.sentimentBreakdown.positive / metrics.totalArticles) * 100) || 0}%)\n`;
    context += `  - Neutral: ${metrics.sentimentBreakdown.neutral} articles (${Math.round((metrics.sentimentBreakdown.neutral / metrics.totalArticles) * 100) || 0}%)\n`;
    context += `  - Negative: ${metrics.sentimentBreakdown.negative} articles (${Math.round((metrics.sentimentBreakdown.negative / metrics.totalArticles) * 100) || 0}%)\n`;
    if (metrics.totalSocialPosts > 0) {
      context += `- **Social Media Sentiment Breakdown:**\n`;
      context += `  - Positive: ${metrics.socialSentimentBreakdown.positive} posts (${Math.round((metrics.socialSentimentBreakdown.positive / metrics.totalSocialPosts) * 100) || 0}%)\n`;
      context += `  - Neutral: ${metrics.socialSentimentBreakdown.neutral} posts (${Math.round((metrics.socialSentimentBreakdown.neutral / metrics.totalSocialPosts) * 100) || 0}%)\n`;
      context += `  - Negative: ${metrics.socialSentimentBreakdown.negative} posts (${Math.round((metrics.socialSentimentBreakdown.negative / metrics.totalSocialPosts) * 100) || 0}%)\n`;
    }
    context += `\n`;
    
    context += `### Engagement Metrics\n`;
    context += `- **Total News Engagement:** ${metrics.totalEngagement.toLocaleString()} (views + shares + comments)\n`;
    context += `- **Total Social Engagement:** ${metrics.totalSocialEngagement.toLocaleString()} (likes + shares + comments + views)\n`;
    context += `- **Combined Total Engagement:** ${(metrics.totalEngagement + metrics.totalSocialEngagement).toLocaleString()}\n\n`;
    
    if (metrics.topSources && metrics.topSources.length > 0) {
      context += `### Top News Sources (by mention count)\n`;
      metrics.topSources.forEach((source: any, index: number) => {
        context += `${index + 1}. **${source.name}**: ${source.count} articles\n`;
      });
      context += `\n`;
    }
    
    if (metrics.topPlatforms && metrics.topPlatforms.length > 0) {
      context += `### Top Social Media Platforms\n`;
      metrics.topPlatforms.forEach((platform: any, index: number) => {
        context += `${index + 1}. **${platform.name}**: ${platform.count} posts\n`;
      });
      context += `\n`;
    }
    
    if (metrics.keywordPerformance && metrics.keywordPerformance.length > 0) {
      context += `### Keyword Performance Analysis\n`;
      metrics.keywordPerformance.forEach((kp: any) => {
        context += `**${kp.keyword}:**\n`;
        context += `  - Total Mentions: ${kp.totalMentions} (${kp.newsCount} news + ${kp.socialCount} social)\n`;
        context += `  - Average Sentiment: ${Math.round(kp.avgSentiment * 10) / 10}/100\n`;
        context += `\n`;
      });
    }
    
    if (metrics.dailyMentions && metrics.dailyMentions.length > 0) {
      context += `### Daily Mention Trends (Last 7 Days)\n`;
      metrics.dailyMentions.forEach((day: any) => {
        const date = new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        context += `- **${date}**: ${day.total} mentions (${day.newsCount} news, ${day.socialCount} social)\n`;
      });
      context += `\n`;
    }
    
    if (metrics.dateRange.oldest && metrics.dateRange.newest) {
      context += `### Data Coverage Period\n`;
      context += `- **Earliest Data:** ${new Date(metrics.dateRange.oldest).toLocaleDateString()}\n`;
      context += `- **Latest Data:** ${new Date(metrics.dateRange.newest).toLocaleDateString()}\n\n`;
    }
  }
  
  context += `## RECENT NEWS ARTICLES (Last 20)\n\n`;
  if (Array.isArray(recentNews) && recentNews.length > 0) {
    recentNews.slice(0, 20).forEach((article: any, index: number) => {
      context += `### ${index + 1}. ${article.title}\n`;
      context += `- **Source:** ${article.sourceName || 'Unknown Source'}\n`;
      context += `- **Published:** ${new Date(article.publishedAt).toLocaleDateString()}\n`;
      context += `- **Sentiment:** ${article.sentimentLabel || 'neutral'} (Score: ${article.sentimentScore || 0}/100)\n`;
      if (article.description) {
        context += `- **Summary:** ${article.description.substring(0, 300)}${article.description.length > 300 ? '...' : ''}\n`;
      }
      if (article.engagement) {
        context += `- **Engagement:** ${(article.engagement.views || 0) + (article.engagement.shares || 0) + (article.engagement.comments || 0)} total interactions\n`;
      }
      context += `- **URL:** ${article.url}\n\n`;
    });
  } else {
    context += `No recent news articles found.\n\n`;
  }
  
  context += `## RECENT SOCIAL MEDIA POSTS (Last 20)\n\n`;
  if (Array.isArray(recentSocial) && recentSocial.length > 0) {
    recentSocial.slice(0, 20).forEach((post: any, index: number) => {
      context += `### ${index + 1}. ${post.title || 'Social Media Post'}\n`;
      context += `- **Platform:** ${post.platformName || 'Unknown'}\n`;
      context += `- **Published:** ${new Date(post.publishedAt).toLocaleDateString()}\n`;
      context += `- **Sentiment:** ${post.sentimentLabel || 'neutral'} (Score: ${post.sentimentScore || 0}/100)\n`;
      if (post.description) {
        context += `- **Content:** ${post.description.substring(0, 300)}${post.description.length > 300 ? '...' : ''}\n`;
      }
      if (post.engagement) {
        context += `- **Engagement:** ${(post.engagement.views || 0) + (post.engagement.shares || 0) + (post.engagement.comments || 0) + (post.engagement.likes || 0)} total interactions\n`;
      }
      context += `- **URL:** ${post.url}\n\n`;
    });
  } else {
    context += `No recent social media posts found.\n\n`;
  }
  
  // Add top performing content
  if (Array.isArray(newsArticles) && newsArticles.length > 0) {
    const topEngagedArticles = [...newsArticles]
      .sort((a, b) => {
        const aEng = (a.engagement?.views || 0) + (a.engagement?.shares || 0) + (a.engagement?.comments || 0);
        const bEng = (b.engagement?.views || 0) + (b.engagement?.shares || 0) + (b.engagement?.comments || 0);
        return bEng - aEng;
      })
      .slice(0, 5);
    
    if (topEngagedArticles.length > 0) {
      context += `## TOP ENGAGED NEWS ARTICLES\n\n`;
      topEngagedArticles.forEach((article: any, index: number) => {
        const engagement = (article.engagement?.views || 0) + (article.engagement?.shares || 0) + (article.engagement?.comments || 0);
        context += `${index + 1}. **${article.title}** - ${engagement.toLocaleString()} engagements\n`;
        context += `   Source: ${article.sourceName}, Sentiment: ${article.sentimentLabel} (${article.sentimentScore || 0})\n\n`;
      });
    }
  }
  
  console.log('✅ Data formatted for prompt (length:', context.length, 'chars)');
  
  return context;
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { message, conversationHistory = [] } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get relevant data for the user
    const relevantData = await getRelevantData(userId, message);
    const dataContext = formatDataForPrompt(relevantData);

    // Detect if user is asking for a summary or dashboard overview
    const isSummaryRequest = /summary|overview|dashboard|executive|report|position|presence|status|update/i.test(message);
    const isBrandPositionRequest = /position|presence|reputation|standing|perception|image|brand/i.test(message);
    
    console.log('💬 User query analysis:', {
      message: message.substring(0, 100),
      isSummaryRequest,
      isBrandPositionRequest
    });

    // Prepare the prompt for Gemini
    const systemPrompt = `You are an AI Executive Assistant for Reputraq, a comprehensive reputation monitoring platform. Your primary role is to provide executive-level summaries and strategic insights about brand's online presence and reputation.

**CRITICAL: This is for senior management presentations. Your responses must be:**
- Professional, concise, and actionable
- Data-driven with specific metrics and numbers
- Focused on business impact and strategic insights
- Suitable for executive briefings and board presentations

**Your Core Responsibilities:**
1. **Executive Summaries**: Provide comprehensive dashboard summaries highlighting key metrics, trends, and insights
2. **Brand Position Analysis**: Analyze and explain the brand's current online reputation position
3. **Sentiment Intelligence**: Interpret sentiment data to provide actionable insights
4. **Trend Identification**: Identify patterns, opportunities, and potential risks
5. **Strategic Recommendations**: Offer data-backed recommendations for reputation management

**Current Brand Data & Metrics:**
${dataContext}

**Response Guidelines:**
- **For Summary Requests**: Always start with an executive summary (2-3 sentences), then provide detailed breakdowns
- **For Brand Position**: Analyze overall sentiment, mention volume, engagement rates, and competitive positioning
- **Use Specific Data**: Reference exact numbers, percentages, and dates from the data provided
- **Highlight Key Insights**: Focus on what matters most to senior management (risks, opportunities, trends)
- **Provide Context**: Explain what the metrics mean in business terms
- **Be Actionable**: Suggest next steps or areas requiring attention
- **If Data is Limited**: Clearly state what data is available and what insights can be drawn from it

FORMATTING GUIDELINES:
- Use rich markdown formatting to make responses visually appealing and easy to read
- For headers and sections, use markdown headers: ## Section Title, ### Subsection
- For emphasis, use **bold** for important points and *italic* for highlights
- For data summaries, create tables using markdown format:
  | Metric | Value | Change |
  |--------|-------|--------|
  | Articles | 25 | +12% |
  | Sentiment | 7.2/10 | +0.5 |
- For code examples or data queries, use code blocks:
  \`\`\`sql
  SELECT * FROM articles WHERE sentiment > 0.7
  \`\`\`
- For inline code, use backticks: \`SELECT * FROM articles\`
- For key metrics, use this format: 📊 **Metric Name**: Value
- For sentiment analysis, use: 🎯 **Sentiment Analysis**: [detailed analysis]
- Use bullet points for lists of insights:
  - Key insight 1
  - Key insight 2
  - Key insight 3
- Use numbered lists for step-by-step processes:
  1. First step
  2. Second step
  3. Third step
- Use blockquotes for important callouts:
  > This is an important insight that needs attention
- Highlight important numbers and percentages with **bold**
- Use horizontal rules (---) to separate major sections
- Create clear visual hierarchy with headers and subheaders

Respond in a conversational, helpful tone. Use rich markdown formatting to create visually appealing, easy-to-scan responses.`;

    // Prepare conversation history for context
    let conversationContext = '';
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      conversationContext = '\n\nPrevious conversation:\n';
      conversationHistory.forEach((msg: any) => {
        conversationContext += `${msg.role}: ${msg.content}\n`;
      });
    }

    const fullPrompt = `${systemPrompt}${conversationContext}\n\nUser: ${message}\n\nAssistant:`;

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Chatbot is not configured. Set GEMINI_API_KEY in environment variables.' },
        { status: 503 }
      );
    }

    // Call Gemini API
    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: isSummaryRequest || isBrandPositionRequest ? 2048 : 1024, // Longer responses for summaries
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      return NextResponse.json(
        { error: "Failed to get AI response" },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();
    
    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      return NextResponse.json(
        { error: "No response generated" },
        { status: 500 }
      );
    }

    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
      dataContext: {
        keywordsCount: Array.isArray(relevantData.keywords) ? relevantData.keywords.length : 0,
        newsArticlesCount: Array.isArray(relevantData.newsArticles) ? relevantData.newsArticles.length : 0,
        socialPostsCount: Array.isArray(relevantData.socialPosts) ? relevantData.socialPosts.length : 0,
        monitoringDataCount: Array.isArray(relevantData.monitoringData) ? relevantData.monitoringData.length : 0
      }
    });

  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
