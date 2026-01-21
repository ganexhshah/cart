"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { restaurantApi } from "@/lib/restaurants";
import { AlertCircle, Loader2 } from "lucide-react";

export default function MenuPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const redirectToNewFormat = async () => {
      try {
        const tableId = searchParams.get('table');
        const restaurantId = searchParams.get('restaurant');

        if (!tableId || !restaurantId) {
          setError('Missing table or restaurant information');
          setIsLoading(false);
          return;
        }

        // Get restaurant details to get the slug
        const restaurantResponse = await restaurantApi.getById(restaurantId);
        if (!restaurantResponse.success) {
          setError('Restaurant not found');
          setIsLoading(false);
          return;
        }

        const restaurant = restaurantResponse.data;
        
        // Redirect to new URL format
        const newUrl = `/menu/${restaurant.slug}/${tableId}`;
        router.replace(newUrl);

      } catch (error) {
        console.error('Error redirecting:', error);
        setError('Failed to load menu');
        setIsLoading(false);
      }
    };

    redirectToNewFormat();
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Menu...</h2>
            <p className="text-gray-600">Please wait while we prepare your dining experience</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}