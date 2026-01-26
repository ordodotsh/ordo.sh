import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  Audio,
  staticFile,
} from "remotion";

const colors = {
  background: "#FAF9F7",
  accent: "#D97706",
  text: "#1A1715",
  white: "#FFFFFF",
  cardBorder: "#E5E5E5",
};

// Intro Scene - Logo and Tagline
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const taglineOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateRight: "clamp",
  });

  const taglineY = interpolate(frame, [30, 50], [30, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          transform: `scale(${logoScale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 140,
            fontWeight: 800,
            color: colors.text,
            fontFamily: "system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.02em",
          }}
        >
          ordo<span style={{ color: colors.accent }}>.sh</span>
        </div>
        <div
          style={{
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
            fontSize: 36,
            color: colors.text,
            fontFamily: "system-ui, -apple-system, sans-serif",
            marginTop: 20,
            fontStyle: "italic",
          }}
        >
          ab chao, ordo
        </div>
        <div
          style={{
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
            fontSize: 28,
            color: "#666",
            fontFamily: "system-ui, -apple-system, sans-serif",
            marginTop: 10,
          }}
        >
          from chaos, order
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Problem Scene
const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const cardScale = spring({
    frame: frame - 20,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const problems = [
    { icon: "💻", text: "Running AI locally requires $500+ hardware" },
    { icon: "⚡", text: "High electricity costs 24/7" },
    { icon: "🔧", text: "Constant maintenance & updates" },
    { icon: "😤", text: "Complex setup & configuration" },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      <div style={{ textAlign: "center", width: "100%" }}>
        <div
          style={{
            opacity: titleOpacity,
            fontSize: 64,
            fontWeight: 700,
            color: colors.text,
            fontFamily: "system-ui, -apple-system, sans-serif",
            marginBottom: 60,
          }}
        >
          The Problem
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 30,
            transform: `scale(${Math.max(0, cardScale)})`,
          }}
        >
          {problems.map((problem, i) => (
            <div
              key={i}
              style={{
                backgroundColor: colors.white,
                borderRadius: 20,
                padding: "40px 50px",
                width: 380,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: `1px solid ${colors.cardBorder}`,
              }}
            >
              <div style={{ fontSize: 60, marginBottom: 20 }}>{problem.icon}</div>
              <div
                style={{
                  fontSize: 24,
                  color: colors.text,
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  lineHeight: 1.4,
                }}
              >
                {problem.text}
              </div>
            </div>
          ))}
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

  const contentY = interpolate(frame, [15, 40], [50, 0], {
    extrapolateRight: "clamp",
  });

  const contentOpacity = interpolate(frame, [15, 40], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.accent,
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            opacity: titleOpacity,
            fontSize: 64,
            fontWeight: 700,
            color: colors.white,
            fontFamily: "system-ui, -apple-system, sans-serif",
            marginBottom: 40,
          }}
        >
          The Solution
        </div>
        <div
          style={{
            opacity: contentOpacity,
            transform: `translateY(${contentY}px)`,
          }}
        >
          <div
            style={{
              fontSize: 48,
              color: colors.white,
              fontFamily: "system-ui, -apple-system, sans-serif",
              marginBottom: 30,
              fontWeight: 600,
            }}
          >
            Your Personal AI Assistant
          </div>
          <div
            style={{
              fontSize: 36,
              color: "rgba(255,255,255,0.9)",
              fontFamily: "system-ui, -apple-system, sans-serif",
              marginBottom: 50,
            }}
          >
            Running in the Cloud, 24/7
          </div>
          <div
            style={{
              display: "flex",
              gap: 40,
              justifyContent: "center",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 16,
                padding: "30px 50px",
              }}
            >
              <div style={{ fontSize: 32, color: colors.white, fontWeight: 600 }}>
                Powered by
              </div>
              <div style={{ fontSize: 42, color: colors.white, fontWeight: 700 }}>
                Claude Opus
              </div>
            </div>
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 16,
                padding: "30px 50px",
              }}
            >
              <div style={{ fontSize: 32, color: colors.white, fontWeight: 600 }}>
                Pay with
              </div>
              <div style={{ fontSize: 42, color: colors.white, fontWeight: 700 }}>
                Solana
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Examples Scene - Real use cases
const ExamplesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const examples = [
    {
      user: "Remind me to check my portfolio every morning at 9am",
      bot: "Done! I'll message you daily at 9am with your portfolio update.",
    },
    {
      user: "Check me in for my flight tomorrow",
      bot: "Checked in! Window seat 14A confirmed. Boarding pass saved.",
    },
    {
      user: "Summarize my unread emails and unsubscribe from spam",
      bot: "You have 3 important emails. Unsubscribed from 12 newsletters.",
    },
    {
      user: "Create a GitHub issue for the auth bug we discussed",
      bot: "Created issue #247: 'Fix OAuth token refresh'. Assigned to you.",
    },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.text,
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      <div style={{ textAlign: "center", width: "100%", maxWidth: 1200 }}>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: colors.white,
            fontFamily: "system-ui, -apple-system, sans-serif",
            marginBottom: 50,
          }}
        >
          Just Ask
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {examples.map((example, i) => {
            const delay = i * 25;
            const userOpacity = interpolate(frame - delay, [0, 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const botOpacity = interpolate(frame - delay, [10, 25], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 20,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    opacity: userOpacity,
                    backgroundColor: colors.accent,
                    borderRadius: 16,
                    padding: "16px 24px",
                    flex: 1,
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.7)",
                      marginBottom: 6,
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    You
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      color: colors.white,
                      fontFamily: "system-ui, -apple-system, sans-serif",
                    }}
                  >
                    {example.user}
                  </div>
                </div>
                <div
                  style={{
                    opacity: botOpacity,
                    backgroundColor: "rgba(255,255,255,0.15)",
                    borderRadius: 16,
                    padding: "16px 24px",
                    flex: 1,
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.7)",
                      marginBottom: 6,
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Ordo
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      color: colors.white,
                      fontFamily: "system-ui, -apple-system, sans-serif",
                    }}
                  >
                    {example.bot}
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

// Features Scene
const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const features = [
    { icon: "🧠", title: "Persistent Memory", desc: "Remembers your preferences" },
    { icon: "🌐", title: "Browse & Research", desc: "Search the web for you" },
    { icon: "📁", title: "File Management", desc: "Organize your digital life" },
    { icon: "⚙️", title: "Automations", desc: "Set up recurring tasks" },
    { icon: "🔗", title: "50+ Integrations", desc: "GitHub, Gmail, Notion..." },
    { icon: "🔒", title: "Private Instance", desc: "Your own dedicated VM" },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      <div style={{ textAlign: "center", width: "100%" }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: colors.text,
            fontFamily: "system-ui, -apple-system, sans-serif",
            marginBottom: 50,
          }}
        >
          Powerful Features
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 25,
            maxWidth: 1400,
            margin: "0 auto",
          }}
        >
          {features.map((feature, i) => {
            const delay = i * 8;
            const featureScale = spring({
              frame: frame - delay,
              fps,
              config: { damping: 12, stiffness: 100 },
            });

            return (
              <div
                key={i}
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 20,
                  padding: "35px 40px",
                  width: 400,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  border: `1px solid ${colors.cardBorder}`,
                  transform: `scale(${Math.max(0, featureScale)})`,
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: 50, marginBottom: 15 }}>{feature.icon}</div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 600,
                    color: colors.text,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    marginBottom: 8,
                  }}
                >
                  {feature.title}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    color: "#666",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                >
                  {feature.desc}
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
    { num: "1", title: "Connect Wallet", desc: "Link your Solana wallet" },
    { num: "2", title: "Subscribe", desc: "Pay 0.2 SOL/month" },
    { num: "3", title: "Start Chatting", desc: "Via Telegram or Discord" },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: colors.text,
            fontFamily: "system-ui, -apple-system, sans-serif",
            marginBottom: 60,
          }}
        >
          How It Works
        </div>
        <div
          style={{
            display: "flex",
            gap: 60,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {steps.map((step, i) => {
            const delay = i * 15;
            const stepOpacity = interpolate(frame - delay, [0, 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const stepY = interpolate(frame - delay, [0, 20], [40, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={i}
                style={{
                  opacity: stepOpacity,
                  transform: `translateY(${stepY}px)`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    backgroundColor: colors.accent,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: 56,
                    fontWeight: 700,
                    color: colors.white,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    marginBottom: 25,
                  }}
                >
                  {step.num}
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 600,
                    color: colors.text,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    marginBottom: 10,
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    color: "#666",
                    fontFamily: "system-ui, -apple-system, sans-serif",
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

  const platforms = [
    { name: "Telegram", color: "#0088cc" },
    { name: "Discord", color: "#5865F2" },
    { name: "WhatsApp", color: "#25D366" },
    { name: "Slack", color: "#4A154B" },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.text,
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: colors.white,
            fontFamily: "system-ui, -apple-system, sans-serif",
            marginBottom: 30,
          }}
        >
          Chat Where You Are
        </div>
        <div
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.7)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            marginBottom: 60,
          }}
        >
          Connect via your favorite platform
        </div>
        <div
          style={{
            display: "flex",
            gap: 40,
            justifyContent: "center",
          }}
        >
          {platforms.map((platform, i) => {
            const delay = i * 10;
            const scale = spring({
              frame: frame - delay,
              fps,
              config: { damping: 12, stiffness: 100 },
            });

            return (
              <div
                key={i}
                style={{
                  transform: `scale(${Math.max(0, scale)})`,
                  backgroundColor: platform.color,
                  borderRadius: 24,
                  padding: "40px 60px",
                  minWidth: 200,
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 600,
                    color: colors.white,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                >
                  {platform.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// CTA Scene
const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 80 },
  });

  const buttonPulse = Math.sin(frame * 0.1) * 0.03 + 1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: colors.text,
            fontFamily: "system-ui, -apple-system, sans-serif",
            marginBottom: 30,
          }}
        >
          ordo<span style={{ color: colors.accent }}>.sh</span>
        </div>
        <div
          style={{
            fontSize: 36,
            color: "#666",
            fontFamily: "system-ui, -apple-system, sans-serif",
            marginBottom: 50,
          }}
        >
          Your AI Assistant in the Cloud
        </div>
        <div
          style={{
            transform: `scale(${buttonPulse})`,
            backgroundColor: colors.accent,
            color: colors.white,
            fontSize: 32,
            fontWeight: 600,
            padding: "25px 60px",
            borderRadius: 16,
            fontFamily: "system-ui, -apple-system, sans-serif",
            display: "inline-block",
          }}
        >
          Coming Soon
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 24,
            color: "#999",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          0.2 SOL/month
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
        <ProblemScene />
      </Sequence>
      <Sequence from={240} durationInFrames={120}>
        <SolutionScene />
      </Sequence>
      <Sequence from={360} durationInFrames={180}>
        <ExamplesScene />
      </Sequence>
      <Sequence from={540} durationInFrames={150}>
        <FeaturesScene />
      </Sequence>
      <Sequence from={690} durationInFrames={120}>
        <HowItWorksScene />
      </Sequence>
      <Sequence from={810} durationInFrames={90}>
        <PlatformsScene />
      </Sequence>
      <Sequence from={900} durationInFrames={150}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
