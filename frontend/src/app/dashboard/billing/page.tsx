"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useState } from "react";
import { 
  Receipt, 
  CreditCard, 
  Printer, 
  MessageSquare, 
  Split,
  DollarSign,
  Download,
  Eye,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface BillItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Bill {
  id: string;
  billNumber: string;
  customerName: string;
  tableNumber: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  items: BillItem[];
}

export default function BillingPage() {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showBillDialog, setShowBillDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showSplitDialog, setShowSplitDialog] = useState(false);

  // Mock data
  const bills = [
    {
      id: "1",
      billNumber: "BILL-20250121-0001",
      customerName: "John Doe",
      tableNumber: "T-05",
      subtotal: 1250.00,
      discountAmount: 125.00,
      taxAmount: 146.25,
      totalAmount: 1271.25,
      paymentStatus: "pending",
      paymentMethod: "cash",
      createdAt: "2025-01-21T14:30:00Z",
      items: [
        { name: "Chicken Momo", quantity: 2, price: 250, total: 500 },
        { name: "Buff Chowmein", quantity: 1, price: 350, total: 350 },
        { name: "Coke", quantity: 2, price: 200, total: 400 }
      ]
    },
    {
      id: "2",
      billNumber: "BILL-20250121-0002",
      customerName: "Jane Smith",
      tableNumber: "T-12",
      subtotal: 850.00,
      discountAmount: 0,
      taxAmount: 110.50,
      totalAmount: 960.50,
      paymentStatus: "paid",
      paymentMethod: "card",
      createdAt: "2025-01-21T13:15:00Z",
      items: [
        { name: "Dal Bhat", quantity: 1, price: 450, total: 450 },
        { name: "Chicken Curry", quantity: 1, price: 400, total: 400 }
      ]
    }
  ];

  const paymentMethods = [
    { id: "cash", name: "Cash", icon: DollarSign },
    { id: "card", name: "Card", icon: CreditCard },
    { id: "esewa", name: "eSewa", icon: CreditCard },
    { id: "khalti", name: "Khalti", icon: CreditCard }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "partial": return "bg-blue-100 text-blue-800";
      case "refunded": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return CheckCircle;
      case "pending": return Clock;
      case "partial": return AlertCircle;
      default: return Clock;
    }
  };

  const handleGenerateBill = () => {
    // Generate bill logic
    console.log("Generating bill...");
  };

  const handleProcessPayment = (billId: string, paymentData: any) => {
    // Process payment logic
    console.log("Processing payment for bill:", billId, paymentData);
    setShowPaymentDialog(false);
  };

  const handleSplitBill = (billId: string, splitCount: number) => {
    // Split bill logic
    console.log("Splitting bill:", billId, "into", splitCount, "parts");
    setShowSplitDialog(false);
  };

  const handlePrintBill = (billId: string) => {
    // Print bill logic
    console.log("Printing bill:", billId);
  };

  const handleSendWhatsApp = (billId: string) => {
    // Send via WhatsApp logic
    console.log("Sending bill via WhatsApp:", billId);
  };

  return (
    <DashboardLayout title="Billing & Payments">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={handleGenerateBill}>
            <Receipt className="w-4 h-4 mr-2" />
            Generate Bill
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="bills" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bills">All Bills</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="bills">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bills</CardTitle>
              <CardDescription>
                Manage customer bills and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bills.map((bill) => {
                  const StatusIcon = getStatusIcon(bill.paymentStatus);
                  return (
                    <div key={bill.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Receipt className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{bill.billNumber}</h3>
                            <p className="text-sm text-muted-foreground">
                              {bill.customerName} • Table {bill.tableNumber}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(bill.paymentStatus)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {bill.paymentStatus}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Subtotal</p>
                          <p className="font-medium">₹{bill.subtotal.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Discount</p>
                          <p className="font-medium text-green-600">-₹{bill.discountAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Tax (VAT)</p>
                          <p className="font-medium">₹{bill.taxAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="font-semibold text-lg">₹{bill.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBill(bill);
                              setShowBillDialog(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrintBill(bill.id)}
                          >
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendWhatsApp(bill.id)}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            WhatsApp
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          {bill.paymentStatus === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedBill(bill);
                                  setShowSplitDialog(true);
                                }}
                              >
                                <Split className="w-4 h-4 mr-2" />
                                Split
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedBill(bill);
                                  setShowPaymentDialog(true);
                                }}
                              >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Pay Now
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {paymentMethods.map((method) => (
              <Card key={method.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <method.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{method.name}</h3>
                      <p className="text-sm text-muted-foreground">Available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Recent payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bills.filter(b => b.paymentStatus === "paid").map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{bill.billNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          {bill.customerName} • {bill.paymentMethod}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{bill.totalAmount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(bill.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Settings</CardTitle>
                <CardDescription>Configure tax rates and calculations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="vat-rate">VAT Rate (%)</Label>
                  <Input id="vat-rate" type="number" defaultValue="13" step="0.01" />
                </div>
                <div>
                  <Label htmlFor="service-charge">Service Charge (%)</Label>
                  <Input id="service-charge" type="number" defaultValue="10" step="0.01" />
                </div>
                <Button>Save Tax Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discount Settings</CardTitle>
                <CardDescription>Configure discount options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="max-discount">Maximum Discount (%)</Label>
                  <Input id="max-discount" type="number" defaultValue="20" step="0.01" />
                </div>
                <div>
                  <Label htmlFor="discount-type">Default Discount Type</Label>
                  <Select defaultValue="percentage">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="flat">Flat Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Save Discount Settings</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bill Details Dialog */}
      <Dialog open={showBillDialog} onOpenChange={setShowBillDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bill Details</DialogTitle>
            <DialogDescription>
              {selectedBill?.billNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedBill.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Table</p>
                  <p className="font-medium">{selectedBill.tableNumber}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Items</h3>
                <div className="space-y-2">
                  {selectedBill.items.map((item: BillItem, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                      <p className="font-medium">₹{item.total}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{selectedBill.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{selectedBill.discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (VAT)</span>
                  <span>₹{selectedBill.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>₹{selectedBill.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              {selectedBill?.billNumber} - ₹{selectedBill?.totalAmount.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                defaultValue={selectedBill?.totalAmount}
                step="0.01"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleProcessPayment(selectedBill?.id || '', {})}
                className="flex-1"
              >
                Process Payment
              </Button>
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Split Bill Dialog */}
      <Dialog open={showSplitDialog} onOpenChange={setShowSplitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Split Bill</DialogTitle>
            <DialogDescription>
              {selectedBill?.billNumber} - ₹{selectedBill?.totalAmount.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="split-count">Number of Splits</Label>
              <Input
                id="split-count"
                type="number"
                min="2"
                max="10"
                defaultValue="2"
              />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Each person will pay: ₹{selectedBill ? (selectedBill.totalAmount / 2).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleSplitBill(selectedBill?.id || '', 2)}
                className="flex-1"
              >
                Split Bill
              </Button>
              <Button variant="outline" onClick={() => setShowSplitDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}