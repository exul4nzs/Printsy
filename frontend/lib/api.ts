import axios from 'axios';
import { Product, PhotoPrintVariant, CustomDesign, Order } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const getProducts = async (type?: string): Promise<Product[]> => {
  const params = type ? { type } : {};
  const response = await api.get('/products/', { params });
  // Handle both paginated (results) and non-paginated responses
  const data = response.data;
  return Array.isArray(data) ? data : (data.results || []);
};

export const getProduct = async (id: string): Promise<Product> => {
  const response = await api.get(`/products/${id}/`);
  return response.data;
};

export const getProductVariants = async (id: string): Promise<PhotoPrintVariant[]> => {
  const response = await api.get(`/products/${id}/variants/`);
  return response.data;
};

// Designs API
export const saveDesign = async (
  productId: string,
  designConfig: unknown,
  previewImage?: File
): Promise<CustomDesign> => {
  const formData = new FormData();
  formData.append('product', productId);
  formData.append('design_config', JSON.stringify(designConfig));
  if (previewImage) {
    formData.append('preview_image', previewImage);
  }
  
  const response = await api.post('/designs/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getDesign = async (id: string): Promise<CustomDesign> => {
  const response = await api.get(`/designs/${id}/`);
  return response.data;
};

// Orders API
export interface CreateOrderResponse {
  order: Order;
  payment_info: {
    method: string;
    gcash_number: string;
    gcash_name: string;
    amount: string;
    reference: string;
  };
  // Fallback fields if response shape differs
  id?: string;
}

export const createOrder = async (orderData: Partial<Order>): Promise<CreateOrderResponse> => {
  const response = await api.post('/orders/', orderData);
  return response.data;
};

export default api;
