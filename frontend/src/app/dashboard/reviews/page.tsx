"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useMyRestaurantReviews, useMyRestaurantReviewStats } from "@/hooks/useReviews";
import { useState } from "react";
import { 
  Star, 
  Search, 
  Filter,
  MessageSquare,
  ThumbsUp,
  Reply,
  MoreHorizontal,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2
} from "lucide-react";

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [responseContent, setResponseContent] = useState<{ [key: string]: string }>({});
  
  // Fetch reviews and stats using hooks
  const { stats, loading: statsLoading, error: statsError } = useMyRestaurantReviewStats();
  const { 
    reviews, 
    loading: reviewsLoading, 
    error: reviewsError, 
    addResponse, 
    updateReviewStatus,
    refetch 
  } = useMyRestaurantReviews({
    search: searchTerm || undefined,
    status: statusFilter || undefined
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "flagged": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const handleAddResponse = async (reviewId: string) => {
    const content = responseContent[reviewId];
    if (!content || content.trim().length === 0) {
      alert("Please enter a response");
      return;
    }

    try {
      await addResponse(reviewId, { content: content.trim() });
      setResponseContent({ ...responseContent, [reviewId]: "" });
      alert("Response added successfully!");
    } catch (error) {
      alert("Failed to add response: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleStatusUpdate = async (reviewId: string, newStatus: string) => {
    try {
      await updateReviewStatus(reviewId, newStatus);
      alert("Review status updated successfully!");
    } catch (error) {
      alert("Failed to update status: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  // Loading state
  if (statsLoading || reviewsLoading) {
    return (
      <DashboardLayout title="Reviews & Ratings">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading reviews...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (statsError || reviewsError) {
    return (
      <DashboardLayout title="Reviews & Ratings">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">{statsError || reviewsError}</p>
              <Button onClick={() => { refetch(); }} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const pendingReviews = reviews.filter(r => r.status === "pending");
  const ratingDistribution = stats?.rating_distribution || [];

  return (
    <DashboardLayout title="Reviews & Ratings">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_reviews || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time reviews
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(stats?.average_rating || 0).toFixed(1)}</div>
            <div className="flex items-center gap-1">
              {renderStars(Math.round(Number(stats?.average_rating || 0)))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending_reviews || 0}</div>
            <p className="text-xs text-muted-foreground">
              Need response
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Reply className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(stats?.response_rate || 0).toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              Reviews with responses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="reviews" className="space-y-4 lg:space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reviews">All Reviews</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingReviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Customer Reviews</CardTitle>
                  <CardDescription>
                    Manage and respond to customer feedback
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search reviews..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-6 space-y-4">
                    {/* Review Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.customer_avatar} alt={review.customer_name} />
                          <AvatarFallback>{review.customer_name?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.customer_name || 'Anonymous'}</span>
                            {review.customer_verified && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{review.restaurant_name}</span>
                            <span>•</span>
                            <span>{new Date(review.created_at).toLocaleDateString()}</span>
                            {review.order_value && (
                              <>
                                <span>•</span>
                                <span>₹{Number(review.order_value).toFixed(2)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(review.status)}>
                          {review.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusUpdate(review.id, 'published')}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Publish
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(review.id, 'flagged')}>
                              <AlertCircle className="mr-2 h-4 w-4" />
                              Flag Review
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(review.id, 'hidden')}>
                              <AlertCircle className="mr-2 h-4 w-4" />
                              Hide Review
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Rating and Title */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {review.rating}/5
                        </span>
                      </div>
                      <h3 className="font-medium">{review.title}</h3>
                    </div>

                    {/* Review Content */}
                    <p className="text-muted-foreground">{review.content}</p>

                    {/* Review Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                          <ThumbsUp className="w-4 h-4" />
                          Helpful ({review.helpful_count || 0})
                        </button>
                      </div>
                      {!review.responses?.length && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const textarea = document.getElementById(`response-${review.id}`) as HTMLTextAreaElement;
                            if (textarea) {
                              textarea.focus();
                              textarea.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                        >
                          <Reply className="w-4 h-4 mr-2" />
                          Reply
                        </Button>
                      )}
                    </div>

                    {/* Restaurant Response */}
                    {review.responses && review.responses.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4 ml-8">
                        {review.responses.map((response) => (
                          <div key={response.id}>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                <Reply className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-sm font-medium">{response.author_name || 'Restaurant'}</span>
                              <span className="text-xs text-muted-foreground">{new Date(response.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm">{response.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Response Form */}
                    {!review.responses?.length && (
                      <div className="space-y-3 pt-4 border-t">
                        <label className="text-sm font-medium">Your Response</label>
                        <Textarea 
                          id={`response-${review.id}`}
                          placeholder="Write a professional response to this review..."
                          className="min-h-25"
                          value={responseContent[review.id] || ""}
                          onChange={(e) => setResponseContent({ ...responseContent, [review.id]: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => handleAddResponse(review.id)}
                            disabled={!responseContent[review.id]?.trim()}
                          >
                            <Reply className="w-4 h-4 mr-2" />
                            Send Response
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setResponseContent({ ...responseContent, [review.id]: "" })}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {reviews.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews found</h3>
                    <p className="text-gray-600">
                      {searchTerm ? "Try adjusting your search terms." : "You don't have any reviews yet."}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rating Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Rating Distribution
                </CardTitle>
                <CardDescription>How customers rate your restaurants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ratingDistribution.map((rating) => (
                    <div key={rating.rating} className="flex items-center gap-4">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm">{rating.rating}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${rating.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground w-16 text-right">
                        {rating.count} ({rating.percentage}%)
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Review Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Review Insights</CardTitle>
                <CardDescription>Key metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium">Positive Sentiment</div>
                      <div className="text-sm text-muted-foreground">84% of reviews</div>
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium">Response Time</div>
                      <div className="text-sm text-muted-foreground">Avg 2.3 hours</div>
                    </div>
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <div className="font-medium">Most Mentioned</div>
                      <div className="text-sm text-muted-foreground">"Fresh ingredients"</div>
                    </div>
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Reviews</CardTitle>
              <CardDescription>
                Reviews that need your attention or response
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {pendingReviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-6 space-y-4">
                    {/* Review Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.customer_avatar} alt={review.customer_name} />
                          <AvatarFallback>{review.customer_name?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.customer_name || 'Anonymous'}</span>
                            {review.customer_verified && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{review.restaurant_name}</span>
                            <span>•</span>
                            <span>{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(review.status)}>
                        {review.status}
                      </Badge>
                    </div>

                    {/* Rating and Content */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {review.rating}/5
                        </span>
                      </div>
                      <h3 className="font-medium mb-2">{review.title}</h3>
                      <p className="text-muted-foreground">{review.content}</p>
                    </div>

                    {/* Response Form */}
                    <div className="space-y-3 pt-4 border-t">
                      <label className="text-sm font-medium">Your Response</label>
                      <Textarea 
                        placeholder="Write a professional response to this review..."
                        className="min-h-25"
                        value={responseContent[review.id] || ""}
                        onChange={(e) => setResponseContent({ ...responseContent, [review.id]: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleAddResponse(review.id)}
                          disabled={!responseContent[review.id]?.trim()}
                        >
                          <Reply className="w-4 h-4 mr-2" />
                          Send Response
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStatusUpdate(review.id, 'published')}
                        >
                          Publish Without Response
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {pendingReviews.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-600">You don't have any pending reviews at the moment.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}