export function getProductFallbackImage(name?: string, categorySlug?: string): string {
  const n = (name || '').toLowerCase();
  const c = (categorySlug || '').toLowerCase();

  // Fresh Fruits
  if (n.includes('mango') || n.includes('aam')) {
    return 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('apple') || n.includes('seb')) {
    return 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('banana') || n.includes('kela')) {
    return 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('orange') || n.includes('santra') || n.includes('citrus') || n.includes('mosambi')) {
    return 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('pomegranate') || n.includes('anar')) {
    return 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('papaya') || n.includes('papita')) {
    return 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('watermelon') || n.includes('tarbooz')) {
    return 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('coconut') || n.includes('nariyal')) {
    return 'https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?w=800&auto=format&fit=crop&q=80';
  }

  // Fresh Veggies & Herbs
  if (n.includes('tomato') || n.includes('tamatar')) {
    return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('potato') || n.includes('aloo')) {
    return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('onion') || n.includes('pyaz')) {
    return 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('carrot') || n.includes('gajar')) {
    return 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('turmeric') || n.includes('haldi')) {
    return 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('ginger') || n.includes('adrak')) {
    return 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('chilli') || n.includes('mirchi') || n.includes('pepper')) {
    return 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('lemon') || n.includes('nimbu')) {
    return 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('broccoli') || n.includes('cabbage') || n.includes('spinach') || n.includes('palak')) {
    return 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=800&auto=format&fit=crop&q=80';
  }

  // Dairy & Honey
  if (n.includes('milk') || n.includes('doodh') || n.includes('paneer') || n.includes('ghee') || n.includes('butter') || n.includes('curd')) {
    return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('honey') || n.includes('madhu')) {
    return 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('egg') || n.includes('anda')) {
    return 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&auto=format&fit=crop&q=80';
  }

  // Grains, Rice, Pulses & Seeds
  if (n.includes('rice') || n.includes('chawal') || n.includes('paddy')) {
    return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('wheat') || n.includes('gehun') || n.includes('flour') || n.includes('atta')) {
    return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('dal') || n.includes('lentil') || n.includes('pulse') || n.includes('grain')) {
    return 'https://images.unsplash.com/photo-1585994192701-f1a505c8574a?w=800&auto=format&fit=crop&q=80';
  }
  if (n.includes('seed') || n.includes('beej')) {
    return 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=800&auto=format&fit=crop&q=80';
  }

  // Soil & Farming
  if (
    c.includes('organic') ||
    n.includes('vermicompost') ||
    n.includes('compost') ||
    n.includes('manure') ||
    n.includes('fertilizer') ||
    n.includes('khad') ||
    n.includes('neem')
  ) {
    return 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80';
  }

  // Electronics & Mobile Accessories
  if (
    c.includes('mobile') ||
    c.includes('electronic') ||
    n.includes('charger') ||
    n.includes('case') ||
    n.includes('cable') ||
    n.includes('earbud') ||
    n.includes('phone') ||
    n.includes('adapter') ||
    n.includes('headphone')
  ) {
    return 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80';
  }

  // Clothes & Apparel
  if (
    c.includes('clothes') ||
    c.includes('apparel') ||
    n.includes('shirt') ||
    n.includes('kurta') ||
    n.includes('cotton') ||
    n.includes('khadi') ||
    n.includes('saree') ||
    n.includes('pant') ||
    n.includes('dress')
  ) {
    return 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80';
  }

  // Equipment & Tools
  if (c.includes('tool') || c.includes('equipment') || n.includes('tool') || n.includes('pump') || n.includes('spray')) {
    return 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80';
  }

  // Default produce basket
  return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80';
}

export function sanitizeProductImageUrl(
  rawUrl?: string,
  productName?: string,
  categorySlug?: string
): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return getProductFallbackImage(productName, categorySlug);
  }

  const trimmed = rawUrl.trim();

  // If empty or invalid
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
    return getProductFallbackImage(productName, categorySlug);
  }

  // Base64 data images are valid
  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  // Must start with http:// or https://
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return getProductFallbackImage(productName, categorySlug);
  }

  // Try to extract direct image from google imgres or search query if applicable
  if (trimmed.includes('google.') && trimmed.includes('imgurl=')) {
    try {
      const urlObj = new URL(trimmed);
      const direct = urlObj.searchParams.get('imgurl');
      if (direct && direct.startsWith('http')) {
        return direct;
      }
    } catch {
      // ignore
    }
  }

  // Known webpage hosts / paths that are HTML pages, NOT image files:
  const isWebpage =
    trimmed.includes('/products/') ||
    trimmed.includes('/product/') ||
    trimmed.includes('/item/') ||
    trimmed.includes('/dp/') ||
    trimmed.includes('/gp/') ||
    trimmed.includes('amazon.in') ||
    trimmed.includes('flipkart.com') ||
    trimmed.includes('foodcare.in') ||
    trimmed.includes('blinkit.com') ||
    trimmed.includes('zeptonow.com') ||
    trimmed.includes('bigbasket.com') ||
    trimmed.includes('jiomart.com') ||
    trimmed.includes('indiamart.com') ||
    trimmed.includes('myntra.com') ||
    trimmed.includes('youtube.com') ||
    trimmed.includes('instagram.com') ||
    trimmed.includes('facebook.com') ||
    (trimmed.includes('wikipedia.org') && !trimmed.includes('upload.wikimedia.org')) ||
    /\.(html|htm|php|asp|aspx)($|\?)/i.test(trimmed);

  // If it's a known webpage link, replace it with high-res keyword match
  if (isWebpage) {
    return getProductFallbackImage(productName, categorySlug);
  }

  return trimmed;
}

/**
 * Universal product images extractor.
 * Safely handles any format: JSON string, URL string, Array of URLs, nested arrays, null/undefined,
 * and returns an array of verified sanitized image URLs with keyword fallback.
 */
export function extractProductImages(
  imagesField: any,
  productName?: string,
  categorySlug?: string
): string[] {
  const fallback = getProductFallbackImage(productName, categorySlug);
  let rawList: string[] = [];

  if (Array.isArray(imagesField)) {
    // Flatten any nested arrays and ensure strings
    rawList = imagesField
      .flat(Infinity)
      .map((item) => (typeof item === 'string' ? item : ''))
      .filter((s) => s.trim().length > 0);
  } else if (typeof imagesField === 'string' && imagesField.trim().length > 0) {
    const trimmed = imagesField.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          rawList = parsed
            .flat(Infinity)
            .map((item) => (typeof item === 'string' ? item : String(item)))
            .filter((s) => s.trim().length > 0);
        } else if (typeof parsed === 'string' && parsed.trim().length > 0) {
          rawList = [parsed.trim()];
        }
      } catch {
        rawList = [trimmed];
      }
    } else {
      rawList = [trimmed];
    }
  }

  // Sanitize each image URL
  const sanitized = rawList
    .map((url) => sanitizeProductImageUrl(url, productName, categorySlug))
    .filter(Boolean);

  if (sanitized.length === 0) {
    return [fallback];
  }

  return sanitized;
}

/**
 * Universal product main image extractor.
 * Always returns a clean, direct, valid image string.
 */
export function extractProductMainImage(
  imagesField: any,
  productName?: string,
  categorySlug?: string
): string {
  const list = extractProductImages(imagesField, productName, categorySlug);
  return list[0] || getProductFallbackImage(productName, categorySlug);
}
