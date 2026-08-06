import React, { createContext, useContext, useState, useEffect } from 'react';
import { isProductInCategory } from '../utils/categoryUtils';
import {
  UserRole,
  User,
  SellerProfile,
  Product,
  CartItem,
  WishlistItem,
  MasterOrder,
  ProductReview,
  Coupon,
  DirectMessage,
  NotificationItem,
  SellerPayout,
  CustomJewelryRequest,
  OrderStatus,
  JewelryCategory,
  CustomizationInput
} from '../types';

import {
  DEMO_SELLERS,
  DEMO_PRODUCTS,
  DEMO_REVIEWS,
  DEMO_COUPONS,
  DEMO_ORDERS,
  DEMO_MESSAGES,
  DEMO_NOTIFICATIONS,
  DEMO_PAYOUTS,
  DEMO_CUSTOM_REQUESTS,
  JEWELRY_CATEGORIES
} from '../data/mockData';

interface MarketplaceContextType {
  // Role & Current User State
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  activeSellerShopId: string;
  setActiveSellerShopId: (id: string) => void;
  currentSellerShop: SellerProfile | undefined;

  // Data Collections
  sellers: SellerProfile[];
  products: Product[];
  categories: typeof JEWELRY_CATEGORIES;
  cart: CartItem[];
  wishlist: WishlistItem[];
  orders: MasterOrder[];
  reviews: ProductReview[];
  coupons: Coupon[];
  messages: DirectMessage[];
  notifications: NotificationItem[];
  payouts: SellerPayout[];
  customRequests: CustomJewelryRequest[];
  platformCommission: number;
  announcementText: string;

  // Navigation & Search State
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: JewelryCategory | 'All';
  setSelectedCategory: (cat: JewelryCategory | 'All') => void;

  // Cart Actions
  addToCart: (product: Product, quantity: number, selectedVariantId?: string, customization?: CustomizationInput) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, qty: number) => void;
  clearCart: () => void;
  getCartGroupedBySeller: () => { sellerId: string; sellerShopName: string; shippingFee: number; freeShippingThreshold?: number; items: CartItem[]; subtotal: number }[];

  // Wishlist Actions
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Order Placement & Management
  placeOrder: (orderDetails: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    addressLine: string;
    city: string;
    province: string;
    postalCode: string;
    paymentMethod: 'COD' | 'Bank Transfer' | 'Easypaisa' | 'JazzCash' | 'Online Card';
    paymentProofUrl?: string;
    couponCode?: string;
  }) => MasterOrder;
  updateSellerOrderStatus: (sellerOrderId: string, status: OrderStatus, trackingNumber?: string, courierName?: string) => void;

  // Seller Management
  submitSellerApplication: (appData: Omit<SellerProfile, 'id' | 'rating' | 'reviewCount' | 'productCount' | 'completedOrders' | 'verificationStatus' | 'createdAt'>) => void;
  approveSeller: (sellerId: string) => void;
  rejectSeller: (sellerId: string) => void;
  suspendSeller: (sellerId: string) => void;
  updateSellerProfile: (sellerId: string, updates: Partial<SellerProfile>) => void;
  requestSellerPayout: (sellerId: string, amount: number, method: string) => void;

  // Product Management
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'salesCount' | 'createdAt'>) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  approveProduct: (productId: string) => void;
  rejectProduct: (productId: string) => void;
  toggleProductFeature: (productId: string) => void;
  toggleProductBestseller: (productId: string) => void;

  // Review & Messaging Actions
  addReview: (review: Omit<ProductReview, 'id' | 'date'>) => void;
  sendMessage: (sellerId: string, text: string) => void;
  markNotificationsRead: () => void;

  // Custom Jewelry Request
  submitCustomRequest: (req: Omit<CustomJewelryRequest, 'id' | 'createdAt' | 'status'>) => void;

  // Admin Actions
  updatePlatformCommission: (rate: number) => void;
  updateAnnouncementText: (text: string) => void;
  processPayout: (payoutId: string, status: 'Approved' | 'Paid') => void;
  addCoupon: (coupon: Coupon) => void;
  toggleCouponActive: (code: string) => void;

  // User Authentication & Registration
  loginUser: (email: string, password?: string) => { success: boolean; message: string };
  registerUser: (name: string, email: string, phone: string, city: string, password?: string) => { success: boolean; message: string };
  logoutUser: () => void;

  // Toast System
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'zaveri_marketplace_state_v1';

const sanitizeUniqueProducts = (items: Product[]): Product[] => {
  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  const unique: Product[] = [];
  for (const item of items) {
    if (!item || !item.id) continue;
    const cleanTitle = item.title ? item.title.trim().toLowerCase() : item.id;
    if (!seenIds.has(item.id) && !seenTitles.has(cleanTitle)) {
      seenIds.add(item.id);
      seenTitles.add(cleanTitle);
      unique.push(item);
    }
  }
  return unique;
};

const INITIAL_REGISTERED_USERS: User[] = [
  {
    id: 'c-demo-1',
    name: 'Sana Malik',
    email: 'sana.malik@example.com',
    password: 'password123',
    phone: '+92 300 1234567',
    role: 'customer',
    addresses: [],
    createdAt: '2025-01-01'
  },
  {
    id: 'c-demo-2',
    name: 'Fatima Noor',
    email: 'fatima@shehunnar.pk',
    password: 'password123',
    phone: '+92 321 7654321',
    role: 'customer',
    addresses: [],
    createdAt: '2025-01-01'
  }
];

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or fallback to initial defaults
  const [activeRole, setActiveRole] = useState<UserRole>('customer');
  const [activeSellerShopId, setActiveSellerShopId] = useState<string>('s-1'); // Default Noor Jewelry Studio

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(INITIAL_REGISTERED_USERS);

  const [sellers, setSellers] = useState<SellerProfile[]>(DEMO_SELLERS);
  const [products, setProducts] = useState<Product[]>(() => sanitizeUniqueProducts(DEMO_PRODUCTS));
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [orders, setOrders] = useState<MasterOrder[]>(DEMO_ORDERS);
  const [reviews, setReviews] = useState<ProductReview[]>(DEMO_REVIEWS);
  const [coupons, setCoupons] = useState<Coupon[]>(DEMO_COUPONS);
  const [messages, setMessages] = useState<DirectMessage[]>(DEMO_MESSAGES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEMO_NOTIFICATIONS);
  const [payouts, setPayouts] = useState<SellerPayout[]>(DEMO_PAYOUTS);
  const [customRequests, setCustomRequests] = useState<CustomJewelryRequest[]>(DEMO_CUSTOM_REQUESTS);
  const [platformCommission, setPlatformCommission] = useState<number>(10);
  const [announcementText, setAnnouncementText] = useState<string>(
    '✨ Handcrafted Jewelry Gala: Free Express Delivery Across Pakistan on Orders over PKR 4,000! ✨'
  );

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<JewelryCategory | 'All'>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Hydrate from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentUser) setCurrentUser(parsed.currentUser);
        if (parsed.registeredUsers && Array.isArray(parsed.registeredUsers)) {
          const demoEmails = new Set(INITIAL_REGISTERED_USERS.map((u) => u.email.toLowerCase()));
          const userDefined = parsed.registeredUsers.filter((u: User) => !demoEmails.has(u.email.toLowerCase()));
          setRegisteredUsers([...INITIAL_REGISTERED_USERS, ...userDefined]);
        }
        if (parsed.sellers) setSellers(parsed.sellers);
        if (parsed.products && Array.isArray(parsed.products)) {
          // Merge and ensure demo products get updated categories and images from DEMO_PRODUCTS
          const demoMap = new Map(DEMO_PRODUCTS.map((p) => [p.id, p]));
          const updatedParsed = parsed.products.map((p: Product) => {
            if (demoMap.has(p.id)) {
              const demo = demoMap.get(p.id)!;
              return {
                ...p,
                title: demo.title,
                category: demo.category,
                shortDescription: demo.shortDescription,
                fullDescription: demo.fullDescription,
                material: demo.material,
                metalType: demo.metalType,
                color: demo.color,
                occasion: demo.occasion,
                careInstructions: demo.careInstructions,
                handmadeProcess: demo.handmadeProcess,
                images: demo.images
              };
            }
            return p;
          });
          const savedIds = new Set(updatedParsed.map((p: Product) => p.id));
          const missingDemoProducts = DEMO_PRODUCTS.filter((p) => !savedIds.has(p.id));
          const merged = [...updatedParsed, ...missingDemoProducts];
          setProducts(sanitizeUniqueProducts(merged));
        } else {
          setProducts(sanitizeUniqueProducts(DEMO_PRODUCTS));
        }
        if (parsed.cart) setCart(parsed.cart);
        if (parsed.wishlist) setWishlist(parsed.wishlist);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.reviews) setReviews(parsed.reviews);
        if (parsed.coupons) setCoupons(parsed.coupons);
        if (parsed.messages) setMessages(parsed.messages);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.payouts) setPayouts(parsed.payouts);
        if (parsed.customRequests) setCustomRequests(parsed.customRequests);
        if (parsed.platformCommission) setPlatformCommission(parsed.platformCommission);
        if (parsed.announcementText) setAnnouncementText(parsed.announcementText);
      }
    } catch (e) {
      console.warn('Failed to load marketplace local state', e);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      const stateToSave = {
        currentUser,
        registeredUsers,
        sellers,
        products: sanitizeUniqueProducts(products),
        cart,
        wishlist,
        orders,
        reviews,
        coupons,
        messages,
        notifications,
        payouts,
        customRequests,
        platformCommission,
        announcementText
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Failed to persist marketplace local state', e);
    }
  }, [
    currentUser,
    registeredUsers,
    sellers,
    products,
    cart,
    wishlist,
    orders,
    reviews,
    coupons,
    messages,
    notifications,
    payouts,
    customRequests,
    platformCommission,
    announcementText
  ]);

  const currentSellerShop = sellers.find((s) => s.id === activeSellerShopId);

  // CART LOGIC
  const addToCart = (
    product: Product,
    quantity: number,
    selectedVariantId?: string,
    customization?: CustomizationInput
  ) => {
    if (product.stock <= 0) {
      showToast('Sorry, this handmade item is out of stock.');
      return;
    }

    const variant = selectedVariantId ? product.variants?.find((v) => v.id === selectedVariantId) : undefined;
    const finalPrice = variant ? variant.price : product.price;

    setCart((prev) => {
      // Check if exact same item variant + customization exists
      const existingIndex = prev.findIndex(
        (ci) =>
          ci.productId === product.id &&
          ci.selectedVariant?.id === variant?.id &&
          JSON.stringify(ci.customization || {}) === JSON.stringify(customization || {})
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          productId: product.id,
          sellerId: product.sellerId,
          sellerShopName: product.sellerShopName,
          productTitle: product.title,
          productImage: product.images[0] || '',
          category: product.category,
          price: finalPrice,
          originalPrice: product.originalPrice,
          quantity,
          selectedVariant: variant,
          customization
        };
        return [...prev, newItem];
      }
    });

    showToast(`Added "${product.title}" to your cart!`);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.id !== cartItemId));
    showToast('Item removed from cart.');
  };

  const updateCartQuantity = (cartItemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((ci) => (ci.id === cartItemId ? { ...ci, quantity: qty } : ci))
    );
  };

  const clearCart = () => setCart([]);

  const getCartGroupedBySeller = () => {
    const map = new Map<
      string,
      {
        sellerId: string;
        sellerShopName: string;
        shippingFee: number;
        freeShippingThreshold?: number;
        items: CartItem[];
        subtotal: number;
      }
    >();

    cart.forEach((item) => {
      const seller = sellers.find((s) => s.id === item.sellerId);
      const shippingFee = seller ? seller.shippingFee : 200;
      const freeShippingThreshold = seller ? seller.freeShippingThreshold : undefined;

      if (!map.has(item.sellerId)) {
        map.set(item.sellerId, {
          sellerId: item.sellerId,
          sellerShopName: item.sellerShopName,
          shippingFee,
          freeShippingThreshold,
          items: [],
          subtotal: 0
        });
      }

      const group = map.get(item.sellerId)!;
      group.items.push(item);
      group.subtotal += item.price * item.quantity;
    });

    return Array.from(map.values()).map((group) => {
      // Calculate free shipping if threshold met
      if (group.freeShippingThreshold && group.subtotal >= group.freeShippingThreshold) {
        return { ...group, shippingFee: 0 };
      }
      return group;
    });
  };

  // WISHLIST LOGIC
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.some((w) => w.productId === productId);
      if (exists) {
        showToast('Removed from your Wishlist.');
        return prev.filter((w) => w.productId !== productId);
      } else {
        showToast('Saved to your Wishlist!');
        return [...prev, { productId, addedAt: new Date().toISOString() }];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.some((w) => w.productId === productId);

  // ORDER PLACEMENT
  const placeOrder = (orderDetails: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    addressLine: string;
    city: string;
    province: string;
    postalCode: string;
    paymentMethod: 'COD' | 'Bank Transfer' | 'Easypaisa' | 'JazzCash' | 'Online Card';
    paymentProofUrl?: string;
    couponCode?: string;
  }): MasterOrder => {
    const grouped = getCartGroupedBySeller();

    let subtotal = 0;
    let totalShipping = 0;

    grouped.forEach((group) => {
      subtotal += group.subtotal;
      totalShipping += group.shippingFee;
    });

    // Calculate coupon discount
    let discountAmount = 0;
    if (orderDetails.couponCode) {
      const coupon = coupons.find((c) => c.code.toUpperCase() === orderDetails.couponCode?.toUpperCase() && c.active);
      if (coupon && subtotal >= coupon.minSpend) {
        if (coupon.discountType === 'percentage') {
          discountAmount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
      }
    }

    const masterOrderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    // Create seller sub-orders
    const sellerOrders = grouped.map((group, idx) => {
      const sellerSubOrderId = `SO-${masterOrderId.replace('ORD-', '')}-${String.fromCharCode(65 + idx)}`;

      const sellerItems = group.items.map((item) => ({
        productId: item.productId,
        productTitle: item.productTitle,
        productImage: item.productImage,
        price: item.price,
        quantity: item.quantity,
        variantName: item.selectedVariant?.name,
        customization: item.customization
      }));

      return {
        id: sellerSubOrderId,
        masterOrderId,
        sellerId: group.sellerId,
        sellerShopName: group.sellerShopName,
        items: sellerItems,
        subtotal: group.subtotal,
        shippingFee: group.shippingFee,
        total: group.subtotal + group.shippingFee,
        status: 'Pending' as OrderStatus
      };
    });

    const grandTotal = Math.max(0, subtotal - discountAmount + totalShipping);

    const newMasterOrder: MasterOrder = {
      id: masterOrderId,
      customerId: currentUser?.id || `c-guest-${Date.now()}`,
      customerName: orderDetails.customerName,
      customerEmail: orderDetails.customerEmail,
      customerPhone: orderDetails.customerPhone,
      shippingAddress: {
        id: `addr-${Date.now()}`,
        fullName: orderDetails.customerName,
        phone: orderDetails.customerPhone,
        addressLine: orderDetails.addressLine,
        city: orderDetails.city,
        province: orderDetails.province,
        postalCode: orderDetails.postalCode
      },
      paymentMethod: orderDetails.paymentMethod,
      paymentStatus: orderDetails.paymentMethod === 'COD' ? 'Pending' : 'Paid',
      paymentProofUrl: orderDetails.paymentProofUrl,
      totalItems: cart.reduce((acc, c) => acc + c.quantity, 0),
      subtotal,
      discountAmount,
      totalShipping,
      grandTotal,
      couponCode: orderDetails.couponCode,
      sellerOrders,
      masterStatus: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Deduct stock for ordered items
    setProducts((prev) =>
      prev.map((p) => {
        const inCart = cart.find((c) => c.productId === p.id);
        if (inCart) {
          const newStock = Math.max(0, p.stock - inCart.quantity);
          return {
            ...p,
            stock: newStock,
            salesCount: p.salesCount + inCart.quantity,
            status: newStock === 0 ? 'out_of_stock' : p.status
          };
        }
        return p;
      })
    );

    // Update seller completed orders / stats
    setSellers((prev) =>
      prev.map((s) => {
        const subOrd = sellerOrders.find((so) => so.sellerId === s.id);
        if (subOrd) {
          return { ...s, completedOrders: s.completedOrders + 1 };
        }
        return s;
      })
    );

    // Add to Master Orders
    setOrders((prev) => [newMasterOrder, ...prev]);

    // Auto-sync currentUser account if guest placed order
    if (!currentUser) {
      setCurrentUser({
        id: newMasterOrder.customerId,
        name: orderDetails.customerName,
        email: orderDetails.customerEmail,
        phone: orderDetails.customerPhone,
        role: 'customer',
        addresses: [newMasterOrder.shippingAddress],
        createdAt: new Date().toISOString().split('T')[0]
      });
    }

    // Send notifications to sellers & customer
    sellerOrders.forEach((so) => {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}-${Math.random()}`,
        targetRole: 'seller',
        targetSellerId: so.sellerId,
        title: 'New Order Received!',
        message: `You have received Order ${so.id} worth PKR ${so.total.toLocaleString()} from ${orderDetails.customerName}.`,
        link: `/seller-dashboard/orders/${so.id}`,
        read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications((prev) => [notif, ...prev]);
    });

    clearCart();
    showToast(`Order #${masterOrderId} successfully placed! Thank you.`);
    return newMasterOrder;
  };

  const updateSellerOrderStatus = (
    sellerOrderId: string,
    status: OrderStatus,
    trackingNumber?: string,
    courierName?: string
  ) => {
    setOrders((prev) =>
      prev.map((mo) => {
        const hasSub = mo.sellerOrders.some((so) => so.id === sellerOrderId);
        if (!hasSub) return mo;

        const updatedSellerOrders = mo.sellerOrders.map((so) => {
          if (so.id === sellerOrderId) {
            return {
              ...so,
              status,
              trackingNumber: trackingNumber || so.trackingNumber,
              courierName: courierName || so.courierName,
              shippedAt: status === 'Shipped' ? new Date().toISOString().split('T')[0] : so.shippedAt,
              deliveredAt: status === 'Delivered' ? new Date().toISOString().split('T')[0] : so.deliveredAt
            };
          }
          return so;
        });

        // Determine master status based on all sub orders
        const allDelivered = updatedSellerOrders.every((so) => so.status === 'Delivered');
        const allShipped = updatedSellerOrders.every((so) => so.status === 'Shipped' || so.status === 'Delivered');
        let masterStatus = mo.masterStatus;

        if (allDelivered) masterStatus = 'Delivered';
        else if (allShipped) masterStatus = 'Shipped';
        else if (status === 'Processing') masterStatus = 'Processing';

        return {
          ...mo,
          sellerOrders: updatedSellerOrders,
          masterStatus,
          updatedAt: new Date().toISOString()
        };
      })
    );

    showToast(`Order ${sellerOrderId} status updated to ${status}`);
  };

  // SELLER MANAGEMENT
  const submitSellerApplication = (
    appData: Omit<
      SellerProfile,
      'id' | 'rating' | 'reviewCount' | 'productCount' | 'completedOrders' | 'verificationStatus' | 'createdAt'
    >
  ) => {
    const newSellerId = `s-${Date.now()}`;
    const newProfile: SellerProfile = {
      ...appData,
      id: newSellerId,
      rating: 5.0,
      reviewCount: 0,
      productCount: 0,
      completedOrders: 0,
      verificationStatus: 'pending',
      verificationDocsUploaded: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setSellers((prev) => [newProfile, ...prev]);

    // Send admin notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        targetRole: 'admin',
        title: 'New Seller Onboarding Application',
        message: `${appData.shopName} (${appData.location}) has submitted an artisan application for review.`,
        link: '/admin/sellers',
        read: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);

    setActiveSellerShopId(newSellerId);
    setActiveRole('seller');
    showToast('Your jewelry shop application was submitted! Awaiting admin verification.');
  };

  const approveSeller = (sellerId: string) => {
    setSellers((prev) =>
      prev.map((s) => (s.id === sellerId ? { ...s, verificationStatus: 'approved' } : s))
    );
    showToast('Seller application approved!');
  };

  const rejectSeller = (sellerId: string) => {
    setSellers((prev) =>
      prev.map((s) => (s.id === sellerId ? { ...s, verificationStatus: 'rejected' } : s))
    );
    showToast('Seller application rejected.');
  };

  const suspendSeller = (sellerId: string) => {
    setSellers((prev) =>
      prev.map((s) => (s.id === sellerId ? { ...s, verificationStatus: 'suspended' } : s))
    );
    showToast('Seller account suspended.');
  };

  const updateSellerProfile = (sellerId: string, updates: Partial<SellerProfile>) => {
    setSellers((prev) =>
      prev.map((s) => (s.id === sellerId ? { ...s, ...updates } : s))
    );
    showToast('Shop profile updated successfully.');
  };

  const requestSellerPayout = (sellerId: string, amount: number, method: string) => {
    const seller = sellers.find((s) => s.id === sellerId);
    const newPayout: SellerPayout = {
      id: `pay-${Date.now()}`,
      sellerId,
      sellerShopName: seller ? seller.shopName : 'Artisan Shop',
      amount,
      period: `Requested ${new Date().toLocaleDateString()}`,
      status: 'Pending',
      requestedAt: new Date().toISOString().split('T')[0],
      payoutMethod: method
    };

    setPayouts((prev) => [newPayout, ...prev]);
    showToast(`Payout request of PKR ${amount.toLocaleString()} submitted to Admin.`);
  };

  // PRODUCT MANAGEMENT
  const addProduct = (
    productInput: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'salesCount' | 'createdAt'>
  ) => {
    const newProductId = `p-${Date.now()}`;
    const newProduct: Product = {
      ...productInput,
      id: newProductId,
      rating: 5.0,
      reviewCount: 0,
      salesCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setProducts((prev) => [newProduct, ...prev]);

    // Update seller product count
    setSellers((prev) =>
      prev.map((s) => (s.id === productInput.sellerId ? { ...s, productCount: s.productCount + 1 } : s))
    );

    showToast(`"${productInput.title}" added to your shop inventory!`);
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updates } : p))
    );
    showToast('Product updated successfully.');
  };

  const deleteProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (prod) {
      setSellers((prev) =>
        prev.map((s) => (s.id === prod.sellerId ? { ...s, productCount: Math.max(0, s.productCount - 1) } : s))
      );
    }
    showToast('Product removed from store.');
  };

  const approveProduct = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: 'published' } : p))
    );
    showToast('Product approved and published!');
  };

  const rejectProduct = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: 'rejected' } : p))
    );
    showToast('Product rejected.');
  };

  const toggleProductFeature = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isFeatured: !p.isFeatured } : p))
    );
    showToast('Featured status updated.');
  };

  const toggleProductBestseller = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isBestseller: !p.isBestseller } : p))
    );
    showToast('Bestseller badge updated.');
  };

  // REVIEWS & MESSAGING
  const addReview = (reviewInput: Omit<ProductReview, 'id' | 'date'>) => {
    const newReview: ProductReview = {
      ...reviewInput,
      id: `r-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };

    setReviews((prev) => [newReview, ...prev]);

    // Recalculate product rating
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === reviewInput.productId) {
          const productReviews = reviews.filter((r) => r.productId === p.id);
          const totalRatings = productReviews.reduce((sum, r) => sum + r.rating, 0) + reviewInput.rating;
          const newCount = productReviews.length + 1;
          const newAvg = Number((totalRatings / newCount).toFixed(1));
          return {
            ...p,
            rating: newAvg,
            reviewCount: newCount
          };
        }
        return p;
      })
    );

    showToast('Thank you! Your product review has been published.');
  };

  const sendMessage = (sellerId: string, text: string) => {
    const seller = sellers.find((s) => s.id === sellerId);
    const newMsg: DirectMessage = {
      id: `m-${Date.now()}`,
      conversationId: `conv-${currentUser.id}-${sellerId}`,
      customerId: currentUser.id,
      customerName: currentUser.name,
      sellerId,
      sellerShopName: seller ? seller.shopName : 'Artisan',
      senderRole: activeRole === 'seller' ? 'seller' : 'customer',
      text,
      timestamp: new Date().toISOString(),
      read: false
    };

    setMessages((prev) => [...prev, newMsg]);
    showToast('Message sent to seller.');
  };

  const markNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // CUSTOM REQUESTS
  const submitCustomRequest = (req: Omit<CustomJewelryRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReq: CustomJewelryRequest = {
      ...req,
      id: `req-${Date.now()}`,
      status: 'Submitted',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCustomRequests((prev) => [newReq, ...prev]);
    showToast('Custom jewelry design request submitted to artisans!');
  };

  // ADMIN ACTIONS
  const updatePlatformCommission = (rate: number) => {
    setPlatformCommission(rate);
    showToast(`Platform commission updated to ${rate}%`);
  };

  const updateAnnouncementText = (text: string) => {
    setAnnouncementText(text);
    showToast('Homepage announcement banner updated.');
  };

  const processPayout = (payoutId: string, status: 'Approved' | 'Paid') => {
    setPayouts((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? {
              ...p,
              status,
              paidAt: status === 'Paid' ? new Date().toISOString().split('T')[0] : p.paidAt
            }
          : p
      )
    );
    showToast(`Payout status updated to ${status}.`);
  };

  const addCoupon = (coupon: Coupon) => {
    setCoupons((prev) => [coupon, ...prev]);
    showToast(`Coupon code "${coupon.code}" created!`);
  };

  const toggleCouponActive = (code: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.code === code ? { ...c, active: !c.active } : c))
    );
  };

  const categories = React.useMemo(() => {
    const uniqueProds = sanitizeUniqueProducts(products);
    return JEWELRY_CATEGORIES.map((cat) => {
      const count = uniqueProds.filter(
        (p) => (p.status === 'published' || !p.status) && isProductInCategory(p, cat.name)
      ).length;
      return {
        ...cat,
        count
      };
    });
  }, [products]);

  const loginUser = (email: string, password?: string): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const existingUser = registeredUsers.find((u) => u.email.trim().toLowerCase() === cleanEmail);

    if (!existingUser) {
      return {
        success: false,
        message: 'Account not found! Please create an account / register first before logging in.'
      };
    }

    if (existingUser.password && password && existingUser.password !== password) {
      return {
        success: false,
        message: 'Incorrect password. Please check your details and try again.'
      };
    }

    setCurrentUser(existingUser);
    showToast(`Welcome back, ${existingUser.name}!`);
    return {
      success: true,
      message: `Welcome back, ${existingUser.name}!`
    };
  };

  const registerUser = (
    name: string,
    email: string,
    phone: string,
    city: string,
    password?: string
  ): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const isAlreadyRegistered = registeredUsers.some((u) => u.email.trim().toLowerCase() === cleanEmail);

    if (isAlreadyRegistered) {
      return {
        success: false,
        message: 'This email is already registered! Please sign in instead.'
      };
    }

    const newUser: User = {
      id: `c-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password: password || 'password123',
      phone: phone.trim(),
      role: 'customer',
      addresses: [
        {
          id: `addr-${Date.now()}`,
          fullName: name.trim(),
          phone: phone.trim(),
          addressLine: `Street 1, ${city}`,
          city,
          province: 'Punjab',
          postalCode: '54000',
          isDefault: true
        }
      ],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setRegisteredUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    showToast(`Account created successfully! Welcome, ${newUser.name}.`);
    return {
      success: true,
      message: 'Account created successfully!'
    };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    showToast('Signed out of account');
  };

  return (
    <MarketplaceContext.Provider
      value={{
        activeRole,
        setActiveRole,
        currentUser,
        setCurrentUser,
        activeSellerShopId,
        setActiveSellerShopId,
        currentSellerShop,
        sellers,
        products,
        categories,
        cart,
        wishlist,
        orders,
        reviews,
        coupons,
        messages,
        notifications,
        payouts,
        customRequests,
        platformCommission,
        announcementText,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartGroupedBySeller,
        toggleWishlist,
        isInWishlist,
        placeOrder,
        updateSellerOrderStatus,
        submitSellerApplication,
        approveSeller,
        rejectSeller,
        suspendSeller,
        updateSellerProfile,
        requestSellerPayout,
        addProduct,
        updateProduct,
        deleteProduct,
        approveProduct,
        rejectProduct,
        toggleProductFeature,
        toggleProductBestseller,
        addReview,
        sendMessage,
        markNotificationsRead,
        submitCustomRequest,
        updatePlatformCommission,
        updateAnnouncementText,
        processPayout,
        addCoupon,
        toggleCouponActive,
        loginUser,
        registerUser,
        logoutUser,
        toastMessage,
        showToast
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
