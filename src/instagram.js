import { Logger } from "sass";
import { addOverlay } from "./overlay";
import {
  addStyle,
  changeBtnText,
  insertAfter,
  listenCb,
  log,
  onPageChange,
  timer,
} from "./utils";

let unlistenCb = null;
let hasShareButton = false;

const getShareButton = () => {
  return Array.from(document.querySelectorAll('div[role="dialog"] button'))
    .filter((el) => el.innerText.startsWith("Share"))
    .pop();
};

const run = async () => {
  setInterval(async () => {
    const btn = getShareButton();

    if (btn && !hasShareButton) {
      hasShareButton = true;

      unlistenCb = await runInlineChecker();
    } else if (!btn && hasShareButton) {
      hasShareButton = false;

      unlistenCb &&
        Array.isArray(unlistenCb) &&
        unlistenCb.forEach((cb) => cb());
    }
  }, 1000);
};

const runInlineChecker = (retry = 0) => {
  return new Promise((resolve) => {
    try {
      // Actual BTN element
      const btn = getShareButton();

      addStyle(`
      @import url('https://fonts.googleapis.com/css2?family=Silkscreen&display=swap');
    [data-custombutton='true'] {
      position: absolute !important;
      pointer-events: none;
      visibility: hidden;
    }
  `);

      // Clones the button styles but functionally dead
      const clonedBtn = btn.cloneNode(true);

      // Changes the new cloned button to something
      changeBtnText(clonedBtn, "Don't share");

      // Adds a data attr because it will persist
      btn.dataset["custombutton"] = "true";

      insertAfter(clonedBtn, btn);

      const remove = { overlay: null };
      listenCb(clonedBtn, "click", () => {
        remove.overlay = addOverlay(() => {
          btn.click();
          remove.overlay();
        });
      });

      const unlisten = [
        listenCb(document, "keydown", (e) => {
          if (e.key === "Escape") {
            log("ok?", remove);
            remove.overlay && remove.overlay();
          }
        }),
      ];

      resolve(unlisten);

      // btn.innerText = "Never tweet";
    } catch (e) {
      log(e);
    }
  });
};

(async () => {
  run();
})();
