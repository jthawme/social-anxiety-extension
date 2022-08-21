import {
  addStyle,
  clamp,
  listenCb,
  log,
  mapRange,
  tickUpdate,
  Vector,
} from "./utils";

let THRESHOLD = 100;

export const addOverlay = (onSubmit) => {
  // const link = document.createElement("link");
  // link.rel = `stylesheet`;
  // link.href = `https://fonts.googleapis.com/css2?family=Silkscreen&display=swap`;
  // link.id = `social-anxiety-font`;

  // document.head.appendChild(link);

  addStyle(
    `
.social-anxiety-overlay {
  position: fixed;

  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  background-color: rgba(255,255,255,0.25);
  backdrop-filter: blur(10px);

  z-index: 99999;

  display: flex;

  align-items: center;
  justify-content: center;
}
  
.social-anxiety-submit-btn {
  background-color: red;
  color: white;

  padding: 0.5em 1em;
  margin: 0;

  border: none;
  cursor: pointer;

  position: absolute;
  
  top: 50vh;
  left: 50vw;
  transform: translate3d(-50%, -50%, 0);

  font-weight: bold;
  text-transform: uppercase;
  font-size: 21px;

  white-space: pre;

  filter: saturate(var(--percentage, 0));
}
.social-anxiety-submit-btn.active {
  background-color: blue;
}

.social-anxiety-text {
  font-family: sans-serif;
  font-weight: bold;
  font-size: 6vw;
  text-align: justify;
  line-height: 0.9;
  text-transform: uppercase;
  padding: 20px;
}
`,
    "social-anxiety-overlay-css"
  );

  const el = document.createElement("div");
  el.classList.add("social-anxiety-overlay");

  el.innerHTML = `<span class="social-anxiety-text">Like the hunter gatherers of old, if you want it bad enough, you have to earn&nbsp;it.</span>`;

  const submitBtn = document.createElement("button");
  submitBtn.classList.add("social-anxiety-submit-btn");
  submitBtn.innerText = "wear me down";

  listenCb(submitBtn, "click", onSubmit);

  el.appendChild(submitBtn);

  document.body.appendChild(el);

  const mouse = new Vector({
    x: 0,
    y: 0,
  });

  const dimensions = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const btnPosition = new Vector({
    x: dimensions.width / 2,
    y: dimensions.height / 2,
  });

  const onMouseMove = (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    if (THRESHOLD <= 0) {
      return;
    }

    const { left, top, width, height } = submitBtn.getBoundingClientRect();

    const distance = btnPosition.distance(mouse);

    if (distance < THRESHOLD + width * 0.25) {
      const { x: newX, y: newY } = btnPosition.getPointWithAngle(
        mouse,
        (THRESHOLD + width * 0.5) / 2
      );
      btnPosition.x = newX + btnPosition.x;
      btnPosition.y = newY + btnPosition.y;

      if (btnPosition.x < 0) {
        btnPosition.x = dimensions.width - width;
      } else if (btnPosition.x >= dimensions.width) {
        btnPosition.x = width;
      }

      if (btnPosition.y < 0) {
        btnPosition.y = dimensions.height - height;
      } else if (btnPosition.y >= dimensions.height) {
        btnPosition.y = height;
      }

      THRESHOLD = clamp(THRESHOLD - 2, 0, 100);
      submitBtn.style.setProperty(
        "--percentage",
        mapRange(THRESHOLD, 100, 0, 0, 1)
      );
      submitBtn.innerText = THRESHOLD <= 0 ? "Post Away" : "Wear me down";
      submitBtn.classList.toggle("active", THRESHOLD <= 0);
    }

    // console.log(btnPosition);

    submitBtn.style.left = `${btnPosition.x}px`;
    submitBtn.style.top = `${btnPosition.y}px`;

    // submitBtn.style.left = `${clamp(btnPosition.x, 0, dimensions.width)}px`;
    // submitBtn.style.top = `${clamp(btnPosition.y, 0, dimensions.height)}px`;
  };

  listenCb(el, "mousemove", tickUpdate(onMouseMove));
  listenCb(
    window,
    "resize",
    tickUpdate(() => {
      dimensions.width = window.innerWidth;
      dimensions.height = window.innerHeight;
    })
  );

  return () => {
    el.parentElement.removeChild(el);
  };
};
