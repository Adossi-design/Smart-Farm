import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { buildApiUrl } from './utils/api';
import frLocale from './locales/fr.json';
import arLocale from './locales/ar.json';

const enTranslation = {
  welcome: "Welcome to Toumaï Marketplace",
  nav: {
    marketplace: "Marketplace",
    seller: "Seller Access",
    advisor: "Expert Access",
    admin: "Admin",
    login: "Login / Register",
    dashboard: "Dashboard",
    logout: "Logout",
    light: "Light",
    dark: "Dark"
  },
  hero: {
    title: "Fresh from the Farm to Your Table",
    subtitle: "Connect directly with sellers and discover local products.",
    searchPlaceholder: "Search for products...",
    searchBtn: "Search"
  },
  checkout: {
    loginRequired: "Login Required",
    loginPrompt: "Please login to complete your purchase",
    goToLogin: "Go to Login",
    cartEmpty: "Cart is Empty",
    cartEmptyPrompt: "Add some products before checking out",
    continueShopping: "Continue Shopping",
    checkout: "Checkout",
    deliveryAddress: "Delivery Address",
    city: "City",
    deliveryNote: "Delivery arrangements should be discussed directly with the seller via chat/message.",
    orderItems: "Order Items",
    qty: "Qty",
    paymentMethod: "Payment Method",
    debitCreditCard: "Debit/Credit Card",
    secureOnlinePayment: "Secure online payment with Visa, Mastercard",
    orderSummary: "Order Summary",
    subtotal: "Subtotal",
    platformFee: "Platform Fee",
    sellerPayout: "Seller expected payout",
    total: "Total",
    processing: "Processing...",
    placeOrder: "Place Order",
    secureCheckout: "Secure Checkout",
    secureCheckoutDesc: "Your information is encrypted and safe",
    orderPlacedSuccess: "Order Placed Successfully!",
    thankYouRedirecting: "Thank you for your purchase. Redirecting...",
    orderTotal: "Order Total"
  },
  review: {
    ratingPrompt: "Please select a rating",
    submittedSuccess: "Review submitted successfully!",
    submitError: "Error submitting review",
    title: "Rate This Seller",
    rating: "Rating",
    poor: "Poor",
    fair: "Fair",
    good: "Good",
    veryGood: "Very Good",
    excellent: "Excellent",
    commentOptional: "Comment (Optional)",
    commentPlaceholder: "Share your experience with this seller...",
    characters: "characters",
    cancel: "Cancel",
    submit: "Submit Review",
    submitting: "Submitting..."
  },
  report: {
    title: "Report Seller",
    reasonLabel: "Reason for Report",
    selectReason: "Select a reason",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Please explain in detail what happened. Include dates, order numbers, and any evidence if available...",
    cancel: "Cancel",
    submit: "Submit Report",
    submitting: "Submitting...",
    success: "Report submitted successfully. Our team will review it shortly.",
    error: "Error submitting report",
    alert: "Please provide accurate information. False reports may result in account suspension.",
    reasonScam: "Scam/Fraud",
    reasonCounterfeit: "Counterfeit Product",
    reasonQuality: "Product Quality Issue",
    reasonNonDelivery: "Non-Delivery",
    reasonMisrepresented: "Misrepresented Item",
    reasonAbusive: "Rude/Abusive Behavior",
    reasonOther: "Other"
  },
  auth: {
    loginTitle: "Connect to Toumaï Marketplace",
    accessDashboard: "Access your dashboard",
    emailLabel: "Email or Phone",
    emailPlaceholder: "Enter your email or phone",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    loginBtn: "Login",
    noAccount: "Don't have an account?",
    registerFarmer: "Register as Farmer",
    registerSeller: "Register as Seller",
    backToMarket: "Back to Marketplace",
    invalidCredentials: "Invalid credentials. Please try again.",
    loginSuccess: "Login successful"
  },
  common: {
    welcome: "Welcome",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    add: "Add",
    update: "Update",
    search: "Search",
    logout: "Logout",
    loggedOut: "Logged out successfully",
    profile: "Profile",
    settings: "Settings",
    messages: "Messages",
    refresh: "Refresh",
    noResults: "No results found",
    noData: "No data available",
    actions: "Actions",
    close: "Close",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    previous: "Previous",
    export: "Export",
    import: "Import"
  },
  buyer: {
    dashboard: "Buyer Dashboard",
    marketplace: "Marketplace",
    bookmarks: "Bookmarks",
    messages: "Messages",
    profile: "Profile",
    allCategories: "All",
    freshVegetables: "Fresh Vegetables",
    freshFruit: "Fresh Fruit",
    freshMeat: "Fresh Meat",
    freshFish: "Fresh Fish",
    localFood: "Local Food",
    allProducts: "All Products",
    productName: "Product Name",
    price: "Price",
    location: "Location",
    seller: "Seller",
    talkToSeller: "Talk to Seller",
    addToBookmarks: "Add to Bookmarks",
    removeFromBookmarks: "Remove from Bookmarks",
    myConversations: "My Conversations",
    allConversations: "Conversations you have with sellers",
    noMessages: "No messages yet",
    noMessagesDesc: "Use Talk to seller on a product to start a conversation",
    goToMarketplace: "Go to Marketplace",
    myProfile: "My Profile",
    editProfile: "Edit Profile",
    saveProfile: "Save Profile",
    name: "Name",
    email: "Email",
    phone: "Phone",
    profession: "Profession",
    organization: "Organization",
    specialization: "Specialization",
    password: "Password",
    createPassword: "Create Password",
    profileImage: "Profile Image",
    uploadImage: "Upload Image",
    selectImage: "Select Image",
    accountTypeBuyer: "Buyer account",
    tryDifferentSearch: "Try a different name or category.",
    savedProductsDesc: "Products you saved for later",
    noBookmarks: "No bookmarks yet",
    bookmarkHint: "Tap the bookmark icon on a product to save it here.",
    profileEditableInfo: "All your registration information is editable here.",
    profilePicture: "Profile picture",
    newPassword: "New password",
    passwordHint: "Leave blank to keep the current password",
    editProfileBtn: "Edit Profile",
    saveChanges: "Save Changes",
    profileUpdated: "Profile updated successfully",
    profileUpdateFailed: "Failed to update profile"
  },
  seller: {
    dashboard: "Seller Dashboard",
    myProducts: "My Products",
    addProduct: "Add New Product",
    editProduct: "Edit Product",
    deleteProduct: "Delete Product",
    productName: "Product Name",
    category: "Category",
    description: "Description",
    price: "Price",
    quantity: "Quantity",
    unit: "Unit",
    vegetables: "Vegetables",
    fruits: "Fruits",
    grains: "Grains",
    livestock: "Livestock",
    image: "Product Image",
    uploadImage: "Upload Image",
    noProducts: "No products listed yet",
    myProfile: "My Profile",
    editProfile: "Edit Profile",
    location: "Location",
    phone: "Phone",
    email: "Email",
    myMessages: "My Messages",
    conversationsWithBuyers: "Conversations with buyers",
    activeListings: "Active listings",
    activeConversations: "Active conversations",
    ongoingChats: "Ongoing chats",
    responseRate: "Response rate",
    buyerSatisfaction: "Buyer satisfaction",
    basedOnReviews: "Based on {{count}} reviews",
    quickActions: "Quick Actions",
    shareProductsDesc: "Share your products with buyers directly on the marketplace",
    productPublished: "Product published successfully.",
    productUpdated: "Product updated successfully.",
    publishFailed: "Failed to publish product.",
    updateFailed: "Failed to update product.",
    deleteConfirm: "Are you sure you want to delete this product?",
    productDeleted: "Product deleted successfully",
    deleteFailed: "Failed to delete product",
    editProfileBtn: "Edit Profile",
    saveChanges: "Save Changes",
    profileUpdated: "Profile updated successfully",
    profileUpdateFailed: "Failed to update profile"
  },
  farmer: {
    weather: "Weather",
    shareHarvest: "Share your harvest with buyers worldwide",
    productNamePlaceholder: "e.g. Organic Potatoes",
    pricePlaceholder: "e.g. 500 CFA",
    quantityPlaceholder: "e.g. 100",
    locationPlaceholder: "e.g. Musanze",
    descriptionPlaceholder: "Describe your product quality, harvest date, etc...",
    uploadFile: "Upload File",
    imageUrl: "Image URL",
    imageUrlPlaceholder: "https://example.com/image.jpg",
    postProductTitle: "Post Your Product",
    postProductDesc: "Fill in the details below to list your product on the marketplace",
    useDashboardToPost: "Please use the Dashboard section to post products",
    defaultCity: "Musanze, Rwanda",
    defaultDate: "Monday, 24 November 2025",
    temperature: "Temperature",
    humidity: "Humidity",
    windSpeed: "Wind Speed",
    rainChance: "Rain Chance",
    weeklyForecast: "Weekly Forecast",
    accountLabel: "{{role}} Account",
    farmerAccount: "Farmer Account",
    welcomeBack: "Welcome back, {{name}}! 👋",
    dashboardIntro: "Manage your products, check weather, and connect with buyers.",
    activeProducts: "Active Products",
    currentWeather: "Current Weather"
  },
  advisor: {
    dashboard: "Advisor Dashboard",
    advice: "Advice",
    myAdvice: "My Advice",
    postAdvice: "Post New Advice",
    editAdvice: "Edit Advice",
    deleteAdvice: "Delete Advice",
    adviceTitle: "Title",
    adviceCategory: "Category",
    adviceContent: "Content",
    published: "Published",
    generalFarming: "General Farming",
    cropManagement: "Crop Management",
    pestControl: "Pest Control",
    soilHealth: "Soil Health",
    weatherForecast: "Weather Forecast",
    noAdvice: "You haven't posted any advice yet",
    myProfile: "My Profile",
    editProfile: "Edit Profile",
    organization: "Organization",
    specialization: "Specialization"
  },
  admin: {
    dashboard: "Admin Dashboard",
    statistics: "Statistics",
    totalFarmers: "Total Farmers",
    totalAdvisors: "Total Advisors",
    productsListed: "Products Listed",
    advicePosts: "Advice Posts",
    manageFarmers: "Manage Farmers",
    manageAdvisors: "Manage Advisors",
    manageAdmins: "Manage Admins",
    registerAdmin: "Register New Admin",
    registerAdvisor: "Register New Advisor",
    advisorsList: "Registered Advisors",
    farmersList: "Registered Farmers",
    adminsList: "Registered Admins",
    name: "Name",
    email: "Email",
    organization: "Organization",
    specialization: "Specialization",
    status: "Status",
    action: "Action",
    active: "Active",
    inactive: "Inactive",
    noAdvisors: "No advisors found",
    noFarmers: "No farmers found",
    noAdmins: "No admins found",
    exportList: "Export List",
    settings: "Settings",
    role: "Role",
    registeredAt: "Registered At",
    product: "Product",
    stock: "Stock",
    listedAt: "Listed At",
    view: "View",
    uncategorized: "Uncategorized",
    usersLabel: "Users",
    farmersLabel: "Farmers",
    buyersLabel: "Buyers",
    adminsLabel: "Admins",
    productsLabel: "Products",
    unknown: "Unknown",
    noMessages: "No messages",
    msgCount: "{{count}} msgs",
    manageUsers: "Manage Users",
    searchUsersPlaceholder: "Search name, email, phone, location...",
    searchProductsPlaceholder: "Search products by name, category, seller...",
    exportCsv: "Export CSV",
    exportPdf: "Export PDF",
    noUsers: "No users registered yet",
    noUsersFiltered: "No users match your filters",
    platformSnapshot: "Platform Snapshot",
    messagingCoverage: "Messaging Coverage",
    messagingCoverageDesc: "Conversations and message volume are tracked from the same chat flow used by buyers and sellers, so the admin view reflects real platform activity.",
    conversations: "Conversations",
    messages: "Messages",
    marketplaceProducts: "Marketplace Products",
    noProducts: "No products listed yet",
    noLocationSet: "No location set",
    inventoryHealth: "Inventory Health",
    totalProducts: "Total Products",
    categories: "Categories",
    latestListings: "Latest Listings",
    buyerContactFlow: "Buyer Contact Flow",
    buyerContactFlowDesc: "Product cards in the marketplace connect directly to chat, so the admin catalog mirrors what buyers and sellers can actually use.",
    systemAdministrators: "System Administrators",
    noAdminsRegistered: "No admins registered yet",
    registerAdminTitle: "Register Admin",
    fullName: "Full Name",
    adminNamePlaceholder: "Admin Name",
    createAdmin: "Create Admin",
    administrator: "Administrator",
    adminAccount: "Admin Account",
    registerSuccess: "Admin {{name}} registered successfully!",
    registerError: "Error registering admin",
    noDataExport: "No data to export",
    popupBlocked: "Please allow popups to export PDF",
    deleteFailed: "Delete failed",
    deleteUserConfirm: "Delete {{name}}? This will remove their account and related data.",
    deleteUserSuccess: "{{name}} deleted successfully",
    deleteAdminConfirm: "Delete admin {{name}}?",
    deleteAdminSuccess: "Admin {{name}} deleted successfully",
    deleteProductConfirm: "Delete product {{name}}?",
    deleteProductSuccess: "Product {{name}} deleted successfully",
    months: {
      jan: "Jan", feb: "Feb", mar: "Mar", apr: "Apr", may: "May",
      jun: "Jun", jul: "Jul", aug: "Aug", sep: "Sep", oct: "Oct", nov: "Nov", dec: "Dec"
    },
    platformGrowth: "Platform Growth",
    platformGrowthDesc: "Monthly trend of registered users and active conversations on the platform.",
    userDistribution: "User Distribution",
    userDistributionDesc: "Breakdown of all registered accounts by role.",
    productsByCategory: "Products by Category",
    productsByCategoryDesc: "Number of active product listings grouped by category.",
    mlDemandTitle: "AI Demand Forecast",
    mlDemandDesc: "We look at what sellers have been listing lately and how often each category shows up. Categories that keep coming back in recent weeks tend to have more buyers looking for them, so we rank them from most to least in demand.",
    mlDemandScore: "Demand Score",
    mlDemandNote: "Categories with more recent and frequent listings rank highest. The score goes down the older the listing is.",
    reportedUsers: "Reported Users",
    reportedUsersNote: "These users have received at least one report from a buyer.",
    noReportedUsers: "No reported users at this time.",
    reports: "reports"
  },
  chat: {
    messages: "Messages",
    noMessages: "No messages yet",
    typeMessage: "Type your message...",
    send: "Send",
    sending: "Sending...",
    attachFile: "Attach file",
    productChat: "Product chat",
    noLocation: "No location shared",
    unknownSeller: "Unknown seller",
    conversationWith: "Conversation with {{name}}",
    selectConversation: "Select a conversation to start messaging",
    cleanDashboard: "Your chats will appear here with the same clean dashboard style.",
    search: "Search or start a new chat",
    unread: "Unread",
    archived: "Archived",
    noConversations: "No conversations yet",
    searchByName: "Search by name or product"
  },
  chatbot: {
    title: "Toumaï Assistant",
    subtitle: "AI helper • online",
    greeting: "Hi! I'm the Toumaï Assistant. Ask me about products, prices, or how to buy on the marketplace.",
    placeholder: "Ask about products, prices…",
    send: "Send",
    thinking: "Thinking…",
    searching: "Searching the catalog…",
    empty: "I could not find an answer for that.",
    error: "Something went wrong. Please try again.",
    disclaimer: "AI can make mistakes. Verify important details."
  },
  register: {
    title: "Create Your Account",
    selectRole: "Select your role",
    farmer: "Farmer",
    seller: "Seller",
    buyer: "Buyer",
    advisor: "Advisor",
    butcher: "Butcher",
    fisher: "Fisher",
    baker: "Baker",
    gardener: "Gardener",
    other: "Other",
    fullName: "Full Name",
    email: "Email",
    phone: "Phone",
    password: "Password",
    confirmPassword: "Confirm Password",
    location: "Location",
    locationPlaceholder: "Musanze, Muhoza",
    registerBtn: "Register",
    alreadyAccount: "Already have an account?",
    loginHere: "Login here"
  },
  home: {
    browseCategory: "Browse by Category",
    tryCategory: "Try another category or search term.",
    aboutToumi: "About Toumaï",
    aboutDesc1: "Toumaï helps buyers discover trusted sellers, talk directly, save products for later, and shop with more confidence.",
    aboutDesc2: "The platform makes local shopping simpler, safer, and easier to compare.",
    contactUs: "Contact Us",
    aboutTitle: "About Us",
    contactName: "Toumaï",
    contactEmail: "support@toumai.market",
    contactPhone: "+250 732 422 466",
    contactAddress: "KG 2nd Street, Kicukiro"
  },
  product: {
    notEnoughQuantity: "Not enough quantity available",
    noImage: "No image available",
    sellerInfo: "Seller Information",
    priceUnit: "Price per",
    availableQty: "Available Quantity",
    qtyPurchase: "Quantity to Purchase",
    addToCart: "Add to Cart",
    description: "Description",
    noDescription: "No description provided",
    contactSeller: "Contact Seller",
    sellerReviews: "Seller Reviews",
    leaveReview: "Leave a Review",
    reportSeller: "Report Seller",
    noReviews: "No reviews yet",
    sellerSummary: "Seller Summary",
    sellerReviewCount: "This seller has {{count}} customer reviews on Toumaï Marketplace",
    availableNow: "Available now",
    availableQuantityLabel: "Available quantity",
    buy: "Buy"
  },
  profile: {
    editInfo: "Edit your account information here",
    accountType: "Account type",
    contact: "Contact",
    account: "Account",
    editProfile: "Edit Profile",
    saveChanges: "Save Changes",
    saving: "Saving...",
    newPassword: "New password",
    passwordHint: "Leave blank to keep the current password",
    profilePicture: "Profile picture",
    location: "Location",
    organization: "Organization",
    specialization: "Specialization",
    profileUpdated: "Profile updated successfully",
    profileUpdateFailed: "Failed to update profile",
    notSet: "Not set",
    noPhone: "No phone added"
  },
  validation: {
    required: "This field is required",
    emailInvalid: "Please enter a valid email",
    phoneInvalid: "Please enter a valid phone number",
    passwordShort: "Password must be at least 6 characters",
    passwordMismatch: "Passwords do not match",
    imageRequired: "Please select an image",
    registrationFailed: "Registration failed",
    valueGreaterThanZero: "Value must be greater than 0",
    invalidImageUrl: "Image URL must start with http:// or https://",
    fillHighlightedFields: "Please fix the highlighted fields before publishing.",
    detailedDescription: "Please provide a detailed description (at least 20 characters)"
  },
  errors: {
    loadingFailed: "Failed to load data",
    saveFailed: "Failed to save data",
    deleteFailed: "Failed to delete",
    networkError: "Network error occurred",
    notFound: "Not found",
    unauthorized: "Unauthorized",
    forbidden: "Forbidden",
    serverError: "Server error occurred"
  }
};

// Use generated static locale JSON files as authoritative defaults.
const frTranslation = frLocale || {};
const arTranslation = arLocale || {};

// Flatten nested object to array of { path, value }
const flattenObject = (obj, prefix = '') => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      acc.push(...flattenObject(value, fullKey));
    } else {
      acc.push({ path: fullKey, value });
    }
    return acc;
  }, []);
};

// Set nested value by dot-path
const setNestedValue = (obj, path, value) => {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
};

const SUPPORTED_LANGUAGES = ['en', 'fr', 'ar'];
const translationCache = {};

const normalizeLanguage = (lang) => {
  if (!lang || typeof lang !== 'string') return 'en';
  const normalized = lang.split('-')[0].toLowerCase();
  return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : 'en';
};

const cacheKey = (lang) => `i18n_bundle_v3_${lang}`;
const TRANSLATION_FETCH_TIMEOUT_MS = 8000;

const applyDocumentDirection = (lang) => {
  if (typeof document === 'undefined') return;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  if (document.body) {
    document.body.setAttribute('dir', dir);
  }
};

const fetchTranslation = async (lang) => {
  const normalized = normalizeLanguage(lang);
  if (normalized === 'en') return enTranslation;
  if (translationCache[normalized]) return translationCache[normalized];

  try {
    const cached = localStorage.getItem(cacheKey(normalized));
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') {
        translationCache[normalized] = parsed;
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to read cached translation bundle:', error);
  }

  const entries = flattenObject(enTranslation);
  const texts = entries.map(e => e.value);

  // If we have a generated static bundle, return it immediately and
  // launch a background merge from the translation API to enhance it.
  if (normalized === 'fr' && frTranslation && Object.keys(frTranslation).length) {
    translationCache[normalized] = frTranslation;
    try { localStorage.setItem(cacheKey(normalized), JSON.stringify(frTranslation)); } catch (error) { console.warn('Failed to cache fr translation bundle:', error); }

    (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TRANSLATION_FETCH_TIMEOUT_MS * 4);
        const response = await fetch(buildApiUrl('/api/translate'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts, target: normalized, source: 'en' }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) return;
        const data = await response.json();
        const merged = JSON.parse(JSON.stringify(frTranslation));
        entries.forEach((entry, i) => {
          if (data.translations && data.translations[i]) {
            setNestedValue(merged, entry.path, data.translations[i]);
          }
        });
        translationCache[normalized] = merged;
        try { localStorage.setItem(cacheKey(normalized), JSON.stringify(merged)); } catch (error) { console.warn('Failed to cache merged fr translation bundle:', error); }
        if (i18n.language === normalized) {
          try { i18n.addResourceBundle(normalized, 'translation', merged, true, true); i18n.changeLanguage(normalized); } catch (error) { console.warn('Failed to update fr language bundle:', error); }
        }
      } catch (error) {
        console.warn('Background fr translation merge failed:', error);
      }
    })();

    return frTranslation;
  }

  if (normalized === 'ar' && arTranslation && Object.keys(arTranslation).length) {
    translationCache[normalized] = arTranslation;
    try { localStorage.setItem(cacheKey(normalized), JSON.stringify(arTranslation)); } catch (error) { console.warn('Failed to cache ar translation bundle:', error); }

    (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TRANSLATION_FETCH_TIMEOUT_MS * 4);
        const response = await fetch(buildApiUrl('/api/translate'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts, target: normalized, source: 'en' }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) return;
        const data = await response.json();
        const merged = JSON.parse(JSON.stringify(arTranslation));
        entries.forEach((entry, i) => {
          if (data.translations && data.translations[i]) {
            setNestedValue(merged, entry.path, data.translations[i]);
          }
        });
        translationCache[normalized] = merged;
        try { localStorage.setItem(cacheKey(normalized), JSON.stringify(merged)); } catch (error) { console.warn('Failed to cache merged ar translation bundle:', error); }
        if (i18n.language === normalized) {
          try { i18n.addResourceBundle(normalized, 'translation', merged, true, true); i18n.changeLanguage(normalized); } catch (error) { console.warn('Failed to update ar language bundle:', error); }
        }
      } catch (error) {
        console.warn('Background ar translation merge failed:', error);
      }
    })();

    return arTranslation;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TRANSLATION_FETCH_TIMEOUT_MS);

    const response = await fetch(buildApiUrl('/api/translate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, target: normalized, source: 'en' }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error('Translation API failed');

    const data = await response.json();
    const translated = {};

    entries.forEach((entry, i) => {
      setNestedValue(translated, entry.path, data.translations[i] || entry.value);
    });

    translationCache[normalized] = translated;
    try {
      localStorage.setItem(cacheKey(normalized), JSON.stringify(translated));
    } catch (error) {
      console.warn('Failed to cache translated bundle:', error);
    }
    return translated;
  } catch (error) {
    console.warn('Translation service unavailable, keeping app functional:', error);
    return null;
  }
};

// Always start with 'en' so t() resolves immediately on first render
i18n
  .use(initReactI18next)
  .init({
    debug: false,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    resources: {
      en: { translation: enTranslation },
      fr: { translation: frTranslation },
      ar: { translation: arTranslation }
    }
  });

// Public API: switch language, fetch bundle if needed, persist choice
export const changeAppLanguage = async (lang) => {
  const normalized = normalizeLanguage(lang);
  try { localStorage.setItem('i18n_lang', normalized); } catch (error) { console.warn('Failed to persist language preference:', error); }
  if (normalized === 'en') {
    i18n.changeLanguage('en');
    applyDocumentDirection('en');
    return;
  }

  // Switch immediately using built-in bundles to keep UI responsive.
  i18n.changeLanguage(normalized);
  applyDocumentDirection(normalized);

  const hasCachedDynamicBundle = (() => {
    try {
      return !!localStorage.getItem(cacheKey(normalized));
    } catch {
      return false;
    }
  })();

  if (!i18n.hasResourceBundle(normalized, 'translation') || !hasCachedDynamicBundle) {
    const translated = await fetchTranslation(normalized);
    if (translated) {
      i18n.addResourceBundle(normalized, 'translation', translated, true, true);
      // Re-apply language so newly merged keys render immediately.
      i18n.changeLanguage(normalized);
      applyDocumentDirection(normalized);
    }
  }
};

// On startup, restore previously selected language
const storedLang = (() => { try { return localStorage.getItem('i18n_lang'); } catch { return null; } })();
const browserLang = typeof navigator !== 'undefined' ? normalizeLanguage(navigator.language) : 'en';
const preferredLang = normalizeLanguage(storedLang || browserLang);

applyDocumentDirection(preferredLang);
if (preferredLang !== 'en') {
  changeAppLanguage(preferredLang);
}

i18n.on('languageChanged', (lang) => {
  applyDocumentDirection(normalizeLanguage(lang));
});

export default i18n;
