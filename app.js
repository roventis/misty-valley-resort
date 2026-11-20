/**
 * MISTY VALLEY RESORT & EVENTS — Interactive Controller
 * Arched doorways, golden hour scroll physics, room arch morphing,
 * sun arc timeline tracking, and Coorg map pin illumination.
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initHeroArchScroll(prefersReducedMotion);
  initRoomSelectorMorph(prefersReducedMotion);
  initPoolArchDrift(prefersReducedMotion);
  initSunArcTimeline(prefersReducedMotion);
  initCoorgMapPins();
  initReservationForm();
  initSmoothScroll();
});

/**
 * 1. Hero Arch: Scrolling widens the hero arch until photo fills screen, caption fades in
 */
function initHeroArchScroll(prefersReducedMotion) {
  if (prefersReducedMotion) return;

  const archWrapper = document.getElementById('heroArchWrapper');
  const caption = document.getElementById('heroArchCaption');
  const heroSection = document.getElementById('hero');
  if (!archWrapper || !heroSection) return;

  let ticking = false;

  const onScroll = () => {
    const rect = heroSection.getBoundingClientRect();
    const windowH = window.innerHeight;

    // How far through hero section we have scrolled (0 to 1)
    const progress = Math.min(Math.max(-rect.top / (rect.height * 0.7), 0), 1);

    if (progress > 0) {
      // Widen the arch from 440px up to 580px
      const currentWidth = 440 + progress * 140;
      archWrapper.style.maxWidth = `${currentWidth}px`;
    } else {
      archWrapper.style.maxWidth = '440px';
    }

    if (caption) {
      if (progress >= 0.35) {
        caption.classList.add('revealed');
      } else {
        caption.classList.remove('revealed');
      }
    }

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
}

/**
 * 2. Room Selector: Numbered rooms beside large arched photo and giant terracotta number.
 * Choosing a room slowly opens its photo from a narrow arch inside the old one.
 */
function initRoomSelectorMorph(prefersReducedMotion) {
  const navItems = document.querySelectorAll('.room-nav-item');
  const giantNum = document.getElementById('giantRoomNum');
  const showcaseTitle = document.getElementById('showcaseTitle');
  const showcasePrice = document.getElementById('showcasePrice');
  const activePhoto = document.getElementById('roomActivePhoto');
  const emergingArch = document.getElementById('roomEmergingArch');
  const emergingPhoto = document.getElementById('roomEmergingPhoto');

  if (!navItems.length || !activePhoto || !emergingArch) return;

  const roomData = {
    'mountain-view': {
      roman: 'I',
      title: 'Luxury Mountain-View Room',
      price: 'Starting from ₹4,999 per night',
      img: 'photos/room-mountain-view.jpg'
    },
    'private-cottage': {
      roman: 'II',
      title: 'Private Plantation Cottage',
      price: 'Starting from ₹7,999 per night',
      img: 'photos/room-cottage.jpg'
    },
    'family-suite': {
      roman: 'III',
      title: 'Family Heritage Suite',
      price: 'Starting from ₹9,999 per night',
      img: 'photos/room-family-suite.jpg'
    },
    'honeymoon-villa': {
      roman: 'IV',
      title: 'Premium Honeymoon Villa',
      price: 'Starting from ₹12,999 per night',
      img: 'photos/room-honeymoon-villa.jpg'
    }
  };

  let currentRoomId = 'mountain-view';
  let isMorphing = false;

  const selectRoom = (roomId) => {
    if (roomId === currentRoomId || isMorphing) return;
    const data = roomData[roomId];
    if (!data) return;

    currentRoomId = roomId;
    isMorphing = true;

    // Update nav active states
    navItems.forEach(item => {
      const isSelected = item.dataset.roomId === roomId;
      item.classList.toggle('active', isSelected);
      item.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });

    // Update Roman Numeral & Captions
    if (giantNum) giantNum.textContent = data.roman;
    if (showcaseTitle) showcaseTitle.textContent = data.title;
    if (showcasePrice) showcasePrice.textContent = data.price;

    if (prefersReducedMotion) {
      activePhoto.src = data.img;
      isMorphing = false;
      return;
    }

    // Emerging Arch Morph Opening
    emergingPhoto.src = data.img;
    emergingArch.classList.add('opening');

    setTimeout(() => {
      activePhoto.src = data.img;
      emergingArch.classList.remove('opening');
      isMorphing = false;
    }, 780);
  };

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      selectRoom(item.dataset.roomId);
    });

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectRoom(item.dataset.roomId);
      }
    });
  });
}

/**
 * 3. The Pool: Drifting words that separate as you scroll, revealing the center arch
 */
function initPoolArchDrift(prefersReducedMotion) {
  if (prefersReducedMotion) return;

  const poolSection = document.getElementById('pool');
  const driftLeft = document.getElementById('driftLeft');
  const driftRight = document.getElementById('driftRight');
  const centerArch = document.getElementById('poolCenterArchBox');
  if (!poolSection || !driftLeft || !driftRight || !centerArch) return;

  let ticking = false;

  const onScroll = () => {
    const rect = poolSection.getBoundingClientRect();
    const windowH = window.innerHeight;

    // Active while pool is in viewport
    if (rect.top < windowH && rect.bottom > 0) {
      const progress = Math.min(Math.max((windowH - rect.top) / (windowH + rect.height * 0.5), 0), 1);
      
      // Words drift apart
      const driftPx = progress * 65;
      driftLeft.style.transform = `translateX(-${driftPx}px)`;
      driftRight.style.transform = `translateX(${driftPx}px)`;

      // Center arch widens from 240px up to 380px
      const currentWidth = 240 + progress * 140;
      centerArch.style.width = `${Math.min(currentWidth, 420)}px`;
    }

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
}

/**
 * 4. Timeline of the Day: Sun travels along a dotted SVG arc as a big clock counts the hours
 */
function initSunArcTimeline(prefersReducedMotion) {
  const sunPath = document.getElementById('sunTrackPath');
  const travelingSun = document.getElementById('travelingSun');
  const clockDigits = document.getElementById('bigClockDigits');
  const clockPhase = document.getElementById('clockPhaseName');
  const nodes = document.querySelectorAll('.time-node');
  const timelineSection = document.getElementById('timeline');

  if (!sunPath || !travelingSun) return;

  const pathLength = sunPath.getTotalLength();

  const setSunPosition = (fraction, timeText, phaseText) => {
    const clamped = Math.min(Math.max(fraction, 0), 1);
    const point = sunPath.getPointAtLength(clamped * pathLength);
    travelingSun.setAttribute('transform', `translate(${point.x.toFixed(1)}, ${point.y.toFixed(1)})`);

    if (clockDigits && timeText) clockDigits.textContent = timeText;
    if (clockPhase && phaseText) clockPhase.textContent = phaseText;
  };

  // Node clicks
  nodes.forEach(node => {
    node.addEventListener('click', () => {
      nodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');

      const progress = parseFloat(node.dataset.progress || '0.1');
      const timeStr = node.dataset.time;
      const phaseStr = node.dataset.phase;

      setSunPosition(progress, timeStr, phaseStr);
    });
  });

  // Scroll sync through timeline section
  if (!prefersReducedMotion && timelineSection) {
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = timelineSection.getBoundingClientRect();
          const windowH = window.innerHeight;

          if (rect.top < windowH * 0.7 && rect.bottom > windowH * 0.2) {
            const progress = (windowH * 0.7 - rect.top) / (rect.height);
            const clamped = Math.min(Math.max(progress, 0), 1);

            // Interpolate hour string based on clamped progress
            let timeStr = '06:00 AM';
            let phaseStr = 'Misty Dawn & Birdsong';
            let activeIdx = 0;

            if (clamped < 0.2) {
              timeStr = '06:00 AM'; phaseStr = 'Misty Dawn & Birdsong'; activeIdx = 0;
            } else if (clamped < 0.45) {
              timeStr = '08:30 AM'; phaseStr = 'Verandah Breakfast & Filter Coffee'; activeIdx = 1;
            } else if (clamped < 0.7) {
              timeStr = '12:30 PM'; phaseStr = 'Kodava Claypot Luncheon'; activeIdx = 2;
            } else if (clamped < 0.88) {
              timeStr = '04:30 PM'; phaseStr = 'Coffee Roasting & Spice Cupping'; activeIdx = 3;
            } else {
              timeStr = '08:00 PM'; phaseStr = 'Hearthfire, Barbecue & Stars'; activeIdx = 4;
            }

            setSunPosition(clamped, timeStr, phaseStr);

            nodes.forEach((n, idx) => {
              n.classList.toggle('active', idx === activeIdx);
            });
          }

          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // Initial position
  setSunPosition(0.05, '06:00 AM', 'Misty Dawn & Birdsong');
}

/**
 * 5. Local Experiences beside Drawn Map: Numbered pins light up as you read
 */
function initCoorgMapPins() {
  const expItems = document.querySelectorAll('.exp-item');
  const allPins = document.querySelectorAll('.map-pin-group');

  if (!expItems.length || !allPins.length) return;

  const highlightPin = (pinId) => {
    // Update active class on list items
    expItems.forEach(item => {
      item.classList.toggle('active', item.dataset.pinId === pinId);
    });

    // Update highlighted pin on map
    allPins.forEach(pin => {
      pin.classList.toggle('highlighted', pin.id === pinId);
    });
  };

  // Hover & Click on experience items
  expItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      highlightPin(item.dataset.pinId);
    });

    item.addEventListener('click', () => {
      highlightPin(item.dataset.pinId);
    });

    item.addEventListener('focus', () => {
      highlightPin(item.dataset.pinId);
    });
  });

  // Hover & Click on map pins
  allPins.forEach(pin => {
    pin.addEventListener('click', () => {
      highlightPin(pin.id);
    });
  });

  // Default highlight on first pin
  highlightPin('pin-abbey');
}

/**
 * 6. Booking Form in Arch-Topped Card
 */
function initReservationForm() {
  const form = document.getElementById('resortBookingForm');
  const checkIn = document.getElementById('checkInDate');
  const checkOut = document.getElementById('checkOutDate');
  const modal = document.getElementById('bookingConfirmModal');
  const btnDismiss = document.getElementById('btnDismissModal');

  // Set default dates: check-in tomorrow, check-out in 3 days
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const checkoutDay = new Date(today);
  checkoutDay.setDate(checkoutDay.getDate() + 4);

  if (checkIn && checkOut) {
    const toDateStr = (d) => d.toISOString().split('T')[0];
    checkIn.min = toDateStr(today);
    checkIn.value = toDateStr(tomorrow);
    checkOut.min = toDateStr(tomorrow);
    checkOut.value = toDateStr(checkoutDay);
  }

  if (!form || !modal) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const guestName = document.getElementById('guestFullName').value.trim() || 'Honored Guest';
    const guestPhone = document.getElementById('guestPhone').value.trim();
    const guestEmail = document.getElementById('guestEmail').value.trim();
    const dwellingSelect = document.getElementById('roomStyle');
    const dwellingName = dwellingSelect.options[dwellingSelect.selectedIndex].text;
    const typeSelect = document.getElementById('bookingType');
    const typeName = typeSelect.options[typeSelect.selectedIndex].text;
    const inDate = checkIn ? checkIn.value : 'Upcoming';
    const outDate = checkOut ? checkOut.value : 'Upcoming';
    const guests = document.getElementById('guestCount').value;

    if (!guestName || !guestPhone || !guestEmail) {
      alert('Please provide your full name, telephone number, and email address.');
      return;
    }

    // Populate confirmation modal
    document.getElementById('confirmGuestName').textContent = guestName;
    document.getElementById('confirmDwelling').textContent = dwellingName;
    document.getElementById('confirmDates').textContent = `${inDate} to ${outDate}`;

    const summaryPanel = document.getElementById('confirmSummaryPanel');
    if (summaryPanel) {
      summaryPanel.innerHTML = `
        <div><strong>Experience Package:</strong> ${typeName}</div>
        <div><strong>Party Size:</strong> ${guests} Guest(s)</div>
        <div><strong>Guest Contact:</strong> ${guestPhone} · ${guestEmail}</div>
        <div style="margin-top: 0.5rem; color: #C66B47; font-size: 0.82rem;">
          ✦ Our reservation desk will reach out within 4 business hours with your package quotation and confirmation dispatch.
        </div>
      `;
    }

    modal.hidden = false;
  });

  if (btnDismiss) {
    btnDismiss.addEventListener('click', () => {
      modal.hidden = true;
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.hidden = true;
    }
  });
}

/**
 * 7. Smooth Scrolling for Internal Anchor Links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
