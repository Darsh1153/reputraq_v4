'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { setUser } from '@/lib/store/slices/userSlice';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Calendar, 
  ExternalLink, 
  Eye, 
  MessageSquare,
  Share2,
  Heart,
  BarChart3,
  Target,
  Users,
  Building2,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Crown,
  Star,
  Zap,
  Hash,
  Sparkles,
  Activity,
  TrendingDown,
  Minus,
  ArrowUp,
  ArrowDown,
  Equal
} from 'lucide-react';
import styles from './page.module.scss';

interface User {
  id: number;
  name: string;
  email: string;
  plan: string;
  status: string;
  keywords?: string[];
}

interface Keyword {
  id: number;
  userId: number;
  keyword: string;
  createdAt: string;
}

interface CompetitorKeyword {
  id: number;
  userId: number;
  keyword: string;
  createdAt: string;
}

interface SentimentAnalysis {
  positive: number;
  negative: number;
  neutral: number;
  averageScore: number;
  totalArticles: number;
  sentimentDistribution: {
    veryPositive: number;
    positive: number;
    slightlyPositive: number;
    neutral: number;
    slightlyNegative: number;
    negative: number;
    veryNegative: number;
  };
  topPositiveArticles: any[];
  topNegativeArticles: any[];
  recentArticles: any[];
}

interface ComparisonResult {
  brandKeyword: string;
  competitorKeyword: string;
  brandSentiment: SentimentAnalysis;
  competitorSentiment: SentimentAnalysis;
  comparison: {
    sentimentDifference: number;
    brandAdvantage: boolean;
    competitorAdvantage: boolean;
    overallWinner: string;
    confidence: string;
    brandPositiveRatio: number;
    competitorPositiveRatio: number;
    brandNegativeRatio: number;
    competitorNegativeRatio: number;
    totalArticlesAnalyzed: number;
  };
  brandArticles: any[];
  competitorArticles: any[];
  analysisDate: string;
  dataSource: string;
}

export default function CompetitorVsNewsPage() {
  const dispatch = useAppDispatch();
  const { user: reduxUser } = useAppSelector((state) => state.user);
  const [user, setUser] = useState<User | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [competitorKeywords, setCompetitorKeywords] = useState<CompetitorKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrandKeyword, setSelectedBrandKeyword] = useState<string>('');
  const [selectedCompetitorKeyword, setSelectedCompetitorKeyword] = useState<string>('');
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch keywords
  const fetchKeywords = async () => {
    try {
      const user = localStorage.getItem('user');
      if (!user) return;

      const userData = JSON.parse(user);
      const token = btoa(JSON.stringify({ userId: userData.id }));

      const response = await fetch('/api/keywords', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const keywordsData = await response.json();
        setKeywords(keywordsData);
      }
    } catch (error) {
      console.error('Error fetching keywords:', error);
    }
  };

  // Fetch competitor keywords
  const fetchCompetitorKeywords = async () => {
    try {
      const user = localStorage.getItem('user');
      if (!user) return;

      const userData = JSON.parse(user);
      const token = btoa(JSON.stringify({ userId: userData.id }));

      const response = await fetch('/api/competitor-keywords', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const keywordsData = await response.json();
        setCompetitorKeywords(keywordsData);
      }
    } catch (error) {
      console.error('Error fetching competitor keywords:', error);
    }
  };

  // Perform comparison
  const performComparison = async () => {
    if (!selectedBrandKeyword || !selectedCompetitorKeyword) {
      setError('Please select both brand and competitor keywords');
      return;
    }

    setComparing(true);
    setError(null);

    try {
      const user = localStorage.getItem('user');
      if (!user) {
        setError('Please sign in to perform comparison');
        setComparing(false);
        return;
      }

      const userData = JSON.parse(user);
      const token = btoa(JSON.stringify({ userId: userData.id }));

      const response = await fetch('/api/competitor-vs-news/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          brandKeyword: selectedBrandKeyword,
          competitorKeyword: selectedCompetitorKeyword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Comparison successful:', data);
        console.log('📊 Brand articles found:', data.brandSentiment.totalArticles);
        console.log('📊 Competitor articles found:', data.competitorSentiment.totalArticles);
        console.log('📊 Total articles analyzed:', data.comparison.totalArticlesAnalyzed);
        setComparisonResult(data);
      } else {
        console.error('❌ Comparison failed:', data);
        setError(data.error || 'Failed to perform comparison');
      }
    } catch (error) {
      console.error('Error performing comparison:', error);
      setError('Failed to perform comparison');
    } finally {
      setComparing(false);
    }
  };

  useEffect(() => {
    // Load user data synchronously first
    const userData = localStorage.getItem("user");
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('CompetitorVsNews - Parsed user data:', parsedUser);
        setUser(parsedUser);
        
        // Only dispatch if user data is valid
        if (parsedUser && parsedUser.id) {
          dispatch(setUser(parsedUser));
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

          // Then load keywords asynchronously
          const loadKeywords = async () => {
            try {
              console.log('🔄 Loading keywords...');
              await fetchKeywords();
              console.log('🔄 Fetching competitor keywords...');
              await fetchCompetitorKeywords();
              console.log('✅ All keywords loaded');
            } catch (error) {
              console.error('Error loading keywords:', error);
            } finally {
              setLoading(false);
            }
          };

          loadKeywords();
  }, [dispatch]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <h3>Loading Comparison Tool...</h3>
        <p>Preparing sentiment analysis comparison</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.error}>
        <h2>Access Denied</h2>
        <p>Please sign in to access competitor comparison.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h1>Competitor VS You</h1>
            <p>Compare sentiment analysis between your brand and competitors</p>
          </div>
        </div>
      </div>

      {/* Keyword Selection */}
      <div className={styles.selectionSection}>
        <div className={styles.selectionGrid}>
          {/* Brand Keyword Selection */}
          <div className={styles.keywordSelector}>
            <div className={styles.selectorHeader}>
              <div className={styles.selectorIcon}>
                <Target size={20} />
              </div>
              <h3>Your Brand Keyword</h3>
            </div>
            <select
              value={selectedBrandKeyword}
              onChange={(e) => setSelectedBrandKeyword(e.target.value)}
              className={styles.keywordSelect}
            >
              <option value="">Select Brand Keyword ({keywords.length} available)</option>
              {console.log('🔍 Rendering keywords from Keywords management:', keywords)}
              {keywords.map((keyword) => (
                <option key={keyword.id} value={keyword.keyword}>
                  {keyword.keyword}
                </option>
              ))}
            </select>
          </div>

          {/* Competitor Keyword Selection */}
          <div className={styles.keywordSelector}>
            <div className={styles.selectorHeader}>
              <div className={styles.selectorIcon}>
                <Building2 size={20} />
              </div>
              <h3>Competitor Keyword</h3>
            </div>
            <select
              value={selectedCompetitorKeyword}
              onChange={(e) => setSelectedCompetitorKeyword(e.target.value)}
              className={styles.keywordSelect}
            >
              <option value="">Select Competitor Keyword ({competitorKeywords.length} available)</option>
              {competitorKeywords.map((keyword) => (
                <option key={keyword.id} value={keyword.keyword}>
                  {keyword.keyword}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Compare Button */}
        <div className={styles.compareSection}>
          <button
            onClick={performComparison}
            disabled={!selectedBrandKeyword || !selectedCompetitorKeyword || comparing}
            className={styles.compareButton}
          >
            {comparing ? (
              <>
                <div className={styles.spinner}></div>
                Comparing...
              </>
            ) : (
              <>
                <BarChart3 size={16} />
                Compare Sentiment
              </>
            )}
          </button>
        </div>

        {/* Debug Information */}
        <div className={styles.debugInfo}>
          <strong>Debug Info:</strong><br />
          Brand Keywords Available (from Keywords Management): {keywords.length}<br />
          Competitor Keywords Available: {competitorKeywords.length}<br />
          Selected Brand: {selectedBrandKeyword || 'None'}<br />
          Selected Competitor: {selectedCompetitorKeyword || 'None'}
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>

      {/* Comparison Results */}
      {comparisonResult && (
        <div className={styles.resultsSection}>
          <div className={styles.resultsHeader}>
            <h2>Sentiment Analysis Comparison</h2>
            <p>
              Comparing <strong>{comparisonResult.brandKeyword}</strong> vs <strong>{comparisonResult.competitorKeyword}</strong>
            </p>
          </div>

          {/* Overall Winner */}
          <div className={styles.winnerCard}>
            <div className={styles.winnerHeader}>
              <div className={styles.winnerIcon}>
                {comparisonResult.comparison.overallWinner === comparisonResult.brandKeyword ? (
                  <ArrowUp size={24} className={styles.winnerArrow} />
                ) : comparisonResult.comparison.overallWinner === comparisonResult.competitorKeyword ? (
                  <ArrowDown size={24} className={styles.loserArrow} />
                ) : (
                  <Equal size={24} className={styles.tieArrow} />
                )}
              </div>
              <div className={styles.winnerContent}>
                <h3>
                  {comparisonResult.comparison.overallWinner === comparisonResult.brandKeyword 
                    ? `${comparisonResult.brandKeyword} Wins!` 
                    : comparisonResult.comparison.overallWinner === comparisonResult.competitorKeyword
                    ? `${comparisonResult.competitorKeyword} Wins!`
                    : 'Tie!'
                  }
                </h3>
                <p>
                  Sentiment difference: {comparisonResult.comparison.sentimentDifference > 0 ? '+' : ''}{comparisonResult.comparison.sentimentDifference.toFixed(3)}
                </p>
                <p>
                  Confidence: <strong>{comparisonResult.comparison.confidence}</strong> | 
                  Articles analyzed: <strong>{comparisonResult.comparison.totalArticlesAnalyzed}</strong>
                </p>
                <p className={styles.dataSource}>
                  📊 {comparisonResult.dataSource} | Analysis date: {new Date(comparisonResult.analysisDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Sentiment Comparison */}
          <div className={styles.sentimentGrid}>
            {/* Brand Sentiment */}
            <div className={styles.sentimentCard}>
              <div className={styles.sentimentHeader}>
                <Target size={20} />
                <h3>{comparisonResult.brandKeyword}</h3>
                <span className={styles.totalArticles}>({comparisonResult.brandSentiment.totalArticles} articles)</span>
              </div>
              <div className={styles.sentimentStats}>
                <div className={styles.sentimentItem}>
                  <div className={styles.sentimentLabel}>Positive</div>
                  <div className={styles.sentimentValue}>{comparisonResult.brandSentiment.positive}</div>
                  <div className={styles.sentimentPercentage}>
                    {comparisonResult.comparison.brandPositiveRatio.toFixed(1)}%
                  </div>
                </div>
                <div className={styles.sentimentItem}>
                  <div className={styles.sentimentLabel}>Neutral</div>
                  <div className={styles.sentimentValue}>{comparisonResult.brandSentiment.neutral}</div>
                  <div className={styles.sentimentPercentage}>
                    {((comparisonResult.brandSentiment.neutral / comparisonResult.brandSentiment.totalArticles) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className={styles.sentimentItem}>
                  <div className={styles.sentimentLabel}>Negative</div>
                  <div className={styles.sentimentValue}>{comparisonResult.brandSentiment.negative}</div>
                  <div className={styles.sentimentPercentage}>
                    {comparisonResult.comparison.brandNegativeRatio.toFixed(1)}%
                  </div>
                </div>
                <div className={styles.sentimentItem}>
                  <div className={styles.sentimentLabel}>Average Score</div>
                  <div className={`${styles.sentimentValue} ${styles.averageScore}`}>
                    {comparisonResult.brandSentiment.averageScore.toFixed(3)}
                  </div>
                </div>
              </div>
              
              {/* Detailed Sentiment Distribution */}
              <div className={styles.sentimentDistribution}>
                <h4>Sentiment Distribution:</h4>
                <div className={styles.distributionGrid}>
                  <div className={styles.distributionItem}>
                    <span className={styles.distributionLabel}>Very Positive</span>
                    <span className={styles.distributionValue}>{comparisonResult.brandSentiment.sentimentDistribution.veryPositive}</span>
                  </div>
                  <div className={styles.distributionItem}>
                    <span className={styles.distributionLabel}>Positive</span>
                    <span className={styles.distributionValue}>{comparisonResult.brandSentiment.sentimentDistribution.positive}</span>
                  </div>
                  <div className={styles.distributionItem}>
                    <span className={styles.distributionLabel}>Slightly Positive</span>
                    <span className={styles.distributionValue}>{comparisonResult.brandSentiment.sentimentDistribution.slightlyPositive}</span>
                  </div>
                  <div className={styles.distributionItem}>
                    <span className={styles.distributionLabel}>Neutral</span>
                    <span className={styles.distributionValue}>{comparisonResult.brandSentiment.sentimentDistribution.neutral}</span>
                  </div>
                  <div className={styles.distributionItem}>
                    <span className={styles.distributionLabel}>Slightly Negative</span>
                    <span className={styles.distributionValue}>{comparisonResult.brandSentiment.sentimentDistribution.slightlyNegative}</span>
                  </div>
                  <div className={styles.distributionItem}>
                    <span className={styles.distributionLabel}>Negative</span>
                    <span className={styles.distributionValue}>{comparisonResult.brandSentiment.sentimentDistribution.negative}</span>
                  </div>
                  <div className={styles.distributionItem}>
                    <span className={styles.distributionLabel}>Very Negative</span>
                    <span className={styles.distributionValue}>{comparisonResult.brandSentiment.sentimentDistribution.veryNegative}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Competitor Sentiment */}
            <div className={styles.sentimentCard}>
              <div className={styles.sentimentHeader}>
                <Building2 size={20} />
                <h3>{comparisonResult.competitorKeyword}</h3>
                <span className={styles.totalArticles}>({comparisonResult.competitorSentiment.totalArticles} articles)</span>
              </div>
              <div className={styles.sentimentStats}>
                <div className={styles.sentimentItem}>
                  <div className={styles.sentimentLabel}>Positive</div>
                  <div className={styles.sentimentValue}>{comparisonResult.competitorSentiment.positive}</div>
                  <div className={styles.sentimentPercentage}>
                    {comparisonResult.comparison.competitorPositiveRatio.toFixed(1)}%
                  </div>
                </div>
                <div className={styles.sentimentItem}>
                  <div className={styles.sentimentLabel}>Neutral</div>
                  <div className={styles.sentimentValue}>{comparisonResult.competitorSentiment.neutral}</div>
                  <div className={styles.sentimentPercentage}>
                    {((comparisonResult.competitorSentiment.neutral / comparisonResult.competitorSentiment.totalArticles) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className={styles.sentimentItem}>
                  <div className={styles.sentimentLabel}>Negative</div>
                  <div className={styles.sentimentValue}>{comparisonResult.competitorSentiment.negative}</div>
                  <div className={styles.sentimentPercentage}>
                    {comparisonResult.comparison.competitorNegativeRatio.toFixed(1)}%
                  </div>
                </div>
                <div className={styles.sentimentItem}>
                  <div className={styles.sentimentLabel}>Average Score</div>
                  <div className={`${styles.sentimentValue} ${styles.averageScore}`}>
                    {comparisonResult.competitorSentiment.averageScore.toFixed(3)}
                  </div>
                </div>
              </div>
              
              {/* Detailed Sentiment Distribution */}
              <div className={styles.sentimentDistribution}>
                <h4>Sentiment Distribution:</h4>
                <div className={styles.distributionGrid}>
                  <div className={styles.distributionItem}>
                    <span className={styles.distributionLabel}>Very Positive</span>
                    <span className={styles.distributionValue}>{comparisonResult.competitorSentiment.sentimentDistribution.veryPositive}</span>
                  </div>
                  <div className={styles.distributionItem}>
                    <span className={styles.distributionLabel}>Positive</span>
                    <span className={styles.distributionValue}>{comparisonResult.competitorSentiment.sentimentDistribution.positive}</span>
                  </div>
                  <div className={styles.distributionItem}>
                    <span className={styles.distributionLabel}>Slightly Positive</span>
                    <span className={styles.distributionValue}>{comparisonResult.competitorSentiment.sentimentDistribution.slightlyPositive}</span>
                  </div>
                  <div className={styles.distributionItem}>
                    <span className={styles.distributionLabel}>Neutral</span>
                    <span className={styles.distributionValue}>{comparisonResult.competitorSentiment.sentimentDistribution.neutral}</span>
                  </div>
                  <div className={styles.distributionItem}>
                    <span className={styles.distributionLabel}>Slightly Negative</span>
                    <span className={styles.distributionValue}>{comparisonResult.competitorSentiment.sentimentDistribution.slightlyNegative}</span>
                  </div>
                  <div className={styles.distributionItem}>
                    <span className={styles.distributionLabel}>Negative</span>
                    <span className={styles.distributionValue}>{comparisonResult.competitorSentiment.sentimentDistribution.negative}</span>
                  </div>
                  <div className={styles.distributionItem}>
                    <span className={styles.distributionLabel}>Very Negative</span>
                    <span className={styles.distributionValue}>{comparisonResult.competitorSentiment.sentimentDistribution.veryNegative}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Articles Comparison */}
          <div className={styles.articlesComparison}>
            <div className={styles.articlesGrid}>
              {/* Brand Articles */}
              <div className={styles.articlesSection}>
                <h3>{comparisonResult.brandKeyword} Articles ({comparisonResult.brandArticles.length} recent)</h3>
                <div className={styles.articlesList}>
                  {comparisonResult.brandArticles.slice(0, 5).map((article, index) => (
                    <div key={index} className={styles.articleCard}>
                      <div className={styles.articleHeader}>
                        {article.sourceName && article.sourceName !== 'Unknown Source' && (
                          <span className={styles.articleSource}>{article.sourceName}</span>
                        )}
                        <div className={styles.articleMeta}>
                          <span className={styles.articleDate}>
                            {new Date(article.publishedAt).toLocaleDateString()}
                          </span>
                          <span className={`${styles.sentimentBadge} ${styles[article.sentimentLabel || 'neutral']}`}>
                            {article.sentimentLabel || 'neutral'} ({article.sentimentScore || 0})
                          </span>
                        </div>
                      </div>
                      <h4 className={styles.articleTitle}>{article.title}</h4>
                      <p className={styles.articleDescription}>{article.description}</p>
                      <div className={styles.articleFooter}>
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.readMoreButton}
                        >
                          <ExternalLink size={12} />
                          Read More
                        </a>
                        <span className={styles.sentimentScore}>
                          Score: {article.sentimentScore || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competitor Articles */}
              <div className={styles.articlesSection}>
                <h3>{comparisonResult.competitorKeyword} Articles ({comparisonResult.competitorArticles.length} recent)</h3>
                <div className={styles.articlesList}>
                  {comparisonResult.competitorArticles.slice(0, 5).map((article, index) => (
                    <div key={index} className={styles.articleCard}>
                      <div className={styles.articleHeader}>
                        {article.sourceName && article.sourceName !== 'Unknown Source' && (
                          <span className={styles.articleSource}>{article.sourceName}</span>
                        )}
                        <div className={styles.articleMeta}>
                          <span className={styles.articleDate}>
                            {new Date(article.publishedAt).toLocaleDateString()}
                          </span>
                          <span className={`${styles.sentimentBadge} ${styles[article.sentimentLabel || 'neutral']}`}>
                            {article.sentimentLabel || 'neutral'} ({article.sentimentScore || 0})
                          </span>
                        </div>
                      </div>
                      <h4 className={styles.articleTitle}>{article.title}</h4>
                      <p className={styles.articleDescription}>{article.description}</p>
                      <div className={styles.articleFooter}>
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.readMoreButton}
                        >
                          <ExternalLink size={12} />
                          Read More
                        </a>
                        <span className={styles.sentimentScore}>
                          Score: {article.sentimentScore || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!comparisonResult && (
        <div className={styles.emptyState}>
          <BarChart3 className={styles.emptyIcon} />
          <h3>No Comparison Yet</h3>
          <p>Select brand and competitor keywords above to perform sentiment analysis comparison</p>
        </div>
      )}
    </div>
  );
}
