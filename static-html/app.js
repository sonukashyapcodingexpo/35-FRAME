/* global gsap, ScrollTrigger, ScrollToPlugin, gtag */

/** Local images live under static-html/assets/ (same as <img src="./assets/..."> in index.html). */
const ASSET = "./assets";

function qs(sel, root = document) {
  return root.querySelector(sel);
}
function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function isMobileUA() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || "");
}

function safeGsap() {
  if (!window.gsap) return null;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);
  return gsap;
}

function smoothScrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const g = safeGsap();
  if (!g || !window.ScrollToPlugin) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  g.to(window, {
    duration: 1.2,
    scrollTo: { y: el, offsetY: 80 },
    ease: "power2.inOut",
  });
}

function initLoadingOverlay() {
  const overlay = qs("#loadingOverlay");
  const pageRoot = qs("#pageRoot");
  if (!overlay || !pageRoot) return;

  setTimeout(() => {
    overlay.classList.add("pointer-events-none");
    overlay.style.transition = "opacity 400ms ease";
    overlay.style.opacity = "0";
    pageRoot.classList.remove("opacity-0");
    pageRoot.classList.add("opacity-100");
    setTimeout(() => overlay.remove(), 450);
  }, 1500);
}

function initHeader() {
  const header = qs("#siteHeader");
  const logoLink = qs("#logoLink");
  const getQuote = qs("#getQuoteBtn");
  if (!header) return;

  // Intro animation
  const g = safeGsap();
  if (g) {
    g.set(header, { y: -100 });
    g.to(header, { y: 0, duration: 0.8, ease: "power3.out", delay: 0.2 });
    const logoWrap = qs("#headerLogoWrap");
    if (logoWrap) {
      g.fromTo(
        logoWrap,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)", delay: 0.4 },
      );
    }
    if (getQuote) {
      g.fromTo(
        getQuote,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)", delay: 1.0 },
      );

      const shine = document.createElement("div");
      shine.className = "shine-effect";
      shine.style.cssText = `
        position:absolute;top:0;left:-100%;
        width:100%;height:100%;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent);
        transition:left .5s;z-index:1;`;
      getQuote.style.position = "relative";
      getQuote.style.overflow = "hidden";
      getQuote.appendChild(shine);

      const onEnter = () => {
        g.to(getQuote, {
          scale: 1.05,
          y: -2,
          boxShadow: "0 10px 25px rgba(245, 158, 11, 0.4)",
          duration: 0.3,
          ease: "power2.out",
        });
        shine.style.left = "100%";
      };
      const onLeave = () => {
        g.to(getQuote, {
          scale: 1,
          y: 0,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          duration: 0.3,
          ease: "power2.out",
        });
        shine.style.left = "-100%";
      };
      getQuote.addEventListener("mouseenter", onEnter);
      getQuote.addEventListener("mouseleave", onLeave);
    }
  }

  const setHeaderOpaque = (opaque) => {
    if (opaque) {
      header.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
      header.style.backdropFilter = "blur(10px)";
      header.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)";
    } else {
      header.style.backgroundColor = "rgba(255, 255, 255, 0)";
      header.style.backdropFilter = "blur(0px)";
      header.style.boxShadow = "none";
    }
  };

  const onScroll = () => {
    setHeaderOpaque(window.scrollY > 80);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (logoLink) {
    logoLink.addEventListener("click", (e) => {
      e.preventDefault();
      smoothScrollToId("home");
    });
  }
  if (getQuote) {
    getQuote.addEventListener("click", () => smoothScrollToId("contact"));
  }
}

function createPlaceholderDataUri(label) {
  const text = encodeURIComponent(label);
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#f59e0b"/>
        <stop offset="0.5" stop-color="#ec4899"/>
        <stop offset="1" stop-color="#3b82f6"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="48" y="48" width="1104" height="704" rx="28" fill="rgba(0,0,0,0.25)"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
      font-family="Arial, Helvetica, sans-serif" font-size="52" fill="white" opacity="0.9">${text}</text>
    <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle"
      font-family="Arial, Helvetica, sans-serif" font-size="24" fill="white" opacity="0.8">Drop real images into static-html/assets/</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function createImageEl({ src, alt, className, fallbackLabel }) {
  const img = document.createElement("img");
  img.className = className;
  img.alt = alt;
  img.loading = "lazy";
  img.decoding = "async";
  img.src = src;
  img.addEventListener(
    "error",
    () => {
      img.src = createPlaceholderDataUri(fallbackLabel || alt || "Image");
    },
    { once: true },
  );
  return img;
}

function initHero() {
  const slidesRoot = qs("#heroSlides");
  const heroText = qs("#heroText");
  const heroStats = qs("#heroStats");
  const heroImage = qs("#heroImage");
  const cta = qs("#heroCtaDesktop");
  const g = safeGsap();

  if (!slidesRoot) return;

  const heroImages = [
    `${ASSET}/HeroImages/001.JPG`,
    `${ASSET}/HeroImages/002.JPG`,
    `${ASSET}/HeroImages/003.JPG`,
    `${ASSET}/HeroImages/004.JPG`,
    `${ASSET}/HeroImages/005.JPG`,
    `${ASSET}/HeroImages/006.JPG`,
    `${ASSET}/HeroImages/007.JPG`,
    `${ASSET}/HeroImages/008.JPG`,
    `${ASSET}/HeroImages/009.JPG`,
    `${ASSET}/HeroImages/0010.JPG`,
    `${ASSET}/HeroImages/0011.JPG`,
    `${ASSET}/HeroImages/0012.JPG`,
    `${ASSET}/HeroImages/0013.JPG`,
  ];
  heroImages.forEach((src, idx) => {
    const img = createImageEl({
      src,
      alt: `Hero image ${idx + 1}`,
      className: "hero-slide placeholder-img",
      fallbackLabel: `Missing ${src}`,
    });
    if (idx === 0) img.loading = "eager";
    slidesRoot.appendChild(img);
  });

  const slides = qsa(".hero-slide", slidesRoot);
  if (g && slides.length) {
    g.set(slides, { opacity: 0 });
    g.set(slides[0], { opacity: 1 });
    const tl = g.timeline({ repeat: -1, repeatDelay: 2 });
    for (let i = 1; i < slides.length; i++) {
      tl.to(slides[i - 1], { opacity: 0, duration: 1 }, "+=3");
      tl.to(slides[i], { opacity: 1, duration: 1 }, "<");
    }
    tl.to(slides[slides.length - 1], { opacity: 0, duration: 1 }, "+=3");
    tl.to(slides[0], { opacity: 1, duration: 1 }, "<");
  }

  // Entrance animations similar to original
  if (g && heroText) {
    const items = qsa("h1, h2, p, .blue-badge", heroText);
    g.fromTo(items, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" });
  }
  if (g && heroStats) {
    const stats = qsa(".stat-item", heroStats);
    g.fromTo(stats, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.5)", delay: 0.3 });
  }
  if (g && heroImage) {
    g.fromTo(heroImage, { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.2 });
  }

  if (g && cta) {
    // Align to the single-page static flow
    cta.addEventListener("click", (e) => {
      e.preventDefault();
      smoothScrollToId("contact");
    });

    g.fromTo(cta, { scale: 0.8, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.7)", delay: 0.8 });

    const pulse = document.createElement("div");
    pulse.style.cssText = `
      position:absolute;top:50%;left:50%;
      width:100%;height:100%;
      background:rgba(245, 158, 11, 0.3);
      border-radius:inherit;
      transform:translate(-50%,-50%);
      z-index:-1;opacity:0;`;
    cta.style.position = "relative";
    cta.appendChild(pulse);

    cta.addEventListener("mouseenter", () => {
      g.to(cta, { scale: 1.05, y: -3, boxShadow: "0 15px 30px rgba(245, 158, 11, 0.4)", duration: 0.3, ease: "power2.out" });
      g.to(pulse, { scale: 1.2, opacity: 1, duration: 0.3, ease: "power2.out" });
    });
    cta.addEventListener("mouseleave", () => {
      g.to(cta, { scale: 1, y: 0, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", duration: 0.3, ease: "power2.out" });
      g.to(pulse, { scale: 1, opacity: 0, duration: 0.3, ease: "power2.out" });
    });
    cta.addEventListener("click", () => {
      g.to(cta, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.inOut" });
    });
    g.to(cta, { scale: 1.02, duration: 2, ease: "power2.inOut", yoyo: true, repeat: -1, delay: 3 });
  }
}

function initGallery() {
  const grid = qs("#galleryGrid");
  if (!grid) return;

  const galleryImages = [
    `${ASSET}/Row1/01.jpg`,
    `${ASSET}/Row1/02.jpg`,
    `${ASSET}/Row1/03.jpg`,
    `${ASSET}/Row1/04.jpg`,
    `${ASSET}/Row1/05.jpg`,
    `${ASSET}/Row1/06.jpg`,
    `${ASSET}/Row1/07.jpg`,
    `${ASSET}/Row2/01.jpg`,
    `${ASSET}/Row2/02.jpg`,
    `${ASSET}/Row2/03.jpg`,
    `${ASSET}/Row2/04.jpg`,
    `${ASSET}/Row2/05.jpg`,
    `${ASSET}/Row2/06.jpg`,
    `${ASSET}/Row3/imgi_14_5-10.jpg`,
    `${ASSET}/Row3/imgi_15_8-9.jpg`,
    `${ASSET}/Row3/imgi_17_2-10.jpg`,
    `${ASSET}/Row3/imgi_18_3-10.jpg`,
    `${ASSET}/Row3/imgi_21_9-9.jpg`,
    `${ASSET}/Row3/imgi_22_10-8.jpg`,
    `${ASSET}/Row4/imgi_10_35F03378-scaled.jpg`,
    `${ASSET}/Row4/imgi_11_35F03314-scaled.jpg`,
    `${ASSET}/Row4/imgi_12_35F03284-scaled.jpg`,
    `${ASSET}/Row4/imgi_13_35F03397-scaled.jpg`,
    `${ASSET}/Row4/imgi_14_35F03534-1-scaled.jpg`,
    `${ASSET}/Row4/imgi_15_35F03594-scaled.jpg`,
    `${ASSET}/Row4/imgi_30_35F03696-scaled.jpg`,
    `${ASSET}/Row4/imgi_4_35F03663-scaled.jpg`,
    `${ASSET}/Row4/imgi_8_35F03199-scaled.jpg`,
  ];

  galleryImages.forEach((src, idx) => {
    const wrap = document.createElement("div");
    wrap.className = "relative w-full overflow-hidden rounded-lg shadow-md aspect-16-9";

    const img = createImageEl({
      src,
      alt: `Gallery image ${idx + 1}`,
      className: "placeholder-img",
      fallbackLabel: `Missing ${src}`,
    });
    wrap.appendChild(img);
    grid.appendChild(wrap);
  });
}

function initServicesAnimations() {
  const g = safeGsap();
  if (!g || !window.ScrollTrigger) return;

  const section = qs('[data-animate="services-section"]');
  const title = qs('[data-animate="services-title"]');
  const steps = qsa('[data-animate="services-step"]');
  const arrows = qsa('[data-animate="services-arrow"]');
  if (!section) return;

  ScrollTrigger.create({
    trigger: section,
    start: "top 80%",
    onEnter: () => g.fromTo(section, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }),
  });

  if (title) {
    ScrollTrigger.create({
      trigger: title,
      start: "top 85%",
      onEnter: () => g.fromTo(title, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.2 }),
    });
  }

  steps.forEach((step, idx) => {
    ScrollTrigger.create({
      trigger: step,
      start: "top 85%",
      onEnter: () =>
        g.fromTo(
          step,
          { y: 50, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, delay: 0.4 + idx * 0.2, ease: "back.out(1.7)" },
        ),
    });
  });

  arrows.forEach((arrow, idx) => {
    ScrollTrigger.create({
      trigger: arrow,
      start: "top 90%",
      onEnter: () =>
        g.fromTo(arrow, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, delay: 0.8 + idx * 0.2, ease: "power2.out" }),
    });
    g.to(arrow, { x: 10, duration: 1.5, repeat: -1, yoyo: true, ease: "power2.inOut", delay: 1.5 + idx * 0.2 });
  });
}

function initOfferAnimations() {
  const g = safeGsap();
  if (!g || !window.ScrollTrigger) return;
  const offer = qs("#offerContent");
  if (!offer) return;

  g.fromTo(
    offer,
    { y: 30, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: offer, start: "top 80%" },
    },
  );

  const tag = qs(".offer-tag", offer);
  if (tag) {
    g.to(tag, { scale: 1.05, duration: 2, repeat: -1, yoyo: true, ease: "power1.inOut", delay: 1.2 });
  }
}

function initContact() {
  const g = safeGsap();
  const section = qs("#contactSection");
  const titleEl = qs("#contactTitle");
  const subEl = qs("#contactSubtitle");
  const form = qs("#contactForm");
  const submitBtn = qs("#submitBtn");
  if (!section || !titleEl || !subEl || !form || !submitBtn) return;

  const titleText = "Let's Create Something Amazing Together";
  const subtitleText =
    "Ready to capture your perfect moments? Get in touch with us today and let's discuss your photography needs.";

  titleEl.textContent = "";
  subEl.textContent = "";

  if (g && window.ScrollTrigger) {
    const tl = g.timeline({
      scrollTrigger: { trigger: section, start: "top 70%" },
    });

    tl.to(
      {},
      {
        duration: titleText.length * 0.05,
        ease: "none",
        onUpdate() {
          const p = this.progress();
          const len = Math.floor(p * titleText.length);
          titleEl.textContent = titleText.substring(0, len);
        },
      },
    );
    tl.to(
      {},
      {
        duration: subtitleText.length * 0.03,
        ease: "none",
        onUpdate() {
          const p = this.progress();
          const len = Math.floor(p * subtitleText.length);
          subEl.textContent = subtitleText.substring(0, len);
        },
      },
      "+=0.5",
    );

    g.fromTo(
      ".form-field",
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: form, start: "top 80%" },
      },
    );

    g.fromTo(
      ".submit-btn",
      { opacity: 0, scale: 0.8, rotationY: 180 },
      {
        opacity: 1,
        scale: 1,
        rotationY: 0,
        duration: 1,
        ease: "back.out(1.7)",
        scrollTrigger: { trigger: form, start: "bottom 90%" },
      },
    );

    // Advanced submit hover background like original
    const gradientBg = document.createElement("div");
    gradientBg.className = "gradient-bg";
    gradientBg.style.cssText = `
      position:absolute;top:0;left:0;right:0;bottom:0;
      background:linear-gradient(45deg,#3b82f6,#8b5cf6,#ec4899,#f59e0b);
      background-size:400% 400%;
      border-radius:inherit;
      opacity:0;z-index:-1;`;
    submitBtn.style.position = "relative";
    submitBtn.style.overflow = "hidden";
    submitBtn.appendChild(gradientBg);

    submitBtn.addEventListener("mouseenter", () => {
      g.to(submitBtn, { scale: 1.05, y: -2, duration: 0.3, ease: "power2.out" });
      g.to(gradientBg, { opacity: 1, duration: 0.3, ease: "power2.out" });
      g.to(gradientBg, { backgroundPosition: "100% 100%", duration: 2, ease: "none", repeat: -1, yoyo: true });
    });
    submitBtn.addEventListener("mouseleave", () => {
      g.to(submitBtn, { scale: 1, y: 0, duration: 0.3, ease: "power2.out" });
      g.to(gradientBg, { opacity: 0, duration: 0.3, ease: "power2.out" });
    });
    submitBtn.addEventListener("click", () => {
      g.to(submitBtn, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.inOut" });
    });
  }

  const label = qs(".submit-label", submitBtn);
  const loading = qs(".submit-loading", submitBtn);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    submitBtn.disabled = true;
    if (label) label.classList.add("hidden");
    if (loading) loading.classList.remove("hidden");

    try {
      // Simulate API delay
      await new Promise((r) => setTimeout(r, 2000));

      // Conversion event (same ID as original)
      if (typeof window.gtag === "function") {
        window.gtag("event", "conversion", { send_to: "AW-17652294834/rH7rCN3wv60bELLJouFB" });
      }

      // Success animation sequence
      if (g) {
        g.timeline()
          .to(submitBtn, { scale: 1.1, backgroundColor: "#10b981", duration: 0.3, ease: "back.out(1.7)" })
          .to(submitBtn, { scale: 1, duration: 0.2, ease: "power2.out" })
          .to(submitBtn, { backgroundColor: "#3b82f6", duration: 0.5, delay: 1, ease: "power2.out" });
      }

      // Reset
      form.reset();
      // eslint-disable-next-line no-console
      console.log("Form submitted:", payload);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Form submission error:", err);
      if (g) g.to(submitBtn, { x: [-10, 10, -10, 10, 0], duration: 0.5, ease: "power2.out" });
    } finally {
      submitBtn.disabled = false;
      if (label) label.classList.remove("hidden");
      if (loading) loading.classList.add("hidden");
    }
  });
}

function initTestimonials() {
  const g = safeGsap();
  const section = qs("#testimonials");
  const scroller = qs("#testimonialsScroller");
  if (!section || !scroller) return;

  const testimonials = [
    {
      name: "Buvana V",
      position: "Wedding Client",
      location: "Bangalore",
      rating: 5,
      text:
        "He is a wonderful and a very friendly photographer... All the photos are very beautiful.. He covered every important moment of the entire event... He edited all the photos so nicely.. And we had a lot of requirements on the album side and he fulfilled all our requirements very patiently... The album is really amazing and he gave it on time... we were really happy to work with him and We strongly recommend him...",
    },
    {
      name: "Sunitha B",
      position: "Event Client",
      location: "Bangalore",
      rating: 5,
      text:
        "We hired photography and videography for my son's first holy communion. Somu and his team are very friendly, patient and professionals. I really loved there service. Never experienced such a good service with great smiles on there faces throughout the event so patiently handling all the guests request to click. Though we were busy Somu ensured to click our family pictures. I loved the pictures, candid videos and the final highlight video. Team proved there proficiency. All the best team. For your genuine service you will reach heights soon. God bless.",
    },
    {
      name: "Sutirtha C",
      position: "Photography Client",
      location: "Bangalore",
      rating: 5,
      text:
        "The service offered by 35 frames Photography was fantastic, with the professionals explaining each and every process in detail. The final output was worth every single rupee. They were also punctual in completing the order.",
    },
    {
      name: "Priya Sharma",
      position: "Wedding Client",
      location: "Bangalore",
      rating: 5,
      text:
        "The team captured our wedding day perfectly! Every emotion, every moment was beautifully preserved. The album they created exceeded our expectations. Highly recommend their services to anyone in Bangalore looking for professional wedding photography.",
    },
    {
      name: "Rahul Patel",
      position: "Corporate Client",
      location: "Bangalore",
      rating: 5,
      text:
        "We hired them for our company's annual event photography and the results were outstanding. Professional, punctual, and delivered high-quality images that perfectly captured our brand's essence. Somu and his team are incredibly talented.",
    },
    {
      name: "Anita Reddy",
      position: "Pre-Wedding Client",
      location: "Bangalore",
      rating: 5,
      text:
        "Amazing pre-wedding shoot experience with 35 Frames Photography! Somu made us feel comfortable throughout the session and the photos turned out absolutely stunning. The creativity and attention to detail is remarkable.",
    },
    {
      name: "Vikram Singh",
      position: "Wedding Client",
      location: "Bangalore",
      rating: 5,
      text:
        "Outstanding service from start to finish. The team was professional, friendly, and captured every precious moment of our special day. The quality of photos and videos exceeded our expectations. Highly recommended!",
    },
    {
      name: "Meera Krishnan",
      position: "Family Portrait Client",
      location: "Bangalore",
      rating: 5,
      text:
        "Wonderful experience with 35 Frames Photography for our family portraits. Somu has an eye for detail and made sure everyone looked their best. The final photos were delivered on time and beautifully edited.",
    },
    {
      name: "Arjun Kumar",
      position: "Engagement Client",
      location: "Bangalore",
      rating: 5,
      text:
        "Fantastic engagement shoot! The team was creative, professional, and made the entire experience enjoyable. The photos captured our love story perfectly. Thank you 35 Frames Photography for the beautiful memories!",
    },
    {
      name: "Deepika Nair",
      position: "Wedding Client",
      location: "Bangalore",
      rating: 5,
      text:
        "Exceptional wedding photography service! Somu and his team covered every ritual and moment with such precision. The candid shots are absolutely beautiful and the traditional photography is top-notch. Worth every penny!",
    },
  ];

  const renderCard = (t) => {
    const card = document.createElement("div");
    card.className =
      "testimonial-card bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow flex-shrink-0 w-80 opacity-0";
    card.innerHTML = `
      <div class="mb-4">
        <h3 class="font-semibold text-gray-900">${t.name}</h3>
        <p class="text-sm text-gray-600">${t.position}</p>
        <p class="text-xs text-gray-500">${t.location}</p>
      </div>
      <div class="flex mb-3">${Array.from({ length: t.rating })
        .map(
          () => `
        <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>`,
        )
        .join("")}</div>
      <p class="text-gray-700 text-sm leading-relaxed">${t.text}</p>
    `;
    return card;
  };

  // Double set for loop
  testimonials.forEach((t) => scroller.appendChild(renderCard(t)));
  testimonials.forEach((t) => scroller.appendChild(renderCard(t)));

  if (g && window.ScrollTrigger) {
    g.fromTo(
      ".testimonials-title",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: section, start: "top 80%" } },
    );
    g.fromTo(
      ".testimonials-subtitle",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "power3.out", scrollTrigger: { trigger: section, start: "top 80%" } },
    );

    g.fromTo(
      ".testimonial-card",
      { opacity: 0, y: 50, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.06, ease: "power3.out", scrollTrigger: { trigger: section, start: "top 70%" } },
    );

    // Continuous scroller (paused until visible)
    const totalWidth = scroller.scrollWidth;
    const scrollAnim = g.to(scroller, {
      x: -totalWidth / 2,
      duration: 133,
      ease: "none",
      repeat: -1,
      paused: true,
    });

    ScrollTrigger.create({
      trigger: section,
      start: "top 80%",
      onEnter: () => scrollAnim.play(),
      onLeave: () => scrollAnim.pause(),
      onEnterBack: () => scrollAnim.play(),
      onLeaveBack: () => scrollAnim.pause(),
    });
  } else {
    // Fallback: simple CSS animation
    scroller.style.animation = "marquee 133s linear infinite";
  }
}

function initFooter() {
  const g = safeGsap();
  const footer = qs("#siteFooter");
  if (!footer) return;

  const contactBtn = qs("#footerContactBtn");
  if (contactBtn) contactBtn.addEventListener("click", () => smoothScrollToId("contact"));

  if (!g || !window.ScrollTrigger) return;

  ScrollTrigger.create({
    trigger: footer,
    start: "top 80%",
    onEnter: () => g.fromTo(footer, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }),
  });

  const logo = qs('[data-animate="footer-logo"]');
  if (logo) {
    ScrollTrigger.create({
      trigger: logo,
      start: "top 85%",
      onEnter: () => g.fromTo(logo, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)", delay: 0.2 }),
    });
  }

  const sections = qsa('[data-animate="footer-section"]');
  sections.forEach((sec, idx) => {
    ScrollTrigger.create({
      trigger: sec,
      start: "top 85%",
      onEnter: () => g.fromTo(sec, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.4 + idx * 0.1, ease: "power2.out" }),
    });
  });

  const socials = qsa(".social-link", footer);
  socials.forEach((a, idx) => {
    ScrollTrigger.create({
      trigger: a,
      start: "top 90%",
      onEnter: () => g.fromTo(a, { scale: 0, rotation: 180 }, { scale: 1, rotation: 0, duration: 0.5, delay: 0.8 + idx * 0.1, ease: "back.out(1.7)" }),
    });
    a.addEventListener("mouseenter", () => g.to(a, { scale: 1.2, y: -5, duration: 0.3, ease: "power2.out" }));
    a.addEventListener("mouseleave", () => g.to(a, { scale: 1, y: 0, duration: 0.3, ease: "power2.out" }));
  });

  const contacts = qsa('[data-animate="footer-contact"]', footer);
  contacts.forEach((c, idx) => {
    ScrollTrigger.create({
      trigger: c,
      start: "top 90%",
      onEnter: () => g.fromTo(c, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, delay: 1 + idx * 0.1, ease: "power2.out" }),
    });
  });
}

function initAudioAndToggle() {
  const audio = qs("#bgAudio");
  const toggle = qs("#audioToggleBtn");
  const iconMuted = qs("#audioIconMuted");
  const iconOn = qs("#audioIconOn");
  const unlockOverlay = qs("#audioUnlockOverlay");
  const unlockBtn = qs("#audioUnlockBtn");
  if (!audio || !toggle || !iconMuted || !iconOn || !unlockOverlay || !unlockBtn) return;

  const setEnabled = (enabled) => {
    if (enabled) {
      iconMuted.classList.add("hidden");
      iconOn.classList.remove("hidden");
      toggle.setAttribute("aria-label", "Mute background audio");
    } else {
      iconOn.classList.add("hidden");
      iconMuted.classList.remove("hidden");
      toggle.setAttribute("aria-label", "Unmute background audio");
    }
  };

  audio.muted = false;
  audio.autoplay = true;
  audio.preload = "auto";
  audio.volume = 1.0;
  try { audio.load(); } catch (_) {}

  const interactionEvents = ["pointerdown", "pointerup", "click", "touchstart", "touchend", "keydown"];

  const tryPlay = () =>
    audio
      .play()
      .then(() => {
        setEnabled(true);
        unlockOverlay.classList.add("hidden");
        unlockOverlay.classList.remove("flex");
      })
      .catch(() => {
        audio.muted = true;
        setEnabled(false);
        if (isMobileUA()) {
          unlockOverlay.classList.remove("hidden");
          unlockOverlay.classList.add("flex");
        }
      });

  const unlock = () => {
    audio.muted = false;
    tryPlay();
    interactionEvents.forEach((evt) => window.removeEventListener(evt, unlock));
  };

  tryPlay().catch(() => {});
  interactionEvents.forEach((evt) => window.addEventListener(evt, unlock, { once: true }));

  unlockBtn.addEventListener("click", unlock);

  toggle.addEventListener("click", () => {
    if (audio.muted) {
      audio.muted = false;
      audio.play().catch(() => {});
      setEnabled(true);
    } else {
      audio.muted = true;
      setEnabled(false);
    }
  });
}

function initAnchorLinks() {
  // Ensure all in-page anchor clicks use GSAP smooth scroll
  qsa('a[href^="#"]').forEach((a) => {
    const href = a.getAttribute("href") || "";
    const id = href.slice(1);
    if (!id) return;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      smoothScrollToId(id);
    });
  });
}

function runInit(name, fn) {
  try {
    fn();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[35frames static] ${name} failed:`, err);
  }
}

function main() {
  safeGsap();
  runInit("loading", initLoadingOverlay);
  runInit("header", initHeader);
  runInit("hero", initHero);
  runInit("gallery", initGallery);
  runInit("services", initServicesAnimations);
  runInit("offer", initOfferAnimations);
  runInit("contact", initContact);
  runInit("testimonials", initTestimonials);
  runInit("footer", initFooter);
  runInit("audio", initAudioAndToggle);
  runInit("anchors", initAnchorLinks);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main, { once: true });
} else {
  main();
}

