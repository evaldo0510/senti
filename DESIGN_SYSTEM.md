# DESIGN_SYSTEM.md
## Senti Design System (SDS) — Diretrizes de Interface e Experiência v1.0

O **Senti Design System (SDS)** é o arcabouço visual e conceitual que garante harmonia, integridade e coerência estética a todos os 6 produtos do Ecossistema SentiPae. A sofisticação da nossa interface vem do rigor da tipografia, do uso generoso de espaço negativo, do contraste intencional e do refinamento das micro-animações.

---

### 1. PALETA DE CORES E IDENTIDADE VISUAL
Evitamos gradientes genéricos. Utilizamos cores sólidas, texturas de vidro (backdrop-blur) e realces precisos em neon para transmitir segurança clínica e serenidade.

*   **Dark Canvas (Padrão para Sessões Imersivas, IARA e Dashboards de Alta Complexidade)**:
    *   Fundo Primário: `slate-950`
    *   Fundo Secundário: `slate-900`
    *   Bordas e Divisores: `white/5` ou `white/10`
    *   Textos: `slate-100` (primário), `slate-400` (secundário)
*   **Light Canvas (Padrão para Landing Pages Corporativas e Documentações)**:
    *   Fundo Primário: `slate-50`
    *   Fundo Secundário: `white`
    *   Bordas e Divisores: `slate-200`
    *   Textos: `slate-900` (primário), `slate-500` (secundário)
*   **Acentos de Cura e Ação**:
    *   `emerald-500` / `emerald-400`: Representa saúde, vitalidade, progresso estável e ICC excelente.
    *   `violet-500` / `violet-400`: Representa a ponte entre a inteligência humana e artificial, teleatendimento e jornada.
    *   `cyan-500` / `cyan-400`: Representa a presença acolhedora da IARA, prompts e sub-agentes SentiCore.
    *   `amber-500`: Atenção temporária, hábitos em andamento ou risco clínico moderado.
    *   `red-500`: Alerta de segurança, risco agudo (SOS ativo) ou falhas críticas.

---

### 2. ARQUITETURA TIPOGRÁFICA
A tipografia organiza a leitura e cria ritmo visual na plataforma.

*   **Títulos e Chamadas (Display Headings)**:
    *   Fonte: `font-sans` com peso ExtraBold (`font-black` ou `font-extrabold`).
    *   Estilo: Rígido, espaçamento de letras ligeiramente reduzido (`tracking-tight` ou `tracking-tighter`).
*   **Corpo de Texto e Leitura**:
    *   Fonte: `Inter` (`font-sans`) com pesos regular (`font-normal`) ou médio (`font-medium`).
    *   Estilo: Linhas arejadas para leitura confortável em dispositivos móveis (`leading-relaxed`).
*   **Metadados, Logs e Indicadores**:
    *   Fonte: `font-mono` (`JetBrains Mono` ou `Fira Code`).
    *   Estilo: Tamanho pequeno (`text-xs` ou `text-[10px]`), em maiúsculas (`uppercase`) com espaçamento expandido (`tracking-widest`).

---

### 3. COMPONETIZAÇÃO E CONFORTO TÁTIL (GRID & SPACING)
*   **Cards Imersivos**:
    *   Sempre use cantos arredondados generosos (`rounded-3xl` ou `rounded-[2.5rem]`).
    *   Bordas finas de alto contraste em relação ao fundo para dar sensação de profundidade e flutuação.
*   **Targets de Toque em Dispositivos Móveis**:
    *   Áreas clicáveis (botões, seletores, ícones interativos) devem possuir área mínima de toque de **44px x 44px** para garantir acessibilidade a todos os perfis de usuários.
*   **Espaçamento Rítmico**:
    *   Evite espaçamentos uniformes idênticos. Alterne padding interno generoso (`p-6` ou `p-8`) com margens estruturadas para criar cadência de conteúdo.

---

### 4. MICRO-ANIMAÇÕES (MOTION & TRANSITIONS)
Usamos a biblioteca `motion` (`motion/react`) para reforçar a hierarquia visual e suavizar a navegação.

*   **Transições de Tela**:
    *   Efeito Fade-In suave acompanhado de leve subida vertical:
        ```tsx
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        ```
*   **Feedbacks de Hover e Foco**:
    *   Micro-escalas em botões interativos (`hover:scale-[1.02] active:scale-[0.98]`).
    *   Transições de cor de fundo sempre interpoladas suavemente (`transition-all duration-200`).

---

### 5. SEGURANÇA VISUAL (ANTI-AI-SLOP)
*   **Rótulos Humanos e Sóbrios**: Proibido usar nomenclaturas dramáticas ou futuristas. Utilize termos descritivos e humildes (use "Prontuário Inteligente" ao invés de "Super-Cérebro Clínico", use "Meditações" ao invés de "Hiper-Ondas Neurais").
*   **Ausência de Clutter Técnico**: Não decore margens com indicadores de portas de rede, logs simulados do console do sistema ou coordenadas desnecessárias. A clareza é o pilar máximo de confiança do SentiPae.
