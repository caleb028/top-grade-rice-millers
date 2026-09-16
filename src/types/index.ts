export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  sizes: string[];
  grainType: string;
  purity: string;
  moisture: string;
  brokenRatio: string;
  aroma: string;
  origin: string;
  idealFor: string[];
  wholesaleAvailable: boolean;
  featured: boolean;
  active?: boolean;
}

export interface MillingService {
  id: string;
  number: string;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  keyCapability: string;
  active: boolean;
}

export interface FarmProcessStep {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  highlight: string;
}

export type QuoteRequestType = 'retail' | 'wholesale' | 'business' | 'milling' | 'other';

export interface MillingRequestDetails {
  riceType?: string;
  requirements?: string;
  preferredDate?: string;
}

export type FulfillmentType = 'delivery' | 'pickup';

export interface QuoteRequest {
  id: string;
  referenceNumber: string;
  createdAt: string;
  requestType?: QuoteRequestType;
  fulfillmentType?: FulfillmentType;
  pickupDate?: string;
  pickupNotes?: string;
  name: string;
  company?: string;
  organization?: string;
  phone: string;
  email?: string;
  customerType?: 'Retailer' | 'Wholesaler' | 'Hotel' | 'Restaurant' | 'Institution' | 'Distributor' | 'Other' | string;
  productId?: string;
  productName?: string;
  quantityBags?: number;
  quantity?: number;
  unit?: string;
  bagSize?: string;
  deliveryLocation: string;
  county?: string;
  town?: string;
  millingDetails?: MillingRequestDetails;
  subject?: string;
  message?: string;
  status: 'Pending' | 'Contacted' | 'Quoted' | 'Completed';
}


export interface ContactMessage {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: 'New' | 'Read' | 'Replied';
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  alt: string;
  category: string;
  featured: boolean;
  createdAt: string;
}

export interface BusinessHourShift {
  days: string;
  hours: string;
}

export interface CompanyInfo {
  name: string;
  shortName: string;
  acronym: string;
  slogan?: string;
  tagline: string;
  subheadline: string;
  positioning: string;
  location: {
    town: string;
    subCounty: string;
    county: string;
    country: string;
    landmark: string;
    addressString: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    googleMapsEmbedUrl: string;
    googleMapsLiveUrl: string;
  };
  contact: {
    phoneDisplay: string;
    phoneRaw: string;
    whatsappNumber: string;
    whatsappDisplay: string;
    email: string;
    salesEmail: string;
    businessHours: BusinessHourShift[];
  };
  aboutText: {
    lead: string;
    summary: string;
    detail: string;
    mission: string;
    millingCommitment: string;
  };
}

export interface AdminSettings {
  adminEmail: string;
  adminName: string;
  passwordHash: string;
  websiteStatus: 'Live' | 'Maintenance';
  quoteNotifications: boolean;
  contactNotifications: boolean;
  updatedAt: string;
}

export interface BatchTraceability {
  batchNumber: string;
  productName: string;
  grade: string;
  millingDate: string;
  harvestSeason: string;
  originLocation: string;
  schemeBlock: string;
  moistureContent: string;
  purityGrade: string;
  millingFacility: string;
  packType: string;
  verifiedBy: string;
  qualityNotes: string;
}
