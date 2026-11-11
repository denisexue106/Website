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
