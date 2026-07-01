import { cn } from "@/lib/utils";

/**
 * קישור חיוג (tel:) עם בידוד bidi — מספר הטלפון לא מתערבב עם הטקסט העברי סביבו,
 * וניתן ללחוץ עליו לחיוג/העתקה. תווים שאינם ספרה/‎+‎ מוסרים מה-URI בלבד (התצוגה נשמרת).
 */
export function PhoneLink({
  phone,
  className,
}: {
  phone: string;
  className?: string;
}) {
  return (
    <a
      href={`tel:${phone.replace(/[^\d+]/g, "")}`}
      className={cn("text-navy-600 hover:underline", className)}
    >
      <bdi>{phone}</bdi>
    </a>
  );
}

/** קישור מייל (mailto:) עם בידוד bidi. */
export function EmailLink({
  email,
  className,
}: {
  email: string;
  className?: string;
}) {
  return (
    <a
      href={`mailto:${email}`}
      className={cn("text-navy-600 hover:underline break-all", className)}
    >
      <bdi>{email}</bdi>
    </a>
  );
}
