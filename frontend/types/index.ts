// Product types
export type ProductType = 'photo_print';

export interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  product_type: ProductType;
  thumbnail?: string;
  mockup_image?: string;
  config?: ProductConfig;
  is_active: boolean;
  created_at: string;
}

export interface PhotoPrintProduct extends Product {
  product_type: 'photo_print';
  photo_variants: PhotoPrintVariant[];
}

export interface ProductConfig {
  canvas_width: number;
  canvas_height: number;
  print_area?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface PhotoPrintVariant {
  id: string;
  size: string;
  stock_quantity: number;
  price_adjustment: number;
  total_price: number;
  is_active: boolean;
}

// Design types
export interface CustomDesign {
  id: string;
  product: string;
  design_config: FabricCanvasData;
  preview_image?: string;
  preview_image_url?: string;
  created_at: string;
}

export interface FabricCanvasData {
  version: string;
  objects: FabricObject[];
  background?: string;
}

export interface FabricObject {
  type: string;
  left: number;
  top: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  fill?: string;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  src?: string;
  [key: string]: unknown;
}

// Cart types
export interface CartItem {
  id: string;
  product: Product;
  variant?: PhotoPrintVariant;
  design?: CustomDesign;
  quantity: number;
  unit_price: number;
  total_price: number;
  customerPhotos?: string[]; // Data URLs of uploaded photos
}

export interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

// Order types
export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  stripe_payment_intent_id?: string;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  product_type: ProductType;
  variant_id?: string;
  design_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  design_preview_url?: string;
}

// Clipart library
export interface ClipartItem {
  id: string;
  name: string;
  svg: string;
  category: string;
}
