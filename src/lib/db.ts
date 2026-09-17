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
  LiveActivityItem,
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

declare global {
  // eslint-disable-next-line no-var
  var __tgrm_storage: StorageSchema | undefined;
  // eslint-disable-next-line no-var
  var __tgrm_deleted_quote_ids: Set<string> | undefined;
  // eslint-disable-next-line no-var
  var __tgrm_deleted_msg_ids: Set<string> | undefined;
}

if (!globalThis.__tgrm_deleted_quote_ids) {
  globalThis.__tgrm_deleted_quote_ids = new Set<string>();
}
if (!globalThis.__tgrm_deleted_msg_ids) {
  globalThis.__tgrm_deleted_msg_ids = new Set<string>();
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
  const memStore = globalThis.__tgrm_storage;
  let diskStore: Partial<StorageSchema> | null = null;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (e) {
        console.warn('Could not create storage directory:', e);
      }
    }

    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      if (raw && raw.trim().length > 0) {
        diskStore = JSON.parse(raw) as Partial<StorageSchema>;
      }
    } else if (fs.existsSync(SEED_FILE)) {
      const rawSeed = fs.readFileSync(SEED_FILE, 'utf-8');
      if (rawSeed && rawSeed.trim().length > 0) {
        diskStore = JSON.parse(rawSeed) as Partial<StorageSchema>;
      }
    }
  } catch (err) {
    console.warn('Storage read warning (will fall back safely to memory cache):', err);
  }

  const defaultStore: StorageSchema = {
    quotes: [],
    contacts: [],
    products: productsList.map((p) => ({ ...p, active: true })),
    services: millingServicesList,
    gallery: defaultGallery,
    company: companyConfig as CompanyInfo,
    settings: defaultSettings,
  };

  if (!memStore && !diskStore) {
    globalThis.__tgrm_storage = defaultStore;
    writeStorage(defaultStore);
    return defaultStore;
  }

  const deletedQuotes = globalThis.__tgrm_deleted_quote_ids || new Set<string>();
  const deletedContacts = globalThis.__tgrm_deleted_msg_ids || new Set<string>();

  // Safe merge for quotes: union by id, excluding deleted
  const quotesMap = new Map<string, QuoteRequest>();
  if (diskStore && Array.isArray(diskStore.quotes)) {
    for (const q of diskStore.quotes) {
      if (q && q.id && !deletedQuotes.has(q.id) && (!q.referenceNumber || !deletedQuotes.has(q.referenceNumber))) {
        quotesMap.set(q.id, q);
      }
    }
  }
  if (memStore && Array.isArray(memStore.quotes)) {
    for (const q of memStore.quotes) {
      if (q && q.id && !deletedQuotes.has(q.id) && (!q.referenceNumber || !deletedQuotes.has(q.referenceNumber))) {
        quotesMap.set(q.id, q);
      }
    }
  }

  // Safe merge for contacts: union by id, excluding deleted
  const contactsMap = new Map<string, ContactMessage>();
  if (diskStore && Array.isArray(diskStore.contacts)) {
    for (const c of diskStore.contacts) {
      if (c && c.id && !deletedContacts.has(c.id)) {
        contactsMap.set(c.id, c);
      }
    }
  }
  if (memStore && Array.isArray(memStore.contacts)) {
    for (const c of memStore.contacts) {
      if (c && c.id && !deletedContacts.has(c.id)) {
        contactsMap.set(c.id, c);
      }
    }
  }

  const products = (diskStore?.products && Array.isArray(diskStore.products) && diskStore.products.length > 0)
    ? diskStore.products
    : (memStore?.products && Array.isArray(memStore.products) && memStore.products.length > 0)
    ? memStore.products
    : defaultStore.products;

  const services = (diskStore?.services && Array.isArray(diskStore.services) && diskStore.services.length > 0)
    ? diskStore.services
    : (memStore?.services && Array.isArray(memStore.services) && memStore.services.length > 0)
    ? memStore.services
    : defaultStore.services;

  const gallery = (diskStore?.gallery && Array.isArray(diskStore.gallery) && diskStore.gallery.length > 0)
    ? diskStore.gallery
    : (memStore?.gallery && Array.isArray(memStore.gallery) && memStore.gallery.length > 0)
    ? memStore.gallery
    : defaultStore.gallery;

  const company = diskStore?.company || memStore?.company || defaultStore.company;
  const settings = diskStore?.settings || memStore?.settings || defaultStore.settings;

  const sortedQuotes = Array.from(quotesMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const sortedContacts = Array.from(contactsMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const merged: StorageSchema = {
    quotes: sortedQuotes,
    contacts: sortedContacts,
    products,
    services,
    gallery,
    company,
    settings,
  };

  globalThis.__tgrm_storage = merged;
  return merged;
}

function writeStorage(data: StorageSchema): void {
  // Update in-memory singleton immediately
  globalThis.__tgrm_storage = data;

  const serialized = JSON.stringify(data, null, 2);

  const safeAtomicWrite = (targetPath: string) => {
    try {
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tmpFile = `${targetPath}.tmp.${Date.now()}.${Math.random().toString(36).substring(2, 7)}`;
      fs.writeFileSync(tmpFile, serialized, 'utf-8');
      try {
        fs.renameSync(tmpFile, targetPath);
      } catch {
        fs.copyFileSync(tmpFile, targetPath);
        try {
          fs.unlinkSync(tmpFile);
        } catch {
          // ignore tmp unlink error
        }
      }
    } catch (err) {
      console.error(`Failed to atomically write storage to ${targetPath}:`, err);
    }
  };

  // Primary persistent file
  safeAtomicWrite(DATA_FILE);

  // Keep workspace seed file synchronized if running locally
  if (DATA_FILE !== SEED_FILE && fs.existsSync(path.dirname(SEED_FILE))) {
    safeAtomicWrite(SEED_FILE);
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
    fulfillmentType: input.fulfillmentType || 'delivery',
    ...input,
    id: 'quote_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    referenceNumber: generateQuoteRef(),
    createdAt: new Date().toISOString(),
    status: 'Pending',
  };

  if (globalThis.__tgrm_deleted_quote_ids) {
    globalThis.__tgrm_deleted_quote_ids.delete(newQuote.id);
    globalThis.__tgrm_deleted_quote_ids.delete(newQuote.referenceNumber);
  }

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

  if (!globalThis.__tgrm_deleted_quote_ids) {
    globalThis.__tgrm_deleted_quote_ids = new Set<string>();
  }
  globalThis.__tgrm_deleted_quote_ids.add(id);

  const targetQuote = store.quotes.find((q) => q.id === id || q.referenceNumber === id);
  if (targetQuote) {
    globalThis.__tgrm_deleted_quote_ids.add(targetQuote.id);
    if (targetQuote.referenceNumber) {
      globalThis.__tgrm_deleted_quote_ids.add(targetQuote.referenceNumber);
    }
  }

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

  if (globalThis.__tgrm_deleted_msg_ids) {
    globalThis.__tgrm_deleted_msg_ids.delete(newMessage.id);
  }

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

  if (!globalThis.__tgrm_deleted_msg_ids) {
    globalThis.__tgrm_deleted_msg_ids = new Set<string>();
  }
  globalThis.__tgrm_deleted_msg_ids.add(id);

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

export async function getLiveActivities(limit = 20): Promise<LiveActivityItem[]> {
  const store = getStorage();
  const activities: LiveActivityItem[] = [];

  for (const q of store.quotes) {
    activities.push({
      id: `act_q_${q.id}`,
      type: 'quote',
      title: `Quote Request: ${q.productName || 'Rice Supply'}`,
      sender: q.name,
      details: `${q.quantityBags || q.quantity || 1} ${q.unit || 'bags'} · ${q.fulfillmentType === 'pickup' ? 'Self Pick-up at Mill (Wang\'uru)' : `Delivery to ${q.county || 'Destination'}`}`,
      status: q.status,
      reference: q.referenceNumber,
      fulfillmentType: q.fulfillmentType || 'delivery',
      timestamp: q.createdAt,
      badge: q.status === 'Pending' ? 'New Quote' : q.status,
      link: '/admin/quotes',
    });
  }

  for (const c of store.contacts) {
    activities.push({
      id: `act_c_${c.id}`,
      type: 'message',
      title: `Message: ${c.subject}`,
      sender: c.name,
      details: c.message.length > 80 ? c.message.slice(0, 80) + '...' : c.message,
      status: c.status,
      reference: c.phone || c.email || 'Direct Channel',
      timestamp: c.createdAt,
      badge: c.status === 'New' ? 'Unread Message' : c.status,
      link: '/admin/messages',
    });
  }

  // Sort descending by timestamp
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return activities.slice(0, limit);
}
