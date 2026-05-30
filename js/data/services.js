export const SERVICES = {
  initial: {
    key: "initial",
    crumb: "Services · General Consultation",
    name: "General Consultation",
    shortTitle: "General Consultation",
    duration: "60 mins · Google Meet",
    icon: "stethoscope",
    titleHtml: 'General Consultation<br/>with <em style="color:var(--emerald-deep)">Gauri Pillai.</em>',
    lede: "A one-time, in-depth assessment to understand your full health picture and lay the foundation for a tailored nutrition plan.",
    inr: { price: 3500, meta: "one-time assessment", lbl: "Full health & diet history, medical report review, nutrition goal setting." },
    usd: { price: 50,   meta: "one-time assessment", lbl: "Full health & diet history, medical report review, nutrition goal setting." },
    pill: "Start here",
    calendlyUrl: "https://calendly.com/foodmedico/schedule-a-meeting",
    flagship: true,
    tag: "Recommended first step",
    imgClass: "deep",
    photo: "assets/portrait-orange.jpg",
    shortBullets: ["Full health & diet history", "Medical report review", "Nutrition goal setting", "Initial care roadmap"],
    intro: "The first consultation is where everything begins. We go deep on your medical history, current biomarkers, lifestyle and goals, so every plan that follows is built specifically for you, not from a template.",
    sections: [{
      title: "What's Included",
      rows: [
        { ico: "cal",  b: "60–75 minute video session", t: "A focused, unhurried first meeting over Google Meet to understand your full health picture without time pressure." },
        { ico: "list", b: "Full health & diet history",  t: "Medical history, current symptoms, dietary patterns, sleep, stress, gut health and cultural food preferences." },
        { ico: "doc",  b: "Medical report & lab review", t: "We review your most recent biomarkers, scans and reports so the plan is grounded in clinical reality." },
        { ico: "star", b: "Personalized goal setting",   t: "Together we define what success looks like, clinically, behaviourally, and inside your real life." }
      ]
    }]
  },

  followup: {
    key: "followup",
    crumb: "Services · Follow-up Session",
    name: "Follow-up Session",
    shortTitle: "Follow-up Session",
    duration: "60 mins · Google Meet",
    icon: "refresh",
    titleHtml: 'Follow-up Session<br/>with <em style="color:var(--emerald-deep)">Gauri Pillai.</em>',
    lede: "Progress reviews and plan adjustments, because real change happens between sessions, not in any single one.",
    inr: { price: 2000, meta: "per session", lbl: "Progress review, plan adjustments, symptom management & next-phase guidance." },
    usd: { price: 1.1,  meta: "per session", lbl: "Progress review, plan adjustments, symptom management & next-phase guidance." },
    pill: "For existing clients",
    calendlyUrl: "https://calendly.com/foodmedico/schedule-a-meeting",
    imgClass: "sage",
    photo: "assets/portrait-garden.jpg",
    shortBullets: ["Progress review", "Plan adjustments", "Symptom management", "Async support included"],
    intro: "After your initial consultation, follow-ups keep momentum honest. We review what's working, adjust what isn't, and recalibrate your plan against the body you have today.",
    sections: [{
      title: "What's Included",
      rows: [
        { ico: "cal",     b: "30–45 minute video session", t: "A focused check-in to review biomarkers, symptoms, energy, and how your plan is landing in real life." },
        { ico: "refresh", b: "Plan adjustments",           t: "We refine your meal architecture, supplementation, and rituals based on real-world response, not theory." },
        { ico: "shield",  b: "Symptom management",         t: "Targeted guidance for any new or persistent symptoms, coordinated with your treating physician where needed." },
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
    calendlyUrl: "https://calendly.com/foodmedico/schedule-a-meeting",
    imgClass: "warm",
    photo: "assets/portrait-moringa.jpg",
    shortBullets: ["1 Initial + 6 Follow-ups", "Custom meal plan", "WhatsApp support", "Save 8% vs. à-la-carte"],
    intro: "Real, lasting change takes more than a single conversation. The 3-Month Package is the structured journey we recommend for clients with chronic conditions, post-treatment recovery, or any goal worth taking seriously.",
    sections: [{
      title: "What's Included",
      rows: [
        { ico: "stethoscope", b: "1 Initial Consultation (60–75 min)", t: "Deep-dive assessment to map your full health picture and set the trajectory for the next 90 days." },
        { ico: "refresh",     b: "6 Follow-up Sessions (30–45 min)",   t: "Bi-weekly check-ins to review progress, adjust the plan, and stay accountable through every phase." },
        { ico: "list",        b: "Custom meal plan",                   t: "A fully personalised meal architecture built around your food culture, schedule, and clinical needs, refreshed monthly." },
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
    lede: "Nutrition works best when shared, learning, growing and staying accountable together.",
    inr: { price: 10000, meta: "for up to 10 people", lbl: "Group session, shared roadmap, recipe pack & 14-day cohort accountability." },
    usd: { price: 120,   meta: "for up to 10 people", lbl: "Group session, shared roadmap, recipe pack & 14-day cohort accountability." },
    pill: "Cohort-based",
    calendlyUrl: "https://calendly.com/foodmedico/schedule-a-meeting",
    imgClass: "sage",
    photo: "assets/family.jpg",
    shortBullets: ["Up to 10 participants", "Maternal / Kids / Teen groups", "Shared wellness roadmap", "Cohort accountability"],
    intro: "Group consultations bring people with similar goals and life stages together. Each session combines expert nutrition guidance, practical strategies and open discussion, so you don't just learn what to do, you learn how to make it stick.",
    sections: [
      {
        title: "Choose Your Group",
        rows: [
          { ico: "mother", b: "Maternal Nutrition Group", t: "Pregnancy is a journey, and the right nutrition can make all the difference. Understand what to eat (and what to avoid), manage cravings, support baby's growth, and stay energised through every trimester." },
          { ico: "kids",   b: "Kids Nutrition Group",     t: "Raising healthy eaters starts early. For parents and caregivers building strong nutrition foundations, balanced meals, fussy eating, portion control, and making food fun without losing the nutrition." },
          { ico: "teen",   b: "Teen Nutrition Group",     t: "Teenage years can be tricky, changing bodies, busy schedules, confusing food messages. Helps teens build a positive relationship with food and make choices that fuel growth, focus and confidence." }
        ]
      },
      {
        title: "What's Included",
        rows: [
          { ico: "users", b: "90-minute live group session",   t: "Hosted virtually for up to 10 participants with structured discussion and Q&A throughout." },
          { ico: "list",  b: "Shared wellness roadmap",        t: "A written framework tailored to the group's life stage, delivered within 72 hours of the session." },
          { ico: "chat",  b: "14-day cohort accountability",   t: "Asynchronous group thread for questions, recipe swaps, and weekly check-ins between participants." }
        ]
      }
    ]
  },

  oncology: {
    key: "oncology",
    crumb: "Specialized Care · Cancer Care Program",
    name: "Cancer Care Program",
    shortTitle: "Cancer Care Program",
    duration: "Assessment · Follow-up · Packages",
    icon: "care",
    titleHtml: 'Cancer Care<br/><em style="color:var(--emerald-deep)">Program.</em>',
    lede: "You have enough to think about. Let us handle your nutrition. A dedicated clinical program for every stage of your cancer journey.",
    inr: { price: 4500, meta: "from · one-time assessment", lbl: "Assessment, follow-up, or 3-month support, choose what fits your journey." },
    usd: { price: 65,   meta: "from · one-time assessment", lbl: "Assessment, follow-up, or 3-month support, choose what fits your journey." },
    pill: "Cancer Care",
    calendlyUrl: "https://calendly.com/foodmedico/schedule-a-meeting",
    oncology: true,
    ctaLabel: "Know more",
    payLabel: "Begin Your Care Journey",
    imgClass: "sage",
    photo: "assets/portrait-coat.jpg",
    shortBullets: ["Every stage of cancer care", "Enteral &amp; tube feeding guidance", "Palliative &amp; end-of-life support", "Constant WhatsApp access"],
    subPlans: [
      { key: "assessment", label: "One-time Assessment",      duration: "60–75 mins · Google Meet", inr: 4500,  usd: 65,  desc: "A comprehensive nutritional assessment to understand your current status, identify risks early, and build a plan tailored to your diagnosis." },
      { key: "followup",   label: "Follow-up Session",        duration: "30–45 mins · Google Meet", inr: 2500,  usd: 42,  desc: "A dedicated check-in to review progress, manage side effects, and adjust your nutrition plan as your treatment evolves." },
      { key: "package",    label: "3-Month Support Package",  duration: "3-month support block",             inr: 18000, usd: 250, desc: "Comprehensive 3-month support covering all phases, continuous adjustments, WhatsApp access, and a custom digital care plan." }
    ],
    intro: "A cancer diagnosis changes everything. Suddenly, a question as simple as “What should I eat?” feels impossible to answer. There is advice coming from every direction, and most of it does not account for you, your culture, your family, your budget, or what you are actually going through.<br><br>As a Dietitian who works for patients with cancer, I know that nutrition during cancer care is not just about food. It is about feeling supported, understood, and cared for at every stage of your journey.<br><br>Good nutrition is one of the most powerful tools available during cancer treatment, and it is often one of the most overlooked. Starting nutrition support early can help your body prepare for surgery and treatment, reduce the severity of side effects, support your recovery, and improve your overall quality of life. This program is built around you.",
    sections: [
      {
        title: "What This Program Offers",
        rows: [
          { ico: "shield",      b: "Nutrition Assessment at Diagnosis",         t: "Understanding where you are starting from, identifying nutritional risks early, and building a plan that fits your life right now." },
          { ico: "star",        b: "Prehabilitation Before Treatment",           t: "Getting your body as strong as possible before chemotherapy, radiation, or surgery begins, so you are better equipped to handle what is ahead." },
          { ico: "stethoscope", b: "Nutrition Optimisation Before Surgery",      t: "Targeted nutrition support in the weeks before surgery to support healing, reduce complications, and speed up recovery." },
          { ico: "heart",       b: "Support During Chemotherapy &amp; Radiation",t: "Ongoing guidance through active treatment, adapting your nutrition plan as your needs change week to week." },
          { ico: "list",        b: "Managing Symptoms &amp; Side Effects",       t: "Practical, realistic strategies for nausea, appetite loss, mouth sores, fatigue, weight changes, and digestive issues." },
          { ico: "care",        b: "Home Enteral Nutrition &amp; Tube Feeding",  t: "Clear, compassionate support for patients and families navigating tube feeding at home, with guidance every step of the way." },
          { ico: "dove",        b: "Palliative Care Nutrition",                  t: "When the focus of care shifts to comfort and quality of life, nutrition shifts with it. Support is gentle, flexible, and always led by what matters most to you and your family." },
          { ico: "doc",         b: "End of Life Care",                           t: "Compassionate guidance for patients and families, helping navigate difficult decisions around food and feeding with honesty, sensitivity, and care." },
          { ico: "refresh",     b: "Post-Cancer Rehabilitation",                 t: "Nutrition support does not stop when treatment ends. This phase focuses on rebuilding strength, restoring energy, and supporting long-term health and recovery." }
        ]
      },
      {
        title: "Your Peace of Mind",
        highlight: true,
        rows: [
          { ico: "digitalplan", b: "Your Custom Digital Plan",  t: "You will receive a comprehensive, easily accessible Digital Care Plan that updates as your treatment evolves, avoiding the clutter of paper records." },
          { ico: "whatsapp",    b: "Constant WhatsApp Support", t: "Cancer does not work on a schedule. You and your caregivers will have direct, priority WhatsApp access to me for real-time guidance, reassurance, and quick adjustments." }
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
    inr: { price: 25000, meta: "base package", lbl: "Comprehensive corporate wellness package, scope shaped to your team size & goals." },
    usd: { price: 350,   meta: "base package", lbl: "Comprehensive corporate wellness package, scope shaped to your team size & goals." },
    pill: "For teams",
    calendlyUrl: "https://calendly.com/foodmedico/schedule-a-meeting",
    imgClass: "deep",
    photo: "assets/cred-conference.jpg",
    shortBullets: ["Interactive employee workshops", "Executive 1:1 health audits", "Pantry & cafeteria audit", "Customized wellness challenges"],
    intro: "Poor nutrition, chronic stress and sedentary work directly cause burnout, sick days and decreased cognitive performance. Our corporate solutions integrate seamlessly into demanding professional lives, no restrictive diets, just sustainable strategies your team will actually adopt.",
    sections: [{
      title: "What's Included",
      rows: [
        { ico: "mic",     b: "Interactive Employee Workshops (60–90 min)", t: "Engaging, science-backed sessions: <em>The Executive Edge</em> (beating the 3 PM slump), <em>Desk-Bound Wellness</em> (snacking, hydration, lunch ordering) and <em>Stress, Sleep &amp; The Gut</em> (the gut-brain axis at work)." },
        { ico: "star",    b: "Executive 1:1 Health Audits",                t: "Confidential 20-minute rapid consultations for leadership and select employees, metabolic markers, travel-heavy lifestyle diets, business dinners and customised supplementation." },
        { ico: "cafe",    b: "Corporate Pantry &amp; Cafeteria Audit",     t: "A comprehensive review of pantry, vending machines and cafeteria menus, with an actionable <em>Healthy Swap List</em> of nutrient-dense, high-energy alternatives that don't sacrifice taste or budget." },
        { ico: "trophy",  b: "Customized Wellness Challenges",             t: "Month-long, gamified team challenges (<em>The Hydration Sprint</em>, <em>Mindful Meals Month</em>) with weekly check-ins, digital resources and progress tracking to build long-term camaraderie." }
      ]
    }]
  }
};

/* To show hidden services, move keys back into VISIBLE_SERVICES */
export const VISIBLE_SERVICES = ['initial', 'followup', 'oncology'];
export const SERVICE_ORDER    = VISIBLE_SERVICES;
