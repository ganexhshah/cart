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
import { 
  Star, 
  Search, 
  Filter,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Reply,
  MoreHorizontal,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

export default function ReviewsPage() {
  // Mock reviews data
  const reviews = [
    {
      id: 1,
      customer: {
        name: "John Doe",
        avatar: "/api/placeholder/40/40",
        verified: true
      },
      restaurant: "Pizza Palace",
      rating: 5,
      title: "Amazing pizza and great service!",
      content: "The margherita pizza was absolutely delicious. Fresh ingredients, perfect crust, and delivered hot. Will definitely order again!",
      date: "2024-01-10",
      helpful: 12,
      status: "published",
      response: null,
      orderValue: 45.99
    },
    {
      id: 2,
      customer: {
        name: "Jane Smith",
        avatar: "/api/placeholder/40/40",
        verified: true
      },
      restaurant: "Burger Barn",
      rating: 4,
      title: "Good food, slow delivery",
      content: "The burger was tasty and well-prepared, but the delivery took longer than expected. Food was still warm though.",
      date: "2024-01-09",
      helpful: 8,
      status: "published",
      response: {
        content: "Thank you for your feedback! We're working on improving our delivery times. Glad you enjoyed the burger!",
        date: "2024-01-09",
        author: "Restaurant Manager"
      },
      orderValue: 32.50
    },
    {
      id: 3,
      customer: {
        name: "Mike Johnson",
        avatar: "/api/placeholder/40/40",
        verified: false
      },
      restaurant: "Sushi Spot",
      rating: 2,
      title: "Disappointing experience",
      content: "The sushi wasn't fresh and the rice was too dry. Expected much better quality for the price.",
      date: "2024-01-08",
      helpful: 3,
      status: "pending",
      response: null,
      orderValue: 78.25
    },
    {
      id: 4,
      customer: {
        name: "Sarah Wilson",
        avatar: "/api/placeholder/40/40",
        verified: true
      },
      restaurant: "Pizza Palace",
      rating: 5,
      title: "Perfect dinner!",
      content: "Ordered for a family dinner and everyone loved it. The pasta was creamy and the pizza was crispy. Excellent service!",
      date: "2024-01-07",
      helpful: 15,
      status: "published",
      response: {
        content: "We're so happy to hear your family enjoyed the meal! Thank you for choosing us for your special dinner.",
        date: "2024-01-07",
        author: "Restaurant Manager"
      },
      orderValue: 89.75
    }
  ];

  const reviewStats = {
    totalReviews: reviews.length,
    averageRating: reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length,
    pendingReviews: reviews.filter(r => r.status === "pending").length,
    responseRate: (reviews.filter(r => r.response).length / reviews.length) * 100
  };

  const ratingDistribution = [
    { stars: 5, count: 45, percentage: 60 },
    { stars: 4, count: 18, percentage: 24 },
    { stars: 3, count: 8, percentage: 11 },
    { stars: 2, count: 3, percentage: 4 },
    { stars: 1, count: 1, percentage: 1 }
  ];

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
            <div className="text-2xl font-bold">{reviewStats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              +12 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewStats.averageRating.toFixed(1)}</div>
            <div className="flex items-center gap-1">
              {renderStars(Math.round(reviewStats.averageRating))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewStats.pendingReviews}</div>
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
            <div className="text-2xl font-bold">{reviewStats.responseRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="reviews" className="space-y-4 lg:space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reviews">All Reviews</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="pending">Pending ({reviewStats.pendingReviews})</TabsTrigger>
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
                          <AvatarImage src={review.customer.avatar} alt={review.customer.name} />
                          <AvatarFallback>{review.customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.customer.name}</span>
                            {review.customer.verified && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{review.restaurant}</span>
                            <span>•</span>
                            <span>{review.date}</span>
                            <span>•</span>
                            <span>₹{review.orderValue}</span>
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
                            <DropdownMenuItem>
                              <Reply className="mr-2 h-4 w-4" />
                              Reply
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <AlertCircle className="mr-2 h-4 w-4" />
                              Flag Review
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
                          Helpful ({review.helpful})
                        </button>
                      </div>
                      {!review.response && (
                        <Button variant="outline" size="sm">
                          <Reply className="w-4 h-4 mr-2" />
                          Reply
                        </Button>
                      )}
                    </div>

                    {/* Restaurant Response */}
                    {review.response && (
                      <div className="bg-blue-50 rounded-lg p-4 ml-8">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <Reply className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm font-medium">{review.response.author}</span>
                          <span className="text-xs text-muted-foreground">{review.response.date}</span>
                        </div>
                        <p className="text-sm">{review.response.content}</p>
                      </div>
                    )}
                  </div>
                ))}
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
                    <div key={rating.stars} className="flex items-center gap-4">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm">{rating.stars}</span>
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
                {reviews.filter(review => review.status === "pending").map((review) => (
                  <div key={review.id} className="border rounded-lg p-6 space-y-4">
                    {/* Review Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.customer.avatar} alt={review.customer.name} />
                          <AvatarFallback>{review.customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.customer.name}</span>
                            {review.customer.verified && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{review.restaurant}</span>
                            <span>•</span>
                            <span>{review.date}</span>
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
                        className="min-h-[100px]"
                      />
                      <div className="flex gap-2">
                        <Button size="sm">
                          <Reply className="w-4 h-4 mr-2" />
                          Send Response
                        </Button>
                        <Button variant="outline" size="sm">
                          Save Draft
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}