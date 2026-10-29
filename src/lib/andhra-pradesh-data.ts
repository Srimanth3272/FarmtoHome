export interface APDistrict {
  id: string;
  name: string;
  teluguName: string;
  headquarters: string;
  region: 'Coastal Andhra' | 'Rayalaseema' | 'North Andhra' | 'Godavari Delta';
  pinPrefixes: string[];
  primaryPin: string;
  samplePins: string[];
  deliveryType: 'SAME_DAY' | 'NEXT_DAY' | 'EXPRESS_24H';
  estimatedDeliveryHours: string;
  deliveryFee: number;
  hubName: string;
  famousProduce: string[];
  activeFarmersCount: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const ANDHRA_PRADESH_DISTRICTS: APDistrict[] = [
  {
    id: 'ntr-vijayawada',
    name: 'NTR (Vijayawada)',
    teluguName: 'ఎన్టీఆర్ (విజయవాడ)',
    headquarters: 'Vijayawada',
    region: 'Coastal Andhra',
    pinPrefixes: ['520', '521'],
    primaryPin: '520001',
    samplePins: ['520001', '520002', '520008', '520010', '520012', '521225'],
    deliveryType: 'SAME_DAY',
    estimatedDeliveryHours: '4 - 8 Hours (Same Day)',
    deliveryFee: 30,
    hubName: 'Amaravati Central Cold-Chain HQ',
    famousProduce: ['Krishna Delta Sona Masoori Rice', 'Banganapalli Mangoes', 'Sweet Sugarcane', 'Fresh Organic Veggies'],
    activeFarmersCount: 312,
    coordinates: { lat: 16.5062, lng: 80.6480 },
  },
  {
    id: 'guntur',
    name: 'Guntur',
    teluguName: 'గుంటూరు',
    headquarters: 'Guntur',
    region: 'Coastal Andhra',
    pinPrefixes: ['522'],
    primaryPin: '522001',
    samplePins: ['522001', '522002', '522006', '522019', '522034', '522501'],
    deliveryType: 'SAME_DAY',
    estimatedDeliveryHours: '6 - 10 Hours (Same Day)',
    deliveryFee: 30,
    hubName: 'Guntur Agri-Logistics & Spices Corridor Hub',
    famousProduce: ['Guntur Sannam Chillies', 'Pure Turmeric', 'Black Gram', 'Organic Cotton', 'Tobacco-free Leafy Greens'],
    activeFarmersCount: 284,
    coordinates: { lat: 16.3067, lng: 80.4365 },
  },
  {
    id: 'visakhapatnam',
    name: 'Visakhapatnam (Vizag)',
    teluguName: 'విశాఖపట్నం',
    headquarters: 'Visakhapatnam',
    region: 'North Andhra',
    pinPrefixes: ['530', '531'],
    primaryPin: '530001',
    samplePins: ['530001', '530002', '530016', '530017', '530026', '530048'],
    deliveryType: 'NEXT_DAY',
    estimatedDeliveryHours: '12 - 20 Hours (Express Next-Day)',
    deliveryFee: 40,
    hubName: 'Vizag Coastal Deep-Logistics Center',
    famousProduce: ['Coastal Papaya', 'Araku Valley High-Altitude Coffee', 'Bheemli Watermelons', 'Organic Cashew'],
    activeFarmersCount: 219,
    coordinates: { lat: 17.6868, lng: 83.2185 },
  },
  {
    id: 'tirupati',
    name: 'Tirupati',
    teluguName: 'తిరుపతి',
    headquarters: 'Tirupati',
    region: 'Rayalaseema',
    pinPrefixes: ['517'],
    primaryPin: '517501',
    samplePins: ['517501', '517502', '517507', '517520', '517561', '517644'],
    deliveryType: 'NEXT_DAY',
    estimatedDeliveryHours: '12 - 24 Hours (Next-Day)',
    deliveryFee: 40,
    hubName: 'Tirupati Southern Rayalaseema Agripark',
    famousProduce: ['Chandragiri Groundnuts', 'Desi Cow A2 Ghee', 'Seshachalam Forest Honey', 'Organic Betel Leaves'],
    activeFarmersCount: 198,
    coordinates: { lat: 13.6288, lng: 79.4192 },
  },
  {
    id: 'east-godavari',
    name: 'East Godavari (Rajamahendravaram)',
    teluguName: 'తూర్పు గోదావరి (రాజమండ్రి)',
    headquarters: 'Rajamahendravaram',
    region: 'Godavari Delta',
    pinPrefixes: ['533'],
    primaryPin: '533101',
    samplePins: ['533101', '533103', '533105', '533107', '533287', '533296'],
    deliveryType: 'NEXT_DAY',
    estimatedDeliveryHours: '12 - 18 Hours (Next-Day)',
    deliveryFee: 35,
    hubName: 'Godavari Basin Riverfront Agri-Depot',
    famousProduce: ['Godavari Karpura Plantains', 'Organic Sweet Corn', 'Kadiyam Nursery Saplings', 'Desi Paddy'],
    activeFarmersCount: 265,
    coordinates: { lat: 17.0005, lng: 81.8040 },
  },
  {
    id: 'kakinada',
    name: 'Kakinada',
    teluguName: 'కాకినాడ',
    headquarters: 'Kakinada',
    region: 'Coastal Andhra',
    pinPrefixes: ['533'],
    primaryPin: '533001',
    samplePins: ['533001', '533002', '533003', '533006', '533016', '533468'],
    deliveryType: 'NEXT_DAY',
    estimatedDeliveryHours: '14 - 20 Hours (Next-Day)',
    deliveryFee: 40,
    hubName: 'Kakinada Seaport Agro-Coldchain',
    famousProduce: ['Coastal Cashews', 'Organic Jaggery Delights', 'Delta Coconuts', 'Prawn-friendly organic feed'],
    activeFarmersCount: 178,
    coordinates: { lat: 16.9891, lng: 82.2475 },
  },
  {
    id: 'west-godavari',
    name: 'West Godavari (Bhimavaram)',
    teluguName: 'పశ్చిమ గోదావరి (భీమవరం)',
    headquarters: 'Bhimavaram',
    region: 'Godavari Delta',
    pinPrefixes: ['534'],
    primaryPin: '534201',
    samplePins: ['534201', '534202', '534211', '534260', '534329'],
    deliveryType: 'NEXT_DAY',
    estimatedDeliveryHours: '10 - 16 Hours (Next-Day)',
    deliveryFee: 35,
    hubName: 'Delta Agri-Corridor Station - Tanuku/Bhimavaram',
    famousProduce: ['Traditional Sona Masoori Rice', 'Natural Jaggery Powder', 'Betel Vine leaves', 'Desi Buffalo Ghee'],
    activeFarmersCount: 230,
    coordinates: { lat: 16.5449, lng: 81.5212 },
  },
  {
    id: 'eluru',
    name: 'Eluru',
    teluguName: 'ఏలూరు',
    headquarters: 'Eluru',
    region: 'Coastal Andhra',
    pinPrefixes: ['534'],
    primaryPin: '534001',
    samplePins: ['534001', '534002', '534005', '534006', '534007', '534101'],
    deliveryType: 'SAME_DAY',
    estimatedDeliveryHours: '8 - 12 Hours (Same Day)',
    deliveryFee: 35,
    hubName: 'Eluru Horticulture & Agroforestry Center',
    famousProduce: ['Organic Guava', 'Cocoa Beans', 'Oil Palm Fresh Harvest', 'Green Leafy Vegetables'],
    activeFarmersCount: 164,
    coordinates: { lat: 16.7107, lng: 81.0952 },
  },
  {
    id: 'krishna',
    name: 'Krishna (Machilipatnam)',
    teluguName: 'కృష్ణా (మచిలీపట్నం)',
    headquarters: 'Machilipatnam',
    region: 'Coastal Andhra',
    pinPrefixes: ['521'],
    primaryPin: '521001',
    samplePins: ['521001', '521002', '521139', '521149', '521163', '521301'],
    deliveryType: 'SAME_DAY',
    estimatedDeliveryHours: '6 - 12 Hours (Same Day)',
    deliveryFee: 30,
    hubName: 'Krishna Coastal Agri Logistic Center',
    famousProduce: ['Organic Pulses', 'Machilipatnam Natural Cane Sugar', 'Coastal Vegetables', 'Kalamkari Natural Plant Dyes'],
    activeFarmersCount: 189,
    coordinates: { lat: 16.1809, lng: 81.1303 },
  },
  {
    id: 'kurnool',
    name: 'Kurnool',
    teluguName: 'కర్నూలు',
    headquarters: 'Kurnool',
    region: 'Rayalaseema',
    pinPrefixes: ['518'],
    primaryPin: '518001',
    samplePins: ['518001', '518002', '518003', '518004', '518218', '518463'],
    deliveryType: 'EXPRESS_24H',
    estimatedDeliveryHours: '16 - 24 Hours (Express Dispatch)',
    deliveryFee: 40,
    hubName: 'Tungabhadra Gateway Agripark',
    famousProduce: ['Kurnool Sona Masoori Rice', 'Organic Sunflower Seeds', 'Kurnool Onions', 'Red Sorghum'],
    activeFarmersCount: 176,
    coordinates: { lat: 15.8281, lng: 78.0373 },
  },
  {
    id: 'nandyal',
    name: 'Nandyal',
    teluguName: 'నంద్యాల',
    headquarters: 'Nandyal',
    region: 'Rayalaseema',
    pinPrefixes: ['518'],
    primaryPin: '518501',
    samplePins: ['518501', '518502', '518511', '518543', '518583'],
    deliveryType: 'EXPRESS_24H',
    estimatedDeliveryHours: '16 - 24 Hours',
    deliveryFee: 40,
    hubName: 'Nallamala Agri Hub',
    famousProduce: ['Foxtail Millet (Korra)', 'Organic Bengal Gram', 'Chilli Powder', 'Jowar'],
    activeFarmersCount: 142,
    coordinates: { lat: 15.4886, lng: 78.4836 },
  },
  {
    id: 'ananthapuramu',
    name: 'Ananthapuramu',
    teluguName: 'అనంతపురం',
    headquarters: 'Ananthapuramu',
    region: 'Rayalaseema',
    pinPrefixes: ['515'],
    primaryPin: '515001',
    samplePins: ['515001', '515002', '515004', '515411', '515701', '515865'],
    deliveryType: 'EXPRESS_24H',
    estimatedDeliveryHours: '18 - 24 Hours',
    deliveryFee: 45,
    hubName: 'Anantapur Dryland Organic Research & Transit Hub',
    famousProduce: ['Anantapur Groundnuts', 'Sweet Oranges (Mosambi)', 'Pomegranates', 'Finger Millet (Ragi)'],
    activeFarmersCount: 165,
    coordinates: { lat: 14.6819, lng: 77.6006 },
  },
  {
    id: 'sri-sathya-sai',
    name: 'Sri Sathya Sai (Puttaparthi)',
    teluguName: 'శ్రీ సత్యసాయి (పుట్టపర్తి)',
    headquarters: 'Puttaparthi',
    region: 'Rayalaseema',
    pinPrefixes: ['515'],
    primaryPin: '515134',
    samplePins: ['515134', '515133', '515201', '515211', '515671'],
    deliveryType: 'EXPRESS_24H',
    estimatedDeliveryHours: '18 - 24 Hours',
    deliveryFee: 45,
    hubName: 'Puttaparthi Eco-Farm Hub',
    famousProduce: ['Organic Millets', 'Cold-Pressed Groundnut Oil', 'Moringa / Drumstick Pods', 'Papaya'],
    activeFarmersCount: 110,
    coordinates: { lat: 14.1652, lng: 77.8115 },
  },
  {
    id: 'ysr-kadapa',
    name: 'YSR Kadapa',
    teluguName: 'వైఎస్ఆర్ కడప',
    headquarters: 'Kadapa',
    region: 'Rayalaseema',
    pinPrefixes: ['516'],
    primaryPin: '516001',
    samplePins: ['516001', '516002', '516003', '516101', '516172', '516360'],
    deliveryType: 'EXPRESS_24H',
    estimatedDeliveryHours: '16 - 22 Hours',
    deliveryFee: 40,
    hubName: 'Pennar Valley Agro-Logistics Center',
    famousProduce: ['Cuddapah Turmeric', 'Sweet Lime', 'Banana Stems', 'Red Gram Pappu'],
    activeFarmersCount: 154,
    coordinates: { lat: 14.4674, lng: 78.8242 },
  },
  {
    id: 'annamayya',
    name: 'Annamayya (Rayachoti)',
    teluguName: 'అన్నమయ్య (రాయచోటి)',
    headquarters: 'Rayachoti',
    region: 'Rayalaseema',
    pinPrefixes: ['516'],
    primaryPin: '516269',
    samplePins: ['516269', '516126', '516216', '516247', '517325'],
    deliveryType: 'EXPRESS_24H',
    estimatedDeliveryHours: '18 - 24 Hours',
    deliveryFee: 40,
    hubName: 'Rayachoti Horticultural Dispatch',
    famousProduce: ['Rayachoti Tomatoes', 'Guavas', 'Organic Papaya', 'Pearl Millet (Sajja)'],
    activeFarmersCount: 128,
    coordinates: { lat: 14.0583, lng: 78.7523 },
  },
  {
    id: 'chittoor',
    name: 'Chittoor',
    teluguName: 'చిత్తూరు',
    headquarters: 'Chittoor',
    region: 'Rayalaseema',
    pinPrefixes: ['517'],
    primaryPin: '517001',
    samplePins: ['517001', '517002', '517415', '517424', '517425'],
    deliveryType: 'EXPRESS_24H',
    estimatedDeliveryHours: '18 - 24 Hours',
    deliveryFee: 40,
    hubName: 'Chittoor Dairy & Mango Agro-Depot',
    famousProduce: ['Totapuri Mango Pulp', 'A2 Desi Cow Milk & Butter', 'Organic Jaggery Blocks', 'Tomato'],
    activeFarmersCount: 205,
    coordinates: { lat: 13.2172, lng: 79.1003 },
  },
  {
    id: 'spsr-nellore',
    name: 'Sri Potti Sriramulu Nellore',
    teluguName: 'శ్రీ పొట్టి శ్రీరాములు నెల్లూరు',
    headquarters: 'Nellore',
    region: 'Coastal Andhra',
    pinPrefixes: ['524'],
    primaryPin: '524001',
    samplePins: ['524001', '524002', '524003', '524004', '524101', '524305'],
    deliveryType: 'NEXT_DAY',
    estimatedDeliveryHours: '12 - 18 Hours',
    deliveryFee: 35,
    hubName: 'Nellore Coastal Paddy & Citrus Depot',
    famousProduce: ['Nellore Molagolukulu Rice', 'Organic Sweet Lemons (Nimmakaya)', 'Black Gram', 'Betel Leaves'],
    activeFarmersCount: 195,
    coordinates: { lat: 14.4426, lng: 79.9865 },
  },
  {
    id: 'prakasam',
    name: 'Prakasam (Ongole)',
    teluguName: 'ప్రకాశం (ఒంగోలు)',
    headquarters: 'Ongole',
    region: 'Coastal Andhra',
    pinPrefixes: ['523'],
    primaryPin: '523001',
    samplePins: ['523001', '523002', '523225', '523260', '523316'],
    deliveryType: 'NEXT_DAY',
    estimatedDeliveryHours: '10 - 16 Hours',
    deliveryFee: 35,
    hubName: 'Ongole Central Agro-Corridor',
    famousProduce: ['Ongole Desi Cow Ghee', 'Red Gram (Kandi Pappu)', 'Organic Sesame Seeds', 'Chillies'],
    activeFarmersCount: 168,
    coordinates: { lat: 15.5057, lng: 80.0499 },
  },
  {
    id: 'bapatla',
    name: 'Bapatla',
    teluguName: 'బాపట్ల',
    headquarters: 'Bapatla',
    region: 'Coastal Andhra',
    pinPrefixes: ['522'],
    primaryPin: '522101',
    samplePins: ['522101', '522113', '522311', '522317', '522329'],
    deliveryType: 'SAME_DAY',
    estimatedDeliveryHours: '6 - 12 Hours (Same Day)',
    deliveryFee: 30,
    hubName: 'Bapatla Agritech Center Hub',
    famousProduce: ['Bapatla Saline-resistant Rice', 'Cashew nuts', 'Watermelon', 'Coastal Vegetables'],
    activeFarmersCount: 144,
    coordinates: { lat: 15.9042, lng: 80.4674 },
  },
  {
    id: 'palnadu',
    name: 'Palnadu (Narasaraopet)',
    teluguName: 'పల్నాడు (నరసరావుపేట)',
    headquarters: 'Narasaraopet',
    region: 'Coastal Andhra',
    pinPrefixes: ['522'],
    primaryPin: '522601',
    samplePins: ['522601', '522615', '522403', '522413', '522426'],
    deliveryType: 'SAME_DAY',
    estimatedDeliveryHours: '6 - 12 Hours (Same Day)',
    deliveryFee: 30,
    hubName: 'Palnadu Agro-Junction',
    famousProduce: ['Hot Red Chillies', 'Pure Raw Cotton', 'Sweet Lime', 'Country Chicken Eggs'],
    activeFarmersCount: 172,
    coordinates: { lat: 16.2344, lng: 80.0490 },
  },
  {
    id: 'konaseema',
    name: 'Dr. B.R. Ambedkar Konaseema',
    teluguName: 'డా. బి.ఆర్. అంబేద్కర్ కోనసీమ',
    headquarters: 'Amalapuram',
    region: 'Godavari Delta',
    pinPrefixes: ['533'],
    primaryPin: '533201',
    samplePins: ['533201', '533212', '533221', '533249', '533561'],
    deliveryType: 'NEXT_DAY',
    estimatedDeliveryHours: '12 - 18 Hours',
    deliveryFee: 35,
    hubName: 'Konaseema Delta Coconut Island Hub',
    famousProduce: ['Sweet Tender Coconuts', 'Palm Jaggery (Thati Bellam)', 'Konaseema Bananas', 'Fresh Turmeric'],
    activeFarmersCount: 224,
    coordinates: { lat: 16.5787, lng: 82.0061 },
  },
  {
    id: 'anakapalli',
    name: 'Anakapalli',
    teluguName: 'అనకాపల్లి',
    headquarters: 'Anakapalli',
    region: 'North Andhra',
    pinPrefixes: ['531'],
    primaryPin: '531001',
    samplePins: ['531001', '531002', '531019', '531031', '531055'],
    deliveryType: 'NEXT_DAY',
    estimatedDeliveryHours: '14 - 20 Hours',
    deliveryFee: 40,
    hubName: 'Anakapalli Jaggery Trade & Dispatch Center',
    famousProduce: ['Famous Anakapalli Pure Jaggery', 'Sugarcane Juice Molasses', 'Sesame Seeds', 'Groundnuts'],
    activeFarmersCount: 153,
    coordinates: { lat: 17.6896, lng: 83.0033 },
  },
  {
    id: 'asr-district',
    name: 'Alluri Sitharama Raju (Paderu)',
    teluguName: 'అల్లూరి సీతారామరాజు (పాడేరు)',
    headquarters: 'Paderu',
    region: 'North Andhra',
    pinPrefixes: ['531', '533'],
    primaryPin: '531024',
    samplePins: ['531024', '531077', '531111', '531149', '533350'],
    deliveryType: 'EXPRESS_24H',
    estimatedDeliveryHours: '20 - 30 Hours',
    deliveryFee: 45,
    hubName: 'Araku Valley Tribal Organics Hub',
    famousProduce: ['GI Certified Araku Organic Coffee', 'Wild Tribal Honey', 'Hill Turmeric (Kasturi Pasupu)', 'Pippallu (Long Pepper)'],
    activeFarmersCount: 134,
    coordinates: { lat: 18.0833, lng: 82.6667 },
  },
  {
    id: 'vizianagaram',
    name: 'Vizianagaram',
    teluguName: 'విజయనగరం',
    headquarters: 'Vizianagaram',
    region: 'North Andhra',
    pinPrefixes: ['535'],
    primaryPin: '535001',
    samplePins: ['535001', '535002', '535003', '535204', '535216'],
    deliveryType: 'NEXT_DAY',
    estimatedDeliveryHours: '16 - 22 Hours',
    deliveryFee: 40,
    hubName: 'Vizianagaram North Corridor Agripark',
    famousProduce: ['Suvarnarekha Mangoes', 'Jute Farm Products', 'Organic Cashews', 'Groundnuts'],
    activeFarmersCount: 148,
    coordinates: { lat: 18.1067, lng: 83.3956 },
  },
  {
    id: 'parvathipuram-manyam',
    name: 'Parvathipuram Manyam',
    teluguName: 'పార్వతీపురం మన్యం',
    headquarters: 'Parvathipuram',
    region: 'North Andhra',
    pinPrefixes: ['535'],
    primaryPin: '535501',
    samplePins: ['535501', '535502', '535522', '535525', '535591'],
    deliveryType: 'EXPRESS_24H',
    estimatedDeliveryHours: '20 - 28 Hours',
    deliveryFee: 45,
    hubName: 'Manyam Forest Produce Dispatch',
    famousProduce: ['Hill Ragi (Finger Millet)', 'Native Pulses', 'Organic Tamarind', 'Amla (Indian Gooseberry)'],
    activeFarmersCount: 112,
    coordinates: { lat: 18.7706, lng: 83.4276 },
  },
  {
    id: 'srikakulam',
    name: 'Srikakulam',
    teluguName: 'శ్రీకాకుళం',
    headquarters: 'Srikakulam',
    region: 'North Andhra',
    pinPrefixes: ['532'],
    primaryPin: '532001',
    samplePins: ['532001', '532005', '532201', '532222', '532407', '532455'],
    deliveryType: 'EXPRESS_24H',
    estimatedDeliveryHours: '18 - 26 Hours',
    deliveryFee: 45,
    hubName: 'Srikakulam Coastal Agro Station',
    famousProduce: ['Uddanam Organic Cashews', 'Red Rice', 'Native Black Gram', 'Coconut Oil'],
    activeFarmersCount: 156,
    coordinates: { lat: 18.2949, lng: 83.8938 },
  },
];

// Helper to check if a PIN code belongs to Andhra Pradesh (51xxxx, 52xxxx, 53xxxx)
export function isAndhraPradeshPincode(pincode: string): boolean {
  if (!pincode || pincode.length !== 6) return false;
  const prefix = pincode.substring(0, 2);
  return prefix === '51' || prefix === '52' || prefix === '53';
}

// Find district in Andhra Pradesh based on 6-digit PIN
export function findDistrictByPincode(pincode: string): APDistrict | null {
  if (!isAndhraPradeshPincode(pincode)) return null;

  // First check exact sample matches
  const exactMatch = ANDHRA_PRADESH_DISTRICTS.find((d) =>
    d.samplePins.includes(pincode) || d.primaryPin === pincode
  );
  if (exactMatch) return exactMatch;

  // Next check 3-digit prefix mapping
  const prefix3 = pincode.substring(0, 3);
  
  // Specific known clusters
  if (prefix3 === '520' || prefix3 === '521') {
    return ANDHRA_PRADESH_DISTRICTS.find((d) => d.id === 'ntr-vijayawada') || null;
  }
  if (prefix3 === '522') {
    return ANDHRA_PRADESH_DISTRICTS.find((d) => d.id === 'guntur') || null;
  }
  if (prefix3 === '530') {
    return ANDHRA_PRADESH_DISTRICTS.find((d) => d.id === 'visakhapatnam') || null;
  }
  if (prefix3 === '531') {
    return ANDHRA_PRADESH_DISTRICTS.find((d) => d.id === 'anakapalli') || null;
  }
  if (prefix3 === '532') {
    return ANDHRA_PRADESH_DISTRICTS.find((d) => d.id === 'srikakulam') || null;
  }
  if (prefix3 === '533') {
    return ANDHRA_PRADESH_DISTRICTS.find((d) => d.id === 'east-godavari') || null;
  }
  if (prefix3 === '534') {
    return ANDHRA_PRADESH_DISTRICTS.find((d) => d.id === 'west-godavari') || null;
  }
  if (prefix3 === '535') {
    return ANDHRA_PRADESH_DISTRICTS.find((d) => d.id === 'vizianagaram') || null;
  }
  if (prefix3 === '515') {
    return ANDHRA_PRADESH_DISTRICTS.find((d) => d.id === 'ananthapuramu') || null;
  }
  if (prefix3 === '516') {
    return ANDHRA_PRADESH_DISTRICTS.find((d) => d.id === 'ysr-kadapa') || null;
  }
  if (prefix3 === '517') {
    return ANDHRA_PRADESH_DISTRICTS.find((d) => d.id === 'tirupati') || null;
  }
  if (prefix3 === '518') {
    return ANDHRA_PRADESH_DISTRICTS.find((d) => d.id === 'kurnool') || null;
  }
  if (prefix3 === '523') {
    return ANDHRA_PRADESH_DISTRICTS.find((d) => d.id === 'prakasam') || null;
  }
  if (prefix3 === '524') {
    return ANDHRA_PRADESH_DISTRICTS.find((d) => d.id === 'spsr-nellore') || null;
  }

  // Fallback to central hub
  return ANDHRA_PRADESH_DISTRICTS[0];
}

// Search districts by name or keyword
export function searchAPDistricts(query: string): APDistrict[] {
  if (!query || !query.trim()) return ANDHRA_PRADESH_DISTRICTS;
  const q = query.toLowerCase().trim();

  return ANDHRA_PRADESH_DISTRICTS.filter((d) => {
    return (
      d.name.toLowerCase().includes(q) ||
      d.headquarters.toLowerCase().includes(q) ||
      d.teluguName.includes(q) ||
      d.primaryPin.includes(q) ||
      d.samplePins.some((p) => p.includes(q)) ||
      d.famousProduce.some((prod) => prod.toLowerCase().includes(q)) ||
      d.region.toLowerCase().includes(q)
    );
  });
}

// Global stats
export const AP_NETWORK_STATS = {
  totalDistricts: 26,
  totalFarmers: 4725,
  centralHub: 'Amaravati Central Cold-Chain HQ (Vijayawada)',
  regionalColdChains: 4,
  averageTransitHours: 12,
  guaranteedCoverage: '100% In-State Delivery Across Andhra Pradesh',
  sameDayDistrictsCount: 5,
  nextDayDistrictsCount: 14,
  expressDistrictsCount: 7,
};
