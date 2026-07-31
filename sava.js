/* ============================================================================
   SAVA — external JS bundle
   Hosted: https://cdn.jsdelivr.net/gh/friendincommerce/sava-cdn@main/sava.js
   Loaded from Webflow Site Settings → Head + carried into Shopify theme.liquid
   ============================================================================ */


/* ============================================================
   SAVA — shared GSAP animation library
   ============================================================ */
(function() {
  function init() {
	if (typeof gsap === 'undefined') return;

	var D = {
	  'fade-up':         { y: 20, opacity: 0, duration: 0.7, ease: 'expo.out' },
	  'scale-down':      { scale: 1.05, duration: 0.7, ease: 'expo.out' },
	  'stagger-fade-up': { y: 20, opacity: 0, duration: 0.7, ease: 'expo.out', stagger: 0.2 },
	  'hover-scale':     { scale: 1.05, duration: 0.4, ease: 'power2.out', exitEase: 'power2.inOut' },
	  'hover-rotate':    { rotation: 45, duration: 0.4, ease: 'power2.out', exitEase: 'power2.inOut' },
	  'hover-lift':      { y: -6, duration: 0.4, ease: 'power2.out', exitEase: 'power2.inOut' }
	};

	function readNum(el, attr, fallback) {
	  var v = el.dataset[attr];
	  return v != null && v !== '' ? parseFloat(v) : fallback;
	}

	document.querySelectorAll('[data-sava-animate="fade-up"], [data-sava-animate="scale-down"]').forEach(function(el) {
	  var anim = el.dataset.savaAnimate;
	  var on = el.dataset.savaOn || 'scroll';
	  var base = D[anim];
	  var duration = readNum(el, 'savaDuration', base.duration);
	  var delay = readNum(el, 'savaDelay', 0);
	  var ease = el.dataset.savaEase || base.ease;
	  var fromVars = anim === 'scale-down' ? { scale: base.scale } : { y: base.y, opacity: 0 };
	  var toVars = anim === 'scale-down'
		? { scale: 1, duration: duration, ease: ease, delay: delay }
		: { y: 0, opacity: 1, duration: duration, ease: ease, delay: delay };
	  gsap.set(el, fromVars);
	  if (on === 'load') {
		gsap.to(el, toVars);
	  } else {
		var io = new IntersectionObserver(function(entries, obs) {
		  entries.forEach(function(e) {
			if (e.isIntersecting) { gsap.to(el, toVars); obs.unobserve(e.target); }
		  });
		}, { threshold: 0.1 });
		io.observe(el);
	  }
	});

	document.querySelectorAll('[data-sava-stagger]').forEach(function(group) {
	  var interval = parseFloat(group.dataset.savaStagger) || 0.2;
	  var kids = Array.prototype.slice.call(group.children);
	  gsap.set(kids, { y: 20, opacity: 0 });
	  var io = new IntersectionObserver(function(entries, obs) {
		entries.forEach(function(e) {
		  if (e.isIntersecting) {
			gsap.to(kids, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: interval });
			obs.unobserve(e.target);
		  }
		});
	  }, { threshold: 0.1 });
	  io.observe(group);
	});

	document.querySelectorAll('[data-sava-animate^="hover-"]').forEach(function(el) {
	  var anim = el.dataset.savaAnimate;
	  var base = D[anim] || {};
	  var duration = readNum(el, 'savaDuration', base.duration || 0.4);
	  var enterEase = el.dataset.savaEase || base.ease || 'power2.out';
	  var exitEase = el.dataset.savaExitEase || base.exitEase || 'power2.inOut';
	  var triggerSel = el.dataset.savaTriggerOn;
	  var trigger = triggerSel ? el.closest(triggerSel) : el;
	  if (!trigger) return;

	  var toVars = {};
	  if (anim === 'hover-scale')  toVars.scale = readNum(el, 'savaScale', base.scale);
	  if (anim === 'hover-rotate') { toVars.rotation = readNum(el, 'savaRotation', base.rotation); toVars.transformOrigin = '50% 50%'; }
	  if (anim === 'hover-lift')   toVars.y = readNum(el, 'savaY', base.y);
	  toVars.duration = duration;
	  toVars.ease = enterEase;

	  var resetVars = { duration: duration, ease: exitEase };
	  if ('scale' in toVars)    resetVars.scale = 1;
	  if ('rotation' in toVars) resetVars.rotation = 0;
	  if ('y' in toVars)        resetVars.y = 0;

	  gsap.set(el, { scale: 1, rotation: 0, y: 0 });
	  trigger.addEventListener('mouseenter', function() { gsap.to(el, toVars); });
	  trigger.addEventListener('mouseleave', function() { gsap.to(el, resetVars); });
	});
  }

  if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
  } else {
	init();
  }
})();


/* ============================================================
   SAVA — generalized carousel prev/next scroll
   ============================================================ */
(function() {
  var CAROUSELS = [
	{ prev: 'data-sava-shop-by-benefit-prev', next: 'data-sava-shop-by-benefit-next', grid: '.sava-shop-by-benefit_grid' },
	{ prev: 'data-sava-claims-prev',          next: 'data-sava-claims-next',          grid: '.sava-ingredients-callouts_claims' },
	{ prev: 'data-sava-ingredients-prev',     next: 'data-sava-ingredients-next',     grid: '.sava-ingredients-callouts_ingredients-grid' },
	{ prev: 'data-sava-trusted-prev',         next: 'data-sava-trusted-next',         grid: '.sv-trusted_track' }
  ];

  function bindCarousel(prevAttr, nextAttr, gridSelector) {
	document.querySelectorAll('[' + prevAttr + '], [' + nextAttr + ']').forEach(function(btn) {
	  btn.addEventListener('click', function() {
		var section = btn.closest('section');
		if (!section) return;
		var grid = section.querySelector(gridSelector);
		if (!grid) return;
		var card = grid.children[0];
		if (!card) return;
		var gap = parseInt(getComputedStyle(grid).columnGap || '16', 10) || 0;
		var step = card.offsetWidth + gap;
		var dir = btn.hasAttribute(prevAttr) ? -1 : 1;
		grid.scrollBy({ left: step * dir, behavior: 'smooth' });
	  });
	});
  }

  function init() {
	CAROUSELS.forEach(function(c) { bindCarousel(c.prev, c.next, c.grid); });
  }

  if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
  } else {
	init();
  }
})();


/* ============================================================
   SAVA — modal open/close controller (move to body to escape
   transformed-ancestor containing-block, one open at a time)
   ============================================================ */
(function() {
  var currentModal = null;

  function openModal(modal) {
	if (currentModal && currentModal !== modal) closeModal(currentModal);
	modal.__savaOrigParent = modal.parentNode;
	modal.__savaOrigNext = modal.nextSibling;
	document.body.appendChild(modal);
	modal.classList.add('is-open');
	document.body.style.overflow = 'hidden';
	currentModal = modal;
  }

  function closeModal(modal) {
	modal.classList.remove('is-open');
	document.body.style.overflow = '';
	if (modal.__savaOrigParent) {
	  modal.__savaOrigParent.insertBefore(modal, modal.__savaOrigNext);
	  delete modal.__savaOrigParent;
	  delete modal.__savaOrigNext;
	}
	if (currentModal === modal) currentModal = null;
  }

  function init() {
	document.querySelectorAll('[data-sava-modal-open]').forEach(function(btn) {
	  btn.addEventListener('click', function() {
		var wrap = btn.closest('[data-sava-modal-wrap]');
		if (!wrap) return;
		var modal = wrap.querySelector('[data-sava-modal]');
		if (modal) openModal(modal);
	  });
	});

	document.addEventListener('click', function(e) {
	  if (e.target.matches && e.target.matches('[data-sava-modal]')) {
		closeModal(e.target);
	  }
	});

	document.querySelectorAll('[data-sava-modal-close]').forEach(function(btn) {
	  btn.addEventListener('click', function() {
		var modal = btn.closest('[data-sava-modal]');
		if (modal) closeModal(modal);
	  });
	});

	document.addEventListener('keydown', function(e) {
	  if (e.key === 'Escape' && currentModal) closeModal(currentModal);
	});
  }

  if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
  } else {
	init();
  }
})();


/* ============================================================
   SAVA — Footer accordion (mobile only, ≤767px)
   ============================================================ */
(function() {
  function init() {
	var mobileQuery = window.matchMedia('(max-width: 767px)');

	document.querySelectorAll('[data-sava-accordion-trigger]').forEach(function(trigger) {
	  if (trigger._savaInit) return;
	  trigger._savaInit = true;

	  var col = trigger.closest('[data-sava-accordion]');
	  var panel = col && col.querySelector('[data-sava-accordion-panel]');
	  if (!panel) return;

	  trigger.setAttribute('role', 'button');
	  trigger.setAttribute('tabindex', '0');
	  trigger.setAttribute('aria-expanded', 'false');

	  function toggle() {
		if (!mobileQuery.matches) return;
		var isOpen = trigger.getAttribute('aria-expanded') === 'true';
		if (isOpen) {
		  panel.style.maxHeight = '0px';
		  trigger.setAttribute('aria-expanded', 'false');
		} else {
		  panel.style.maxHeight = panel.scrollHeight + 'px';
		  trigger.setAttribute('aria-expanded', 'true');
		}
	  }

	  trigger.addEventListener('click', toggle);
	  trigger.addEventListener('keydown', function(e) {
		if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
	  });

	  mobileQuery.addEventListener('change', function(e) {
		if (!e.matches) {
		  panel.style.maxHeight = '';
		  trigger.setAttribute('aria-expanded', 'false');
		}
	  });
	});
  }

  if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
  } else {
	init();
  }
})();


/* ============================================================
   SAVA — mobile nav open-state class
   Mirrors .w--open on .w-nav-button to .sava-nav-open on .w-nav
   ============================================================ */
(function(){
  function init(){
	var btn = document.querySelector('.w-nav-button');
	var nav = btn && btn.closest('.w-nav');
	if (!nav) return;
	var sync = function(){
	  var open = btn.classList.contains('w--open');
	  nav.classList.toggle('sava-nav-open', open);
	  /* closing the drawer collapses any open accordion sections */
	  if (!open) nav.querySelectorAll('.sava-mega-menu_dropdown.sv-acc-open').forEach(function(dd){
		dd.classList.remove('sv-acc-open');
	  });
	};
	new MutationObserver(sync).observe(btn, {attributes:true, attributeFilter:['class']});
	sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

/* ===== SV Mega Menu — dynamic top offset (2026-07-06).
   The desktop dropdown panel is position:fixed at top:--sava-mega-menu-top
   (78px fallback in sava.css = navbar alone at the viewport top). Any
   section above the navbar in the Header Group (Promotional Banner,
   announcement bars) pushes the navbar down and the fixed panel opens OVER
   it. Measure the navbar's real bottom edge and feed the variable instead —
   works with or without the banner, at any banner height, and while
   scrolling. Mobile is unaffected (the panel is position:static <992px). ===== */
(function(){
  var last = '', raf = 0;
  function apply(){
	raf = 0;
	var nav = document.querySelector('.section_navbar-mega') || document.querySelector('.w-nav');
	if (!nav) return;
	var px = Math.max(0, Math.round(nav.getBoundingClientRect().bottom)) + 'px';
	if (px === last) return;
	last = px;
	document.documentElement.style.setProperty('--sava-mega-menu-top', px);
  }
  function queue(){ if (!raf) raf = requestAnimationFrame(apply); }
  window.addEventListener('scroll', queue, {passive:true});
  window.addEventListener('resize', queue, {passive:true});
  window.addEventListener('load', apply);
  document.addEventListener('shopify:section:load', apply);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();
})();

/* ===== SV Mobile Nav — collapse the search row on scroll (2026-07-06).
   The mobile header keeps the always-visible search field only at the very
   top of the page; once scrolled (>24px) sava.css collapses it (≤991px
   media block), leaving hamburger / logo / cart. Never collapses while the
   input is focused — the iOS keyboard scrolls the page and would otherwise
   yank the field away mid-search. Desktop is untouched (no matching CSS). ===== */
(function(){
  var raf = 0;
  function apply(){
	raf = 0;
	var nav = document.querySelector('.section_navbar-mega .nav_component-2');
	if (!nav) return;
	var panel = nav.querySelector('.sv-nav-search');
	var typing = panel && panel.contains(document.activeElement);
	nav.classList.toggle('sv-search-collapsed', window.scrollY > 24 && !typing);
  }
  function queue(){ if (!raf) raf = requestAnimationFrame(apply); }
  window.addEventListener('scroll', queue, {passive:true});
  window.addEventListener('resize', queue, {passive:true});
  document.addEventListener('focusin', queue);
  document.addEventListener('focusout', queue);
  document.addEventListener('shopify:section:load', apply);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();
})();

/* ===== SV Mobile Accordion — mega menu drawer (≤991px).
   Webflow's dropdowns run in HOVER mode (data-hover=true, needed for the
   desktop mega menu); at mobile widths a mouse hover pre-opens the list so
   the first click instantly re-closes it — the grey flash. This capture-
   phase handler bypasses Webflow's dropdown handlers entirely on mobile
   and drives .sv-acc-open, which the mobile CSS treats as the single
   source of truth for open state. ===== */
(function(){
  document.addEventListener('click', function(e){
	if (window.innerWidth > 991) return;
	var toggle = e.target.closest('.sava-mega-menu_dropdown .nav_dropdown-toggle-2');
	if (!toggle) return;
	e.preventDefault();
	e.stopPropagation();
	var dd = toggle.closest('.sava-mega-menu_dropdown');
	dd.classList.toggle('sv-acc-open');
	/* Webflow's dropdown JS leaves inline height:0 on the list (its close
	   animation) — strip it so the CSS accordion controls layout. */
	var list = dd.querySelector('.sava-mega-menu_dropdown-list');
	if (list) list.style.height = '';
  }, true);
})();


/* ===== SV Product Tabs — tab click handler (2026-06-09) ===== */
(function(){
  document.addEventListener('click', function(e){
	var t = e.target.closest('[data-sv-tab]');
	if(!t) return;
	var root = t.closest('.sv-product-tabs, [data-sv-tabs]');
	if(!root) return;
	var key = t.getAttribute('data-sv-tab');
	root.querySelectorAll('[data-sv-tab]').forEach(function(el){
	  el.classList.toggle('is-active', el === t);
	});
	root.querySelectorAll('[data-sv-pane]').forEach(function(el){
	  el.classList.toggle('is-active', el.getAttribute('data-sv-pane') === key);
	});
  });
})();

/* ===== SV Quantity Stepper — −/+ controls around the native qty input (2026-06-10) ===== */
(function(){
  document.addEventListener('click', function(e){
	var minus = e.target.closest('[data-sv-qty-minus]');
	var plus = e.target.closest('[data-sv-qty-plus]');
	if(!minus && !plus) return;
	var stepper = (minus || plus).closest('.sv-qty-stepper');
	if(!stepper) return;
	var input = stepper.querySelector('input');
	if(!input) return;
	var val = parseInt(input.value, 10) || 1;
	val = minus ? Math.max(1, val - 1) : val + 1;
	input.value = val;
	input.dispatchEvent(new Event('input', { bubbles: true }));
	input.dispatchEvent(new Event('change', { bubbles: true }));
  });
})();

/* ===== SV Variant card icons — inject pouch/stick icon by label text (2026-06-10) ===== */
(function(){
  var ICONS = {
	bag: 'https://cdn.prod.website-files.com/69ffc1011bc4b498238115c4/6a001e09d3badd55b008a9bd_Icons_Pouch.svg',
	stick: 'https://cdn.prod.website-files.com/69ffc1011bc4b498238115c4/6a001e09df8b9f5531918f77_Icons_Stick.svg'
  };
  function decorate(){
	document.querySelectorAll('.product-header_radio').forEach(function(card){
	  if(card.dataset.svIcon) return;
	  card.dataset.svIcon = 'done';
	  var t = (card.textContent || '').toLowerCase();
	  var src = t.indexOf('bag') > -1 ? ICONS.bag : (t.indexOf('stick') > -1 ? ICONS.stick : null);
	  if(!src) return;
	  var img = document.createElement('img');
	  img.src = src; img.alt = ''; img.className = 'sv-variant-card_icon';
	  card.insertBefore(img, card.firstChild);
	});
  }
  document.addEventListener('DOMContentLoaded', decorate);
  setTimeout(decorate, 800); /* re-run after Alpine renders the variant loop */
})();

/* ============================================================
   SAVA — unified marquee (fill-to-width, seamless loop, constant speed)
   Replaces the old Promotional Banner + logo-scroller marquee handlers.
   Works for any [data-sava-marquee] track:
	 1. clones the original child set until one pass overfills the viewport
	 2. duplicates the filled strip once so translateX(-50%) never gaps
	 3. logo scroller (or any track with data-marquee-speed) scrolls at a
		constant px/sec; other marquees keep their CSS animation-duration
   (2026-06-14)
   ============================================================ */
(function(){
  function imagesReady(track){
	var imgs = track.querySelectorAll('img'), i;
	for (i = 0; i < imgs.length; i++){
	  if (!imgs[i].complete || imgs[i].naturalWidth === 0) return false;
	}
	return true;
  }

  function build(track){
	if (track.dataset.marqueeReady || !track.children.length) return;

	var container = track.parentElement;
	var viewport = (container && container.offsetWidth) || window.innerWidth;
	var unit = Array.prototype.slice.call(track.children); // the original repeating set

	/* 1) fill: repeat the unit until one pass is at least a full viewport wide */
	var guard = 0;
	while (track.scrollWidth < viewport && guard < 60){
	  unit.forEach(function(node){
		var c = node.cloneNode(true);
		c.setAttribute('aria-hidden', 'true');
		track.appendChild(c);
	  });
	  guard++;
	}
	/* 2) duplicate the filled strip once → translateX(-50%) loops with no gap */
	Array.prototype.slice.call(track.children).forEach(function(node){
	  var c = node.cloneNode(true);
	  c.setAttribute('aria-hidden', 'true');
	  track.appendChild(c);
	});
	/* 3) constant speed (px/sec) for the logo scroller or any data-marquee-speed track */
	var speedAttr = track.getAttribute('data-marquee-speed');
	var wantsConstant = speedAttr || track.classList.contains('sv-logo-scroller_track');
	if (wantsConstant){
	  var pxPerSec = parseFloat(speedAttr) || 60;
	  track.style.animationDuration = ((track.scrollWidth / 2) / pxPerSec) + 's';
	}
	track.dataset.marqueeReady = 'true';
  }

  function tryBuild(track, attempts){
	if (track.dataset.marqueeReady) return;
	if (!imagesReady(track) && attempts < 20){
	  return setTimeout(function(){ tryBuild(track, attempts + 1); }, 150);
	}
	build(track);
  }

  function initAll(){
	document.querySelectorAll('[data-sava-marquee]').forEach(function(t){ tryBuild(t, 0); });
  }

  window.addEventListener('load', initAll);
  if (document.readyState === 'loading'){
	document.addEventListener('DOMContentLoaded', function(){ setTimeout(initAll, 300); });
  } else {
	setTimeout(initAll, 300);
  }
})();


/* ===== SV Key Ingredients — Supplement Facts lightbox (2026-06-17) =====
   Intercepts the "View Supplement Facts Label" link and opens the metafield
   file (image or PDF) in an on-page lightbox instead of a new tab.
   No-JS fallback: the link still opens the file (target=_blank). ===== */
(function(){
  function onKey(e){ if (e.key === 'Escape') closeLb(); }
  function closeLb(){
    var ex = document.querySelector('.sv-facts-lightbox');
    if (ex) ex.remove();
    document.removeEventListener('keydown', onKey);
    document.body.style.overflow = '';
  }
  function openLb(src){
    closeLb();
    var ov = document.createElement('div');
    ov.className = 'sv-facts-lightbox';
    ov.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(20,19,18,.88);padding:4vmin;';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Close');
    btn.innerHTML = '&times;';
    btn.style.cssText = 'position:absolute;top:16px;right:16px;width:40px;height:40px;border:0;border-radius:50%;background:rgba(255,255,255,.18);color:#fff;font-size:24px;line-height:40px;cursor:pointer;';
    var media;
    if (/\.pdf(\?|$)/i.test(src)){
      media = document.createElement('iframe');
      media.src = src;
      media.style.cssText = 'width:92vw;height:88vh;border:0;border-radius:6px;background:#fff;';
    } else {
      media = document.createElement('img');
      media.src = src;
      media.alt = 'Supplement Facts';
      media.style.cssText = 'max-width:92vw;max-height:88vh;width:auto;height:auto;display:block;border-radius:6px;background:#fff;';
    }
    ov.appendChild(btn);
    ov.appendChild(media);
    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';
    ov.addEventListener('click', function(e){ if (e.target === ov) closeLb(); });
    btn.addEventListener('click', closeLb);
    document.addEventListener('keydown', onKey);
  }
  document.addEventListener('click', function(e){
    var p = e.target.closest('.sv-keying_facts');
    if (!p) return;
    var a = p.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href === '#') return;
    e.preventDefault();
    openLb(href);
  });
})();

/* ===== SV All Flavors — per-flavor hover color (2026-06-16) ===== */
(function(){
  document.querySelectorAll('[data-sv-flavor]').forEach(function(el){
    var c = el.getAttribute('data-sv-flavor');
    if (c) el.style.setProperty('--sv-flavor', c);
  });
})();

/* ===== SV Product Header gallery — nudge Swiper to recompute sizes after the left-rail reflow (2026-06-18) ===== */
(function(){
  function upd(){
    document.querySelectorAll('.swiper.is-product-gallery, .swiper.is-product-thumbnail').forEach(function(el){
      if (el.swiper && typeof el.swiper.update === 'function') el.swiper.update();
    });
  }
  window.addEventListener('load', function(){ upd(); setTimeout(upd, 300); setTimeout(upd, 900); });
  var t; window.addEventListener('resize', function(){ clearTimeout(t); t = setTimeout(upd, 150); });
})();

/* ===== SV Blog — highlight the active quick-filter pill by current URL (2026-06-23) ===== */
(function(){
  function setActive(){
    var pills = document.querySelectorAll('.sv-blog-pill');
    if (!pills.length) return;
    var here = location.pathname.replace(/\/+$/, '');
    pills.forEach(function(p){
      var a = document.createElement('a'); a.href = p.getAttribute('href') || '';
      p.classList.toggle('is-active', a.pathname.replace(/\/+$/, '') === here);
    });
  }
  document.addEventListener('DOMContentLoaded', setActive);
  setActive();
})();

/* ===== SV Blog — inject prev/next carousel arrows into the quick-filter bar (2026-07-01)
   Buttons are styled by sava.css (.sv-blog-pills-arrow, gallery circle-arrow data-URIs) and only
   shown on desktop when the pill row actually overflows (.sv-has-overflow on the bar). ===== */
(function(){
  function init(){
    var bar = document.querySelector('.sv-blog-filterbar');
    var pills = bar && bar.querySelector('.sv-blog-pills');
    if (!bar || !pills || bar.dataset.savaArrows) return;
    bar.dataset.savaArrows = 'true';
    ['prev','next'].forEach(function(dir){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sv-blog-pills-arrow is-' + dir;
      b.setAttribute('aria-label', dir === 'prev' ? 'Scroll filters left' : 'Scroll filters right');
      b.addEventListener('click', function(){
        pills.scrollBy({ left: (dir === 'prev' ? -1 : 1) * Math.round(pills.clientWidth * 0.7), behavior: 'smooth' });
      });
      bar.appendChild(b);
    });
    function upd(){ bar.classList.toggle('sv-has-overflow', pills.scrollWidth > pills.clientWidth + 4); }
    upd();
    var t; window.addEventListener('resize', function(){ clearTimeout(t); t = setTimeout(upd, 150); });
  }
  document.addEventListener('DOMContentLoaded', init);
  init();
})();

/* ===== SV Blog — Filter button opens the category panel (Figma 235:8355, flat-tag version).
   Built by cloning the pill row, so it always mirrors the live tags + active state.
   Closes on ✕, outside click, Escape, or picking a category (navigation). ===== */
(function(){
  function init(){
    var bar = document.querySelector('.sv-blog-titlebar');
    var btn = bar && bar.querySelector('.sv-blog-filter-btn');
    var pills = document.querySelectorAll('.sv-blog-pills .sv-blog-pill');
    if (!bar || !btn || !pills.length || bar.dataset.savaFilterPanel) return;
    bar.dataset.savaFilterPanel = 'true';
    var panel = document.createElement('div');
    panel.className = 'sv-blog-filter-panel';
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'sv-blog-filter-panel_close';
    close.setAttribute('aria-label', 'Close filters');
    close.innerHTML = '×';
    var inner = document.createElement('div');
    inner.className = 'sv-blog-filter-panel_inner';
    pills.forEach(function(p){ inner.appendChild(p.cloneNode(true)); });
    panel.appendChild(close);
    panel.appendChild(inner);
    bar.appendChild(panel);
    function setOpen(open){
      panel.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    btn.addEventListener('click', function(e){ e.stopPropagation(); setOpen(!panel.classList.contains('is-open')); });
    close.addEventListener('click', function(){ setOpen(false); });
    document.addEventListener('click', function(e){
      if (panel.classList.contains('is-open') && !panel.contains(e.target) && !btn.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') setOpen(false); });
  }
  document.addEventListener('DOMContentLoaded', init);
  init();
})();

/* ===== SV Quiz Hero — force-load the collage images.
   Chrome's native loading="lazy" never fires for these absolutely-positioned
   images inside the overflow:hidden hero on first paint — it only re-checks
   after a scroll, so a visitor who doesn't scroll sees an empty collage.
   They're above the fold anyway, so eager is correct.
   Re-runs on the Shopify Theme Editor's section events (the editor re-renders
   section DOM without re-firing DOMContentLoaded) and once more after full
   window load as a belt-and-braces pass. ===== */
(function(){
  function init(){
    document.querySelectorAll('.sv-quiz-hero_images img').forEach(function(img){
      img.loading = 'eager';
    });
  }
  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('load', init);
  document.addEventListener('shopify:section:load', init);
  document.addEventListener('shopify:section:select', init);
  init();
})();

/* ===== Collections filter sidebar — Phase 2 (Figma 234:4773).
   (a) Accordion: clicking a filter-group heading toggles .is-collapsed
	   (CSS hides the list + rotates the chevron). Default = open.
   (b) Sort By group: builds a radio-style group in the sidebar from the
	   hidden #sort-by select's options (whitelisted to the Figma's three:
	   Best Selling / Price Low-High / Price High-Low, falling back to all
	   options if none match). Clicking sets ?sort_by= like the select did. ===== */
(function(){
  var SORT_WHITELIST = ['best-selling', 'price-ascending', 'price-descending'];

  document.addEventListener('click', function(e){
	var heading = e.target.closest('.filter_filter-group-heading');
	if (!heading) return;
	var group = heading.closest('.filter_filter-group');
	if (group) group.classList.toggle('is-collapsed');
  });

  function buildSortGroup(){
	var select = document.querySelector('#sort-by');
	var list = document.querySelector('.filter_filter-group-list');
	if (!select || !list || list.querySelector('.sv-sort-group')) return;

	var options = Array.prototype.filter.call(select.options, function(o){
	  return SORT_WHITELIST.indexOf(o.value) !== -1;
	});
	if (!options.length) options = Array.prototype.slice.call(select.options);

	var items = options.map(function(o){
	  return '<div class="filter_item">' +
		'<a href="#" class="filter_form_checkbox sv-sort-option" data-sort="' + o.value + '">' +
		  '<div class="filter_form_checkbox-icon' + (o.selected ? ' is-checked' : '') + '"></div>' +
		  '<div class="filter_form_checkbox-label">' + o.text + '</div>' +
		'</a></div>';
	}).join('');

	var group = document.createElement('div');
	group.className = 'filter_filter-group sv-sort-group';
	group.innerHTML =
	  '<div class="filter_filter-group-heading">' +
		'<div class="text-size-medium text-weight-semibold">Sort By</div>' +
	  '</div>' +
	  '<div class="filter_list">' + items + '</div>';
	list.appendChild(group);

	group.addEventListener('click', function(e){
	  var opt = e.target.closest('.sv-sort-option');
	  if (!opt) return;
	  e.preventDefault();
	  var params = new URLSearchParams(location.search);
	  params.set('sort_by', opt.getAttribute('data-sort'));
	  location.search = params.toString();
	});
  }
  /* All groups start COLLAPSED (Figma: "dropdowns remain condensed until
	 click"); active filters stay visible via the chips above the grid. */
  function collapseAll(){
	document.querySelectorAll('.filter_filter-group').forEach(function(g){
	  g.classList.add('is-collapsed');
	});
  }
  function init(){ buildSortGroup(); collapseAll(); }
  document.addEventListener('DOMContentLoaded', init);
  init();
})();

/* ===== Collections mobile Filters modal.
   The Filters button + panel are wired by a Webflow IX2 interaction that
   never initializes on the converted theme: theme.liquid hardcodes the
   HOME page's data-wf-page id on every template, and IX2 configs are
   keyed per page. Re-wire: button adds .sv-filters-open (CSS slides the
   fixed panel in), injected ✕ / Escape closes, page scroll locks while
   open. ===== */
(function(){
  /* filter.* key=value pairs of a query string, as delimited strings */
  function pairsOf(search){
	var p = new URLSearchParams(search), out = [];
	p.forEach(function(v, k){ if (k.indexOf('filter.') === 0) out.push(k + ' ' + v); });
	return out;
  }
  function init(){
	var btn = document.querySelector('.filter_tablet-filters-button');
	var wrap = document.querySelector('.filter_filters-wrapper');
	if (!btn || !wrap || btn.dataset.svBound) return;
	btn.dataset.svBound = '1';
	var closeBtn = wrap.querySelector('.filter_tablet-modal-close-button');

	/* bottom APPLY bar (mobile only via CSS) */
	var apply = document.createElement('a');
	apply.href = '#';
	apply.className = 'sv-filters-apply';
	apply.textContent = 'SHOW RESULTS';
	wrap.appendChild(apply);

	var pending = {}; /* queued selections: href / sort key → {el} */

	function setOpen(open){
	  wrap.classList.toggle('sv-filters-open', open);
	  document.documentElement.style.overflow = open ? 'hidden' : '';
	  if (!open){ /* closing discards the queue + reverts the check marks */
		Object.keys(pending).forEach(function(key){
		  var icon = pending[key].el.querySelector('.filter_form_checkbox-icon');
		  if (icon) icon.classList.toggle('is-checked');
		});
		pending = {};
	  }
	}
	btn.addEventListener('click', function(e){ e.preventDefault(); setOpen(true); });
	if (closeBtn) closeBtn.addEventListener('click', function(e){
	  e.preventDefault(); e.stopPropagation(); setOpen(false);
	}, true);
	document.addEventListener('keydown', function(e){
	  if (e.key === 'Escape') setOpen(false);
	});

	/* BATCH MODE — while the mobile panel is open, option taps queue up
	   instead of navigating; SHOW RESULTS applies them all in one URL.
	   Desktop (>991px) keeps standard instant-apply. */
	wrap.addEventListener('click', function(e){
	  if (!wrap.classList.contains('sv-filters-open') || window.innerWidth > 991) return;
	  var link = e.target.closest('a.filter_form_checkbox, a.sv-sort-option');
	  if (!link || link.classList.contains('is-disabled')) return;
	  e.preventDefault();
	  e.stopPropagation(); /* also blocks the sort group's instant handler */
	  var key = link.classList.contains('sv-sort-option')
		? 'sort:' + link.getAttribute('data-sort')
		: link.href;
	  if (pending[key]) delete pending[key]; else pending[key] = {el: link};
	  var icon = link.querySelector('.filter_form_checkbox-icon');
	  if (icon) icon.classList.toggle('is-checked');
	}, true);

	apply.addEventListener('click', function(e){
	  e.preventDefault();
	  var params = new URLSearchParams(location.search);
	  var current = pairsOf(location.search);
	  Object.keys(pending).forEach(function(key){
		if (key.indexOf('sort:') === 0){ params.set('sort_by', key.slice(5)); return; }
		var target = pairsOf(key.split('?')[1] || '');
		/* pairs the option's link adds vs the CURRENT page */
		target.forEach(function(p){
		  if (current.indexOf(p) === -1){
			var i = p.indexOf(' ');
			params.append(p.slice(0, i), p.slice(i + 1));
		  }
		});
		/* pairs it removes (deselecting an active filter) */
		current.forEach(function(p){
		  if (target.indexOf(p) === -1){
			var i = p.indexOf(' '), k = p.slice(0, i), v = p.slice(i + 1);
			var vals = params.getAll(k).filter(function(x){ return x !== v; });
			params.delete(k);
			vals.forEach(function(x){ params.append(k, x); });
		  }
		});
	  });
	  location.search = params.toString();
	});
  }
  document.addEventListener('DOMContentLoaded', init);
  init();
})();

/* ===== Blog cards — per-row tag-area equalizer.
   Cards size their tag row to content, so a card whose tags wrap to two
   lines pushes its image lower than its neighbors' (Figma aligns all
   images in a row). For every card row (collection grid AND the You May
   Also Like section — same card component), set each tag row's
   min-height to the tallest tag stack in that row. Re-runs on resize
   (rows regroup at breakpoints) and full load (font metrics settle). ===== */
(function(){
  function equalize(){
    document.querySelectorAll('.blog_list').forEach(function(list){
      var tagRows = Array.prototype.slice.call(list.querySelectorAll('.blog_tag-row'));
      if (!tagRows.length) return;
      tagRows.forEach(function(t){ t.style.minHeight = ''; }); // clean remeasure
      var rows = {};
      tagRows.forEach(function(t){
        var card = t.closest('.blog_cms-item, .blog_list-item');
        if (!card) return;
        var top = Math.round(card.getBoundingClientRect().top);
        (rows[top] = rows[top] || []).push(t);
      });
      Object.keys(rows).forEach(function(top){
        var group = rows[top];
        var max = Math.max.apply(null, group.map(function(t){
          return t.getBoundingClientRect().height;
        }));
        group.forEach(function(t){ t.style.minHeight = max + 'px'; });
      });
    });
  }
  var timer;
  function schedule(){ clearTimeout(timer); timer = setTimeout(equalize, 120); }
  document.addEventListener('DOMContentLoaded', equalize);
  window.addEventListener('load', equalize);
  window.addEventListener('resize', schedule);
  document.addEventListener('shopify:section:load', equalize);
  equalize();
})();

/* ===== SV Nav Search — the header magnifier opens a full-width search bar
   under the navbar (mirrors the Figma mobile pattern). Typing gets live
   suggestions via Liquify's global <predictive-search> element (defined in
   snippets/search_javascript, fetches /search/suggest); Enter or the
   magnifier submits GET /search?q=… . Empty queries don't submit — that's
   what produced the bare "No results found" page. The icon's href=/search
   stays as a no-JS fallback. ===== */
(function(){
  var SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 19" fill="none" width="20" height="20"><circle cx="8.1" cy="8.1" r="7.35" stroke="currentColor" stroke-width="0.75"/><path d="M13.4 13.4L18.4 18.4" stroke="currentColor" stroke-width="0.75" stroke-linecap="round"/></svg>';
  function init(){
    document.querySelectorAll('.section_navbar-mega .nav_component-2').forEach(function(nav){
      var icon = nav.querySelector('.sava-nav_search-icon');
      if (!icon || icon.dataset.svSearchBound) return;
      icon.dataset.svSearchBound = '1';

      /* Prefer the SERVER-RENDERED shell (in the Webflow markup since
         2026-07-05) so the field is visible immediately on page load —
         injection only remains as a fallback for older conversions. */
      var panel = nav.querySelector('.sv-nav-search');
      if (!panel) {
        panel = document.createElement('div');
        panel.className = 'sv-nav-search';
        panel.innerHTML =
          '<form action="/search" method="get" role="search" class="sv-nav-search_form">' +
            '<input type="search" name="q" class="sv-nav-search_input" placeholder="Search for a product" autocomplete="off" aria-label="Search">' +
            '<button type="submit" class="sv-nav-search_submit" aria-label="Submit search">' + SVG + '</button>' +
          '</form>';
        nav.appendChild(panel);
      }
      /* Liquify's PredictiveSearch class requires input[type="search"] —
         re-assert it in case the publish pipeline strips the attribute. */
      var inp0 = panel.querySelector('.sv-nav-search_input');
      if (inp0) inp0.setAttribute('type', 'search');
      /* Upgrade the shell with the predictive-search custom element
         (live suggestions) — progressive enhancement over the static form. */
      if (!panel.querySelector('predictive-search')) {
        var form0 = panel.querySelector('form');
        try {
          /* Build inside an inert <template> so the custom element is NOT
             upgraded until it's connected. If PredictiveSearch (defined in a
             body inline script) is already registered, a bare createElement
             runs its constructor on a CHILDLESS element -> querySelector is
             null -> TypeError that aborts this whole init (seen on product
             pages 2026-07-14). Template content upgrades on connection, when
             the form child is already in place. */
          var tpl = document.createElement('template');
          tpl.innerHTML = '<predictive-search class="sv-nav-search_inner"></predictive-search>';
          var ps = tpl.content.firstChild;
          ps.appendChild(form0);
          var results = document.createElement('div');
          results.id = 'predictive-search';
          results.className = 'sv-nav-search_results';
          results.style.display = 'none';
          ps.appendChild(results);
          panel.appendChild(ps);
        } catch (err) {
          /* Predictive enhancement failed — restore the static GET form,
             which works on its own. */
          if (form0 && !panel.contains(form0)) panel.appendChild(form0);
        }
      }

      var input = panel.querySelector('.sv-nav-search_input');
      panel.querySelector('form').addEventListener('submit', function(e){
        if (!input.value.trim()) e.preventDefault();
      });

      function setOpen(open){
        panel.classList.toggle('is-open', open);
        if (open) setTimeout(function(){ input.focus(); }, 0);
      }
      icon.addEventListener('click', function(e){
        e.preventDefault();
        setOpen(!panel.classList.contains('is-open'));
      });
      document.addEventListener('keydown', function(e){
        if (e.key === 'Escape') setOpen(false);
      });
      document.addEventListener('click', function(e){
        if (!panel.classList.contains('is-open')) return;
        if (panel.contains(e.target) || icon.contains(e.target)) return;
        setOpen(false);
      });
    });
  }
  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('shopify:section:load', init);
  init();
})();

/* ===== Recharge subscription widget — shadow-root style injection
   (2026-07-14, rev 2). The widget is <recharge-subscription-widget>, an
   OPEN shadow-DOM custom element, so neither sava.css nor theme CSS can
   reach it (and its "Advanced custom CSS" admin field wasn't
   propagating). A one-shot injection loses the race: the widget renders
   AFTER the shadow root exists and wipes/overrides foreign styles. So
   this RE-ASSERTS: poll for ~20s and re-append the tagged <style>
   whenever the rendered root is missing it. ===== */
(function(){
  var CSS =
    '.rc-purchase-option__selector{' +
      'font-size:16px !important;' +
      'padding:3px 0 !important;' +
      'font-weight:600 !important;' +
      'display:flex !important;' +
      'align-items:center !important;' +
      'text-transform:uppercase !important;' +
      'letter-spacing:2.4px !important;' +
    '}' +
    /* Selected option card = SAVA "Lemon Fade" (Figma: linear, #FFF at 50%
       -> #EDE087 at 100%). NOTE: the widget renders NO "selected" class —
       selection lives on the radio input's :checked, so target the card
       via :has(). Console-verified 2026-07-15. */
    '.rc-purchase-option:has(.rc-purchase-option__input:checked){' +
      'background:linear-gradient(180deg,#FFFFFF 50%,#EDE087 100%) !important;' +
    '}' +
    /* Unselected option card = white bg + SAVA mid-grey border (Figma
       #DEDDD7, matches the site's pill buttons). */
    '.rc-purchase-option:not(:has(.rc-purchase-option__input:checked)){' +
      'border-color:#DEDDD7 !important;' +
      'background:#FFFFFF !important;' +
    '}' +
    /* Label row: option name left, prices right (the label wraps both
       the selector row and the prices div). The widget's own CSS gives
       the children full width (stacked layout) — force one row and let
       the children size to content. */
    '.rc-purchase-option__label{' +
      'display:flex !important;' +
      'flex-direction:row !important;' +
      'flex-wrap:nowrap !important;' +
      'justify-content:space-between !important;' +
      'align-items:center !important;' +
      'gap:12px !important;' +
      'width:100% !important;' +
      'box-sizing:border-box !important;' +
    '}' +
    '.rc-purchase-option__selector{' +
      'width:auto !important;' +
      'flex:1 1 auto !important;' +
      'justify-content:flex-start !important;' +
      'text-align:left !important;' +
    '}' +
    '.rc-purchase-option__prices{' +
      'width:auto !important;' +
      'flex:0 0 auto !important;' +
      'margin-left:auto !important;' +
      'text-align:right !important;' +
    '}' +
    /* Prices: InterstateMono Bold 18 / 5% tracking (Figma). NOTE: the
       rendered spans are .rc-price / .rc-price.strike-through — the
       __original-price names exist only as part="" attributes. */
    '.rc-purchase-option__prices{' +
      'font-family:InterstateMono,monospace !important;' +
      'font-weight:700 !important;' +
      'font-size:18px !important;' +
      'letter-spacing:0.05em !important;' +
    '}' +
    '.rc-price.strike-through{' +
      'font-weight:400 !important;' +
      'font-size:14px !important;' +
    '}' +
    /* "Save up to 10%" badge: Gibson, SAVA radius on the exposed top
       corners, anchored so its bottom edge sits flush on the card top. */
    '.rc-purchase-option{position:relative !important;}' +
    '.rc-purchase-option__badge{' +
      'font-family:Gibson,sans-serif !important;' +
      'font-size:16px !important;' +
      'font-weight:400 !important;' +
      'letter-spacing:0 !important;' +
      'padding:10px 20px !important;' +
      'border-radius:10px 10px 0 0 !important;' +
      'position:absolute !important;' +
      'bottom:100% !important;' +
      'top:auto !important;' +
      'right:16px !important;' +
      'margin:0 !important;' +
    '}' +
    /* "Learn more": hide the native text link; an inline (i) icon next to
       the SUBSCRIBE & SAVE label (mounted below) opens the same modal.
       NOTE: the widget nests child components with their OWN shadow roots
       (rc-learn-more, rc-benefits, rc-selling-plans) — reach the trigger
       via its exported ::part from the outer root. */
    'rc-learn-more::part(rc-learn-more__trigger){display:none !important;}' +
    'rc-learn-more::part(rc-learn-more__trigger-compact){display:none !important;}' +
    '.sv-rc-info{' +
      'background:none;border:0;padding:0;margin-left:8px;cursor:pointer;' +
      'display:inline-flex;align-items:center;color:#262524;line-height:0;' +
    '}' +
    '.sv-rc-info svg{width:20px;height:20px;display:block;}';
  var ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" width="20" height="20" aria-hidden="true">' +
      '<circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>' +
      '<circle cx="10" cy="6.1" r="1.1" fill="currentColor"/>' +
      '<rect x="9.2" y="8.7" width="1.6" height="6" rx="0.8" fill="currentColor"/>' +
    '</svg>';
  /* Mount the (i) trigger inside the subscription option's label row.
     Idempotent — safe to call from the poll loop and the observer. */
  /* SAVA-owned Learn More modal. Driving Recharge's own trigger proved
     unreliable (fresh rc-learn-more instances drop the first synthetic
     click after the selection re-render cascade), so we render the SAME
     content ourselves. The modal HTML ships in the widget config on
     every product page (learnMoreContent) — reading it at runtime keeps
     us in sync with whatever the client sets in Recharge admin. */
  function getLearnMoreContent(){
    try {
      return window.SubscriptionWidgetConfig.configs.subscription_widget_v2
        .default_widget_config.ab_splits[0].display_configs[0]
        .config_information.learnMoreContent || '';
    } catch (err) { return ''; }
  }
  /* The config HTML uses <span rc-*-icon> placeholders that Recharge's
     component swaps for SVGs — provide our own equivalents. */
  var LM_ICONS = {
    'rc-calendar-icon': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>',
    'rc-bell-icon': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2.2 2.2 0 0 0 4 0"/></svg>',
    'rc-phone-icon': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><path d="M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20z"/><path d="M13.5 7.5l3 3"/></svg>'
  };
  function ensureLmStyles(){
    if (document.getElementById('sv-lm-styles')) return;
    var st = document.createElement('style');
    st.id = 'sv-lm-styles';
    st.textContent =
      '.sv-lm-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(20,19,18,.5);padding:4vmin;}' +
      /* The config styles reference --rc-widget-* vars — define them here
         to match the widget config (brand #262524 on white, SAVA radius). */
      '.sv-lm-card{background:#fff;border-radius:12px;max-width:760px;width:100%;max-height:88vh;overflow:auto;padding:56px 40px 36px;position:relative;' +
        '--rc-widget-brand-color:#262524;--rc-widget-brand-color-80:#4e4d4c;--rc-widget-brand-contrast-color:#FFFFFF;--rc-widget-button-radius:10px;--rc-widget-card-radius:8px;}' +
      '.sv-lm-close{position:absolute;top:14px;right:18px;background:none;border:0;font-size:28px;line-height:1;cursor:pointer;color:#262524;padding:4px;}';
    document.head.appendChild(st);
  }
  function openLearnMore(){
    if (document.querySelector('.sv-lm-overlay')) return;
    var html = getLearnMoreContent();
    if (!html) return;
    ensureLmStyles();
    /* The embedded <style> in the config scopes rules to the
       rc-learn-more-modal tag — rescope them to our wrapper class.
       (Do NOT create a real <rc-learn-more-modal>: Recharge defines it.) */
    html = html.split('rc-learn-more-modal').join('.sv-lm-body');
    var overlay = document.createElement('div');
    overlay.className = 'sv-lm-overlay';
    var card = document.createElement('div');
    card.className = 'sv-lm-card';
    card.innerHTML = '<button type="button" class="sv-lm-close" aria-label="Close">&times;</button><div class="sv-lm-body">' + html + '</div>';
    overlay.appendChild(card);
    Object.keys(LM_ICONS).forEach(function(attr){
      card.querySelectorAll('[' + attr + ']').forEach(function(el){ el.innerHTML = LM_ICONS[attr]; });
    });
    function close(){
      overlay.remove();
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    }
    function onKey(ev){ if (ev.key === 'Escape') close(); }
    overlay.addEventListener('click', function(ev){ if (ev.target === overlay) close(); });
    card.querySelector('.sv-lm-close').addEventListener('click', close);
    card.querySelectorAll('[data-dismiss-modal]').forEach(function(b){ b.addEventListener('click', close); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
  }

  function mountInfo(root){
    /* The __selector_subscription class is state-dependent — anchor on the
       stable radio value instead. */
    var sel = root.querySelector(
      '.rc-purchase-option:has(input[value="subscription"]) .rc-purchase-option__selector');
    if (!sel || sel.querySelector('.sv-rc-info')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sv-rc-info';
    btn.setAttribute('aria-label', 'Learn more about subscribing');
    btn.innerHTML = ICON;
    btn.addEventListener('click', function(e){
      /* Inside the option <label>: preventDefault stops the click from
         also toggling the radio. */
      e.preventDefault();
      e.stopPropagation();
      openLearnMore();
    });
    sel.appendChild(btn);
  }
  function ensure(el){
    var root = el.shadowRoot;
    if (!root) return false;
    /* Wait until the widget has rendered its own content — injecting
       earlier gets wiped by the widget's first render. */
    if (!root.childElementCount) return false;
    if (!root.querySelector('style[data-sv-rc]')) {
      var s = document.createElement('style');
      s.setAttribute('data-sv-rc', '1');
      s.textContent = CSS;
      root.appendChild(s);
    }
    mountInfo(root);
    /* Widget re-renders (option toggles, variant changes) wipe mounted
       nodes at any time — keep them alive beyond the poll window. The
       callback is idempotent, so our own insertions no-op. */
    if (!el.__svRcObserver) {
      el.__svRcObserver = new MutationObserver(function(){
        if (!root.querySelector('style[data-sv-rc]')) {
          var s2 = document.createElement('style');
          s2.setAttribute('data-sv-rc', '1');
          s2.textContent = CSS;
          root.appendChild(s2);
        }
        mountInfo(root);
      });
      el.__svRcObserver.observe(root, { childList: true, subtree: true });
    }
    return true;
  }
  function tick(){
    var ok = true;
    document.querySelectorAll('recharge-subscription-widget').forEach(function(el){
      if (!ensure(el)) ok = false;
    });
    return ok;
  }
  var running = false;
  function start(){
    if (running) return;
    running = true;
    var tries = 0;
    var t = setInterval(function(){
      tick();
      if (++tries > 80) { clearInterval(t); running = false; }
    }, 250);
  }
  document.addEventListener('DOMContentLoaded', start);
  document.addEventListener('shopify:section:load', start);
  start();
})();


/* ===== Recharge selling-plan bridge (2026-07-14). The widget only wires
   itself to a product form containing input[name="id"] — the Liquify ATC
   form has none (variant handling is Alpine JS), so subscription
   selections were silently dropped and every add-to-cart was one-time
   (console: "[Recharge Warning] Could not infer a product form…").
   Inject that input BEFORE the widget module executes (sava.js is a
   deferred head script; the widget module sits later in the body, so we
   run first). Recharge then maintains a selling_plan input in the form,
   and Liquify's addToCart serializes the whole form into the cart
   payload, carrying the plan along. ===== */
(function(){
  function bridge(){
    var widget = document.querySelector('recharge-subscription-widget');
    if (!widget) return;
    var form = document.querySelector('.product-header_component form[action*="/cart/add"]');
    if (!form || form.dataset.svRcBridge) return;
    form.dataset.svRcBridge = '1';
    var input = form.querySelector('input[name="id"]');
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'id';
      input.value = widget.getAttribute('default-variant-id') || '';
      form.appendChild(input);
    }
    /* At click time: refresh the variant id from Alpine state (variant
       switches never touch this input) and strip an EMPTY selling_plan
       (one-time selected) so the JSON payload stays valid. Capture phase
       runs before Alpine's bubble-phase @click="addToCart". */
    form.addEventListener('click', function(e){
      if (!e.target.closest('[li-element="add-to-cart"]')) return;
      try {
        var container = form.closest('[li-element="product-variant-container"]');
        var data = window.Alpine && container ? window.Alpine.$data(container) : null;
        var cur = data && data.product && data.product.selected_or_first_available_variant;
        if (cur && cur.id) input.value = cur.id;
      } catch (err) {}
      form.querySelectorAll('input[name="selling_plan"]').forEach(function(sp){
        if (!sp.value) sp.remove();
      });
    }, true);
  }
  bridge();
  document.addEventListener('DOMContentLoaded', bridge);
  document.addEventListener('shopify:section:load', bridge);
})();


/* ===== Boost slide-out cart bridge (2026-07-17). Boost.shop support
   patched assets/li_custom.js directly (guarded Boost.Cart.open() after
   a successful add-to-cart) — but Liquiflow conversions REGENERATE that
   asset, which would silently wipe their patch. Conversion-proof port:
   stock li_custom.js always dispatches 'toggleminicart' after a
   successful add (Boost retained it for exactly this reason), so open
   the Boost drawer from that event instead. Guarded — no-ops on any
   page/store without Boost. Runs alongside Boost's inline patch until
   the next conversion removes it (double open() is idempotent).
   The .Boost_CartCount presence check ties the bridge to the theme's
   "Use Boost cart drawer" checkbox (SV Header Mega setting): when the
   merchant turns Boost off, the header renders the native mini-cart
   instead of the Boost cart link, so the bridge stands down and the
   native drawer handles 'toggleminicart' on its own. ===== */
(function(){
  window.addEventListener('toggleminicart', function(){
    if (!document.querySelector('.Boost_CartCount')) return;
    if (window.Boost && window.Boost.Cart && typeof window.Boost.Cart.open === 'function') {
      window.Boost.Cart.open();
    }
  });
})();


/* ===== SV Partner Program (2026-07-21): perk card colors + partners arrows.
   Card color = hidden hex paragraph rendered by the block's "Card Color"
   text setting (a per-block color PICKER silently drops the whole section
   at conversion — proven trap; hidden hex text + JS is the validated
   workaround from SV All Flavors). Arrows scroll the partners list by one
   card. Idempotent; re-runs on Theme Editor section loads. ===== */
(function(){
  function paint(){
    document.querySelectorAll('.partner-perks_color-hex').forEach(function(p){
      var hex = (p.textContent || '').trim();
      var card = p.closest('.partner-perks_card');
      if (card && /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(hex)) card.style.backgroundColor = hex;
    });
  }
  function arrows(){
    document.querySelectorAll('.section_partners').forEach(function(sec){
      if (sec.dataset.svPartnersBound === '1') return;
      var list = sec.querySelector('.partners_list');
      if (!list) return;
      sec.dataset.svPartnersBound = '1';
      function step(){
        var item = list.querySelector('.partners_item');
        return item ? item.getBoundingClientRect().width + 20 : list.clientWidth;
      }
      sec.querySelectorAll('.partners_arrow').forEach(function(btn){
        btn.addEventListener('click', function(){
          var dir = btn.classList.contains('is-prev') ? -1 : 1;
          list.scrollBy({ left: dir * step(), behavior: 'smooth' });
        });
      });
    });
  }
  function init(){ paint(); arrows(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  document.addEventListener('shopify:section:load', init);
})();


/* ===== Footer newsletter success message (2026-07-22) =====
   The footer form is a Shopify customer form (li-form="customer") that posts
   natively and redirects to return_to with ?customer_posted=true. Webflow's
   .w-form-done block only appears via Webflow's own AJAX handler (absent on
   Shopify), so the user got no confirmation. Surface it ourselves on the
   redirected page load: swap the form for the success message and bring it
   into view. */
(function(){
  function show(){
    var posted;
    try { posted = new URLSearchParams(window.location.search).get('customer_posted') === 'true'; }
    catch (e) { return; }
    if (!posted) return;
    var wraps = document.querySelectorAll('.sava-footer .w-form');
    for (var i = 0; i < wraps.length; i++) {
      var form = wraps[i].querySelector('form');
      var done = wraps[i].querySelector('.w-form-done');
      if (form && done) { form.style.display = 'none'; done.style.display = 'block'; }
    }
    var done0 = document.querySelector('.sava-footer .w-form-done');
    if (done0 && done0.scrollIntoView) {
      setTimeout(function(){ done0.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show);
  else show();
})();


/* ===== Footer newsletter AJAX submit + feedback bubble (2026-07-22) =====
   Replaces the reload/redirect UX: validate the email locally, POST the
   Shopify customer form in the background, and pop a pill bubble above the
   field (green check on success, red X + message on invalid input). If
   Shopify answers with its bot-check challenge page or the request fails,
   fall back to a native submit — the customer_posted handler above then
   surfaces the success message after the redirect. form.submit() bypasses
   this listener by design, so the fallback cannot loop. */
(function(){
  var VALID = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function ensureBubble(form){
    var b = form.querySelector('.sv-nl-bubble');
    if (!b) {
      b = document.createElement('div');
      b.className = 'sv-nl-bubble';
      b.setAttribute('role', 'status');
      var i = document.createElement('span'); i.className = 'sv-nl-bubble_icon';
      var t = document.createElement('span'); t.className = 'sv-nl-bubble_text';
      b.appendChild(i); b.appendChild(t);
      form.appendChild(b);
    }
    return b;
  }

  function pop(form, ok, msg){
    var b = ensureBubble(form);
    b.classList.toggle('is-error', !ok);
    b.querySelector('.sv-nl-bubble_icon').textContent = ok ? '\u2713' : '\u2715';
    b.querySelector('.sv-nl-bubble_text').textContent = msg;
    b.classList.add('is-show');
    if (b.__svTimer) clearTimeout(b.__svTimer);
    b.__svTimer = setTimeout(function(){ b.classList.remove('is-show'); }, ok ? 4000 : 5000);
  }

  function bind(form){
    if (form.dataset.svNlBound) return;
    form.dataset.svNlBound = '1';
    form.addEventListener('submit', function(e){
      var input = form.querySelector('input[name="contact[email]"], input[type="email"]');
      if (!input) return;
      var val = (input.value || '').trim();
      if (!VALID.test(val)) {
        e.preventDefault();
        pop(form, false, 'Please enter a valid email address');
        input.style.borderColor = '#F09595';
        input.addEventListener('input', function fix(){
          input.style.borderColor = '';
          input.removeEventListener('input', fix);
        });
        return;
      }
      e.preventDefault();
      fetch(form.getAttribute('action') || '/contact', {
        method: 'POST',
        body: new FormData(form),
        credentials: 'same-origin',
        redirect: 'follow'
      }).then(function(res){
        if (!res.ok || (res.url && res.url.indexOf('challenge') !== -1)) {
          form.submit();
          return;
        }
        input.value = '';
        pop(form, true, 'Thanks for subscribing!');
      }).catch(function(){
        form.submit();
      });
    });
  }

  function init(){
    var forms = document.querySelectorAll('.sava-footer form');
    for (var i = 0; i < forms.length; i++) bind(forms[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  document.addEventListener('shopify:section:load', init);
})();


/* ===== SV Teaser (password page) helpers (2026-07-23) =====
   1) Countdown: reads the editable ISO datetime from .teaser-countdown_target
      (blank/invalid -> stays at 00) and ticks the four .teaser-countdown_num
      tiles in DOM order: days, hours, minutes, seconds.
   2) Founder background: paints .section_teaser-founder with the hex rendered
      into .teaser-founder_bg-hex by the section's Background Color picker
      (Liquid can't reach the section tag's style; JS painter is the proven route).
   3) Signup: posts the email to Klaviyo's list-subscribe endpoint using the
      list id from the hidden .teaser-signup_klaviyo setting, with the same
      .sv-nl-bubble feedback used by the footer newsletter. The endpoint only
      accepts opaque cross-origin posts, so the bubble confirms the SEND. */
(function(){
  function initCountdown(){
    var sec = document.querySelector('.section_teaser-countdown');
    if (!sec || sec.dataset.svCd) return;
    var nums = sec.querySelectorAll('.teaser-countdown_num');
    var tgt = sec.querySelector('.teaser-countdown_target');
    if (nums.length < 4 || !tgt) return;
    var when = Date.parse((tgt.textContent || '').trim());
    if (isNaN(when)) return;
    sec.dataset.svCd = '1';
    function pad(n){ return (n < 10 ? '0' : '') + n; }
    function tick(){
      var diff = Math.max(0, when - Date.now());
      nums[0].textContent = pad(Math.floor(diff / 86400000));
      nums[1].textContent = pad(Math.floor(diff % 86400000 / 3600000));
      nums[2].textContent = pad(Math.floor(diff % 3600000 / 60000));
      nums[3].textContent = pad(Math.floor(diff % 60000 / 1000));
    }
    tick();
    setInterval(tick, 1000);
  }

  function paintFounder(){
    document.querySelectorAll('.section_teaser-founder').forEach(function(sec){
      var hexEl = sec.querySelector('.teaser-founder_bg-hex');
      if (!hexEl) return;
      var hex = (hexEl.textContent || '').trim();
      if (/^#[0-9a-fA-F]{3,8}$/.test(hex)) sec.style.backgroundColor = hex;
    });
  }

  function ensureBubble(host){
    var b = host.querySelector('.sv-nl-bubble');
    if (!b) {
      b = document.createElement('div');
      b.className = 'sv-nl-bubble';
      b.setAttribute('role', 'status');
      var i = document.createElement('span'); i.className = 'sv-nl-bubble_icon';
      var t = document.createElement('span'); t.className = 'sv-nl-bubble_text';
      b.appendChild(i); b.appendChild(t);
      host.appendChild(b);
    }
    return b;
  }

  function pop(host, ok, msg){
    var b = ensureBubble(host);
    b.classList.toggle('is-error', !ok);
    b.querySelector('.sv-nl-bubble_icon').textContent = ok ? '\u2713' : '\u2715';
    b.querySelector('.sv-nl-bubble_text').textContent = msg;
    b.classList.add('is-show');
    if (b.__svTimer) clearTimeout(b.__svTimer);
    b.__svTimer = setTimeout(function(){ b.classList.remove('is-show'); }, ok ? 4000 : 5000);
  }

  function initSignup(){
    var sec = document.querySelector('.section_teaser-signup');
    if (!sec) return;
    var form = sec.querySelector('form');
    if (!form || form.dataset.svTeaser) return;
    form.dataset.svTeaser = '1';
    var VALID = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    /* stopPropagation: Webflow's own form script listens for submit at the
       document level and would fire a doomed AJAX post to its dead endpoint,
       flashing the "Oops!" fail banner over our bubble. */
    form.addEventListener('submit', function(e){
      e.preventDefault();
      e.stopPropagation();
      var host = sec.querySelector('.teaser-signup_form-wrap') || form;
      var input = form.querySelector('input[type="email"]');
      var listEl = sec.querySelector('.teaser-signup_klaviyo');
      var list = listEl ? (listEl.textContent || '').trim() : '';
      var val = input ? (input.value || '').trim() : '';
      if (!VALID.test(val)) {
        pop(host, false, 'Please enter a valid email address');
        return;
      }
      if (!list || list === 'KLAVIYO_LIST_ID') {
        pop(host, false, 'Signup is not connected yet');
        return;
      }
      var body = 'g=' + encodeURIComponent(list) + '&email=' + encodeURIComponent(val);
      fetch('https://manage.kmail-lists.com/ajax/subscriptions/subscribe', {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
      }).then(function(){
        input.value = '';
        pop(host, true, 'Thanks for subscribing!');
      }).catch(function(){
        pop(host, false, 'Something went wrong \u2014 please try again');
      });
    });
  }

  function init(){ initCountdown(); paintFounder(); initSignup(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  document.addEventListener('shopify:section:load', init);
  document.addEventListener('shopify:section:select', function(){ paintFounder(); });
})();


/* ===== SV Rewards Banner marquee (2026-07-28) =====
   The Webflow section holds ONE item (editable text + icon). This helper
   clones it to fill a seamless loop and scrolls the track. Speed (px/s)
   comes from the data-sv-marquee attribute value. Respects
   prefers-reduced-motion by leaving the banner static. */
(function(){
  function initMarquee(){
    var tracks = document.querySelectorAll('[data-sv-marquee]');
    for (var t = 0; t < tracks.length; t++) (function(track){
      if (track.dataset.svMarqueeBound) return;
      var item = track.firstElementChild;
      if (!item || !item.offsetWidth) return;
      track.dataset.svMarqueeBound = '1';
      var setWidth = item.offsetWidth;
      var clones = Math.max(1, Math.ceil(window.innerWidth / setWidth));
      for (var i = 0; i < clones; i++) track.appendChild(item.cloneNode(true));
      var setCount = clones + 1;
      for (var j = 0; j < setCount; j++) track.appendChild(track.children[j].cloneNode(true));
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      var loopWidth = 0;
      for (var k = 0; k < setCount; k++) loopWidth += track.children[k].offsetWidth;
      var speed = parseFloat(track.getAttribute('data-sv-marquee')) || 60;
      var pos = 0, last = performance.now();
      function tick(now){
        var dt = (now - last) / 1000; last = now;
        pos -= speed * dt;
        if (-pos >= loopWidth) pos += loopWidth;
        track.style.transform = 'translateX(' + pos + 'px)';
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    })(tracks[t]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMarquee);
  else initMarquee();
  window.addEventListener('load', initMarquee);
  document.addEventListener('shopify:section:load', initMarquee);
})();


/* ===== SV Carousel Hero — high-res srcset upgrade (2026-07-30) =====
   Liquiflow's image_tag caps the hero slides at width=1000 (largest
   srcset candidate, no sizes attr), which upscales blurry on full-bleed
   desktop and retina. Rebuild each slide's srcset from the base CDN URL
   with real width candidates + sizes=100vw. Shopify's CDN generates any
   requested width on demand and never upscales past the original upload,
   so oversized candidates are safe. */
(function(){
  var WIDTHS = [832, 1200, 1600, 2000, 2600, 3200];
  function upgradeHeroImages(){
    var imgs = document.querySelectorAll('[id*="sv_carousel_hero"] img');
    for (var i = 0; i < imgs.length; i++) (function(img){
      if (img.dataset.svHiresDone) return;
      var src = img.getAttribute('src') || '';
      var base = src.split('&width=')[0].split('?width=')[0];
      if (!/\/cdn\/shop\//.test(base)) return;
      img.dataset.svHiresDone = '1';
      var sep = base.indexOf('?') === -1 ? '?' : '&';
      var set = [];
      for (var w = 0; w < WIDTHS.length; w++) set.push(base + sep + 'width=' + WIDTHS[w] + ' ' + WIDTHS[w] + 'w');
      img.setAttribute('srcset', set.join(', '));
      img.setAttribute('sizes', '100vw');
      img.setAttribute('src', base + sep + 'width=2000');
    })(imgs[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', upgradeHeroImages);
  else upgradeHeroImages();
  window.addEventListener('load', upgradeHeroImages);
  document.addEventListener('shopify:section:load', upgradeHeroImages);
})();
