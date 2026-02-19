'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { setUser } from '@/lib/store/slices/userSlice';
import { setArticles } from '@/lib/store/slices/newsSlice';
import { enrichArticlesWithReach } from '@/utils/articleReachEnricher';
import { useCollectNewsData } from '@/lib/hooks/useNewsSimple';
import { dataManager } from '../services/dataManager';
import { socialMonitoringService } from '../services/socialMonitoringService';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity, 
  Users, 
  Search, 
  Newspaper, 
  MessageSquare,
  Eye,
  Share2,
  Heart,
  Calendar,
  Clock,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  History,
  Hash,
  Settings,
  Volume2
} from 'lucide-react';
import { InteractiveGraphs } from './InteractiveGraphs';
import ExportButton from './ExportButton';
import { createDashboardAnalyticsExportData } from '@/utils/exportUtils';
import { formatReachNumber } from '@/utils/reachCalculator';
import { calculateTotalVoiceOfShare, formatVoiceOfShareNumber } from '@/utils/voiceOfShareCalculator';
import styles from './SleekDashboard.module.scss';

interface User {
  id: number;
  name: string;
  email: string;
  plan: string;
  status: string;
  keywords?: string[];
}

export function SleekDashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const { articles, loading, error } = useAppSelector((state) => state.news);
  
  const [keywords, setKeywords] = useState<string[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [cronEnabled, setCronEnabled] = useState(false);
  const [lastCollectionTime, setLastCollectionTime] = useState<string | null>(null);
  const [monitoringData, setMonitoringData] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  
  const collectNewsData = useCollectNewsData();

  // Function to fetch monitoring data from database or localStorage
  const fetchMonitoringData = async () => {
    if (!user) return;
    
    setDataLoading(true);
    
    // First, try to load from localStorage (for offline/fallback support)
    try {
      const localData = localStorage.getItem('monitoringData') || localStorage.getItem('testMonitoringData');
      if (localData) {
        const data = JSON.parse(localData);
        setMonitoringData(data);
        
        // Update Redux store with articles from monitoring data
        const allArticles = [];
        for (const item of data) {
          if (item.newsData?.results) {
            // Transform articles to match NewsArticle interface
            const transformedArticles = item.newsData.results.map((article: any) => ({
              id: article.id || Math.random(),
              userId: user.id,
              keyword: item.keyword,
              articleId: article.id || Math.random(),
              title: article.title || 'No title',
              description: article.description || 'No description',
              url: article.url || '#',
              publishedAt: article.publishedAt || new Date().toISOString(),
              sourceName: article.source?.name || 'Unknown Source',
              sourceLogo: article.source?.logo,
              image: article.image,
              sentimentScore: article.sentiment?.score || 0,
              sentimentLabel: article.sentiment?.label || 'neutral',
              readTime: article.readTime || 1,
              isBreaking: article.isBreaking || false,
              categories: article.categories || [],
              topics: article.topics || [],
              engagement: article.engagement || { views: 0, shares: 0, comments: 0 },
              // Preserve existing estimatedReach if it exists (including voiceOfShare)
              estimatedReach: article.estimatedReach || undefined,
              rawData: article,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }));
            allArticles.push(...transformedArticles);
          }
        }
        // Enrich articles with estimated reach
        const enrichedArticles = enrichArticlesWithReach(allArticles);
        dispatch(setArticles(enrichedArticles));
        
        console.log('✅ Monitoring data loaded from localStorage:', data.length, 'keywords processed');
        console.log('📊 Articles dispatched to Redux:', allArticles.length);
        console.log('📋 Article titles:', allArticles.map(a => a.title));
        console.log('📊 Articles found:', data.reduce((sum: number, item: any) => sum + (item.newsData?.results?.length || 0), 0));
        console.log('🔍 Data structure:', data);
        setDataLoading(false);
        return;
      }
    } catch (error) {
      console.log('No valid data in localStorage, trying API...');
    }
    
    // If no localStorage data, try API
    try {
      const token = btoa(JSON.stringify({ userId: user.id }));
      const response = await fetch('/api/data/monitoring', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.monitoringData || [];
        setMonitoringData(data);
        
        // Update Redux store with articles from monitoring data
        const allArticles = [];
        for (const item of data) {
          if (item.newsData?.results) {
            // Transform articles to match NewsArticle interface
            const transformedArticles = item.newsData.results.map((article: any) => ({
              id: article.id || Math.random(),
              userId: user.id,
              keyword: item.keyword,
              articleId: article.id || Math.random(),
              title: article.title || 'No title',
              description: article.description || 'No description',
              url: article.url || '#',
              publishedAt: article.publishedAt || new Date().toISOString(),
              sourceName: article.source?.name || 'Unknown Source',
              sourceLogo: article.source?.logo,
              image: article.image,
              sentimentScore: article.sentiment?.score || 0,
              sentimentLabel: article.sentiment?.label || 'neutral',
              readTime: article.readTime || 1,
              isBreaking: article.isBreaking || false,
              categories: article.categories || [],
              topics: article.topics || [],
              engagement: article.engagement || { views: 0, shares: 0, comments: 0 },
              // Preserve existing estimatedReach if it exists (including voiceOfShare)
              estimatedReach: article.estimatedReach || undefined,
              rawData: article,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }));
            allArticles.push(...transformedArticles);
          }
        }
        // Enrich articles with estimated reach
        const enrichedArticles = enrichArticlesWithReach(allArticles);
        dispatch(setArticles(enrichedArticles));
        
        console.log('✅ Monitoring data fetched from API:', data.length, 'keywords processed');
      } else {
        console.log('API not available, no data to display');
      }
    } catch (error) {
      console.log('API not available:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      
      // Update Redux store with user data
      dispatch(setUser(parsedUser));
      
      // Extract keywords from user data
      if (parsedUser.keywords && parsedUser.keywords.length > 0) {
        setKeywords(parsedUser.keywords);
      }
    }
    setPageLoading(false);
  }, [dispatch]);

  // Fetch monitoring data when user is available
  useEffect(() => {
    if (user) {
      fetchMonitoringData();
    }
  }, [user]);

  // Check if user has keywords
  const checkUserKeywords = async () => {
    if (!user) return false;
    
    try {
      const token = btoa(JSON.stringify({ userId: user.id }));
      const response = await fetch('/api/keywords', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const keywords = await response.json();
        return keywords.length > 0;
      }
    } catch (error) {
      console.log('Could not check keywords:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    return false;
  };

  // Check and enable cron job for user
  useEffect(() => {
    const checkAndEnableCronJob = async () => {
      if (user) {
        try {
          const token = btoa(JSON.stringify({ userId: user.id }));
          
          // Get current cron settings
          const response = await fetch('/api/cron', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const result = await response.json();
            const settings = result.settings;
            
            setCronEnabled(settings.isEnabled);
            setLastCollectionTime(settings.lastRunAt);
            
            // If cron is not enabled, enable it automatically
            if (!settings.isEnabled) {
              await fetch('/api/cron', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  isEnabled: true,
                  intervalHours: 24,
                  timezone: 'UTC'
                })
              });
              
              setCronEnabled(true);
              console.log('✅ Automatically enabled cron job for user');
            }
          }
        } catch (error) {
          console.error('Error checking cron job status:', error);
        }
      }
    };

    checkAndEnableCronJob();
  }, [user]);

  const handleCollectData = async () => {
    if (user) {
      try {
        console.log('Starting data collection for both news and social...');
        
        // Collect news data
        await collectNewsData.mutateAsync(user.id);
        
        // Collect social data for all keywords
        if (user.keywords && user.keywords.length > 0) {
          console.log('Collecting social data for keywords:', user.keywords);
          
          for (const keyword of user.keywords) {
            try {
              console.log(`Collecting social data for keyword: ${keyword}`);
              const result = await socialMonitoringService.searchKeywordAcrossAllPlatforms(keyword);
              
              // Store social data
              const socialData = {
                keyword: keyword,
                results: result.results,
                errors: result.errors,
                timestamp: new Date().toISOString()
              };
              localStorage.setItem('socialListeningData', JSON.stringify(socialData));
              
              console.log(`Social data collected for ${keyword}:`, result.results.length, 'results');
            } catch (error) {
              console.error(`Failed to collect social data for keyword ${keyword}:`, error);
            }
          }
        }
        
        // Refresh all data in the data manager
        await dataManager.refreshAllData();
        
        // Fetch updated monitoring data from database
        await fetchMonitoringData();
        
        console.log('Data collection completed successfully');
      } catch (error) {
        console.error('Failed to collect data:', error);
      }
    }
  };

  // Calculate metrics
  const totalArticles = articles.length;
  const breakingNews = articles.filter(article => article.isBreaking).length;
  const sentimentBreakdown = {
    positive: articles.filter(article => (article.sentimentScore || 0) > 10).length,
    negative: articles.filter(article => (article.sentimentScore || 0) < -10).length,
    neutral: articles.filter(article => 
      (article.sentimentScore || 0) >= -10 && (article.sentimentScore || 0) <= 10
    ).length
  };

  const uniqueSources = [...new Set(articles.map(article => article.sourceName))];
  const totalEngagement = articles.reduce((sum, article) => {
    const engagement = article.engagement || {};
    return sum + (engagement.views || 0) + (engagement.shares || 0) + (engagement.comments || 0);
  }, 0);

  const avgSentiment = articles.length > 0 
    ? articles.reduce((sum, article) => sum + (article.sentimentScore || 0), 0) / articles.length 
    : 0;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getSentimentIcon = (score: number) => {
    if (score > 10) return <TrendingUp className={styles.positiveIcon} />;
    if (score < -10) return <TrendingDown className={styles.negativeIcon} />;
    return <Minus className={styles.neutralIcon} />;
  };

  const getSentimentColor = (score: number) => {
    if (score > 10) return '#10b981';
    if (score < -10) return '#ef4444';
    return '#6b7280';
  };

  if (pageLoading || dataLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>{pageLoading ? 'Loading dashboard...' : 'Fetching monitoring data...'}</p>
      </div>
    );
  }

  return (
    <div ref={dashboardRef} className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.title}>Welcome back, {user?.name || 'User'}!</h1>
            <p className={styles.subtitle}>Here's what's happening with your reputation monitoring</p>
          </div>
          <div className={styles.headerActions}>
            <ExportButton
              data={createDashboardAnalyticsExportData([
                { metric: 'Total Articles', value: totalArticles, change: '+12%', trend: 'up', category: 'Content', timestamp: new Date().toISOString() },
                { metric: 'Keywords Monitored', value: keywords.length, change: '+2', trend: 'up', category: 'Keywords', timestamp: new Date().toISOString() },
                { metric: 'Social Mentions', value: 0, change: '0%', trend: 'stable', category: 'Social', timestamp: new Date().toISOString() },
                { metric: 'Sentiment Score', value: 0, change: '0%', trend: 'stable', category: 'Analytics', timestamp: new Date().toISOString() }
              ])}
              variant="outline"
              size="medium"
              showLabel={true}
              targetElementRef={dashboardRef}
            />
            {cronEnabled ? (
              <div className={styles.automationStatus}>
                <div className={styles.automationIcon}>
                  <Clock size={20} />
                </div>
                <div className={styles.automationContent}>
                  <div className={styles.automationTitle}>Collection Enabled</div>
                  <div className={styles.automationSubtitle}>
                    {lastCollectionTime 
                      ? `Last run: ${new Date(lastCollectionTime).toLocaleString()}`
                      : 'Next run: Every 24 hours'
                    }
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleCollectData}
                disabled={collectNewsData.isPending}
                className={styles.collectButton}
              >
                <Zap size={20} />
                {collectNewsData.isPending ? 'Collecting...' : 'Collect New Data'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Newspaper size={24} />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{totalArticles}</div>
            <div className={styles.metricLabel}>Total Articles</div>
            <div className={styles.metricChange}>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Target size={24} />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{keywords.length}</div>
            <div className={styles.metricLabel}>Keywords Monitored</div>
            <div className={styles.metricChange}>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Activity size={24} />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{formatNumber(totalEngagement)}</div>
            <div className={styles.metricLabel}>Total Engagement</div>
            <div className={styles.metricChange}>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <BarChart3 size={24} />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{avgSentiment.toFixed(1)}</div>
            <div className={styles.metricLabel}>Avg Sentiment</div>
            <div className={styles.metricChange}>
            </div>
          </div>
        </div>

        {/* Additional Keyword-Specific Metrics */}
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{(() => {
              // Enhanced Content Virality calculation
              if (articles.length === 0) return 0;
              
              const viralityScore = articles.reduce((sum, article) => {
                const engagement = article.engagement || {};
                const views = engagement.views || 0;
                const shares = engagement.shares || 0;
                const comments = engagement.comments || 0;
                const likes = engagement.likes || 0;
                
                // Enhanced virality calculation with multiple factors
                let viralityPoints = 0;
                
                // 1. Engagement-based virality (if engagement data exists)
                if (views > 0) {
                  const shareRatio = (shares / views) * 100;
                  const commentRatio = (comments / views) * 100;
                  const likeRatio = (likes / views) * 100;
                  viralityPoints += (shareRatio + commentRatio + likeRatio) * 0.3;
                }
                
                // 2. Content-based virality indicators
                const title = article.title?.toLowerCase() || '';
                const description = article.description?.toLowerCase() || '';
                const content = `${title} ${description}`;
                
                // Viral content indicators
                const viralWords = [
                  'viral', 'trending', 'breaking', 'exclusive', 'shocking', 'amazing',
                  'incredible', 'unbelievable', 'stunning', 'outrageous', 'scandal',
                  'controversy', 'crisis', 'emergency', 'urgent', 'alert', 'warning',
                  'first', 'only', 'never', 'always', 'everyone', 'nobody', 'secret',
                  'revealed', 'exposed', 'leaked', 'confirmed', 'denied', 'official'
                ];
                
                const viralWordCount = viralWords.reduce((count, word) => 
                  count + (content.includes(word) ? 1 : 0), 0);
                viralityPoints += viralWordCount * 5;
                
                // 3. Title characteristics that drive virality
                if (title.includes('!')) viralityPoints += 3; // Exclamation marks
                if (title.includes('?')) viralityPoints += 2; // Question marks
                if (title.includes(':')) viralityPoints += 2; // Colons (often used for emphasis)
                if (title.length > 50 && title.length < 100) viralityPoints += 2; // Optimal title length
                
                // 4. Breaking news boost
                if (article.isBreaking) viralityPoints += 10;
                
                // 5. Keyword-specific virality multipliers
                const keyword = article.keyword?.toLowerCase() || '';
                let viralityMultiplier = 1;
                if (keyword.includes('obama') || keyword.includes('trump') || keyword.includes('politics')) {
                  viralityMultiplier = 1.5; // Political content is more viral
                } else if (keyword.includes('tech') || keyword.includes('ai') || keyword.includes('innovation')) {
                  viralityMultiplier = 1.3; // Tech content is viral
                } else if (keyword.includes('sport') || keyword.includes('volley') || keyword.includes('game')) {
                  viralityMultiplier = 1.4; // Sports content is highly viral
                } else if (keyword.includes('climate') || keyword.includes('environment')) {
                  viralityMultiplier = 1.2; // Environmental content has viral potential
                }
                
                // 6. Source credibility boost (some sources are more viral)
                const sourceName = article.sourceName?.toLowerCase() || '';
                if (sourceName.includes('bbc') || sourceName.includes('cnn') || sourceName.includes('reuters')) {
                  viralityPoints += 3; // Major news sources get credibility boost
                }
                
                return sum + (viralityPoints * viralityMultiplier);
              }, 0);
              
              // Normalize to 0-100 scale
              const normalizedVirality = Math.min(100, Math.round(viralityScore / articles.length));
              return normalizedVirality;
            })()}</div>
            <div className={styles.metricLabel}>Content Virality</div>
            <div className={styles.metricChange}>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Activity size={24} />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{(() => {
              // Enhanced Emotional Intensity calculation
              if (articles.length === 0) return 0;
              
              const emotionalIntensity = articles.reduce((sum, article) => {
                const title = article.title?.toLowerCase() || '';
                const description = article.description?.toLowerCase() || '';
                const content = `${title} ${description}`;
                
                let emotionalPoints = 0;
                
                // 1. Emotional word categories with intensity scoring
                const emotionalWords = {
                  // High intensity positive emotions
                  'amazing': 8, 'incredible': 8, 'fantastic': 7, 'outstanding': 7, 'brilliant': 7, 'revolutionary': 9,
                  'stunning': 8, 'remarkable': 6, 'extraordinary': 8, 'phenomenal': 8, 'spectacular': 7,
                  
                  // High intensity negative emotions
                  'terrible': 8, 'awful': 7, 'horrible': 8, 'disastrous': 9, 'devastating': 9, 'scandal': 8,
                  'outrageous': 8, 'shocking': 8, 'appalling': 8, 'catastrophic': 9, 'tragic': 7,
                  
                  // Urgency and breaking news emotions
                  'breaking': 6, 'urgent': 7, 'critical': 7, 'emergency': 8, 'crisis': 8, 'alert': 6,
                  'warning': 6, 'danger': 7, 'threat': 6, 'immediate': 6, 'instant': 5,
                  
                  // Excitement and enthusiasm
                  'excited': 6, 'thrilled': 7, 'delighted': 6, 'ecstatic': 8, 'euphoric': 8, 'passionate': 6,
                  'enthusiastic': 6, 'energetic': 5, 'dynamic': 5, 'vibrant': 5,
                  
                  // Anger and frustration
                  'outraged': 8, 'furious': 8, 'angry': 6, 'frustrated': 6, 'irritated': 5, 'annoyed': 5,
                  'disappointed': 5, 'upset': 5, 'concerned': 4, 'worried': 4, 'anxious': 5,
                  
                  // Surprise and shock
                  'surprised': 5, 'shocked': 7, 'astonished': 7, 'bewildered': 6, 'confused': 4,
                  'unexpected': 5, 'sudden': 5, 'abrupt': 5,
                  
                  // Love and positive feelings
                  'love': 7, 'adore': 7, 'cherish': 6, 'treasure': 6, 'celebrate': 6, 'honor': 5,
                  'respect': 5, 'admire': 5, 'appreciate': 5, 'grateful': 5,
                  
                  // Fear and anxiety
                  'afraid': 6, 'scared': 6, 'terrified': 8, 'fearful': 5, 'nervous': 4, 'tense': 4,
                  'stressed': 5, 'overwhelmed': 6, 'panicked': 7
                };
                
                // Calculate emotional intensity from word analysis
                Object.entries(emotionalWords).forEach(([word, intensity]) => {
                  if (content.includes(word)) {
                    emotionalPoints += intensity;
                  }
                });
                
                // 2. Punctuation intensity boost
                const exclamationCount = (content.match(/!/g) || []).length;
                const questionCount = (content.match(/\?/g) || []).length;
                emotionalPoints += exclamationCount * 2; // Each ! adds intensity
                emotionalPoints += questionCount * 1; // Each ? adds some intensity
                
                // 3. Title characteristics that indicate emotional content
                if (title.includes('BREAKING') || title.includes('URGENT')) emotionalPoints += 5;
                if (title.includes('EXCLUSIVE') || title.includes('FIRST')) emotionalPoints += 4;
                if (title.includes('SHOCKING') || title.includes('STUNNING')) emotionalPoints += 6;
                
                // 4. Keyword-specific emotional multipliers
                const keyword = article.keyword?.toLowerCase() || '';
                let emotionalMultiplier = 1;
                if (keyword.includes('obama') || keyword.includes('politics') || keyword.includes('election')) {
                  emotionalMultiplier = 1.6; // Political content is highly emotional
                } else if (keyword.includes('sport') || keyword.includes('volley') || keyword.includes('game')) {
                  emotionalMultiplier = 1.4; // Sports content is emotional
                } else if (keyword.includes('tech') || keyword.includes('ai') || keyword.includes('innovation')) {
                  emotionalMultiplier = 1.2; // Tech content has moderate emotion
                } else if (keyword.includes('climate') || keyword.includes('environment') || keyword.includes('crisis')) {
                  emotionalMultiplier = 1.5; // Environmental content can be highly emotional
                } else if (keyword.includes('health') || keyword.includes('medical') || keyword.includes('pandemic')) {
                  emotionalMultiplier = 1.7; // Health content is very emotional
                }
                
                // 5. Breaking news emotional boost
                if (article.isBreaking) emotionalPoints += 8;
                
                // 6. Source emotional credibility
                const sourceName = article.sourceName?.toLowerCase() || '';
                if (sourceName.includes('bbc') || sourceName.includes('cnn') || sourceName.includes('reuters')) {
                  emotionalPoints += 2; // Major sources often cover emotional stories
                }
                
                return sum + (emotionalPoints * emotionalMultiplier);
              }, 0);
              
              // Normalize to 0-100 scale
              const normalizedIntensity = Math.min(100, Math.round(emotionalIntensity / articles.length));
              return normalizedIntensity;
            })()}</div>
            <div className={styles.metricLabel}>Emotional Intensity</div>
            <div className={styles.metricChange}>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Target size={24} />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{(() => {
              // Calculate content diversity score based on source variety
              const sourceCounts = articles.reduce((acc, article) => {
                const source = article.sourceName || 'Unknown';
                acc[source] = (acc[source] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              
              const uniqueSources = Object.keys(sourceCounts).length;
              const totalArticles = articles.length;
              const diversityScore = totalArticles > 0 ? (uniqueSources / totalArticles) * 100 : 0;
              
              return Math.round(diversityScore);
            })()}</div>
            <div className={styles.metricLabel}>Source Diversity</div>
            <div className={styles.metricChange}>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Clock size={24} />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{(() => {
              // Calculate content freshness score based on recency
              const now = new Date();
              const freshnessScore = articles.reduce((sum, article) => {
                const publishedDate = new Date(article.publishedAt);
                const hoursDiff = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60);
                
                // Calculate freshness score (higher for more recent content)
                let freshness = 100;
                if (hoursDiff > 24) freshness = 80;
                if (hoursDiff > 72) freshness = 60;
                if (hoursDiff > 168) freshness = 40; // 1 week
                if (hoursDiff > 720) freshness = 20; // 1 month
                
                // Keyword-specific freshness boost
                const keyword = article.keyword?.toLowerCase() || '';
                let freshnessMultiplier = 1;
                if (keyword.includes('breaking') || keyword.includes('news')) {
                  freshnessMultiplier = 1.2; // News content freshness matters more
                } else if (keyword.includes('tech') || keyword.includes('ai')) {
                  freshnessMultiplier = 1.1; // Tech content freshness is important
                }
                
                return sum + (freshness * freshnessMultiplier);
              }, 0);
              return Math.round(freshnessScore / articles.length || 0);
            })()}</div>
            <div className={styles.metricLabel}>Content Freshness</div>
            <div className={styles.metricChange}>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Volume2 size={24} />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{(() => {
              // Calculate Voice of Share based on article reach
              if (articles.length === 0) return '0';
              
              const voiceOfShareResult = calculateTotalVoiceOfShare(articles);
              console.log('Voice of Share calculated:', voiceOfShareResult);
              
              return formatVoiceOfShareNumber(voiceOfShareResult.totalVoiceOfShare);
            })()}</div>
            <div className={styles.metricLabel}>Voice of Share</div>
            <div className={styles.metricChange}>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Graphs Section */}
      <div className={styles.graphsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Data Analytics & Insights</h2>
          <BarChart3 size={24} />
        </div>
        <InteractiveGraphs articles={articles} keywords={keywords} />
      </div>

      {/* Recent Activity */}
      <div className={styles.activitySection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Recent Activity</h3>
          <Calendar size={20} />
        </div>
        <div className={styles.activityGrid}>
          {articles.length === 0 && (
            <div className={styles.noDataMessage}>
              <p>No articles found. Articles count: {articles.length}</p>
              <p>Check console for debugging info.</p>
            </div>
          )}
          {articles.slice(0, 6).map((article, index) => (
            <div key={article.id} className={styles.activityCard}>
              <div className={styles.activityIcon}>
                {getSentimentIcon(article.sentimentScore || 0)}
              </div>
              <div className={styles.activityContent}>
                <h4 className={styles.activityTitle}>{article.title}</h4>
                <div className={styles.activityMeta}>
                  {article.sourceName && article.sourceName !== 'Unknown Source' && (
                    <span className={styles.activitySource}>{article.sourceName}</span>
                  )}
                  <span className={styles.activityTime}>
                    <Clock size={14} />
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className={styles.activityEngagement}>
                  <span><Eye size={14} /> {formatNumber(article.engagement?.views || 0)}</span>
                  <span><Share2 size={14} /> {formatNumber(article.engagement?.shares || 0)}</span>
                  <span><MessageSquare size={14} /> {formatNumber(article.engagement?.comments || 0)}</span>
                </div>
                {article.estimatedReach && (
                  <div className={styles.activityReach}>
                    <Users size={14} />
                    <span className={styles.reachText}>
                      Reach: {formatReachNumber(article.estimatedReach.finalEstimatedReach)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Keywords Status */}
      <div className={styles.keywordsSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Keywords Status</h3>
          <Search size={20} />
        </div>
        <div className={styles.keywordsGrid}>
          {keywords.map((keyword, index) => (
            <div key={keyword} className={styles.keywordCard}>
              <div className={styles.keywordIcon}>
                <Search size={16} />
              </div>
              <span className={styles.keywordText}>{keyword}</span>
              <div className={styles.keywordStatus}>
                <div className={styles.statusDot}></div>
                <span>Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automation */}
      <div className={styles.automationSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Automation</h3>
          <Settings size={20} />
        </div>
        <div className={styles.automationGrid}>
          <div className={styles.automationCard}>
            <div className={styles.automationIcon}>
              <Settings size={24} />
            </div>
            <div className={styles.automationContent}>
              <h4 className={styles.automationTitle}>Automation Settings</h4>
              <p className={styles.automationDescription}>
                Configure automated data collection schedules and manage cron jobs.
              </p>
              <a 
                href="/dashboard/historical" 
                className={styles.automationLink}
              >
                Manage Automation
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <p className={styles.disclaimerText}>
          <strong>Disclaimer:</strong> Data sourced from third-party providers. Sentiment analysis performed by our proprietary algorithms.
        </p>
      </div>
    </div>
  );
}
