"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Store, Plus, User } from "lucide-react";
import { authApi } from "@/lib/auth";

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'profile' | 'restaurant'>('profile');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Profile fields
  const [email, setEmail] = useState("");
  const [otpCode, setOTPCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        // Check if user is already authenticated
        if (authApi.isAuthenticated()) {
          const storedUser = authApi.getStoredUser();
          setUser(storedUser);
          setStep('restaurant');
        } else {
          // Check if coming from login with OTP parameters
          const emailParam = searchParams.get('email');
          const otpParam = searchParams.get('otp');
          
          if (emailParam && otpParam) {
            setEmail(emailParam);
            setOTPCode(otpParam);
            setStep('profile');
          } else {
            // No user and no OTP params - redirect to login
            router.push('/auth/login');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, [searchParams, router]);

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setProfileLoading(true);

    try {
      const response = await authApi.verifyOTP({
        email,
        otpCode,
        userData: {
          fullName,
          phone,
          role: 'owner',
        },
      });

      setUser(response.data.user);
      setStep('restaurant');
    } catch (err: any) {
      setError(err.message || "Profile creation failed");
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-slate-100 mx-auto"></div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Main Content */}
        <div className="flex items-center justify-center min-h-screen">
          {step === 'profile' ? (
            <Card className="w-full max-w-md">
              <CardHeader className="text-center space-y-2">
                <div className="mx-auto mb-4 w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Complete Your Profile
                </CardTitle>
                <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                  Please provide your details to create your restaurant owner account
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded text-sm mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleCompleteProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email</Label>
                    <Input
                      type="email"
                      value={email}
                      disabled
                      className="bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900"
                    disabled={profileLoading}
                  >
                    {profileLoading ? "Creating Profile..." : "Complete Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full max-w-md text-center">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <Store className="w-8 h-8 text-slate-400" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Welcome, {user?.fullName || 'Restaurant Owner'}!
                </CardTitle>
                <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                  You don't have any restaurants yet. Create your first restaurant to get started.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Link href="/onboarding/create-shop">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Your First Restaurant
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}