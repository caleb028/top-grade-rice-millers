import { Product, MillingService, FarmProcessStep, BatchTraceability } from '@/types';

export const companyConfig = {
  name: 'TOP GRADE RICE MILLERS',
  shortName: 'Top Grade',
  acronym: 'TGM',
  slogan: 'Home of Pure Pishori',
  tagline: 'Home of Pure Pishori — Premium Rice Proudly Milled in Mwea',
  subheadline:
    'Quality-focused rice milling and processing from the heart of Mwea, serving households, businesses and institutions across Kenya.',
  positioning: 'Home of Pure Pishori — Premium Rice Proudly Milled in Mwea',
  
  // Real verified geography - Mwea, Kirinyaga County
  location: {
    town: 'Mwea',
    subCounty: 'Mwea East / West',
    county: 'Kirinyaga County',
    country: 'Kenya',
    landmark: 'Mwea Rice Milling Hub, Wang\'uru Highway Corridor',
    addressString: 'Mwea, Kirinyaga County, Kenya',
    // Realistic coordinates for Wang'uru / Mwea rice milling hub
    coordinates: {
      lat: -0.6277,
      lng: 37.3597,
    },
    googleMapsEmbedUrl:
      'https://maps.google.com/maps?q=Top+Grade+Rice+Millers,+Wang%27uru,+Mwea,+Kirinyaga+County,+Kenya&t=&z=15&ie=UTF8&iwloc=&output=embed',
    googleMapsLiveUrl:
      'https://www.google.com/maps/search/?api=1&query=Top+Grade+Rice+Millers+Wang%27uru+Mwea+Kirinyaga',
  },

  // Official verified contact points
  contact: {
    // Official phone (Kenyan format)
    phoneDisplay: '+254 722 251 484',
    phoneRaw: '+254722251484',
    // WhatsApp direct number (E.164 format without plus or symbols for wa.me)
    whatsappNumber: '254722251484',
    whatsappDisplay: '+254 722 251 484',
    email: 'topgradericemillers009@gmail.com',
    salesEmail: 'topgradericemillers009@gmail.com',
    businessHours: [
      { days: 'Monday – Friday', hours: '7:30 AM – 5:30 PM' },
      { days: 'Saturday', hours: '8:00 AM – 2:00 PM' },
      { days: 'Sunday & Public Holidays', hours: 'Closed / By Prior Wholesale Appointment' },
    ],
  },

  // WhatsApp contextual link builder
  getWhatsAppLink(context: 'general' | 'quote' | 'milling' | 'product', detail?: string): string {
    let message = 'Hello Top Grade Rice Millers, ';
    switch (context) {
      case 'quote':
        message += detail
          ? `I would like to request an official wholesale quotation for ${detail}.`
          : 'I would like to request an official wholesale quotation for rice supply.';
        break;
      case 'milling':
        message += 'I am inquiring about your commercial rice milling services and intake availability in Mwea.';
        break;
      case 'product':
        message += detail
          ? `I am interested in learning more about your ${detail} supply.`
          : 'I would like to enquire about your rice products.';
        break;
      case 'general':
      default:
        message += 'I would like to enquire about your rice products and operations in Mwea.';
        break;
    }
    return `https://wa.me/${this.contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
  },

  // Core brand values & quality promises (grounded, no fake awards)
  qualityPillars: [
    {
      title: 'Clean Processing',
      subtitle: 'Modern intake and multi-stage destoning',
      description:
        'Every grain passes through vibratory screeners, high-suction aspirators, and gravity destoners to guarantee pure, stone-free rice.',
    },
    {
      title: 'Consistent Grading',
      subtitle: 'Precision sorting for uniform whole-grain ratio',
      description:
        'Calibrated rotary graders ensure reliable whole-grain consistency across every batch, meeting verified grade specifications.',
    },
    {
      title: 'Careful Handling',
      subtitle: 'Gentle temperature and moisture protection',
      description:
        'Controlled dehusking friction preserves the natural aroma, moisture balance (<13.5%), and cooking fluffiness of Mwea rice.',
    },
    {
      title: 'Reliable Packaging',
      subtitle: 'Aroma-sealed food-grade packaging',
      description:
        'Packed in tear-resistant, breathable woven bags and retail poly packs designed to protect freshness from mill floor to table.',
    },
  ],

  // Real verifiable agricultural context
  aboutText: {
    lead: 'Where Great Rice Begins',
    summary:
      'Rooted in Mwea, Top Grade Rice Millers is focused on delivering carefully processed rice for customers who value quality, consistency and reliability.',
    detail:
      'The Mwea basin is renowned across East Africa for its mineral-rich black cotton soils, fed year-round by the clear mountain streams cascading from Mount Kenya. Top Grade Rice Millers works at the heart of this fertile ecosystem, pairing traditional Mwea grain heritage with modern mechanical milling precision.',
    mission:
      'To provide households, retailers, and commercial institutions with dependably pure, cleanly milled Kenyan rice while upholding operational excellence and transparent business practices.',
    millingCommitment:
      'We operate with strict quality controls: moisture verification upon intake, calibrated sorting, and transparent grading standards.',
  },
};

export const productsList: Product[] = [
  {
    id: 'mwea-pure-pishori',
    slug: 'mwea-pure-pishori',
    name: 'Mwea Pure Pishori (Grade 1)',
    category: 'Aromatic Premium Rice',
    shortDescription: 'The definitive aromatic Kenyan long-grain rice, renowned for delicate sweetness and captivating natural scent.',
    fullDescription:
      'Harvested directly from the irrigated paddy fields of Mwea, Kirinyaga County, our Grade 1 Pure Pishori is celebrated for its slender profile, tender non-clumping fluffiness upon cooking, and an unmistakable natural aroma that fills the kitchen. Processed through gentle destoning and acoustic optical sorting to preserve kernel integrity.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=85',
    sizes: ['1 kg', '2 kg', '5 kg', '10 kg', '25 kg', '50 kg'],
    grainType: 'Slender Long Grain Aromatic',
    purity: 'Grade 1 Pure Grain',
    moisture: '< 13.0%',
    brokenRatio: 'Under 5% broken grain',
    aroma: 'Natural High Pishori Aroma',
    origin: 'Mwea Irrigation Scheme, Kirinyaga County, Kenya',
    idealFor: ['Household dining', 'Executive catering', 'Pilau & Biryani', 'Fine dining hospitality'],
    wholesaleAvailable: true,
    featured: true,
  },
  {
    id: 'super-long-grain',
    slug: 'super-long-grain',
    name: 'Classic Super Long Grain',
    category: 'Commercial & Household Table Rice',
    shortDescription: 'Uniform, polished whole-kernel table rice engineered for dependable yield, firm texture, and everyday dining.',
    fullDescription:
      'A dependable, high-yielding Kenyan milled rice selected for its resilient kernel structure. Each grain cooks cleanly without breaking down or turning mushy, making it the choice of commercial caterers, family kitchens, and restaurants who require consistent volume and visual appeal.',
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=1200&q=85',
    sizes: ['5 kg', '10 kg', '25 kg', '50 kg'],
    grainType: 'Polished Long Grain',
    purity: 'Super Clean Whole Grain',
    moisture: '< 13.5%',
    brokenRatio: 'Standard Commercial Grade (<10%)',
    aroma: 'Mild Natural Grain',
    origin: 'Mwea, Kirinyaga County, Kenya',
    idealFor: ['Schools & Institutions', 'Hotels & Buffets', 'Daily Household Meals', 'Catering supply'],
    wholesaleAvailable: true,
    featured: true,
  },
  {
    id: 'fragrant-broken-rice',
    slug: 'fragrant-broken-rice',
    name: 'Fragrant Broken Rice (Catering Grade)',
    category: 'Institutional & Culinary Supply',
    shortDescription: 'Clean, stone-free aromatic broken grains offering rich Mwea flavour at an accessible price point for bulk kitchens.',
    fullDescription:
      'Natural broken kernels produced during the gentle dehusking and grading of pure aromatic rice. Cleaned to the exact same stone-free and dust-free standards as our whole grain rice. Highly economical for volume kitchens, composite rice flour blending, porridges, and hearty rice dishes.',
    image: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=1200&q=85',
    sizes: ['25 kg', '50 kg', '1-Tonne Pallet Bales'],
    grainType: 'Aromatic Broken Grains',
    purity: 'Multi-screened Clean Broken',
    moisture: '< 13.5%',
    brokenRatio: '100% Broken Aromatic',
    aroma: 'Subtle Pishori Scent',
    origin: 'Mwea, Kirinyaga County, Kenya',
    idealFor: ['Catering & large cafeterias', 'Food processing & milling', 'Rice flour & snacks', 'Budget-conscious bulk supply'],
    wholesaleAvailable: true,
    featured: true,
  },
];

export const millingServicesList: MillingService[] = [
  {
    id: 'cleaning-destoning',
    number: '01',
    name: 'Cleaning & Destoning',
    tagline: 'Precision debris and foreign matter removal',
    description:
      'High-throughput rotary scalpers, air aspiration channels, and dual gravity destoners remove dust, chaff, weed seeds, and field pebbles prior to milling.',
    iconName: 'ShieldCheck',
    keyCapability: 'Zero stones guarantee through high-density gravity separation.',
    active: true,
  },
  {
    id: 'husking',
    number: '02',
    name: 'Gentle Dehusking',
    tagline: 'High kernel recovery with minimal grain stress',
    description:
      'Modern rubber-roll hullers operate with calibrated roller gap clearances to strip the outer paddy husk while preserving the valuable endosperm.',
    iconName: 'Layers',
    keyCapability: 'Maximizes whole head-rice percentage while minimizing kernel fractures.',
    active: true,
  },
  {
    id: 'grading-sieving',
    number: '03',
    name: 'Multi-Deck Grading & Sizing',
    tagline: 'Calibrated length and thickness separation',
    description:
      'Vibratory sieves and indented cylinder separators divide milled rice into strict whole-grain, half-grain, and small broken kernel categories.',
    iconName: 'Sliders',
    keyCapability: 'Accurate classification according to commercial grade standards.',
    active: true,
  },
  {
    id: 'color-sorting-polishing',
    number: '04',
    name: 'Optical Sorting & Friction Polishing',
    tagline: 'High-speed camera detection for immaculate grain',
    description:
      'High-definition optical sorters inspect falling grain streams to eliminate chalky, discoloured, or damaged grains, followed by gentle friction polishing for shine.',
    iconName: 'Eye',
    keyCapability: 'Removes discolored kernels for an immaculate translucent appearance.',
    active: true,
  },
  {
    id: 'packaging-bagging',
    number: '05',
    name: 'Custom Weighing & Bagging',
    tagline: 'Automated bag filling and industrial sealing',
    description:
      'Automated load-cell weighers fill 1kg, 2kg, 5kg, 10kg, 25kg, and 50kg sacks with high-strength stitched closures to prevent spillage and preserve aroma.',
    iconName: 'PackageCheck',
    keyCapability: 'Available for client-customized sacks or standard Top Grade bags.',
    active: true,
  },
];

export const farmProcessSteps: FarmProcessStep[] = [
  {
    step: '01',
    title: 'SOURCE',
    subtitle: 'Rice from the Mwea region',
    description: 'Paddy harvested from the sun-drenched, water-fed paddies of Kirinyaga County at peak grain maturity.',
    highlight: 'Mount Kenya runoff water & mineral-rich clay loam',
  },
  {
    step: '02',
    title: 'PROCESS',
    subtitle: 'Professional milling and processing',
    description: 'Dehusked and processed using modern industrial machinery tuned for kernel protection and high recovery.',
    highlight: 'Controlled temperature hulling',
  },
  {
    step: '03',
    title: 'GRADE',
    subtitle: 'Quality-focused grading and preparation',
    description: 'Screened through multi-stage destoners and precision graders to ensure uniform grain dimensions.',
    highlight: 'Stone-free guarantee & whole-kernel grading',
  },
  {
    step: '04',
    title: 'PACKAGE',
    subtitle: 'Prepared for different customer needs',
    description: 'Accurately weighed into moisture-resistant retail packs and reinforced 25kg & 50kg wholesale sacks.',
    highlight: 'Tear-resistant, aroma-preserving sacks',
  },
  {
    step: '05',
    title: 'DELIVER',
    subtitle: 'Ready for homes, businesses and institutions',
    description: 'Dispatched directly from our Mwea facility to supermarkets, hospitality groups, and distributors nationwide.',
    highlight: 'Reliable dispatch & consistent commercial supply',
  },
];

// Production-ready batch traceability records
export const sampleBatches: Record<string, BatchTraceability> = {
  'TGM-2026-PIS-01': {
    batchNumber: 'TGM-2026-PIS-01',
    productName: 'Mwea Pure Pishori (Grade 1)',
    grade: 'Grade 1 Premium Aromatic',
    millingDate: '2026-09-10',
    harvestSeason: 'Main Crop Season 2026',
    originLocation: 'Mwea Irrigation Scheme, Kirinyaga County, Kenya',
    schemeBlock: 'Block H — Thiba Basin',
    moistureContent: '12.8% (Optimal)',
    purityGrade: '99.2% Pure Head Rice',
    millingFacility: 'Top Grade Rice Millers — Mwea Central Facility',
    packType: '25kg & 50kg Woven Multi-layer Sacks',
    verifiedBy: 'Quality Assurance Department — TGM',
    qualityNotes: 'Zero foreign matter detected. High characteristic Pishori aroma confirmed. Destination: Commercial Wholesale.',
  },
  'TGM-2026-SLG-02': {
    batchNumber: 'TGM-2026-SLG-02',
    productName: 'Classic Super Long Grain',
    grade: 'Commercial Grade A',
    millingDate: '2026-09-12',
    harvestSeason: 'Mid-Year Harvest 2026',
    originLocation: 'Mwea Valley Outgrowers, Kirinyaga, Kenya',
    schemeBlock: 'Block M — Nyamindi Section',
    moistureContent: '13.1% (Standard Table Spec)',
    purityGrade: '98.5% Whole Grain Consistency',
    millingFacility: 'Top Grade Rice Millers — Mwea Central Facility',
    packType: '50kg Reinforced Woven Bags',
    verifiedBy: 'Milling Supervision — TGM',
    qualityNotes: 'Aspiration and gravity destoned. Meets institutional procurement specifications.',
  },
};
