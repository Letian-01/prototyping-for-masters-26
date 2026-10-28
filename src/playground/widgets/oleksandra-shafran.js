import griffonUrl from "./oleksandra-shafran-griffon.webp";
import kissUrl from "./oleksandra-shafran-kiss.webp";

export default {
  student: "Oleksandra Shafran",
  title: "Griffon smooch",
  frame: false,
  rotate: 4,
  width: 370,
  height: 324,
  mount(root) {
    const style = document.createElement("style");
    style.textContent = `
      button {
        display: block;
        width: 100%;
        height: 100%;
        padding: 0;
        border: 0;
        background: none;
        cursor: pointer;
        position: relative;
      }
      svg {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
        user-select: none;
      }
      .dog {
        transform-box: view-box;
        transform-origin: 413px 1100px;
      }
      .me {
        transform-box: view-box;
        transform-origin: 1000px 1000px;
      }
      .jaw,
      .mouth {
        transform-box: view-box;
        transition: transform 160ms ease-in;
      }
      .mouth {
        transform-origin: 400px 652px;
        transform: scaleY(0);
      }
      .is-barking .jaw {
        transform: translateY(46px);
        transition: transform 140ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .is-barking .mouth {
        transform: scaleY(1);
        transition: transform 140ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .is-wiggling .dog {
        animation: wiggle 700ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .is-wiggling .me {
        animation: smooch 600ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .heart {
        position: absolute;
        left: 42%;
        top: 46%;
        font-size: 22px;
        line-height: 1;
        color: #ff4f7b;
        opacity: 0;
        pointer-events: none;
      }
      .is-barking .heart {
        animation: float 1100ms ease-out forwards;
      }
      .is-barking .heart:nth-of-type(2) { animation-delay: 120ms; --drift: -26px; }
      .is-barking .heart:nth-of-type(3) { animation-delay: 240ms; --drift: 18px; }
      .bark {
        position: absolute;
        top: 4%;
        left: -6%;
        padding: 4px 10px;
        border-radius: 999px;
        background: #1d1a4a;
        color: #fff;
        font: 600 16px/1.2 "Faculty Glyphic", sans-serif;
        opacity: 0;
        transform: translateY(6px) rotate(-8deg);
        pointer-events: none;
      }
      .is-barking .bark {
        animation: bark 900ms ease-out;
      }
      @keyframes wiggle {
        0% { transform: rotate(0) scale(1); }
        20% { transform: rotate(-7deg) scale(1.04, 0.96); }
        45% { transform: rotate(6deg) scale(0.98, 1.03); }
        70% { transform: rotate(-3deg); }
        100% { transform: rotate(0) scale(1); }
      }
      @keyframes bark {
        0% { opacity: 0; transform: translateY(6px) rotate(-8deg); }
        20% { opacity: 1; transform: translateY(0) rotate(-8deg); }
        75% { opacity: 1; }
        100% { opacity: 0; transform: translateY(-8px) rotate(-8deg); }
      }
      @keyframes smooch {
        0% { transform: translate(0, 0) rotate(0); }
        35% { transform: translate(-22px, 6px) rotate(-4deg); }
        100% { transform: translate(0, 0) rotate(0); }
      }
      @keyframes float {
        0% { opacity: 0; transform: translate(0, 0) scale(0.6); }
        20% { opacity: 1; }
        100% { opacity: 0; transform: translate(var(--drift, 4px), -70px) scale(1.2); }
      }
      @media (prefers-reduced-motion: reduce) {
        .is-wiggling .dog,
        .is-wiggling .me { animation: none; }
      }
    `;

    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", "Oleksandra kissing a griffon dog in a sweater. Click for a smooch.");
    // The lower jaw is cut out of the photo along the line above the teeth and dropped to open the mouth.
    button.innerHTML = `
      <svg viewBox="0 0 1390 1219" aria-hidden="true">
        <defs>
          <clipPath id="jaw-shape">
            <path d="M290 668 L320 650 L400 644 L470 650 L500 668 L560 720 L610 800 L600 900 L500 975 L400 985 L300 960 L230 880 L220 780 L250 710 Z" />
          </clipPath>
          <radialGradient id="mouth-inside" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#1a0407" />
            <stop offset="100%" stop-color="#5c1c24" />
          </radialGradient>
          <filter id="mouth-soften">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <g class="dog">
        <image href="${griffonUrl}" width="827" height="1219" />
        <g class="mouth" filter="url(#mouth-soften)">
          <path d="M318 662 Q400 636 484 662 Q480 712 400 716 Q320 712 318 662 Z" fill="url(#mouth-inside)" />
          <ellipse cx="408" cy="702" rx="44" ry="14" fill="#c95a68" />
        </g>
        <g class="jaw">
          <image href="${griffonUrl}" width="827" height="1219" clip-path="url(#jaw-shape)" />
        </g>
        </g>
        <g class="me">
          <image href="${kissUrl}" x="581" y="131" width="800" height="873" />
        </g>
      </svg>
      <span class="heart">♥</span><span class="heart">♥</span><span class="heart">♥</span>
      <span class="bark">woof!</span>
    `;
    root.append(style, button);

    let closeTimer;
    button.addEventListener("click", () => {
      button.classList.remove("is-wiggling");
      void button.getBoundingClientRect();
      button.classList.add("is-wiggling", "is-barking");
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => button.classList.remove("is-barking"), 1400);
    });
    button.querySelector(".dog").addEventListener("animationend", () => button.classList.remove("is-wiggling"));
  },
};
