"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { WaiterLayout } from "@/components/waiter/layout";
import { 
  Lock,
  User,
  Mail,
  Phone,
  Shield,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface WaiterUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  avatarUrl?: string;
  staffId: string;
  staffNumber: string;
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  slug: string;
}

export default function WaiterSettings() {
  const [user, setUser] = useState<WaiterUser | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("waiter_token");
    const userData = localStorage.getItem("waiter_user");
    const restaurantData = localStorage.getItem("waiter_restaurant");

    if (!token || !userData || !restaurantData) {
      router.push("/waiter/login");
      return;
    }

    try {
      setUser(JSON.parse(userData));
      setRestaurant(JSON.parse(restaurantData));
    } catch (error) {
      console.error("Error parsing stored data:", error);
      router.push("/waiter/login");
      return;
    }

    setLoading(false);
  }, [router]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
      
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    
    return errors;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    const newPasswordErrors = validatePassword(passwordForm.newPassword);
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newPasswordErrors.push("New password and confirm password do not match");
    }
    
    if (newPasswordErrors.length > 0) {
      setPasswordErrors(newPasswordErrors);
      return;
    }
    
    setPasswordErrors([]);
    setPasswordLoading(true);

    try {
      const token = localStorage.getItem("waiter_token");
      const response = await fetch(`/api/staff/${user?.staffId}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      toast.success("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <WaiterLayout title="Settings">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </WaiterLayout>
    );
  }

  if (!user || !restaurant) {
    return null;
  }

  return (
    <WaiterLayout title="Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your basic profile information (read-only)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={user.fullName} disabled />
              </div>
              
              <div className="space-y-2">
                <Label>Staff Number</Label>
                <Input value={user.staffNumber} disabled />
              </div>
              
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input value={user.email} disabled />
              </div>
              
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={user.phone} disabled />
              </div>
              
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} disabled />
              </div>
              
              <div className="space-y-2">
                <Label>Restaurant</Label>
                <Input value={restaurant.name} disabled />
              </div>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                To update your profile information, please contact your manager.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {passwordErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {passwordErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={passwordLoading}
                  className="w-full sm:w-auto"
                >
                  {passwordLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Use a strong password with at least 6 characters</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Include uppercase letters, lowercase letters, and numbers</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Never share your login credentials with others</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Log out when using shared devices</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </WaiterLayout>
  );
}