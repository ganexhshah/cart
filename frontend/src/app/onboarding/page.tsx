"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Store, Plus } from "lucide-react";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Main Content */}
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <Store className="w-8 h-8 text-slate-400" />
              </div>
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                No Shops Found
              </CardTitle>
              <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                You don't have any shops yet. Create your first restaurant to get started managing your restaurant.
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
        </div>
      </div>
    </div>
  );
}