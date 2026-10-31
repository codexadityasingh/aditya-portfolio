
import { supabase } from "./supabase";

export const DEFAULT_SITE_CONTENT = {
  about: {
    hero: {
      eyebrow: "01 / A LITTLE ABOUT ME",
      title: "A MIND THAT",
      emphasis: "KEEPS BUILDING.",
      description:
        "Developer in progress. Curious by nature. Interested in making useful things feel considered, intuitive and memorable.",
      name: "ADITYA SINGH",
      subtitle: "COMPUTER SCIENCE / CREATIVE TECHNOLOGY",
    },
    introduction: {
      eyebrow: "HELLO, I'M ADITYA.",
      heading: "CURIOUS ABOUT HOW THINGS WORK.",
      paragraphs: [
        "I'm a Computer Science student focused on growing as a developer while exploring the creative side of technology.",
        "I enjoy learning by building: breaking down a problem, figuring out the right tools, creating an interface and improving it until it feels right.",
        "Outside development, I'm interested in photography, videography, visual storytelling and motion — all the things that make a digital experience feel alive.",
      ],
    },
    principles: [
      {
        number: "01",
        title: "STAY CURIOUS.",
        description: "Keep asking questions. Understand how things work and never stop exploring.",
      },
      {
        number: "02",
        title: "BUILD TO LEARN.",
        description: "Turn ideas into working things. Experiment, make mistakes and improve.",
      },
      {
        number: "03",
        title: "CARE ABOUT DETAILS.",
        description: "Good functionality matters. So does the experience of using it.",
      },
    ],
    interests: [
      "WEB DEVELOPMENT",
      "CREATIVE CODING",
      "PHOTOGRAPHY",
      "VIDEOGRAPHY",
      "UI / UX DESIGN",
      "MOTION DESIGN",
    ],
    ending: {
      eyebrow: "STILL LEARNING. ALWAYS BUILDING.",
      title: "THIS IS JUST",
      emphasis: "THE BEGINNING.",
      button: "EXPLORE MY WORK ↗",
      buttonLink: "/projects",
    },
  },

  explore: {
    hero: {
      eyebrow: "04 / SERVICES & PRICING",
      title: "LET'S MAKE",
      emphasis: "IT HAPPEN.",
      description:
        "Websites, visuals and digital experiences. Here's what I can create for you, what it includes and where we can get started.",
      availability: "AVAILABLE FOR PROJECTS",
      subtitle: "INDEPENDENT CREATIVE DEVELOPMENT",
    },
    services: [
      {
        id: "web",
        number: "01",
        category: "DEVELOPMENT",
        title: "WEBSITES",
        description: "Modern, responsive websites designed to make your brand look professional and turn visitors into customers.",
        icon: "⌘",
        packages: [
          {
            name: "STARTER",
            price: "₹4,999",
            description: "A clean online presence.",
            features: ["Single-page website", "Responsive design", "Contact section", "Basic animations", "One revision"],
          },
          {
            name: "BUSINESS",
            price: "₹9,999",
            description: "For businesses ready to grow.",
            features: ["Up to 5 pages", "Custom UI design", "Responsive layouts", "Contact form", "Smooth animations", "Two revisions"],
            popular: true,
          },
          {
            name: "ADVANCED",
            price: "₹17,999",
            description: "A more complete digital experience.",
            features: ["Up to 8 pages", "Advanced interactions", "Database integration", "Custom functionality", "Performance optimisation", "Three revisions"],
          },
        ],
      },
      {
        id: "portfolio",
        number: "02",
        category: "PERSONAL BRANDING",
        title: "PORTFOLIO WEBSITES",
        description: "Stand out online with a personal portfolio that showcases your work, personality and skills.",
        icon: "◈",
        packages: [
          {
            name: "ESSENTIAL",
            price: "₹3,999",
            description: "A simple professional portfolio.",
            features: ["One-page portfolio", "About and skills", "Project showcase", "Contact section", "Responsive design"],
          },
          {
            name: "CREATIVE",
            price: "₹7,999",
            description: "A portfolio with personality.",
            features: ["Multi-section portfolio", "Custom visual design", "Project case studies", "Scroll animations", "Responsive layouts", "Two revisions"],
            popular: true,
          },
          {
            name: "SIGNATURE",
            price: "₹14,999",
            description: "A complete personal brand experience.",
            features: ["Custom multi-page website", "Advanced motion design", "Interactive project gallery", "CMS integration", "Custom transitions", "Three revisions"],
          },
        ],
      },
      {
        id: "video",
        number: "03",
        category: "VIDEO PRODUCTION",
        title: "VIDEO EDITING",
        description: "Engaging edits for creators, brands and businesses. From short-form reels to polished promotional videos.",
        icon: "▶",
        packages: [
          {
            name: "SHORT FORM",
            price: "₹799",
            unit: "/ video",
            description: "For reels and short videos.",
            features: ["Up to 60 seconds", "Cuts and transitions", "Basic colour grading", "Music synchronisation", "One revision"],
          },
          {
            name: "CREATOR",
            price: "₹2,499",
            unit: "/ video",
            description: "A more polished edit.",
            features: ["Up to 5 minutes", "Advanced editing", "Colour correction", "Sound design", "Text and motion graphics", "Two revisions"],
            popular: true,
          },
          {
            name: "CINEMATIC",
            price: "₹4,999",
            unit: "/ video",
            description: "For stories that need more.",
            features: ["Up to 10 minutes", "Detailed colour grading", "Advanced transitions", "Sound design", "Motion graphics", "Two revisions"],
          },
        ],
      },
      {
        id: "photo",
        number: "04",
        category: "PHOTO POST-PRODUCTION",
        title: "PHOTO EDITING",
        description: "Bring images to life with thoughtful colour grading, retouching and visual consistency.",
        icon: "✳",
        packages: [
          {
            name: "BASIC",
            price: "₹299",
            unit: "/ image",
            description: "A clean, polished image.",
            features: ["Colour correction", "Exposure adjustments", "Contrast and tone", "Basic cropping", "One revision"],
          },
          {
            name: "CREATIVE",
            price: "₹999",
            unit: "/ 5 images",
            description: "A consistent visual style.",
            features: ["Creative colour grading", "Consistent image tones", "Light retouching", "Detail adjustments", "Two revisions"],
            popular: true,
          },
          {
            name: "PREMIUM",
            price: "₹1,999",
            unit: "/ 5 images",
            description: "More detailed image editing.",
            features: ["Advanced retouching", "Detailed colour grading", "Background cleanup", "Creative finishing", "Two revisions"],
          },
        ],
      },
    ],
    custom: {
      eyebrow: "BEYOND THE PACKAGES",
      title: "HAVE A BIGGER",
      emphasis: "IDEA IN MIND?",
      paragraphs: [
        "Need a complete web application, a unique interactive experience, a brand film or a combination of services?",
        "Tell me what you're imagining. I'll understand the scope and put together a custom quote.",
      ],
      button: "DISCUSS A CUSTOM PROJECT ↗",
    },
    addOns: [
      { name: "EXTRA WEBSITE PAGE", price: "₹999+" },
      { name: "ADDITIONAL REVISION", price: "₹499+" },
      { name: "EXPRESS DELIVERY", price: "CUSTOM QUOTE" },
      { name: "CUSTOM ANIMATIONS", price: "₹1,499+" },
    ],
    process: [
      { number: "01", title: "DISCUSS", description: "Tell me about your idea, goals and requirements." },
      { number: "02", title: "PLAN", description: "We agree on the scope, price and timeline." },
      { number: "03", title: "CREATE", description: "I work on your project and share progress." },
      { number: "04", title: "DELIVER", description: "Review the final work and receive your files." },
    ],
    notes: {
      eyebrow: "A QUICK NOTE",
      title: "CLEAR SCOPE.",
      emphasis: "NO SURPRISES.",
      paragraphs: [
        "Prices shown are starting estimates. Final pricing depends on the project requirements, content, complexity and delivery timeline. Hosting, domains, paid assets and third-party subscriptions are not included unless agreed beforehand.",
        "Every project begins with a discussion so we can agree on exactly what's included before work starts.",
      ],
    },
    ending: {
      eyebrow: "YOUR IDEA. MY NEXT PROJECT.",
      title: "READY TO",
      emphasis: "BUILD SOMETHING?",
      button: "LET'S WORK TOGETHER ↗",
    },
  },

  contact: {
    hero: {
      eyebrow: "04 / CONTACT",
      title: "LET'S MAKE",
      emphasis: "IT HAPPEN.",
      description:
        "Have a project, an opportunity or just an interesting idea? I'd love to hear about it. Let's turn a good conversation into something worth building.",
      availability: "AVAILABLE FOR INTERESTING PROJECTS",
      subtitle: "SCROLL TO CONNECT ↓",
    },
    channels: [
      {
        number: "01",
        name: "EMAIL",
        description: "For projects, opportunities and collaborations.",
        value: "adityasingh675454@gmail.com",
        url: "mailto:adityasingh675454@gmail.com",
        enabled: true,
      },
      {
        number: "02",
        name: "GITHUB",
        description: "Explore my code and development experiments.",
        value: "GITHUB PROFILE",
        url: "https://github.com/codexadityasingh",
        enabled: true,
      },
      {
        number: "03",
        name: "LINKEDIN",
        description: "Let's connect professionally.",
        value: "LINKEDIN PROFILE",
        url: "https://www.linkedin.com/in/aditya-singh-3728b324b/",
        enabled: true,
      },
      {
        number: "04",
        name: "INSTAGRAM",
        description: "Photography, visuals and everyday moments.",
        value: "INSTAGRAM PROFILE",
        url: "https://www.instagram.com/",
        enabled: true,
      },
    ],
    signoff: "NO FORM. NO FRICTION. JUST A CONVERSATION.",
    ending: {
      eyebrow: "EVERY GREAT THING STARTS SOMEWHERE.",
      title: "YOUR IDEA.",
      emphasis: "MY NEXT PROJECT?",
      button: "SEND ME AN EMAIL ↗",
    },
  },
};

export async function getSiteContent(pageSlug) {
  const { data, error } = await supabase
    .from("site_content")
    .select("content")
    .eq("page_slug", pageSlug)
    .maybeSingle();

  if (error) throw error;

  return data?.content || DEFAULT_SITE_CONTENT[pageSlug];
}

export async function saveSiteContent(pageSlug, content) {
  const { error } = await supabase
    .from("site_content")
    .upsert(
      {
        page_slug: pageSlug,
        content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "page_slug" }
    );

  if (error) throw error;

  return true;
}
