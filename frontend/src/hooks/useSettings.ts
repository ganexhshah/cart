// Settings Management Hook

'use client';

import { useState, useEffect, useCallback } from 'react';
import { userApi, UserSettings } from '@/lib/user';

export interface UseSettingsReturn {
  settings: UserSettings;
  originalSettings: UserSettings;
  hasChanges: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  saveStatus: 'idle' | 'success' | 'error';
  updateSetting: (key: keyof UserSettings, value: any) => void;
  saveSettings: () => Promise<void>;
  resetSettings: () => void;
  resetAllSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
}

const defaultSettings: UserSettings = {
  language: 'en',
  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY',
  currency: 'INR',
  autoSave: true,
  compactMode: false,
  showTips: true,
  analyticsTracking: true,
  marketingEmails: false,
  systemNotifications: true,
};

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<UserSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Check for changes whenever settings change
  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(originalSettings));
  }, [settings, originalSettings]);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await userApi.getSettings();
      if (response.success && response.data) {
        const loadedSettings: UserSettings = {
          language: response.data.language || defaultSettings.language,
          timezone: response.data.timezone || defaultSettings.timezone,
          dateFormat: response.data.dateFormat || defaultSettings.dateFormat,
          currency: response.data.currency || defaultSettings.currency,
          autoSave: response.data.autoSave !== undefined ? response.data.autoSave : defaultSettings.autoSave,
          compactMode: response.data.compactMode !== undefined ? response.data.compactMode : defaultSettings.compactMode,
          showTips: response.data.showTips !== undefined ? response.data.showTips : defaultSettings.showTips,
          analyticsTracking: response.data.analyticsTracking !== undefined ? response.data.analyticsTracking : defaultSettings.analyticsTracking,
          marketingEmails: response.data.marketingEmails !== undefined ? response.data.marketingEmails : defaultSettings.marketingEmails,
          systemNotifications: response.data.systemNotifications !== undefined ? response.data.systemNotifications : defaultSettings.systemNotifications,
        };
        
        setSettings(loadedSettings);
        setOriginalSettings(loadedSettings);
      }
    } catch (err: any) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSetting = useCallback((key: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setError(null);
    setSaveStatus('idle');
  }, []);

  const saveSettings = useCallback(async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    setError(null);

    try {
      const response = await userApi.updateSettings(settings);
      if (response.success) {
        setOriginalSettings({ ...settings });
        setHasChanges(false);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error(response.message || 'Failed to save settings');
      }
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setError(err.message || 'Failed to save settings. Please try again.');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const resetSettings = useCallback(() => {
    setSettings({ ...originalSettings });
    setHasChanges(false);
    setSaveStatus('idle');
    setError(null);
  }, [originalSettings]);

  const resetAllSettings = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      const response = await userApi.updateSettings(defaultSettings);
      if (response.success) {
        setSettings(defaultSettings);
        setOriginalSettings(defaultSettings);
        setHasChanges(false);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error(response.message || 'Failed to reset settings');
      }
    } catch (err: any) {
      console.error('Failed to reset settings:', err);
      setError(err.message || 'Failed to reset settings. Please try again.');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    settings,
    originalSettings,
    hasChanges,
    isLoading,
    isSaving,
    error,
    saveStatus,
    updateSetting,
    saveSettings,
    resetSettings,
    resetAllSettings,
    loadSettings,
  };
}