"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CustomerLayout } from "@/components/customer/layout";
import { useState } from "react";
import { 
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Send,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function ReviewsPage() {
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      customerName: "John Doe",
      customerAvatar: "/api/placeholder/40/40",
      rating: 5,
      comment: "Amazing food and excellent service! The pizza was perfectly cooked and the staff was very friendly.",
      date: "2 days ago",
      orderItems: ["Margherita Pizza", "Caesar Salad"],
      helpful: 12,
      notHelpful: 1
    },
    {
      id: 2,
      customerName: "Sarah Smith",
      customerAvatar: "/api/placeholder/40/40",
      rating: 4,
      comment: "Great atmosphere and delicious burgers. The wait time was a bit long but worth it!",
      date: "1 week ago",
      orderItems: ["Classic Burger", "Veggie Burger"],
      helpful: 8,
      notHelpful: 0
    },
    {
      id: 3,
      customerName: "Mike Johnson",
      customerAvatar: "/api/placeholder/40/40",
      rating: 5,
      comment: "Best sushi in town! Fresh ingredients and beautiful presentation. Will definitely come back.",
      date: "2 weeks ago",
      orderItems: ["Salmon Roll", "Tuna Roll"],
      helpful: 15,
      notHelpful: 2
    },
    {
      id: 4,
      customerName: "Emily Davis",
      customerAvatar: "/api/placeholder/40/40",
      rating: 3,
      comment: "Food was okay, but the service could be improved. The salad was fresh though.",
      date: "3 weeks ago",
      orderItems: ["Caesar Salad"],
      helpful: 5,
      notHelpful: 3
    }
  ];

  const handleSubmitReview = () => {
    if (newReviewRating === 0) {
      alert("Please provide a rating!");
      return;
    }
    
    // Here you would submit the review to your backend
    alert(`Review submitted! Rating: ${newReviewRating} stars`);
    setNewReviewRating(0);
    setNewReviewComment("");
    setShowReviewForm(false);
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (star: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onStarClick?.(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star 
              className={`w-4 h-4 ${
                star <= rating 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300'
              }`} 
            />
          </button>
        ))}
      </div>
    );
  };

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(review => review.rating === rating).length,
    percentage: (reviews.filter(review => review.rating === rating).length / reviews.length) * 100
  }));

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/menu">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Customer Reviews</h1>
            <p className="text-gray-600">See what others are saying about our restaurant</p>
          </div>
        </div>

        {/* Overall Rating Summary */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Average Rating */}
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                  <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                  <div>
                    {renderStars(Math.round(averageRating))}
                    <p className="text-sm text-gray-600 mt-1">
                      Based on {reviews.length} reviews
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="bg-slate-900 hover:bg-slate-800 text-white"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Write a Review
                </Button>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm w-8">{rating} ★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Write Review Form */}
        {showReviewForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Write Your Review</CardTitle>
              <CardDescription>
                Share your experience with other customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-4 block">
                  How would you rate your experience?
                </Label>
                <div className="flex justify-center md:justify-start">
                  {renderStars(newReviewRating, true, setNewReviewRating)}
                </div>
                {newReviewRating > 0 && (
                  <p className="text-center md:text-left mt-2 text-sm text-gray-600">
                    {newReviewRating === 1 && "Poor"}
                    {newReviewRating === 2 && "Fair"}
                    {newReviewRating === 3 && "Good"}
                    {newReviewRating === 4 && "Very Good"}
                    {newReviewRating === 5 && "Excellent"}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="review-comment" className="text-base font-medium">
                  Your Review (Optional)
                </Label>
                <Textarea
                  id="review-comment"
                  placeholder="Tell us about your experience..."
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>
              
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitReview}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
                  disabled={newReviewRating === 0}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Review
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Customer Reviews ({reviews.length})</h2>
          
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={review.customerAvatar} alt={review.customerName} />
                    <AvatarFallback>{review.customerName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{review.customerName}</h3>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{review.comment}</p>
                    
                    {/* Order Items */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {review.orderItems.map((item, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Helpful Buttons */}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">Was this helpful?</span>
                      <Button variant="ghost" size="sm" className="h-8 px-3">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Yes ({review.helpful})
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-3">
                        <ThumbsDown className="w-3 h-3 mr-1" />
                        No ({review.notHelpful})
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-8">
          <Button variant="outline">
            Load More Reviews
          </Button>
        </div>
      </div>
    </CustomerLayout>
  );
}