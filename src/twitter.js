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

const getTweetButton = () => {
  return document.querySelector('div[data-testid="tweetButtonInline"]');
};

const getTweetInput = () => {
  return document.querySelector("[aria-label='Tweet text']");
};

const run = async () => {
  unlistenCb && Array.isArray(unlistenCb) && unlistenCb.forEach((cb) => cb());
  unlistenCb = await runInlineChecker();
};

const runInlineChecker = (retry = 0) => {
  return new Promise((resolve) => {
    try {
      // Actual BTN element
      const btn = getTweetButton();

      // Stopper to not take up process
      if (retry > 5) {
        resolve([() => {}]);
        return;
      }

      // If button isnt present, it could be that the page isnt loaded because of AJAX etc.
      if (!btn) {
        timer(1000)
          .then(() => {
            return runInlineChecker(retry + 1);
          })
          .then(resolve);
        return;
      }

      addStyle(`
      @import url('https://fonts.googleapis.com/css2?family=Silkscreen&display=swap');
    .social-anxiety-focus {
      opacity: 1;
      cursor: pointer;
    }
    .social-anxiety-error {
      background-color: rgb(244, 33, 46);
      opacity: 0.5;
    }

    [data-tweetbutton='true'] {
      position: absolute;
      visibility: hidden;
    }
  `);
      // Gets the contenteditable box on twitter
      const tweetInput = getTweetInput();

      // Clones the button styles but functionally dead
      const clonedBtn = btn.cloneNode(true);

      // Changes the new cloned button to something
      changeBtnText(clonedBtn, "Don't tweet");

      // Adds a data attr because it will persist
      btn.dataset["tweetbutton"] = "true";

      // Having a set interval to overcome some weirdness with the input event on the contenteditable box
      let updater = -1;
      const onUpdate = () => {
        clonedBtn.classList.toggle(
          "social-anxiety-focus",
          tweetInput.textContent !== ""
        );
        clonedBtn.classList.toggle(
          "social-anxiety-error",
          tweetInput.textContent.length >= 280
        );
      };

      insertAfter(clonedBtn, btn);

      const remove = { overlay: null };

      const unlisten = [
        listenCb(tweetInput, "focus", (e) => {
          log("focus");
          updater = setInterval(onUpdate);
        }),
        listenCb(tweetInput, "blur", (e) => {
          log("blur");
          clearInterval(updater);
        }),
        listenCb(clonedBtn, "click", () => {
          remove.overlay = addOverlay(() => {
            btn.click();
            remove.overlay();
          });
        }),
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
  unlistenCb = await runInlineChecker();

  onPageChange(run);
})();
