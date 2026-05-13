import { useEffect, useState } from "react";

type Language = "en" | "et";
type PageId = "home" | "workouts" | "live" | "trainers" | "membership" | "faq";
type WorkoutFilter = "all" | "strength" | "cardio" | "mobility" | "youth";

const pages: PageId[] = ["home", "workouts", "live", "trainers", "membership", "faq"];

const getPageFromHash = (): PageId => {
  const hash = window.location.hash.replace("#", "") as PageId;
  return pages.includes(hash) ? hash : "home";
};

const siteCopy = {
  en: {
    brand: {
      mark: "TF",
      name: "TrainFlow",
      tagline: "Move with structure, train with energy.",
    },
    nav: [
      { id: "home" as const, label: "Home" },
      { id: "workouts" as const, label: "Workouts" },
      { id: "live" as const, label: "Live schedule" },
      { id: "trainers" as const, label: "Trainers" },
      { id: "membership" as const, label: "Membership" },
      { id: "faq" as const, label: "FAQ" },
    ],
    header: {
      trial: "14-day free trial",
      languageLabel: "Language",
    },
    hero: {
      eyebrow: "Online training platform",
      title: "Premium home workouts with a bold club feeling.",
      text:
        "TrainFlow is a polished video training platform inspired by modern fitness studios: structured plans, weekly live sessions, and trainers who keep every class clear and motivating.",
      primary: "Start free trial",
      secondary: "View workouts",
      stats: [
        { value: "250+", label: "video workouts" },
        { value: "7", label: "days of live sessions" },
        { value: "9.95€", label: "monthly plan" },
      ],
      panelTitle: "Tonight's featured class",
      panelText: "Full Body Burn with Sandra Kask, 19:00",
      panelMeta: "45 min • Mat + dumbbells • English / Estonian",
      panelButton: "See timetable",
      cardTitle: "Train wherever you are",
      cardText:
        "At home, between lectures, during travel, or right after work. Everything stays in one clean membership.",
      audienceTitle: "Built for real routines",
      audienceItems: ["Strength", "Cardio", "Mobility", "Youth"],
    },
    highlights: {
      eyebrow: "Why members stay",
      title: "A sharper digital experience than a simple video library.",
      items: [
        {
          title: "Structured weekly rhythm",
          text: "Follow curated plans, switch between styles, and keep momentum without guessing your next session.",
        },
        {
          title: "Live and on-demand",
          text: "Mix scheduled classes with an on-demand library so your training works even on chaotic days.",
        },
        {
          title: "Clear bilingual experience",
          text: "The whole frontend is ready in English and Estonian for local users and international members.",
        },
      ],
    },
    homeCollections: {
      eyebrow: "Collections",
      title: "Choose the training mood that fits your week.",
      cards: [
        {
          title: "Strong start",
          text: "Power sessions for legs, core, and upper body.",
          meta: "18 workouts",
          image:
            "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
        },
        {
          title: "Sweat & cardio",
          text: "Fast-paced classes that raise the pulse without wasting time.",
          meta: "22 workouts",
          image:
            "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
        },
        {
          title: "Mobility reset",
          text: "Low-impact sessions for recovery, posture, and movement quality.",
          meta: "14 workouts",
          image:
            "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        },
      ],
    },
    testimonials: {
      eyebrow: "Member voices",
      title: "Short sessions, strong consistency, and coaching that feels personal.",
      items: [
        {
          quote:
            "The layout is simple, the classes look premium, and I can switch from mobility to strength in one minute.",
          author: "Kertu, 22",
        },
        {
          quote:
            "The live timetable gives me structure, but the library keeps me going when my study schedule changes.",
          author: "Martin, 29",
        },
        {
          quote:
            "It feels much closer to a real studio than a random YouTube playlist.",
          author: "Evelin, 34",
        },
      ],
    },
    workouts: {
      eyebrow: "Workout library",
      title: "Browse a clean catalogue of classes by goal, mood, or equipment.",
      text:
        "Every card below is part of the frontend demo. Filters are fully interactive, so the page already behaves like a real training catalogue.",
      filters: [
        { id: "all" as const, label: "All" },
        { id: "strength" as const, label: "Strength" },
        { id: "cardio" as const, label: "Cardio" },
        { id: "mobility" as const, label: "Mobility" },
        { id: "youth" as const, label: "Youth" },
      ],
      cards: [
        {
          category: "strength" as const,
          title: "Upper Body Sculpt",
          duration: "32 min",
          level: "Intermediate",
          coach: "Sandra",
          equipment: "Dumbbells",
          image:
            "https://images.unsplash.com/photo-1518459031867-a89b944bffe4?auto=format&fit=crop&w=1200&q=80",
        },
        {
          category: "cardio" as const,
          title: "Cardio Circuit Rush",
          duration: "28 min",
          level: "High energy",
          coach: "Marta",
          equipment: "No equipment",
          image:
            "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=1200&q=80",
        },
        {
          category: "mobility" as const,
          title: "Hip & Spine Reset",
          duration: "24 min",
          level: "Low impact",
          coach: "Rasmus",
          equipment: "Mat",
          image:
            "https://images.unsplash.com/photo-1518611012118-fb2fdb5d0e3d?auto=format&fit=crop&w=1200&q=80",
        },
        {
          category: "strength" as const,
          title: "Lower Body Power",
          duration: "41 min",
          level: "Intermediate",
          coach: "Sandra",
          equipment: "Bar + bands",
          image:
            "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        },
        {
          category: "cardio" as const,
          title: "Dance Burn Express",
          duration: "20 min",
          level: "All levels",
          coach: "Grete",
          equipment: "No equipment",
          image:
            "https://images.unsplash.com/photo-1506629905607-d9b1c705d0b2?auto=format&fit=crop&w=1200&q=80",
        },
        {
          category: "youth" as const,
          title: "Teen Core Flow",
          duration: "18 min",
          level: "Youth 13+",
          coach: "Kaisa",
          equipment: "Mat",
          image:
            "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
        },
      ],
      programsTitle: "Suggested programs",
      programs: [
        {
          title: "4-week strength track",
          text: "Three focused sessions per week with active recovery built in.",
        },
        {
          title: "Busy week express plan",
          text: "Four short sessions under 30 minutes for packed schedules.",
        },
        {
          title: "Mobility comeback",
          text: "Gentle rebuild for posture, hips, and everyday movement.",
        },
      ],
    },
    live: {
      eyebrow: "Live timetable",
      title: "Weekly sessions that give the platform a club-like rhythm.",
      text:
        "Instead of only static videos, the schedule page creates a living routine. It also mirrors the direction used by NETFIT with recurring coached classes.",
      spotlight: {
        title: "Upcoming highlight",
        text: "Saturday 10:00 • StrongBody Weekend with studio lighting and multi-camera setup.",
      },
      days: [
        {
          day: "Mon",
          sessions: ["07:30 Morning Mobility", "18:00 Core & Cardio"],
        },
        {
          day: "Tue",
          sessions: ["12:15 Desk Break Flow", "19:00 Full Body Strength"],
        },
        {
          day: "Wed",
          sessions: ["07:00 Bootcamp Express", "18:30 Dance Cardio"],
        },
        {
          day: "Thu",
          sessions: ["12:00 Pilates Reset", "19:00 Upper Body Power"],
        },
        {
          day: "Fri",
          sessions: ["08:00 Stretch & Breathe", "17:30 Friday Burn"],
        },
        {
          day: "Sat",
          sessions: ["10:00 StrongBody Weekend", "11:30 Family Move"],
        },
      ],
      steps: [
        "Open the schedule and choose a class that fits your day.",
        "Join the live session or save it to your evening routine.",
        "Return to the library for extra classes after the livestream ends.",
      ],
    },
    trainers: {
      eyebrow: "Coaching team",
      title: "Different training personalities, one consistent visual platform.",
      text:
        "Trainer pages are fully presentational for now, but ready to connect with backend data later without changing the main structure.",
      cards: [
        {
          name: "Sandra Kask",
          role: "Strength & conditioning",
          bio: "Precise cueing, controlled tempo, and sessions that feel athletic without becoming overwhelming.",
          image:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80",
        },
        {
          name: "Grete Saar",
          role: "Dance cardio",
          bio: "Creates energetic classes with a studio feel, fast transitions, and easy-to-follow combinations.",
          image:
            "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
        },
        {
          name: "Rasmus Oja",
          role: "Mobility & recovery",
          bio: "Builds calm but effective flows for joint care, posture, and movement confidence.",
          image:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80",
        },
      ],
      principles: [
        "Every trainer card has a strong visual identity and clear specialization.",
        "The layout leaves room for future ratings, playlists, and individual trainer pages.",
        "Each block is designed to stay readable on both mobile and desktop.",
      ],
    },
    membership: {
      eyebrow: "Membership",
      title: "One platform, two simple ways to join.",
      text:
        "This page is designed as a conversion screen. No payment backend is connected yet, but all interactions and package cards are prepared for that next step.",
      plans: [
        {
          title: "Digital access",
          price: "9.95€",
          note: "per month",
          features: ["14-day trial", "Full video library", "Weekly live sessions"],
          accent: "light",
        },
        {
          title: "Club member access",
          price: "0€",
          note: "with selected partner membership",
          features: ["Same platform", "Use existing login", "Priority challenge drops"],
          accent: "dark",
        },
      ],
      stepsTitle: "How it could work next",
      steps: [
        "Choose package",
        "Create account or sign in",
        "Connect payment and unlock the platform",
      ],
      comparison: [
        { label: "Workout library", values: ["Included", "Included"] },
        { label: "Live classes", values: ["Included", "Included"] },
        { label: "Partner club benefits", values: ["No", "Yes"] },
      ],
      ctaTitle: "A clean CTA area ready for checkout integration.",
      ctaText:
        "Right now the frontend behaves like a polished product presentation, so the backend can be added later without redesigning the main conversion flow.",
      ctaButton: "Choose package",
    },
    faq: {
      eyebrow: "Support & FAQ",
      title: "Practical answers for a product demo that already feels launch-ready.",
      text:
        "The FAQ page mirrors what users expect from a real training platform: what it is, how to join, where to train, and who to contact.",
      items: [
        {
          question: "What is TrainFlow?",
          answer:
            "TrainFlow is a concept frontend for an online workout platform with on-demand classes, live sessions, training plans, and bilingual support.",
        },
        {
          question: "Can I use it without a gym membership?",
          answer:
            "Yes. The membership page presents a standalone digital subscription at 9.95€ per month with a 14-day free trial.",
        },
        {
          question: "Does this version connect to the backend already?",
          answer:
            "Not yet. This build is intentionally frontend-only, with structure prepared for future API integration.",
        },
        {
          question: "Why are there two languages?",
          answer:
            "English and Estonian are available directly in the header, and the current selection applies across all pages.",
        },
      ],
      contactTitle: "Need support?",
      contactText: "Mon-Fri 09:00-17:00 • hello@trainflow.ee • Tallinn, Estonia",
    },
    footer: {
      linksTitle: "Explore",
      legalTitle: "Platform",
      legal: ["Frontend demo only", "Responsive layout", "Ready for backend integration"],
      copyright: "TrainFlow frontend concept",
    },
  },
  et: {
    brand: {
      mark: "TF",
      name: "TrainFlow",
      tagline: "Liigu kindla plaaniga ja treeni hea energiaga.",
    },
    nav: [
      { id: "home" as const, label: "Avaleht" },
      { id: "workouts" as const, label: "Treeningud" },
      { id: "live" as const, label: "Tunniplaan" },
      { id: "trainers" as const, label: "Treenerid" },
      { id: "membership" as const, label: "Paketid" },
      { id: "faq" as const, label: "KKK" },
    ],
    header: {
      trial: "14 päeva tasuta",
      languageLabel: "Keel",
    },
    hero: {
      eyebrow: "Online treeningplatvorm",
      title: "Premium kodused treeningud tugeva klubitundega.",
      text:
        "TrainFlow on kaasaegne videotreeningute platvorm, mis on inspireeritud moodsatest fitness-stuudiotest: selged treeningkavad, iganädalased live-tunnid ja treenerid, kes hoiavad iga trenni motiveeriva ja arusaadavana.",
      primary: "Alusta tasuta",
      secondary: "Vaata treeninguid",
      stats: [
        { value: "250+", label: "videotreeningut" },
        { value: "7", label: "päeva live-tunde" },
        { value: "9.95€", label: "kuupakett" },
      ],
      panelTitle: "Tänase õhtu soovitus",
      panelText: "Full Body Burn koos Sandra Kasega, 19:00",
      panelMeta: "45 min • Matt + hantlid • Inglise / eesti",
      panelButton: "Vaata tunniplaani",
      cardTitle: "Treeni seal, kus sul sobib",
      cardText:
        "Kodus, loengute vahel, reisil või kohe pärast tööd. Kõik on ühes puhtas ja lihtsas liikmelisuses koos.",
      audienceTitle: "Loodud päris rutiinide jaoks",
      audienceItems: ["Jõud", "Kardio", "Liikuvus", "Noored"],
    },
    highlights: {
      eyebrow: "Miks liikmed jäävad",
      title: "Teravam digitaalne kogemus kui lihtsalt videote kogumik.",
      items: [
        {
          title: "Selge nädalane rütm",
          text: "Järgi koostatud kavasid, vaheta stiile ja hoia järjepidevust ilma et peaksid iga kord mõtlema, mida järgmisena teha.",
        },
        {
          title: "Live ja järelvaatamine",
          text: "Ühenda kindlad tunniajad ja videoteek, et treening sobiks ka kiirete või muutuvate päevadega.",
        },
        {
          title: "Kaks keelt ühes kogemuses",
          text: "Kogu frontend töötab inglise ja eesti keeles ning on valmis nii kohalikele kui ka rahvusvahelistele kasutajatele.",
        },
      ],
    },
    homeCollections: {
      eyebrow: "Kogud",
      title: "Vali treeningutunne, mis sobib sinu nädalaga.",
      cards: [
        {
          title: "Tugev algus",
          text: "Jõutrennid jalgadele, kerele ja ülakehale.",
          meta: "18 treeningut",
          image:
            "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
        },
        {
          title: "Higi & kardio",
          text: "Tempokad tunnid, mis tõstavad pulssi ilma aega raiskamata.",
          meta: "22 treeningut",
          image:
            "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
        },
        {
          title: "Liikuvuse restart",
          text: "Madala koormusega treeningud taastumiseks, rühi parandamiseks ja paremaks liikuvuseks.",
          meta: "14 treeningut",
          image:
            "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        },
      ],
    },
    testimonials: {
      eyebrow: "Liikmete arvamused",
      title: "Lühikesed treeningud, tugev järjepidevus ja treenerid, kes mõjuvad personaalselt.",
      items: [
        {
          quote:
            "Leht on lihtne kasutada, treeningud näevad head välja ja ma saan ühe minutiga vahetada liikuvuse ja jõutrenni vahel.",
          author: "Kertu, 22",
        },
        {
          quote:
            "Live tunniplaan annab mulle rütmi, aga videoteek aitab jätkata ka siis, kui koolinädal muutub.",
          author: "Martin, 29",
        },
        {
          quote:
            "See tundub palju rohkem nagu päris stuudio kui juhuslik YouTube'i playlist.",
          author: "Evelin, 34",
        },
      ],
    },
    workouts: {
      eyebrow: "Treeninguteek",
      title: "Sirvi treeninguid eesmärgi, meeleolu või varustuse järgi.",
      text:
        "Kõik allolevad kaardid on osa frontendi demost. Filtrid töötavad täielikult, nii et leht käitub juba nagu päris treeningute kataloog.",
      filters: [
        { id: "all" as const, label: "Kõik" },
        { id: "strength" as const, label: "Jõud" },
        { id: "cardio" as const, label: "Kardio" },
        { id: "mobility" as const, label: "Liikuvus" },
        { id: "youth" as const, label: "Noored" },
      ],
      cards: [
        {
          category: "strength" as const,
          title: "Upper Body Sculpt",
          duration: "32 min",
          level: "Kesktase",
          coach: "Sandra",
          equipment: "Hantlid",
          image:
            "https://images.unsplash.com/photo-1518459031867-a89b944bffe4?auto=format&fit=crop&w=1200&q=80",
        },
        {
          category: "cardio" as const,
          title: "Cardio Circuit Rush",
          duration: "28 min",
          level: "Kõrge energia",
          coach: "Marta",
          equipment: "Varustust pole vaja",
          image:
            "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=1200&q=80",
        },
        {
          category: "mobility" as const,
          title: "Hip & Spine Reset",
          duration: "24 min",
          level: "Madal koormus",
          coach: "Rasmus",
          equipment: "Matt",
          image:
            "https://images.unsplash.com/photo-1518611012118-fb2fdb5d0e3d?auto=format&fit=crop&w=1200&q=80",
        },
        {
          category: "strength" as const,
          title: "Lower Body Power",
          duration: "41 min",
          level: "Kesktase",
          coach: "Sandra",
          equipment: "Kang + kummid",
          image:
            "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        },
        {
          category: "cardio" as const,
          title: "Dance Burn Express",
          duration: "20 min",
          level: "Kõik tasemed",
          coach: "Grete",
          equipment: "Varustust pole vaja",
          image:
            "https://images.unsplash.com/photo-1506629905607-d9b1c705d0b2?auto=format&fit=crop&w=1200&q=80",
        },
        {
          category: "youth" as const,
          title: "Teen Core Flow",
          duration: "18 min",
          level: "Noored 13+",
          coach: "Kaisa",
          equipment: "Matt",
          image:
            "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
        },
      ],
      programsTitle: "Soovitatud programmid",
      programs: [
        {
          title: "4-nädalane jõukava",
          text: "Kolm sihitud treeningut nädalas koos aktiivse taastumisega.",
        },
        {
          title: "Kiire nädala ekspressplaan",
          text: "Neli alla 30 minuti treeningut tiheda graafiku jaoks.",
        },
        {
          title: "Liikuvuse tagasitulek",
          text: "Rahulik taastav kava rühile, puusadele ja igapäevasele liikumisele.",
        },
      ],
    },
    live: {
      eyebrow: "Live tunniplaan",
      title: "Iganädalased tunnid, mis annavad platvormile klubilaadse rütmi.",
      text:
        "See leht ei näita ainult staatilisi videoid, vaid loob päris rutiini. Suund on sarnane NETFITi loogikaga, kus korduvad juhendatud live-tunnid hoiavad kasutajaid aktiivsena.",
      spotlight: {
        title: "Järgmine esiletõstetud tund",
        text: "Laupäev 10:00 • StrongBody Weekend stuudiovalguse ja mitme kaameraga.",
      },
      days: [
        {
          day: "E",
          sessions: ["07:30 Morning Mobility", "18:00 Core & Cardio"],
        },
        {
          day: "T",
          sessions: ["12:15 Desk Break Flow", "19:00 Full Body Strength"],
        },
        {
          day: "K",
          sessions: ["07:00 Bootcamp Express", "18:30 Dance Cardio"],
        },
        {
          day: "N",
          sessions: ["12:00 Pilates Reset", "19:00 Upper Body Power"],
        },
        {
          day: "R",
          sessions: ["08:00 Stretch & Breathe", "17:30 Friday Burn"],
        },
        {
          day: "L",
          sessions: ["10:00 StrongBody Weekend", "11:30 Family Move"],
        },
      ],
      steps: [
        "Ava tunniplaan ja vali tund, mis sobib sinu päevaga.",
        "Liitu live-tunniga või salvesta see õhtuseks rutiiniks.",
        "Pärast otseülekannet jätka videoteegis lisatreeningutega.",
      ],
    },
    trainers: {
      eyebrow: "Treenerite tiim",
      title: "Erinevad treenerid, üks ühtlane visuaalne platvorm.",
      text:
        "Treenerite lehed on praegu täielikult presentatsioonilised, kuid valmis hiljem backend-andmetega ühendamiseks ilma põhistruktuuri muutmata.",
      cards: [
        {
          name: "Sandra Kask",
          role: "Jõud ja üldkehaline ettevalmistus",
          bio: "Täpsed juhised, kontrollitud tempo ja treeningud, mis mõjuvad sportlikult ilma liigse keerukuseta.",
          image:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80",
        },
        {
          name: "Grete Saar",
          role: "Tantsuline kardio",
          bio: "Loob energilisi tunde stuudiotundega, kiirete üleminekute ja lihtsalt jälgitavate kombinatsioonidega.",
          image:
            "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
        },
        {
          name: "Rasmus Oja",
          role: "Liikuvus ja taastumine",
          bio: "Koostab rahulikke, kuid tõhusaid vooge liigeste hoidmiseks, rühi parandamiseks ja liikumiskindluseks.",
          image:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80",
        },
      ],
      principles: [
        "Igal treenerikaardil on tugev visuaalne identiteet ja selge spetsialiseerumine.",
        "Paigutus jätab ruumi hilisematele hinnangutele, playlistidele ja eraldi treenerilehtedele.",
        "Kõik blokid on loodud jääma loetavaks nii mobiilis kui ka desktopis.",
      ],
    },
    membership: {
      eyebrow: "Paketid",
      title: "Üks platvorm, kaks lihtsat võimalust liitumiseks.",
      text:
        "See leht on loodud konversioonileheks. Makselahendus pole veel ühendatud, kuid kõik interaktsioonid ja paketikaardid on selle järgmise sammu jaoks valmis.",
      plans: [
        {
          title: "Digitaalne ligipääs",
          price: "9.95€",
          note: "kuus",
          features: ["14 päeva tasuta", "Täielik videoteek", "Iganädalased live-tunnid"],
          accent: "light",
        },
        {
          title: "Klubiliikme ligipääs",
          price: "0€",
          note: "valitud partnerliikmelisusega",
          features: ["Sama platvorm", "Kasuta olemasolevat sisselogimist", "Eelis uutele väljakutsetele"],
          accent: "dark",
        },
      ],
      stepsTitle: "Kuidas see järgmises etapis töötaks",
      steps: [
        "Vali pakett",
        "Loo konto või logi sisse",
        "Ühenda makse ja ava kogu platvorm",
      ],
      comparison: [
        { label: "Videoteek", values: ["Sees", "Sees"] },
        { label: "Live tunnid", values: ["Sees", "Sees"] },
        { label: "Partnerklubi eelised", values: ["Ei", "Jah"] },
      ],
      ctaTitle: "Puhas CTA-plokk, mis on valmis checkouti ühendamiseks.",
      ctaText:
        "Praegu käitub frontend nagu viimistletud tootetutvustus, nii et backend saab hiljem lisanduda ilma peamist müügivoogu ümber ehitamata.",
      ctaButton: "Vali pakett",
    },
    faq: {
      eyebrow: "Tugi & KKK",
      title: "Praktilised vastused demole, mis tundub juba launch-ready.",
      text:
        "KKK-leht peegeldab seda, mida kasutajad päris treeningplatvormilt ootavad: mis see on, kuidas liituda, kus treenida ja kelle poole pöörduda.",
      items: [
        {
          question: "Mis on TrainFlow?",
          answer:
            "TrainFlow on online treeningplatvormi frontendi kontseptsioon koos videotreeningute, live-tundide, kavade ja kahe keele toega.",
        },
        {
          question: "Kas seda saab kasutada ka ilma jõusaali liikmelisuseta?",
          answer:
            "Jah. Paketileht näitab iseseisvat digitaalset liitumist hinnaga 9.95€ kuus koos 14-päevase tasuta prooviga.",
        },
        {
          question: "Kas see versioon on juba backendiga ühendatud?",
          answer:
            "Mitte veel. See build on teadlikult ainult frontend ning selle struktuur on valmis hilisemaks API ühendamiseks.",
        },
        {
          question: "Miks siin on kaks keelt?",
          answer:
            "Inglise ja eesti keel on kohe päises vahetatavad ning valik rakendub kõikidele lehtedele.",
        },
      ],
      contactTitle: "Vajad abi?",
      contactText: "E-R 09:00-17:00 • hello@trainflow.ee • Tallinn, Eesti",
    },
    footer: {
      linksTitle: "Lehed",
      legalTitle: "Platvorm",
      legal: ["Ainult frontendi demo", "Responsiivne paigutus", "Valmis backendiga ühendamiseks"],
      copyright: "TrainFlow frontendi kontseptsioon",
    },
  },
};

function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem("trainflow_language");
    return savedLanguage === "en" || savedLanguage === "et" ? savedLanguage : "et";
  });
  const [currentPage, setCurrentPage] = useState<PageId>(() => getPageFromHash());
  const [workoutFilter, setWorkoutFilter] = useState<WorkoutFilter>("all");
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const copy = siteCopy[language];
  const filteredWorkouts =
    workoutFilter === "all"
      ? copy.workouts.cards
      : copy.workouts.cards.filter((workout) => workout.category === workoutFilter);

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = "home";
    }

    const handleHashChange = () => {
      setCurrentPage(getPageFromHash());
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    localStorage.setItem("trainflow_language", language);
    document.documentElement.lang = language;
    const activePageTitle = copy.nav.find((item) => item.id === currentPage)?.label ?? copy.brand.name;
    document.title = `${activePageTitle} | ${copy.brand.name}`;
  }, [copy, currentPage, language]);

  const navigateTo = (page: PageId) => {
    window.location.hash = page;
  };

  return (
    <div className="app-shell">
      <div className="background-orb background-orb-left" aria-hidden="true" />
      <div className="background-orb background-orb-right" aria-hidden="true" />

      <header className="site-header">
        <div className="container header-row">
          <button className="brand-lockup" type="button" onClick={() => navigateTo("home")}>
            <span className="brand-mark">{copy.brand.mark}</span>
            <span>
              <strong>{copy.brand.name}</strong>
              <small>{copy.brand.tagline}</small>
            </span>
          </button>

          <nav className="main-nav" aria-label="Main navigation">
            {copy.nav.map((item) => (
              <button
                key={item.id}
                className={item.id === currentPage ? "nav-link active" : "nav-link"}
                type="button"
                onClick={() => navigateTo(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="header-actions">
            <div className="language-switcher" aria-label={copy.header.languageLabel}>
              <button
                className={language === "en" ? "lang-button active" : "lang-button"}
                type="button"
                onClick={() => setLanguage("en")}
              >
                EN
              </button>
              <button
                className={language === "et" ? "lang-button active" : "lang-button"}
                type="button"
                onClick={() => setLanguage("et")}
              >
                ET
              </button>
            </div>
            <button className="trial-button" type="button" onClick={() => navigateTo("membership")}>
              {copy.header.trial}
            </button>
          </div>
        </div>
      </header>

      <main className="container page-stack">
        <section className="hero-panel page-animate">
          <div className="hero-copy">
            <span className="section-eyebrow">{copy.hero.eyebrow}</span>
            <h1>{copy.hero.title}</h1>
            <p>{copy.hero.text}</p>

            <div className="hero-actions">
              <button className="primary-action" type="button" onClick={() => navigateTo("membership")}>
                {copy.hero.primary}
              </button>
              <button className="secondary-action" type="button" onClick={() => navigateTo("workouts")}>
                {copy.hero.secondary}
              </button>
            </div>

            <div className="hero-stats">
              {copy.hero.stats.map((stat) => (
                <article className="stat-pill" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-card visual-featured">
              <span className="visual-label">{copy.hero.panelTitle}</span>
              <strong>{copy.hero.panelText}</strong>
              <p>{copy.hero.panelMeta}</p>
              <button className="inline-link" type="button" onClick={() => navigateTo("live")}>
                {copy.hero.panelButton}
              </button>
            </div>

            <div className="visual-card visual-image-card">
              <div className="visual-image" aria-hidden="true" />
              <div className="visual-card-copy">
                <strong>{copy.hero.cardTitle}</strong>
                <p>{copy.hero.cardText}</p>
              </div>
            </div>

            <div className="visual-card visual-tags">
              <span className="visual-label">{copy.hero.audienceTitle}</span>
              <div className="tag-row">
                {copy.hero.audienceItems.map((item) => (
                  <span className="tag-chip" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="info-strip page-animate">
          {copy.highlights.items.map((item) => (
            <article className="info-card" key={item.title}>
              <span className="info-index">0{copy.highlights.items.indexOf(item) + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </section>

        {currentPage === "home" && (
          <>
            <section className="page-section page-animate">
              <div className="section-heading">
                <span className="section-eyebrow">{copy.highlights.eyebrow}</span>
                <h2>{copy.highlights.title}</h2>
              </div>
            </section>

            <section className="page-section page-animate">
              <div className="section-heading">
                <span className="section-eyebrow">{copy.homeCollections.eyebrow}</span>
                <h2>{copy.homeCollections.title}</h2>
              </div>
              <div className="collection-grid">
                {copy.homeCollections.cards.map((card) => (
                  <article className="collection-card" key={card.title}>
                    <div
                      className="collection-image"
                      style={{ backgroundImage: `linear-gradient(180deg, transparent, rgba(15, 25, 32, 0.72)), url(${card.image})` }}
                    />
                    <div className="collection-copy">
                      <span>{card.meta}</span>
                      <h3>{card.title}</h3>
                      <p>{card.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="page-section page-animate">
              <div className="section-heading">
                <span className="section-eyebrow">{copy.testimonials.eyebrow}</span>
                <h2>{copy.testimonials.title}</h2>
              </div>
              <div className="testimonial-grid">
                {copy.testimonials.items.map((item) => (
                  <article className="testimonial-card" key={item.author}>
                    <p>"{item.quote}"</p>
                    <strong>{item.author}</strong>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        {currentPage === "workouts" && (
          <section className="page-section page-animate">
            <div className="section-heading narrow">
              <span className="section-eyebrow">{copy.workouts.eyebrow}</span>
              <h2>{copy.workouts.title}</h2>
              <p>{copy.workouts.text}</p>
            </div>

            <div className="filter-row" role="tablist" aria-label={copy.workouts.eyebrow}>
              {copy.workouts.filters.map((filter) => (
                <button
                  key={filter.id}
                  className={workoutFilter === filter.id ? "filter-chip active" : "filter-chip"}
                  type="button"
                  onClick={() => setWorkoutFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="workout-grid">
              {filteredWorkouts.map((workout) => (
                <article className="workout-card" key={`${workout.category}-${workout.title}`}>
                  <div
                    className="workout-image"
                    style={{ backgroundImage: `linear-gradient(180deg, transparent, rgba(15, 25, 32, 0.84)), url(${workout.image})` }}
                  />
                  <div className="workout-copy">
                    <span>{workout.level}</span>
                    <h3>{workout.title}</h3>
                    <p>
                      {workout.duration} • {workout.coach}
                    </p>
                    <small>{workout.equipment}</small>
                  </div>
                </article>
              ))}
            </div>

            <div className="program-grid">
              <div className="section-heading compact">
                <h3>{copy.workouts.programsTitle}</h3>
              </div>
              {copy.workouts.programs.map((program) => (
                <article className="program-card" key={program.title}>
                  <h4>{program.title}</h4>
                  <p>{program.text}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {currentPage === "live" && (
          <section className="page-section page-animate">
            <div className="split-intro">
              <div className="section-heading narrow">
                <span className="section-eyebrow">{copy.live.eyebrow}</span>
                <h2>{copy.live.title}</h2>
                <p>{copy.live.text}</p>
              </div>
              <article className="spotlight-card">
                <span>{copy.live.spotlight.title}</span>
                <strong>{copy.live.spotlight.text}</strong>
              </article>
            </div>

            <div className="schedule-grid">
              {copy.live.days.map((day) => (
                <article className="schedule-card" key={day.day}>
                  <span>{day.day}</span>
                  {day.sessions.map((session) => (
                    <p key={session}>{session}</p>
                  ))}
                </article>
              ))}
            </div>

            <div className="steps-grid">
              {copy.live.steps.map((step) => (
                <article className="step-card" key={step}>
                  <strong>•</strong>
                  <p>{step}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {currentPage === "trainers" && (
          <section className="page-section page-animate">
            <div className="section-heading narrow">
              <span className="section-eyebrow">{copy.trainers.eyebrow}</span>
              <h2>{copy.trainers.title}</h2>
              <p>{copy.trainers.text}</p>
            </div>

            <div className="trainer-grid">
              {copy.trainers.cards.map((trainer) => (
                <article className="trainer-card" key={trainer.name}>
                  <div
                    className="trainer-image"
                    style={{ backgroundImage: `linear-gradient(180deg, transparent 35%, rgba(15, 25, 32, 0.82)), url(${trainer.image})` }}
                  />
                  <div className="trainer-copy">
                    <span>{trainer.role}</span>
                    <h3>{trainer.name}</h3>
                    <p>{trainer.bio}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="principle-list">
              {copy.trainers.principles.map((principle) => (
                <article className="principle-card" key={principle}>
                  <p>{principle}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {currentPage === "membership" && (
          <section className="page-section page-animate">
            <div className="section-heading narrow">
              <span className="section-eyebrow">{copy.membership.eyebrow}</span>
              <h2>{copy.membership.title}</h2>
              <p>{copy.membership.text}</p>
            </div>

            <div className="pricing-grid">
              {copy.membership.plans.map((plan) => (
                <article
                  className={plan.accent === "dark" ? "price-card dark" : "price-card"}
                  key={plan.title}
                >
                  <span>{plan.title}</span>
                  <strong>{plan.price}</strong>
                  <small>{plan.note}</small>
                  <div className="feature-list">
                    {plan.features.map((feature) => (
                      <p key={feature}>{feature}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="comparison-panel">
              <div className="section-heading compact">
                <h3>{copy.membership.stepsTitle}</h3>
              </div>
              <div className="steps-inline">
                {copy.membership.steps.map((step, index) => (
                  <article className="mini-step" key={step}>
                    <span>0{index + 1}</span>
                    <p>{step}</p>
                  </article>
                ))}
              </div>

              <div className="comparison-table">
                {copy.membership.comparison.map((row) => (
                  <div className="comparison-row" key={row.label}>
                    <strong>{row.label}</strong>
                    <span>{row.values[0]}</span>
                    <span>{row.values[1]}</span>
                  </div>
                ))}
              </div>
            </div>

            <article className="conversion-card">
              <div>
                <span className="section-eyebrow">{copy.membership.eyebrow}</span>
                <h3>{copy.membership.ctaTitle}</h3>
                <p>{copy.membership.ctaText}</p>
              </div>
              <button className="primary-action" type="button" onClick={() => navigateTo("faq")}>
                {copy.membership.ctaButton}
              </button>
            </article>
          </section>
        )}

        {currentPage === "faq" && (
          <section className="page-section page-animate">
            <div className="section-heading narrow">
              <span className="section-eyebrow">{copy.faq.eyebrow}</span>
              <h2>{copy.faq.title}</h2>
              <p>{copy.faq.text}</p>
            </div>

            <div className="faq-layout">
              <div className="faq-list">
                {copy.faq.items.map((item, index) => (
                  <article className="faq-card" key={item.question}>
                    <button
                      className="faq-question"
                      type="button"
                      onClick={() => setOpenFaqIndex(index === openFaqIndex ? -1 : index)}
                    >
                      <span>{item.question}</span>
                      <strong>{index === openFaqIndex ? "−" : "+"}</strong>
                    </button>
                    {index === openFaqIndex && <p>{item.answer}</p>}
                  </article>
                ))}
              </div>

              <aside className="support-card">
                <span>{copy.faq.contactTitle}</span>
                <strong>{copy.brand.name}</strong>
                <p>{copy.faq.contactText}</p>
                <button className="secondary-action" type="button" onClick={() => navigateTo("membership")}>
                  {copy.header.trial}
                </button>
              </aside>
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <strong>{copy.brand.name}</strong>
            <p>{copy.brand.tagline}</p>
          </div>
          <div>
            <span>{copy.footer.linksTitle}</span>
            <div className="footer-links">
              {copy.nav.map((item) => (
                <button key={item.id} type="button" onClick={() => navigateTo(item.id)}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span>{copy.footer.legalTitle}</span>
            <div className="footer-meta">
              {copy.footer.legal.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
        </div>
        <div className="container footer-bottom">
          <small>{copy.footer.copyright}</small>
        </div>
      </footer>
    </div>
  );
}

export default App;
