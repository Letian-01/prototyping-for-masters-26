// Sparkling Pixelated Rainbow Widget for the Playground
// Author: Ryan Page

const SVG_NS = "http://www.w3.org/2000/svg";

const createSvg = (tag, attrs = {}) => {
  const el = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
};

// Generate pixel grid coordinates for the 6 concentric rainbow bands
const cx = 30;
const cy = 35;
const bandColors = [
  "#ff2d55", // 0: Ruby Red
  "#ff8800", // 1: Coral Orange
  "#ffcc00", // 2: Sun Yellow
  "#10b981", // 3: Emerald Green
  "#06b6d4", // 4: Cyan Sky
  "#8b5cf6", // 5: Royal Violet
];

const generateRainbowPaths = () => {
  const bandPaths = Array.from({ length: 6 }, () => []);
  for (let y = 14; y <= 35; y += 1) {
    for (let x = 8; x <= 52; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist >= 14.2 && dist < 20.2 && y <= cy) {
        const band = Math.floor(20.2 - dist);
        if (band >= 0 && band < 6) {
          bandPaths[band].push(`M${x},${y}h1v1h-1z`);
        }
      }
    }
  }
  return bandPaths.map((segments) => segments.join(" "));
};

// Generate pixel coordinates for a fluffy pixel cloud
const generateCloudPixels = (centerX, centerY) => {
  const blobs = [
    [centerX, centerY, 5.0],
    [centerX - 5, centerY + 1, 3.8],
    [centerX + 5, centerY + 1, 4.0],
    [centerX - 2, centerY - 2.5, 3.5],
    [centerX + 2.5, centerY - 2.2, 3.4],
  ];
  const mainWhite = [];
  const shadow = [];
  const blush = [
    `M${centerX - 4},${centerY + 1}h1v1h-1z`,
    `M${centerX + 4},${centerY + 1}h1v1h-1z`,
  ];

  for (let y = centerY - 6; y <= centerY + 6; y += 1) {
    for (let x = centerX - 10; x <= centerX + 10; x += 1) {
      for (const [bx, by, br] of blobs) {
        if (Math.hypot(x - bx, (y - by) * 1.08) <= br) {
          const rect = `M${x},${y}h1v1h-1z`;
          if (y >= centerY + 2) {
            shadow.push(rect);
          } else {
            mainWhite.push(rect);
          }
          break;
        }
      }
    }
  }
  return {
    whitePath: mainWhite.join(" "),
    shadowPath: shadow.join(" "),
    blushPath: blush.join(" "),
  };
};

export default {
  student: "Ryan Page",
  title: "Pixel Rainbow",
  frame: false,
  width: 280,
  height: 240,
  mount(root) {
    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        user-select: none;
      }
      .widget-container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 8px;
        outline: none;
      }
      .widget-container:focus-visible svg {
        filter: drop-shadow(0 0 8px rgba(255, 204, 0, 0.7));
      }
      svg {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
        image-rendering: pixelated;
        shape-rendering: crispEdges;
        transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .widget-container:hover svg {
        transform: scale(1.02);
      }
      .rainbow-arch {
        transform-origin: 30px 35px;
        transition: filter 300ms ease;
      }
      .widget-container:hover .rainbow-arch {
        filter: drop-shadow(0 0 6px rgba(255, 220, 100, 0.5));
      }
      .rainbow-arch.is-bouncing {
        animation: rainbowBounce 600ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Cloud layers - formed when hovered */
      .clouds-layer {
        opacity: 0;
        transform: scale(0.2) translateY(14px);
        transform-origin: 30px 36px;
        transition: transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 350ms ease;
        pointer-events: none;
      }
      .widget-container:hover .clouds-layer,
      .clouds-layer.is-active {
        opacity: 1;
        transform: scale(1) translateY(0);
        pointer-events: auto;
      }

      .cloud-left {
        transform-origin: 13px 34px;
        animation: floatCloudLeft 3s ease-in-out infinite alternate;
      }
      .cloud-right {
        transform-origin: 47px 34px;
        animation: floatCloudRight 3.2s ease-in-out infinite alternate 0.5s;
      }
      .cloud-accent {
        transform-origin: 30px 38px;
        animation: floatCloudCenter 2.8s ease-in-out infinite alternate 0.2s;
      }

      @keyframes floatCloudLeft {
        0% { transform: translateY(0) rotate(0deg); }
        100% { transform: translateY(-2px) rotate(-1.5deg); }
      }
      @keyframes floatCloudRight {
        0% { transform: translateY(0) rotate(0deg); }
        100% { transform: translateY(-2.5px) rotate(1.5deg); }
      }
      @keyframes floatCloudCenter {
        0% { transform: translateY(0); }
        100% { transform: translateY(-1.5px); }
      }

      @keyframes rainbowBounce {
        0% { transform: scale(1); }
        35% { transform: scale(1.12, 0.92); }
        65% { transform: scale(0.96, 1.06); }
        100% { transform: scale(1); }
      }

      /* Sparkles */
      .sparkle {
        transform-origin: center;
        animation: twinkle 1.8s ease-in-out infinite alternate;
      }
      .widget-container:hover .sparkle {
        animation-duration: 1.1s;
      }
      @keyframes twinkle {
        0% {
          opacity: 0.25;
          transform: scale(0.65);
        }
        50% {
          opacity: 1;
          transform: scale(1.15);
        }
        100% {
          opacity: 0.35;
          transform: scale(0.75);
        }
      }

      /* Dynamic sparkle particles on click */
      .burst-particle {
        pointer-events: none;
        animation: particleFly 750ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      @keyframes particleFly {
        0% {
          opacity: 1;
          transform: translate(0, 0) scale(1);
        }
        100% {
          opacity: 0;
          transform: translate(var(--dx), var(--dy)) scale(0.2);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        svg, .rainbow-arch, .clouds-layer, .cloud-left, .cloud-right, .sparkle {
          animation: none !important;
          transition: none !important;
        }
        .clouds-layer {
          opacity: 1 !important;
          transform: none !important;
        }
      }
    `;

    const container = document.createElement("div");
    container.className = "widget-container";
    container.setAttribute("tabindex", "0");
    container.setAttribute("role", "button");
    container.setAttribute("aria-label", "Pixel Rainbow - hover to form clouds, click to sparkle");

    const svg = createSvg("svg", {
      viewBox: "0 0 60 44",
      role: "img",
      "aria-label": "Sparkling pixel rainbow",
    });

    // 1. Rainbow arch
    const rainbowGroup = createSvg("g", { class: "rainbow-arch" });
    const paths = generateRainbowPaths();
    paths.forEach((d, i) => {
      const path = createSvg("path", {
        d,
        fill: bandColors[i],
        class: `band band-${i}`,
      });
      rainbowGroup.appendChild(path);
    });

    // Rainbow top highlight shimmer (sparkling pixel accents along the red arch)
    const highlightPath = createSvg("path", {
      d: "M27,14h3v1h-3z M20,16h2v1h-2z M38,16h2v1h-2z M15,19h2v1h-2z M43,19h2v1h-2z",
      fill: "rgba(255, 255, 255, 0.55)",
      class: "arch-highlight",
    });
    rainbowGroup.appendChild(highlightPath);

    // 2. Clouds Layer (hidden initially, forms around rainbow on hover)
    const cloudsLayer = createSvg("g", { class: "clouds-layer" });

    // Left Cloud
    const leftCloud = createSvg("g", { class: "cloud-left" });
    const leftData = generateCloudPixels(13, 33);
    leftCloud.appendChild(createSvg("path", { d: leftData.whitePath, fill: "#ffffff" }));
    leftCloud.appendChild(createSvg("path", { d: leftData.shadowPath, fill: "#dbeafe" }));
    leftCloud.appendChild(createSvg("path", { d: leftData.blushPath, fill: "#ffb3ba" }));

    // Right Cloud
    const rightCloud = createSvg("g", { class: "cloud-right" });
    const rightData = generateCloudPixels(47, 33);
    rightCloud.appendChild(createSvg("path", { d: rightData.whitePath, fill: "#ffffff" }));
    rightCloud.appendChild(createSvg("path", { d: rightData.shadowPath, fill: "#dbeafe" }));
    rightCloud.appendChild(createSvg("path", { d: rightData.blushPath, fill: "#ffb3ba" }));

    // Central Connecting Cloud Puff
    const centerCloud = createSvg("g", { class: "cloud-accent" });
    const centerPuffWhite = "M26,36h8v2h-8z M24,37h12v1h-12z M27,35h6v1h-6z";
    const centerPuffShadow = "M25,38h10v1h-10z M27,39h6v1h-6z";
    centerCloud.appendChild(createSvg("path", { d: centerPuffWhite, fill: "#ffffff" }));
    centerCloud.appendChild(createSvg("path", { d: centerPuffShadow, fill: "#dbeafe" }));

    cloudsLayer.appendChild(centerCloud);
    cloudsLayer.appendChild(leftCloud);
    cloudsLayer.appendChild(rightCloud);

    // 3. Sparkles Layer
    const sparklesLayer = createSvg("g", { class: "sparkles-layer" });

    // Star templates
    const makeLargeStar = (x, y, delay) => {
      const g = createSvg("g", {
        class: "sparkle",
        style: `transform-origin: ${x + 0.5}px ${y + 0.5}px; animation-delay: ${delay}s;`,
      });
      // Outer 4-point star arms
      const arms = `M${x},${y - 2}h1v1h-1z M${x},${y + 2}h1v1h-1z M${x - 2},${y}h1v1h-1z M${x + 2},${y}h1v1h-1z M${x},${y - 1}h1v3h-1z M${x - 1},${y}h3v1h-3z`;
      g.appendChild(createSvg("path", { d: arms, fill: "#fef08a" }));
      // Center highlight
      g.appendChild(createSvg("rect", { x, y, width: 1, height: 1, fill: "#ffffff" }));
      return g;
    };

    const makeMediumStar = (x, y, delay) => {
      const g = createSvg("g", {
        class: "sparkle",
        style: `transform-origin: ${x + 0.5}px ${y + 0.5}px; animation-delay: ${delay}s;`,
      });
      const cross = `M${x},${y - 1}h1v3h-1z M${x - 1},${y}h3v1h-3z`;
      g.appendChild(createSvg("path", { d: cross, fill: "#fef08a" }));
      g.appendChild(createSvg("rect", { x, y, width: 1, height: 1, fill: "#ffffff" }));
      return g;
    };

    const makeDot = (x, y, delay, color = "#ffffff") => {
      const g = createSvg("g", {
        class: "sparkle",
        style: `transform-origin: ${x + 0.5}px ${y + 0.5}px; animation-delay: ${delay}s;`,
      });
      g.appendChild(createSvg("rect", { x, y, width: 1, height: 1, fill: color }));
      return g;
    };

    // Place sparkles around the rainbow and in the sky
    const sparkles = [
      makeLargeStar(8, 12, 0.1),
      makeMediumStar(17, 7, -0.6),
      makeLargeStar(30, 6, -1.2),
      makeMediumStar(43, 7, -0.4),
      makeLargeStar(52, 12, -0.9),
      makeMediumStar(13, 21, -1.5),
      makeMediumStar(47, 21, -0.8),
      makeDot(24, 15, -0.3, "#fff59d"),
      makeDot(36, 15, -1.1, "#fff59d"),
      makeDot(27, 21, -0.7, "#ffffff"),
      makeDot(33, 21, -1.4, "#ffffff"),
      makeDot(10, 6, -0.5, "#67e8f9"),
      makeDot(50, 6, -1.0, "#f472b6"),
    ];
    sparkles.forEach((s) => sparklesLayer.appendChild(s));

    // Particle container for click bursts
    const particleLayer = createSvg("g", { class: "particle-layer" });

    // Assemble SVG
    svg.appendChild(rainbowGroup);
    svg.appendChild(cloudsLayer);
    svg.appendChild(sparklesLayer);
    svg.appendChild(particleLayer);

    container.appendChild(svg);
    root.appendChild(style);
    root.appendChild(container);

    // Hover interactions for cloud formation
    const activateClouds = () => cloudsLayer.classList.add("is-active");
    const deactivateClouds = () => cloudsLayer.classList.remove("is-active");

    container.addEventListener("mouseenter", activateClouds);
    container.addEventListener("mouseleave", deactivateClouds);
    container.addEventListener("focus", activateClouds);
    container.addEventListener("blur", deactivateClouds);

    // Audio chime effect on click
    let audioCtx = null;
    const playChime = () => {
      try {
        if (!audioCtx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) audioCtx = new AudioContext();
        }
        if (audioCtx && audioCtx.state === "suspended") {
          audioCtx.resume();
        }
        if (audioCtx) {
          const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
          notes.forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.06);
            gain.gain.setValueAtTime(0.04, audioCtx.currentTime + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + idx * 0.06 + 0.28);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(audioCtx.currentTime + idx * 0.06);
            osc.stop(audioCtx.currentTime + idx * 0.06 + 0.3);
          });
        }
      } catch {
        // Ignore audio failures if blocked
      }
    };

    // Click sparkle burst effect
    container.addEventListener("click", (e) => {
      playChime();

      rainbowGroup.classList.remove("is-bouncing");
      void rainbowGroup.getBoundingClientRect();
      rainbowGroup.classList.add("is-bouncing");

      const rect = svg.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * 60;
      const clickY = ((e.clientY - rect.top) / rect.height) * 44;

      const colors = ["#ff2d55", "#ffcc00", "#06b6d4", "#ffffff", "#8b5cf6", "#10b981"];
      for (let i = 0; i < 8; i += 1) {
        const angle = (i / 8) * Math.PI * 2;
        const dist = 6 + Math.random() * 8;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;

        const p = createSvg("rect", {
          x: clickX,
          y: clickY,
          width: 1.5,
          height: 1.5,
          fill: colors[i % colors.length],
          class: "burst-particle",
          style: `--dx: ${dx.toFixed(2)}px; --dy: ${dy.toFixed(2)}px;`,
        });
        particleLayer.appendChild(p);
        setTimeout(() => p.remove(), 750);
      }
    });
  },
};
