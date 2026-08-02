export type Locale = "en" | "es";

const MARQUEE = [
  "Load boards",
  "Rate confirmation",
  "Brokers",
  "BOL & POD",
  "Factoring",
  "TMS",
  "FMCSA",
  "Negociación",
  "Owner operators",
  "Deadhead",
  "Detention",
  "Lane pricing",
];

const TESTIMONIAL_IMAGES = {
  test1: {
    src: "https://images.unsplash.com/photo-1624224416603-c908080780b1?auto=format&fit=crop&w=220&q=80",
    credit: "Photo by Abdrahim Oulfakir on Unsplash",
    creditHref: "https://unsplash.com/@abdskrzoul",
  },
  test2: {
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=220&q=80",
    credit: "Photo by Štefan Štefančík on Unsplash",
    creditHref: "https://unsplash.com/@cikstefan",
  },
  test3: {
    src: "https://images.unsplash.com/photo-1549043671-1e4550948355?auto=format&fit=crop&w=220&q=80",
    credit: "Photo by Helena Lopes on Unsplash",
    creditHref: "https://unsplash.com/@helenalopesph",
  },
} as const;

export const COMPANY_LEGAL_NAME = "7 Digital LLC";
export const CARLA_FULL_NAME = "Carla González";
export const CARLA_INSTAGRAM_HANDLE = "@soy_carlitta";
export const CARLA_INSTAGRAM_URL = "https://www.instagram.com/soy_carlitta";

export const heroImage = {
  src: "/images/carla-desk.png",
  credit: "",
  creditHref: "",
};

export const carlaImage = {
  src: "/images/carla.png",
  credit: "",
  creditHref: "",
};

export const carlaDispatchImage = {
  src: "/images/carla-dispatch.png",
  credit: "",
  creditHref: "",
};

export const carlaChipImage = {
  src: "/images/carla-headset.png",
  credit: "",
  creditHref: "",
};

export const translations = {
  en: {
    nav: {
      curriculum: "Curriculum",
      pricing: "Pricing",
      stories: "Stories",
      faq: "FAQ",
      cta: "Enroll",
      login: "Log in",
    },
    hero: {
      kicker: "Freight dispatch certification",
      title: "Become a Freight Dispatcher and work remote",
      subtitle:
        "7 Digital LLC trains you step by step to land your first contract in the U.S. trucking industry — with 1:1 mentorship from Carla.",
      cta1: "Enroll now",
      cta2: "See curriculum",
      cardRole: "Founder, 7 Digital LLC",
      chipStudents: "Students",
      scrollCue: "Scroll",
    },
    role: {
      kicker: "The profession",
      title: "What is freight dispatch?",
      intro:
        "You're the bridge between truck owners and the companies that need to move their freight.",
      bullets: [
        "You find loads",
        "You negotiate the best rates",
        "You follow up from start to finish",
        "You help everything arrive on time",
      ],
      calloutTitle: "No truck, no CDL.",
      calloutBody: "Just your computer and the drive to grow.",
      opportunityKicker: "The opportunity",
      opportunityTitle: "Why learn freight dispatch?",
      opportunityItems: [
        "100% remote work, from anywhere",
        "You choose your own schedule",
        "High demand across the industry",
        "No income ceiling",
        "Financial and time freedom",
      ],
      closingLine: "You can build the life you've always dreamed of.",
    },
    marquee: MARQUEE,
    stats: [
      { count: 500, suffix: "+", label: "students trained" },
      { count: 98, suffix: "%", label: "satisfaction" },
      { count: 12, suffix: "", label: "modules" },
      { count: 4, suffix: " wk", label: "to your first contract" },
    ],
    about: {
      kicker: "About Carla",
      title: "Learn the trade from someone who lives it daily",
      body1:
        "With years dispatching freight in the U.S., Carla founded this program to teach the real trade: load negotiation, brokers, paperwork and cash flow — not textbook theory.",
      body2:
        "Every module comes from real dispatch cases, and every student gets close follow-up until they land their first contract.",
      creds: [
        "Years dispatching freight in the U.S.",
        "Hundreds of certified students",
        "Personalized 1:1 mentorship with Carla",
      ],
      instagramCta: "Follow Carla",
    },
    why: {
      kicker: "Why 7 Digital LLC",
      title: "Everything you need to start with confidence",
      items: [
        {
          title: "Proven method",
          body: "A step-by-step system built from daily dispatch practice, not a textbook.",
        },
        {
          title: "Active community",
          body: "Support from peers and alumni already working in the industry.",
        },
        {
          title: "Certification",
          body: "Receive your 7 Digital LLC certificate when you complete the curriculum.",
        },
        {
          title: "1:1 mentorship",
          body: "Personal sessions with Carla to review your progress and first contract.",
        },
      ],
    },
    curriculum: {
      kicker: "Curriculum",
      title: "12 modules, from your first load to your own client roster",
      railHint: "Keep scrolling",
      modules: [
        { title: "Intro to the industry", body: "How freight moves in the U.S. and who pays what" },
        { title: "The dispatcher role", body: "Your real day, hour by hour" },
        { title: "Load boards & brokers", body: "Search, filter and evaluate available loads" },
        { title: "Rate negotiation", body: "Close better rates without burning the broker" },
        { title: "Essential paperwork", body: "Rate confirmation, BOL and POD explained" },
        { title: "ELD & FMCSA", body: "Hours of service and the legal side you must know" },
        { title: "Factoring & cash flow", body: "How and when a dispatcher gets paid" },
        { title: "Dispatch software", body: "The TMS tools you’ll use every day" },
        { title: "Driver communication", body: "Coordinating routes and solving issues" },
        { title: "Your client roster", body: "From one contract to a stable roster" },
        { title: "Personal marketing", body: "How to sell yourself as an independent dispatcher" },
        { title: "Simulation & certification", body: "Practice a real case and get your certificate" },
      ],
    },
    pricing: {
      kicker: "Pricing",
      title: "Choose your plan",
      subtitle: "One-time payment. No hidden monthly fees.",
      oneTime: "one-time",
      guarantee: "14-day guarantee — if it’s not for you, we refund your money.",
    },
    testimonials: {
      kicker: "Stories",
      title: "Students already dispatching",
      items: [
        {
          ...TESTIMONIAL_IMAGES.test1,
          name: "Marcos R.",
          role: "Independent dispatcher",
          quote:
            "In two months I already had my first contract signed. Carla’s mentorship made the difference.",
        },
        {
          ...TESTIMONIAL_IMAGES.test2,
          name: "Daniela V.",
          role: "Alumna, Pro plan",
          quote:
            "The course is straight to the point, no filler. I learned exactly what I use every day.",
        },
        {
          ...TESTIMONIAL_IMAGES.test3,
          name: "Jonathan T.",
          role: "Dispatcher, Premium",
          quote:
            "Reviewing my first contract with Carla saved me from mistakes that would have cost me a lot.",
        },
      ],
    },
    faq: {
      title: "Frequently asked questions",
      help: "Another question? Write us and we reply today.",
      items: [
        {
          q: "Do I need prior logistics experience?",
          a: "No. The course starts from zero and is designed for people who have never worked in the trucking industry.",
        },
        {
          q: "How long do I have access?",
          a: "Lifetime access to recorded classes on Pro and Premium; 12 months on Basic.",
        },
        {
          q: "Can I work 100% remote after finishing?",
          a: "Yes. Most of our graduates work remotely for U.S. carriers and brokers.",
        },
        {
          q: "What if I don’t like the course?",
          a: "You have a 14-day guarantee from enrollment to request a full refund.",
        },
        {
          q: "Is the 1:1 mentorship directly with Carla?",
          a: "Yes, Premium sessions are personal and live with Carla.",
        },
      ],
    },
    close: {
      kicker: "This isn't just a course — it's the start of your new life.",
      title: "Ready to dispatch your first load?",
      subtitle: "Reserve your spot in the next 7 Digital LLC cohort.",
      placeholder: "Your email",
      cta: "I want to enroll",
    },
    footer: {
      rights: "© 2026 7 Digital LLC. All rights reserved.",
    },
  },
  es: {
    nav: {
      curriculum: "Currícula",
      pricing: "Precios",
      stories: "Historias",
      faq: "FAQ",
      cta: "Inscríbete",
      login: "Iniciar sesión",
    },
    hero: {
      kicker: "Certificación en despacho de fletes",
      title: "Conviértete en Dispatcher de Fletes y trabaja remoto",
      subtitle:
        "7 Digital LLC te forma paso a paso para conseguir tu primer contrato en la industria del transporte de EE. UU. — con mentoría 1:1 de Carla.",
      cta1: "Inscríbete ahora",
      cta2: "Ver currícula",
      cardRole: "Fundadora, 7 Digital LLC",
      chipStudents: "Alumnos",
      scrollCue: "Desliza",
    },
    role: {
      kicker: "La profesión",
      title: "¿Qué es el Freight Dispatch?",
      intro:
        "Eres el puente entre los dueños de camiones y las compañías que necesitan mover su carga.",
      bullets: [
        "Encuentras cargas",
        "Negocias las mejores tarifas",
        "Das seguimiento de principio a fin",
        "Ayudas a que todo llegue a tiempo",
      ],
      calloutTitle: "Sin camión, sin CDL.",
      calloutBody: "Solo tu computadora y ganas de crecer.",
      opportunityKicker: "La oportunidad",
      opportunityTitle: "¿Por qué aprender Freight Dispatch?",
      opportunityItems: [
        "Trabajo 100% remoto y desde cualquier lugar",
        "Tú eliges tu horario",
        "Gran demanda en la industria",
        "Sin límite de ingresos",
        "Libertad financiera y de tiempo",
      ],
      closingLine: "Tú puedes construir la vida que siempre has soñado.",
    },
    marquee: MARQUEE,
    stats: [
      { count: 500, suffix: "+", label: "alumnos formados" },
      { count: 98, suffix: "%", label: "satisfacción" },
      { count: 12, suffix: "", label: "módulos" },
      { count: 4, suffix: " sem", label: "para tu primer contrato" },
    ],
    about: {
      kicker: "Sobre Carla",
      title: "Aprende el oficio de quien lo vive todos los días",
      body1:
        "Con años despachando fletes en EE. UU., Carla fundó esta academia para enseñar el oficio real: negociación de cargas, brokers, documentación y flujo de caja — no teoría de manual.",
      body2:
        "Cada módulo viene de casos reales de despacho, y cada estudiante recibe seguimiento cercano hasta conseguir su primer contrato.",
      creds: [
        "Años despachando fletes en EE. UU.",
        "Cientos de estudiantes certificados",
        "Mentoría 1:1 personalizada con Carla",
      ],
      instagramCta: "Sigue a Carla",
    },
    why: {
      kicker: "Por qué 7 Digital LLC",
      title: "Todo lo que necesitas para empezar con confianza",
      items: [
        {
          title: "Método probado",
          body: "Un sistema paso a paso creado desde la práctica diaria de despacho, no desde un libro.",
        },
        {
          title: "Comunidad activa",
          body: "Acompañamiento entre alumnos y egresados ya trabajando en la industria.",
        },
        {
          title: "Certificación",
          body: "Recibe tu certificado de 7 Digital LLC al completar la currícula.",
        },
        {
          title: "Mentoría 1:1",
          body: "Sesiones personales con Carla para revisar tu progreso y tu primer contrato.",
        },
      ],
    },
    curriculum: {
      kicker: "Currícula",
      title: "12 módulos, del primer load a tu propia cartera de clientes",
      railHint: "Sigue bajando",
      modules: [
        { title: "Introducción a la industria", body: "Cómo se mueve la carga en EE. UU. y quién paga qué" },
        { title: "El rol del dispatcher", body: "Tu día a día real, hora por hora" },
        { title: "Load boards y brokers", body: "Buscar, filtrar y evaluar cargas disponibles" },
        { title: "Negociación de tarifas", body: "Cierra mejores rates sin quemar al broker" },
        { title: "Documentación esencial", body: "Rate confirmation, BOL y POD explicados" },
        { title: "ELD y FMCSA", body: "Horas de servicio y lo legal que sí debes saber" },
        { title: "Factoring y flujo de caja", body: "Cómo y cuándo cobra un dispatcher" },
        { title: "Software de despacho", body: "Las herramientas TMS que usarás cada día" },
        { title: "Comunicación con el driver", body: "Coordinar rutas y resolver imprevistos" },
        { title: "Tu cartera de clientes", body: "De un contrato a una cartera estable" },
        { title: "Marketing personal", body: "Cómo venderte como dispatcher independiente" },
        { title: "Simulacro y certificación", body: "Practica un caso real y recibe tu certificado" },
      ],
    },
    pricing: {
      kicker: "Precios",
      title: "Elige tu plan",
      subtitle: "Pago único. Sin mensualidades escondidas.",
      oneTime: "pago único",
      guarantee: "Garantía de 14 días — si no es para ti, te devolvemos tu dinero.",
    },
    testimonials: {
      kicker: "Historias",
      title: "Alumnos que ya están despachando",
      items: [
        {
          ...TESTIMONIAL_IMAGES.test1,
          name: "Marcos R.",
          role: "Dispatcher independiente",
          quote:
            "En dos meses ya tenía mi primer contrato firmado. La mentoría de Carla marcó la diferencia.",
        },
        {
          ...TESTIMONIAL_IMAGES.test2,
          name: "Daniela V.",
          role: "Ex-alumna, Plan Pro",
          quote:
            "El curso es directo al grano, sin relleno. Aprendí exactamente lo que uso todos los días.",
        },
        {
          ...TESTIMONIAL_IMAGES.test3,
          name: "Jonathan T.",
          role: "Dispatcher, Premium",
          quote:
            "La revisión de mi primer contrato con Carla me ahorró errores que me hubieran costado caro.",
        },
      ],
    },
    faq: {
      title: "Preguntas frecuentes",
      help: "¿Otra duda? Escríbenos y te respondemos hoy.",
      items: [
        {
          q: "¿Necesito experiencia previa en logística?",
          a: "No. El curso empieza desde cero y está diseñado para quienes nunca han trabajado en la industria del transporte.",
        },
        {
          q: "¿Cuánto tiempo tengo acceso al curso?",
          a: "Acceso de por vida a las clases grabadas en los planes Pro y Premium; 12 meses en el plan Básico.",
        },
        {
          q: "¿Puedo trabajar 100% remoto al terminar?",
          a: "Sí. La mayoría de nuestros egresados trabaja de forma remota para transportistas y brokers en EE. UU.",
        },
        {
          q: "¿Qué pasa si no me gusta el curso?",
          a: "Tienes 14 días de garantía desde tu inscripción para pedir el reembolso completo.",
        },
        {
          q: "¿La mentoría 1:1 es con Carla directamente?",
          a: "Sí, las sesiones del plan Premium son personales y en vivo con Carla.",
        },
      ],
    },
    close: {
      kicker: "Esto no es solo un curso — es el comienzo de tu nueva vida.",
      title: "¿Lista para despachar tu primer load?",
      subtitle: "Reserva tu lugar en la próxima cohorte de 7 Digital LLC.",
      placeholder: "Tu correo electrónico",
      cta: "Quiero inscribirme",
    },
    footer: {
      rights: "© 2026 7 Digital LLC. Todos los derechos reservados.",
    },
  },
} as const;
