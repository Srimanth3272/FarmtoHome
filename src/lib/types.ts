export type UserRole = 'CUSTOMER' | 'FARMER' | 'ADMIN' | 'AUTHOR';

export interface SellerSubscription {
  isSubscribed: boolean;
  plan: string;
  amount: number;
  activatedAt: string;
  expiresAt: string;
  paymentId?: string;
  paymentMethod?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING';
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  phone?: string | null;
  isVerified?: boolean;
  provider?: 'google' | 'email';
  isSubscribed?: boolean;
  sellerSubscription?: SellerSubscription | null;
}

export interface FarmerProfileItem {
  id: string;
  userId: string;
  farmName: string;
  story: string;
  experienceYears: number;
  state: string;
  district: string;
  village?: string | null;
  pincode: string;
  farmSizeAcres?: number | null;
  farmingMethods: string;
  certifications?: string | null;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  aadharNumber?: string | null;
  phone?: string | null;
  email?: string | null;
  idProofDoc?: string | null;
  commissionRate: number;
  totalCommissionPaid: number;
  totalCommissionDue: number;
  rating: number;
  reviewsCount: number;
  isOrganicCertified: boolean;
  profileImage?: string | null;
  bannerImage?: string | null;
  commissionPayments?: any[];
  user?: {
    name: string;
    email: string;
    avatar?: string | null;
  };
}

export interface ProductItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  categoryId: string;
  category?: {
    id: string;
    slug: string;
    name: string;
  };
  farmerId: string;
  farmer?: {
    id: string;
    farmName: string;
    state: string;
    district: string;
    experienceYears?: number;
    isOrganicCertified: boolean;
    verificationStatus: string;
    aadharNumber?: string | null;
    phone?: string | null;
    email?: string | null;
    commissionRate?: number;
    rating: number;
    user?: {
      name: string;
      avatar?: string | null;
    };
  };
  price: number;
  farmerBasePrice?: number | null;
  commissionAmount?: number | null;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminRemarks?: string | null;
  isActive?: boolean;
  compareAtPrice?: number | null;
  unit: string;
  stock: number;
  sku?: string | null;
  images: string; // JSON string or parsed array
  originLocation: string;
  harvestDate?: string | null;
  storageInstructions?: string | null;
  shelfLifeDays?: number | null;
  isOrganic: boolean;
  isVerified: boolean;
  certificationDetails?: string | null;
  featured: boolean;
  rating: number;
  reviewCount: number;
  farmPassport?: FarmPassportItem | null;
}

export interface FarmPassportItem {
  id: string;
  productId: string;
  batchNumber: string;
  farmName: string;
  farmerName: string;
  location: string;
  harvestDate: string;
  declaredPractices: string;
  soilType: string;
  waterSource: string;
  chemicalFreeYears: number;
  verificationBadge: string;
  labReportUrl?: string | null;
  traceabilityNotes?: string | null;
}

export interface CartProductItem {
  id: string;
  productId: string;
  product: ProductItem;
  quantity: number;
}

export interface HarvestCalendarItem {
  id: string;
  farmerId: string;
  cropName: string;
  category: string;
  expectedHarvestDate: string;
  expectedQuantity: string;
  state: string;
  district: string;
  preOrderAvailable: boolean;
  preOrderPrice?: number | null;
  unit: string;
  description: string;
  image: string;
  season: string;
  status: string;
  farmer?: {
    farmName: string;
    user?: {
      name: string;
    };
  };
}

export interface WasteExchangeItem {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  title: string;
  description: string;
  materialType: string;
  quantity: string;
  listingType: 'SALE' | 'DONATION' | 'EXCHANGE';
  price?: number | null;
  state: string;
  district: string;
  pincode: string;
  collectionTerms: string;
  image: string;
  status: string;
  createdAt: string;
}

export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  category: string;
  tags: string;
  readTimeMinutes: number;
  language: string;
  isPublished: boolean;
  likesCount: number;
  viewsCount: number;
  createdAt: string;
  comments?: Array<{
    id: string;
    userName: string;
    content: string;
    createdAt: string;
  }>;
}
