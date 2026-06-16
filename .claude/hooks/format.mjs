// .claude/hooks/format.mjs
// מריץ Prettier על הקובץ שנערך אחרי כל עריכה. עובד גם ב-Windows (דורש רק node + prettier).
import { execSync } from "node:child_process";

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  try {
    const payload = JSON.parse(input || "{}");
    const file = payload?.tool_input?.file_path;
    if (file && /\.(ts|tsx|js|jsx|mjs|cjs|json|css|scss|md|html)$/.test(file)) {
      execSync(`npx prettier --write "${file}"`, { stdio: "ignore" });
    }
  } catch {
    // לא חוסמים את Claude אם הפורמט נכשל — פשוט ממשיכים
  }
  process.exit(0);
});
