// Upload API Service

import { api, ApiResponse } from './api';

export interface UploadResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

export const uploadApi = {
  // Upload menu item image
  menuItem: async (file: File) => {
    return api.upload<ApiResponse<UploadResponse>>('/upload/menu-item', file);
  },

  // Upload restaurant logo
  restaurantLogo: async (file: File) => {
    return api.upload<ApiResponse<UploadResponse>>('/upload/restaurant/logo', file);
  },

  // Upload restaurant cover
  restaurantCover: async (file: File) => {
    return api.upload<ApiResponse<UploadResponse>>('/upload/restaurant/cover', file);
  },

  // Upload user avatar
  avatar: async (file: File) => {
    return api.upload<ApiResponse<UploadResponse>>('/upload/avatar', file);
  },

  // Upload review images (multiple)
  reviewImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/review`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data;
  },

  // Delete image
  delete: async (publicId: string) => {
    return api.delete<ApiResponse<void>>(`/upload/image`, { publicId } as any);
  },
};
