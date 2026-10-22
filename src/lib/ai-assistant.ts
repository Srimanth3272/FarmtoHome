export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  language?: 'en' | 'te';
  relatedProducts?: Array<{
    name: string;
    slug: string;
    price: number;
    unit: string;
  }>;
  relatedArticles?: Array<{
    title: string;
    slug: string;
    category: string;
  }>;
}

interface AgriculturalTopic {
  keywords: string[];
  responseEn: string;
  responseTe: string;
  products: Array<{ name: string; slug: string; price: number; unit: string }>;
  articles: Array<{ title: string; slug: string; category: string }>;
}

const AGRICULTURAL_KNOWLEDGE: AgriculturalTopic[] = [
  {
    keywords: ['compost', 'vermicompost', 'khad', 'manure', 'soil fertility', 'comp'],
    responseEn: `To prepare rich organic compost or vermicompost at home:
1. **Bedding & Aeration:** Use shredded cardboard, coconut coir, and dried leaves (4-6 inches) at the bottom of a ventilated container.
2. **Moisture Balance:** Keep the bedding as moist as a damp sponge (around 60% moisture). Never flood it.
3. **Feeding:** Add vegetable peels, fruit scraps, spent tea leaves, and crushed eggshells. Avoid dairy, meat, citrus peels, and oily cooked food.
4. **Earthworm Care:** Introduce Eisenia fetida (red wigglers). They consume half their body weight daily.
5. **Harvesting:** In 45-60 days, dark crumbly "black gold" vermicast will form. Top-dress around plant roots.

*Note: For large plots, combine aged desi cow dung slurry (Jivamrutha) for rapid microbial multiplication.*`,
    responseTe: `ఇంట్లో నాణ్యమైన వర్మీ కంపోస్ట్ (వానపాముల ఎరువు) తయారుచేసే పద్ధతి:
1. **పడక తయారీ:** కొబ్బరి పొట్టు (కోకోపీట్), ఎండుటాకులు లేదా కార్డ్‌బోర్డ్ ముక్కలను తొట్టి అడుగున 4-6 అంగుళాలు పరచండి.
2. **తేమ:** తడి పిండిన స్పాంజ్ లాగా 60% తేమ ఉండేలా తగినంత నీరు చల్లండి.
3. **ఆహారం:** కూరగాయల తొక్కలు, పండ్ల వ్యర్థాలు, టీ పొడి వేయండి. నూనె, నిమ్మజాతి తొక్కలు, మాంసాహార వ్యర్థాలు వేయకూడదు.
4. **వానపాములు:** ఐసీనియా ఫెటిడా (ఎరుపు వానపాములు) వేయండి.
5. **సేకరణ:** 45-60 రోజుల్లో నల్లని సారవంతమైన కంపోస్ట్ సిద్ధమవుతుంది.`,
    products: [
      { name: 'Microbial Enriched Organic Vermicompost (10 kg)', slug: 'enriched-organic-vermicompost-eisenia-fetida', price: 249, unit: '10 kg bag' },
      { name: 'Triple-Washed Low-EC Compressed Cocopeat Block', slug: 'washed-low-ec-compressed-cocopeat-block-5kg', price: 210, unit: '5 kg block' },
    ],
    articles: [
      { title: 'How to Prepare Nutrient-Rich Vermicompost at Home', slug: 'how-to-prepare-vermicompost-at-home', category: 'Vermicomposting' },
    ],
  },
  {
    keywords: ['pest', 'insects', 'aphids', 'neem', 'whiteflies', 'worms', 'spray', 'pesticide', 'keeda'],
    responseEn: `For natural and organic pest management:
1. **Neemastra Decoction:** Mix 5 kg crushed neem leaves with 5 litres desi cow urine (Gomutra) and 2 kg fresh cow dung in 100L water. Ferment for 48 hours. Spray directly against aphids, whiteflies, and jassids.
2. **Cold-Pressed Neem Oil Spray:** Emulsify 5ml pure neem oil in 1 litre water with 2-3 drops of natural organic soap. Spray late in the evening to avoid leaf scorching.
3. **Soil Treatment with Neem Cake:** Incorporate cold-pressed neem seed cake into root zones to eliminate nematodes, termites, and root grubs naturally.
4. **Yellow Sticky Traps:** Hang yellow and blue sticky traps at canopy level to monitor and trap winged pests early.`,
    responseTe: `సేంద్రీయ చీడపీడల నివారణ మరియు వేప కషాయం:
1. **నీమాస్త్రం తయారీ:** 5 కిలోల వేపాకులు, 5 లీటర్ల ఆవు మూత్రం, 2 కిలోల ఆవు పేడను 100 లీటర్ల నీటిలో కలిపి 48 గంటలు పులియబెట్టాలి. రసం పీల్చే పురుగులకు ఉత్తమం.
2. **వేప నూనె పిచికారీ:** 1 లీటరు నీటికి 5 ఎం.ఎల్ వేప నూనె, 2 చుక్కల లిక్విడ్ సబ్బు కలిపి సాయంత్రం వేళల్లో పిచికారీ చేయండి.
3. **వేపపిండి వినియోగం:** వేరు కుళ్ళు, నెమటోడ్ల నివారణకు మట్టిలో వేపపిండి కలపండి.`,
    products: [
      { name: 'Cold-Pressed Pure Neem Seed Cake for Soil Pest Defense', slug: 'pure-cold-pressed-neem-seed-cake-fertilizer', price: 180, unit: '5 kg bag' },
    ],
    articles: [
      { title: 'Neem-Based Crop Protection: Preparing Neemastra and Agniastra Organically', slug: 'understanding-neem-based-crop-protection', category: 'Neem-Based Pest Management' },
    ],
  },
  {
    keywords: ['seed', 'seeds', 'germination', 'grow bag', 'kitchen garden', 'terrace', 'balcony'],
    responseEn: `Key factors for successful kitchen gardening and seed starting:
1. **Seed Selection:** Choose native, open-pollinated heirloom seeds instead of hybrid F1 seeds for hardier pest resistance and seed saving.
2. **Potting Mix:** Combine 40% cocopeat + 40% vermicompost + 20% coarse sand or perlite, plus a handful of neem cake. Avoid heavy garden mud in containers.
3. **Sowing Depth:** A general rule of thumb is to sow seeds at a depth equal to 2x to 3x their thickness.
4. **Sunlight:** Most Indian fruiting vegetables (tomatoes, chillies, eggplants, gourds) require 5-6 hours of direct sunlight.
5. **Watering:** Water gently using a rose-can when the top 1 inch of potting soil feels dry to the touch.`,
    responseTe: `మిద్దె తోట (టెర్రస్ గార్డెనింగ్) మరియు నాణ్యమైన విత్తనాల ఎంపిక:
1. **దేశీ విత్తనాలు:** హైబ్రిడ్ కాకుండా సంప్రదాయ నాటు విత్తనాలు ఎంచుకోండి. ఇవి చీడపీడలను తట్టుకుంటాయి.
2. **కుండీల మట్టి మిశ్రమం:** 40% కోకోపీట్ + 40% వర్మీకంపోస్ట్ + 20% ఇసుక లేదా పెర్లైట్, కొద్దిగా వేపపిండి కలిపి వాడండి.
3. **ఎండ:** టమోటా, పచ్చిమిర్చి, వంగ మొక్కలకు రోజుకు కనీసం 5-6 గంటల ఎండ అవసరం.`,
    products: [
      { name: 'Heirloom Desi Kitchen Garden Seed Kit (12 Native Varieties)', slug: 'indigenous-desi-kitchen-garden-seeds-combo-12', price: 299, unit: '1 Pack' },
      { name: 'Heavy-Duty 260 GSM UV Stabilized Green Grow Bags (Pack of 5)', slug: 'uv-stabilized-hdpe-terrace-garden-grow-bags-set', price: 349, unit: 'Pack of 5' },
    ],
    articles: [
      { title: 'A Beginner’s Guide to Kitchen and Terrace Gardening in Indian Cities', slug: 'beginners-guide-to-kitchen-and-terrace-gardening', category: 'Kitchen Gardening' },
    ],
  },
  {
    keywords: ['soil', 'soil health', 'ph', 'organic matter', 'carbon', 'black soil', 'red soil'],
    responseEn: `To improve degraded or depleted soil health organically:
1. **Increase Organic Carbon:** Consistently add well-rotted farmyard manure, vermicompost, and biochar to push organic carbon levels above 0.8%.
2. **Living Roots Year-Round:** Never leave soil bare. Practice green manuring with Sunn hemp (*Crotalaria juncea*) or Daincha before main cropping.
3. **Biological Mulching:** Cover soil with crop stubble, sugarcane trash, or dry leaves to moderate soil temperature, retain soil moisture, and nourish earthworms.
4. **Microbial Inoculation:** Apply liquid Jeevamrutha or bio-fertilizers (Azotobacter, Rhizobium, PSB) every 21 days with irrigation water.`,
    responseTe: `నేల సారాన్ని (మట్టి ఆరోగ్యం) సేంద్రీయంగా పెంపొందించడం:
1. **సేంద్రీయ కర్బనం:** పశువుల ఎరువు, వర్మీకంపోస్ట్ లేదా బయోచార్ కలపడం ద్వారా మట్టిలో సేంద్రీయ కర్బనాన్ని పెంచండి.
2. **పచ్చిరొట్ట ఎరువులు:** జనుము, పిల్లిపెసర లేదా జీలుగ పంటలు సాగు చేసి పూత దశలో మట్టిలో కలియదున్నండి.
3. **ఆచ్ఛాదన (మల్చింగ్):** నేలను ఎండ తగలకుండా ఎండుటాకులు లేదా గడ్డితో కప్పండి. ఇది తేమను కాపాడుతుంది.`,
    products: [
      { name: 'Microbial Enriched Organic Vermicompost (10 kg)', slug: 'enriched-organic-vermicompost-eisenia-fetida', price: 249, unit: '10 kg bag' },
      { name: 'Cold-Pressed Pure Neem Seed Cake', slug: 'pure-cold-pressed-neem-seed-cake-fertilizer', price: 180, unit: '5 kg bag' },
    ],
    articles: [
      { title: 'How to Prepare Nutrient-Rich Vermicompost at Home', slug: 'how-to-prepare-vermicompost-at-home', category: 'Vermicomposting' },
    ],
  },
];

export async function askSmartFarmingAssistant(
  prompt: string,
  preferredLang: 'en' | 'te' = 'en',
  userState?: string
): Promise<AssistantMessage> {
  const normalized = prompt.toLowerCase();

  // Detect Telugu script or query intent
  const isTeluguQuery =
    preferredLang === 'te' ||
    /[\u0C00-\u0C7F]/.test(prompt) ||
    normalized.includes('telugu') ||
    normalized.includes('eruvulu');

  const lang: 'en' | 'te' = isTeluguQuery ? 'te' : 'en';

  // Find best matching agricultural topic
  let matchedTopic = AGRICULTURAL_KNOWLEDGE.find((topic) =>
    topic.keywords.some((kw) => normalized.includes(kw))
  );

  // If no direct keyword match, default to general organic gardening advisory
  if (!matchedTopic) {
    matchedTopic = AGRICULTURAL_KNOWLEDGE[2]; // kitchen garden & seeds
  }

  let content = lang === 'te' ? matchedTopic.responseTe : matchedTopic.responseEn;

  // Append regional context if provided
  if (userState) {
    const regionalNote =
      lang === 'te'
        ? `\n\n📌 **గమనిక (${userState} ప్రాంతం కోసం):** మీ ప్రాంత వాతావరణం ప్రకారం బిందు సేద్యం (డ్రిప్ ఇరిగేషన్) ఉపయోగించడం మరియు కాలానుగుణ నాటు విత్తనాలు నాటడం ఉత్తమ ఫలితాలను ఇస్తుంది.`
        : `\n\n📌 **Regional Advisory for ${userState}:** Based on prevailing agro-climatic conditions in ${userState}, ensure adequate soil mulching and check the Indian Harvest Calendar for regional crop schedules.`;
    content += regionalNote;
  }

  // Add standard agricultural disclaimer as requested
  const disclaimer =
    lang === 'te'
      ? `\n\n*గమనిక: ఈ సమాచారం సేంద్రీయ వ్యవసాయ పద్ధతులపై ఆధారపడిన సలహా మాత్రమే. రసాయనిక పురుగుమందులు వాడే ముందు అర్హత కలిగిన వ్యవసాయ నిపుణులను సంప్రదించండి.*`
      : `\n\n*Disclaimer: This guidance is based on established natural farming practices. For specific crop diseases or commercial interventions, consult local agricultural extension officers or certified agronomists.*`;

  content += disclaimer;

  return {
    role: 'assistant',
    content,
    language: lang,
    relatedProducts: matchedTopic.products,
    relatedArticles: matchedTopic.articles,
  };
}
