'use client';

import { useAppSelector } from '@/lib/hooks/redux';
import { 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Target,
  Calendar,
  Zap,
  Eye,
  Share2,
  MessageSquare,
  TrendingDown,
  Minus,
  Smile,
  Volume2
} from 'lucide-react';
import { calculateTotalVoiceOfShare, formatVoiceOfShareNumber } from '@/utils/voiceOfShareCalculator';
import styles from './InteractiveGraphs.module.scss';

interface GraphData {
  articles: any[];
  keywords: string[];
}

export function InteractiveGraphs({ articles, keywords }: GraphData) {
  // Calculate comprehensive metrics
  const totalArticles = articles.length;
  const breakingNews = articles.filter(article => article.isBreaking).length;
  
  // Sentiment analysis
  const sentimentData = {
    positive: articles.filter(article => (article.sentimentScore || 0) > 10).length,
    negative: articles.filter(article => (article.sentimentScore || 0) < -10).length,
    neutral: articles.filter(article => 
      (article.sentimentScore || 0) >= -10 && (article.sentimentScore || 0) <= 10
    ).length
  };

  // Source distribution
  const sourceCounts = articles.reduce((acc, article) => {
    const source = article.sourceName || 'Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSources = Object.entries(sourceCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8);

  // Engagement metrics (ensure we always get numbers; engagement fields may be objects in DB)
  const totalEngagement = articles.reduce((sum, article) => {
    const engagement = article.engagement || {};
    return sum + safeEngagementNum(engagement.views) + safeEngagementNum(engagement.shares) + safeEngagementNum(engagement.comments);
  }, 0);

  const avgEngagement = totalEngagement / totalArticles || 0;

  // Time-based data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const dailyArticles = last7Days.map(date => {
    return articles.filter(article => 
      new Date(article.publishedAt).toISOString().split('T')[0] === date
    ).length;
  });

  // Keyword performance
  const keywordPerformance = keywords.map(keyword => {
    const keywordArticles = articles.filter(article => 
      article.title?.toLowerCase().includes(keyword.toLowerCase()) ||
      article.description?.toLowerCase().includes(keyword.toLowerCase())
    );
    
    const totalEngagement = keywordArticles.reduce((sum, article) => {
      const engagement = article.engagement || {};
      return sum + safeEngagementNum(engagement.views) + safeEngagementNum(engagement.shares) + safeEngagementNum(engagement.comments);
    }, 0);

    return {
      keyword,
      articles: keywordArticles.length,
      engagement: totalEngagement,
      avgSentiment: keywordArticles.length > 0 
        ? keywordArticles.reduce((sum, article) => sum + (article.sentimentScore || 0), 0) / keywordArticles.length
        : 0
    };
  });

  // Category distribution
  const categoryCounts = articles.reduce((acc, article) => {
    if (article.categories && Array.isArray(article.categories)) {
      article.categories.forEach(category => {
        const categoryName = typeof category === 'string' ? category : category.name || 'Unknown';
        acc[categoryName] = (acc[categoryName] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6);

  return (
    <div className={styles.graphsContainer}>
      {/* Sentiment Analysis Pie Chart */}
      <div className={styles.graphCard}>
        <div className={styles.graphHeader}>
          <h3 className={styles.graphTitle}>Sentiment Analysis</h3>
          <PieChart size={20} />
        </div>
        <div className={styles.pieChart}>
          <div className={styles.pieChartContainer}>
            <div className={styles.pieChartSvg}>
              <svg viewBox="0 0 200 200" className={styles.pieSvg}>
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="20"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeDasharray={`${(sentimentData.positive / totalArticles) * 502.4} 502.4`}
                  strokeDashoffset="0"
                  transform="rotate(-90 100 100)"
                  className={styles.pieSlice}
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="20"
                  strokeDasharray={`${(sentimentData.negative / totalArticles) * 502.4} 502.4`}
                  strokeDashoffset={`-${(sentimentData.positive / totalArticles) * 502.4}`}
                  transform="rotate(-90 100 100)"
                  className={styles.pieSlice}
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#0093DD"
                  strokeWidth="20"
                  strokeDasharray={`${(sentimentData.neutral / totalArticles) * 502.4} 502.4`}
                  strokeDashoffset={`-${((sentimentData.positive + sentimentData.negative) / totalArticles) * 502.4}`}
                  transform="rotate(-90 100 100)"
                  className={styles.pieSlice}
                />
              </svg>
            </div>
            <div className={styles.pieCenter}>
              <div className={styles.pieCenterNumber}>{totalArticles}</div>
              <div className={styles.pieCenterLabel}>Total Articles</div>
            </div>
          </div>
          <div className={styles.pieLegend}>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#10b981' }}></div>
              <span>Positive ({sentimentData.positive})</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#ef4444' }}></div>
              <span>Negative ({sentimentData.negative})</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#0093DD' }}></div>
              <span>Neutral ({sentimentData.neutral})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tone Analysis */}
      <div className={styles.graphCard}>
        <div className={styles.graphHeader}>
          <h3 className={styles.graphTitle}>Content Tone Analysis</h3>
          <Activity size={20} />
        </div>
        <div className={styles.toneAnalysisChart}>
          <div className={styles.toneAnalysisContainer}>
            <svg viewBox="0 0 200 200" className={styles.toneSvg}>
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="20"
              />
              {(() => {
                // Advanced tone analysis based on multiple factors
                const toneData = articles.map(article => {
                  const title = article.title?.toLowerCase() || '';
                  const description = article.description?.toLowerCase() || '';
                  const content = `${title} ${description}`;
                  const engagement = article.engagement || {};
                  
                  // Analyze tone indicators
                  const excitementWords = ['amazing', 'incredible', 'fantastic', 'excellent', 'outstanding', 'breakthrough', 'revolutionary', 'stunning', 'remarkable'];
                  const urgencyWords = ['urgent', 'breaking', 'immediate', 'critical', 'emergency', 'alert', 'warning', 'crisis'];
                  const controversyWords = ['scandal', 'controversy', 'dispute', 'conflict', 'debate', 'criticism', 'outrage', 'protest'];
                  const neutralWords = ['report', 'update', 'announcement', 'information', 'data', 'analysis', 'study', 'research'];
                  
                  let toneScore = 0;
                  let toneCategory = 'neutral';
                  
                  // Check for excitement indicators
                  const excitementCount = excitementWords.reduce((count, word) => 
                    count + (content.includes(word) ? 1 : 0), 0);
                  
                  // Check for urgency indicators
                  const urgencyCount = urgencyWords.reduce((count, word) => 
                    count + (content.includes(word) ? 1 : 0), 0);
                  
                  // Check for controversy indicators
                  const controversyCount = controversyWords.reduce((count, word) => 
                    count + (content.includes(word) ? 1 : 0), 0);
                  
                  // Check for neutral indicators
                  const neutralCount = neutralWords.reduce((count, word) => 
                    count + (content.includes(word) ? 1 : 0), 0);
                  
                  // Calculate engagement ratio
                  const totalEngagement = safeEngagementNum(engagement.views) + safeEngagementNum(engagement.shares) + safeEngagementNum(engagement.comments);
                  const engagementRatio = totalEngagement > 0 ? safeEngagementNum(engagement.shares) / totalEngagement : 0;
                  
                  // Determine tone based on content analysis
                  if (excitementCount > 0 || engagementRatio > 0.1) {
                    toneCategory = 'excited';
                    toneScore = excitementCount * 20 + engagementRatio * 50;
                  } else if (urgencyCount > 0 || article.isBreaking) {
                    toneCategory = 'urgent';
                    toneScore = urgencyCount * 25 + (article.isBreaking ? 30 : 0);
                  } else if (controversyCount > 0) {
                    toneCategory = 'controversial';
                    toneScore = controversyCount * 15;
                  } else if (neutralCount > 0) {
                    toneCategory = 'informative';
                    toneScore = neutralCount * 10;
                  } else {
                    toneCategory = 'neutral';
                    toneScore = 5;
                  }
                  
                  return {
                    ...article,
                    toneCategory,
                    toneScore: Math.min(toneScore, 100)
                  };
                });
                
                // Group by tone categories
                const toneGroups = toneData.reduce((acc, article) => {
                  if (!acc[article.toneCategory]) {
                    acc[article.toneCategory] = [];
                  }
                  acc[article.toneCategory].push(article);
                  return acc;
                }, {} as Record<string, any[]>);
                
                const toneCategories = [
                  { name: 'excited', color: '#ff6b6b', label: 'Excited' },
                  { name: 'urgent', color: '#ffd93d', label: 'Urgent' },
                  { name: 'controversial', color: '#ff4757', label: 'Controversial' },
                  { name: 'informative', color: '#3742fa', label: 'Informative' },
                  { name: 'neutral', color: '#6bcf7f', label: 'Neutral' }
                ];
                
                let currentOffset = 0;
                
                return toneCategories.map((category, index) => {
                  const count = toneGroups[category.name]?.length || 0;
                  const percentage = totalArticles > 0 ? (count / totalArticles) * 502.4 : 0;
                  
                  if (percentage === 0) return null;
                  
                  return (
                <circle
                      key={category.name}
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke={category.color}
                      strokeWidth="20"
                      strokeDasharray={`${percentage} 502.4`}
                      strokeDashoffset={`-${currentOffset}`}
                      transform="rotate(-90 100 100)"
                      className={styles.toneSlice}
                    />
                  );
                  
                  currentOffset += percentage;
                }).filter(Boolean);
              })()}
            </svg>
            <div className={styles.toneCenter}>
              <div className={styles.toneCenterNumber}>{totalArticles}</div>
              <div className={styles.toneCenterLabel}>Total Articles</div>
            </div>
          </div>
          <div className={styles.toneLegend}>
            {(() => {
              const toneData = articles.map(article => {
                const title = article.title?.toLowerCase() || '';
                const description = article.description?.toLowerCase() || '';
                const content = `${title} ${description}`;
                const engagement = article.engagement || {};
                
                const excitementWords = ['amazing', 'incredible', 'fantastic', 'excellent', 'outstanding', 'breakthrough', 'revolutionary', 'stunning', 'remarkable'];
                const urgencyWords = ['urgent', 'breaking', 'immediate', 'critical', 'emergency', 'alert', 'warning', 'crisis'];
                const controversyWords = ['scandal', 'controversy', 'dispute', 'conflict', 'debate', 'criticism', 'outrage', 'protest'];
                const neutralWords = ['report', 'update', 'announcement', 'information', 'data', 'analysis', 'study', 'research'];
                
                const excitementCount = excitementWords.reduce((count, word) => 
                  count + (content.includes(word) ? 1 : 0), 0);
                const urgencyCount = urgencyWords.reduce((count, word) => 
                  count + (content.includes(word) ? 1 : 0), 0);
                const controversyCount = controversyWords.reduce((count, word) => 
                  count + (content.includes(word) ? 1 : 0), 0);
                const neutralCount = neutralWords.reduce((count, word) => 
                  count + (content.includes(word) ? 1 : 0), 0);
                
                const totalEngagement = safeEngagementNum(engagement.views) + safeEngagementNum(engagement.shares) + safeEngagementNum(engagement.comments);
                const engagementRatio = totalEngagement > 0 ? safeEngagementNum(engagement.shares) / totalEngagement : 0;
                
                let toneCategory = 'neutral';
                if (excitementCount > 0 || engagementRatio > 0.1) {
                  toneCategory = 'excited';
                } else if (urgencyCount > 0 || article.isBreaking) {
                  toneCategory = 'urgent';
                } else if (controversyCount > 0) {
                  toneCategory = 'controversial';
                } else if (neutralCount > 0) {
                  toneCategory = 'informative';
                }
                
                return toneCategory;
              });
              
              const toneGroups = toneData.reduce((acc, tone) => {
                acc[tone] = (acc[tone] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              
              const toneCategories = [
                { name: 'excited', color: '#ff6b6b', label: 'Excited' },
                { name: 'urgent', color: '#ffd93d', label: 'Urgent' },
                { name: 'controversial', color: '#ff4757', label: 'Controversial' },
                { name: 'informative', color: '#3742fa', label: 'Informative' },
                { name: 'neutral', color: '#6bcf7f', label: 'Neutral' }
              ];
              
              return toneCategories.map(category => (
                <div key={category.name} className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: category.color }}></div>
                  <span>{category.label} ({toneGroups[category.name] || 0})</span>
              </div>
              ));
            })()}
          </div>
        </div>
      </div>

      {/* Content Sentiment Distribution */}
      <div className={styles.graphCard}>
        <div className={styles.graphHeader}>
          <h3 className={styles.graphTitle}>Content Sentiment Distribution</h3>
          <TrendingUp size={20} />
        </div>
        <div className={styles.sentimentDistributionChart}>
          <div className={styles.sentimentDistributionContainer}>
            {(() => {
              // Custom sentiment analysis based on content and keywords
              const sentimentData = articles.map(article => {
                const title = article.title?.toLowerCase() || '';
                const description = article.description?.toLowerCase() || '';
                const content = `${title} ${description}`;
                const keyword = article.keyword?.toLowerCase() || '';
                
                // Custom sentiment analysis
                let sentimentScore = 0;
                let sentimentCategory = 'neutral';
                
                // Positive sentiment indicators
                const positiveWords = [
                  'amazing', 'incredible', 'fantastic', 'excellent', 'outstanding', 'brilliant',
                  'successful', 'achievement', 'breakthrough', 'revolutionary', 'innovative',
                  'positive', 'good', 'great', 'wonderful', 'impressive', 'remarkable',
                  'victory', 'win', 'success', 'progress', 'improvement', 'growth',
                  'support', 'approve', 'endorse', 'recommend', 'praise', 'celebrate'
                ];
                
                // Negative sentiment indicators
                const negativeWords = [
                  'terrible', 'awful', 'horrible', 'disastrous', 'catastrophic', 'devastating',
                  'failure', 'crisis', 'scandal', 'controversy', 'criticism', 'outrage',
                  'negative', 'bad', 'worst', 'disappointing', 'concerning', 'alarming',
                  'attack', 'accuse', 'blame', 'condemn', 'reject', 'oppose',
                  'decline', 'fall', 'drop', 'crash', 'collapse', 'struggle'
                ];
                
                // Political sentiment indicators (specific to Obama articles)
                const politicalPositive = [
                  'leadership', 'achievement', 'legacy', 'accomplishment', 'success',
                  'reform', 'progress', 'change', 'hope', 'unity', 'inspiration'
                ];
                
                const politicalNegative = [
                  'criticism', 'controversy', 'scandal', 'failure', 'mistake',
                  'accusation', 'blame', 'opposition', 'disagreement', 'conflict'
                ];
                
                // Count sentiment words
                const positiveCount = positiveWords.reduce((count, word) => 
                  count + (content.includes(word) ? 1 : 0), 0);
                const negativeCount = negativeWords.reduce((count, word) => 
                  count + (content.includes(word) ? 1 : 0), 0);
                
                // Political sentiment analysis for Obama articles
                let politicalSentiment = 0;
                if (keyword.includes('obama') || content.includes('obama')) {
                  const politicalPosCount = politicalPositive.reduce((count, word) => 
                    count + (content.includes(word) ? 1 : 0), 0);
                  const politicalNegCount = politicalNegative.reduce((count, word) => 
                    count + (content.includes(word) ? 1 : 0), 0);
                  politicalSentiment = (politicalPosCount - politicalNegCount) * 5;
                }
                
                // Calculate base sentiment score
                const baseSentiment = (positiveCount - negativeCount) * 3;
                
                // Apply keyword-specific multipliers
                let keywordMultiplier = 1;
                if (keyword.includes('obama')) {
                  keywordMultiplier = 1.5; // Political content gets higher sentiment impact
                } else if (keyword.includes('tech') || keyword.includes('ai')) {
                  keywordMultiplier = 1.2;
                } else if (keyword.includes('climate') || keyword.includes('environment')) {
                  keywordMultiplier = 1.1;
                }
                
                // Calculate final sentiment score
                sentimentScore = Math.max(-50, Math.min(50, (baseSentiment + politicalSentiment) * keywordMultiplier));
                
                // Determine sentiment category
                if (sentimentScore > 15) {
                  sentimentCategory = 'very-positive';
                } else if (sentimentScore > 5) {
                  sentimentCategory = 'positive';
                } else if (sentimentScore > -5) {
                  sentimentCategory = 'neutral';
                } else if (sentimentScore > -15) {
                  sentimentCategory = 'negative';
                } else {
                  sentimentCategory = 'very-negative';
                }
                
                return {
                  title: article.title?.substring(0, 30) + '...' || 'Untitled',
                  sentimentScore,
                  sentimentCategory,
                  keyword: article.keyword,
                  positiveWords: positiveCount,
                  negativeWords: negativeCount,
                  politicalSentiment
                };
              }).sort((a, b) => b.sentimentScore - a.sentimentScore).slice(0, 6);

              const maxScore = Math.max(...sentimentData.map(item => Math.abs(item.sentimentScore)));
              
              return sentimentData.map((item, index) => {
                const height = maxScore > 0 ? (Math.abs(item.sentimentScore) / maxScore) * 100 : 0;
                const color = item.sentimentCategory === 'very-positive' ? '#10b981' :
                             item.sentimentCategory === 'positive' ? '#34d399' :
                             item.sentimentCategory === 'neutral' ? '#6b7280' :
                             item.sentimentCategory === 'negative' ? '#f87171' : '#ef4444';
                
              return (
                  <div key={index} className={styles.sentimentBarGroup}>
                    <div className={styles.sentimentBarValue}>{item.sentimentScore.toFixed(1)}</div>
                  <div 
                      className={styles.sentimentBar}
                    style={{ 
                      height: `${height}%`,
                        backgroundColor: color
                    }}
                  ></div>
                    <div className={styles.sentimentBarLabel}>{item.title}</div>
                    <div className={styles.sentimentBarKeyword}>{item.keyword}</div>
                    <div className={styles.sentimentBarCategory}>{item.sentimentCategory}</div>
                </div>
              );
              });
            })()}
          </div>
          <div className={styles.sentimentLegend}>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#10b981' }}></div>
              <span>Very Positive (15+)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#34d399' }}></div>
              <span>Positive (5-15)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#6b7280' }}></div>
              <span>Neutral (-5 to 5)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#f87171' }}></div>
              <span>Negative (-15 to -5)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#ef4444' }}></div>
              <span>Very Negative (-15-)</span>
            </div>
          </div>
          <div className={styles.sentimentInsights}>
            <h4>📊 Sentiment Insights</h4>
            {(() => {
              const insights = articles.reduce((acc, article) => {
                const keyword = article.keyword?.toLowerCase() || '';
                const title = article.title?.toLowerCase() || '';
                const description = article.description?.toLowerCase() || '';
                const content = `${title} ${description}`;
                
                // Calculate sentiment for this article
                const positiveWords = ['amazing', 'incredible', 'fantastic', 'excellent', 'outstanding', 'brilliant', 'successful', 'achievement', 'breakthrough', 'revolutionary', 'innovative', 'positive', 'good', 'great', 'wonderful', 'impressive', 'remarkable', 'victory', 'win', 'success', 'progress', 'improvement', 'growth', 'support', 'approve', 'endorse', 'recommend', 'praise', 'celebrate'];
                const negativeWords = ['terrible', 'awful', 'horrible', 'disastrous', 'catastrophic', 'devastating', 'failure', 'crisis', 'scandal', 'controversy', 'criticism', 'outrage', 'negative', 'bad', 'worst', 'disappointing', 'concerning', 'alarming', 'attack', 'accuse', 'blame', 'condemn', 'reject', 'oppose', 'decline', 'fall', 'drop', 'crash', 'collapse', 'struggle'];
                
                const positiveCount = positiveWords.reduce((count, word) => count + (content.includes(word) ? 1 : 0), 0);
                const negativeCount = negativeWords.reduce((count, word) => count + (content.includes(word) ? 1 : 0), 0);
                
                const sentimentScore = (positiveCount - negativeCount) * 3;
                
                if (!acc[keyword]) {
                  acc[keyword] = { totalSentiment: 0, count: 0, positiveArticles: 0, negativeArticles: 0, neutralArticles: 0 };
                }
                acc[keyword].totalSentiment += sentimentScore;
                acc[keyword].count += 1;
                
                if (sentimentScore > 5) acc[keyword].positiveArticles++;
                else if (sentimentScore < -5) acc[keyword].negativeArticles++;
                else acc[keyword].neutralArticles++;
                
                return acc;
              }, {} as Record<string, any>);
              
              return Object.entries(insights).map(([keyword, data]) => (
                <div key={keyword} className={styles.insightItem}>
                  <strong>{keyword}:</strong> {data.count} articles | 
                  Avg Sentiment: {(data.totalSentiment / data.count).toFixed(1)} | 
                  Positive: {data.positiveArticles} | 
                  Negative: {data.negativeArticles} | 
                  Neutral: {data.neutralArticles}
                </div>
              ));
            })()}
          </div>
        </div>
      </div>

      {/* Content Mood Spectrum */}
      <div className={styles.graphCard}>
        <div className={styles.graphHeader}>
          <h3 className={styles.graphTitle}>Content Mood Spectrum</h3>
          <Target size={20} />
        </div>
        <div className={styles.moodSpectrumChart}>
          <div className={styles.moodSpectrumContainer}>
            <svg viewBox="0 0 400 200" className={styles.moodSpectrumSvg}>
              {/* Mood Spectrum Background */}
              <defs>
                <linearGradient id="moodGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="25%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="75%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              
              {/* Mood Spectrum Bar */}
              <rect x="50" y="80" width="300" height="40" fill="url(#moodGradient)" rx="20" />
              
              {/* Mood Spectrum Labels */}
              <text x="50" y="70" textAnchor="middle" className={styles.moodLabel}>Angry</text>
              <text x="125" y="70" textAnchor="middle" className={styles.moodLabel}>Frustrated</text>
              <text x="200" y="70" textAnchor="middle" className={styles.moodLabel}>Neutral</text>
              <text x="275" y="70" textAnchor="middle" className={styles.moodLabel}>Optimistic</text>
              <text x="350" y="70" textAnchor="middle" className={styles.moodLabel}>Excited</text>
              
              {/* Mood Spectrum Data Points */}
              {(() => {
                const moodData = keywords.map(keyword => {
                  const keywordArticles = articles.filter(article => 
                    article.title?.toLowerCase().includes(keyword.toLowerCase()) ||
                    article.description?.toLowerCase().includes(keyword.toLowerCase())
                  );
                  
                  // Advanced mood analysis based on content patterns
                  const moodAnalysis = keywordArticles.reduce((acc, article) => {
                    const title = article.title?.toLowerCase() || '';
                    const description = article.description?.toLowerCase() || '';
                    const content = `${title} ${description}`;
                    
                    // Mood word categories with intensity scoring
                    const angryWords = ['angry', 'furious', 'outraged', 'rage', 'fury', 'outrage', 'scandal', 'controversy', 'criticism', 'attack', 'blame', 'condemn'];
                    const frustratedWords = ['frustrated', 'disappointed', 'concerned', 'worried', 'struggle', 'difficult', 'challenging', 'problem', 'issue', 'crisis'];
                    const neutralWords = ['report', 'update', 'announcement', 'information', 'data', 'analysis', 'study', 'research', 'news', 'statement'];
                    const optimisticWords = ['positive', 'good', 'great', 'success', 'progress', 'improvement', 'growth', 'achievement', 'victory', 'win'];
                    const excitedWords = ['amazing', 'incredible', 'fantastic', 'excellent', 'outstanding', 'brilliant', 'revolutionary', 'breakthrough', 'exciting', 'thrilling'];
                    
                    // Count mood words with intensity
                    const angryCount = angryWords.reduce((count, word) => count + (content.includes(word) ? 1 : 0), 0);
                    const frustratedCount = frustratedWords.reduce((count, word) => count + (content.includes(word) ? 1 : 0), 0);
                    const neutralCount = neutralWords.reduce((count, word) => count + (content.includes(word) ? 1 : 0), 0);
                    const optimisticCount = optimisticWords.reduce((count, word) => count + (content.includes(word) ? 1 : 0), 0);
                    const excitedCount = excitedWords.reduce((count, word) => count + (content.includes(word) ? 1 : 0), 0);
                    
                    // Calculate mood scores (0-100)
                    const totalWords = angryCount + frustratedCount + neutralCount + optimisticCount + excitedCount;
                    const angryScore = totalWords > 0 ? (angryCount / totalWords) * 100 : 0;
                    const frustratedScore = totalWords > 0 ? (frustratedCount / totalWords) * 100 : 0;
                    const neutralScore = totalWords > 0 ? (neutralCount / totalWords) * 100 : 0;
                    const optimisticScore = totalWords > 0 ? (optimisticCount / totalWords) * 100 : 0;
                    const excitedScore = totalWords > 0 ? (excitedCount / totalWords) * 100 : 0;
                    
                    // Determine dominant mood
                    const moods = { angry: angryScore, frustrated: frustratedScore, neutral: neutralScore, optimistic: optimisticScore, excited: excitedScore };
                    const dominantMood = Object.keys(moods).reduce((a, b) => moods[a] > moods[b] ? a : b);
                    
                    // Calculate overall mood position (0-100, where 0=angry, 100=excited)
                    const moodPosition = (angryScore * 0) + (frustratedScore * 25) + (neutralScore * 50) + (optimisticScore * 75) + (excitedScore * 100);
                    
                    acc.totalMoodPosition += moodPosition;
                    acc.angryCount += angryCount;
                    acc.frustratedCount += frustratedCount;
                    acc.neutralCount += neutralCount;
                    acc.optimisticCount += optimisticCount;
                    acc.excitedCount += excitedCount;
                    acc.dominantMood = dominantMood;
                    
                    return acc;
                  }, { 
                    totalMoodPosition: 0, angryCount: 0, frustratedCount: 0, neutralCount: 0, optimisticCount: 0, excitedCount: 0,
                    dominantMood: 'neutral'
                  });
                  
                  // Calculate average mood position
                  const avgMoodPosition = keywordArticles.length > 0 ? moodAnalysis.totalMoodPosition / keywordArticles.length : 50;
                  
                  // Keyword-specific mood adjustments
                  let moodMultiplier = 1;
                  let moodOffset = 0;
                  
                  if (keyword.toLowerCase().includes('obama')) {
                    moodMultiplier = 1.2;
                    moodOffset = 10; // Political content tends to be more polarized
                  } else if (keyword.toLowerCase().includes('tech') || keyword.toLowerCase().includes('ai')) {
                    moodMultiplier = 1.1;
                    moodOffset = 15; // Tech content tends to be more optimistic
                  } else if (keyword.toLowerCase().includes('climate') || keyword.toLowerCase().includes('environment')) {
                    moodMultiplier = 1.0;
                    moodOffset = -5; // Environmental content can be more concerned
                  } else if (keyword.toLowerCase().includes('volley') || keyword.toLowerCase().includes('sport')) {
                    moodMultiplier = 1.3;
                    moodOffset = 20; // Sports content tends to be more excited
                  } else if (keyword.toLowerCase().includes('business') || keyword.toLowerCase().includes('finance')) {
                    moodMultiplier = 1.0;
                    moodOffset = 5; // Business content tends to be neutral-positive
                  }
                  
                  // Calculate final mood position
                  const finalMoodPosition = Math.max(0, Math.min(100, (avgMoodPosition * moodMultiplier) + moodOffset));
                  
                  return {
                    keyword,
                    moodPosition: finalMoodPosition,
                    articles: keywordArticles.length,
                    moodBreakdown: moodAnalysis,
                    dominantMood: moodAnalysis.dominantMood,
                    moodIntensity: Math.abs(finalMoodPosition - 50) * 2 // How far from neutral
                  };
                });

                return moodData.map((data, index) => {
                  const x = 50 + (data.moodPosition / 100) * 300;
                  const y = 100;
                  
                  // Color based on mood position
                  let color = '#6b7280'; // neutral
                  if (data.moodPosition < 20) color = '#ef4444'; // angry
                  else if (data.moodPosition < 40) color = '#f97316'; // frustrated
                  else if (data.moodPosition < 60) color = '#eab308'; // neutral
                  else if (data.moodPosition < 80) color = '#22c55e'; // optimistic
                  else color = '#3b82f6'; // excited
                  
                    return (
                    <g key={index}>
                      <circle
                        cx={x}
                        cy={y}
                        r="12"
                        fill={color}
                        className={styles.moodSpectrumPoint}
                      />
                      <text
                        x={x}
                        y={y + 4}
                        textAnchor="middle"
                        className={styles.moodSpectrumValue}
                      >
                        {data.moodPosition.toFixed(0)}
                      </text>
                    </g>
                  );
                });
              })()}
            </svg>
          </div>
          <div className={styles.moodSpectrumLabels}>
            {keywords.map((keyword, index) => {
              const keywordArticles = articles.filter(article => 
                article.title?.toLowerCase().includes(keyword.toLowerCase()) ||
                article.description?.toLowerCase().includes(keyword.toLowerCase())
              );
              
              const moodAnalysis = keywordArticles.reduce((acc, article) => {
                const title = article.title?.toLowerCase() || '';
                const description = article.description?.toLowerCase() || '';
                const content = `${title} ${description}`;
                
                const angryWords = ['angry', 'furious', 'outraged', 'rage', 'fury', 'outrage', 'scandal', 'controversy', 'criticism', 'attack', 'blame', 'condemn'];
                const frustratedWords = ['frustrated', 'disappointed', 'concerned', 'worried', 'struggle', 'difficult', 'challenging', 'problem', 'issue', 'crisis'];
                const neutralWords = ['report', 'update', 'announcement', 'information', 'data', 'analysis', 'study', 'research', 'news', 'statement'];
                const optimisticWords = ['positive', 'good', 'great', 'success', 'progress', 'improvement', 'growth', 'achievement', 'victory', 'win'];
                const excitedWords = ['amazing', 'incredible', 'fantastic', 'excellent', 'outstanding', 'brilliant', 'revolutionary', 'breakthrough', 'exciting', 'thrilling'];
                
                const angryCount = angryWords.reduce((count, word) => count + (content.includes(word) ? 1 : 0), 0);
                const frustratedCount = frustratedWords.reduce((count, word) => count + (content.includes(word) ? 1 : 0), 0);
                const neutralCount = neutralWords.reduce((count, word) => count + (content.includes(word) ? 1 : 0), 0);
                const optimisticCount = optimisticWords.reduce((count, word) => count + (content.includes(word) ? 1 : 0), 0);
                const excitedCount = excitedWords.reduce((count, word) => count + (content.includes(word) ? 1 : 0), 0);
                
                const totalWords = angryCount + frustratedCount + neutralCount + optimisticCount + excitedCount;
                const angryScore = totalWords > 0 ? (angryCount / totalWords) * 100 : 0;
                const frustratedScore = totalWords > 0 ? (frustratedCount / totalWords) * 100 : 0;
                const neutralScore = totalWords > 0 ? (neutralCount / totalWords) * 100 : 0;
                const optimisticScore = totalWords > 0 ? (optimisticCount / totalWords) * 100 : 0;
                const excitedScore = totalWords > 0 ? (excitedCount / totalWords) * 100 : 0;
                
                const moods = { angry: angryScore, frustrated: frustratedScore, neutral: neutralScore, optimistic: optimisticScore, excited: excitedScore };
                const dominantMood = Object.keys(moods).reduce((a, b) => moods[a] > moods[b] ? a : b);
                
                const moodPosition = (angryScore * 0) + (frustratedScore * 25) + (neutralScore * 50) + (optimisticScore * 75) + (excitedScore * 100);
                
                acc.totalMoodPosition += moodPosition;
                acc.dominantMood = dominantMood;
                
                return acc;
              }, { totalMoodPosition: 0, dominantMood: 'neutral' });
              
              const avgMoodPosition = keywordArticles.length > 0 ? moodAnalysis.totalMoodPosition / keywordArticles.length : 50;
              
              let moodMultiplier = 1;
              let moodOffset = 0;
              
              if (keyword.toLowerCase().includes('obama')) {
                moodMultiplier = 1.2;
                moodOffset = 10;
              } else if (keyword.toLowerCase().includes('tech') || keyword.toLowerCase().includes('ai')) {
                moodMultiplier = 1.1;
                moodOffset = 15;
              } else if (keyword.toLowerCase().includes('climate') || keyword.toLowerCase().includes('environment')) {
                moodMultiplier = 1.0;
                moodOffset = -5;
              } else if (keyword.toLowerCase().includes('volley') || keyword.toLowerCase().includes('sport')) {
                moodMultiplier = 1.3;
                moodOffset = 20;
              } else if (keyword.toLowerCase().includes('business') || keyword.toLowerCase().includes('finance')) {
                moodMultiplier = 1.0;
                moodOffset = 5;
              }
              
              const finalMoodPosition = Math.max(0, Math.min(100, (avgMoodPosition * moodMultiplier) + moodOffset));
              
              const moodCategory = finalMoodPosition < 20 ? 'Angry' :
                                  finalMoodPosition < 40 ? 'Frustrated' :
                                  finalMoodPosition < 60 ? 'Neutral' :
                                  finalMoodPosition < 80 ? 'Optimistic' : 'Excited';
              
              return (
                <div key={keyword} className={styles.moodSpectrumLabel}>
                  <div className={styles.moodSpectrumKeywordName}>{keyword}</div>
                  <div className={styles.moodSpectrumDetails}>
                    Mood: {moodCategory} ({finalMoodPosition.toFixed(1)}) | 
                    Articles: {keywordArticles.length} | 
                    Dominant: {moodAnalysis.dominantMood}
                  </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Engagement Metrics Donut Chart */}
      <div className={styles.graphCard}>
        <div className={styles.graphHeader}>
          <h3 className={styles.graphTitle}>Engagement Breakdown</h3>
          <Activity size={20} />
        </div>
        <div className={styles.donutChart}>
          <div className={styles.donutChartContainer}>
            <svg viewBox="0 0 200 200" className={styles.donutSvg}>
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="20"
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#10b981"
                strokeWidth="20"
                strokeDasharray={`${totalEngagement > 0 ? (articles.reduce((sum, article) => sum + safeEngagementNum(article.engagement?.views), 0) / totalEngagement) * 502.4 : 0} 502.4`}
                strokeDashoffset="0"
                transform="rotate(-90 100 100)"
                className={styles.donutSlice}
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="20"
                strokeDasharray={`${totalEngagement > 0 ? (articles.reduce((sum, article) => sum + safeEngagementNum(article.engagement?.shares), 0) / totalEngagement) * 502.4 : 0} 502.4`}
                strokeDashoffset={`-${totalEngagement > 0 ? (articles.reduce((sum, article) => sum + safeEngagementNum(article.engagement?.views), 0) / totalEngagement) * 502.4 : 0}`}
                transform="rotate(-90 100 100)"
                className={styles.donutSlice}
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="20"
                strokeDasharray={`${totalEngagement > 0 ? (articles.reduce((sum, article) => sum + safeEngagementNum(article.engagement?.comments), 0) / totalEngagement) * 502.4 : 0} 502.4`}
                strokeDashoffset={`-${totalEngagement > 0 ? ((articles.reduce((sum, article) => sum + safeEngagementNum(article.engagement?.views), 0) + articles.reduce((sum, article) => sum + safeEngagementNum(article.engagement?.shares), 0)) / totalEngagement) * 502.4 : 0}`}
                transform="rotate(-90 100 100)"
                className={styles.donutSlice}
              />
            </svg>
            <div className={styles.donutCenter}>
              <div className={styles.donutCenterNumber}>{formatNumber(totalEngagement)}</div>
              <div className={styles.donutCenterLabel}>Total Engagement</div>
            </div>
          </div>
          <div className={styles.donutLegend}>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#10b981' }}></div>
              <Eye size={14} />
              <span>Views ({formatNumber(articles.reduce((sum, article) => sum + safeEngagementNum(article.engagement?.views), 0))})</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#3b82f6' }}></div>
              <Share2 size={14} />
              <span>Shares ({formatNumber(articles.reduce((sum, article) => sum + safeEngagementNum(article.engagement?.shares), 0))})</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#f59e0b' }}></div>
              <MessageSquare size={14} />
              <span>Comments ({formatNumber(articles.reduce((sum, article) => sum + safeEngagementNum(article.engagement?.comments), 0))})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment Analysis Card */}
      <div className={styles.graphCard}>
        <div className={styles.graphHeader}>
          <h3 className={styles.graphTitle}>Sentiment Analysis by Keywords</h3>
          <Smile size={20} />
        </div>
        <div className={styles.sentimentAnalysisCard}>
          {(() => {
            // Calculate sentiment breakdown by keyword
            const keywordSentimentData = keywords.map(keyword => {
              const keywordArticles = articles.filter(article => 
                article.keyword?.toLowerCase() === keyword.toLowerCase() ||
                article.title?.toLowerCase().includes(keyword.toLowerCase()) ||
                article.description?.toLowerCase().includes(keyword.toLowerCase())
              );
              
              const sentimentBreakdown = {
                positive: keywordArticles.filter(article => (article.sentimentScore || 0) > 10).length,
                negative: keywordArticles.filter(article => (article.sentimentScore || 0) < -10).length,
                neutral: keywordArticles.filter(article => 
                  (article.sentimentScore || 0) >= -10 && (article.sentimentScore || 0) <= 10
                ).length
              };
              
              const totalArticles = keywordArticles.length;
              const avgSentiment = totalArticles > 0 
                ? keywordArticles.reduce((sum, article) => sum + (article.sentimentScore || 0), 0) / totalArticles 
                : 0;
              
              return {
                keyword,
                totalArticles,
                sentimentBreakdown,
                avgSentiment
              };
            }).filter(data => data.totalArticles > 0);
            
            if (keywordSentimentData.length === 0) {
              return (
                <div className={styles.noDataMessage}>
                  <p>No sentiment data available for current keywords</p>
                </div>
              );
            }
            
            return (
              <div className={styles.sentimentAnalysisContainer}>
                {keywordSentimentData.map((data, index) => {
                  const total = data.totalArticles;
                  const positivePercent = total > 0 ? (data.sentimentBreakdown.positive / total) * 100 : 0;
                  const negativePercent = total > 0 ? (data.sentimentBreakdown.negative / total) * 100 : 0;
                  const neutralPercent = total > 0 ? (data.sentimentBreakdown.neutral / total) * 100 : 0;
                  
                  return (
                    <div key={data.keyword} className={styles.sentimentKeywordCard}>
                      <div className={styles.sentimentKeywordHeader}>
                        <h4 className={styles.sentimentKeywordName}>{data.keyword}</h4>
                        <div className={styles.sentimentKeywordStats}>
                          <span className={styles.sentimentStatLabel}>Articles: {data.totalArticles}</span>
                          <span className={styles.sentimentStatLabel}>
                            Avg: {data.avgSentiment > 0 ? '+' : ''}{data.avgSentiment.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className={styles.sentimentBars}>
                        <div className={styles.sentimentBarGroup}>
                          <div className={styles.sentimentBarLabel}>
                            <TrendingUp size={14} className={styles.positiveIcon} />
                            <span>Positive</span>
                            <span className={styles.sentimentBarValue}>{data.sentimentBreakdown.positive}</span>
                          </div>
                          <div className={styles.sentimentBarContainer}>
                            <div 
                              className={styles.sentimentBar}
                              style={{ 
                                width: `${positivePercent}%`,
                                backgroundColor: '#10b981'
                              }}
                            ></div>
                            <span className={styles.sentimentBarPercent}>{positivePercent.toFixed(1)}%</span>
                          </div>
                        </div>
                        
                        <div className={styles.sentimentBarGroup}>
                          <div className={styles.sentimentBarLabel}>
                            <Minus size={14} className={styles.neutralIcon} />
                            <span>Neutral</span>
                            <span className={styles.sentimentBarValue}>{data.sentimentBreakdown.neutral}</span>
                          </div>
                          <div className={styles.sentimentBarContainer}>
                            <div 
                              className={styles.sentimentBar}
                              style={{ 
                                width: `${neutralPercent}%`,
                                backgroundColor: '#6b7280'
                              }}
                            ></div>
                            <span className={styles.sentimentBarPercent}>{neutralPercent.toFixed(1)}%</span>
                          </div>
                        </div>
                        
                        <div className={styles.sentimentBarGroup}>
                          <div className={styles.sentimentBarLabel}>
                            <TrendingDown size={14} className={styles.negativeIcon} />
                            <span>Negative</span>
                            <span className={styles.sentimentBarValue}>{data.sentimentBreakdown.negative}</span>
                          </div>
                          <div className={styles.sentimentBarContainer}>
                            <div 
                              className={styles.sentimentBar}
                              style={{ 
                                width: `${negativePercent}%`,
                                backgroundColor: '#ef4444'
                              }}
                            ></div>
                            <span className={styles.sentimentBarPercent}>{negativePercent.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Category Distribution Horizontal Bar Chart */}
      <div className={styles.graphCard}>
        <div className={styles.graphHeader}>
          <h3 className={styles.graphTitle}>Content Categories</h3>
          <Calendar size={20} />
        </div>
        <div className={styles.horizontalBarChart}>
          {topCategories.map(([category, count], index) => {
            const maxCount = Math.max(...topCategories.map(([,c]) => c));
            const width = (count / maxCount) * 100;
            return (
              <div key={category} className={styles.horizontalBarGroup}>
                <div className={styles.horizontalBarLabel}>{category}</div>
                <div className={styles.horizontalBarContainer}>
                  <div 
                    className={styles.horizontalBar}
                    style={{ 
                      width: `${width}%`,
                      backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                    }}
                  ></div>
                  <div className={styles.horizontalBarValue}>{count}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comprehensive Sentiment Analysis by Keywords Chart */}
      <div className={styles.graphCard}>
        <div className={styles.graphHeader}>
          <h3 className={styles.graphTitle}>Sentiment Analysis by Keywords</h3>
          <BarChart3 size={20} />
        </div>
        <div className={styles.sentimentKeywordsChart}>
          {(() => {
            // Calculate sentiment data by keyword
            const keywordSentimentData = keywords.map(keyword => {
              const keywordArticles = articles.filter(article => 
                article.keyword?.toLowerCase() === keyword.toLowerCase() ||
                article.title?.toLowerCase().includes(keyword.toLowerCase()) ||
                article.description?.toLowerCase().includes(keyword.toLowerCase())
              );
              
              const sentimentBreakdown = {
                positive: keywordArticles.filter(article => (article.sentimentScore || 0) > 10).length,
                negative: keywordArticles.filter(article => (article.sentimentScore || 0) < -10).length,
                neutral: keywordArticles.filter(article => 
                  (article.sentimentScore || 0) >= -10 && (article.sentimentScore || 0) <= 10
                ).length
              };
              
              const totalArticles = keywordArticles.length;
              const avgSentiment = totalArticles > 0 
                ? keywordArticles.reduce((sum, article) => sum + (article.sentimentScore || 0), 0) / totalArticles 
                : 0;
              
              // Calculate sentiment score (weighted algorithm)
              let sentimentScore = 0;
              if (totalArticles > 0) {
                // Positive articles contribute +1, negative -1, neutral 0
                const positiveWeight = sentimentBreakdown.positive * 1;
                const negativeWeight = sentimentBreakdown.negative * -1;
                const neutralWeight = sentimentBreakdown.neutral * 0;
                sentimentScore = (positiveWeight + negativeWeight + neutralWeight) / totalArticles * 100;
              }
              
              return {
                keyword,
                totalArticles,
                sentimentBreakdown,
                avgSentiment,
                sentimentScore
              };
            }).filter(data => data.totalArticles > 0);
            
            if (keywordSentimentData.length === 0) {
              return (
                <div className={styles.noDataMessage}>
                  <p>No sentiment data available for current keywords</p>
                </div>
              );
            }
            
            const maxSentiment = Math.max(...keywordSentimentData.map(d => Math.abs(d.sentimentScore)));
            
            return (
              <div className={styles.sentimentKeywordsContainer}>
                {keywordSentimentData.map((data, index) => {
                  const total = data.totalArticles;
                  const positivePercent = total > 0 ? (data.sentimentBreakdown.positive / total) * 100 : 0;
                  const negativePercent = total > 0 ? (data.sentimentBreakdown.negative / total) * 100 : 0;
                  const neutralPercent = total > 0 ? (data.sentimentBreakdown.neutral / total) * 100 : 0;
                  
                  // Calculate bar heights for stacked chart
                  const barHeight = maxSentiment > 0 ? (Math.abs(data.sentimentScore) / maxSentiment) * 150 : 0;
                  const isPositive = data.sentimentScore >= 0;
                  
                  return (
                    <div key={data.keyword} className={styles.sentimentKeywordBarGroup}>
                      <div className={styles.sentimentKeywordBarLabel}>
                        <span className={styles.keywordName}>{data.keyword}</span>
                        <span className={styles.keywordStats}>
                          {data.totalArticles} articles | Score: {data.sentimentScore.toFixed(1)}
                        </span>
                      </div>
                      <div className={styles.sentimentKeywordBarContainer}>
                        {/* Stacked sentiment bars */}
                        <div className={styles.sentimentStackedBars}>
                          <div 
                            className={styles.sentimentStackedBar}
                            style={{ 
                              width: `${positivePercent}%`,
                              backgroundColor: '#10b981',
                              height: '24px'
                            }}
                            title={`Positive: ${data.sentimentBreakdown.positive} (${positivePercent.toFixed(1)}%)`}
                          ></div>
                          <div 
                            className={styles.sentimentStackedBar}
                            style={{ 
                              width: `${neutralPercent}%`,
                              backgroundColor: '#6b7280',
                              height: '24px'
                            }}
                            title={`Neutral: ${data.sentimentBreakdown.neutral} (${neutralPercent.toFixed(1)}%)`}
                          ></div>
                          <div 
                            className={styles.sentimentStackedBar}
                            style={{ 
                              width: `${negativePercent}%`,
                              backgroundColor: '#ef4444',
                              height: '24px'
                            }}
                            title={`Negative: ${data.sentimentBreakdown.negative} (${negativePercent.toFixed(1)}%)`}
                          ></div>
                        </div>
                        {/* Sentiment score indicator bar */}
                        <div className={styles.sentimentScoreBar}>
                          <div 
                            className={styles.sentimentScoreBarFill}
                            style={{ 
                              height: `${barHeight}px`,
                              backgroundColor: isPositive ? '#10b981' : '#ef4444',
                              width: '8px',
                              marginLeft: 'auto'
                            }}
                            title={`Sentiment Score: ${data.sentimentScore.toFixed(1)}`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Share of Voice Chart */}
      <div className={styles.graphCard}>
        <div className={styles.graphHeader}>
          <h3 className={styles.graphTitle}>Share of Voice Analysis</h3>
          <Volume2 size={20} />
        </div>
        <div className={styles.voiceOfShareChart}>
          {(() => {
            // Calculate Share of Voice by keyword
            const voiceOfShareData = keywords.map(keyword => {
              const keywordArticles = articles.filter(article => 
                article.keyword?.toLowerCase() === keyword.toLowerCase() ||
                article.title?.toLowerCase().includes(keyword.toLowerCase()) ||
                article.description?.toLowerCase().includes(keyword.toLowerCase())
              );
              
              if (keywordArticles.length === 0) return null;
              
              const voiceOfShareResult = calculateTotalVoiceOfShare(keywordArticles);
              
              // Calculate Share of Voice distribution by sentiment
              const positiveArticles = keywordArticles.filter(article => (article.sentimentScore || 0) > 10);
              const negativeArticles = keywordArticles.filter(article => (article.sentimentScore || 0) < -10);
              const neutralArticles = keywordArticles.filter(article => 
                (article.sentimentScore || 0) >= -10 && (article.sentimentScore || 0) <= 10
              );
              
              const positiveVoiceOfShare = calculateTotalVoiceOfShare(positiveArticles).totalVoiceOfShare;
              const negativeVoiceOfShare = calculateTotalVoiceOfShare(negativeArticles).totalVoiceOfShare;
              const neutralVoiceOfShare = calculateTotalVoiceOfShare(neutralArticles).totalVoiceOfShare;
              
              // Calculate Share of Voice by tier
              const tierDistribution = voiceOfShareResult.breakdown.reduce((acc, tier) => {
                acc[tier.tier] = tier.totalReach;
                return acc;
              }, {} as Record<string, number>);
              
              return {
                keyword,
                totalVoiceOfShare: voiceOfShareResult.totalVoiceOfShare,
                averageVoiceOfShare: voiceOfShareResult.averageVoiceOfShare,
                articleCount: voiceOfShareResult.articleCount,
                sentimentDistribution: {
                  positive: positiveVoiceOfShare,
                  negative: negativeVoiceOfShare,
                  neutral: neutralVoiceOfShare
                },
                tierDistribution
              };
            }).filter(data => data !== null) as Array<{
              keyword: string;
              totalVoiceOfShare: number;
              averageVoiceOfShare: number;
              articleCount: number;
              sentimentDistribution: { positive: number; negative: number; neutral: number };
              tierDistribution: Record<string, number>;
            }>;
            
            if (voiceOfShareData.length === 0) {
              return (
                <div className={styles.noDataMessage}>
                  <p>No Share of Voice data available</p>
                </div>
              );
            }
            
            const maxVoiceOfShare = Math.max(...voiceOfShareData.map(d => d.totalVoiceOfShare));
            
            return (
              <div className={styles.voiceOfShareContainer}>
                {/* Share of Voice by Keyword - Bar Chart */}
                <div className={styles.voiceOfShareSection}>
                  <h4 className={styles.voiceOfShareSectionTitle}>Total Share of Voice by Keyword</h4>
                  <div className={styles.voiceOfShareBarChart}>
                    {voiceOfShareData.map((data, index) => {
                      const barWidth = maxVoiceOfShare > 0 ? (data.totalVoiceOfShare / maxVoiceOfShare) * 100 : 0;
                      return (
                        <div key={data.keyword} className={styles.voiceOfShareBarGroup}>
                          <div className={styles.voiceOfShareBarLabel}>
                            <span className={styles.voiceOfShareKeywordName}>{data.keyword}</span>
                            <span className={styles.voiceOfShareValue}>
                              {formatVoiceOfShareNumber(data.totalVoiceOfShare)}
                            </span>
                          </div>
                          <div className={styles.voiceOfShareBarContainer}>
                            <div 
                              className={styles.voiceOfShareBar}
                              style={{ 
                                width: `${barWidth}%`,
                                backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
                                height: '32px'
                              }}
                            ></div>
                            <span className={styles.voiceOfShareBarText}>
                              {data.articleCount} articles | Avg: {formatVoiceOfShareNumber(data.averageVoiceOfShare)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Share of Voice by Sentiment - Donut Chart */}
                <div className={styles.voiceOfShareSection}>
                  <h4 className={styles.voiceOfShareSectionTitle}>Share of Voice by Sentiment</h4>
                  <div className={styles.voiceOfShareDonutChart}>
                    <div className={styles.voiceOfShareDonutContainer}>
                      <svg viewBox="0 0 200 200" className={styles.voiceOfShareDonutSvg}>
                        <circle
                          cx="100"
                          cy="100"
                          r="80"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="20"
                        />
                        {(() => {
                          const totalSentimentVoice = voiceOfShareData.reduce((sum, data) => 
                            sum + data.sentimentDistribution.positive + 
                            data.sentimentDistribution.negative + 
                            data.sentimentDistribution.neutral, 0);
                          
                          if (totalSentimentVoice === 0) return null;
                          
                          const positiveTotal = voiceOfShareData.reduce((sum, data) => sum + data.sentimentDistribution.positive, 0);
                          const negativeTotal = voiceOfShareData.reduce((sum, data) => sum + data.sentimentDistribution.negative, 0);
                          const neutralTotal = voiceOfShareData.reduce((sum, data) => sum + data.sentimentDistribution.neutral, 0);
                          
                          const positivePercent = (positiveTotal / totalSentimentVoice) * 502.4;
                          const negativePercent = (negativeTotal / totalSentimentVoice) * 502.4;
                          const neutralPercent = (neutralTotal / totalSentimentVoice) * 502.4;
                          
                          let currentOffset = 0;
                          
                          return (
                            <>
                              <circle
                                cx="100"
                                cy="100"
                                r="80"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="20"
                                strokeDasharray={`${positivePercent} 502.4`}
                                strokeDashoffset={`-${currentOffset}`}
                                transform="rotate(-90 100 100)"
                                className={styles.voiceOfShareDonutSlice}
                              />
                              {currentOffset += positivePercent}
                              <circle
                                cx="100"
                                cy="100"
                                r="80"
                                fill="none"
                                stroke="#6b7280"
                                strokeWidth="20"
                                strokeDasharray={`${neutralPercent} 502.4`}
                                strokeDashoffset={`-${currentOffset}`}
                                transform="rotate(-90 100 100)"
                                className={styles.voiceOfShareDonutSlice}
                              />
                              {currentOffset += neutralPercent}
                              <circle
                                cx="100"
                                cy="100"
                                r="80"
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="20"
                                strokeDasharray={`${negativePercent} 502.4`}
                                strokeDashoffset={`-${currentOffset}`}
                                transform="rotate(-90 100 100)"
                                className={styles.voiceOfShareDonutSlice}
                              />
                            </>
                          );
                        })()}
                      </svg>
                      <div className={styles.voiceOfShareDonutCenter}>
                        <div className={styles.voiceOfShareDonutCenterNumber}>
                          {formatVoiceOfShareNumber(voiceOfShareData.reduce((sum, data) => sum + data.totalVoiceOfShare, 0))}
                        </div>
                        <div className={styles.voiceOfShareDonutCenterLabel}>Total Share of Voice</div>
                      </div>
                    </div>
                    <div className={styles.voiceOfShareDonutLegend}>
                      {(() => {
                        const totalSentimentVoice = voiceOfShareData.reduce((sum, data) => 
                          sum + data.sentimentDistribution.positive + 
                          data.sentimentDistribution.negative + 
                          data.sentimentDistribution.neutral, 0);
                        
                        if (totalSentimentVoice === 0) return null;
                        
                        const positiveTotal = voiceOfShareData.reduce((sum, data) => sum + data.sentimentDistribution.positive, 0);
                        const negativeTotal = voiceOfShareData.reduce((sum, data) => sum + data.sentimentDistribution.negative, 0);
                        const neutralTotal = voiceOfShareData.reduce((sum, data) => sum + data.sentimentDistribution.neutral, 0);
                        
                        return (
                          <>
                            <div className={styles.legendItem}>
                              <div className={styles.legendColor} style={{ backgroundColor: '#10b981' }}></div>
                              <span>Positive: {formatVoiceOfShareNumber(positiveTotal)}</span>
                            </div>
                            <div className={styles.legendItem}>
                              <div className={styles.legendColor} style={{ backgroundColor: '#6b7280' }}></div>
                              <span>Neutral: {formatVoiceOfShareNumber(neutralTotal)}</span>
                            </div>
                            <div className={styles.legendItem}>
                              <div className={styles.legendColor} style={{ backgroundColor: '#ef4444' }}></div>
                              <span>Negative: {formatVoiceOfShareNumber(negativeTotal)}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

/** Safely get a numeric value from engagement fields (may be number or object in DB). */
function safeEngagementNum(val: unknown): number {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  if (val != null && typeof val === 'object') {
    const o = val as Record<string, unknown>;
    if (typeof o.value === 'number') return o.value;
    if (typeof o.count === 'number') return o.count;
  }
  return 0;
}

function formatNumber(num: number): string {
  const n = Number(num);
  if (Number.isNaN(n) || n < 0) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}
