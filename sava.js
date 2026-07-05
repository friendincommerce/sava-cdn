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
  document.addEventListener('DOMContentLoaded', buildSortGroup);
  buildSortGroup();
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
        var ps = document.createElement('predictive-search');
        ps.className = 'sv-nav-search_inner';
        ps.appendChild(panel.querySelector('form'));
        var results = document.createElement('div');
        results.id = 'predictive-search';
        results.className = 'sv-nav-search_results';
        results.style.display = 'none';
        ps.appendChild(results);
        panel.appendChild(ps);
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
