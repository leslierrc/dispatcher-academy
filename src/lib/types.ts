export type UserRole = "admin" | "student";
export type UserStatus = "active" | "suspended";
export type Tier = "basico" | "medio" | "pro";

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  thumbnail_url: string | null;
  price: number | null;
  published: boolean;
  featured: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  modules?: ModuleWithLessons[];
  plans?: Plan[];
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  lessons?: Lesson[];
}

export interface ModuleWithLessons extends Module {
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  content: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  thumbnail_url: string | null;
  order_index: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  files?: LessonFile[];
}

export interface LessonFile {
  id: string;
  lesson_id: string;
  name: string;
  url: string;
  type: string | null;
  size_bytes: number | null;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  tier: Tier;
  enrolled_at: string;
  course?: Course;
}

export interface Progress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  last_position_seconds: number | null;
}

export interface Plan {
  id: string;
  course_id: string | null;
  tier: Tier | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  stripe_price_id: string | null;
  features: string[] | null;
  badge: string | null;
  active: boolean;
  order_index: number;
  created_at: string;
}

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired";

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
  plan?: Plan | null;
}

export interface SettingsValue {
  brandName: string;
  supportEmail: string;
  whatsapp: string;
  instagram: string;
  facebook: string | null;
  youtube: string | null;
  tiktok: string | null;
  contactEmail: string;
  contactPhone: string;
  address: string;
}
