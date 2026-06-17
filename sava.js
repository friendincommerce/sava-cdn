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
	var sync = function(){ nav.classList.toggle('sava-nav-open', btn.classList.contains('w--open')); };
	new MutationObserver(sync).observe(btn, {attributes:true, attributeFilter:['class']});
	sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
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
