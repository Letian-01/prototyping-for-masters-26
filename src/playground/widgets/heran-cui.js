const SVG_NS = "http://www.w3.org/2000/svg";

const createSvg = (tag, attrs = {}) => {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
};

// Cap color themes inspired by the reference images
const CAP_THEMES = [
  { name: "Kelly Green", main: "#22a348", dark: "#15803d", brim: "#166534" },
  { name: "Dodger Blue", main: "#2563eb", dark: "#1d4ed8", brim: "#1e40af" },
  { name: "Crimson Red", main: "#dc2626", dark: "#b91c1c", brim: "#991b1b" },
  { name: "Golden Sun",  main: "#f59e0b", dark: "#d97706", brim: "#b45309" },
  { name: "Purple Pop",  main: "#9333ea", dark: "#7e22ce", brim: "#6b21a8" },
  { name: "Ink Black",   main: "#27272a", dark: "#18181b", brim: "#09090b" },
];

// Hour positions calculated to fit comfortably inside the dog's cream face
const HOUR_POSITIONS = {
  12: { x: 150, y: 118, major: true },
  1:  { x: 186, y: 122, major: false },
  2:  { x: 204, y: 154, major: false },
  3:  { x: 205, y: 185, major: true },
  4:  { x: 198, y: 213, major: false },
  5:  { x: 178, y: 231, major: false },
  6:  { x: 150, y: 235, major: true },
  7:  { x: 122, y: 231, major: false },
  8:  { x: 102, y: 213, major: false },
  9:  { x: 95,  y: 185, major: true },
  10: { x: 96,  y: 154, major: false },
  11: { x: 114, y: 122, major: false },
};

export default {
  student: "Heran Cui (Bruce)",
  title: "Ruff Ruff",
  frame: false,
  rotate: 3,
  width: 290,
  height: 260,
  mount(root) {
    let capIndex = 0;
    let isHappy = false;
    let happyTimeout = null;

    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
        user-select: none;
        background: transparent;
      }

      svg {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
      }

      .die-cut-clock {
        filter: drop-shadow(0 14px 28px rgba(24, 24, 27, 0.18)) drop-shadow(0 3px 8px rgba(24, 24, 27, 0.12));
        transform-origin: 150px 145px;
      }

      /* Interactive Cap (Click to change color) */
      .cap-group {
        cursor: pointer;
        transform-origin: 150px 72px;
        transition: transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .cap-group:hover {
        transform: scale(1.08) rotate(-3deg);
      }
      .cap-group.hop {
        animation: capHop 450ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes capHop {
        0% { transform: translateY(0) rotate(0deg) scale(1); }
        40% { transform: translateY(-18px) rotate(-8deg) scale(1.14); }
        70% { transform: translateY(2px) rotate(4deg) scale(0.96); }
        100% { transform: translateY(0) rotate(0deg) scale(1); }
      }

      /* Interactive Ears (Click to wiggle) */
      .ear-left {
        transform-origin: 100px 105px;
        cursor: pointer;
        transition: transform 150ms ease;
      }
      .ear-right {
        transform-origin: 200px 105px;
        cursor: pointer;
        transition: transform 150ms ease;
      }
      .ear-left:hover {
        transform: rotate(-4deg);
      }
      .ear-right:hover {
        transform: rotate(4deg);
      }
      .ear-left.wiggle {
        animation: earFlapLeft 650ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .ear-right.wiggle {
        animation: earFlapRight 650ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes earFlapLeft {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(-14deg); }
        55% { transform: rotate(9deg); }
        80% { transform: rotate(-4deg); }
        100% { transform: rotate(0deg); }
      }
      @keyframes earFlapRight {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(14deg); }
        55% { transform: rotate(-9deg); }
        80% { transform: rotate(4deg); }
        100% { transform: rotate(0deg); }
      }

      /* Non-clickable expressive eyes */
      .eyes-group {
        pointer-events: none;
      }
      .eye-white {
        transition: transform 150ms ease;
      }
      .pupil-wrap {
        transition: transform 80ms ease-out;
      }

      .happy-eyes {
        opacity: 0;
        transition: opacity 120ms ease;
      }
      .happy-eyes.active {
        opacity: 1;
      }
      .normal-eyes.hidden {
        opacity: 0;
      }

      .eyes-group.blink .eye-white,
      .eyes-group.blink .pupil-wrap {
        transform: scaleY(0.1);
        transform-origin: center 142px;
      }

      /* Interactive Nose Hub (Click to boop) */
      .nose-group {
        cursor: pointer;
      }
      .nose-shape {
        transition: transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1);
        transform-origin: 150px 185px;
      }
      .nose-group:hover .nose-shape {
        transform: scale(1.12);
      }
      .nose-group:active .nose-shape {
        transform: scale(0.92);
      }

      /* Non-spinning clock hands (strictly real-time) */
      .hands-group {
        pointer-events: none;
      }
      .hand {
        transform-box: view-box;
        transform-origin: 150px 185px;
        pointer-events: none;
      }
      .hand-second {
        transition: transform 200ms cubic-bezier(0.34, 1.8, 0.64, 1);
      }

      .hour-number {
        font-family: "Faculty Glyphic", "IBM Plex Mono", sans-serif;
        text-anchor: middle;
        dominant-baseline: central;
        user-select: none;
        pointer-events: none;
      }
      .hour-major {
        font-size: 15px;
        font-weight: 700;
        fill: #18181b;
      }
      .hour-minor {
        font-size: 11px;
        font-weight: 600;
        fill: #44403c;
      }

      @media (prefers-reduced-motion: reduce) {
        .hand-second { transition: none; }
        .cap-group.hop, .ear-left.wiggle, .ear-right.wiggle {
          animation: none !important;
        }
      }
    `;

    const svg = createSvg("svg", {
      viewBox: "0 0 300 270",
      role: "img",
      "aria-label": "Ruff Ruff by Bruce Cui",
    });

    const mainGroup = createSvg("g", { class: "die-cut-clock" });

    // 1. Die-cut physical casing depth layer
    const casingDepth = createSvg("g", { class: "casing-depth", opacity: "0.5" });
    const depthLeftEar = createSvg("path", {
      d: "M 98 105 C 58 85 36 108 22 155 C 8 199 14 231 32 235 C 50 239 68 221 80 189 C 90 161 98 129 98 105 Z",
      fill: "#e5deb8",
    });
    const depthRightEar = createSvg("path", {
      d: "M 202 105 C 242 85 264 108 278 155 C 292 199 286 231 268 235 C 250 239 232 221 220 189 C 210 161 202 129 202 105 Z",
      fill: "#e5deb8",
    });
    const depthHead = createSvg("path", {
      d: "M 116 97 C 104 108 76 133 72 168 C 68 209 94 249 150 255 C 206 249 232 209 228 168 C 224 133 196 108 184 97 Z",
      fill: "#e5deb8",
    });
    casingDepth.append(depthLeftEar, depthRightEar, depthHead);
    mainGroup.append(casingDepth);

    // 2. Symmetrical Floppy Ears (Image 1 inspired, bold comic marker outlines)
    const earsGroup = createSvg("g", { class: "ears-group" });

    // Left Ear
    const earLeft = createSvg("g", { class: "ear-left" });
    earLeft.setAttribute("title", "Click to wiggle ear");
    const earLeftPath = createSvg("path", {
      d: "M 98 102 C 58 82 36 105 22 152 C 8 196 14 228 32 232 C 50 236 68 218 80 186 C 90 158 98 126 98 102 Z",
      fill: "#fcf7df",
      stroke: "#18181b",
      "stroke-width": "5.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    });
    const earLeftInner = createSvg("path", {
      d: "M 44 195 C 48 215 62 218 74 198",
      fill: "none",
      stroke: "#18181b",
      "stroke-width": "3.5",
      "stroke-linecap": "round",
    });
    earLeft.append(earLeftPath, earLeftInner);

    // Right Ear
    const earRight = createSvg("g", { class: "ear-right" });
    earRight.setAttribute("title", "Click to wiggle ear");
    const earRightPath = createSvg("path", {
      d: "M 202 102 C 242 82 264 105 278 152 C 292 196 286 228 268 232 C 250 236 232 218 220 186 C 210 158 202 126 202 102 Z",
      fill: "#fcf7df",
      stroke: "#18181b",
      "stroke-width": "5.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    });
    const earRightInner = createSvg("path", {
      d: "M 256 195 C 252 215 238 218 226 198",
      fill: "none",
      stroke: "#18181b",
      "stroke-width": "3.5",
      "stroke-linecap": "round",
    });
    earRight.append(earRightPath, earRightInner);

    earsGroup.append(earLeft, earRight);
    mainGroup.append(earsGroup);

    // 3. Head Shape (Image 1: Broad chubby cheeks, warm butter coat, bold marker line)
    const head = createSvg("path", {
      d: "M 116 94 C 104 105 76 130 72 165 C 68 206 94 246 150 252 C 206 246 232 206 228 165 C 224 130 196 105 184 94 Z",
      fill: "#fdf8e2",
      stroke: "#18181b",
      "stroke-width": "5.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    });
    mainGroup.append(head);

    // 4. Clearly positioned, readable hour numbers on the face
    const markersGroup = createSvg("g", { class: "clock-markers", "pointer-events": "none" });

    for (let h = 1; h <= 12; h += 1) {
      const pos = HOUR_POSITIONS[h];
      const text = createSvg("text", {
        class: `hour-number ${pos.major ? "hour-major" : "hour-minor"}`,
        x: pos.x,
        y: pos.y,
      });
      text.textContent = String(h);
      markersGroup.append(text);
    }
    mainGroup.append(markersGroup);

    // 5. Cartoon Eyes (Non-clickable, animated cursor tracking and blinking)
    const eyesGroup = createSvg("g", { class: "eyes-group" });

    const normalEyes = createSvg("g", { class: "normal-eyes" });

    // Left Eye
    const leftEyeWhite = createSvg("ellipse", {
      class: "eye-white eye-white-left",
      cx: 130, cy: 142, rx: 12.5, ry: 19,
      fill: "#ffffff",
      stroke: "#18181b",
      "stroke-width": "4.5",
    });
    const leftPupilGroup = createSvg("g", { class: "pupil-wrap left-pupil-wrap" });
    const leftPupil = createSvg("circle", {
      class: "pupil left-pupil",
      cx: 130, cy: 138, r: 6.2,
      fill: "#18181b",
    });
    const leftGleam = createSvg("circle", {
      cx: 128, cy: 135.5, r: 1.6,
      fill: "#ffffff",
    });
    leftPupilGroup.append(leftPupil, leftGleam);

    // Right Eye
    const rightEyeWhite = createSvg("ellipse", {
      class: "eye-white eye-white-right",
      cx: 170, cy: 142, rx: 12.5, ry: 19,
      fill: "#ffffff",
      stroke: "#18181b",
      "stroke-width": "4.5",
    });
    const rightPupilGroup = createSvg("g", { class: "pupil-wrap right-pupil-wrap" });
    const rightPupil = createSvg("circle", {
      class: "pupil right-pupil",
      cx: 170, cy: 138, r: 6.2,
      fill: "#18181b",
    });
    const rightGleam = createSvg("circle", {
      cx: 168, cy: 135.5, r: 1.6,
      fill: "#ffffff",
    });
    rightPupilGroup.append(rightPupil, rightGleam);

    normalEyes.append(leftEyeWhite, leftPupilGroup, rightEyeWhite, rightPupilGroup);

    // Happy smiling eyes arcs (shown when nose is clicked)
    const happyEyes = createSvg("g", { class: "happy-eyes" });
    const happyLeft = createSvg("path", {
      d: "M 119 146 Q 130 134 141 146",
      fill: "none",
      stroke: "#18181b",
      "stroke-width": "4.5",
      "stroke-linecap": "round",
    });
    const happyRight = createSvg("path", {
      d: "M 159 146 Q 170 134 181 146",
      fill: "none",
      stroke: "#18181b",
      "stroke-width": "4.5",
      "stroke-linecap": "round",
    });
    happyEyes.append(happyLeft, happyRight);

    eyesGroup.append(normalEyes, happyEyes);
    mainGroup.append(eyesGroup);

    // 6. Whimsical Baseball Cap (Image 1: Click cap directly to cycle colors!)
    const capGroup = createSvg("g", { class: "cap-group" });
    capGroup.setAttribute("title", "Click cap to change color");

    const capCrown = createSvg("path", {
      class: "cap-crown",
      d: "M 125 94 C 124 57 176 57 175 94 Z",
      fill: CAP_THEMES[0].main,
      stroke: "#18181b",
      "stroke-width": "5",
      "stroke-linejoin": "round",
    });
    const capButton = createSvg("ellipse", {
      class: "cap-button",
      cx: 150, cy: 58, rx: 6, ry: 4.5,
      fill: CAP_THEMES[0].dark,
      stroke: "#18181b",
      "stroke-width": "3.5",
    });
    const capBrim = createSvg("path", {
      class: "cap-brim",
      d: "M 116 93 C 130 106 170 106 184 93 C 174 111 126 111 116 93 Z",
      fill: CAP_THEMES[0].brim,
      stroke: "#18181b",
      "stroke-width": "5",
      "stroke-linejoin": "round",
    });
    capGroup.append(capCrown, capButton, capBrim);
    mainGroup.append(capGroup);

    // 7. Snout & Smile lines
    const mouthLine = createSvg("path", {
      d: "M 143 206 Q 150 211 157 206",
      fill: "none",
      stroke: "#18181b",
      "stroke-width": "3",
      "stroke-linecap": "round",
    });
    mainGroup.append(mouthLine);

    // 8. Clock Hands (pivoting from center of the nose, pointer-events: none, no spinning on click)
    const handsGroup = createSvg("g", { class: "hands-group" });
    const clockCenter = { x: 150, y: 185 };

    // Hour Hand
    const hourHand = createSvg("g", { class: "hand hand-hour" });
    const hourLine = createSvg("line", {
      x1: clockCenter.x, y1: clockCenter.y + 6,
      x2: clockCenter.x, y2: clockCenter.y - 36,
      stroke: "#18181b",
      "stroke-width": "6.5",
      "stroke-linecap": "round",
    });
    hourHand.append(hourLine);

    // Minute Hand
    const minuteHand = createSvg("g", { class: "hand hand-minute" });
    const minuteLine = createSvg("line", {
      x1: clockCenter.x, y1: clockCenter.y + 8,
      x2: clockCenter.x, y2: clockCenter.y - 52,
      stroke: "#18181b",
      "stroke-width": "4.5",
      "stroke-linecap": "round",
    });
    minuteHand.append(minuteLine);

    // Second Hand
    const secondHand = createSvg("g", { class: "hand hand-second" });
    const secondLine = createSvg("line", {
      x1: clockCenter.x, y1: clockCenter.y + 16,
      x2: clockCenter.x, y2: clockCenter.y - 60,
      stroke: "#ef4444",
      "stroke-width": "2",
      "stroke-linecap": "round",
    });
    const secondCounter = createSvg("circle", {
      cx: clockCenter.x, cy: clockCenter.y + 12, r: 3.5,
      fill: "#ef4444",
    });
    const secondTip = createSvg("circle", {
      cx: clockCenter.x, cy: clockCenter.y - 60, r: 3,
      fill: "#ef4444",
    });
    secondHand.append(secondLine, secondCounter, secondTip);

    handsGroup.append(hourHand, minuteHand, secondHand);
    mainGroup.append(handsGroup);

    // 9. Nose Hub (Image 1: Big black nose is the central clock hub; click to boop!)
    const noseGroup = createSvg("g", { class: "nose-group" });
    noseGroup.setAttribute("title", "Click nose to boop!");

    const noseShape = createSvg("ellipse", {
      class: "nose-shape",
      cx: clockCenter.x, cy: clockCenter.y,
      rx: 18, ry: 15,
      fill: "#18181b",
      stroke: "#18181b",
      "stroke-width": "2",
    });
    const noseHighlight = createSvg("ellipse", {
      cx: clockCenter.x - 5, cy: clockCenter.y - 4,
      rx: 4.5, ry: 2.8,
      fill: "rgba(255, 255, 255, 0.75)",
    });
    const pinCap = createSvg("circle", {
      cx: clockCenter.x, cy: clockCenter.y, r: 3.5,
      fill: "#3f3f46",
      stroke: "#18181b",
      "stroke-width": "1.5",
    });
    noseGroup.append(noseShape, noseHighlight, pinCap);
    mainGroup.append(noseGroup);

    svg.append(mainGroup);
    root.append(style, svg);

    // Direct Interaction 1: Click Cap to cycle colors
    const applyCapTheme = (index) => {
      const theme = CAP_THEMES[index % CAP_THEMES.length];
      capCrown.setAttribute("fill", theme.main);
      capButton.setAttribute("fill", theme.dark);
      capBrim.setAttribute("fill", theme.brim);
    };

    const nextCapTheme = () => {
      capIndex = (capIndex + 1) % CAP_THEMES.length;
      applyCapTheme(capIndex);
      capGroup.classList.remove("hop");
      void capGroup.getBoundingClientRect();
      capGroup.classList.add("hop");
    };
    capGroup.addEventListener("click", nextCapTheme);
    capGroup.addEventListener("animationend", () => capGroup.classList.remove("hop"));

    // Direct Interaction 2: Click Ears to wiggle
    const wiggleEar = (earEl) => {
      earEl.classList.remove("wiggle");
      void earEl.getBoundingClientRect();
      earEl.classList.add("wiggle");
    };
    earLeft.addEventListener("click", () => wiggleEar(earLeft));
    earRight.addEventListener("click", () => wiggleEar(earRight));
    earLeft.addEventListener("animationend", () => earLeft.classList.remove("wiggle"));
    earRight.addEventListener("animationend", () => earRight.classList.remove("wiggle"));

    // Direct Interaction 3: Click Nose to boop
    const boopNose = () => {
      wiggleEar(earLeft);
      wiggleEar(earRight);

      isHappy = true;
      happyEyes.classList.add("active");
      normalEyes.classList.add("hidden");
      clearTimeout(happyTimeout);
      happyTimeout = setTimeout(() => {
        isHappy = false;
        happyEyes.classList.remove("active");
        normalEyes.classList.remove("hidden");
      }, 1200);
    };
    noseGroup.addEventListener("click", boopNose);

    // Eye blinking
    const triggerBlink = () => {
      if (isHappy) return;
      eyesGroup.classList.add("blink");
      setTimeout(() => eyesGroup.classList.remove("blink"), 180);
      const nextBlink = 3000 + Math.random() * 4500;
      setTimeout(triggerBlink, nextBlink);
    };
    setTimeout(triggerBlink, 2500);

    // Cursor tracking for pupils
    const handlePointerMove = (event) => {
      if (isHappy) return;
      const rect = svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const mouseX = ((event.clientX - rect.left) / rect.width) * 300;
      const mouseY = ((event.clientY - rect.top) / rect.height) * 270;

      // Left eye at (130, 142)
      const ldx = mouseX - 130;
      const ldy = mouseY - 142;
      const lDist = Math.hypot(ldx, ldy) || 1;
      const lClamped = Math.min(lDist, 6.5);
      const lx = (ldx / lDist) * lClamped;
      const ly = (ldy / lDist) * (lClamped * 1.1);
      leftPupilGroup.style.transform = `translate(${lx.toFixed(1)}px, ${ly.toFixed(1)}px)`;

      // Right eye at (170, 142)
      const rdx = mouseX - 170;
      const rdy = mouseY - 142;
      const rDist = Math.hypot(rdx, rdy) || 1;
      const rClamped = Math.min(rDist, 6.5);
      const rx = (rdx / rDist) * rClamped;
      const ry = (rdy / rDist) * (rClamped * 1.1);
      rightPupilGroup.style.transform = `translate(${rx.toFixed(1)}px, ${ry.toFixed(1)}px)`;
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // Time keeping & clock hands (strictly accurate real-time)
    const startTimestamp = Math.floor(Date.now() / 1000);
    const startSecondOffset = new Date().getSeconds();

    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      const continuousMinutes = minutes + seconds / 60;
      const hourAngle = ((hours % 12) + continuousMinutes / 60) * 30;
      const minuteAngle = continuousMinutes * 6;

      const elapsedSeconds = Math.floor(now.getTime() / 1000) - startTimestamp;
      const secondAngle = (startSecondOffset + elapsedSeconds) * 6;

      hourHand.style.transform = `rotate(${hourAngle.toFixed(2)}deg)`;
      minuteHand.style.transform = `rotate(${minuteAngle.toFixed(2)}deg)`;
      secondHand.style.transform = `rotate(${secondAngle}deg)`;

      const displayHours = hours % 12 || 12;
      const ampm = hours >= 12 ? "PM" : "AM";
      const pad = (n) => String(n).padStart(2, "0");
      svg.setAttribute("aria-label", `Ruff Ruff: ${displayHours}:${pad(minutes)}:${pad(seconds)} ${ampm}`);
    };

    updateClock();
    setInterval(updateClock, 1000);
    applyCapTheme(capIndex);
  },
};
