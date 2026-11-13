/* The case studies sit behind a soft password gate. The password is printed under the box on purpose:
   the gate marks the work as confidential and keeps these pages out of search results, without
   slowing a hiring manager down. One unlock opens all three case studies on that browser. */
(function () {
  var root = document.documentElement, gate = document.getElementById("gate");
  if (!gate) return;
  if (!root.classList.contains("gated")) { gate.remove(); return; }
  var PASSWORD = "design", KEY = "dbx-case-open";
  var form = gate.querySelector("form"), input = document.getElementById("gate-pw"), err = document.getElementById("gate-err");
  input.focus({ preventScroll: true });
  input.addEventListener("input", function () { err.textContent = ""; });
  /* ONE TAP 45 */
  /* The password under the box is a button: one tap fills it in and opens the case study, so
     nobody has to type it on a phone (2026-11-13). The box shows Go on a phone keyboard. */
  input.setAttribute("enterkeyhint", "go");
  var shown = gate.querySelector(".gate-note strong");
  if (shown) {
    var fill = document.createElement("button");
    fill.type = "button";
    fill.className = "gate-fill";
    fill.textContent = shown.textContent;
    fill.setAttribute("aria-label", "Use the password " + shown.textContent + " and open the case study");
    shown.replaceWith(fill);
    fill.addEventListener("click", function () {
      input.value = PASSWORD;
      if (form.requestSubmit) form.requestSubmit();
      else form.dispatchEvent(new Event("submit", { cancelable: true }));
    });
  }
  /* END ONE TAP 45 */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (input.value.trim().toLowerCase() !== PASSWORD) {
      err.textContent = "That isn\u2019t the password. It\u2019s shown below.";
      input.select();
      return;
    }
    try { localStorage.setItem(KEY, "1"); } catch (x) {}
    root.classList.remove("gated");
    gate.remove();
    var target = location.hash && document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView();
    var h = document.querySelector(".case-hero h1");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  });
})();
