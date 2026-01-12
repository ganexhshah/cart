"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "@/components/dashboard/layout";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  HelpCircle,
  Search,
  Book,
  MessageCircle,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  Play,
  FileText,
  Users,
  Settings,
  CreditCard,
  Shield,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  ThumbsUp,
  Download
} from "lucide-react";
import { useState } from "react";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // FAQ data
  const faqs = [
    {
      id: 1,
      category: "Getting Started",
      question: "How do I add my first restaurant?",
      answer: "To add your first restaurant, click the 'Add Restaurant' button on your dashboard, then follow the step-by-step onboarding process. You'll need to provide basic information like restaurant name, address, cuisine type, and contact details.",
      popular: true
    },
    {
      id: 2,
      category: "Orders",
      question: "How do I manage incoming orders?",
      answer: "Orders appear in real-time on your Orders page. You can view order details, update status (preparing, ready, delivered), and communicate with customers. Enable notifications to get alerts for new orders.",
      popular: true
    },
    {
      id: 3,
      category: "Menu Management",
      question: "Can I update my menu items and prices?",
      answer: "Yes! Go to the Menu section to add, edit, or remove items. You can update prices, descriptions, images, and availability. Changes are reflected immediately on your customer-facing menu.",
      popular: false
    },
    {
      id: 4,
      category: "Analytics",
      question: "How do I view my sales analytics?",
      answer: "Visit the Analytics page to see detailed reports on sales, popular items, customer trends, and revenue. You can filter by date ranges and export data for further analysis.",
      popular: true
    },
    {
      id: 5,
      category: "Billing",
      question: "How do I upgrade my subscription plan?",
      answer: "Go to Profile > Billing section and click 'Manage Subscription'. You can compare plans and upgrade instantly. Your new features will be available immediately after payment confirmation.",
      popular: false
    },
    {
      id: 6,
      category: "Technical",
      question: "What should I do if I'm not receiving order notifications?",
      answer: "Check your notification settings in Profile > Notifications. Ensure email notifications are enabled and your email address is correct. Also check your spam folder and add our domain to your safe senders list.",
      popular: false
    }
  ];

  // Tutorial videos data
  const tutorials = [
    {
      id: 1,
      title: "Getting Started with Your Dashboard",
      duration: "5:30",
      description: "Learn the basics of navigating your restaurant dashboard and key features.",
      thumbnail: "/api/placeholder/300/200",
      category: "Basics"
    },
    {
      id: 2,
      title: "Setting Up Your First Restaurant",
      duration: "8:45",
      description: "Step-by-step guide to adding your restaurant and configuring initial settings.",
      thumbnail: "/api/placeholder/300/200",
      category: "Setup"
    },
    {
      id: 3,
      title: "Managing Orders Efficiently",
      duration: "6:20",
      description: "Best practices for handling orders, updating status, and customer communication.",
      thumbnail: "/api/placeholder/300/200",
      category: "Orders"
    },
    {
      id: 4,
      title: "Menu Management Made Easy",
      duration: "7:15",
      description: "How to add, edit, and organize your menu items for maximum appeal.",
      thumbnail: "/api/placeholder/300/200",
      category: "Menu"
    }
  ];

  // Help categories
  const helpCategories = [
    {
      icon: Users,
      title: "Account & Profile",
      description: "Manage your account settings, profile information, and preferences",
      articles: 12
    },
    {
      icon: Settings,
      title: "Restaurant Setup",
      description: "Configure your restaurant details, hours, and operational settings",
      articles: 8
    },
    {
      icon: FileText,
      title: "Order Management",
      description: "Handle orders, update status, and manage customer communications",
      articles: 15
    },
    {
      icon: CreditCard,
      title: "Billing & Subscriptions",
      description: "Manage your subscription, billing, and payment methods",
      articles: 6
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Account security, two-factor authentication, and privacy settings",
      articles: 9
    },
    {
      icon: Zap,
      title: "Integrations",
      description: "Connect with third-party services and delivery platforms",
      articles: 11
    }
  ];

  // Contact options
  const contactOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help from our support team",
      availability: "24/7",
      action: "Start Chat",
      primary: true
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      availability: "Response within 2 hours",
      action: "Send Email",
      primary: false
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our experts",
      availability: "Mon-Fri, 9AM-6PM EST",
      action: "Call Now",
      primary: false
    }
  ];

  // Filter FAQs based on search
  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Help & Support">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <HelpCircle className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Help Center</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find answers to your questions, learn how to use our platform, and get the support you need.
          </p>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for help articles, FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
              <Badge variant="secondary">{filteredFaqs.length} articles</Badge>
            </div>

            <div className="grid gap-4">
              {filteredFaqs.map((faq) => (
                <Card key={faq.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {faq.category}
                          </Badge>
                          {faq.popular && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{faq.question}</CardTitle>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Helpful
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Full Article
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredFaqs.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or browse our help categories below.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tutorials Tab */}
          <TabsContent value="tutorials" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Video Tutorials</h2>
              <Badge variant="secondary">{tutorials.length} videos</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tutorials.map((tutorial) => (
                <Card key={tutorial.id} className="hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img
                      src={tutorial.thumbnail}
                      alt={tutorial.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-t-lg flex items-center justify-center">
                      <Button size="lg" className="rounded-full">
                        <Play className="w-6 h-6" />
                      </Button>
                    </div>
                    <Badge className="absolute top-3 right-3 bg-black/70 text-white">
                      <Clock className="w-3 h-3 mr-1" />
                      {tutorial.duration}
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{tutorial.category}</Badge>
                    </div>
                    <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                    <CardDescription>{tutorial.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Guides Tab */}
          <TabsContent value="guides" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Help Categories</h2>
              <Badge variant="secondary">{helpCategories.reduce((sum, cat) => sum + cat.articles, 0)} articles</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpCategories.map((category, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <category.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {category.articles} articles
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{category.description}</p>
                    <Button variant="ghost" className="w-full mt-4 justify-between">
                      Browse Articles
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
                <CardDescription>Common tasks and helpful resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="font-medium">Platform Status</div>
                      <div className="text-sm text-muted-foreground">Check system status and uptime</div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="font-medium">API Documentation</div>
                      <div className="text-sm text-muted-foreground">Developer resources and guides</div>
                    </div>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="font-medium">Feature Requests</div>
                      <div className="text-sm text-muted-foreground">Suggest new features</div>
                    </div>
                    <Zap className="w-4 h-4 ml-auto" />
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="font-medium">Download Resources</div>
                      <div className="text-sm text-muted-foreground">Guides, templates, and tools</div>
                    </div>
                    <Download className="w-4 h-4 ml-auto" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">Get in Touch</h2>
              <p className="text-muted-foreground">
                Can't find what you're looking for? Our support team is here to help.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contactOptions.map((option, index) => (
                <Card key={index} className={`hover:shadow-md transition-shadow ${option.primary ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardHeader className="text-center">
                    <div className="mx-auto p-3 bg-blue-100 rounded-full w-fit mb-4">
                      <option.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle>{option.title}</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {option.availability}
                    </div>
                    <Button 
                      className="w-full" 
                      variant={option.primary ? "default" : "outline"}
                    >
                      {option.action}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input placeholder="Your full name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" placeholder="your@email.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="What can we help you with?" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <textarea
                    className="w-full min-h-[120px] px-3 py-2 border border-input bg-background rounded-md text-sm"
                    placeholder="Please describe your issue or question in detail..."
                  />
                </div>
                <Button className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Support Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Support Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Live Chat & Email</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Monday - Friday</span>
                        <span>24/7</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday - Sunday</span>
                        <span>24/7</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Phone Support</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Monday - Friday</span>
                        <span>9:00 AM - 6:00 PM EST</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday - Sunday</span>
                        <span>Closed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}