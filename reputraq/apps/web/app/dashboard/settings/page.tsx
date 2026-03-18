'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { setUser } from '@/lib/store/slices/userSlice';
import {
  applyThemePreference,
  getDisplaySettings,
  setDisplaySettings as persistDisplaySettings,
} from '@/lib/displaySettings';
import { 
  Settings, 
  Mail, 
  Clock, 
  Monitor, 
  Shield, 
  Save,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import CronJobManager from '@/components/CronJobManager';
import styles from './page.module.scss';

interface DisplaySettings {
  theme: 'light' | 'dark' | 'auto';
  timeFormat: '12h' | '24h';
}

interface PrivacySettings {
  dataSharing: boolean;
  analytics: boolean;
  marketingEmails: boolean;
}

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'data' | 'display' | 'privacy'>('data');

  // Display settings
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    theme: 'light',
    timeFormat: '12h',
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    dataSharing: false,
    analytics: true,
    marketingEmails: false,
  });

  useEffect(() => {
    console.log('Settings page loaded, fetching user data');
    // Load user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      dispatch(setUser(parsedUser));
    }
    
    // Load settings from localStorage
    loadSettings();
    setPageLoading(false);
  }, [dispatch]);

  const loadSettings = () => {
    console.log('Loading settings from localStorage');
    const savedPrivacy = localStorage.getItem('privacySettings');

    const savedDisplay = getDisplaySettings();
    setDisplaySettings(savedDisplay);
    applyThemePreference(savedDisplay.theme);
    if (savedPrivacy) {
      setPrivacySettings(JSON.parse(savedPrivacy));
    }
  };


  const handleDisplayChange = (key: keyof DisplaySettings, value: any) => {
    setDisplaySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePrivacyChange = (key: keyof PrivacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const saveDisplaySettings = async () => {
    setLoading(true);
    setMessage(null);
    console.log('Saving display settings:', displaySettings);

    try {
      persistDisplaySettings(displaySettings);
      applyThemePreference(displaySettings.theme);
      
      setMessage({ type: 'success', text: 'Display settings saved successfully!' });
    } catch (error) {
      console.error('Error saving display settings:', error);
      setMessage({ type: 'error', text: 'Failed to save display settings' });
    } finally {
      setLoading(false);
    }
  };

  // Apply theme immediately when changed (so Display tab is actually functional).
  useEffect(() => {
    applyThemePreference(displaySettings.theme);
  }, [displaySettings.theme]);

  const savePrivacySettings = async () => {
    setLoading(true);
    setMessage(null);
    console.log('Saving privacy settings:', privacySettings);

    try {
      localStorage.setItem('privacySettings', JSON.stringify(privacySettings));
      
      setMessage({ type: 'success', text: 'Privacy settings saved successfully!' });
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      setMessage({ type: 'error', text: 'Failed to save privacy settings' });
    } finally {
      setLoading(false);
    }
  };


  if (pageLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={32} />
        <h2>Access Denied</h2>
        <p>Please sign in to access settings.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <Settings size={32} className={styles.titleIcon} />
            <h1 className={styles.title}>Settings</h1>
          </div>
          <p className={styles.subtitle}>Manage your application preferences and configurations</p>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'data' ? styles.active : ''}`}
          onClick={() => setActiveTab('data')}
        >
          <Clock size={18} />
          <span>Data Collection</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'display' ? styles.active : ''}`}
          onClick={() => setActiveTab('display')}
        >
          <Monitor size={18} />
          <span>Display</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'privacy' ? styles.active : ''}`}
          onClick={() => setActiveTab('privacy')}
        >
          <Shield size={18} />
          <span>Privacy</span>
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Data Collection Tab */}
        {activeTab === 'data' && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <Clock size={20} />
                <h2>Data Collection Settings</h2>
              </div>
            </div>
            <div className={styles.cardBody}>
              {user?.id && <CronJobManager userId={user.id} />}
            </div>
          </div>
        )}

        {/* Display Tab */}
        {activeTab === 'display' && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <Monitor size={20} />
                <h2>Display Preferences</h2>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Monitor size={16} />
                    Theme
                  </label>
                  <select
                    value={displaySettings.theme}
                    onChange={(e) => handleDisplayChange('theme', e.target.value)}
                    className={styles.select}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Clock size={16} />
                    Time Format
                  </label>
                  <select
                    value={displaySettings.timeFormat}
                    onChange={(e) => handleDisplayChange('timeFormat', e.target.value)}
                    className={styles.select}
                  >
                    <option value="12h">12 Hour</option>
                    <option value="24h">24 Hour</option>
                  </select>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  onClick={saveDisplaySettings}
                  disabled={loading}
                  className={styles.saveButton}
                >
                  <Save size={16} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <Shield size={20} />
                <h2>Privacy Settings</h2>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <label className={styles.settingLabel}>
                    <Shield size={16} />
                    Data Sharing
                  </label>
                  <p className={styles.settingDescription}>
                    Allow sharing of anonymized data for product improvement
                  </p>
                </div>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={privacySettings.dataSharing}
                    onChange={() => handlePrivacyChange('dataSharing')}
                  />
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>

              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <label className={styles.settingLabel}>
                    <Shield size={16} />
                    Analytics
                  </label>
                  <p className={styles.settingDescription}>
                    Help us improve by sharing usage analytics
                  </p>
                </div>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={privacySettings.analytics}
                    onChange={() => handlePrivacyChange('analytics')}
                  />
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>

              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <label className={styles.settingLabel}>
                    <Mail size={16} />
                    Marketing Emails
                  </label>
                  <p className={styles.settingDescription}>
                    Receive emails about new features and promotions
                  </p>
                </div>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={privacySettings.marketingEmails}
                    onChange={() => handlePrivacyChange('marketingEmails')}
                  />
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>

              <div className={styles.cardActions}>
                <button
                  onClick={savePrivacySettings}
                  disabled={loading}
                  className={styles.saveButton}
                >
                  <Save size={16} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

