"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DashboardLayout } from "@/components/dashboard/layout";
import { menuApi, MenuItem, MenuCategory, MenuStats } from "@/lib/menu";
import { restaurantApi } from "@/lib/restaurants";
import { uploadApi } from "@/lib/upload";
import { useState, useEffect, useRef } from "react";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { 
  Plus,
  Search,
  MoreHorizontal, 
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Star,
  Clock,
  ChefHat,
  Utensils,
  ImageIcon,
  Loader2,
  Upload,
  X,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  CheckSquare,
  Square,
  Edit3
} from "lucide-react";

export default function MenuPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showBulkImportDialog, setShowBulkImportDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const [bulkImportResults, setBulkImportResults] = useState<{ created: number; errors: any[] } | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [showJsonInput, setShowJsonInput] = useState(false);
  const [showJsonInputInAdd, setShowJsonInputInAdd] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [menuStats, setMenuStats] = useState<MenuStats>({
    total_items: 0,
    available_items: 0,
    out_of_stock_items: 0,
    discontinued_items: 0,
    avg_rating: 0,
    total_orders: 0,
    avg_price: 0,
    featured_items: 0
  });

  // Bulk operations state
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    categoryId: "",
    price: "",
    isVegetarian: null as boolean | null,
    isVegan: null as boolean | null,
    isGlutenFree: null as boolean | null,
    status: ""
  });
  const [isBulkEditing, setIsBulkEditing] = useState(false);

  // Form state for adding new item
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    preparationTime: "",
    calories: "",
    ingredients: "",
    allergens: "",
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    restaurantId: "", // Will be set from user's restaurants
    imageUrl: "",
    imageFile: null as File | null
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load categories for user's restaurants
      const categoriesResponse = await menuApi.getCategories();
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }

      // Load user's restaurants
      const restaurantsResponse = await restaurantApi.getAll();
      if (restaurantsResponse.success) {
        setRestaurants(restaurantsResponse.data);
        // Set default restaurant for new items
        if (restaurantsResponse.data.length > 0) {
          setNewItem(prev => ({ ...prev, restaurantId: restaurantsResponse.data[0].id }));
        }
      }

      // Load menu items
      await loadMenuItems();

      // Load stats
      const statsResponse = await menuApi.getMenuStats();
      if (statsResponse.success) {
        setMenuStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMenuItems = async () => {
    try {
      const filters = {
        search: searchTerm || undefined,
        categoryId: categoryFilter !== 'all' ? categoryFilter : undefined // Don't parse as integer
      };

      const response = await menuApi.getUserMenuItems(filters);
      if (response.success) {
        setMenuItems(response.data);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  // Reload items when filters change
  useEffect(() => {
    if (!isLoading) {
      loadMenuItems();
    }
  }, [searchTerm, categoryFilter]);

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.categoryId || !newItem.restaurantId) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl = newItem.imageUrl;

      // Handle image upload if file is selected
      if (newItem.imageFile) {
        setIsUploading(true);
        try {
          const uploadResponse = await uploadApi.menuItem(newItem.imageFile);
          if (uploadResponse.success) {
            imageUrl = uploadResponse.data.url;
          } else {
            throw new Error('Failed to upload image');
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          alert('Failed to upload image. Please try again or use a direct URL.');
          return;
        } finally {
          setIsUploading(false);
        }
      }

      const itemData = {
        restaurantId: newItem.restaurantId,
        categoryId: newItem.categoryId || undefined, // Use undefined instead of null
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        preparationTime: newItem.preparationTime ? parseInt(newItem.preparationTime) : undefined,
        calories: newItem.calories ? parseInt(newItem.calories) : undefined,
        ingredients: newItem.ingredients.split(",").map(i => i.trim()).filter(i => i),
        allergens: newItem.allergens.split(",").map(a => a.trim()).filter(a => a),
        isVegetarian: newItem.isVegetarian,
        isVegan: newItem.isVegan,
        isGlutenFree: newItem.isGlutenFree,
        imageUrl: imageUrl || undefined
      };

      const response = await menuApi.createMenuItem(itemData);
      if (response.success) {
        // Reset form
        setNewItem({
          name: "",
          description: "",
          price: "",
          categoryId: "",
          preparationTime: "",
          calories: "",
          ingredients: "",
          allergens: "",
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          restaurantId: restaurants.length > 0 ? restaurants[0].id : "",
          imageUrl: "",
          imageFile: null
        });
        setShowAddDialog(false);
        
        // Reload data
        await loadMenuItems();
        const statsResponse = await menuApi.getMenuStats();
        if (statsResponse.success) {
          setMenuStats(statsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error creating menu item:', error);
      alert('Failed to create menu item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edit item
  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      categoryId: item.category_id || '',
      preparationTime: item.preparation_time?.toString() || '',
      calories: item.calories?.toString() || '',
      ingredients: Array.isArray(item.ingredients) ? item.ingredients.join(', ') : '',
      allergens: Array.isArray(item.allergens) ? item.allergens.join(', ') : '',
      isVegetarian: item.is_vegetarian || false,
      isVegan: item.is_vegan || false,
      isGlutenFree: item.is_gluten_free || false,
      restaurantId: item.restaurant_id,
      imageUrl: item.image_url || '',
      imageFile: null
    });
    setShowEditDialog(true);
  };

  // Handle update item
  const handleUpdateItem = async () => {
    if (!editingItem || !newItem.name || !newItem.price || !newItem.categoryId) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl = newItem.imageUrl;

      // Handle image upload if file is selected
      if (newItem.imageFile) {
        setIsUploading(true);
        try {
          const uploadResponse = await uploadApi.menuItem(newItem.imageFile);
          if (uploadResponse.success) {
            imageUrl = uploadResponse.data.url;
          } else {
            throw new Error('Failed to upload image');
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          alert('Failed to upload image. Please try again or use a direct URL.');
          return;
        } finally {
          setIsUploading(false);
        }
      }

      const itemData = {
        restaurantId: newItem.restaurantId,
        categoryId: newItem.categoryId || undefined,
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        preparationTime: newItem.preparationTime ? parseInt(newItem.preparationTime) : undefined,
        calories: newItem.calories ? parseInt(newItem.calories) : undefined,
        ingredients: newItem.ingredients.split(",").map(i => i.trim()).filter(i => i),
        allergens: newItem.allergens.split(",").map(a => a.trim()).filter(a => a),
        isVegetarian: newItem.isVegetarian,
        isVegan: newItem.isVegan,
        isGlutenFree: newItem.isGlutenFree,
        imageUrl: imageUrl || undefined
      };

      const response = await menuApi.updateMenuItem(editingItem.id, itemData);
      if (response.success) {
        // Reset form
        setNewItem({
          name: "",
          description: "",
          price: "",
          categoryId: "",
          preparationTime: "",
          calories: "",
          ingredients: "",
          allergens: "",
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          restaurantId: restaurants.length > 0 ? restaurants[0].id : "",
          imageUrl: "",
          imageFile: null
        });
        setEditingItem(null);
        setShowEditDialog(false);
        
        // Reload data
        await loadMenuItems();
        const statsResponse = await menuApi.getMenuStats();
        if (statsResponse.success) {
          setMenuStats(statsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      alert('Failed to update menu item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setNewItem({...newItem, imageFile: file, imageUrl: ""});
    }
  };

  // Remove selected image
  const removeImage = () => {
    setNewItem({...newItem, imageFile: null, imageUrl: ""});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle bulk import file selection
  const handleBulkImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      handleCSVImport(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      handleExcelImport(file);
    } else if (fileExtension === 'json') {
      handleJSONImport(file);
    } else {
      alert('Please select a valid CSV, Excel, or JSON file');
    }
  };

  // Handle JSON import
  const handleJSONImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        // Handle both array of objects and single object
        const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
        processBulkImportData(dataArray);
      } catch (error) {
        console.error('JSON parsing error:', error);
        alert('Error parsing JSON file. Please ensure it contains valid JSON data.');
      }
    };
    reader.readAsText(file);
  };

  // Handle CSV import
  const handleCSVImport = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        processBulkImportData(results.data);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        alert('Error parsing CSV file');
      }
    });
  };

  // Handle Excel import
  const handleExcelImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        processBulkImportData(jsonData);
      } catch (error) {
        console.error('Excel parsing error:', error);
        alert('Error parsing Excel file');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Process bulk import data
  const processBulkImportData = async (data: any[]) => {
    if (!data || data.length === 0) {
      alert('No data found in the file');
      return;
    }

    setIsBulkImporting(true);
    setBulkImportResults(null);

    try {
      // Map the data to our menu item format
      const menuItems = data.map((row: any) => {
        // Handle both JSON format (camelCase) and CSV/Excel format (various cases)
        const getName = () => row.name || row.Name || row.item_name || row['Item Name'] || '';
        const getDescription = () => row.description || row.Description || '';
        const getPrice = () => {
          const price = row.price || row.Price || '0';
          return typeof price === 'number' ? price : parseFloat(price);
        };
        const getCategory = () => row.category || row.Category || '';
        const getPrepTime = () => {
          const time = row.preparationTime || row.preparation_time || row['Prep Time'] || row.prepTime || '15';
          return typeof time === 'number' ? time : parseInt(time);
        };
        const getCalories = () => {
          const cal = row.calories || row.Calories || '0';
          const calories = typeof cal === 'number' ? cal : parseInt(cal);
          return calories || undefined;
        };
        const getIngredients = () => {
          const ingredients = row.ingredients || row.Ingredients;
          if (Array.isArray(ingredients)) return ingredients;
          if (typeof ingredients === 'string') return ingredients.split(',').map((i: string) => i.trim()).filter((i: string) => i);
          return [];
        };
        const getAllergens = () => {
          const allergens = row.allergens || row.Allergens;
          if (Array.isArray(allergens)) return allergens;
          if (typeof allergens === 'string') return allergens.split(',').map((a: string) => a.trim()).filter((a: string) => a);
          return [];
        };
        const getBoolean = (field: string) => {
          const value = row[field] || row[field.toLowerCase()] || row[field.charAt(0).toUpperCase() + field.slice(1)];
          if (typeof value === 'boolean') return value;
          if (typeof value === 'string') return value.toLowerCase() === 'true';
          return false;
        };

        return {
          restaurantId: restaurants.length > 0 ? restaurants[0].id : '',
          categoryId: findCategoryIdByName(getCategory()),
          name: getName(),
          description: getDescription(),
          price: getPrice(),
          imageUrl: row.imageUrl || row.image_url || row['Image URL'] || '',
          preparationTime: getPrepTime(),
          calories: getCalories(),
          ingredients: getIngredients(),
          allergens: getAllergens(),
          isVegetarian: getBoolean('isVegetarian') || getBoolean('vegetarian'),
          isVegan: getBoolean('isVegan') || getBoolean('vegan'),
          isGlutenFree: getBoolean('isGlutenFree') || getBoolean('gluten_free') || getBoolean('Gluten Free'),
        };
      }).filter((item: any) => item.name && item.price > 0); // Filter out invalid items

      if (menuItems.length === 0) {
        alert('No valid menu items found in the file');
        return;
      }

      // Send bulk import request
      const response = await menuApi.bulkImportMenuItems({
        items: menuItems,
        restaurantId: restaurants.length > 0 ? restaurants[0].id : ''
      });

      if (response.success) {
        setBulkImportResults(response.data);
        await loadMenuItems();
        const statsResponse = await menuApi.getMenuStats();
        if (statsResponse.success) {
          setMenuStats(statsResponse.data);
        }
      }
    } catch (error) {
      console.error('Bulk import error:', error);
      alert('Error importing menu items. Please try again.');
    } finally {
      setIsBulkImporting(false);
    }
  };

  // Find category ID by name
  const findCategoryIdByName = (categoryName: string): string => {
    if (!categoryName) return '';
    const category = categories.find(cat => 
      cat.name.toLowerCase() === categoryName.toLowerCase()
    );
    return category?.id || '';
  };

  // Handle manual JSON input
  const handleJsonInputSubmit = () => {
    if (!jsonInput.trim()) {
      alert('Please enter JSON data');
      return;
    }

    try {
      const jsonData = JSON.parse(jsonInput);
      const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
      processBulkImportData(dataArray);
      setJsonInput('');
      setShowJsonInput(false);
    } catch (error) {
      alert('Invalid JSON format. Please check your JSON syntax.');
    }
  };

  // Handle JSON input in add dialog
  const handleJsonInputInAdd = () => {
    if (!jsonInput.trim()) {
      alert('Please enter JSON data');
      return;
    }

    try {
      const jsonData = JSON.parse(jsonInput);
      
      // Fill the form with JSON data
      setNewItem({
        name: jsonData.name || '',
        description: jsonData.description || '',
        price: jsonData.price?.toString() || '',
        categoryId: findCategoryIdByName(jsonData.category || '') || '',
        preparationTime: jsonData.preparationTime?.toString() || '',
        calories: jsonData.calories?.toString() || '',
        ingredients: Array.isArray(jsonData.ingredients) 
          ? jsonData.ingredients.join(', ') 
          : jsonData.ingredients || '',
        allergens: Array.isArray(jsonData.allergens) 
          ? jsonData.allergens.join(', ') 
          : jsonData.allergens || '',
        isVegetarian: Boolean(jsonData.isVegetarian),
        isVegan: Boolean(jsonData.isVegan),
        isGlutenFree: Boolean(jsonData.isGlutenFree),
        restaurantId: restaurants.length > 0 ? restaurants[0].id : '',
        imageUrl: jsonData.imageUrl || '',
        imageFile: null
      });
      
      setJsonInput('');
      setShowJsonInputInAdd(false);
    } catch (error) {
      alert('Invalid JSON format. Please check your JSON syntax.');
    }
  };

  // Download sample template
  const downloadSampleTemplate = (format: 'excel' | 'json' = 'excel') => {
    const sampleData = [
      {
        'name': 'Margherita Pizza',
        'description': 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
        'price': 12.99,
        'category': 'Pizza',
        'preparationTime': 15,
        'calories': 280,
        'ingredients': ['Tomato sauce', 'Mozzarella cheese', 'Fresh basil', 'Olive oil'],
        'allergens': ['Gluten', 'Dairy'],
        'isVegetarian': true,
        'isVegan': false,
        'isGlutenFree': false,
        'imageUrl': 'https://example.com/pizza.jpg'
      },
      {
        'name': 'Caesar Salad',
        'description': 'Fresh romaine lettuce with caesar dressing and croutons',
        'price': 8.99,
        'category': 'Salads',
        'preparationTime': 10,
        'calories': 150,
        'ingredients': ['Romaine lettuce', 'Caesar dressing', 'Croutons', 'Parmesan cheese'],
        'allergens': ['Gluten', 'Dairy'],
        'isVegetarian': true,
        'isVegan': false,
        'isGlutenFree': false,
        'imageUrl': ''
      }
    ];

    if (format === 'json') {
      // Download JSON template
      const jsonString = JSON.stringify(sampleData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'menu_items_template.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Download Excel template (convert arrays to comma-separated strings for Excel)
      const excelData = sampleData.map(item => ({
        'Name': item.name,
        'Description': item.description,
        'Price': item.price.toString(),
        'Category': item.category,
        'Prep Time': item.preparationTime.toString(),
        'Calories': item.calories.toString(),
        'Ingredients': item.ingredients.join(', '),
        'Allergens': item.allergens.join(', '),
        'Vegetarian': item.isVegetarian.toString(),
        'Vegan': item.isVegan.toString(),
        'Gluten Free': item.isGlutenFree.toString(),
        'Image URL': item.imageUrl
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Menu Items');
      XLSX.writeFile(workbook, 'menu_items_template.xlsx');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      const response = await menuApi.deleteMenuItem(itemId);
      if (response.success) {
        await loadMenuItems();
        const statsResponse = await menuApi.getMenuStats();
        if (statsResponse.success) {
          setMenuStats(statsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item. Please try again.');
    }
  };

  const handleStatusChange = async (itemId: string, newStatus: string) => {
    try {
      const response = await menuApi.updateItemStatus(itemId, newStatus);
      if (response.success) {
        await loadMenuItems();
        const statsResponse = await menuApi.getMenuStats();
        if (statsResponse.success) {
          setMenuStats(statsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      alert('Failed to update item status. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "out_of_stock": return "bg-red-100 text-red-800";
      case "discontinued": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categoryName?.toLowerCase();
    switch (category) {
      case "pizza": return <Utensils className="w-4 h-4" />;
      case "burgers": return <ChefHat className="w-4 h-4" />;
      case "sushi": return <Utensils className="w-4 h-4" />;
      case "salads": return <Utensils className="w-4 h-4" />;
      default: return <Utensils className="w-4 h-4" />;
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = searchTerm === "" || 
                         item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.restaurant_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categoryOptions = [
    { value: "all", label: "All" },
    ...categories.map(cat => ({ value: cat.id, label: cat.name })) // Don't convert to string, already UUID
  ];

  // Bulk operations functions
  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleBulkEdit = async () => {
    if (selectedItems.length === 0) {
      alert('Please select items to edit');
      return;
    }

    setIsBulkEditing(true);
    try {
      const updateData: any = {};
      
      // Only include fields that have values and are not "no-change"
      if (bulkEditData.categoryId && bulkEditData.categoryId !== "no-change") {
        updateData.categoryId = bulkEditData.categoryId;
      }
      if (bulkEditData.price) updateData.price = parseFloat(bulkEditData.price);
      if (bulkEditData.isVegetarian !== null) updateData.isVegetarian = bulkEditData.isVegetarian;
      if (bulkEditData.isVegan !== null) updateData.isVegan = bulkEditData.isVegan;
      if (bulkEditData.isGlutenFree !== null) updateData.isGlutenFree = bulkEditData.isGlutenFree;
      if (bulkEditData.status && bulkEditData.status !== "no-change") {
        updateData.status = bulkEditData.status;
      }

      // Update each selected item
      const promises = selectedItems.map(itemId => 
        menuApi.updateMenuItem(itemId, updateData)
      );

      await Promise.all(promises);
      
      // Reload data
      await loadMenuItems();
      const statsResponse = await menuApi.getMenuStats();
      if (statsResponse.success) {
        setMenuStats(statsResponse.data);
      }

      // Reset state
      setSelectedItems([]);
      setShowBulkEditDialog(false);
      setBulkEditData({
        categoryId: "",
        price: "",
        isVegetarian: null,
        isVegan: null,
        isGlutenFree: null,
        status: ""
      });

      alert(`Successfully updated ${selectedItems.length} items`);
    } catch (error) {
      console.error('Error bulk editing items:', error);
      alert('Failed to update some items. Please try again.');
    } finally {
      setIsBulkEditing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      alert('Please select items to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedItems.length} selected items?`)) {
      return;
    }

    try {
      const promises = selectedItems.map(itemId => 
        menuApi.deleteMenuItem(itemId)
      );

      await Promise.all(promises);
      
      // Reload data
      await loadMenuItems();
      const statsResponse = await menuApi.getMenuStats();
      if (statsResponse.success) {
        setMenuStats(statsResponse.data);
      }

      setSelectedItems([]);
      alert(`Successfully deleted ${selectedItems.length} items`);
    } catch (error) {
      console.error('Error bulk deleting items:', error);
      alert('Failed to delete some items. Please try again.');
    }
  };

  return (
    <DashboardLayout title="Menu Management">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold">{menuStats.total_items}</p>
                  </div>
                  <Utensils className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Available</p>
                    <p className="text-2xl font-bold text-green-600">{menuStats.available_items}</p>
                  </div>
                  <ChefHat className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                    <p className="text-2xl font-bold text-red-600">{menuStats.out_of_stock_items}</p>
                  </div>
                  <Clock className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                    <p className="text-2xl font-bold text-yellow-600">{Number(menuStats.avg_rating || 0).toFixed(1)}</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold text-blue-600">{menuStats.total_orders}</p>
                  </div>
                  <div className="text-blue-600 text-2xl font-bold">₹</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Price</p>
                    <p className="text-2xl font-bold text-purple-600">₹{Number(menuStats.avg_price || 0).toFixed(2)}</p>
                  </div>
                  <div className="text-purple-600 text-2xl font-bold">₹</div>
                </div>
              </CardContent>
            </Card>
          </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search menu items, restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Tabs value={categoryFilter} onValueChange={setCategoryFilter} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-3 sm:grid-cols-5 w-full sm:w-auto">
              {categoryOptions.slice(0, 5).map((category) => (
                <TabsTrigger key={category.value} value={category.value} className="text-xs capitalize">
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => downloadSampleTemplate('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Template
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setShowBulkImportDialog(true)}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 sm:flex-none" 
            onClick={handleSelectAll}
            disabled={filteredItems.length === 0}
          >
            {selectedItems.length === filteredItems.length && filteredItems.length > 0 ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Deselect All
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4 mr-2" />
                Select All
              </>
            )}
          </Button>
          <Button className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Menu Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Items ({filteredItems.length})</CardTitle>
          <CardDescription>
            Manage menu items across all your restaurants
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Bulk Actions Bar */}
          {selectedItems.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowBulkEditDialog(true)}
                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Bulk Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkDelete}
                    className="text-red-700 border-red-300 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete Selected
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedItems([])}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all items"
                    />
                  </TableHead>
                  <TableHead className="min-w-60">Item</TableHead>
                  <TableHead className="hidden sm:table-cell">Restaurant</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Rating</TableHead>
                  <TableHead className="hidden lg:table-cell">Orders</TableHead>
                  <TableHead className="w-17.5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => handleSelectItem(item.id)}
                        aria-label={`Select ${item.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12 rounded-lg">
                            <AvatarImage src={item.image_url || "/api/placeholder/80/80"} alt={item.name} className="object-cover" />
                            <AvatarFallback className="rounded-lg">
                              <ImageIcon className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1">
                            {getCategoryIcon(item.category_name || "")}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{item.description}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.category_name}
                            </Badge>
                            {item.is_vegetarian && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                Vegetarian
                              </Badge>
                            )}
                            {item.is_vegan && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                Vegan
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="/api/placeholder/32/32" alt={item.restaurant_name} />
                          <AvatarFallback className="text-xs">{item.restaurant_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{item.restaurant_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">₹{Number(item.price || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{Number(item.average_rating || 0).toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                      {item.total_orders || 0}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => {
                                e.preventDefault();
                                setSelectedItem(item);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </DialogTrigger>
                          </Dialog>
                          <DropdownMenuItem onClick={() => handleEditItem(item)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No menu items found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Item Details Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12 rounded-lg">
                  <AvatarImage src={selectedItem.image_url || ""} alt={selectedItem.name} className="object-cover" />
                  <AvatarFallback className="rounded-lg">
                    <ImageIcon className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                {selectedItem.name}
              </DialogTitle>
              <DialogDescription>
                Complete menu item information and details
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Item Information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Item Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                      <p className="text-sm mt-1">{selectedItem.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                      <Badge variant="outline" className="capitalize">
                        {selectedItem.category_name}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <Badge className={getStatusColor(selectedItem.status)}>
                        {selectedItem.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">Price</Label>
                      <span className="text-lg font-semibold">₹{Number(selectedItem.price || 0).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">Preparation Time</Label>
                      <span className="text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {selectedItem.preparation_time} min
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">Restaurant</Label>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="/api/placeholder/32/32" alt={selectedItem.restaurant_name} />
                          <AvatarFallback className="text-xs">{selectedItem.restaurant_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{selectedItem.restaurant_name}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dietary Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Dietary Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">Calories</Label>
                      <span className="text-sm">{selectedItem.calories} cal</span>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Dietary Options</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedItem.is_vegetarian && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Vegetarian
                          </Badge>
                        )}
                        {selectedItem.is_vegan && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Vegan
                          </Badge>
                        )}
                        {selectedItem.is_gluten_free && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            Gluten Free
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Allergens</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedItem.allergens?.map((allergen: string) => (
                          <Badge key={allergen} variant="outline" className="bg-red-50 text-red-700">
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Ingredients and Performance */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Ingredients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedItem.ingredients?.map((ingredient: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 py-1">
                          <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                          <span className="text-sm">{ingredient}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-2xl font-bold">{selectedItem.average_rating || 0}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Customer Rating</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{selectedItem.total_orders || 0}</p>
                        <p className="text-xs text-muted-foreground">Total Orders</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                <Edit className="w-4 h-4 mr-2" />
                Edit Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Menu Item
            </DialogTitle>
            <DialogDescription>
              Create a new menu item for your restaurant
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Input Method Selection */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={!showJsonInputInAdd ? "default" : "outline"}
                size="sm"
                onClick={() => setShowJsonInputInAdd(false)}
              >
                Form Input
              </Button>
              <Button
                type="button"
                variant={showJsonInputInAdd ? "default" : "outline"}
                size="sm"
                onClick={() => setShowJsonInputInAdd(true)}
              >
                JSON Input
              </Button>
            </div>

            {showJsonInputInAdd ? (
              <>
                {/* JSON Input */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">JSON Data</Label>
                  <Textarea
                    placeholder={`Paste JSON data for a single menu item:
{
  "name": "Margherita Pizza",
  "description": "Classic pizza with tomato sauce and mozzarella",
  "price": 12.99,
  "category": "Pizza",
  "preparationTime": 15,
  "calories": 280,
  "ingredients": ["Tomato sauce", "Mozzarella", "Basil"],
  "allergens": ["Gluten", "Dairy"],
  "isVegetarian": true,
  "isVegan": false,
  "isGlutenFree": false,
  "imageUrl": "https://example.com/pizza.jpg"
}`}
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    onClick={handleJsonInputInAdd}
                    disabled={!jsonInput.trim()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Load JSON Data to Form
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Regular Form Fields */}
            {/* Image Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Item Image</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  {(newItem.imageFile || newItem.imageUrl) ? (
                    <Avatar className="w-full h-full rounded-lg">
                      <AvatarImage 
                        src={newItem.imageFile ? URL.createObjectURL(newItem.imageFile) : newItem.imageUrl || ""} 
                        alt="Preview" 
                        className="object-cover"
                      />
                      <AvatarFallback className="rounded-lg">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      Upload
                    </Button>
                    {(newItem.imageFile || newItem.imageUrl) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeImage}
                      >
                        <X className="w-4 h-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Or paste image URL"
                    value={newItem.imageUrl}
                    onChange={(e) => setNewItem({...newItem, imageUrl: e.target.value, imageFile: null})}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Margherita Pizza"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newItem.price}
                  onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your dish..."
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={newItem.categoryId} onValueChange={(value: string) => setNewItem({...newItem, categoryId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="restaurant">Restaurant</Label>
                <Select value={newItem.restaurantId} onValueChange={(value: string) => setNewItem({...newItem, restaurantId: value})}>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prepTime">Prep Time (min)</Label>
                <Input
                  id="prepTime"
                  type="number"
                  placeholder="15"
                  value={newItem.preparationTime}
                  onChange={(e) => setNewItem({...newItem, preparationTime: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="250"
                  value={newItem.calories}
                  onChange={(e) => setNewItem({...newItem, calories: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingredients</Label>
              <Textarea
                id="ingredients"
                placeholder="Tomato, Cheese, Basil (comma separated)"
                value={newItem.ingredients}
                onChange={(e) => setNewItem({...newItem, ingredients: e.target.value})}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergens">Allergens</Label>
              <Input
                id="allergens"
                placeholder="Gluten, Dairy (comma separated)"
                value={newItem.allergens}
                onChange={(e) => setNewItem({...newItem, allergens: e.target.value})}
              />
            </div>

            {/* Dietary Options */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Dietary Options</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vegetarian"
                    checked={newItem.isVegetarian}
                    onCheckedChange={(checked: boolean) => setNewItem({...newItem, isVegetarian: !!checked})}
                  />
                  <Label htmlFor="vegetarian" className="text-sm">Vegetarian</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vegan"
                    checked={newItem.isVegan}
                    onCheckedChange={(checked: boolean) => setNewItem({...newItem, isVegan: !!checked})}
                  />
                  <Label htmlFor="vegan" className="text-sm">Vegan</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="glutenFree"
                    checked={newItem.isGlutenFree}
                    onCheckedChange={(checked: boolean) => setNewItem({...newItem, isGlutenFree: !!checked})}
                  />
                  <Label htmlFor="glutenFree" className="text-sm">Gluten Free</Label>
                </div>
              </div>
            </div>
              </>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddDialog(false);
                setJsonInput('');
                setShowJsonInputInAdd(false);
              }}
            >
              Cancel
            </Button>
            {!showJsonInputInAdd && (
              <Button 
                onClick={handleAddItem} 
                disabled={isSaving || isUploading || !newItem.name || !newItem.price || !newItem.categoryId}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Menu Item
            </DialogTitle>
            <DialogDescription>
              Update the menu item information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Item Image</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  {(newItem.imageFile || newItem.imageUrl) ? (
                    <Avatar className="w-full h-full rounded-lg">
                      <AvatarImage 
                        src={newItem.imageFile ? URL.createObjectURL(newItem.imageFile) : newItem.imageUrl || ""} 
                        alt="Preview" 
                        className="object-cover"
                      />
                      <AvatarFallback className="rounded-lg">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      Upload
                    </Button>
                    {(newItem.imageFile || newItem.imageUrl) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeImage}
                      >
                        <X className="w-4 h-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Or paste image URL"
                    value={newItem.imageUrl}
                    onChange={(e) => setNewItem({...newItem, imageUrl: e.target.value, imageFile: null})}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Item Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., Margherita Pizza"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (₹) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newItem.price}
                  onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Describe your dish..."
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select value={newItem.categoryId} onValueChange={(value: string) => setNewItem({...newItem, categoryId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-restaurant">Restaurant</Label>
                <Select value={newItem.restaurantId} onValueChange={(value: string) => setNewItem({...newItem, restaurantId: value})}>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-prepTime">Prep Time (min)</Label>
                <Input
                  id="edit-prepTime"
                  type="number"
                  placeholder="15"
                  value={newItem.preparationTime}
                  onChange={(e) => setNewItem({...newItem, preparationTime: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-calories">Calories</Label>
                <Input
                  id="edit-calories"
                  type="number"
                  placeholder="250"
                  value={newItem.calories}
                  onChange={(e) => setNewItem({...newItem, calories: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-ingredients">Ingredients</Label>
              <Textarea
                id="edit-ingredients"
                placeholder="Tomato, Cheese, Basil (comma separated)"
                value={newItem.ingredients}
                onChange={(e) => setNewItem({...newItem, ingredients: e.target.value})}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-allergens">Allergens</Label>
              <Input
                id="edit-allergens"
                placeholder="Gluten, Dairy (comma separated)"
                value={newItem.allergens}
                onChange={(e) => setNewItem({...newItem, allergens: e.target.value})}
              />
            </div>

            {/* Dietary Options */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Dietary Options</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-vegetarian"
                    checked={newItem.isVegetarian}
                    onCheckedChange={(checked: boolean) => setNewItem({...newItem, isVegetarian: !!checked})}
                  />
                  <Label htmlFor="edit-vegetarian" className="text-sm">Vegetarian</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-vegan"
                    checked={newItem.isVegan}
                    onCheckedChange={(checked: boolean) => setNewItem({...newItem, isVegan: !!checked})}
                  />
                  <Label htmlFor="edit-vegan" className="text-sm">Vegan</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-glutenFree"
                    checked={newItem.isGlutenFree}
                    onCheckedChange={(checked: boolean) => setNewItem({...newItem, isGlutenFree: !!checked})}
                  />
                  <Label htmlFor="edit-glutenFree" className="text-sm">Gluten Free</Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowEditDialog(false);
                setEditingItem(null);
                setNewItem({
                  name: "",
                  description: "",
                  price: "",
                  categoryId: "",
                  preparationTime: "",
                  calories: "",
                  ingredients: "",
                  allergens: "",
                  isVegetarian: false,
                  isVegan: false,
                  isGlutenFree: false,
                  restaurantId: restaurants.length > 0 ? restaurants[0].id : "",
                  imageUrl: "",
                  imageFile: null
                });
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateItem} 
              disabled={isSaving || isUploading || !newItem.name || !newItem.price || !newItem.categoryId}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Item
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={showBulkImportDialog} onOpenChange={setShowBulkImportDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Bulk Import Menu Items
            </DialogTitle>
            <DialogDescription>
              Import multiple menu items from Excel (.xlsx), CSV (.csv), or JSON (.json) files
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Import Method Selection */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={!showJsonInput ? "default" : "outline"}
                size="sm"
                onClick={() => setShowJsonInput(false)}
              >
                File Upload
              </Button>
              <Button
                type="button"
                variant={showJsonInput ? "default" : "outline"}
                size="sm"
                onClick={() => setShowJsonInput(true)}
              >
                JSON Input
              </Button>
            </div>

            {!showJsonInput ? (
              <>
                {/* File Upload */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Select File</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-3">
                      Choose an Excel (.xlsx), CSV (.csv), or JSON (.json) file
                    </p>
                    <input
                      ref={bulkFileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv,.json"
                      onChange={handleBulkImportFile}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => bulkFileInputRef.current?.click()}
                      disabled={isBulkImporting}
                    >
                      {isBulkImporting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* JSON Input */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">JSON Data</Label>
                  <Textarea
                    placeholder={`Paste your JSON data here. Example:
[
  {
    "name": "Margherita Pizza",
    "description": "Classic pizza with tomato sauce and mozzarella",
    "price": 12.99,
    "category": "Pizza",
    "preparationTime": 15,
    "calories": 280,
    "ingredients": ["Tomato sauce", "Mozzarella", "Basil"],
    "allergens": ["Gluten", "Dairy"],
    "isVegetarian": true,
    "isVegan": false,
    "isGlutenFree": false,
    "imageUrl": "https://example.com/pizza.jpg"
  }
]`}
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    onClick={handleJsonInputSubmit}
                    disabled={isBulkImporting || !jsonInput.trim()}
                    className="w-full"
                  >
                    {isBulkImporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Import JSON Data
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            {/* Template Download */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Need a template?</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Download our sample templates to see the required format and field names.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => downloadSampleTemplate('excel')}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Excel Template
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => downloadSampleTemplate('json')}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      JSON Template
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Required Fields Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Required Fields:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>• name (required)</div>
                <div>• price (required)</div>
                <div>• category</div>
                <div>• description</div>
                <div>• preparationTime</div>
                <div>• calories</div>
                <div>• ingredients (array)</div>
                <div>• allergens (array)</div>
                <div>• isVegetarian (boolean)</div>
                <div>• isVegan (boolean)</div>
                <div>• isGlutenFree (boolean)</div>
                <div>• imageUrl</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Note: For CSV/Excel, use comma-separated values for ingredients and allergens
              </p>
            </div>

            {/* Import Results */}
            {bulkImportResults && (
              <Alert className={bulkImportResults.errors.length > 0 ? "border-yellow-200 bg-yellow-50" : "border-green-200 bg-green-50"}>
                <CheckCircle className={`w-4 h-4 ${bulkImportResults.errors.length > 0 ? "text-yellow-600" : "text-green-600"}`} />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">
                      Import completed: {bulkImportResults.created} items created successfully
                    </p>
                    {bulkImportResults.errors.length > 0 && (
                      <div>
                        <p className="text-sm text-yellow-700 mb-1">
                          {bulkImportResults.errors.length} items had errors:
                        </p>
                        <div className="max-h-20 overflow-y-auto text-xs text-yellow-600">
                          {bulkImportResults.errors.map((error, index) => (
                            <div key={index}>• {error.message || 'Unknown error'}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowBulkImportDialog(false);
                setBulkImportResults(null);
                setJsonInput('');
                setShowJsonInput(false);
              }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog open={showBulkEditDialog} onOpenChange={setShowBulkEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Bulk Edit Menu Items
            </DialogTitle>
            <DialogDescription>
              Edit {selectedItems.length} selected items. Only fill in the fields you want to update.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="bulk-category">Category</Label>
              <Select
                value={bulkEditData.categoryId}
                onValueChange={(value) => setBulkEditData(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-change">No change</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="bulk-price">Price</Label>
              <Input
                id="bulk-price"
                type="number"
                step="0.01"
                placeholder="Leave empty for no change"
                value={bulkEditData.price}
                onChange={(e) => setBulkEditData(prev => ({ ...prev, price: e.target.value }))}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="bulk-status">Status</Label>
              <Select
                value={bulkEditData.status}
                onValueChange={(value) => setBulkEditData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-change">No change</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dietary Options */}
            <div className="space-y-3">
              <Label>Dietary Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bulk-vegetarian"
                    checked={bulkEditData.isVegetarian === true}
                    onCheckedChange={(checked) => 
                      setBulkEditData(prev => ({ 
                        ...prev, 
                        isVegetarian: checked ? true : null 
                      }))
                    }
                  />
                  <Label htmlFor="bulk-vegetarian" className="text-sm">
                    Set as Vegetarian
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bulk-vegan"
                    checked={bulkEditData.isVegan === true}
                    onCheckedChange={(checked) => 
                      setBulkEditData(prev => ({ 
                        ...prev, 
                        isVegan: checked ? true : null 
                      }))
                    }
                  />
                  <Label htmlFor="bulk-vegan" className="text-sm">
                    Set as Vegan
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bulk-gluten-free"
                    checked={bulkEditData.isGlutenFree === true}
                    onCheckedChange={(checked) => 
                      setBulkEditData(prev => ({ 
                        ...prev, 
                        isGlutenFree: checked ? true : null 
                      }))
                    }
                  />
                  <Label htmlFor="bulk-gluten-free" className="text-sm">
                    Set as Gluten Free
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowBulkEditDialog(false);
                setBulkEditData({
                  categoryId: "",
                  price: "",
                  isVegetarian: null,
                  isVegan: null,
                  isGlutenFree: null,
                  status: ""
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkEdit}
              disabled={isBulkEditing}
            >
              {isBulkEditing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Update {selectedItems.length} Items
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        </>
      )}
    </DashboardLayout>
  );
}