/**
 * SENTIPAE PLATFORM — DESIGN TOKENS
 * 
 * Este arquivo consolida a identidade visual do ecossistema SentiPae (Cores, Tipografia, Espaçamento).
 * Ele funciona como a fonte única de verdade (Single Source of Truth) para o design do app,
 * alimentando componentes dinâmicos, gráficos, animações e scripts visuais.
 */

export const designTokens = {
  // Identidade de Cores estruturada para Temas Claro e Escuro
  colors: {
    // Cores de Marca / Identidade Semântica
    brand: {
      indigo: {
        light: "#6366F1", // SentiCore core primary (indigo-500)
        DEFAULT: "#4F46E5", // Brand primary (indigo-600)
        dark: "#3730A3", // Indigo-800
      },
      green: {
        light: "#4ADE80", // Accent (emerald-400)
        DEFAULT: "#22C55E", // Brand secondary (emerald-500)
        dark: "#15803D", // Emerald-700
      },
      red: {
        light: "#F87171", // Crisis Accent (red-400)
        DEFAULT: "#EF4444", // SOS (red-500)
        dark: "#B91C1C", // Red-700
      },
    },
    
    // Tema Claro (Light Mode)
    light: {
      bg: "#F8FAFC",          // Slate 50
      dark: "#F1F5F9",        // Slate 100
      slate: "#FFFFFF",       // Pure white panel
      text: "#0F172A",        // Slate 900
      textSecondary: "#475569", // Slate 600
      textTertiary: "#94A3B8",  // Slate 400
      border: "#E2E8F0",      // Slate 200
    },

    // Tema Escuro (Dark Mode / Calming Twilight)
    dark: {
      bg: "#09090B",          // Zinc 950
      dark: "#09090B",        // Zinc 950
      slate: "#18181B",       // Zinc 900 panel
      text: "#F4F4F5",        // Zinc 100
      textSecondary: "#A1A1AA", // Zinc 400
      textTertiary: "#52525B",  // Zinc 600
      border: "rgba(255, 255, 255, 0.08)", // Transparent border
    }
  },

  // Tipografia e emparelhamento de fontes
  typography: {
    fonts: {
      sans: '"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
      serif: '"Poppins", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
    },
    sizes: {
      xs: "0.75rem",     // 12px
      sm: "0.875rem",    // 14px
      base: "1rem",      // 16px
      lg: "1.125rem",    // 18px
      xl: "1.25rem",     // 20px
      xxl: "1.5rem",     // 24px
      display: "2rem",   // 32px
      hero: "3rem",      // 48px
    },
    weights: {
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      black: "900",
    }
  },

  // Espaçamentos e cantos arredondados (Arredondamento generoso e amigável)
  spacing: {
    safe: {
      top: "env(safe-area-inset-top)",
      bottom: "env(safe-area-inset-bottom)",
    },
    container: {
      paddingMobile: "1rem",    // 16px
      paddingDesktop: "2rem",   // 32px
      maxWidth: "1280px",       // max-w-7xl
    },
    radius: {
      sm: "0.5rem",      // 8px
      md: "0.75rem",     // 12px
      lg: "1rem",        // 16px
      xl: "1.5rem",      // 24px (used in cards, CTA blocks)
      xxl: "2.5rem",     // 40px (used in main wrapper layouts)
      full: "9999px",
    },
    shadows: {
      sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    }
  }
};

/**
 * Função utilitária para obter valores de cores diretamente em javascript (ex: gráficos Recharts).
 * Garante que o gráfico respeite as paletas definidas centralmente nos design-tokens.
 */
export function getBrandColor(colorKey: "indigo" | "green" | "red", mode: "light" | "dark" = "light") {
  return designTokens.colors.brand[colorKey][mode === "light" ? "light" : "dark"];
}
