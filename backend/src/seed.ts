import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const places = [
  {
    name: "Shaniwar Wada",
    emoji: "🏰",
    category: "Heritage",
    rating: 4.6,
    distance: "1.2 km",
    entryFee: "Free",
    estYear: "1730",
    visitTime: "2–3h",
    hours: "8:00 AM – 6:30 PM (daily)",
    phone: "+91 20 2444 5051",
    address: "Shaniwar Peth, Pune",
    accessible: true,
    guidedTours: true,
    tag: "Must Visit",
    tagColor: "terracotta",
    bgColor: "#F2EAE7",
    description: "Shaniwar Wada was the seat of the Peshwa rulers of the Maratha Empire. Built in 1730, this majestic fortification once housed the most powerful rulers of 18th-century India, featuring grand gates and towering bastions.",
  },
  {
    name: "Dagdusheth Halwai Ganpati",
    emoji: "⛩️",
    category: "Temple",
    rating: 4.8,
    distance: "1.5 km",
    entryFee: "Free",
    estYear: "1893",
    visitTime: "45 min",
    hours: "6:00 AM – 10:30 PM (daily)",
    phone: "+91 20 2612 2592",
    address: "Budhwar Peth, Pune",
    accessible: true,
    guidedTours: false,
    tag: "Iconic",
    tagColor: "amber",
    bgColor: "#EDE8DF",
    description: "The most celebrated Ganesh temple in Pune, over 130 years old and standing at the heart of the city. The idol is adorned with gold and the temple draws millions of devotees every year.",
  },
  {
    name: "Rajiv Gandhi Zoological Park",
    emoji: "🦁",
    category: "Nature",
    rating: 4.3,
    distance: "8.4 km",
    entryFee: "₹40",
    estYear: "1999",
    visitTime: "3–4h",
    hours: "9:30 AM – 5:00 PM (Tue–Sun)",
    phone: "+91 20 2421 1618",
    address: "Katraj, Pune",
    accessible: true,
    guidedTours: true,
    tag: "Family",
    tagColor: "sage",
    bgColor: "#EBF0E8",
    description: "Spread across the Katraj hills, this wildlife sanctuary houses over 35 species including leopards, pythons, and exotic birds. It also has a snake park and a rescue center.",
  },
  {
    name: "FC Road Food Strip",
    emoji: "🍽️",
    category: "Food",
    rating: 4.7,
    distance: "2.1 km",
    entryFee: "—",
    estYear: "—",
    visitTime: "1–2h",
    hours: "10:00 AM – 11:00 PM (daily)",
    phone: "—",
    address: "Fergusson College Road, Pune",
    accessible: true,
    guidedTours: false,
    tag: "Open Now",
    tagColor: "green",
    bgColor: "#FDF3E0",
    description: "The artery of Pune's youth culture and culinary soul. Vada pav, missal pav, cutting chai, and Irani café biscuits line every block. Fergusson College Road is the city's most beloved food street.",
  },
  {
    name: "Aga Khan Palace",
    emoji: "🏛️",
    category: "Heritage",
    rating: 4.5,
    distance: "4.8 km",
    entryFee: "₹10",
    estYear: "1892",
    visitTime: "1.5h",
    hours: "9:00 AM – 5:30 PM (daily)",
    phone: "+91 20 2668 1451",
    address: "Nagar Road, Pune",
    accessible: true,
    guidedTours: true,
    tag: "Historic",
    tagColor: "indigo",
    bgColor: "#ECEAF8",
    description: "Built in 1892, this stunning palace served as the detention site for Mahatma Gandhi and his wife Kasturba during the Quit India Movement. It now houses a Gandhi memorial museum.",
  },
  {
    name: "Osho International Meditation Resort",
    emoji: "🌿",
    category: "Wellness",
    rating: 4.4,
    distance: "3.2 km",
    entryFee: "₹180",
    estYear: "1974",
    visitTime: "Half day",
    hours: "6:00 AM – 8:00 PM (daily)",
    phone: "+91 20 6601 9999",
    address: "Koregaon Park, Pune",
    accessible: false,
    guidedTours: false,
    tag: "Peaceful",
    tagColor: "sage",
    bgColor: "#EBF0E8",
    description: "A sprawling resort in Koregaon Park combining a meditation campus, spa, and lush gardens. Visitors undergo an orientation and HIV test before entry — it is a unique and tranquil retreat.",
  },
];

const events = [
  {
    date: "SAT · JUN 14",
    name: "Sawai Gandharva Festival",
    desc: "Classical music at Balgandharva Rang",
    color: "terracotta",
  },
  {
    date: "SUN · JUN 15",
    name: "Pune Food Walk",
    desc: "FC Road street eats tour",
    color: "indigo",
  },
  {
    date: "WED · JUN 18",
    name: "Osho Meditation Session",
    desc: "Evening zen at Koregaon Park",
    color: "terracotta",
  },
  {
    date: "FRI · JUN 20",
    name: "Pune Tech Meetup",
    desc: "Networking at Hinjewadi IT Park",
    color: "indigo",
  },
  {
    date: "SAT · JUN 21",
    name: "Heritage Cycle Tour",
    desc: "Morning ride through old city",
    color: "terracotta",
  },
];

const itineraryDays = [
  {
    day: 1,
    label: "Day 1 · Sat",
    stops: [
      {
        time: "9 AM",
        name: "Shaniwar Wada",
        desc: "Start with the Peshwa fortress — arrive early to beat the crowds and catch the morning light on the Dilli Darwaza gate.",
        tags: [{ label: "Heritage", type: "heritage" }, { label: "1.5h", type: "neutral" }],
        dotColor: "#8B3A2A",
      },
      {
        time: "11 AM",
        name: "Dagdusheth Halwai Ganpati",
        desc: "Walk 10 min to the iconic Ganesh temple. Don't miss the modak prasad offered at the temple entrance.",
        tags: [{ label: "Temple", type: "heritage" }, { label: "45 min", type: "neutral" }],
        dotColor: "#B87318",
      },
      {
        time: "12:30",
        name: "Lunch — Vaishali Restaurant",
        desc: "Iconic Puneri thali on FC Road. Try the missal pav and ukdiche modak — a Pune institution since 1972.",
        tags: [{ label: "Food", type: "food" }, { label: "1h", type: "neutral" }],
        dotColor: "#B87318",
      },
      {
        time: "2 PM",
        name: "Aga Khan Palace",
        desc: "Site of Mahatma Gandhi's internment — a poignant colonial-era landmark set in serene gardens.",
        tags: [{ label: "Heritage", type: "heritage" }, { label: "Gardens", type: "nature" }, { label: "1.5h", type: "neutral" }],
        dotColor: "#4A6741",
      },
      {
        time: "4 PM",
        name: "Evening chai — Irani Café",
        desc: "End Day 1 with cutting chai and Osmania biscuits at a Pune Irani café. Bund Garden Road has the best ones.",
        tags: [{ label: "Food", type: "food" }],
        dotColor: "#3D3680",
      },
    ],
  },
  {
    day: 2,
    label: "Day 2 · Sun",
    stops: [
      {
        time: "8 AM",
        name: "Sinhagad Fort Trek",
        desc: "Early morning trek up the historic Sinhagad fort — cool air, sweeping views, and freshly made pitla bhakri at the top.",
        tags: [{ label: "Heritage", type: "heritage" }, { label: "Nature", type: "nature" }, { label: "3h", type: "neutral" }],
        dotColor: "#8B3A2A",
      },
      {
        time: "12 PM",
        name: "Parvati Hill & Temple",
        desc: "Climb 103 steps to the Parvati temple overlooking Pune city — the best panoramic viewpoint in the city.",
        tags: [{ label: "Temple", type: "heritage" }, { label: "1h", type: "neutral" }],
        dotColor: "#B87318",
      },
      {
        time: "2 PM",
        name: "Pune Museum (Raja Kelkar)",
        desc: "One of India's most eclectic private collections — over 20,000 artefacts including lamps, locks, and miniature paintings.",
        tags: [{ label: "Heritage", type: "heritage" }, { label: "1.5h", type: "neutral" }],
        dotColor: "#4A6741",
      },
      {
        time: "5 PM",
        name: "Osho Ashram Walk",
        desc: "Stroll the shaded lanes of Koregaon Park around the Ashram, ending at a rooftop café for sunset views.",
        tags: [{ label: "Wellness", type: "nature" }, { label: "1h", type: "neutral" }],
        dotColor: "#3D3680",
      },
    ],
  },
];

async function main() {
  console.log('Start seeding...');

  // Clear existing data
  await prisma.itineraryStop.deleteMany();
  await prisma.itineraryDay.deleteMany();
  await prisma.event.deleteMany();
  await prisma.place.deleteMany();

  // Seed Places
  for (const p of places) {
    await prisma.place.create({ data: p });
  }

  // Seed Events
  for (const e of events) {
    await prisma.event.create({ data: e });
  }

  // Seed Itineraries
  for (const day of itineraryDays) {
    const createdDay = await prisma.itineraryDay.create({
      data: {
        day: day.day,
        label: day.label,
      },
    });

    for (const stop of day.stops) {
      await prisma.itineraryStop.create({
        data: {
          time: stop.time,
          name: stop.name,
          desc: stop.desc,
          dotColor: stop.dotColor,
          itineraryDayId: createdDay.id,
          tags: stop.tags as any,
        },
      });
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
