"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Clock,
  User,
  MapPin,
  DollarSign,
  ChefHat,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Eye
} from "lucide-react";

interface OrderItem {
  name: string;
  quantity?: number;
}

interface TableOrder {
  tableNumber: string;
  status: 'preparing' | 'ready' | 'served' | 'pending' | 'completed';
  customerName: string;
  customerInitials?: string;
  customerAvatar?: string;
  orderTime: string;
  items: OrderItem[];
  totalAmount: number;
  estimatedTime?: number;
  additionalItemsCount?: number;
}

interface TableOrderCardProps {
  order: TableOrder;
  onViewDetails?: () => void;
  onUpdateStatus?: (status: string) => void;
  onMoreActions?: () => void;
}

const statusConfig = {
  pending: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    label: 'Pending'
  },
  preparing: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: ChefHat,
    label: 'Preparing'
  },
  ready: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    label: 'Ready'
  },
  served: {
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: CheckCircle,
    label: 'Served'
  },
  completed: {
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: CheckCircle,
    label: 'Completed'
  }
};

export function TableOrderCard({ 
  order, 
  onViewDetails, 
  onUpdateStatus, 
  onMoreActions 
}: TableOrderCardProps) {
  const statusInfo = statusConfig[order.status];
  const StatusIcon = statusInfo.icon;

  const displayItems = order.items.slice(0, 2);
  const hasMoreItems = order.items.length > 2 || order.additionalItemsCount;
  const moreItemsCount = order.additionalItemsCount || (order.items.length - 2);

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {/* Table Number */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-semibold text-sm">
              Table {order.tableNumber}
            </div>
            <Badge className={`${statusInfo.color} border`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={onViewDetails}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View Details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={onMoreActions}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>More Actions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Customer Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={order.customerAvatar} alt={order.customerName} />
            <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
              {order.customerInitials || order.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-gray-400" />
              <span className="font-medium text-sm truncate">{order.customerName}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{order.orderTime}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Order Items */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Order Items
          </div>
          <div className="space-y-1">
            {displayItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 truncate">
                  {item.quantity && item.quantity > 1 ? `${item.quantity}x ` : ''}{item.name}
                </span>
              </div>
            ))}
            {hasMoreItems && (
              <div className="text-xs text-gray-500 font-medium">
                +{moreItemsCount} more item{moreItemsCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Order Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm">
              <DollarSign className="w-3 h-3 text-gray-400" />
              <span className="font-semibold text-gray-900">
                ₹{order.totalAmount.toFixed(2)}
              </span>
            </div>
            
            {order.estimatedTime && (
              <div className="flex items-center gap-1 text-sm text-orange-600">
                <Clock className="w-3 h-3" />
                <span className="font-medium">{order.estimatedTime} min</span>
              </div>
            )}
          </div>

          {/* Quick Status Update */}
          {order.status === 'preparing' && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus?.('ready')}
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 h-7"
            >
              Mark Ready
            </Button>
          )}
          
          {order.status === 'ready' && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus?.('served')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-7"
            >
              Mark Served
            </Button>
          )}

          {order.status === 'pending' && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus?.('preparing')}
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1 h-7"
            >
              Start Preparing
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Example usage component
export function TableOrderExample() {
  const sampleOrder: TableOrder = {
    tableNumber: "5",
    status: "preparing",
    customerName: "John Smith",
    customerInitials: "JS",
    orderTime: "14:30",
    items: [
      { name: "Margherita Pizza" },
      { name: "Caesar Salad" }
    ],
    totalAmount: 32.50,
    estimatedTime: 15,
    additionalItemsCount: 1
  };

  return (
    <div className="p-4 max-w-md">
      <TableOrderCard
        order={sampleOrder}
        onViewDetails={() => console.log('View details')}
        onUpdateStatus={(status) => console.log('Update status:', status)}
        onMoreActions={() => console.log('More actions')}
      />
    </div>
  );
}