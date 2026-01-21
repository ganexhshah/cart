"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ThemeToggle } from "@/components/theme-toggle";
import { DashboardLayout } from "@/components/dashboard/layout";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar,
  Bell,
  Shield,
  CreditCard,
  Camera,
  Save,
  Edit,
  X,
  Loader2,
  Check,
  AlertCircle,
  Monitor,
  Smartphone,
  Globe,
  Download,
  Crown,
  Zap,
  Palette
} from "lucide-react";
import { userApi } from "@/lib/user";
import { uploadApi } from "@/lib/upload";
import { authApi } from "@/lib/auth";
import { subscriptionApi, SubscriptionPlan, UserSubscription, BillingRecord } from "@/lib/subscription";

import { useState, useRef, useEffect } from "react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [showLoginHistoryDialog, setShowLoginHistoryDialog] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [showBillingHistoryDialog, setShowBillingHistoryDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isToggling2FA, setIsToggling2FA] = useState(false);
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("premium");
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [accountStats, setAccountStats] = useState({
    memberSince: '',
    totalRestaurants: 0,
    totalOrders: 0,
    accountStatus: 'active'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [originalData, setOriginalData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    bio: "",
    avatar: ""
  });

  const [profileData, setProfileData] = useState({ ...originalData });

  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailMarketing: false,
    pushNotifications: true,
    smsAlerts: true
  });

  const [originalNotifications, setOriginalNotifications] = useState({
    emailOrders: true,
    emailMarketing: false,
    pushNotifications: true,
    smsAlerts: true
  });

  // Load profile data on mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user profile
        const profileResponse = await userApi.getProfile();
        if (profileResponse.success && profileResponse.data) {
          const user = profileResponse.data;
          const nameParts = user.full_name.split(' ');
          const data = {
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: user.email,
            phone: user.phone || '',
            company: '',
            address: '',
            bio: '',
            avatar: user.avatar_url || ''
          };
          setOriginalData(data);
          setProfileData(data);
        }

        // Fetch notification preferences
        const prefsResponse = await userApi.getNotificationPreferences();
        if (prefsResponse.success && prefsResponse.data) {
          const prefs = {
            emailOrders: prefsResponse.data.emailOrders ?? true,
            emailMarketing: prefsResponse.data.emailMarketing ?? false,
            pushNotifications: prefsResponse.data.pushNotifications ?? true,
            smsAlerts: prefsResponse.data.smsAlerts ?? true
          };
          setNotifications(prefs);
          setOriginalNotifications(prefs);
        }

        // Fetch 2FA status
        const twoFAResponse = await userApi.get2FAStatus();
        if (twoFAResponse.success && twoFAResponse.data) {
          setTwoFactorEnabled(twoFAResponse.data.enabled);
        }

        // Fetch subscription data
        const plansResponse = await subscriptionApi.getPlans();
        if (plansResponse.success && plansResponse.data) {
          setSubscriptionPlans(plansResponse.data);
        }

        const subResponse = await subscriptionApi.getCurrentSubscription();
        if (subResponse.success && subResponse.data) {
          setUserSubscription(subResponse.data);
          setCurrentPlan(subResponse.data.plan_id);
        }

        // Fetch billing history
        const billingResponse = await subscriptionApi.getBillingHistory(10);
        if (billingResponse.success && billingResponse.data) {
          setBillingHistory(billingResponse.data);
        }

        // Fetch account stats
        const statsResponse = await userApi.getAccountStats();
        if (statsResponse.success && statsResponse.data) {
          setAccountStats(statsResponse.data);
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
        setSaveStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, []);

  // Password validation
  const validatePassword = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      newErrors.newPassword = "Password must contain uppercase, lowercase, and number";
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = async () => {
    if (!validatePassword()) return;

    setIsChangingPassword(true);
    try {
      await userApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      // Reset form and close dialog
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordErrors({});
      setShowPasswordDialog(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error: any) {
      console.error("Error changing password:", error);
      setPasswordErrors({ currentPassword: error.message || 'Failed to change password' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleToggle2FA = async () => {
    setIsToggling2FA(true);
    try {
      if (twoFactorEnabled) {
        // Disable 2FA
        await userApi.disable2FA();
        setTwoFactorEnabled(false);
        setShow2FADialog(false);
        setSaveStatus('success');
      } else {
        // Enable 2FA - get QR code
        const response = await userApi.enable2FA();
        if (response.success && response.data) {
          setTwoFactorSetup(response.data);
          // Keep dialog open to show QR code
        }
      }
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error("Error toggling 2FA:", error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsToggling2FA(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode) return;
    
    setIsToggling2FA(true);
    try {
      await userApi.verify2FASetup(verificationCode);
      setTwoFactorEnabled(true);
      setTwoFactorSetup(null);
      setVerificationCode("");
      setShow2FADialog(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error: any) {
      console.error("Error verifying 2FA:", error);
      alert(error.message || 'Invalid verification code');
    } finally {
      setIsToggling2FA(false);
    }
  };

  const loadLoginHistory = async () => {
    try {
      const response = await userApi.getLoginHistory(20);
      if (response.success && response.data) {
        setLoginHistory(response.data);
      }
    } catch (error) {
      console.error('Failed to load login history:', error);
    }
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubscriptionChange = async (planId: string) => {
    if (planId === currentPlan) return;
    
    setIsUpdatingSubscription(true);
    try {
      const response = await subscriptionApi.updateSubscription(planId);
      if (response.success) {
        setUserSubscription(response.data);
        setCurrentPlan(planId);
        setShowSubscriptionDialog(false);
        setSaveStatus('success');
        
        // Refresh billing history
        const billingResponse = await subscriptionApi.getBillingHistory(10);
        if (billingResponse.success && billingResponse.data) {
          setBillingHistory(billingResponse.data);
        }
      }
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error("Error updating subscription:", error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsUpdatingSubscription(false);
    }
  };

  const downloadInvoice = (invoiceId: string) => {
    // Simulate invoice download
    console.log("Downloading invoice:", invoiceId);
    // In a real app, this would trigger a PDF download
  };

  const getCurrentPlanDetails = () => {
    if (subscriptionPlans.length === 0) {
      return { name: 'Premium', price: 29, interval: 'month' };
    }
    return subscriptionPlans.find(plan => plan.plan_id === currentPlan) || subscriptionPlans[1];
  };

  // Validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!profileData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!profileData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!profileData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(profileData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      // Update profile
      await userApi.updateProfile({
        fullName: `${profileData.firstName} ${profileData.lastName}`.trim(),
        phone: profileData.phone
      });
      
      // Update notification preferences
      await userApi.updateNotificationPreferences(notifications);
      
      // Update original data to reflect saved state
      setOriginalData({ ...profileData });
      setOriginalNotifications({ ...notifications });
      
      // Update stored user data
      const storedUser = authApi.getStoredUser();
      if (storedUser) {
        storedUser.fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
        storedUser.phone = profileData.phone;
        storedUser.avatarUrl = profileData.avatar;
        localStorage.setItem('user', JSON.stringify(storedUser));
      }
      
      setIsEditing(false);
      setSaveStatus('success');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
      
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowConfirmDialog(true);
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setProfileData({ ...originalData });
    setNotifications({ ...originalNotifications });
    setIsEditing(false);
    setErrors({});
    setSaveStatus('idle');
    setShowConfirmDialog(false);
  };

  const confirmCancel = () => {
    resetForm();
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Upload avatar
        const uploadResponse = await uploadApi.avatar(file);
        const avatarUrl = uploadResponse.data.url;
        
        // Update avatar in backend
        await userApi.updateAvatar(avatarUrl);
        
        // Update local state
        setProfileData(prev => ({
          ...prev,
          avatar: avatarUrl
        }));
        setOriginalData(prev => ({
          ...prev,
          avatar: avatarUrl
        }));
        
        // Update stored user data
        const storedUser = authApi.getStoredUser();
        if (storedUser) {
          storedUser.avatarUrl = avatarUrl;
          localStorage.setItem('user', JSON.stringify(storedUser));
        }
        
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (error) {
        console.error('Failed to upload avatar:', error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }
  };

  const hasChanges = JSON.stringify(profileData) !== JSON.stringify(originalData) || 
                   JSON.stringify(notifications) !== JSON.stringify(originalNotifications);

  // Keyboard shortcut for saving
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (isEditing && hasChanges && !isSaving) {
          handleSave();
        }
      }
    };

    if (isEditing) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isEditing, hasChanges, isSaving]);

  return (
    <DashboardLayout title="Profile">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
                  <AvatarImage src={profileData.avatar} alt="Profile" />
                  <AvatarFallback className="text-lg">
                    {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={handleAvatarClick}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold">
                        {profileData.firstName} {profileData.lastName}
                      </h1>
                      {hasChanges && isEditing && (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          Unsaved
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{profileData.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">Restaurant Owner</Badge>
                      <Badge variant="outline">Premium Member</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isEditing && (
                      <Button 
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="w-full sm:w-auto"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                    <Button 
                      onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                      disabled={isSaving || (isEditing && !hasChanges)}
                      className="w-full sm:w-auto"
                      title={isEditing ? "Save changes (Ctrl+S)" : "Edit profile"}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : isEditing ? (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status Messages */}
            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
                <Check className="h-4 w-4" />
                <span className="text-sm">Profile updated successfully!</span>
              </div>
            )}
            
            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Failed to update profile. Please try again.</span>
              </div>
            )}
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      disabled={!isEditing}
                      className={errors.firstName ? "border-red-500" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      disabled={!isEditing}
                      className={errors.lastName ? "border-red-500" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={!isEditing}
                      className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      disabled={!isEditing}
                      className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="company"
                      value={profileData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications for Orders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates when you get new orders
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailOrders}
                    onCheckedChange={(checked) => handleNotificationChange("emailOrders", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional emails and updates
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailMarketing}
                    onCheckedChange={(checked) => handleNotificationChange("emailMarketing", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications on your device
                    </p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => handleNotificationChange("pushNotifications", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important alerts via SMS
                    </p>
                  </div>
                  <Switch
                    checked={notifications.smsAlerts}
                    onCheckedChange={(checked) => handleNotificationChange("smsAlerts", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Theme Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme Preferences
                </CardTitle>
                <CardDescription>
                  Customize the appearance of your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Theme Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose between light, dark, or system theme
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Account Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {accountStats.memberSince 
                        ? new Date(accountStats.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Restaurants</span>
                  <span className="text-sm font-medium">{accountStats.totalRestaurants}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Orders</span>
                  <span className="text-sm font-medium">{accountStats.totalOrders.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account Status</span>
                  <Badge variant="secondary">{accountStats.accountStatus.charAt(0).toUpperCase() + accountStats.accountStatus.slice(1)}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowPasswordDialog(true)}
                >
                  Change Password
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShow2FADialog(true)}
                >
                  Two-Factor Authentication
                  <Badge 
                    variant={twoFactorEnabled ? "default" : "secondary"} 
                    className="ml-auto"
                  >
                    {twoFactorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowLoginHistoryDialog(true)}
                >
                  Login History
                </Button>
              </CardContent>
            </Card>

            {/* Billing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm">
                  <p className="font-medium">{getCurrentPlanDetails().name} Plan</p>
                  <p className="text-muted-foreground">${getCurrentPlanDetails().price}/{getCurrentPlanDetails().interval}</p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowSubscriptionDialog(true)}
                >
                  Manage Subscription
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowBillingHistoryDialog(true)}
                >
                  Billing History
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard Changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to discard them? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
            >
              Keep Editing
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmCancel}
            >
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new secure password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordInputChange("currentPassword", e.target.value)}
                className={passwordErrors.currentPassword ? "border-red-500" : ""}
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-red-500">{passwordErrors.currentPassword}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordInputChange("newPassword", e.target.value)}
                className={passwordErrors.newPassword ? "border-red-500" : ""}
              />
              {passwordErrors.newPassword && (
                <p className="text-sm text-red-500">{passwordErrors.newPassword}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordInputChange("confirmPassword", e.target.value)}
                className={passwordErrors.confirmPassword ? "border-red-500" : ""}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-red-500">{passwordErrors.confirmPassword}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowPasswordDialog(false)}
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePasswordChange}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Two-Factor Authentication Dialog */}
      <Dialog open={show2FADialog} onOpenChange={(open) => {
        setShow2FADialog(open);
        if (!open) {
          setTwoFactorSetup(null);
          setVerificationCode("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              {twoFactorEnabled 
                ? "Two-factor authentication is currently enabled. You can disable it below."
                : twoFactorSetup
                ? "Scan the QR code with your authenticator app and enter the verification code."
                : "Add an extra layer of security to your account by enabling two-factor authentication."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {twoFactorSetup ? (
              <>
                <div className="flex justify-center p-4 bg-white border rounded-lg">
                  <img src={twoFactorSetup.qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                  />
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium mb-2">Backup Codes</p>
                  <p className="text-xs text-yellow-700 mb-2">Save these codes in a safe place. You can use them to access your account if you lose your device.</p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {twoFactorSetup.backupCodes.map((code: string, i: number) => (
                      <div key={i} className="bg-white p-1 rounded">{code}</div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Authenticator App</h4>
                    <p className="text-sm text-muted-foreground">
                      Use Google Authenticator, Authy, or similar apps
                    </p>
                  </div>
                  <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                    {twoFactorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                {!twoFactorEnabled && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      After enabling 2FA, you'll need to scan a QR code with your authenticator app 
                      and enter the verification code to complete setup.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShow2FADialog(false);
                setTwoFactorSetup(null);
                setVerificationCode("");
              }}
              disabled={isToggling2FA}
            >
              Cancel
            </Button>
            {twoFactorSetup ? (
              <Button 
                onClick={handleVerify2FA}
                disabled={isToggling2FA || verificationCode.length !== 6}
              >
                {isToggling2FA ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Enable"
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleToggle2FA}
                disabled={isToggling2FA}
                variant={twoFactorEnabled ? "destructive" : "default"}
              >
                {isToggling2FA ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {twoFactorEnabled ? "Disabling..." : "Setting up..."}
                  </>
                ) : (
                  twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login History Dialog */}
      <Dialog open={showLoginHistoryDialog} onOpenChange={(open) => {
        setShowLoginHistoryDialog(open);
        if (open) {
          loadLoginHistory();
        }
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Login History</DialogTitle>
            <DialogDescription>
              Recent login attempts and sessions for your account.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {loginHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device & Browser</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginHistory.map((login) => (
                    <TableRow key={login.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {login.device === 'mobile' ? (
                              <Smartphone className="h-4 w-4" />
                            ) : (
                              <Monitor className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{login.browser}</div>
                            <div className="text-sm text-muted-foreground">{login.ip_address}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          {login.location || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(login.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={login.status === "success" ? "default" : "destructive"}
                          className={login.status === "success" ? "bg-green-100 text-green-800" : ""}
                        >
                          {login.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No login history available
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowLoginHistoryDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Subscription Dialog */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
            <DialogDescription>
              Choose the plan that best fits your business needs.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => {
              const isPopular = plan.plan_id === 'premium';
              return (
              <div
                key={plan.plan_id}
                className={`relative p-6 border rounded-lg ${
                  plan.plan_id === currentPlan 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200"
                } ${isPopular ? "ring-2 ring-blue-500" : ""}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                {plan.plan_id === currentPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="default">Current Plan</Badge>
                  </div>
                )}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">₹{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.interval}</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.plan_id === currentPlan ? "outline" : "default"}
                  onClick={() => handleSubscriptionChange(plan.plan_id)}
                  disabled={isUpdatingSubscription || plan.plan_id === currentPlan}
                >
                  {isUpdatingSubscription ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : plan.plan_id === currentPlan ? (
                    "Current Plan"
                  ) : (
                    `Switch to ${plan.name}`
                  )}
                </Button>
              </div>
            )})}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowSubscriptionDialog(false)}
              disabled={isUpdatingSubscription}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Billing History Dialog */}
      <Dialog open={showBillingHistoryDialog} onOpenChange={setShowBillingHistoryDialog}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Billing History</DialogTitle>
            <DialogDescription>
              View and download your past invoices and payment history.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingHistory.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">
                      {new Date(bill.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>{bill.description}</TableCell>
                    <TableCell className="font-medium">
                      ₹{Number(bill.amount || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        {bill.payment_method || '•••• 4242'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={bill.status === "paid" ? "default" : "destructive"}
                        className={bill.status === "paid" ? "bg-green-100 text-green-800" : ""}
                      >
                        {bill.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {bill.status === "paid" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadInvoice(bill.invoice_number)}
                          className="h-8 px-2"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          {bill.invoice_number}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {billingHistory.length} transactions
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowBillingHistoryDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
      )}
    </DashboardLayout>
  );
}