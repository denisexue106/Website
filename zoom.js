/* Tap to enlarge, for phones and small tablets (2026-11-13). On a phone a desktop screenshot is
   about a third of its real size, so its text can't be read. Each screenshot, diagram and phone
   screen gets a small enlarge button; tapping it or the picture opens it at the size it has on a
   desktop, centered on the spot that was tapped, to drag around. The close button, Escape, a tap
   on the dark area or the phone's back button closes it. Wider screens keep the pictures as they
   are. */
(function () {
  var NARROW = window.matchMedia("(max-width: 860px)");
  var main = document.querySelector("main");
  if (!main || !window.HTMLDialogElement) return;

  var imgs = [].slice.call(main.querySelectorAll(".screen-win img, .hero-cover img, .phone img, .pan img, .ba img, .shot img"))
    .filter(function (img, i, all) {
      return all.indexOf(img) === i && !img.closest("a, .more-thumb, [aria-hidden='true']") &&
        (+img.getAttribute("width") || 0) >= 300;
    });
  if (!imgs.length) return;

  var ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>';

  /* the viewer */
  var dlg = document.createElement("dialog");
  dlg.className = "zoom";
  dlg.setAttribute("aria-label", "Enlarged picture");
  dlg.tabIndex = -1;
  dlg.innerHTML = '<div class="zoom-pane"></div>' +
    '<button class="zoom-close" type="button" aria-label="Close the enlarged picture"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
    '<p class="zoom-hint">Drag to look around</p>';
  document.body.appendChild(dlg);
  // the enlarged picture joins the viewer only while it's open, so the page never holds an image with no source
  var pane = dlg.querySelector(".zoom-pane"), big = document.createElement("img"), pushed = false, opener = null;
  big.className = "zoom-img";
  big.alt = "";

  function open(img, fx, fy) {
    opener = document.activeElement;
    var w = +img.getAttribute("width") || img.naturalWidth || 1000;
    var h = +img.getAttribute("height") || img.naturalHeight || 700;
    var vw = document.documentElement.clientWidth;
    // a desktop picture opens at the size it has on a desktop (up to 1200px wide) to drag around;
    // a phone screen opens at about the size of a real phone, which is already readable
    var tw = img.closest(".phone") ? Math.min(vw - 40, 430) : Math.min(w, 1200);
    if (tw < vw - 40) tw = Math.min(w, vw - 40);
    big.src = img.currentSrc || img.src;
    big.alt = img.alt || "";
    big.style.width = tw + "px";
    big.style.height = Math.round(tw * h / w) + "px";
    pane.appendChild(big);
    dlg.classList.toggle("fits", tw <= vw - 40);
    document.documentElement.classList.add("zoom-open");
    dlg.showModal();
    try { history.pushState({ dbxZoom: 1 }, ""); pushed = true; } catch (e) { pushed = false; }
    // center the tapped spot
    var x = big.offsetLeft + fx * tw - pane.clientWidth / 2;
    var y = big.offsetTop + fy * (tw * h / w) - pane.clientHeight / 2;
    pane.scrollLeft = Math.max(0, x);
    pane.scrollTop = Math.max(0, y);
    // focus the viewer itself: screen readers hear its name, and a tap shows no focus ring
    dlg.focus({ preventScroll: true });
  }

  function shut(fromHistory) {
    if (!dlg.open) return;
    dlg.close();
    document.documentElement.classList.remove("zoom-open");
    big.remove();
    big.removeAttribute("src");
    if (pushed && !fromHistory) { pushed = false; history.back(); }
    pushed = false;
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  }

  dlg.querySelector(".zoom-close").addEventListener("click", function () { shut(false); });
  dlg.addEventListener("cancel", function (e) { e.preventDefault(); shut(false); });
  pane.addEventListener("click", function (e) { if (e.target === pane) shut(false); });
  window.addEventListener("popstate", function () { if (dlg.open) { pushed = false; shut(true); } });

  /* a button on each picture, and the picture itself */
  imgs.forEach(function (img) {
    var frame = img.closest(".pan") ? img.closest(".pan").parentElement : (img.closest(".screen-win, .hero-cover, .phone") || img.parentElement);
    if (getComputedStyle(frame).position === "static") frame.classList.add("zoom-frame");
    var b = document.createElement("button");
    b.type = "button";
    b.className = "zoom-btn";
    b.innerHTML = ICON;
    b.setAttribute("aria-label", "Enlarge this picture");
    frame.appendChild(b);
    b.addEventListener("click", function () { open(img, 0.5, 0.35); });
    img.addEventListener("click", function (e) {
      if (!NARROW.matches) return;
      var r = img.getBoundingClientRect();
      open(img, Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)));
    });
    img.classList.add("zoomable");
  });
})();
