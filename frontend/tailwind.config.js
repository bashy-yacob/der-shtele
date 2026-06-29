/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ---- שפת עיצוב "חם אך מקצועי" ----
        // navy — מותג/ראשי (אמון): כפתורים ראשיים, wordmark, פוטר
        // ⬅ עודכן לסגול (שומר על שם המפתח "navy" כדי לא לגעת ב-62 קבצים)
        navy: {
          50: "#F2F0F7",
          100: "#DAD4E8",
          500: "#433663",
          600: "#2E2549", // ראשי (סגול #2E2549)
          700: "#281E40",
          800: "#1E1631",
          900: "#150F24",
        },
        // olive — אקסנט (פרנסה/צמיחה): CTA משני, הדגשות, תגיות
        // ⬅ עודכן לאפרסק (שומר על שם המפתח "olive")
        olive: {
          50: "#FDF3EC",
          100: "#FCD9C5",
          300: "#FB9960",
          500: "#FF803F", // אקסנט (אפרסק #FF803F)
          600: "#E55806",
          700: "#B84705",
        },
        // sand — נייטרלים חמים: רקעים, גבולות, dividers
        sand: {
          50: "#FCFAF4", // רקע בהיר
          100: "#F7F2E7", // רקע דף
          200: "#EFE7D5", // גבולות
          300: "#E0D4BB",
          400: "#C9B894",
        },
        // ink — טקסט (פחם חמים, לא שחור טהור)
        ink: {
          400: "#ADA593",
          500: "#8C8475", // muted
          700: "#4A4439", // גוף
          900: "#211E18", // כותרות
        },
      },
      fontFamily: {
        // Frank Ruhl Libre — סריף עברי לכותרות גדולות
        display: ["var(--font-display)", "Frank Ruhl Libre", "serif"],
        // Heebo — גוף וממשק
        sans: ["var(--font-sans)", "Heebo", "Arial", "sans-serif"],
      },
      boxShadow: {
        // צל רך חמים (חום-אפרפר, נמוך)
        soft: "0 1px 2px rgba(33, 30, 24, 0.04), 0 6px 20px -8px rgba(33, 30, 24, 0.12)",
        // צל מורם מעט — לכרטיסים מודגשים / hover
        lift: "0 2px 4px rgba(33, 30, 24, 0.05), 0 18px 40px -16px rgba(33, 30, 24, 0.18)",
      },
      // ---- אנימציות עדינות בלבד (מכובדות, לא פולשניות) ----
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.9s ease-out both",
        float: "float 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
