# Dispatcher Academy

Plataforma SaaS educativa para la formación de despachadores. Incluye landing pública, autenticación, dashboards de alumno y admin, cursos con módulos/lecciones y archivos, pagos con Stripe y correos transaccionales con Resend.

Stack: Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4, Supabase (Auth + Postgres + Storage), Stripe, Resend.

## Requisitos previos

- Node.js 20.9+ y npm
- Proyecto en [Supabase](https://supabase.com/dashboard)
- Cuenta en [Stripe](https://dashboard.stripe.com) (modo test para desarrollo)
- Cuenta en [Resend](https://resend.com) (opcional, para correos)

## Puesta en marcha

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Completa los valores en `.env`:

| Variable | Cómo obtenerla |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (anon public key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (service role — ¡nunca en el cliente ni en Vercel pública!) |
| `NEXT_PUBLIC_APP_URL` | URL base de la app (para correos y enlaces de recuperación) |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys (`sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API keys (`pk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks → endpoint secreto (`whsec_...`) |
| `RESEND_API_KEY` | Resend → API keys |
| `EMAIL_FROM` | Remitente verificado en Resend |
| `ADMIN_EMAILS` | Correos separados por coma que obtienen rol admin al registrarse |

> Sin `.env`, el build funciona y la landing renderiza, pero las páginas de auth/dashboard devuelven error hasta configurar Supabase.

### 3. Crear la base de datos

Abre Supabase → SQL Editor, pega el contenido de `supabase/schema.sql` y ejecútalo. Crea las tablas, el bucket de storage `course-files`, la función de registro automático y las políticas RLS con la protección anti-escalación.

Verifica en Supabase → Storage que el bucket `course-files` quedó `public` (los archivos se sirven con firma para lecciones; los thumbnails son públicos).

### 4. Configurar el webhook de Stripe

En Stripe → Developers → Webhooks, crea un endpoint:

- **URL:** `http://localhost:3000/api/stripe/webhook` (en producción, tu dominio)
- **Eventos a suscribir:** `checkout.session.completed`, `checkout.session.expired`

Copia el secreto del endpoint (`whsec_...`) en `STRIPE_WEBHOOK_SECRET`.

Para probar localmente, expón tu puerto 3000 (por ejemplo con [ngrok](https://ngrok.com)) para que Stripe alcance el webhook.

### 5. Ejecutar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Roles y primer acceso

- Regístrate en `/register` con el correo que va a ser admin y confirma el correo.
- Promuévelo a admin corriendo en Supabase → SQL Editor:
  ```sql
  update public.profiles set role = 'admin' where email = 'correo@x.com';
  ```
  (No hay ascenso automático al registrarte: Supabase hosted no permite fijar la
  configuración de Postgres que necesitaría `ADMIN_EMAILS` para eso — da
  `permission denied to set parameter`. El trigger `prevent_profile_escalation`
  sí permite este UPDATE hecho directo en la base.)
- De ahí en adelante, los demás admins se promueven desde el panel Admin → Usuarios.

## Estructura del proyecto

```
src/
├─ actions/                 # Server Actions (auth, cursos, admin, checkout)
├─ app/
│  ├─ (public)/             # Landing: home, pricing, about, contact
│  ├─ (auth)/               # login, register, forgot/reset password
│  ├─ (student)/            # /dashboard, cursos, lecciones, perfil
│  ├─ (admin)/admin/        # /admin, cursos, usuarios, suscripciones, settings
│  └─ api/stripe/webhook/   # Webhook de Stripe (idempotente)
├─ components/
│  ├─ admin/                # Gestión admin (cursos, usuarios, planes, settings)
│  ├─ dashboard/            # Shell y vistas del alumno (player de lecciones)
│  └─ sections/             # Secciones de la landing
├─ lib/
│  ├─ supabase/             # Clientes (browser, server, admin, middleware)
│  └─ data.ts               # Queries server-side
├─ proxy.ts                 # Middleware de Next.js: protege rutas por rol
└─ services/email.ts        # Correos transaccionales (Resend)
```

## Flujo de pago

1. El alumno elige un plan en `/pricing` → `checkout` crea una sesión de Stripe.
2. Stripe redirige a Stripe Checkout; al completarse envía el webhook.
3. El webhook valida la firma, registra el evento (idempotente vía `stripe_events`), crea la `subscription` y la `enrollment` del curso correspondiente, y envía correo de confirmación.
4. El alumno ya ve el curso en su dashboard.

## Notas de seguridad

- RLS activo en todas las tablas. El rol solo se puede cambiar desde el panel admin (service role); el trigger `prevent_profile_escalation` bloquea que un alumno edite su propio `role`/`status`.
- Las inscripciones se crean únicamente por admin o por el webhook (service role). Un alumno no puede auto-inscribirse.

## Deploy

El proyecto está listo para Vercel: conecta el repo y añade las variables del `.env` en Project → Settings → Environment Variables. En producción, `NEXT_PUBLIC_APP_URL` debe ser tu dominio y el webhook de Stripe debe apuntar a `https://tu-dominio.com/api/stripe/webhook`.

## Comandos útiles

```bash
npm run dev        # desarrollo
npm run build      # build de producción
npm run start      # sirve el build
npm run lint       # ESLint
npx tsc --noEmit   # typecheck
```
