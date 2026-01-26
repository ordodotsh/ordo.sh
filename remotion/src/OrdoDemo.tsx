import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  Audio,
  staticFile,
  Img,
} from "remotion";

// Modern brand colors - dark premium theme
const brand = {
  bg: "#09090b",
  bgLight: "#18181b",
  accent: "#f97316", // Orange 500
  accentGlow: "rgba(249, 115, 22, 0.4)",
  white: "#fafafa",
  gray: "#a1a1aa",
  grayDark: "#52525b",
  gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
  gradientSubtle: "linear-gradient(180deg, rgba(249,115,22,0.08) 0%, transparent 50%)",
};

const font = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// Reusable animated background with gradient orbs
const AnimatedBackground: React.FC<{ variant?: "dark" | "accent" }> = ({ variant = "dark" }) => {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame * 0.02) * 0.1 + 1;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* Base gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: variant === "accent" 
            ? "linear-gradient(135deg, #ea580c 0%, #c2410c 50%, #9a3412 100%)"
            : brand.bg,
        }}
      />
      {/* Animated orb 1 */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: variant === "accent"
            ? "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)"
            : `radial-gradient(circle, ${brand.accentGlow} 0%, transparent 70%)`,
          top: -200,
          right: -200,
          transform: `scale(${pulse})`,
          filter: "blur(60px)",
        }}
      />
      {/* Animated orb 2 */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: variant === "accent"
            ? "radial-gradient(circle, rgba(0,0,0,0.2) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)",
          bottom: -100,
          left: -100,
          transform: `scale(${1.1 - (pulse - 1)})`,
          filter: "blur(80px)",
        }}
      />
      {/* Noise texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

// Intro Scene - Logo reveal
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const logoOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const taglineOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateRight: "clamp",
  });

  const taglineY = interpolate(frame, [40, 60], [20, 0], {
    extrapolateRight: "clamp",
  });

  const glowPulse = Math.sin(frame * 0.08) * 0.3 + 0.7;

  return (
    <AbsoluteFill>
      <AnimatedBackground />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Logo glow */}
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 100,
            background: brand.gradient,
            filter: "blur(80px)",
            opacity: glowPulse * logoOpacity,
          }}
        />
        
        {/* Logo */}
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            fontSize: 160,
            fontWeight: 800,
            color: brand.white,
            fontFamily: font,
            letterSpacing: "-0.03em",
          }}
        >
          ordo<span style={{ color: brand.accent }}>.sh</span>
        </div>
        
        {/* Tagline */}
        <div
          style={{
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
            marginTop: 30,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 300,
              color: brand.gray,
              fontFamily: font,
              fontStyle: "italic",
              letterSpacing: "0.05em",
            }}
          >
            ab chao, ordo
          </div>
          <div
            style={{
              fontSize: 20,
              color: brand.grayDark,
              fontFamily: font,
              marginTop: 8,
            }}
          >
            from chaos, order
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Mac Mini Scene - The hardware pain point
const MacMiniScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const imageOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: "clamp",
  });

  const textOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateRight: "clamp",
  });

  const textY = interpolate(frame, [35, 55], [30, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Image - contained to show full image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity: imageOpacity,
          padding: 40,
        }}
      >
        <Img
          src={staticFile("Mini Macs.jpeg")}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            filter: "brightness(0.75)",
            borderRadius: 16,
          }}
        />
      </div>

      {/* Gradient overlay - bottom only for text readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 25%, transparent 50%)",
        }}
      />

      {/* Text content */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          padding: "0 80px",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: brand.white,
            fontFamily: font,
            marginBottom: 16,
            lineHeight: 1.1,
          }}
        >
          Running AI Locally?
        </div>
        <div
          style={{
            fontSize: 38,
            fontWeight: 600,
            color: brand.accent,
            fontFamily: font,
            marginBottom: 12,
          }}
        >
          You'll need a lot of Mac Minis.
        </div>
        <div
          style={{
            fontSize: 22,
            color: brand.gray,
            fontFamily: font,
          }}
        >
          Apple Silicon required for Claude Code & local AI
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Problem Scene - Stats
const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stats = [
    { value: "$599+", label: "Per Mac Mini" },
    { value: "24/7", label: "Power Required" },
    { value: "100+", label: "Hours Setup" },
    { value: "∞", label: "Maintenance" },
  ];

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const titleY = interpolate(frame, [0, 20], [30, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <AnimatedBackground />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 80,
        }}
      >
        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textAlign: "center",
            marginBottom: 80,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: brand.accent,
              fontFamily: font,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              marginBottom: 16,
            }}
          >
            The Reality
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: brand.white,
              fontFamily: font,
              lineHeight: 1.1,
            }}
          >
            Self-Hosting AI is Expensive
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 80 }}>
          {stats.map((stat, i) => {
            const delay = 25 + i * 10;
            const statOpacity = interpolate(frame, [delay, delay + 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const statY = interpolate(frame, [delay, delay + 15], [30, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const statScale = spring({
              frame: frame - delay,
              fps,
              config: { damping: 10, stiffness: 100 },
            });

            return (
              <div
                key={i}
                style={{
                  opacity: statOpacity,
                  transform: `translateY(${statY}px)`,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 96,
                    fontWeight: 800,
                    color: brand.accent,
                    fontFamily: font,
                    lineHeight: 1,
                    transform: `scale(${Math.max(0.9, statScale)})`,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 500,
                    color: brand.gray,
                    fontFamily: font,
                    marginTop: 16,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Solution Scene
const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const contentOpacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateRight: "clamp",
  });

  const contentY = interpolate(frame, [25, 45], [40, 0], {
    extrapolateRight: "clamp",
  });

  const cardScale = spring({
    frame: frame - 50,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  return (
    <AbsoluteFill>
      <AnimatedBackground variant="accent" />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 80,
        }}
      >
        {/* Badge */}
        <div
          style={{
            opacity: titleOpacity,
            fontSize: 18,
            fontWeight: 600,
            color: "rgba(255,255,255,0.8)",
            fontFamily: font,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            marginBottom: 20,
            padding: "10px 24px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: 100,
            backdropFilter: "blur(10px)",
          }}
        >
          The Solution
        </div>

        {/* Main text */}
        <div
          style={{
            opacity: contentOpacity,
            transform: `translateY(${contentY}px)`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: brand.white,
              fontFamily: font,
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            Your Personal AI
          </div>
          <div
            style={{
              fontSize: 42,
              fontWeight: 400,
              color: "rgba(255,255,255,0.85)",
              fontFamily: font,
              marginBottom: 60,
            }}
          >
            Running in the Cloud, 24/7
          </div>

          {/* Cards */}
          <div
            style={{
              display: "flex",
              gap: 30,
              justifyContent: "center",
              transform: `scale(${Math.max(0, cardScale)})`,
            }}
          >
            {[
              { label: "Powered by", value: "Claude Opus" },
              { label: "Pay with", value: "Solana" },
            ].map((card, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(20px)",
                  borderRadius: 24,
                  padding: "36px 56px",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.7)",
                    fontFamily: font,
                    marginBottom: 8,
                  }}
                >
                  {card.label}
                </div>
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 700,
                    color: brand.white,
                    fontFamily: font,
                  }}
                >
                  {card.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Examples Scene - Chat UI
const ExamplesScene: React.FC = () => {
  const frame = useCurrentFrame();

  const examples = [
    { user: "Check me in for my flight tomorrow", bot: "Done! Window seat 14A confirmed." },
    { user: "Summarize my unread emails", bot: "3 important emails. Unsubscribed from 12 newsletters." },
    { user: "Create a GitHub issue for the auth bug", bot: "Created issue #247. Assigned to you." },
  ];

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <AnimatedBackground />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "60px 100px",
        }}
      >
        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            fontSize: 64,
            fontWeight: 800,
            color: brand.white,
            fontFamily: font,
            marginBottom: 60,
          }}
        >
          Just Message It
        </div>

        {/* Chat messages */}
        <div style={{ width: "100%", maxWidth: 1000 }}>
          {examples.map((ex, i) => {
            const delay = 20 + i * 35;
            const userOpacity = interpolate(frame, [delay, delay + 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const userX = interpolate(frame, [delay, delay + 15], [30, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const botOpacity = interpolate(frame, [delay + 15, delay + 30], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const botX = interpolate(frame, [delay + 15, delay + 30], [-30, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div key={i} style={{ marginBottom: 24 }}>
                {/* User message */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: 12,
                    opacity: userOpacity,
                    transform: `translateX(${userX}px)`,
                  }}
                >
                  <div
                    style={{
                      background: brand.gradient,
                      borderRadius: "20px 20px 4px 20px",
                      padding: "16px 24px",
                      maxWidth: "70%",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 500,
                        color: brand.white,
                        fontFamily: font,
                      }}
                    >
                      {ex.user}
                    </div>
                  </div>
                </div>
                {/* Bot message */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    opacity: botOpacity,
                    transform: `translateX(${botX}px)`,
                  }}
                >
                  <div
                    style={{
                      background: brand.bgLight,
                      borderRadius: "20px 20px 20px 4px",
                      padding: "16px 24px",
                      maxWidth: "70%",
                      border: `1px solid ${brand.grayDark}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 500,
                        color: brand.white,
                        fontFamily: font,
                      }}
                    >
                      {ex.bot}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Features Scene - Modern grid
const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const features = [
    { icon: "🧠", title: "Persistent Memory" },
    { icon: "🌐", title: "Web Browsing" },
    { icon: "📁", title: "File Management" },
    { icon: "⚙️", title: "Automations" },
    { icon: "🔗", title: "50+ Integrations" },
    { icon: "🔒", title: "Private Instance" },
  ];

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <AnimatedBackground />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 80,
        }}
      >
        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            textAlign: "center",
            marginBottom: 70,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: brand.accent,
              fontFamily: font,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              marginBottom: 16,
            }}
          >
            Capabilities
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: brand.white,
              fontFamily: font,
            }}
          >
            Everything You Need
          </div>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 30,
            maxWidth: 1200,
          }}
        >
          {features.map((feature, i) => {
            const delay = 20 + i * 8;
            const featureOpacity = interpolate(frame, [delay, delay + 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const featureScale = spring({
              frame: frame - delay,
              fps,
              config: { damping: 12, stiffness: 100 },
            });

            return (
              <div
                key={i}
                style={{
                  opacity: featureOpacity,
                  transform: `scale(${Math.max(0, featureScale)})`,
                  background: brand.bgLight,
                  borderRadius: 20,
                  padding: "40px",
                  border: `1px solid rgba(255,255,255,0.08)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                }}
              >
                <div style={{ fontSize: 48 }}>{feature.icon}</div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 600,
                    color: brand.white,
                    fontFamily: font,
                  }}
                >
                  {feature.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// How It Works Scene
const HowItWorksScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const steps = [
    { num: "01", title: "Connect Wallet", desc: "Link your Solana wallet" },
    { num: "02", title: "Subscribe", desc: "0.2 SOL per month" },
    { num: "03", title: "Start Chatting", desc: "Telegram, Discord, more" },
  ];

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <AnimatedBackground />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 80,
        }}
      >
        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            fontSize: 64,
            fontWeight: 800,
            color: brand.white,
            fontFamily: font,
            marginBottom: 80,
          }}
        >
          Get Started in Minutes
        </div>

        {/* Steps */}
        <div style={{ display: "flex", gap: 60, alignItems: "flex-start" }}>
          {steps.map((step, i) => {
            const delay = 20 + i * 20;
            const stepOpacity = interpolate(frame, [delay, delay + 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const stepY = interpolate(frame, [delay, delay + 20], [40, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={i}
                style={{
                  opacity: stepOpacity,
                  transform: `translateY(${stepY}px)`,
                  textAlign: "center",
                  width: 320,
                }}
              >
                {/* Number */}
                <div
                  style={{
                    fontSize: 80,
                    fontWeight: 800,
                    color: brand.accent,
                    fontFamily: font,
                    lineHeight: 1,
                    marginBottom: 24,
                  }}
                >
                  {step.num}
                </div>
                {/* Title */}
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: brand.white,
                    fontFamily: font,
                    marginBottom: 12,
                  }}
                >
                  {step.title}
                </div>
                {/* Desc */}
                <div
                  style={{
                    fontSize: 22,
                    color: brand.gray,
                    fontFamily: font,
                  }}
                >
                  {step.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Platforms Scene
const PlatformsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const platforms = ["Telegram", "Discord", "WhatsApp", "Slack"];

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <AnimatedBackground />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 80,
        }}
      >
        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            textAlign: "center",
            marginBottom: 60,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: brand.white,
              fontFamily: font,
              marginBottom: 16,
            }}
          >
            Chat Where You Are
          </div>
          <div
            style={{
              fontSize: 28,
              color: brand.gray,
              fontFamily: font,
            }}
          >
            Connect via your favorite platform
          </div>
        </div>

        {/* Platform pills */}
        <div style={{ display: "flex", gap: 24 }}>
          {platforms.map((platform, i) => {
            const delay = 20 + i * 8;
            const pillScale = spring({
              frame: frame - delay,
              fps,
              config: { damping: 12, stiffness: 100 },
            });

            return (
              <div
                key={i}
                style={{
                  transform: `scale(${Math.max(0, pillScale)})`,
                  background: brand.bgLight,
                  border: `2px solid ${brand.accent}`,
                  borderRadius: 100,
                  padding: "24px 48px",
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 600,
                    color: brand.white,
                    fontFamily: font,
                  }}
                >
                  {platform}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// CTA Scene - Final
const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const contentScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const contentOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  const buttonPulse = Math.sin(frame * 0.08) * 0.02 + 1;
  const glowPulse = Math.sin(frame * 0.06) * 0.3 + 0.7;

  return (
    <AbsoluteFill>
      <AnimatedBackground />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Logo glow */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 150,
            background: brand.gradient,
            filter: "blur(100px)",
            opacity: glowPulse * contentOpacity,
          }}
        />

        <div
          style={{
            opacity: contentOpacity,
            transform: `scale(${contentScale})`,
            textAlign: "center",
          }}
        >
          {/* Logo */}
          <div
            style={{
              fontSize: 120,
              fontWeight: 800,
              color: brand.white,
              fontFamily: font,
              letterSpacing: "-0.03em",
              marginBottom: 20,
            }}
          >
            ordo<span style={{ color: brand.accent }}>.sh</span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 36,
              color: brand.gray,
              fontFamily: font,
              marginBottom: 50,
            }}
          >
            Your AI Assistant in the Cloud
          </div>

          {/* CTA Button */}
          <div
            style={{
              display: "inline-block",
              transform: `scale(${buttonPulse})`,
              background: brand.gradient,
              borderRadius: 16,
              padding: "24px 64px",
              boxShadow: `0 0 60px ${brand.accentGlow}`,
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: brand.white,
                fontFamily: font,
              }}
            >
              Coming Soon
            </div>
          </div>

          {/* Price */}
          <div
            style={{
              marginTop: 40,
              fontSize: 24,
              color: brand.grayDark,
              fontFamily: font,
            }}
          >
            Starting at <span style={{ color: brand.accent, fontWeight: 600 }}>0.2 SOL</span>/month
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Main Composition
export const OrdoDemo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("voiceover.mp3")} />
      <Sequence from={0} durationInFrames={120}>
        <IntroScene />
      </Sequence>
      <Sequence from={120} durationInFrames={120}>
        <MacMiniScene />
      </Sequence>
      <Sequence from={240} durationInFrames={120}>
        <ProblemScene />
      </Sequence>
      <Sequence from={360} durationInFrames={120}>
        <SolutionScene />
      </Sequence>
      <Sequence from={480} durationInFrames={180}>
        <ExamplesScene />
      </Sequence>
      <Sequence from={660} durationInFrames={150}>
        <FeaturesScene />
      </Sequence>
      <Sequence from={810} durationInFrames={120}>
        <HowItWorksScene />
      </Sequence>
      <Sequence from={930} durationInFrames={90}>
        <PlatformsScene />
      </Sequence>
      <Sequence from={1020} durationInFrames={150}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
