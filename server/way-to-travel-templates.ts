import {
  createWayToTravel,
  createWayToTravelType,
  getWayToTravelBySlug,
  listExperienceDetails,
  listExperiences,
  listWayToTravelTypes,
  replaceWayToTravelDetails,
  replaceWayToTravelLabels,
  updateWayToTravelType,
} from "./db-cms";

interface TemplateBlock {
  title: string;
  description: string;
}

interface WayToTravelTemplate {
  name: string;
  slug: string;
  title: string;
  description: string;
  duration: string;
  labels: string[];
  blocks: TemplateBlock[];
}

interface WayToTravelTemplateGroup {
  name: string;
  slug: string;
  color: string;
  items: WayToTravelTemplate[];
}

const GROUPS: WayToTravelTemplateGroup[] = [
  {
    name: "Family & Educational Travel",
    slug: "family-educational-travel",
    color: "#315f57",
    items: [
      {
        name: "Family Travel",
        slug: "family-travel",
        title: "China, designed for every generation",
        description: "Thoughtful private journeys that balance discovery, comfort and unhurried family time. We shape each day around your children's ages, your shared interests and the pace that helps everyone enjoy China together.",
        duration: "5-14 days",
        labels: ["Family", "Private Travel", "Multi-generational"],
        blocks: [
          { title: "A pace that works", description: "Shorter travel days, flexible starts and well-timed breaks keep younger travellers engaged while leaving space for adults to explore in depth." },
          { title: "Learn by doing", description: "Meet artisans, cook with local families, try calligraphy and explore historic neighbourhoods through hands-on moments that bring each destination to life." },
          { title: "Family-first support", description: "Private guides, carefully selected rooms and practical local assistance make the journey feel easy from arrival to departure." },
        ],
      },
      {
        name: "Educational Tours",
        slug: "educational-tours",
        title: "Learning beyond the classroom",
        description: "Curriculum-aware journeys for schools, universities and learning groups, connecting China's history, innovation, ecology and contemporary life through expert-led encounters.",
        duration: "6-16 days",
        labels: ["Education", "Students", "Study Tour"],
        blocks: [
          { title: "Purposeful itineraries", description: "Every programme begins with clear learning goals, then combines landmark visits with workshops, discussions and field observation." },
          { title: "Expert access", description: "Local scholars, museum specialists, entrepreneurs and community hosts add context that students cannot gain from a standard sightseeing tour." },
          { title: "Safe group delivery", description: "Risk-aware planning, experienced group leaders and reliable transport support teachers and students throughout the programme." },
        ],
      },
      {
        name: "Camps & Learning Programs",
        slug: "camps-learning-programs",
        title: "Curiosity, confidence and connection",
        description: "Immersive seasonal programmes where young travellers build skills, friendships and cultural understanding through language, creativity, nature and collaborative projects.",
        duration: "3 days-4 weeks",
        labels: ["Youth", "Camp", "Learning"],
        blocks: [
          { title: "Active learning", description: "Language practice, craft workshops, outdoor challenges and team projects turn each day into an opportunity to learn through participation." },
          { title: "Local connection", description: "Age-appropriate cultural exchange helps participants understand everyday China while developing independence and confidence." },
          { title: "Supported throughout", description: "Structured schedules, trained supervisors and clear family communication provide reassurance without taking away the sense of adventure." },
        ],
      },
      {
        name: "Family Support Services",
        slug: "family-support-services",
        title: "Practical help for smoother family travel",
        description: "Flexible on-the-ground support for families who need a little more than itinerary planning, from child-friendly logistics to trusted local coordination during longer stays.",
        duration: "As required",
        labels: ["Family", "Concierge", "Support"],
        blocks: [
          { title: "Before you arrive", description: "We help with family room planning, dietary notes, mobility needs, essential bookings and realistic travel times." },
          { title: "Help on the ground", description: "Bilingual assistance, transport coordination and local recommendations are available when plans change or an unexpected need arises." },
          { title: "Built around your family", description: "Support can be added to a full journey or arranged as a standalone service for families living, studying or travelling independently in China." },
        ],
      },
    ],
  },
  {
    name: "Business Concierge",
    slug: "business-concierge",
    color: "#294b65",
    items: [
      {
        name: "Industry & Factory Visits",
        slug: "industry-factory-visits",
        title: "See Chinese industry at work",
        description: "Professionally coordinated visits that give decision-makers a clear view of production capability, operating standards and the people behind potential partnerships.",
        duration: "1-5 days",
        labels: ["Business", "Industry", "Factory Visit"],
        blocks: [
          { title: "The right facilities", description: "We identify relevant manufacturers and operational sites based on your sector, objectives and required level of access." },
          { title: "Prepared meetings", description: "Bilingual briefing, agenda coordination and interpretation help both sides use limited on-site time productively." },
          { title: "End-to-end logistics", description: "Private transport, access requirements and realistic travel sequencing are managed around your commercial schedule." },
        ],
      },
      {
        name: "Business Delegations & Company Visits",
        slug: "business-delegations-company-visits",
        title: "Delegations delivered with precision",
        description: "Custom programmes for leadership teams, associations and professional groups seeking meaningful company access and well-managed business travel in China.",
        duration: "2-10 days",
        labels: ["Business", "Delegation", "Company Visit"],
        blocks: [
          { title: "Relevant introductions", description: "Company visits and professional exchanges are selected to match the delegation's industry focus and desired outcomes." },
          { title: "A coherent programme", description: "Meetings, site visits, city transfers and hosted meals are arranged as one practical schedule rather than disconnected appointments." },
          { title: "Professional hosting", description: "Bilingual coordinators support protocol, timing, guest movements and last-minute changes throughout the visit." },
        ],
      },
      {
        name: "Trade Shows & Interpretation",
        slug: "trade-shows-interpretation",
        title: "Make every exhibition day count",
        description: "Focused trade-show support combining registration, transport, supplier scheduling and experienced interpretation for more productive conversations.",
        duration: "1-7 days",
        labels: ["Business", "Trade Show", "Interpretation"],
        blocks: [
          { title: "Arrive prepared", description: "We assist with visitor registration, venue planning, meeting calendars and practical briefings before the doors open." },
          { title: "Clear communication", description: "Interpreters are matched to your sector wherever possible and briefed on terminology, priorities and expected meetings." },
          { title: "Follow-through", description: "Contact notes, transport and optional post-show supplier visits help turn introductions into useful next steps." },
        ],
      },
      {
        name: "Sourcing & Supply Chain",
        slug: "sourcing-supply-chain",
        title: "From supplier search to on-site insight",
        description: "Local research and visit coordination for businesses evaluating suppliers, production partners and supply-chain opportunities across China.",
        duration: "3-12 days",
        labels: ["Business", "Sourcing", "Supply Chain"],
        blocks: [
          { title: "Focused research", description: "Potential suppliers are screened against your product category, geography, scale and meeting requirements before visits are proposed." },
          { title: "See beyond the showroom", description: "Where access allows, site visits focus on production flow, team capability and practical questions relevant to your evaluation." },
          { title: "Independent coordination", description: "We manage communication and logistics while you retain control of all commercial, technical and due-diligence decisions." },
        ],
      },
      {
        name: "Government & Institutional Visits",
        slug: "government-institutional-visits",
        title: "Thoughtful programmes for official exchange",
        description: "Carefully coordinated visits for public bodies, universities, chambers and institutions, with close attention to protocol, relevance and reliable delivery.",
        duration: "2-10 days",
        labels: ["Institutional", "Government", "Delegation"],
        blocks: [
          { title: "Purpose-led planning", description: "Programmes are developed around the delegation's mandate, seniority and intended areas of exchange." },
          { title: "Protocol-aware delivery", description: "Schedules, guest details, interpretation and formal requirements are coordinated with clarity and discretion." },
          { title: "Context alongside meetings", description: "Relevant cultural and city experiences can be integrated without distracting from the official purpose of the visit." },
        ],
      },
    ],
  },
  {
    name: "Culture & Heritage Experiences",
    slug: "culture-heritage-experiences",
    color: "#80503f",
    items: [
      {
        name: "Intangible Cultural Heritage",
        slug: "intangible-cultural-heritage",
        title: "Living traditions, shared in person",
        description: "Private encounters with the makers, performers and communities keeping China's living heritage relevant today.",
        duration: "Half day-7 days",
        labels: ["Culture", "Heritage", "Artisans"],
        blocks: [
          { title: "Meet the custodians", description: "Spend meaningful time with practitioners whose knowledge has been developed and passed on across generations." },
          { title: "Take part", description: "Hands-on sessions reveal the patience, technique and cultural ideas behind music, craft, ritual and performance." },
          { title: "Travel with context", description: "Expert guides connect each tradition to its region, community and place in contemporary Chinese life." },
        ],
      },
      {
        name: "Historic Sites & Ancient China",
        slug: "historic-sites-ancient-china",
        title: "Step into the many layers of ancient China",
        description: "Historian-led journeys through imperial capitals, archaeological landscapes, sacred mountains and quieter sites beyond the usual route.",
        duration: "3-14 days",
        labels: ["History", "Heritage", "Ancient China"],
        blocks: [
          { title: "Stories behind the stones", description: "Specialist interpretation turns monuments and ruins into a vivid account of power, belief, trade and everyday life." },
          { title: "Icons and hidden corners", description: "Famous landmarks are balanced with smaller museums, old neighbourhoods and regional sites that deepen the story." },
          { title: "Designed around your era", description: "Routes can focus on a dynasty, the Silk Road, architecture, archaeology or the broad sweep of Chinese history." },
        ],
      },
      {
        name: "Traditional Arts & Crafts",
        slug: "traditional-arts-crafts",
        title: "China through the hands of its makers",
        description: "Studio visits and private workshops exploring ceramics, textiles, painting, carving, paper, lacquer and other distinctive regional crafts.",
        duration: "Half day-6 days",
        labels: ["Culture", "Craft", "Art"],
        blocks: [
          { title: "Inside the studio", description: "Meet established artists and skilled craftspeople in the places where materials are prepared and ideas become objects." },
          { title: "Learn the process", description: "Guided workshops offer an accessible introduction while respecting the depth and discipline behind each tradition." },
          { title: "Find regional character", description: "Each experience is rooted in local materials, aesthetics and stories rather than presented as a generic craft demonstration." },
        ],
      },
      {
        name: "Food & Local Life",
        slug: "food-local-life",
        title: "Taste the rhythms of everyday China",
        description: "Market mornings, family kitchens, neighbourhood tables and regional flavours reveal China through the way people shop, cook and eat together.",
        duration: "Half day-10 days",
        labels: ["Food", "Local Life", "Culture"],
        blocks: [
          { title: "Follow local appetite", description: "Explore breakfast streets, produce markets and small restaurants chosen for character, quality and a real sense of place." },
          { title: "Cook and share", description: "Home visits and private cooking sessions create natural conversation around ingredients, family traditions and regional identity." },
          { title: "Go beyond the menu", description: "Guides explain etiquette, seasonality and the histories that make each cuisine distinct." },
        ],
      },
      {
        name: "Signature Experiences",
        slug: "signature-experiences",
        title: "Rare access, thoughtfully arranged",
        description: "Distinctive Wellcometochina moments created through local knowledge, trusted relationships and a belief that meaningful access matters more than spectacle.",
        duration: "Tailor-made",
        labels: ["Signature", "Private Access", "Culture"],
        blocks: [
          { title: "Personal, not packaged", description: "Each experience is shaped around your interests, timing and the people you hope to meet." },
          { title: "Access with purpose", description: "Private settings and specialist hosts are selected because they add understanding, not simply exclusivity." },
          { title: "Woven into the journey", description: "Signature moments are paced carefully within a wider itinerary so they feel natural, memorable and connected to place." },
        ],
      },
    ],
  },
  {
    name: "Wellness & Medical Travel",
    slug: "wellness-medical-travel",
    color: "#466651",
    items: [
      {
        name: "Health Checkups",
        slug: "health-checkups",
        title: "Preventive care with practical travel support",
        description: "Appointment and travel coordination for international visitors arranging comprehensive health screening at established medical facilities in China.",
        duration: "1-3 days",
        labels: ["Wellness", "Health Check", "Coordination"],
        blocks: [
          { title: "Plan before arrival", description: "We coordinate schedules, translated requirements and practical preparation information supplied by the selected medical provider." },
          { title: "Supported appointments", description: "Transport and non-clinical bilingual assistance help the day run smoothly in an unfamiliar healthcare setting." },
          { title: "Clear boundaries", description: "Medical advice, diagnosis and treatment remain solely with licensed healthcare professionals; our role is travel and communication coordination." },
        ],
      },
      {
        name: "Traditional Chinese Medicine",
        slug: "traditional-chinese-medicine",
        title: "Explore a living tradition of wellbeing",
        description: "Introductions to Traditional Chinese Medicine through reputable practitioners, educational visits and wellness-focused experiences tailored to your interests.",
        duration: "Half day-7 days",
        labels: ["Wellness", "TCM", "Culture"],
        blocks: [
          { title: "Understand the tradition", description: "Learn how concepts, herbs and practices developed within Chinese history and continue to shape everyday approaches to wellbeing." },
          { title: "Meet qualified practitioners", description: "Where consultations are requested, appointments are arranged with appropriate providers and supported with practical translation." },
          { title: "Complement the journey", description: "Tea, gentle movement, nature and cultural context can be combined into a balanced programme without making medical claims." },
        ],
      },
      {
        name: "Dental Care",
        slug: "dental-care",
        title: "Dental visits coordinated around your stay",
        description: "Non-clinical support for travellers arranging consultations or treatment with selected dental providers in China.",
        duration: "According to treatment plan",
        labels: ["Medical Travel", "Dental", "Coordination"],
        blocks: [
          { title: "Provider coordination", description: "We help exchange appointment information, schedules and available provider documentation before travel." },
          { title: "Travel made practical", description: "Transfers, nearby accommodation and bilingual non-clinical assistance can be arranged around appointment times." },
          { title: "Care decisions stay clinical", description: "Treatment suitability, risks, outcomes and aftercare must be discussed directly with the licensed dental provider." },
        ],
      },
      {
        name: "Beauty & Aesthetic Care",
        slug: "beauty-aesthetic-care",
        title: "Discreet coordination for aesthetic travel",
        description: "Private travel and appointment support for guests exploring licensed beauty, skincare and aesthetic providers in China.",
        duration: "According to treatment plan",
        labels: ["Aesthetic", "Wellness", "Coordination"],
        blocks: [
          { title: "A considered shortlist", description: "We coordinate with established providers based on location, service category and the information available to international guests." },
          { title: "Privacy and comfort", description: "Discreet transport, suitable accommodation and flexible scheduling can be arranged around consultations and recovery time." },
          { title: "Informed decisions", description: "All clinical advice, consent, suitability and treatment outcomes remain the responsibility of the licensed provider and the guest." },
        ],
      },
      {
        name: "Medical Coordination",
        slug: "medical-coordination",
        title: "A reliable bridge for healthcare travel",
        description: "Non-clinical coordination for international patients and accompanying families navigating appointments, travel and communication in China.",
        duration: "As required",
        labels: ["Medical Travel", "Patient Support", "Coordination"],
        blocks: [
          { title: "One practical point of contact", description: "We coordinate provider communications, schedules, transport and accommodation so families can focus on the purpose of the visit." },
          { title: "Bilingual assistance", description: "Non-clinical language support helps with logistics and general communication before and during appointments." },
          { title: "Support, not medical advice", description: "We do not diagnose, recommend treatment or replace professional interpretation where formal medical translation is required." },
        ],
      },
    ],
  },
];

function parseGallery(value: string | null): string[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string" && Boolean(item)) : [];
  } catch {
    return [];
  }
}

async function collectExperienceImages(): Promise<string[]> {
  const experiences = await listExperiences(true);
  const images: string[] = [];
  for (const experience of experiences) {
    images.push(...parseGallery(experience.gallery));
    if (experience.recommendationImage) images.push(experience.recommendationImage);
    const details = await listExperienceDetails(experience.id);
    for (const detail of details) {
      if (detail.imageUrl) images.push(detail.imageUrl);
    }
  }
  return Array.from(new Set(images.filter(Boolean)));
}

function imagesForTemplate(pool: string[], index: number): string[] {
  if (pool.length === 0) return [];
  return Array.from({ length: Math.min(4, pool.length) }, (_, offset) => pool[(index * 3 + offset) % pool.length]);
}

export async function createWayToTravelStarterContent() {
  const imagePool = await collectExperienceImages();
  const existingTypes = await listWayToTravelTypes();
  let createdTypes = 0;
  let createdItems = 0;
  let skippedItems = 0;
  let templateIndex = 0;

  for (let groupIndex = 0; groupIndex < GROUPS.length; groupIndex += 1) {
    const group = GROUPS[groupIndex];
    const groupImages = imagesForTemplate(imagePool, groupIndex * 5);
    let type = existingTypes.find(existing => existing.slug === group.slug);
    if (!type) {
      const created = await createWayToTravelType({
        name: group.name,
        slug: group.slug,
        coverImage: groupImages[0],
        sortOrder: groupIndex,
      });
      type = { id: created.id, name: group.name, slug: group.slug, coverImage: groupImages[0] ?? null } as typeof existingTypes[number];
      existingTypes.push(type);
      createdTypes += 1;
    } else if (!type.coverImage && groupImages[0]) {
      await updateWayToTravelType(type.id, { coverImage: groupImages[0] });
    }

    for (let itemIndex = 0; itemIndex < group.items.length; itemIndex += 1) {
      const item = group.items[itemIndex];
      if (await getWayToTravelBySlug(item.slug)) {
        skippedItems += 1;
        templateIndex += 1;
        continue;
      }

      const images = imagesForTemplate(imagePool, templateIndex);
      const created = await createWayToTravel({
        typeId: type.id,
        name: item.name,
        title: item.title,
        slug: item.slug,
        when: "Year-round",
        price: "Tailor-made",
        duration: item.duration,
        gallery: JSON.stringify(images),
        description: item.description,
        ctaBgColor: group.color,
        recommendationImage: images[0],
        recommendationTitle: item.name,
        recommendationDescription: item.description,
        isActive: true,
        sortOrder: itemIndex,
      });

      await replaceWayToTravelDetails(created.id, item.blocks.map((block, blockIndex) => ({
        ...block,
        imageUrl: images[(blockIndex + 1) % Math.max(images.length, 1)],
        sortOrder: blockIndex,
      })));
      await replaceWayToTravelLabels(created.id, [group.name, ...item.labels]);
      createdItems += 1;
      templateIndex += 1;
    }
  }

  return {
    createdTypes,
    createdItems,
    skippedItems,
    reusedImageCount: imagePool.length,
  };
}
