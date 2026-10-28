const SVG = "http://www.w3.org/2000/svg";

const createSvg = (name, attributes = {}) => {
  const element = document.createElementNS(SVG, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
};

const pointX = (index) => (index < 6 ? 17 + index * 35 : 253 + (index - 6) * 35);

const addChecker = (svg, x, y, fill, stroke) => {
  const checker = createSvg("g");
  checker.append(
    createSvg("circle", { cx: x, cy: y, r: 13, fill, stroke, "stroke-width": 2 }),
    createSvg("circle", { cx: x - 2, cy: y - 2, r: 8.5, fill: "none", stroke, "stroke-width": 1, opacity: 0.55 }),
  );
  svg.append(checker);
};

const addStack = (svg, index, count, side, fill, stroke) => {
  const x = pointX(index) + 17.5;
  Array.from({ length: count }, (_, stackIndex) => {
    const y = side === "top" ? 31 + stackIndex * 19 : 239 - stackIndex * 19;
    addChecker(svg, x, y, fill, stroke);
  });
};

const pipLocations = {
  1: [[2, 2]],
  2: [[1, 1], [3, 3]],
  3: [[1, 1], [2, 2], [3, 3]],
  4: [[1, 1], [1, 3], [3, 1], [3, 3]],
  5: [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]],
  6: [[1, 1], [1, 3], [2, 1], [2, 3], [3, 1], [3, 3]],
};

export default {
  student: "Codex",
  title: "Backgammon break",
  width: 430,
  height: 320,
  rotate: -2,
  mount(root) {
    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
        height: 100%;
      }
      .game {
        display: grid;
        grid-template-rows: minmax(0, 1fr) auto;
        height: 100%;
        overflow: hidden;
        background: #f7efd9;
        color: #241d17;
        font-family: "IBM Plex Mono", monospace;
      }
      svg {
        display: block;
        width: 100%;
        height: 100%;
        min-height: 0;
      }
      .dice-tray {
        display: flex;
        gap: 1rem;
        align-items: center;
        justify-content: flex-end;
        min-height: 4.3rem;
        padding: 0.65rem 0.85rem;
        border-top: 1px solid #825228;
        background: #ecd9a6;
      }
      .board-die {
        transform-box: fill-box;
        transform-origin: center;
      }
      .board-die.is-rolling {
        animation: board-roll 720ms cubic-bezier(0.17, 0.87, 0.32, 1.2) both;
      }
      .board-die .die-face {
        fill: #e49a45;
        stroke: #825228;
        stroke-width: 1.5;
      }
      .board-die.is-mint .die-face { fill: #99c5c0; }
      .board-die .die-highlight {
        fill: none;
        stroke: #fff1bf;
        stroke-width: 1.2;
        opacity: 0.8;
      }
      .board-die .board-pip { fill: #171a17; }
      .board-die.is-mint .die-highlight { stroke: #e9fffa; }
      button {
        padding: 0.5rem 0.65rem;
        border: 1px solid #241d17;
        border-radius: 999px;
        background: #183f42;
        color: #fff6df;
        font: inherit;
        font-size: 0.66rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        cursor: pointer;
        transition: transform 160ms ease, background-color 160ms ease;
      }
      button:hover { background: #d55b25; }
      button:active { transform: translateY(1px) rotate(-2deg); }
      button:focus-visible { outline: 2px solid #241d17; outline-offset: 3px; }
      output {
        min-width: 5.7rem;
        font-size: 0.64rem;
        line-height: 1.3;
        text-align: right;
      }
      @keyframes board-roll {
        0% { transform: translate(var(--toss-x), var(--toss-y)) rotate(-250deg) scale(0.48); }
        58% { transform: translate(8px, -7px) rotate(105deg) scale(1.1); }
        78% { transform: translate(-3px, 3px) rotate(-18deg) scale(0.96); }
        100% { transform: translate(0, 0) rotate(0) scale(1); }
      }
      @media (prefers-reduced-motion: reduce) {
        .board-die.is-rolling { animation: none; }
        button { transition: none; }
      }
    `;

    const game = document.createElement("section");
    game.className = "game";
    game.innerHTML = `
      <svg viewBox="0 0 480 260" role="img" aria-label="A backgammon board with checkers in play"></svg>
      <div class="dice-tray">
        <button type="button">Roll dice</button>
        <output aria-live="polite">Your turn.<br>Roll the dice.</output>
      </div>
    `;

    const board = game.querySelector("svg");
    board.append(
      createSvg("rect", { x: 5, y: 5, width: 470, height: 250, rx: 3, fill: "#8e5628" }),
      createSvg("rect", { x: 14, y: 14, width: 452, height: 232, fill: "#f7efd9", stroke: "#d3b270", "stroke-width": 2 }),
      createSvg("rect", { x: 228, y: 14, width: 24, height: 232, fill: "#d3b270", stroke: "#8e5628", "stroke-width": 2 }),
    );

    const pointColors = ["#153f43", "#d65825", "#78a9a7", "#9b622d", "#153f43", "#e17d34"];
    Array.from({ length: 12 }, (_, index) => {
      const x = pointX(index);
      const color = pointColors[index % pointColors.length];
      board.append(
        createSvg("path", { d: `M ${x} 16 H ${x + 35} L ${x + 17.5} 113 Z`, fill: color }),
        createSvg("path", { d: `M ${x} 244 H ${x + 35} L ${x + 17.5} 147 Z`, fill: pointColors[(index + 3) % pointColors.length] }),
      );
    });

    // A classic opening arrangement, reduced to the stacks that read clearly at widget scale.
    addStack(board, 0, 2, "top", "#f7efd9", "#aa783b");
    addStack(board, 4, 3, "top", "#153f43", "#0d2d30");
    addStack(board, 7, 5, "top", "#153f43", "#0d2d30");
    addStack(board, 11, 5, "top", "#f7efd9", "#aa783b");
    addStack(board, 0, 5, "bottom", "#153f43", "#0d2d30");
    addStack(board, 5, 5, "bottom", "#153f43", "#0d2d30");
    addStack(board, 6, 3, "bottom", "#f7efd9", "#aa783b");
    addStack(board, 10, 2, "bottom", "#f7efd9", "#aa783b");

    const diceLayer = createSvg("g", { "aria-hidden": "true" });
    board.append(diceLayer);
    const output = game.querySelector("output");
    const button = game.querySelector("button");
    const throwSpots = [
      { x: 194, y: 129, tossX: -102, tossY: -64 },
      { x: 278, y: 132, tossX: 102, tossY: -76 },
    ];
    const makeDie = (value, index) => {
      const spot = throwSpots[index];
      const position = createSvg("g", { transform: `translate(${spot.x} ${spot.y})` });
      const die = createSvg("g", { class: `board-die is-rolling${index === 1 ? " is-mint" : ""}` });
      die.style.setProperty("--toss-x", `${spot.tossX}px`);
      die.style.setProperty("--toss-y", `${spot.tossY}px`);
      die.append(
        createSvg("rect", { class: "die-face", x: -15, y: -15, width: 30, height: 30, rx: 5 }),
        createSvg("rect", { class: "die-highlight", x: -11.5, y: -11.5, width: 23, height: 23, rx: 3.5 }),
      );
      pipLocations[value].forEach(([row, column]) => {
        die.append(createSvg("circle", {
          class: "board-pip",
          cx: -7 + (column - 1) * 7,
          cy: -7 + (row - 1) * 7,
          r: 2.5,
        }));
      });
      position.append(die);
      return position;
    };
    const rollDice = () => {
      const values = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
      diceLayer.replaceChildren(...values.map(makeDie));
      output.innerHTML = values[0] === values[1]
        ? `Doubles: ${values[0]} + ${values[1]}<br>Make a move.`
        : `You rolled ${values[0]} + ${values[1]}.<br>Make a move.`;
    };

    button.addEventListener("click", rollDice);
    root.append(style, game);
  },
};
