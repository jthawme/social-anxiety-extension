export const listenCb = (el, evtType, cb, opts = {}) => {
  el.addEventListener(evtType, cb, opts);

  return () => {
    el.removeEventListener(evtType, cb);
  };
};

export const changeBtnText = (el, text) => {
  let targetEl = el;

  let kill = 0;

  while (targetEl.childNodes[0].nodeType !== Node.TEXT_NODE && kill < 10) {
    const textNode = [...targetEl.childNodes].find((node) => {
      return node.nodeType === Node.TEXT_NODE;
    });

    if (!textNode) {
      targetEl = targetEl.childNodes[0];
    }

    kill++;
  }

  targetEl.childNodes[0].textContent = text;
};

export const insertAfter = (newNode, existingNode) => {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
};

export const addStyle = (css, id = "social-anxiety-css") => {
  const head = document.head || document.getElementsByTagName("head")[0];
  let style = document.getElementById(id);

  if (!style) {
    style = document.createElement("style");
    style.id = id;
    style.type = "text/css";
    head.appendChild(style);
  }

  if (style.styleSheet) {
    // This is required for IE8 and below.
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }
    style.appendChild(document.createTextNode(css));
  }
};

export const log = (...args) => {
  console.log(`[SOCIAL ANXIETY]`, ...args);
};

export const onPageChange = (cb) => {
  let oldHref = document.location.href;
  let bodyList = document.querySelector("title");

  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (oldHref != document.location.href) {
        oldHref = document.location.href;
        cb(oldHref);
      }
    });
  });

  const config = {
    childList: true,
    subtree: true,
  };

  observer.observe(bodyList, config);
};

export const timer = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

export const tickUpdate = (cb) => {
  let ticking = false;

  const update = (e) => {
    cb(e);
    ticking = false;
  };

  const requestTick = (e) => {
    if (!ticking) {
      requestAnimationFrame(() => update(e));
      ticking = true;
    }
  };

  return requestTick;
};

export const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max);
};

export const mapRange = (value, x1, y1, x2, y2) =>
  ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;

export class Vector {
  constructor({ x, y }) {
    this._x = x;
    this._y = y;
  }

  distance({ x, y }) {
    const a = this.x - x;
    const b = this.y - y;

    return Math.sqrt(a * a + b * b);
  }

  set x(val) {
    this._x = val;
  }

  set y(val) {
    this._y = val;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  getAngle({ x, y }) {
    return Math.atan2(this.y - y, this.x - x);
  }

  getPointWithAngle({ x, y }, radius) {
    const angle = this.getAngle({ x, y });

    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  }
}
