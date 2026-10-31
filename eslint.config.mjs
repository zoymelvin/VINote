import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/sw.js",
  ]),
  {
    rules: {
      "no-restricted-imports": ["error", {
        "paths": [
          { "name": "lucide-react", "message": "Gunakan @/components/icons/index.ts sebagai wrapper ikon." },
          { "name": "@phosphor-icons/react", "message": "Gunakan @/components/icons/index.ts sebagai wrapper ikon." },
        ]
      }]
    }
  }
]);

export default eslintConfig;
