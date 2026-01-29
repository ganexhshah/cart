"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DashboardLayout } from "@/components/dashboard/layout";
import { tableApi, RestaurantTable, TableStats } from "@/lib/tables";
import { restaurantApi } from "@/lib/restaurants";
import { 
  Plus,
  QrCode,
  Download,
  Edit,
  Trash2,
  MoreVertical,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  Search,
  Grid3x3,
  List,
  Loader2,
  Copy,
  Check,
  FileSpreadsheet,
  AlertCircle,
  Store,
  Phone,
  Mail,
  Globe
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import QRCodeLib from 'qrcode';

export default function TablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [tableStats, setTableStats] = useState<TableStats>({
    total_tables: 0,
    available_tables: 0,
    occupied_tables: 0,
    reserved_tables: 0,
    maintenance_tables: 0,
    total_capacity: 0,
    indoor_tables: 0,
    outdoor_tables: 0,
    private_tables: 0
  });
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrData, setQrData] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Bulk add state
  const [showBulkAddDialog, setShowBulkAddDialog] = useState(false);
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [bulkAddData, setBulkAddData] = useState({
    prefix: "",
    startNumber: 1,
    endNumber: 10,
    capacity: 4,
    location: "",
    tableType: "indoor" as 'indoor' | 'outdoor' | 'private',
    status: "available" as RestaurantTable['status'],
    restaurantId: ""
  });
  const [bulkAddResults, setBulkAddResults] = useState<{ created: number; errors: any[] } | null>(null);

  // Form state for adding/editing tables
  const [formData, setFormData] = useState({
    name: "",
    tableNumber: "",
    capacity: 2,
    location: "",
    tableType: "indoor" as 'indoor' | 'outdoor' | 'private',
    status: "available" as RestaurantTable['status'],
    restaurantId: ""
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load restaurants
      const restaurantsResponse = await restaurantApi.getAll();
      if (restaurantsResponse.success) {
        setRestaurants(restaurantsResponse.data);
        // Set default restaurant for new tables
        if (restaurantsResponse.data.length > 0) {
          setFormData(prev => ({ ...prev, restaurantId: restaurantsResponse.data[0].id }));
          setBulkAddData(prev => ({ ...prev, restaurantId: restaurantsResponse.data[0].id }));
        }
      }

      // Load tables
      await loadTables();

      // Load stats
      const statsResponse = await tableApi.getTableStats();
      if (statsResponse.success) {
        setTableStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTables = async () => {
    try {
      const filters = {
        search: searchTerm || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        tableType: filterType !== 'all' ? filterType : undefined
      };

      const response = await tableApi.getTables(filters);
      if (response.success) {
        setTables(response.data);
      }
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  };

  // Reload tables when filters change
  useEffect(() => {
    if (!isLoading) {
      loadTables();
    }
  }, [searchTerm, filterStatus, filterType]);

  const filteredTables = tables.filter(table => {
    const matchesSearch = searchTerm === "" ||
                         table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.table_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || table.status === filterStatus;
    const matchesType = filterType === "all" || table.table_type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: RestaurantTable['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: RestaurantTable['status']) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-3 h-3" />;
      case 'occupied': return <XCircle className="w-3 h-3" />;
      case 'reserved': return <Users className="w-3 h-3" />;
      default: return null;
    }
  };

  const showQRCode = async (table: RestaurantTable) => {
    try {
      // Get QR code data from backend
      const qrResponse = await tableApi.generateTableQR(table.id);
      if (!qrResponse.success) {
        console.error('Failed to get QR data');
        return;
      }

      const qrData = qrResponse.data;
      setQrData(qrData);
      setSelectedTable(table);
      setShowQRDialog(true);
      
      // Generate QR code after dialog is shown with longer timeout to ensure DOM is ready
      setTimeout(() => {
        generateQRCode(table);
      }, 300);
      
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code. Please try again.');
    }
  };

  const generateQRCode = async (table: RestaurantTable) => {
    const canvas = qrCanvasRef.current;
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }

    try {
      // Get QR code data from backend
      const qrResponse = await tableApi.generateTableQR(table.id);
      if (!qrResponse.success) {
        console.error('Failed to get QR data');
        return;
      }

      const qrData = qrResponse.data;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Canvas context not available');
        return;
      }

      // Find restaurant data
      const restaurant = restaurants.find(r => r.id === table.restaurant_id);
      if (!restaurant) {
        console.error('Restaurant not found for table:', table);
        return;
      }

      // Set canvas size for modern QR card (600x900px - taller for better layout)
      canvas.width = 600;
      canvas.height = 900;

      // Modern gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.1, '#f8fafc');
      gradient.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Modern border with rounded corners effect
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Header section with restaurant branding
      const headerHeight = 180;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(20, 20, canvas.width - 40, headerHeight);

      // Restaurant Logo Section
      const logoSize = 80;
      const logoX = canvas.width / 2;
      const logoY = 80;

      const drawModernLogoFallback = () => {
        // Modern logo background with gradient
        const logoGradient = ctx.createRadialGradient(logoX, logoY, 0, logoX, logoY, logoSize / 2);
        logoGradient.addColorStop(0, '#3b82f6');
        logoGradient.addColorStop(1, '#1d4ed8');
        
        ctx.beginPath();
        ctx.arc(logoX, logoY, logoSize / 2, 0, 2 * Math.PI);
        ctx.fillStyle = logoGradient;
        ctx.fill();
        
        // Add restaurant initial with modern typography
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initial = restaurant.name.charAt(0).toUpperCase();
        ctx.fillText(initial, logoX, logoY);
        
        // Add subtle shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
      };

      const continueWithQRGeneration = () => {
        // Restaurant Name with modern typography
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillText(restaurant.name, canvas.width / 2, 140);

        // Restaurant info section
        let currentY = 220;
        if (restaurant.address || restaurant.phone || restaurant.email) {
          ctx.fillStyle = '#64748b';
          ctx.font = '14px system-ui, -apple-system, sans-serif';
          
          if (restaurant.address) {
            ctx.fillText(restaurant.address, canvas.width / 2, currentY);
            currentY += 20;
          }
          if (restaurant.phone) {
            ctx.fillText(restaurant.phone, canvas.width / 2, currentY);
            currentY += 20;
          }
          if (restaurant.email) {
            ctx.fillText(restaurant.email, canvas.width / 2, currentY);
            currentY += 20;
          }
          currentY += 20;
        }

        // Generate and draw QR code with modern styling
        QRCodeLib.toDataURL(qrData.url, {
          width: 300,
          margin: 2,
          color: {
            dark: '#1e293b',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'M'
        }).then(qrCodeDataURL => {
          const qrImage = new Image();
          qrImage.onload = () => {
            // Modern QR Code container with shadow
            const qrY = Math.max(currentY, 280);
            const qrSize = 300;
            const qrX = (canvas.width - qrSize) / 2;
            
            // QR background with modern shadow
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 8;
            
            // Rounded rectangle effect
            const radius = 16;
            ctx.beginPath();
            ctx.roundRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, radius);
            ctx.fill();
            
            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            // Draw QR code
            ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

            // Modern table information section
            const tableInfoY = qrY + qrSize + 60;
            
            // Table info modern container
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.05)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 4;
            
            ctx.beginPath();
            ctx.roundRect(40, tableInfoY - 30, canvas.width - 80, 160, 12);
            ctx.fill();
            
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            // Table Number with modern styling
            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'center';
            const tableNumber = table.table_number || 'N/A';
            ctx.fillText(`Table ${tableNumber}`, canvas.width / 2, tableInfoY);

            // Table Name - Fix the issue here
            ctx.fillStyle = '#475569';
            ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
            const displayTableName = table.name && table.name.trim() ? table.name : `Table ${tableNumber}`;
            ctx.fillText(displayTableName, canvas.width / 2, tableInfoY + 40);

            // Modern table details with proper spacing
            const detailsY = tableInfoY + 80;
            const leftX = 80;
            const rightX = canvas.width - 80;
            
            // Capacity with modern icon
            ctx.fillStyle = '#64748b';
            ctx.font = '16px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'left';
            
            // Draw modern users icon
            drawModernUsersIcon(ctx, leftX, detailsY - 8, 20);
            ctx.fillText(`${table.capacity || 'N/A'} People`, leftX + 30, detailsY + 5);
            
            // Location with modern icon (if available)
            if (table.location && table.location.trim()) {
              ctx.textAlign = 'right';
              drawModernLocationIcon(ctx, rightX - 25, detailsY - 8, 20);
              ctx.fillText(table.location, rightX - 30, detailsY + 5);
            }

            // Modern scan instruction
            ctx.fillStyle = '#3b82f6';
            ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Scan to View Digital Menu', canvas.width / 2, tableInfoY + 120);

            // Modern branding footer
            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px system-ui, -apple-system, sans-serif';
            ctx.fillText('Powered by NayaMenu.com', canvas.width / 2, canvas.height - 40);
            
            // Modern decorative line
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2 - 80, canvas.height - 60);
            ctx.lineTo(canvas.width / 2 + 80, canvas.height - 60);
            ctx.stroke();
          };
          qrImage.src = qrCodeDataURL;
        }).catch(error => {
          console.error('Error generating QR code image:', error);
          // Show error message on canvas
          ctx.fillStyle = '#dc2626';
          ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('QR Code Generation Failed', canvas.width / 2, canvas.height / 2);
        });
      };
      
      // Try to load restaurant logo if available
      if (restaurant.logo_url) {
        try {
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          logoImg.onload = () => {
            // Draw circular clipping path for logo
            ctx.save();
            ctx.beginPath();
            ctx.arc(logoX, logoY, logoSize / 2, 0, 2 * Math.PI);
            ctx.clip();
            
            // Draw logo image
            ctx.drawImage(logoImg, logoX - logoSize/2, logoY - logoSize/2, logoSize, logoSize);
            ctx.restore();
            
            // Add modern border around logo
            ctx.beginPath();
            ctx.arc(logoX, logoY, logoSize / 2, 0, 2 * Math.PI);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            continueWithQRGeneration();
          };
          logoImg.onerror = () => {
            drawModernLogoFallback();
            continueWithQRGeneration();
          };
          logoImg.src = restaurant.logo_url;
        } catch (error) {
          drawModernLogoFallback();
          continueWithQRGeneration();
        }
      } else {
        drawModernLogoFallback();
        continueWithQRGeneration();
      }

    } catch (error) {
      console.error('Error generating QR code:', error);
      
      // Modern fallback design
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 600;
        canvas.height = 900;

        // Modern error background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#fef2f2');
        gradient.addColorStop(1, '#fee2e2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Modern error message
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('QR Code Generation Failed', canvas.width / 2, canvas.height / 2);
        
        ctx.fillStyle = '#7f1d1d';
        ctx.font = '16px system-ui, -apple-system, sans-serif';
        ctx.fillText('Please try again later', canvas.width / 2, canvas.height / 2 + 40);
      }
    }
  };

  // Modern users icon with proper scaling
  const drawModernUsersIcon = (ctx: CanvasRenderingContext2D | null, x: number, y: number, size: number) => {
    if (!ctx) return;
    ctx.save();
    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    
    // First user
    ctx.beginPath();
    ctx.arc(x + size * 0.3, y + size * 0.25, size * 0.15, 0, 2 * Math.PI);
    ctx.fill();
    
    // Second user
    ctx.beginPath();
    ctx.arc(x + size * 0.7, y + size * 0.25, size * 0.15, 0, 2 * Math.PI);
    ctx.fill();
    
    // Bodies with rounded rectangles
    ctx.beginPath();
    ctx.roundRect(x + size * 0.15, y + size * 0.5, size * 0.3, size * 0.4, size * 0.05);
    ctx.fill();
    
    ctx.beginPath();
    ctx.roundRect(x + size * 0.55, y + size * 0.5, size * 0.3, size * 0.4, size * 0.05);
    ctx.fill();
    
    ctx.restore();
  };

  // Modern location icon with proper scaling
  const drawModernLocationIcon = (ctx: CanvasRenderingContext2D | null, x: number, y: number, size: number) => {
    if (!ctx) return;
    ctx.save();
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    
    // Location pin body
    ctx.beginPath();
    ctx.arc(x + size * 0.5, y + size * 0.35, size * 0.25, 0, 2 * Math.PI);
    ctx.fill();
    
    // Pin point
    ctx.beginPath();
    ctx.moveTo(x + size * 0.5, y + size * 0.8);
    ctx.lineTo(x + size * 0.35, y + size * 0.55);
    ctx.lineTo(x + size * 0.65, y + size * 0.55);
    ctx.closePath();
    ctx.fill();
    
    // Inner dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + size * 0.5, y + size * 0.35, size * 0.1, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.restore();
  };

  const downloadQRCode = async (table: RestaurantTable) => {
    try {
      // Get QR code data from backend
      const qrResponse = await tableApi.generateTableQR(table.id);
      if (!qrResponse.success) {
        console.error('Failed to get QR data');
        return;
      }

      const qrData = qrResponse.data;
      
      // Find restaurant data
      const restaurant = restaurants.find(r => r.id === table.restaurant_id);
      if (!restaurant) {
        console.error('Restaurant not found for table:', table);
        return;
      }

      // Create a temporary canvas for download
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size for modern QR card (600x900px)
      tempCanvas.width = 600;
      tempCanvas.height = 900;

      // Modern gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, tempCanvas.height);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.1, '#f8fafc');
      gradient.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Modern border
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(20, 20, tempCanvas.width - 40, tempCanvas.height - 40);

      // Header section
      const headerHeight = 180;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(20, 20, tempCanvas.width - 40, headerHeight);

      // Restaurant Logo Section
      const logoSize = 80;
      const logoX = tempCanvas.width / 2;
      const logoY = 80;

      const drawModernLogoFallback = () => {
        if (!ctx) return;
        // Modern logo background with gradient
        const logoGradient = ctx.createRadialGradient(logoX, logoY, 0, logoX, logoY, logoSize / 2);
        logoGradient.addColorStop(0, '#3b82f6');
        logoGradient.addColorStop(1, '#1d4ed8');
        
        ctx.beginPath();
        ctx.arc(logoX, logoY, logoSize / 2, 0, 2 * Math.PI);
        ctx.fillStyle = logoGradient;
        ctx.fill();
        
        // Add restaurant initial
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initial = restaurant.name.charAt(0).toUpperCase();
        ctx.fillText(initial, logoX, logoY);
      };

      const finishModernDrawing = () => {
        if (!ctx) return;
        
        // Restaurant Name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillText(restaurant.name, tempCanvas.width / 2, 140);

        // Restaurant info
        let currentY = 220;
        if (restaurant.address || restaurant.phone || restaurant.email) {
          ctx.fillStyle = '#64748b';
          ctx.font = '14px system-ui, -apple-system, sans-serif';
          
          if (restaurant.address) {
            ctx.fillText(restaurant.address, tempCanvas.width / 2, currentY);
            currentY += 20;
          }
          if (restaurant.phone) {
            ctx.fillText(restaurant.phone, tempCanvas.width / 2, currentY);
            currentY += 20;
          }
          if (restaurant.email) {
            ctx.fillText(restaurant.email, tempCanvas.width / 2, currentY);
            currentY += 20;
          }
          currentY += 20;
        }

        // Generate QR code
        QRCodeLib.toDataURL(qrData.url, {
          width: 300,
          margin: 2,
          color: {
            dark: '#1e293b',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'M'
        }).then(qrCodeDataURL => {
          const qrImage = new Image();
          qrImage.onload = () => {
            // Modern QR Code container
            const qrY = Math.max(currentY, 280);
            const qrSize = 300;
            const qrX = (tempCanvas.width - qrSize) / 2;
            
            // QR background with shadow
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 8;
            
            // Rounded rectangle
            const radius = 16;
            ctx.beginPath();
            ctx.roundRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, radius);
            ctx.fill();
            
            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            // Draw QR code
            ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

            // Modern table information section
            const tableInfoY = qrY + qrSize + 60;
            
            // Table info container
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.05)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 4;
            
            ctx.beginPath();
            ctx.roundRect(40, tableInfoY - 30, tempCanvas.width - 80, 160, 12);
            ctx.fill();
            
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            // Table Number
            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'center';
            const tableNumber = table.table_number || 'N/A';
            ctx.fillText(`Table ${tableNumber}`, tempCanvas.width / 2, tableInfoY);

            // Table Name - Fixed logic here
            ctx.fillStyle = '#475569';
            ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
            const displayTableName = table.name && table.name.trim() && table.name !== `Table ${tableNumber}` 
              ? table.name 
              : `Table ${tableNumber}`;
            ctx.fillText(displayTableName, tempCanvas.width / 2, tableInfoY + 40);

            // Table details
            const detailsY = tableInfoY + 80;
            const leftX = 80;
            const rightX = tempCanvas.width - 80;
            
            // Capacity
            ctx.fillStyle = '#64748b';
            ctx.font = '16px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'left';
            
            // Draw modern users icon
            drawModernUsersIconForDownload(ctx, leftX, detailsY - 8, 20);
            ctx.fillText(`${table.capacity || 'N/A'} People`, leftX + 30, detailsY + 5);
            
            // Location (if available)
            if (table.location && table.location.trim()) {
              ctx.textAlign = 'right';
              drawModernLocationIconForDownload(ctx, rightX - 25, detailsY - 8, 20);
              ctx.fillText(table.location, rightX - 30, detailsY + 5);
            }

            // Modern scan instruction
            ctx.fillStyle = '#3b82f6';
            ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Scan to View Digital Menu', tempCanvas.width / 2, tableInfoY + 120);

            // Modern branding
            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px system-ui, -apple-system, sans-serif';
            ctx.fillText('Powered by NayaMenu.com', tempCanvas.width / 2, tempCanvas.height - 40);
            
            // Decorative line
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(tempCanvas.width / 2 - 80, tempCanvas.height - 60);
            ctx.lineTo(tempCanvas.width / 2 + 80, tempCanvas.height - 60);
            ctx.stroke();

            // Convert to download
            const finalDataURL = tempCanvas.toDataURL('image/png', 1.0);
            
            // Create filename
            const safeTableName = (table.name && table.name.trim() ? table.name : `Table-${tableNumber}`).replace(/\s+/g, '-');
            const restaurantName = restaurant.name.replace(/\s+/g, '-');
            const filename = `${restaurantName}-${safeTableName}-QR.png`;

            // Download
            const link = document.createElement('a');
            link.href = finalDataURL;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          };
          qrImage.src = qrCodeDataURL;
        }).catch(error => {
          console.error('Error generating QR code for download:', error);
          alert('Failed to generate QR code for download. Please try again.');
        });
      };

      // Helper functions for download
      const drawModernUsersIconForDownload = (context: CanvasRenderingContext2D, x: number, y: number, size: number) => {
        context.save();
        context.fillStyle = '#3b82f6';
        context.strokeStyle = '#3b82f6';
        context.lineWidth = 2;
        
        // First user
        context.beginPath();
        context.arc(x + size * 0.3, y + size * 0.25, size * 0.15, 0, 2 * Math.PI);
        context.fill();
        
        // Second user
        context.beginPath();
        context.arc(x + size * 0.7, y + size * 0.25, size * 0.15, 0, 2 * Math.PI);
        context.fill();
        
        // Bodies
        context.beginPath();
        context.roundRect(x + size * 0.15, y + size * 0.5, size * 0.3, size * 0.4, size * 0.05);
        context.fill();
        
        context.beginPath();
        context.roundRect(x + size * 0.55, y + size * 0.5, size * 0.3, size * 0.4, size * 0.05);
        context.fill();
        
        context.restore();
      };

      const drawModernLocationIconForDownload = (context: CanvasRenderingContext2D, x: number, y: number, size: number) => {
        context.save();
        context.fillStyle = '#ef4444';
        context.strokeStyle = '#ef4444';
        context.lineWidth = 2;
        
        // Location pin body
        context.beginPath();
        context.arc(x + size * 0.5, y + size * 0.35, size * 0.25, 0, 2 * Math.PI);
        context.fill();
        
        // Pin point
        context.beginPath();
        context.moveTo(x + size * 0.5, y + size * 0.8);
        context.lineTo(x + size * 0.35, y + size * 0.55);
        context.lineTo(x + size * 0.65, y + size * 0.55);
        context.closePath();
        context.fill();
        
        // Inner dot
        context.fillStyle = '#ffffff';
        context.beginPath();
        context.arc(x + size * 0.5, y + size * 0.35, size * 0.1, 0, 2 * Math.PI);
        context.fill();
        
        context.restore();
      };

      // Try to load restaurant logo
      if (restaurant.logo_url) {
        try {
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          logoImg.onload = () => {
            // Draw circular clipping path for logo
            ctx.save();
            ctx.beginPath();
            ctx.arc(logoX, logoY, logoSize / 2, 0, 2 * Math.PI);
            ctx.clip();
            
            // Draw logo image
            ctx.drawImage(logoImg, logoX - logoSize/2, logoY - logoSize/2, logoSize, logoSize);
            ctx.restore();
            
            // Add border around logo
            ctx.beginPath();
            ctx.arc(logoX, logoY, logoSize / 2, 0, 2 * Math.PI);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            finishModernDrawing();
          };
          logoImg.onerror = () => {
            drawModernLogoFallback();
            finishModernDrawing();
          };
          logoImg.src = restaurant.logo_url;
        } catch (error) {
          drawModernLogoFallback();
          finishModernDrawing();
        }
      } else {
        drawModernLogoFallback();
        finishModernDrawing();
      }

    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Failed to download QR code. Please try again.');
    }
  };

  const downloadAllQRCodes = async () => {
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      try {
        await downloadQRCode(table);
        // Add delay between downloads to avoid browser blocking
        if (i < tables.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Error downloading QR for table ${table.name}:`, error);
      }
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleAddTable = async () => {
    if (!formData.name || !formData.tableNumber || !formData.restaurantId) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const tableData = {
        restaurantId: formData.restaurantId,
        tableNumber: formData.tableNumber,
        name: formData.name,
        capacity: formData.capacity,
        location: formData.location,
        tableType: formData.tableType,
        status: formData.status
      };

      const response = await tableApi.createTable(tableData);
      if (response.success) {
        // Reset form
        setFormData({
          name: "",
          tableNumber: "",
          capacity: 2,
          location: "",
          tableType: "indoor",
          status: "available",
          restaurantId: restaurants.length > 0 ? restaurants[0].id : ""
        });
        setShowAddDialog(false);
        
        // Reload data
        await loadTables();
        const statsResponse = await tableApi.getTableStats();
        if (statsResponse.success) {
          setTableStats(statsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error creating table:', error);
      alert('Failed to create table. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table?')) {
      return;
    }

    try {
      const response = await tableApi.deleteTable(tableId);
      if (response.success) {
        await loadTables();
        const statsResponse = await tableApi.getTableStats();
        if (statsResponse.success) {
          setTableStats(statsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error deleting table:', error);
      alert('Failed to delete table. Please try again.');
    }
  };

  const handleStatusChange = async (tableId: string, newStatus: RestaurantTable['status']) => {
    try {
      const response = await tableApi.updateTableStatus(tableId, newStatus);
      if (response.success) {
        await loadTables();
        const statsResponse = await tableApi.getTableStats();
        if (statsResponse.success) {
          setTableStats(statsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error updating table status:', error);
      alert('Failed to update table status. Please try again.');
    }
  };

  // Bulk add tables function
  const handleBulkAddTables = async () => {
    if (!bulkAddData.prefix || !bulkAddData.restaurantId) {
      alert("Please fill in all required fields");
      return;
    }

    if (bulkAddData.startNumber > bulkAddData.endNumber) {
      alert("Start number must be less than or equal to end number");
      return;
    }

    const totalTables = bulkAddData.endNumber - bulkAddData.startNumber + 1;
    if (totalTables > 50) {
      alert("Cannot create more than 50 tables at once");
      return;
    }

    setIsBulkAdding(true);
    setBulkAddResults(null);

    try {
      const tablesToCreate = [];
      const errors = [];

      // Generate table data
      for (let i = bulkAddData.startNumber; i <= bulkAddData.endNumber; i++) {
        const tableNumber = i.toString().padStart(2, '0');
        const tableName = `${bulkAddData.prefix} ${tableNumber}`;
        
        tablesToCreate.push({
          restaurantId: bulkAddData.restaurantId,
          tableNumber: tableNumber,
          name: tableName,
          capacity: bulkAddData.capacity,
          location: bulkAddData.location,
          tableType: bulkAddData.tableType,
          status: bulkAddData.status
        });
      }

      // Create tables one by one (could be optimized with batch API)
      let created = 0;
      for (const tableData of tablesToCreate) {
        try {
          const response = await tableApi.createTable(tableData);
          if (response.success) {
            created++;
          } else {
            errors.push(`Failed to create ${tableData.name}: ${response.message || 'Unknown error'}`);
          }
        } catch (error: any) {
          errors.push(`Failed to create ${tableData.name}: ${error.message || 'Unknown error'}`);
        }
      }

      setBulkAddResults({ created, errors });

      // Reload data
      await loadTables();
      const statsResponse = await tableApi.getTableStats();
      if (statsResponse.success) {
        setTableStats(statsResponse.data);
      }

      if (errors.length === 0) {
        // Reset form if all successful
        setBulkAddData({
          prefix: "",
          startNumber: 1,
          endNumber: 10,
          capacity: 4,
          location: "",
          tableType: "indoor",
          status: "available",
          restaurantId: restaurants.length > 0 ? restaurants[0].id : ""
        });
      }

    } catch (error) {
      console.error('Error bulk creating tables:', error);
      alert('Failed to create tables. Please try again.');
    } finally {
      setIsBulkAdding(false);
    }
  };

  return (
    <DashboardLayout title="Table Management">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Table Management</h1>
              <p className="text-gray-600 mt-1">Manage your restaurant tables and generate QR codes</p>
            </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={downloadAllQRCodes}
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Download className="w-4 h-4 mr-2" />
              Download All QR
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowBulkAddDialog(true)}
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Bulk Add
            </Button>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Table
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Table</DialogTitle>
                  <DialogDescription>
                    Create a new table for your restaurant
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="restaurant">Restaurant</Label>
                    <Select
                      value={formData.restaurantId}
                      onValueChange={(value) => setFormData({ ...formData, restaurantId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select restaurant" />
                      </SelectTrigger>
                      <SelectContent>
                        {restaurants.map((restaurant) => (
                          <SelectItem key={restaurant.id} value={restaurant.id}>
                            {restaurant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tableNumber">Table Number</Label>
                    <Input
                      id="tableNumber"
                      placeholder="e.g., T1, A1, 101"
                      value={formData.tableNumber}
                      onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Table Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Table 9"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Select
                      value={formData.capacity.toString()}
                      onValueChange={(value) => setFormData({ ...formData, capacity: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2, 4, 6, 8, 10, 12].map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} people
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Main Hall"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.tableType}
                      onValueChange={(value: any) => setFormData({ ...formData, tableType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indoor">Indoor</SelectItem>
                        <SelectItem value="outdoor">Outdoor</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTable} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Table'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tableStats.total_tables}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{tableStats.available_tables}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Occupied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{tableStats.occupied_tables}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Reserved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{tableStats.reserved_tables}</div>
            </CardContent>
          </Card>
        </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="indoor">Indoor</SelectItem>
                <SelectItem value="outdoor">Outdoor</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tables Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTables.map((table) => (
            <Card key={table.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{table.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {table.location || 'No location'}
                    </CardDescription>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => showQRCode(table)}>
                        <QrCode className="w-4 h-4 mr-2" />
                        View QR Code
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadQRCode(table)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download QR
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={async () => {
                        try {
                          const qrResponse = await tableApi.generateTableQR(table.id);
                          if (qrResponse.success) {
                            await copyToClipboard(qrResponse.data.url);
                          }
                        } catch (error) {
                          console.error('Error copying link:', error);
                        }
                      }}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Table
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteTable(table.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{table.capacity} seats</span>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {table.table_type}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(table.status)} flex items-center gap-1 capitalize`}>
                    {getStatusIcon(table.status)}
                    {table.status}
                  </Badge>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Select
                    value={table.status}
                    onValueChange={(value: any) => handleStatusChange(table.id, value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadQRCode(table)}
                    className="h-8"
                    title="Download QR Code"
                  >
                    <QrCode className="w-3 h-3" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const qrResponse = await tableApi.generateTableQR(table.id);
                        if (qrResponse.success) {
                          await copyToClipboard(qrResponse.data.url);
                        }
                      } catch (error) {
                        console.error('Error copying link:', error);
                      }
                    }}
                    className="h-8"
                    title="Copy Menu Link"
                  >
                    {copySuccess ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredTables.map((table) => (
                <div key={table.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1">
                        <h3 className="font-semibold">{table.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {table.location || 'No location'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{table.capacity} seats</span>
                      </div>
                      
                      <Badge variant="outline" className="capitalize">
                        {table.table_type}
                      </Badge>
                      
                      <Badge className={`${getStatusColor(table.status)} flex items-center gap-1 capitalize`}>
                        {getStatusIcon(table.status)}
                        {table.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadQRCode(table)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        QR Code
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => showQRCode(table)}>
                            <QrCode className="w-4 h-4 mr-2" />
                            View QR Code
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={async () => {
                            try {
                              const qrResponse = await tableApi.generateTableQR(table.id);
                              if (qrResponse.success) {
                                await copyToClipboard(qrResponse.data.url);
                              }
                            } catch (error) {
                              console.error('Error copying link:', error);
                            }
                          }}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteTable(table.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

        {/* Modern QR Code Dialog */}
        <Dialog open={showQRDialog} onOpenChange={(open) => {
          setShowQRDialog(open);
          if (!open) {
            setCopySuccess(false);
            setQrData(null);
            setQrCodeUrl('');
          }
        }}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <QrCode className="w-5 h-5 text-blue-600" />
                </div>
                QR Code - {selectedTable?.name || `Table ${selectedTable?.table_number}`}
              </DialogTitle>
              <DialogDescription className="text-base">
                Professional QR code with restaurant branding for table ordering
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* QR Code Preview */}
              <div className="flex justify-center">
                <div className="bg-white rounded-xl shadow-lg border p-4">
                  <canvas 
                    ref={qrCanvasRef}
                    className="max-w-full h-auto rounded-lg"
                    style={{ maxWidth: '400px', maxHeight: '500px' }}
                  />
                </div>
              </div>

              {/* Modern Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Store className="w-4 h-4 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-blue-900">Restaurant Branding</h4>
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Logo & restaurant name
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Contact information
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Professional design
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <QrCode className="w-4 h-4 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-green-900">QR Features</h4>
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      High-resolution print quality
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Error correction level M
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Mobile-optimized scanning
                    </li>
                  </ul>
                </div>
              </div>

              {/* Table Information Card */}
              {selectedTable && (
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="p-1 bg-gray-200 rounded">
                      <Users className="w-4 h-4 text-gray-600" />
                    </div>
                    Table Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">Name:</span>
                        <span className="text-gray-900">{selectedTable.name || `Table ${selectedTable.table_number}`}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">Number:</span>
                        <span className="text-gray-900">{selectedTable.table_number || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">Capacity:</span>
                        <span className="text-gray-900">{selectedTable.capacity || 'N/A'} people</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">Location:</span>
                        <span className="text-gray-900">{selectedTable.location || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

                  {/* Copy Link Section */}
              {qrData && (
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="p-1 bg-gray-200 rounded">
                      <Globe className="w-4 h-4 text-gray-600" />
                    </div>
                    Direct Link
                  </h4>
                  <div className="flex items-center gap-2">
                    <Input
                      value={qrData.url}
                      readOnly
                      className="flex-1 text-sm bg-white"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(qrData.url)}
                    >
                      {copySuccess ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => selectedTable && downloadQRCode(selectedTable)}
                  className="flex-1"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
                
                {qrData && (
                  <Button
                    onClick={() => copyToClipboard(qrData.url)}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    {copySuccess ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Add Dialog */}
        <Dialog open={showBulkAddDialog} onOpenChange={setShowBulkAddDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Bulk Add Tables
              </DialogTitle>
              <DialogDescription>
                Create multiple tables at once with sequential numbering
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Restaurant Selection */}
              <div className="space-y-2">
                <Label htmlFor="bulk-restaurant">Restaurant *</Label>
                <Select
                  value={bulkAddData.restaurantId}
                  onValueChange={(value) => setBulkAddData(prev => ({ ...prev, restaurantId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Table Prefix */}
              <div className="space-y-2">
                <Label htmlFor="bulk-prefix">Table Prefix *</Label>
                <Input
                  id="bulk-prefix"
                  placeholder="e.g., Table, T, A"
                  value={bulkAddData.prefix}
                  onChange={(e) => setBulkAddData(prev => ({ ...prev, prefix: e.target.value }))}
                />
                <p className="text-xs text-gray-500">
                  Tables will be named: {bulkAddData.prefix} 01, {bulkAddData.prefix} 02, etc.
                </p>
              </div>

              {/* Number Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bulk-start">Start Number *</Label>
                  <Input
                    id="bulk-start"
                    type="number"
                    min="1"
                    value={bulkAddData.startNumber}
                    onChange={(e) => setBulkAddData(prev => ({ ...prev, startNumber: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bulk-end">End Number *</Label>
                  <Input
                    id="bulk-end"
                    type="number"
                    min="1"
                    value={bulkAddData.endNumber}
                    onChange={(e) => setBulkAddData(prev => ({ ...prev, endNumber: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              {/* Preview */}
              {bulkAddData.prefix && bulkAddData.startNumber <= bulkAddData.endNumber && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Preview:</p>
                  <p className="text-xs text-blue-700">
                    Will create {bulkAddData.endNumber - bulkAddData.startNumber + 1} tables: {' '}
                    {bulkAddData.prefix} {bulkAddData.startNumber.toString().padStart(2, '0')} to {' '}
                    {bulkAddData.prefix} {bulkAddData.endNumber.toString().padStart(2, '0')}
                  </p>
                </div>
              )}

              {/* Capacity */}
              <div className="space-y-2">
                <Label htmlFor="bulk-capacity">Capacity</Label>
                <Input
                  id="bulk-capacity"
                  type="number"
                  min="1"
                  max="20"
                  value={bulkAddData.capacity}
                  onChange={(e) => setBulkAddData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 4 }))}
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="bulk-location">Location</Label>
                <Input
                  id="bulk-location"
                  placeholder="e.g., Main Floor, Patio"
                  value={bulkAddData.location}
                  onChange={(e) => setBulkAddData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              {/* Table Type */}
              <div className="space-y-2">
                <Label htmlFor="bulk-type">Table Type</Label>
                <Select
                  value={bulkAddData.tableType}
                  onValueChange={(value: 'indoor' | 'outdoor' | 'private') => 
                    setBulkAddData(prev => ({ ...prev, tableType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indoor">Indoor</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="bulk-status">Status</Label>
                <Select
                  value={bulkAddData.status}
                  onValueChange={(value: RestaurantTable['status']) => 
                    setBulkAddData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results */}
              {bulkAddResults && (
                <div className="space-y-2">
                  {bulkAddResults.created > 0 && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">
                          Successfully created {bulkAddResults.created} tables
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {bulkAddResults.errors.length > 0 && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-900 mb-1">
                            {bulkAddResults.errors.length} errors occurred:
                          </p>
                          <ul className="text-xs text-red-700 space-y-1">
                            {bulkAddResults.errors.slice(0, 5).map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                            {bulkAddResults.errors.length > 5 && (
                              <li>• ... and {bulkAddResults.errors.length - 5} more</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBulkAddDialog(false);
                  setBulkAddResults(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkAddTables}
                disabled={isBulkAdding || !bulkAddData.prefix || !bulkAddData.restaurantId}
              >
                {isBulkAdding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Create {bulkAddData.endNumber - bulkAddData.startNumber + 1} Tables
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Hidden canvas for QR generation */}
        <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />
        </div>
      )}
    </DashboardLayout>
  );
}
