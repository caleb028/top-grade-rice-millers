import fs from 'fs';
import path from 'path';
import {
  QuoteRequest,
  ContactMessage,
  BatchTraceability,
  Product,
  MillingService,
  GalleryImage,
  CompanyInfo,
  AdminSettings,
} from '@/types';
import { sampleBatches, productsList, millingServicesList, companyConfig } from '@/data/companyConfig';
import { verifyPassword, hashPassword, safeStringCompare } from '@/lib/crypto';

interface StorageSchema {
  quotes: QuoteRequest[];
  contacts: ContactMessage[];
  products: Product[];
  services: MillingService[];
  gallery: GalleryImage[];
  company: CompanyInfo;
  settings: AdminSettings;
}

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const LOCAL_DATA_DIR = path.join(process.cwd(), 'data');
const SEED_FILE = path.join(LOCAL_DATA_DIR, 'storage.json');
const DATA_DIR = isServerless ? path.join('/tmp', 'tgrm_data') : LOCAL_DATA_DIR;
const DATA_FILE = path.join(DATA_DIR, 'storage.json');

const defaultGallery: GalleryImage[] = [
  {
    id: 'gal_1',
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=85',
    title: 'Mwea Pure Pishori Grade 1 Kernels',
    alt: 'Mwea Pure Pishori Grade 1 whole grain milled rice',
    category: 'Rice',
    featured: true,
    createdAt: '2026-09-10T08:00:00.000Z',
  },
  {
    id: 'gal_2',
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=85',
    title: 'Mwea Basin Water Canals & Paddies',
    alt: 'Irrigation canals fed by Mount Kenya runoff flowing through Mwea rice paddies',
    category: 'Mwea',
    featured: true,
    createdAt: '2026-09-11T09:00:00.000Z',
  },
  {
    id: 'gal_3',
    url: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=1200&q=85',
    title: 'Milling & Acoustic Color Sorting Line',
    alt: 'Modern commercial rice hulling and grading equipment in Wanguru Mwea facility',
    category: 'Milling',
    featured: true,
    createdAt: '2026-09-12T10:00:00.000Z',
  },
  {
    id: 'gal_4',
    url: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=1200&q=85',
    title: 'Wholesale Woven Sack Packaging',
    alt: 'Sealed wholesale rice bags ready for commercial supermarket dispatch',
    category: 'Packaging',
    featured: false,
    createdAt: '2026-09-13T11:00:00.000Z',
  },
];

const defaultSettings: AdminSettings = {
  adminEmail: 'admin@topgradericemillers.co.ke',
  adminName: 'Lead Administrator',
  passwordHash: 'topgrade2026',
  websiteStatus: 'Live',
  quoteNotifications: true,
  contactNotifications: true,
  updatedAt: new Date().toISOString(),
};

function getStorage(): StorageSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (e) {
        console.warn('Could not create storage directory:', e);
      }
    }

    if (!fs.existsSync(DATA_FILE)) {
      let initial: StorageSchema;
      // In serverless, try to seed from the bundled repository data file first
      if (fs.existsSync(SEED_FILE)) {
        try {
          const rawSeed = fs.readFileSync(SEED_FILE, 'utf-8');
          initial = JSON.parse(rawSeed) as StorageSchema;
        } catch {
          initial = {
            quotes: [],
            contacts: [],
            products: productsList.map((p) => ({ ...p, active: true })),
            services: millingServicesList,
            gallery: defaultGallery,
            company: companyConfig as CompanyInfo,
            settings: defaultSettings,
          };
        }
      } else {
        initial = {
          quotes: [],
          contacts: [],
          products: productsList.map((p) => ({ ...p, active: true })),
          services: millingServicesList,
          gallery: defaultGallery,
          company: companyConfig as CompanyInfo,
          settings: defaultSettings,
        };
      }

      try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      } catch (err) {
        console.warn('Could not write initial DATA_FILE:', err);
      }
      return initial;
    }

    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<StorageSchema>;

    let hasChanges = false;

    if (!Array.isArray(parsed.quotes)) {
      parsed.quotes = [];
      hasChanges = true;
    }
    if (!Array.isArray(parsed.contacts)) {
      parsed.contacts = [];
      hasChanges = true;
    }
    if (!Array.isArray(parsed.products) || parsed.products.length === 0) {
      parsed.products = productsList.map((p) => ({ ...p, active: true }));
      hasChanges = true;
    }
    if (!Array.isArray(parsed.services) || parsed.services.length === 0) {
      parsed.services = millingServicesList;
      hasChanges = true;
    }
    if (!Array.isArray(parsed.gallery) || parsed.gallery.length === 0) {
      parsed.gallery = defaultGallery;
      hasChanges = true;
    }
    if (!parsed.company) {
      parsed.company = companyConfig as CompanyInfo;
      hasChanges = true;
    }
    if (!parsed.settings) {
      parsed.settings = defaultSettings;
      hasChanges = true;
    }

    const complete = parsed as StorageSchema;
    if (hasChanges) {
      writeStorage(complete);
    }
    return complete;
  } catch (error) {
    console.error('Failed to read storage:', error);
    return {
      quotes: [],
      contacts: [],
      products: productsList.map((p) => ({ ...p, active: true })),
      services: millingServicesList,
      gallery: defaultGallery,
      company: companyConfig as CompanyInfo,
      settings: defaultSettings,
    };
  }
}

function writeStorage(data: StorageSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write storage:', error);
    // Fallback: try writing to /tmp/tgrm_data if running on serverless
    try {
      const fallbackDir = path.join('/tmp', 'tgrm_data');
      if (!fs.existsSync(fallbackDir)) {
        fs.mkdirSync(fallbackDir, { recursive: true });
      }
      fs.writeFileSync(path.join(fallbackDir, 'storage.json'), JSON.stringify(data, null, 2), 'utf-8');
    } catch (fallbackError) {
      console.error('Fallback storage write also failed:', fallbackError);
    }
  }
}

function generateQuoteRef(): string {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `TG-QR-${year}-${randomDigits}`;
}

// -------------------------------------------------------------
// QUOTES
// -------------------------------------------------------------
export async function saveQuote(
  input: Omit<QuoteRequest, 'id' | 'referenceNumber' | 'createdAt' | 'status'>
): Promise<QuoteRequest> {
  const store = getStorage();
  const newQuote: QuoteRequest = {
    requestType: input.requestType || 'wholesale',
    ...input,
    id: 'quote_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    referenceNumber: generateQuoteRef(),
    createdAt: new Date().toISOString(),
    status: 'Pending',
  };

  store.quotes.unshift(newQuote);
  writeStorage(store);
  return newQuote;
}

export async function getQuotes(): Promise<QuoteRequest[]> {
  const store = getStorage();
  return store.quotes;
}

export async function updateQuoteStatus(
  id: string,
  status: QuoteRequest['status']
): Promise<QuoteRequest | null> {
  const store = getStorage();
  const quote = store.quotes.find((q) => q.id === id || q.referenceNumber === id);
  if (quote) {
    quote.status = status;
    writeStorage(store);
    return quote;
  }
  return null;
}

export async function deleteQuote(id: string): Promise<boolean> {
  const store = getStorage();
  const initialLength = store.quotes.length;
  store.quotes = store.quotes.filter((q) => q.id !== id && q.referenceNumber !== id);
  if (store.quotes.length !== initialLength) {
    writeStorage(store);
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// CONTACT MESSAGES
// -------------------------------------------------------------
export async function saveContactMessage(
  input: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>
): Promise<ContactMessage> {
  const store = getStorage();
  const newMessage: ContactMessage = {
    ...input,
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    createdAt: new Date().toISOString(),
    status: 'New',
  };

  store.contacts.unshift(newMessage);
  writeStorage(store);
  return newMessage;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const store = getStorage();
  return store.contacts;
}

export async function updateContactStatus(
  id: string,
  status: ContactMessage['status']
): Promise<ContactMessage | null> {
  const store = getStorage();
  const msg = store.contacts.find((m) => m.id === id);
  if (msg) {
    msg.status = status;
    writeStorage(store);
    return msg;
  }
  return null;
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  const store = getStorage();
  const initialLength = store.contacts.length;
  store.contacts = store.contacts.filter((m) => m.id !== id);
  if (store.contacts.length !== initialLength) {
    writeStorage(store);
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// PRODUCTS
// -------------------------------------------------------------
export async function getProducts(onlyActive = false): Promise<Product[]> {
  const store = getStorage();
  if (onlyActive) {
    return store.products.filter((p) => p.active !== false);
  }
  return store.products;
}

export async function saveProduct(
  input: Omit<Product, 'id'> & { id?: string }
): Promise<Product> {
  const store = getStorage();
  const newProduct: Product = {
    ...input,
    id: input.id || 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    slug: input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    active: input.active !== undefined ? input.active : true,
    featured: input.featured !== undefined ? input.featured : false,
    wholesaleAvailable: input.wholesaleAvailable !== undefined ? input.wholesaleAvailable : true,
    sizes: input.sizes && input.sizes.length ? input.sizes : ['50 kg'],
    idealFor: input.idealFor && input.idealFor.length ? input.idealFor : ['Wholesale supply'],
  };

  store.products.push(newProduct);
  writeStorage(store);
  return newProduct;
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<Product | null> {
  const store = getStorage();
  const index = store.products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  store.products[index] = {
    ...store.products[index],
    ...updates,
  };
  writeStorage(store);
  return store.products[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const store = getStorage();
  const initial = store.products.length;
  store.products = store.products.filter((p) => p.id !== id);
  if (store.products.length !== initial) {
    writeStorage(store);
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// MILLING SERVICES
// -------------------------------------------------------------
export async function getServices(onlyActive = false): Promise<MillingService[]> {
  const store = getStorage();
  if (onlyActive) {
    return store.services.filter((s) => s.active !== false);
  }
  return store.services;
}

export async function saveService(
  input: Omit<MillingService, 'id'> & { id?: string }
): Promise<MillingService> {
  const store = getStorage();
  const newService: MillingService = {
    ...input,
    id: input.id || 'srv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    number: input.number || String(store.services.length + 1).padStart(2, '0'),
    active: input.active !== undefined ? input.active : true,
  };

  store.services.push(newService);
  writeStorage(store);
  return newService;
}

export async function updateService(
  id: string,
  updates: Partial<MillingService>
): Promise<MillingService | null> {
  const store = getStorage();
  const index = store.services.findIndex((s) => s.id === id);
  if (index === -1) return null;

  store.services[index] = {
    ...store.services[index],
    ...updates,
  };
  writeStorage(store);
  return store.services[index];
}

export async function deleteService(id: string): Promise<boolean> {
  const store = getStorage();
  const initial = store.services.length;
  store.services = store.services.filter((s) => s.id !== id);
  if (store.services.length !== initial) {
    writeStorage(store);
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// GALLERY
// -------------------------------------------------------------
export async function getGallery(): Promise<GalleryImage[]> {
  const store = getStorage();
  return store.gallery;
}

export async function saveGalleryImage(
  input: Omit<GalleryImage, 'id' | 'createdAt'> & { id?: string }
): Promise<GalleryImage> {
  const store = getStorage();
  const newImage: GalleryImage = {
    ...input,
    id: input.id || 'gal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString(),
    featured: input.featured || false,
  };

  store.gallery.unshift(newImage);
  writeStorage(store);
  return newImage;
}

export async function deleteGalleryImage(id: string): Promise<boolean> {
  const store = getStorage();
  const initial = store.gallery.length;
  store.gallery = store.gallery.filter((g) => g.id !== id);
  if (store.gallery.length !== initial) {
    writeStorage(store);
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// COMPANY INFORMATION
// -------------------------------------------------------------
export async function getCompanyData(): Promise<CompanyInfo> {
  const store = getStorage();
  return store.company;
}

export async function updateCompanyData(updates: Partial<CompanyInfo>): Promise<CompanyInfo> {
  const store = getStorage();
  store.company = {
    ...store.company,
    ...updates,
    location: {
      ...store.company.location,
      ...(updates.location || {}),
    },
    contact: {
      ...store.company.contact,
      ...(updates.contact || {}),
    },
    aboutText: {
      ...store.company.aboutText,
      ...(updates.aboutText || {}),
    },
  };
  writeStorage(store);
  return store.company;
}

// -------------------------------------------------------------
// SETTINGS & AUTH
// -------------------------------------------------------------
export async function getAdminSettings(): Promise<AdminSettings> {
  const store = getStorage();
  return store.settings;
}

export async function updateAdminSettings(updates: Partial<AdminSettings>): Promise<AdminSettings> {
  const store = getStorage();
  const finalUpdates = { ...updates };

  // If a new raw password is provided, hash it using PBKDF2 with a salt
  if (finalUpdates.passwordHash && !finalUpdates.passwordHash.includes(':')) {
    finalUpdates.passwordHash = await hashPassword(finalUpdates.passwordHash);
  }

  store.settings = {
    ...store.settings,
    ...finalUpdates,
    updatedAt: new Date().toISOString(),
  };
  writeStorage(store);
  return store.settings;
}

export async function verifyAdminCredentials(
  email: string,
  passwordAttempt: string
): Promise<boolean> {
  const store = getStorage();
  const cleanEmail = email.trim().toLowerCase();
  const cleanTarget = store.settings.adminEmail.trim().toLowerCase();

  // Timing-safe email comparison
  if (!safeStringCompare(cleanEmail, cleanTarget)) {
    return false;
  }

  const isValid = await verifyPassword(passwordAttempt, store.settings.passwordHash);
  if (!isValid) {
    return false;
  }

  // Auto-migration: if the stored password was unhashed plaintext, upgrade to PBKDF2 immediately
  if (!store.settings.passwordHash.includes(':')) {
    store.settings.passwordHash = await hashPassword(passwordAttempt);
    store.settings.updatedAt = new Date().toISOString();
    writeStorage(store);
  }

  return true;
}

// -------------------------------------------------------------
// DASHBOARD STATS
// -------------------------------------------------------------
export async function getAdminDashboardStats() {
  const store = getStorage();
  const activeProducts = store.products.filter((p) => p.active !== false).length;
  const pendingQuotes = store.quotes.filter((q) => q.status === 'Pending').length;
  const unreadMessages = store.contacts.filter((c) => c.status === 'New').length;
  const activeServices = store.services.filter((s) => s.active !== false).length;

  return {
    totalProducts: store.products.length,
    activeProducts,
    totalQuotes: store.quotes.length,
    pendingQuotes,
    totalMessages: store.contacts.length,
    unreadMessages,
    totalServices: store.services.length,
    activeServices,
    totalGallery: store.gallery.length,
    websiteStatus: store.settings.websiteStatus,
  };
}

export async function getBatchRecord(batchNumber: string): Promise<BatchTraceability | null> {
  const upper = batchNumber.trim().toUpperCase();
  return sampleBatches[upper] || null;
}
