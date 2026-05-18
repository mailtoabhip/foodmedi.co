export const SERVICES = {
  initial: {
    key: "initial",
    crumb: "Services · Initial Consultation",
    name: "Initial Consultation",
    shortTitle: "Initial Consultation",
    duration: "60–75 mins · Google Meet",
    icon: "stethoscope",
    titleHtml: 'Initial Consultation<br/>with <em style="color:var(--emerald-deep)">Gauri Pillai.</em>',
    lede: "A one-time, in-depth assessment to understand your full health picture and lay the foundation for a tailored nutrition plan.",
    inr: { price: 4500, meta: "one-time assessment", lbl: "Full health & diet history, medical report review, nutrition goal setting." },
    usd: { price: 65,   meta: "one-time assessment", lbl: "Full health & diet history, medical report review, nutrition goal setting." },
    pill: "Start here",
    flagship: true,
    tag: "Recommended first step",
    imgClass: "deep",
    photo: "assets/portrait-orange.jpg",
    shortBullets: ["Full health & diet history", "Medical report review", "Nutrition goal setting", "Initial care roadmap"],
    intro: "The first consultation is where everything begins. We go deep on your medical history, current biomarkers, lifestyle and goals — so every plan that follows is built specifically for you, not from a template.",
    sections: [{
      title: "What's Included",
      rows: [
        { ico: "cal",  b: "60–75 minute video session", t: "A focused, unhurried first meeting over Google Meet to understand your full health picture without time pressure." },
        { ico: "list", b: "Full health & diet history",  t: "Medical history, current symptoms, dietary patterns, sleep, stress, gut health and cultural food preferences." },
        { ico: "doc",  b: "Medical report & lab review", t: "We review your most recent biomarkers, scans and reports so the plan is grounded in clinical reality." },
        { ico: "star", b: "Personalized goal setting",   t: "Together we define what success looks like — clinically, behaviourally, and inside your real life." }
      ]
    }]
  },

  followup: {
    key: "followup",
    crumb: "Services · Follow-up Session",
    name: "Follow-up Session",
    shortTitle: "Follow-up Session",
    duration: "30–45 mins · Google Meet",
    icon: "refresh",
    titleHtml: 'Follow-up Session<br/>with <em style="color:var(--emerald-deep)">Gauri Pillai.</em>',
    lede: "Progress reviews and plan adjustments — because real change happens between sessions, not in any single one.",
    inr: { price: 2500, meta: "per session", lbl: "Progress review, plan adjustments, symptom management & next-phase guidance." },
    usd: { price: 42,   meta: "per session", lbl: "Progress review, plan adjustments, symptom management & next-phase guidance." },
    pill: "For existing clients",
    imgClass: "sage",
    photo: "assets/portrait-garden.jpg",
    shortBullets: ["Progress review", "Plan adjustments", "Symptom management", "Async support included"],
    intro: "After your initial consultation, follow-ups keep momentum honest. We review what's working, adjust what isn't, and recalibrate your plan against the body you have today.",
    sections: [{
      title: "What's Included",
      rows: [
        { ico: "cal",     b: "30–45 minute video session", t: "A focused check-in to review biomarkers, symptoms, energy, and how your plan is landing in real life." },
        { ico: "refresh", b: "Plan adjustments",           t: "We refine your meal architecture, supplementation, and rituals based on real-world response — not theory." },
        { ico: "shield",  b: "Symptom management",         t: "Targeted guidance for any new or persistent symptoms — coordinated with your treating physician where needed." },
        { ico: "chat",    b: "Async support window",       t: "Direct messaging access for 7 days post-session for substitutions and questions as your plan evolves." }
      ]
    }]
  },

  package: {
    key: "package",
    crumb: "Services · 3-Month Package",
    name: "3-Month Package",
    shortTitle: "3-Month Package",
    duration: "7 Sessions · 90 Days",
    icon: "package",
    titleHtml: '3-Month Care Package<br/><em style="color:var(--emerald-deep)">7 sessions · best value.</em>',
    lede: "The full clinical journey: one Initial Consultation, six Follow-ups, a custom meal plan, and continuous WhatsApp support across 90 days.",
    inr: { price: 18000, meta: "save ₹1,500", lbl: "1 Initial Consultation + 6 Follow-ups + Custom Meal Plan + WhatsApp support." },
    usd: { price: 250,   meta: "save $37",    lbl: "1 Initial Consultation + 6 Follow-ups + Custom Meal Plan + WhatsApp support." },
    pill: "Full journey",
    imgClass: "warm",
    photo: "assets/portrait-moringa.jpg",
    shortBullets: ["1 Initial + 6 Follow-ups", "Custom meal plan", "WhatsApp support", "Save 8% vs. à-la-carte"],
    intro: "Real, lasting change takes more than a single conversation. The 3-Month Package is the structured journey we recommend for clients with chronic conditions, post-treatment recovery, or any goal worth taking seriously.",
    sections: [{
      title: "What's Included",
      rows: [
        { ico: "stethoscope", b: "1 Initial Consultation (60–75 min)", t: "Deep-dive assessment to map your full health picture and set the trajectory for the next 90 days." },
        { ico: "refresh",     b: "6 Follow-up Sessions (30–45 min)",   t: "Bi-weekly check-ins to review progress, adjust the plan, and stay accountable through every phase." },
        { ico: "list",        b: "Custom meal plan",                   t: "A fully personalised meal architecture built around your food culture, schedule, and clinical needs — refreshed monthly." },
        { ico: "chat",        b: "WhatsApp support · 90 days",         t: "Direct messaging access throughout the program for substitutions, off-day questions and live troubleshooting." }
      ]
    }]
  },

  group: {
    key: "group",
    crumb: "Services · Group Consultations",
    name: "Group Consultations",
    shortTitle: "Group Consultations",
    duration: "90 mins · up to 10 people",
    icon: "users",
    titleHtml: 'Group Consultations<br/>for <em style="color:var(--emerald-deep)">up to 10 people.</em>',
    lede: "Nutrition works best when shared — learning, growing and staying accountable together.",
    inr: { price: 10000, meta: "for up to 10 people", lbl: "Group session, shared roadmap, recipe pack & 14-day cohort accountability." },
    usd: { price: 120,   meta: "for up to 10 people", lbl: "Group session, shared roadmap, recipe pack & 14-day cohort accountability." },
    pill: "Cohort-based",
    imgClass: "sage",
    photo: "assets/family.jpg",
    shortBullets: ["Up to 10 participants", "Maternal / Kids / Teen groups", "Shared wellness roadmap", "Cohort accountability"],
    intro: "Group consultations bring people with similar goals and life stages together. Each session combines expert nutrition guidance, practical strategies and open discussion — so you don't just learn what to do, you learn how to make it stick.",
    sections: [
      {
        title: "Choose Your Group",
        rows: [
          { ico: "mother", b: "Maternal Nutrition Group", t: "Pregnancy is a journey — and the right nutrition can make all the difference. Understand what to eat (and what to avoid), manage cravings, support baby's growth, and stay energised through every trimester." },
          { ico: "kids",   b: "Kids Nutrition Group",     t: "Raising healthy eaters starts early. For parents and caregivers building strong nutrition foundations — balanced meals, fussy eating, portion control, and making food fun without losing the nutrition." },
          { ico: "teen",   b: "Teen Nutrition Group",     t: "Teenage years can be tricky — changing bodies, busy schedules, confusing food messages. Helps teens build a positive relationship with food and make choices that fuel growth, focus and confidence." }
        ]
      },
      {
        title: "What's Included",
        rows: [
          { ico: "users", b: "90-minute live group session",   t: "Hosted virtually for up to 10 participants with structured discussion and Q&A throughout." },
          { ico: "list",  b: "Shared wellness roadmap",        t: "A written framework tailored to the group's life stage — delivered within 72 hours of the session." },
          { ico: "chat",  b: "14-day cohort accountability",   t: "Asynchronous group thread for questions, recipe swaps, and weekly check-ins between participants." }
        ]
      }
    ]
  },

  oncology: {
    key: "oncology",
    crumb: "Specialized Care · Oncology Nutrition",
    name: "Oncology Nutrition & Care",
    shortTitle: "Oncology Nutrition &amp; Care",
    duration: "3-month support block",
    icon: "care",
    titleHtml: 'Comprehensive Oncology<br/><em style="color:var(--emerald-deep)">Care &amp; Support.</em>',
    lede: "A one-stop, specialized nutrition solution within your reach. No matter where you are in the world, you don't have to navigate this journey alone.",
    inr: { price: 30000, meta: "3-month comprehensive support", lbl: "Personalized care plan, digital records, and constant WhatsApp access through your treatment journey." },
    usd: { price: 400,   meta: "3-month comprehensive support", lbl: "Personalized care plan, digital records, and constant WhatsApp access through your treatment journey." },
    pill: "Specialized Clinical Care",
    oncology: true,
    ctaLabel: "Explore Care Plan",
    payLabel: "Begin Your Care Journey",
    imgClass: "sage",
    photo: "assets/portrait-coat.jpg",
    shortBullets: ["Pre-surgery optimization", "Chemo &amp; radiation support", "Enteral nutrition management", "Constant WhatsApp access"],
    intro: "Nutrition is a critical pillar of cancer care. Drawing from extensive clinical experience at Tata Cancer Hospital, this specialized program is designed to protect your strength, manage treatment side effects, and provide unwavering support when you and your family need it most.",
    sections: [
      {
        title: "How We Support You",
        rows: [
          { ico: "shield",  b: "Pre-Surgery Care &amp; Optimization", t: "Building your body's nutritional reserves and strength to ensure you are in the best possible condition before undergoing surgery." },
          { ico: "heart",   b: "Chemo &amp; Radiation Support",        t: "Consistent, adaptive guidance to help manage nausea, taste changes, and weight loss during active treatment cycles." },
          { ico: "care",    b: "Enteral Nutrition Management",         t: "Expert clinical management and guidance for tube feeding (enteral support), ensuring safe, optimal nourishment when oral intake is difficult." },
          { ico: "dove",    b: "End-of-Life &amp; Palliative Care",    t: "Highly sensitive, comfort-focused nutrition strategies designed to maintain dignity, manage symptoms, and provide gentle nourishment." }
        ]
      },
      {
        title: "Your Peace of Mind",
        highlight: true,
        rows: [
          { ico: "digitalplan", b: "Your Custom Digital Plan",  t: "You will receive a comprehensive, easily accessible Digital Care Plan that updates as your treatment evolves — avoiding the clutter of paper records." },
          { ico: "whatsapp",    b: "Constant WhatsApp Support", t: "Cancer doesn't work on a schedule. You and your caregivers will have direct, priority WhatsApp access to me for real-time guidance, reassurance, and quick adjustments." }
        ]
      }
    ]
  },

  corporate: {
    key: "corporate",
    crumb: "Services · Corporate Wellness",
    name: "Corporate Wellness",
    shortTitle: "Corporate Wellness",
    duration: "60–90 min workshop",
    icon: "briefcase",
    titleHtml: 'Corporate Wellness &amp;<br/><em style="color:var(--emerald-deep)">Performance Nutrition.</em>',
    lede: "A healthy workforce is the foundation of a high-performing organization. Practical, evidence-based strategies that boost energy, focus and overall well-being.",
    inr: { price: 25000, meta: "base package", lbl: "Comprehensive corporate wellness package — scope shaped to your team size & goals." },
    usd: { price: 350,   meta: "base package", lbl: "Comprehensive corporate wellness package — scope shaped to your team size & goals." },
    pill: "For teams",
    imgClass: "deep",
    photo: "assets/cred-conference.jpg",
    shortBullets: ["Interactive employee workshops", "Executive 1:1 health audits", "Pantry & cafeteria audit", "Customized wellness challenges"],
    intro: "Poor nutrition, chronic stress and sedentary work directly cause burnout, sick days and decreased cognitive performance. Our corporate solutions integrate seamlessly into demanding professional lives — no restrictive diets, just sustainable strategies your team will actually adopt.",
    sections: [{
      title: "What's Included",
      rows: [
        { ico: "mic",     b: "Interactive Employee Workshops (60–90 min)", t: "Engaging, science-backed sessions: <em>The Executive Edge</em> (beating the 3 PM slump), <em>Desk-Bound Wellness</em> (snacking, hydration, lunch ordering) and <em>Stress, Sleep &amp; The Gut</em> (the gut-brain axis at work)." },
        { ico: "star",    b: "Executive 1:1 Health Audits",                t: "Confidential 20-minute rapid consultations for leadership and select employees — metabolic markers, travel-heavy lifestyle diets, business dinners and customised supplementation." },
        { ico: "cafe",    b: "Corporate Pantry &amp; Cafeteria Audit",     t: "A comprehensive review of pantry, vending machines and cafeteria menus — with an actionable <em>Healthy Swap List</em> of nutrient-dense, high-energy alternatives that don't sacrifice taste or budget." },
        { ico: "trophy",  b: "Customized Wellness Challenges",             t: "Month-long, gamified team challenges (<em>The Hydration Sprint</em>, <em>Mindful Meals Month</em>) with weekly check-ins, digital resources and progress tracking to build long-term camaraderie." }
      ]
    }]
  }
};

export const SERVICE_ORDER = ['initial', 'followup', 'package', 'group', 'corporate', 'oncology'];
