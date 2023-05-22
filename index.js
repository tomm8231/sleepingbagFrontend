import "https://unpkg.com/navigo"; //Will create the global Navigo object used below
import "https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js";

import {
  setActiveLink,
  adjustForMissingHash,
  renderTemplate,
  loadTemplate,
} from "./utils.js";

import { initSleepingBags } from "./pages/sleeping-bags/sleeping-bags.js";

window.addEventListener("load", async () => {
  const templateSleepingBags = await loadTemplate(
    "./pages/sleeping-bags/sleeping-bags.html"
  );

  const templateNotFound = await loadTemplate("./pages/notFound/notFound.html");

  adjustForMissingHash();

  const router = new Navigo("/", { hash: true });
  //Not especially nice, BUT MEANT to simplify things. Make the router global so it can be accessed from all js-files
  window.router = router;

  router
    .hooks({
      before(done, match) {
        setActiveLink("menu", match.url);
        done();
      },
    })
    .on({
      "/": () =>
        (document.getElementById("content").innerHTML = `<h2>Soveposevælger</h2>
      <p style='margin-top:2em'>
      For at få hjælp til at vælge rigtig sovepose, tryk på Find sovepose øverst i menuen
      </p>
     `),
      "/sleeping-bags": () => {
        console.log(templateSleepingBags);
        renderTemplate(templateSleepingBags, "content");
        initSleepingBags();
      },
    })
    .notFound(() => {
      renderTemplate(templateNotFound, "content");
    })
    .resolve();
});

window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
  alert(
    "Error: " +
      errorMsg +
      " Script: " +
      url +
      " Line: " +
      lineNumber +
      " Column: " +
      column +
      " StackTrace: " +
      errorObj
  );
};
