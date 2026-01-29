"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardLayout } from "@/components/dashboard/layout";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Settings as SettingsIcon,
  Palette,
  Bell,
  Globe,
  Shield,
  Database,
  Zap,
  Save,
  RotateCcw,
  Loader2,
  Check,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";

export default function SettingsPage() {
  const { user } = useAuth();
  const {
    settings,
    hasChanges,
    isLoading,
    isSaving,
    error,
    saveStatus,
    updateSetting,
    saveSettings,
    resetSettings,
    resetAllSettings
  } = useSettings();

  const handleExportData = () => {
    const dataToExport = {
      user: user ? {
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt
      } : null,
      settings,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear the application cache? This will refresh the page.')) {
      // Clear localStorage except for auth tokens
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      const userData = localStorage.getItem('user');
      
      localStorage.clear();
      
      if (token) localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      if (userData) localStorage.setItem('user', userData);
      
      // Reload the page
      window.location.reload();
    }
  };

  const handleResetAllSettings = async () => {
    if (confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.')) {
      await resetAllSettings();
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Settings">
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <SettingsIcon className="h-8 w-8" />
              Settings
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your account preferences and application settings.
            </p>
          </div>
          {hasChanges && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetSettings} disabled={isSaving}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={saveSettings} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {saveStatus === 'success' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
            <Check className="h-4 w-4" />
            <span className="text-sm">Settings saved successfully!</span>
          </div>
        )}
        
        {saveStatus === 'error' && !error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Failed to save settings. Please try again.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize how your dashboard looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred color scheme
                    </p>
                  </div>
                  <ThemeToggle />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Use smaller spacing and condensed layouts
                    </p>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => updateSetting("compactMode", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Tips</Label>
                    <p className="text-sm text-muted-foreground">
                      Display helpful tips and onboarding hints
                    </p>
                  </div>
                  <Switch
                    checked={settings.showTips}
                    onCheckedChange={(checked) => updateSetting("showTips", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Localization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Localization
                </CardTitle>
                <CardDescription>
                  Set your language, timezone, and regional preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select 
                      value={settings.language} 
                      onValueChange={(value) => updateSetting("language", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="it">Italiano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select 
                      value={settings.timezone} 
                      onValueChange={(value) => updateSetting("timezone", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (UTC-5)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (UTC-6)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (UTC-7)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (UTC-8)</SelectItem>
                        <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (UTC+1)</SelectItem>
                        <SelectItem value="Europe/Berlin">Berlin (UTC+1)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (UTC+9)</SelectItem>
                        <SelectItem value="Asia/Shanghai">Shanghai (UTC+8)</SelectItem>
                        <SelectItem value="Asia/Kolkata">India (UTC+5:30)</SelectItem>
                        <SelectItem value="Australia/Sydney">Sydney (UTC+11)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select 
                      value={settings.dateFormat} 
                      onValueChange={(value) => updateSetting("dateFormat", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select 
                      value={settings.currency} 
                      onValueChange={(value) => updateSetting("currency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
                        <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                        <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                        <SelectItem value="CAD">CAD (C$) - Canadian Dollar</SelectItem>
                        <SelectItem value="AUD">AUD (A$) - Australian Dollar</SelectItem>
                        <SelectItem value="JPY">JPY (¥) - Japanese Yen</SelectItem>
                        <SelectItem value="CNY">CNY (¥) - Chinese Yuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Control how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about system updates and maintenance
                    </p>
                  </div>
                  <Switch
                    checked={settings.systemNotifications}
                    onCheckedChange={(checked) => updateSetting("systemNotifications", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional emails and product updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.marketingEmails}
                    onCheckedChange={(checked) => updateSetting("marketingEmails", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Data
                </CardTitle>
                <CardDescription>
                  Manage your privacy settings and data preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Analytics Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Help us improve by sharing anonymous usage data
                    </p>
                  </div>
                  <Switch
                    checked={settings.analyticsTracking}
                    onCheckedChange={(checked) => updateSetting("analyticsTracking", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-save</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save your work as you make changes
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => updateSetting("autoSave", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleExportData}
                  disabled={isSaving}
                >
                  <Database className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleClearCache}
                  disabled={isSaving}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Clear Cache
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleResetAllSettings}
                  disabled={isSaving}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset All Settings
                </Button>
              </CardContent>
            </Card>

            {/* System Info */}
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span>2.1.0</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>Jan 26, 2026</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Storage Used</span>
                  <span>2.3 GB</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API Status</span>
                  <span className="text-green-600">Online</span>
                </div>
                {user && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">User Role</span>
                      <span className="capitalize">{user.role}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  If you need assistance with any settings, our support team is here to help.
                </p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}