"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { useState, useRef } from "react";
import { Upload, X, Crop } from "lucide-react";

export default function CreateShopPage() {
  const [shopName, setShopName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
        setShowCropDialog(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
        setShowCropDialog(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isFormValid = shopName.trim() && contactNumber.trim() && email.trim() && address.trim() && logoFile;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Create Your Restaurant
          </CardTitle>
          <CardDescription className="text-base">
            Fill in the details below to get started
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Restaurant Name */}
          <div className="space-y-2">
            <Label htmlFor="shopName" className="text-sm font-medium">
              Restaurant Name *
            </Label>
            <Input
              id="shopName"
              type="text"
              placeholder="Enter restaurant name"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Restaurant Logo *
            </Label>
            
            {!logoPreview ? (
              <div
                className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-500">
                  PNG, JPG, GIF up to 20MB
                </p>
              </div>
            ) : (
              <div className="relative border rounded-lg p-3 bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {logoFile?.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {logoFile && (logoFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeLogo}
                    className="text-slate-500 hover:text-slate-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <Label htmlFor="contactNumber" className="text-sm font-medium">
              Contact Number *
            </Label>
            <Input
              id="contactNumber"
              type="tel"
              placeholder="Enter contact number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">
              Restaurant Address *
            </Label>
            <Input
              id="address"
              type="text"
              placeholder="Enter restaurant address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Create Button */}
          <Button 
            className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900"
            disabled={!isFormValid}
          >
            Create Restaurant
          </Button>

          {/* Terms */}
          <div className="text-center text-xs text-slate-500 leading-relaxed">
            By creating a shop, you agree to our{" "}
            <Link 
              href="/privacy-policy" 
              className="text-slate-900 hover:text-slate-700 dark:text-slate-100 underline underline-offset-2"
            >
              Privacy Policy
            </Link>
            ,{" "}
            <Link 
              href="/terms-conditions" 
              className="text-slate-900 hover:text-slate-700 dark:text-slate-100 underline underline-offset-2"
            >
              Terms & conditions
            </Link>
            {" "}and{" "}
            <Link 
              href="/refund-policy" 
              className="text-slate-900 hover:text-slate-700 dark:text-slate-100 underline underline-offset-2"
            >
              Refund Policy
            </Link>
            .
          </div>
        </CardContent>

        {/* Crop Dialog */}
        <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crop Image</DialogTitle>
              <DialogDescription>
                Adjust the image and crop it to your desired size
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {logoPreview && (
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={logoPreview}
                    alt="Crop preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCropDialog(false);
                    removeLogo();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setShowCropDialog(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white"
                >
                  <Crop className="w-4 h-4 mr-2" />
                  Crop & Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}