"use client";

/**
 * מעטפת client-boundary סביב @phosphor-icons/react.
 *
 * הספרייה יוצרת React Context ברמת המודול ואינה מסומנת "use client", ולכן ייבוא
 * ישיר שלה לתוך Server Components נכשל ("createContext is not a function").
 * כל האתר מייבא אייקונים מכאן — כך גם Server Components מקבלים הפניות client תקינות,
 * וה-duotone הגלובלי (IconProvider) חל על כולם.
 *
 * הוספת אייקון חדש? להוסיף אותו לרשימה כאן ואז לייבא מ-@/lib/icons.
 */
export {
  // ניווט וכרום
  House,
  Briefcase,
  Buildings,
  Info,
  ChatCircle,
  List,
  X,
  SquaresFour,
  ArrowLeft,
  CaretRight,
  CaretDown,
  // יצירת קשר / פוטר
  Phone,
  EnvelopeSimple,
  Clock,
  ShieldCheck,
  // יתרונות / שיווק
  Handshake,
  Gift,
  Target,
  HandHeart,
  Funnel,
  HandCoins,
  Lock,
  UsersThree,
  // משרות
  MapPin,
  ChartLineUp,
  Check,
  // מצבי מערכת (טעינה/ריק/שגיאה/הצלחה)
  CircleNotch,
  Tray,
  WarningCircle,
  CheckCircle,
  // ניווט אדמין
  ChatCircleText,
  Users,
  Receipt,
  BellRinging,
  Quotes,
  Megaphone,
  Storefront,
  SignOut,
  // מדדי דשבורד
  ListChecks,
  UserPlus,
  Coins,
  Plus,
  // אזור אישי
  UserCircle,
  IdentificationCard,
  FloppyDisk,
  Heart,
  Gear,
  FileText,
} from "@phosphor-icons/react";

export type { Icon } from "@phosphor-icons/react";
