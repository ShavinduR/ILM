// Wait for DOM to be fully loaded
(function() {
    'use strict';
    
    // === Mobile Menu ===
    var hamburger = document.querySelector('.hamburger');
    var mobileMenu = document.querySelector('.mobile-menu');
    var closeMenu = document.querySelector('.close-menu');
    
    function openMenu() {
        if (mobileMenu) {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeMenuFunc() {
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    if (hamburger) {
        hamburger.addEventListener('click', openMenu);
    }
    
    if (closeMenu) {
        closeMenu.addEventListener('click', closeMenuFunc);
    }
    
    // === Navigation Click Handling (smooth scroll) ===
    var navLinks = document.querySelectorAll('.desktop-nav a, .mobile-menu a');
    
    function handleNavClick(e) {
        e.preventDefault();
        
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        var targetElement = document.querySelector(targetId);
        if (!targetElement) return;
        
        var header = document.querySelector('.header');
        var headerHeight = header ? header.offsetHeight : 80;
        var targetPosition = targetElement.offsetTop - headerHeight;
        
        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        } else {
            window.scrollTo(0, targetPosition);
        }
        
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            closeMenuFunc();
        }
    }
    
    for (var i = 0; i < navLinks.length; i++) {
        navLinks[i].addEventListener('click', handleNavClick);
    }
    
    // === Active Navigation using Intersection Observer ===
    var sectionToNavMap = {
        'home': 'a[href="#home"]',
        'about': 'a[href="#about"]',
        'the-scene': 'a[href="#the-scene"]',
        'style': 'a[href="#style"]',
        'purpose': 'a[href="#purpose"]',
        'services': 'a[href="#services"]',
        'contact': 'a[href="#contact"]'
    };
    
    var sections = document.querySelectorAll('.section');
    
    var observerOptions = {
        threshold: 0.3,
        rootMargin: '-80px 0px 0px 0px'
    };
    
    var observer = new IntersectionObserver(function(entries) {
        var maxRatioEntry = null;
        entries.forEach(function(entry) {
            if (!maxRatioEntry || entry.intersectionRatio > maxRatioEntry.intersectionRatio) {
                maxRatioEntry = entry;
            }
        });
        
        if (maxRatioEntry && maxRatioEntry.intersectionRatio > 0) {
            var id = maxRatioEntry.target.getAttribute('id');
            var navSelector = sectionToNavMap[id];
            if (navSelector) {
                document.querySelectorAll('.desktop-nav a, .mobile-menu a').forEach(function(link) {
                    link.classList.remove('active');
                });
                document.querySelectorAll('.desktop-nav ' + navSelector + ', .mobile-menu ' + navSelector).forEach(function(link) {
                    link.classList.add('active');
                });
            }
        }
    }, observerOptions);
    
    sections.forEach(function(section) {
        observer.observe(section);
    });
    
    // === Dark Mode Toggle ===
    var toggle = document.getElementById('dark-mode-toggle');
    
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark');
        var icon = toggle ? toggle.querySelector('i') : null;
        if (icon) {
            icon.className = 'fas fa-sun';
        }
    }
    
    if (toggle) {
        toggle.addEventListener('click', function() {
            document.body.classList.toggle('dark');
            var icon = this.querySelector('i');
            var isDark = document.body.classList.contains('dark');
            
            if (isDark) {
                if (icon) icon.className = 'fas fa-sun';
                localStorage.setItem('darkMode', 'enabled');
            } else {
                if (icon) icon.className = 'fas fa-moon';
                localStorage.setItem('darkMode', 'disabled');
            }
        });
    }
    
    // === Card Hover Effects (for all cards) ===
    var cards = document.querySelectorAll('.card, .featured-card');
    
    for (var i = 0; i < cards.length; i++) {
        (function(card) {
            card.addEventListener('mouseenter', function(e) {
                this.style.transform = 'translateY(-10px) scale(1.03)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
            
            card.addEventListener('touchstart', function() {
                this.classList.add('active-touch');
            });
            
            card.addEventListener('touchend', function() {
                this.classList.remove('active-touch');
            });
        })(cards[i]);
    }
    
    // === Carousel Management (for other carousels) ===
    var carousels = document.querySelectorAll('.carousel');
    
    for (var i = 0; i < carousels.length; i++) {
        (function(carousel) {
            var wrapper = carousel.parentElement;
            wrapper.classList.add('carousel-wrapper');
            
            if (!wrapper.querySelector('.carousel-btn')) {
                var prevBtn = document.createElement('button');
                var nextBtn = document.createElement('button');
                prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
                nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
                prevBtn.className = 'carousel-btn prev';
                nextBtn.className = 'carousel-btn next';
                prevBtn.setAttribute('aria-label', 'Previous');
                nextBtn.setAttribute('aria-label', 'Next');
                
                wrapper.appendChild(prevBtn);
                wrapper.appendChild(nextBtn);
                
                var firstCard = carousel.querySelector('.card');
                var scrollAmount = firstCard ? firstCard.offsetWidth + 25 : 320;
                
                function scrollNext() {
                    var maxScroll = carousel.scrollWidth - carousel.clientWidth;
                    var currentScroll = carousel.scrollLeft;
                    
                    if (currentScroll >= maxScroll - 10) {
                        carousel.scrollLeft = 0;
                    } else {
                        carousel.scrollLeft += scrollAmount;
                    }
                    updateButtonVisibility();
                }
                
                function scrollPrev() {
                    if (carousel.scrollLeft <= 10) {
                        carousel.scrollLeft = carousel.scrollWidth;
                    } else {
                        carousel.scrollLeft -= scrollAmount;
                    }
                    updateButtonVisibility();
                }
                
                nextBtn.addEventListener('click', scrollNext);
                prevBtn.addEventListener('click', scrollPrev);
                
                function updateButtonVisibility() {
                    var maxScroll = carousel.scrollWidth - carousel.clientWidth;
                    var currentScroll = carousel.scrollLeft;
                    
                    prevBtn.style.opacity = currentScroll > 10 ? '1' : '0.5';
                    nextBtn.style.opacity = currentScroll < maxScroll - 10 ? '1' : '0.5';
                }
                
                updateButtonVisibility();
                
                var autoScrollInterval;
                
                function startAutoScroll() {
                    autoScrollInterval = setInterval(scrollNext, 4000);
                }
                
                function stopAutoScroll() {
                    clearInterval(autoScrollInterval);
                }
                
                startAutoScroll();
                
                wrapper.addEventListener('mouseenter', stopAutoScroll);
                wrapper.addEventListener('mouseleave', startAutoScroll);
                
                var touchStartX = 0;
                var touchEndX = 0;
                var touchStartY = 0;
                var isScrolling;
                
                carousel.addEventListener('touchstart', function(e) {
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                    isScrolling = undefined;
                    stopAutoScroll();
                }, { passive: true });
                
                carousel.addEventListener('touchmove', function(e) {
                    if (!touchStartX || !touchStartY) return;
                    
                    var touchX = e.touches[0].clientX;
                    var touchY = e.touches[0].clientY;
                    
                    var diffX = touchStartX - touchX;
                    var diffY = touchStartY - touchY;
                    
                    if (isScrolling === undefined) {
                        isScrolling = Math.abs(diffX) < Math.abs(diffY);
                    }
                    
                    if (isScrolling) return;
                    
                    e.preventDefault();
                }, { passive: false });
                
                carousel.addEventListener('touchend', function(e) {
                    if (!touchStartX || isScrolling) {
                        touchStartX = 0;
                        touchStartY = 0;
                        startAutoScroll();
                        return;
                    }
                    
                    touchEndX = e.changedTouches[0].clientX;
                    var swipeThreshold = 50;
                    var swipeDistance = touchEndX - touchStartX;
                    
                    if (Math.abs(swipeDistance) > swipeThreshold) {
                        if (swipeDistance > 0) {
                            scrollPrev();
                        } else {
                            scrollNext();
                        }
                    }
                    startAutoScroll();
                    
                    touchStartX = 0;
                    touchStartY = 0;
                    touchEndX = 0;
                }, { passive: true });
            }
        })(carousels[i]);
    }
    
    // === Client Logos Carousel ===
    function initClientLogosCarousel() {
        var carousel = document.querySelector('.client-logos-carousel');
        if (!carousel) return;
        
        var track = carousel.querySelector('.logos-track');
        
        carousel.addEventListener('mouseenter', function() {
            track.style.animationPlayState = 'paused';
        });
        
        carousel.addEventListener('mouseleave', function() {
            track.style.animationPlayState = 'running';
        });
        
        carousel.addEventListener('touchstart', function() {
            track.style.animationPlayState = 'paused';
        }, { passive: true });
        
        carousel.addEventListener('touchend', function() {
            setTimeout(function() {
                track.style.animationPlayState = 'running';
            }, 1000);
        }, { passive: true });
    }
    
    initClientLogosCarousel();
    
    // === Enhanced Lightbox System with Mobile Swipe ===
    var lightbox = document.querySelector('.lightbox-overlay');
    var lightboxImage = document.querySelector('.lightbox-image');
    var lightboxClose = document.querySelector('.lightbox-close');
    var lightboxPrev = document.querySelector('.lightbox-prev');
    var lightboxNext = document.querySelector('.lightbox-next');
    var currentIndexSpan = document.querySelector('.current-index');
    var totalImagesSpan = document.querySelector('.total-images');
    
    // === UPDATED GALLERIES WITH PER-IMAGE DESCRIPTIONS ===
    var galleries = {
        // Hero featured cards
        'seo-services': {
            title: 'Conference & Events',
            images: [
                { src: 'images/the sence/conforance/14.jpg', description: 'Main conference hall filled with attendees listening to keynote presentation.' },
                { src: 'images/the sence/conforance/11.jpg', description: 'Speaker delivering an engaging presentation on stage.' },
                { src: 'images/the sence/conforance/10.jpg', description: 'Networking break with refreshments and professional conversations.' },
                { src: 'images/the sence/conforance/12.jpg', description: 'Group photo of organizing committee and volunteers.' },
                { src: 'images/the sence/conforance/9.jpg', description: 'Audience participating in interactive Q&A session.' }
            ]
        },
        'social-media-marketing': {
            title: 'Brand Launches',
            images: [
                { src: 'images/style/fashen brand opening/3.jpg', description: 'Ribbon cutting ceremony at the grand brand opening event.' },
                { src: 'images/style/fashen brand opening/2.jpg', description: 'Product display area with guests exploring new collections.' },
                { src: 'images/style/fashen brand opening/5.jpg', description: 'Brand ambassador posing with products at the launch.' }
            ]
        },
        'web-design-agency': {
            title: 'Sports & Lifestyle',
            images: [
                { src: 'images/purpose/surfing club/12.jpg', description: 'Surfers riding waves at sunset - capturing the spirit of adventure.' },
                { src: 'images/purpose/surfing club/3.jpg', description: 'Beachside lifestyle shoot with surfing equipment.' },
                { src: 'images/purpose/surfing club/10.jpg', description: 'Group of surfers preparing for a competition.' }
            ]
        },
        'ppc-advertising': {
            title: 'Fashion & Editorial',
            images: [
                { src: 'images/style/Binto shoot edited final/22.jpg', description: 'High-end fashion model posing in designer outfit.' },
                { src: 'images/style/Binto shoot edited final/20.jpg', description: 'Editorial shoot with dramatic lighting and styling.' }
            ]
        },
        // Harvard Club Conference (full album)
        'Harvard Club of Sri Lanka C': {
            title: 'Harvard Club Conference',
            images: [
                { src: 'images/the sence/conforance/1.jpg', description: 'Registration desk with welcome kits and name badges.' },
                { src: 'images/the sence/conforance/2.jpg', description: 'Opening remarks by the Harvard Club president.' },
                { src: 'images/the sence/conforance/3.jpg', description: 'Keynote speech by distinguished guest speaker.' },
                { src: 'images/the sence/conforance/4.jpg', description: 'Panel discussion with industry experts.' },
                { src: 'images/the sence/conforance/5.jpg', description: 'Audience focused on the presentation.' },
                { src: 'images/the sence/conforance/6.jpg', description: 'Networking session during coffee break.' },
                { src: 'images/the sence/conforance/7.jpg', description: 'Speaker interacting with attendees after session.' },
                { src: 'images/the sence/conforance/8.jpg', description: 'Close-up of conference materials and notes.' },
                { src: 'images/the sence/conforance/9.jpg', description: 'Q&A session with raised hands from audience.' },
                { src: 'images/the sence/conforance/10.jpg', description: 'Lunch break with catered food and conversations.' },
                { src: 'images/the sence/conforance/11.jpg', description: 'Afternoon session with workshop activities.' },
                { src: 'images/the sence/conforance/12.jpg', description: 'Group photo of all attendees and speakers.' },
                { src: 'images/the sence/conforance/13.jpg', description: 'Close-up of name badges and conference swag.' },
                { src: 'images/the sence/conforance/14.jpg', description: 'Evening networking reception with drinks.' },
                { src: 'images/the sence/conforance/15.jpg', description: 'Award ceremony for outstanding contributors.' },
                { src: 'images/the sence/conforance/16.jpg', description: 'Closing remarks and thank you notes.' },
                { src: 'images/the sence/conforance/17.jpg', description: 'Venue exterior with Harvard Club banner.' },
                { src: 'images/the sence/conforance/18.jpg', description: 'Attendees taking photos at the photo booth.' },
                { src: 'images/the sence/conforance/19.jpg', description: 'Sponsor booths and exhibition area.' },
                { src: 'images/the sence/conforance/20.jpg', description: 'Interactive workshop with group activities.' },
                { src: 'images/the sence/conforance/21.jpg', description: 'Speaker signing books after presentation.' },
                { src: 'images/the sence/conforance/22.jpg', description: 'Candid moments of laughter and conversations.' },
                { src: 'images/the sence/conforance/23.jpg', description: 'Technical setup with cameras and lighting.' },
                { src: 'images/the sence/conforance/24.jpg', description: 'Behind the scenes of photography team.' },
                { src: 'images/the sence/conforance/25.jpg', description: 'Final group shot with all participants.' }
            ]
        },
        // After Party Event
        'Harvard Club of Sri Lanka A': {
            title: 'After Party Event',
            images: [
                { src: 'images/the sence/after party/1.jpg', description: 'Guests arriving at the after-party venue.' },
                { src: 'images/the sence/after party/2.jpg', description: 'Cocktail hour with lively conversations.' },
                { src: 'images/the sence/after party/3.jpg', description: 'Dance floor with guests enjoying music.' },
                { src: 'images/the sence/after party/4.jpg', description: 'Photo booth fun with props and friends.' },
                { src: 'images/the sence/after party/5.jpg', description: 'Toast to a successful conference.' },
                { src: 'images/the sence/after party/6.jpg', description: 'Late-night snacks and casual networking.' }
            ]
        },
        // Theodora Ceylon (Jewellery)
        'Theodora Ceylon': {
            title: 'Theodora Ceylon',
            images: [
                { src: 'images/style/Binto shoot edited final/01.jpg', description: 'Elegant gold necklace with gemstones.' },
                { src: 'images/style/Binto shoot edited final/02.jpg', description: 'Close-up of diamond-studded watch.' },
                { src: 'images/style/Binto shoot edited final/03.jpg', description: 'Bracelet collection on velvet display.' },
                { src: 'images/style/Binto shoot edited final/04.jpg', description: 'Model wearing statement earrings.' },
                { src: 'images/style/Binto shoot edited final/05.jpg', description: 'Ring set with sapphire and diamonds.' },
                { src: 'images/style/Binto shoot edited final/06.jpg', description: 'Luxury watch with leather strap.' },
                { src: 'images/style/Binto shoot edited final/07.jpg', description: 'Pearl necklace and matching earrings.' },
                { src: 'images/style/Binto shoot edited final/08.jpg', description: 'Product shot of multiple jewellery pieces.' },
                { src: 'images/style/Binto shoot edited final/09.jpg', description: 'Model close-up with sparkling accessories.' },
                { src: 'images/style/Binto shoot edited final/10.jpg', description: 'Gold bangles stacked on wrist.' },
                { src: 'images/style/Binto shoot edited final/11.jpg', description: 'Diamond pendant on delicate chain.' },
                { src: 'images/style/Binto shoot edited final/12.jpg', description: 'Jewellery box with opened lid.' },
                { src: 'images/style/Binto shoot edited final/13.jpg', description: 'Couple wearing matching watches.' },
                { src: 'images/style/Binto shoot edited final/14.jpg', description: 'Emerald ring in natural light.' },
                { src: 'images/style/Binto shoot edited final/15.jpg', description: 'Behind the scenes of jewellery shoot.' },
                { src: 'images/style/Binto shoot edited final/16.jpg', description: 'Macro shot of intricate details.' },
                { src: 'images/style/Binto shoot edited final/17.jpg', description: 'Model posing with luxury handbag and jewellery.' },
                { src: 'images/style/Binto shoot edited final/18.jpg', description: 'Earring and necklace matching set.' },
                { src: 'images/style/Binto shoot edited final/19.jpg', description: 'Gold cuff bracelet on wrist.' },
                { src: 'images/style/Binto shoot edited final/20.jpg', description: 'Diamond stud earrings close-up.' },
                { src: 'images/style/Binto shoot edited final/21.jpg', description: 'Final edited image for campaign.' }
            ]
        },
        // Branding Projects
        'branding-projects': {
            title: 'Branding Projects',
            images: [
                { src: 'images/style/fashen brand opening/1.jpg', description: 'Brand logo design presentation.' },
                { src: 'images/style/fashen brand opening/2.jpg', description: 'Color palette and typography selection.' },
                { src: 'images/style/fashen brand opening/3.jpg', description: 'Brand guidelines document mockup.' },
                { src: 'images/style/fashen brand opening/4.jpg', description: 'Business card and stationery design.' },
                { src: 'images/style/fashen brand opening/5.jpg', description: 'Packaging mockups for product line.' },
                { src: 'images/style/fashen brand opening/6.jpg', description: 'Social media brand kit examples.' },
                { src: 'images/style/fashen brand opening/7.jpg', description: 'Website branding and UI elements.' },
                { src: 'images/style/fashen brand opening/8.jpg', description: 'Brand launch event materials.' }
            ]
        },
        // Olympic Fashion Event
        'A fusion of fashion and sports!': {
            title: 'Olympic Fashion Event',
            images: [
                { src: 'images/style/olympic fasion/1.jpg', description: 'Runway show with athletic wear collection.' },
                { src: 'images/style/olympic fasion/2.jpg', description: 'Model wearing sporty chic outfit.' },
                { src: 'images/style/olympic fasion/3.jpg', description: 'Backstage preparations and makeup.' },
                { src: 'images/style/olympic fasion/4.jpg', description: 'Audience and front row celebrities.' },
                { src: 'images/style/olympic fasion/5.jpg', description: 'Designer taking a bow after show.' },
                { src: 'images/style/olympic fasion/6.jpg', description: 'Close-up of detailed sportswear embroidery.' },
                { src: 'images/style/olympic fasion/7.jpg', description: 'Group of models in themed outfits.' },
                { src: 'images/style/olympic fasion/8.jpg', description: 'Photographers capturing the moment.' },
                { src: 'images/style/olympic fasion/9.jpg', description: 'After-party with fashion influencers.' }
            ]
        },
        // Surfing Club
        'Surfing club': {
            title: 'Surfing Club',
            images: [
                { src: 'images/purpose/surfing club/1.jpg', description: 'Surfer catching a wave at sunrise.' },
                { src: 'images/purpose/surfing club/2.jpg', description: 'Group of surfers paddling out.' },
                { src: 'images/purpose/surfing club/3.jpg', description: 'Beach setup with surfboards and umbrellas.' },
                { src: 'images/purpose/surfing club/4.jpg', description: 'Close-up of surfboard on sand.' },
                { src: 'images/purpose/surfing club/5.jpg', description: 'Surfer walking on beach with board.' },
                { src: 'images/purpose/surfing club/6.jpg', description: 'Wave crashing with surfer inside.' },
                { src: 'images/purpose/surfing club/7.jpg', description: 'Sunset silhouette of surfer.' },
                { src: 'images/purpose/surfing club/8.jpg', description: 'Surf club members gathering for event.' },
                { src: 'images/purpose/surfing club/9.jpg', description: 'Drone shot of surfers in ocean.' },
                { src: 'images/purpose/surfing club/10.jpg', description: 'Surfer performing aerial maneuver.' },
                { src: 'images/purpose/surfing club/11.jpg', description: 'Beachside BBQ after surfing session.' },
                { src: 'images/purpose/surfing club/12.jpg', description: 'Instructor teaching beginner surfer.' },
                { src: 'images/purpose/surfing club/13.jpg', description: 'Group photo with surfboards at sunset.' }
            ]
        }
    };
    
    var currentGallery = null;
    var currentImageIndex = 0;
    var lightboxTouchStartX = 0;
    var lightboxTouchEndX = 0;
    var isLightboxMoving = false;
    var preventTouch = false;
    
    function initLightbox() {
        var cards = document.querySelectorAll('.card, .featured-card');
        for (var i = 0; i < cards.length; i++) {
            cards[i].addEventListener('click', handleCardClick);
        }
        
        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }
        
        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', showPrevImage);
        }
        
        if (lightboxNext) {
            lightboxNext.addEventListener('click', showNextImage);
        }
        
        if (lightbox) {
            lightbox.addEventListener('click', function(e) {
                if (e.target === lightbox || e.target.classList.contains('lightbox-overlay')) {
                    closeLightbox();
                }
            });
        }
        
        addLightboxSwipeSupport();
        
        document.addEventListener('keydown', handleLightboxKeyboard);
    }
    
    function handleLightboxKeyboard(e) {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            showPrevImage();
        } else if (e.key === 'ArrowRight') {
            showNextImage();
        }
    }
    
    function addLightboxSwipeSupport() {
        if (!lightboxImage) return;
        
        var swipeThreshold = 50;
        
        lightboxImage.addEventListener('touchstart', function(e) {
            if (preventTouch) {
                e.preventDefault();
                return;
            }
            
            lightboxTouchStartX = e.touches[0].clientX;
            isLightboxMoving = false;
            this.style.transition = 'none';
        }, { passive: true });
        
        lightboxImage.addEventListener('touchmove', function(e) {
            if (!lightboxTouchStartX) return;
            
            var touchX = e.touches[0].clientX;
            var diffX = touchX - lightboxTouchStartX;
            
            if (Math.abs(diffX) > 10) {
                isLightboxMoving = true;
                e.preventDefault();
                this.style.transform = 'translateX(' + diffX + 'px)';
                var opacity = 1 - Math.min(Math.abs(diffX) / 200, 0.3);
                this.style.opacity = opacity;
            }
        }, { passive: false });
        
        lightboxImage.addEventListener('touchend', function(e) {
            if (!lightboxTouchStartX || !isLightboxMoving) {
                lightboxTouchStartX = 0;
                return;
            }
            
            lightboxTouchEndX = e.changedTouches[0].clientX;
            var swipeDistance = lightboxTouchEndX - lightboxTouchStartX;
            
            this.style.transform = '';
            this.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            this.style.opacity = '1';
            
            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance > 0) {
                    showPrevImage();
                } else {
                    showNextImage();
                }
            }
            
            lightboxTouchStartX = 0;
            lightboxTouchEndX = 0;
            isLightboxMoving = false;
            
            preventTouch = true;
            setTimeout(function() {
                preventTouch = false;
            }, 300);
        }, { passive: true });
        
        lightboxImage.addEventListener('load', function() {
            if (window.innerWidth <= 768 && !this.hasSwipeInstruction) {
                addSwipeInstruction();
                this.hasSwipeInstruction = true;
            }
        });
    }
    
    function addSwipeInstruction() {
        if (document.querySelector('.lightbox-swipe-instruction')) return;
        
        var instruction = document.createElement('div');
        instruction.className = 'lightbox-swipe-instruction';
        instruction.innerHTML = 'Swipe to navigate • Tap to close';
        
        var container = document.querySelector('.lightbox-container');
        if (container) {
            container.appendChild(instruction);
            
            setTimeout(function() {
                if (instruction.parentNode) {
                    instruction.style.opacity = '0';
                    instruction.style.transition = 'opacity 0.5s ease';
                    setTimeout(function() {
                        if (instruction.parentNode) {
                            instruction.parentNode.removeChild(instruction);
                        }
                    }, 500);
                }
            }, 5000);
        }
    }
    
    function handleCardClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        var card = this;
        var albumName = card.getAttribute('data-album');
        
        if (!albumName || !galleries[albumName]) {
            console.warn('No gallery found for album:', albumName);
            return;
        }
        
        stopAllCarousels();
        
        currentGallery = galleries[albumName];
        currentImageIndex = 0;
        
        // Pass the src string for preloading
        preloadLightboxImage(currentGallery.images[0].src, function() {
            showImage(currentImageIndex);
            openLightbox();
        });
    }
    
    function preloadLightboxImage(src, callback) {
        var img = new Image();
        img.onload = function() {
            if (callback) callback();
        };
        img.onerror = function() {
            if (callback) callback();
        };
        img.src = src;
    }
    
    // === UPDATED showImage function with per-image description ===
    function showImage(index) {
        if (!currentGallery || !currentGallery.images[index]) return;
        
        var currentImage = currentGallery.images[index];
        var imageUrl = currentImage.src;
        var imageDescription = currentImage.description || ''; // Use description if available
        
        if (lightboxImage) {
            lightboxImage.style.opacity = '0';
            lightboxImage.classList.remove('loaded');
            
            var tempImg = new Image();
            tempImg.onload = function() {
                lightboxImage.src = imageUrl;
                lightboxImage.alt = currentGallery.title + ' - Image ' + (index + 1);
                
                setTimeout(function() {
                    lightboxImage.style.opacity = '1';
                    lightboxImage.classList.add('loaded');
                }, 50);
                
                // Preload adjacent images (pass src strings)
                if (index > 0) preloadLightboxImage(currentGallery.images[index - 1].src);
                if (index < currentGallery.images.length - 1) preloadLightboxImage(currentGallery.images[index + 1].src);
            };
            
            tempImg.onerror = function() {
                lightboxImage.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%2364b6d9"/><text x="400" y="300" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">Image not available</text></svg>';
                lightboxImage.style.opacity = '1';
                lightboxImage.classList.add('loaded');
            };
            
            tempImg.src = imageUrl;
        }
        
        if (currentIndexSpan) {
            currentIndexSpan.textContent = index + 1;
        }
        
        if (totalImagesSpan && currentGallery) {
            totalImagesSpan.textContent = currentGallery.images.length;
        }
        
        var titleElement = document.querySelector('.lightbox-album-title');
        if (titleElement && currentGallery) {
            titleElement.textContent = currentGallery.title;
        }
        
        // Update description - now per-image
        var descElement = document.querySelector('.lightbox-description');
        if (descElement) {
            descElement.textContent = imageDescription;
        }
        
        currentImageIndex = index;
    }
    
    function showNextImage() {
        if (!currentGallery) return;
        
        var nextIndex = currentImageIndex + 1;
        if (nextIndex >= currentGallery.images.length) {
            nextIndex = 0;
        }
        
        showImage(nextIndex);
    }
    
    function showPrevImage() {
        if (!currentGallery) return;
        
        var prevIndex = currentImageIndex - 1;
        if (prevIndex < 0) {
            prevIndex = currentGallery.images.length - 1;
        }
        
        showImage(prevIndex);
    }
    
    function openLightbox() {
        if (!lightbox) return;
        
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
        document.body.classList.add('lightbox-open');
        
        lightbox.style.display = 'flex';
        setTimeout(function() {
            lightbox.classList.add('active');
        }, 10);
        
        if (lightboxClose) {
            lightboxClose.focus();
        }
        
        if (window.innerWidth <= 768) {
            setTimeout(addSwipeInstruction, 300);
        }
    }
    
    function closeLightbox() {
        if (!lightbox) return;
        
        lightbox.classList.remove('active');
        
        setTimeout(function() {
            lightbox.style.display = 'none';
            document.body.style.overflow = '';
            document.body.style.height = '';
            document.body.classList.remove('lightbox-open');
            
            currentGallery = null;
            currentImageIndex = 0;
            
            var instruction = document.querySelector('.lightbox-swipe-instruction');
            if (instruction && instruction.parentNode) {
                instruction.parentNode.removeChild(instruction);
            }
        }, 300);
    }
    
    function stopAllCarousels() {
        var wrappers = document.querySelectorAll('.carousel-wrapper');
        for (var i = 0; i < wrappers.length; i++) {
            var carousel = wrappers[i].querySelector('.carousel');
            if (carousel && carousel.autoScrollInterval) {
                clearInterval(carousel.autoScrollInterval);
            }
        }
    }
    
    initLightbox();
    
    // === Back to Home Button ===
    var backToHomeBtn = document.querySelector('.back-to-home-btn');
    var backToHomeContainer = document.querySelector('.back-to-home');
    var heroSection = document.getElementById('home');
    
    if (backToHomeBtn && backToHomeContainer && heroSection) {
        var scrollTimeoutBtn = null;
        var isButtonVisible = false;
        
        function updateBackToHomeButton() {
            var heroRect = heroSection.getBoundingClientRect();
            var heroBottom = heroRect.bottom;
            var viewportHeight = window.innerHeight;
            
            if (heroBottom <= 0 || window.pageYOffset > viewportHeight) {
                if (!isButtonVisible) {
                    clearTimeout(scrollTimeoutBtn);
                    scrollTimeoutBtn = setTimeout(function() {
                        backToHomeContainer.classList.add('visible');
                        isButtonVisible = true;
                    }, 300);
                }
            } else {
                clearTimeout(scrollTimeoutBtn);
                backToHomeContainer.classList.remove('visible');
                isButtonVisible = false;
            }
        }
        
        backToHomeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            backToHomeContainer.classList.remove('visible');
            isButtonVisible = false;
            
            var header = document.querySelector('.header');
            var headerHeight = header ? header.offsetHeight : 80;
            var heroPosition = heroSection.offsetTop - headerHeight;
            
            if ('scrollBehavior' in document.documentElement.style) {
                window.scrollTo({
                    top: heroPosition,
                    behavior: 'smooth'
                });
            } else {
                window.scrollTo(0, heroPosition);
            }
            
            document.querySelectorAll('.desktop-nav a, .mobile-menu a').forEach(function(link) {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#home') {
                    link.classList.add('active');
                }
            });
        });
        
        var isThrottled = false;
        window.addEventListener('scroll', function() {
            if (!isThrottled) {
                updateBackToHomeButton();
                isThrottled = true;
                setTimeout(function() {
                    isThrottled = false;
                }, 100);
            }
        });
        
        updateBackToHomeButton();
    }
    
    // === Instagram Post Hover ===
    var instagramPosts = document.querySelectorAll('.instagram-post');
    
    for (var i = 0; i < instagramPosts.length; i++) {
        (function(post) {
            post.addEventListener('mouseenter', function() {
                var img = this.querySelector('img');
                if (img) {
                    img.style.transform = 'scale(1.08)';
                }
            });
            
            post.addEventListener('mouseleave', function() {
                var img = this.querySelector('img');
                if (img) {
                    img.style.transform = 'scale(1)';
                }
            });
        })(instagramPosts[i]);
    }
    
    // === Footer Smooth Scroll ===
    var footerLinks = document.querySelectorAll('.footer a[href^="#"]');
    
    for (var i = 0; i < footerLinks.length; i++) {
        footerLinks[i].addEventListener('click', function(e) {
            var href = this.getAttribute('href');
            if (href === '#') return;
            
            var targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                var header = document.querySelector('.header');
                var headerHeight = header ? header.offsetHeight : 80;
                var targetPosition = targetElement.offsetTop - headerHeight;
                
                if ('scrollBehavior' in document.documentElement.style) {
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                } else {
                    window.scrollTo(0, targetPosition);
                }
            }
        });
    }
    
    // === Image Preloading ===
    function preloadVisibleImages() {
        if (!('IntersectionObserver' in window)) {
            var images = document.querySelectorAll('img[loading="lazy"]');
            for (var i = 0; i < images.length; i++) {
                if (images[i].getAttribute('data-src')) {
                    images[i].src = images[i].getAttribute('data-src');
                }
            }
            return;
        }
        
        var images = document.querySelectorAll('img[loading="lazy"]');
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var img = entry.target;
                    if (img.getAttribute('data-src')) {
                        img.src = img.getAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
        
        for (var i = 0; i < images.length; i++) {
            observer.observe(images[i]);
        }
    }
    
    window.addEventListener('load', function() {
        var images = document.querySelectorAll('img');
        for (var i = 0; i < images.length; i++) {
            if (images[i].complete) {
                images[i].classList.add('loaded');
            } else {
                images[i].addEventListener('load', function() {
                    this.classList.add('loaded');
                });
            }
        }
        
        preloadVisibleImages();
        
        if ('scrollPaddingTop' in document.documentElement.style) {
            document.documentElement.classList.add('has-scroll-smooth');
        }
    });
    
    // === Mobile Swipe Indicators ===
    function initMobileSwipeIndicators() {
        if (window.innerWidth > 900) return;
        
        var carousels = document.querySelectorAll('.carousel');
        
        for (var i = 0; i < carousels.length; i++) {
            (function(carousel) {
                var inactivityTimer;
                
                function showInstruction() {
                    var wrapper = carousel.closest('.carousel-wrapper') || carousel.parentElement;
                    var instruction = wrapper.querySelector('.swipe-instruction');
                    
                    if (!instruction && !wrapper.getAttribute('data-instruction-added')) {
                        var instructionDiv = document.createElement('div');
                        instructionDiv.className = 'swipe-instruction';
                        instructionDiv.textContent = 'Swipe to navigate →';
                        instructionDiv.style.cssText = 'position: absolute; bottom: -35px; left: 50%; transform: translateX(-50%); color: #64b6d9; font-size: 0.9rem; font-weight: 600; opacity: 0; transition: opacity 0.3s ease; background: rgba(255, 255, 255, 0.9); padding: 6px 15px; border-radius: 20px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); pointer-events: none; z-index: 100; white-space: nowrap;';
                        
                        if (document.body.classList.contains('dark')) {
                            instructionDiv.style.background = 'rgba(30, 30, 30, 0.9)';
                            instructionDiv.style.color = '#64b6d9';
                        }
                        
                        wrapper.style.position = 'relative';
                        wrapper.appendChild(instructionDiv);
                        wrapper.setAttribute('data-instruction-added', 'true');
                        
                        setTimeout(function() {
                            instructionDiv.style.opacity = '0.8';
                        }, 100);
                        
                        setTimeout(function() {
                            if (instructionDiv) {
                                instructionDiv.style.opacity = '0';
                                setTimeout(function() {
                                    if (instructionDiv.parentNode) {
                                        instructionDiv.parentNode.removeChild(instructionDiv);
                                        wrapper.removeAttribute('data-instruction-added');
                                    }
                                }, 300);
                            }
                        }, 5000);
                    }
                }
                
                function resetTimer() {
                    clearTimeout(inactivityTimer);
                    inactivityTimer = setTimeout(showInstruction, 3000);
                }
                
                carousel.addEventListener('touchstart', resetTimer, { passive: true });
                carousel.addEventListener('touchend', resetTimer, { passive: true });
                
                resetTimer();
            })(carousels[i]);
        }
    }
    
    window.addEventListener('load', initMobileSwipeIndicators);
    window.addEventListener('resize', initMobileSwipeIndicators);
    
    // === Fix for mobile viewport height ===
    function fixViewportHeight() {
        var vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', vh + 'px');
    }
    
    window.addEventListener('resize', fixViewportHeight);
    fixViewportHeight();

    // === Contact Form Submission Handler ===
    var contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var name = document.getElementById('name').value.trim();
            var email = document.getElementById('email').value.trim();
            var message = document.getElementById('message').value.trim();
            if (name && email && message) {
                alert('Thank you for contacting us! We will get back to you soon.');
                contactForm.reset();
            } else {
                alert('Please fill in all fields.');
            }
        });
    }
})();