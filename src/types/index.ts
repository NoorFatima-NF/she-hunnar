export type UserRole = 'customer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  sellerShopId?: string;
  addresses?: Address[];
  createdAt: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface SellerProfile {
  id: string;
  userId: string;
  shopName: string;
  slug: string;
  specialization: string;
  about: string;
  location: string;
  logo: string;
  banner: string;
  rating: number;
  reviewCount: number;
  productCount: number;
  completedOrders: number;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  verificationDocsUploaded?: boolean;
  sellerType?: 'individual' | 'business';
  cnicNumber?: string;
  cnicName?: string;
  cnicFrontUrl?: string;
  cnicBackUrl?: string;
  bankTitle?: string;
  pickupAddress?: string;
  commissionRate: number; // e.g. 10 = 10%
  shippingFee: number; // PKR
  freeShippingThreshold?: number; // PKR
  payoutMethod: string; // Bank account, JazzCash, Easypaisa info
  accountDetails: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
  createdAt: string;
}

export type JewelryCategory = string;

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Silver / Size 7" or "Chain Length: 18 inch"
  price: number; // PKR
  stock: number;
  sku: string;
}

export interface CustomizationOption {
  allowText?: boolean; // e.g., Name / Initials
  textLabel?: string;
  maxCharacters?: number;
  allowFontSelection?: boolean;
  fonts?: string[];
  allowStoneSelection?: boolean;
  stones?: string[];
  allowReferenceUpload?: boolean;
  allowNote?: boolean;
  noteLabel?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  sellerId: string;
  sellerShopName: string;
  sellerLogo: string;
  category: JewelryCategory;
  material: string; // e.g. "925 Sterling Silver", "Polymer Clay", "Freshwater Pearl"
  metalType?: string;
  stoneType?: string;
  color: string;
  occasion?: string;
  shortDescription: string;
  fullDescription: string;
  price: number; // PKR
  originalPrice?: number; // PKR
  stock: number;
  sku: string;
  images: string[];
  videoUrl?: string;
  rating: number;
  reviewCount: number;
  salesCount: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  isCustomizable?: boolean;
  customizationConfig?: CustomizationOption;
  variants?: ProductVariant[];
  careInstructions?: string;
  handmadeProcess?: string;
  productionTimeDays: number;
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'out_of_stock';
  createdAt: string;
}

export interface CustomizationInput {
  customText?: string;
  selectedFont?: string;
  selectedStone?: string;
  customNote?: string;
  referenceImageName?: string;
}

export interface CartItem {
  id: string; // Unique cart item ID
  productId: string;
  sellerId: string;
  sellerShopName: string;
  productTitle: string;
  productImage: string;
  category: JewelryCategory;
  price: number; // PKR
  originalPrice?: number;
  quantity: number;
  selectedVariant?: ProductVariant;
  customization?: CustomizationInput;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Ready to Ship'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Return Requested'
  | 'Returned'
  | 'Refunded';

export interface SellerOrderItem {
  id?: string;
  productId: string;
  productTitle: string;
  productImage: string;
  price: number;
  quantity: number;
  variantName?: string;
  customization?: CustomizationInput;
}

export interface SellerOrder {
  id: string; // Sub-order ID e.g., SO-1002-A
  subOrderId?: string;
  masterOrderId: string;
  sellerId: string;
  sellerShopName: string;
  items: SellerOrderItem[];
  subtotal: number; // PKR
  shippingFee: number; // PKR
  total: number; // PKR
  totalAmount?: number;
  status: OrderStatus;
  trackingNumber?: string;
  trackingCode?: string;
  courierName?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export type SubOrder = SellerOrder;

export interface MasterOrder {
  id: string; // e.g. ORD-89201
  masterOrderId?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  shippingAddress: Address;
  paymentMethod: 'COD' | 'Bank Transfer' | 'Easypaisa' | 'JazzCash' | 'Online Card';
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  paymentProofUrl?: string; // For manual bank transfer / easypaisa proof
  totalItems: number;
  subtotal: number; // PKR
  discountAmount: number; // PKR
  totalShipping: number; // PKR
  grandTotal: number; // PKR
  couponCode?: string;
  sellerOrders: SellerOrder[];
  subOrders?: SellerOrder[];
  masterStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  productTitle: string;
  customerId: string;
  customerName: string;
  rating: number; // 1-5
  reviewText: string;
  date: string;
  verifiedPurchase: boolean;
  images?: string[];
  sellerReply?: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g., 15 for 15% or 500 for PKR 500
  minSpend: number; // PKR
  maxDiscount?: number; // PKR
  expiryDate: string;
  active: boolean;
  applicableSellerId?: string; // If specific to a seller
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  customerId: string;
  customerName: string;
  sellerId: string;
  sellerShopName: string;
  senderRole: 'customer' | 'seller';
  text: string;
  attachmentUrl?: string;
  timestamp: string;
  read: boolean;
}

export interface NotificationItem {
  id: string;
  targetRole: 'customer' | 'seller' | 'admin';
  targetUserId?: string;
  targetSellerId?: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface SellerPayout {
  id: string;
  sellerId: string;
  sellerShopName: string;
  amount: number; // PKR
  period: string;
  status: 'Pending' | 'Approved' | 'Paid';
  requestedAt: string;
  paidAt?: string;
  payoutMethod: string;
}

export interface ReturnRequest {
  id: string;
  masterOrderId: string;
  sellerOrderId: string;
  sellerId: string;
  customerId: string;
  customerName: string;
  productId: string;
  productTitle: string;
  reason: string;
  description: string;
  status: 'Requested' | 'Under Review' | 'Approved' | 'Rejected' | 'Refunded';
  images?: string[];
  requestedAt: string;
}

export interface CustomJewelryRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  jewelryType: JewelryCategory;
  budgetPKR: number;
  preferredMaterial: string;
  description: string;
  preferredSellerId?: string;
  status: 'Submitted' | 'In Review' | 'Quoted' | 'In Production' | 'Completed';
  createdAt: string;
}
