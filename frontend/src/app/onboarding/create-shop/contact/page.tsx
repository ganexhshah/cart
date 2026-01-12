"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function ContactInfoPage() {
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-12 pt-8">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  ✓
                </div>
                <span className="text-slate-500">Shop Information</span>
              </div>
              <div className="w-16 h-0.5 bg-green-500"></div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">Contact Information</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Fill in the details below to create your shop
            </h1>
          </div>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 space-y-8">
              {/* Contact Number */}
              <div className="space-y-3">
                <Label htmlFor="contactNumber" className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Contact Number *
                </Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  placeholder="Enter contact number"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="h-12 text-base"
                />
                <p className="text-sm text-slate-500">
                  This contact number will be publicly visible to customers
                </p>
              </div>

              {/* Email */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base"
                />
                <p className="text-sm text-slate-500">
                  This email will be publicly visible to customers
                </p>
              </div>

              {/* Address */}
              <div className="space-y-3">
                <Label htmlFor="address" className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Restaurant Address *
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter restaurant address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-12 text-base"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <Link href="/onboarding/create-shop">
                  <Button variant="outline" className="h-12 px-6 flex items-center gap-2 font-semibold">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                </Link>
                
                <Button 
                  className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 font-semibold"
                  disabled={!contactNumber.trim() || !email.trim() || !address.trim()}
                >
                  Create Shop
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Terms */}
          <div className="text-center text-sm text-slate-500 leading-relaxed mt-8 max-w-md mx-auto">
            By creating a shop, you agree to our{" "}
            <Link 
              href="/privacy-policy" 
              className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 underline underline-offset-2 font-medium"
            >
              Privacy Policy
            </Link>
            ,{" "}
            <Link 
              href="/terms-conditions" 
              className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 underline underline-offset-2 font-medium"
            >
              Terms & conditions
            </Link>
            {" "}and{" "}
            <Link 
              href="/refund-policy" 
              className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 underline underline-offset-2 font-medium"
            >
              Refund Policy
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
}