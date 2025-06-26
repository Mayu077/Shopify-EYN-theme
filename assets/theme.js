// EYN Premium Store Theme JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Mobile Navigation Toggle
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');
  
  if (hamburger) {
    hamburger.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      hamburger.classList.toggle('active');
    });
  }

  // Sticky Header
  const navbar = document.querySelector('.navbar');
  let lastScrollTop = 0;
  
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    lastScrollTop = scrollTop;
  });

  // Cart Drawer Functionality
  const cartBtn = document.querySelector('.cart-btn');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartClose = document.querySelector('.cart-close');
  
  if (cartBtn && cartDrawer) {
    cartBtn.addEventListener('click', function(e) {
      e.preventDefault();
      cartDrawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }
  
  if (cartClose) {
    cartClose.addEventListener('click', function() {
      cartDrawer.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // Close cart drawer when clicking outside
  document.addEventListener('click', function(e) {
    if (cartDrawer && cartDrawer.classList.contains('open')) {
      if (!cartDrawer.contains(e.target) && !cartBtn.contains(e.target)) {
        cartDrawer.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  });

  // Newsletter Popup
  const newsletterPopup = document.getElementById('newsletter-popup');
  if (newsletterPopup) {
    const popupDelay = 10000; // 10 seconds
    const hasShownPopup = localStorage.getItem('newsletterPopupShown');
    
    if (!hasShownPopup) {
      setTimeout(function() {
        newsletterPopup.style.display = 'block';
        localStorage.setItem('newsletterPopupShown', 'true');
      }, popupDelay);
    }
  }

  // Close newsletter popup
  window.closeNewsletterPopup = function() {
    const popup = document.getElementById('newsletter-popup');
    if (popup) {
      popup.style.display = 'none';
    }
  };

  // Product Quick View
  window.quickView = function(productUrl) {
    fetch(productUrl + '?view=quick-view')
      .then(response => response.text())
      .then(html => {
        const modal = document.getElementById('quick-view-modal');
        const content = document.getElementById('quick-view-content');
        if (modal && content) {
          content.innerHTML = html;
          modal.style.display = 'block';
        }
      })
      .catch(error => {
        console.error('Error loading quick view:', error);
      });
  };

  // Close quick view modal
  window.closeQuickView = function() {
    const modal = document.getElementById('quick-view-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  };

  // Add to Cart Functionality
  window.addToCart = function(variantId, quantity = 1) {
    const formData = {
      items: [{
        id: variantId,
        quantity: quantity
      }]
    };

    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
      updateCartCount();
      showNotification('Product added to cart!', 'success');
      
      // Open cart drawer if enabled
      const cartDrawer = document.getElementById('cart-drawer');
      if (cartDrawer) {
        cartDrawer.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    })
    .catch(error => {
      showNotification('Error adding product to cart', 'error');
    });
  };

  // Update Cart Quantity
  window.updateCartQuantity = function(itemKey, newQuantity) {
    if (newQuantity < 1) {
      removeFromCart(itemKey);
      return;
    }
    
    const formData = {
      updates: {}
    };
    formData.updates[itemKey] = newQuantity;
    
    fetch('/cart/update.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(cart => {
      updateCartDisplay(cart);
    })
    .catch(error => {
      console.error('Error updating cart:', error);
    });
  };

  // Remove from Cart
  window.removeFromCart = function(itemKey) {
    const formData = {
      updates: {}
    };
    formData.updates[itemKey] = 0;
    
    fetch('/cart/update.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(cart => {
      updateCartDisplay(cart);
    })
    .catch(error => {
      console.error('Error removing item:', error);
    });
  };

  // Update Cart Display
  function updateCartDisplay(cart) {
    // Update cart count in header
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      cartCount.textContent = cart.item_count;
    }
    
    // Reload the page to show updated cart
    window.location.reload();
  }

  // Update Cart Count
  function updateCartCount() {
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
          cartCount.textContent = cart.item_count;
        }
      });
  }

  // Show Notification
  function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Search Functionality
  const searchForm = document.querySelector('.search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      const searchInput = document.getElementById('searchInput');
      if (!searchInput.value.trim()) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  // Product Image Zoom (if enabled)
  const productImages = document.querySelectorAll('.product-image img');
  productImages.forEach(img => {
    img.addEventListener('click', function() {
      if (window.theme && window.theme.productImageZoom === 'lightbox') {
        openLightbox(this.src, this.alt);
      }
    });
  });

  // Lightbox Functionality
  function openLightbox(imageSrc, imageAlt) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <span class="lightbox-close">&times;</span>
        <img src="${imageSrc}" alt="${imageAlt}">
      </div>
    `;
    
    document.body.appendChild(lightbox);
    
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
        lightbox.remove();
      }
    });
  }

  // Smooth Scrolling for Anchor Links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Lazy Loading for Images
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));

  // FAQ Accordion (if present)
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    if (question && answer) {
      question.addEventListener('click', function() {
        const isOpen = item.classList.contains('active');
        
        // Close all other FAQ items
        faqItems.forEach(otherItem => {
          otherItem.classList.remove('active');
        });
        
        // Toggle current item
        if (!isOpen) {
          item.classList.add('active');
        }
      });
    }
  });

  // Contact Form Validation
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      const requiredFields = contactForm.querySelectorAll('[required]');
      let isValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('error');
        } else {
          field.classList.remove('error');
        }
      });
      
      if (!isValid) {
        e.preventDefault();
        showNotification('Please fill in all required fields', 'error');
      }
    });
  }

  // Newsletter Form
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      const emailInput = this.querySelector('input[type="email"]');
      if (emailInput && !emailInput.value.trim()) {
        e.preventDefault();
        emailInput.focus();
        showNotification('Please enter your email address', 'error');
      }
    });
  }

  // Initialize tooltips
  const tooltips = document.querySelectorAll('[data-tooltip]');
  tooltips.forEach(element => {
    element.addEventListener('mouseenter', function() {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = this.getAttribute('data-tooltip');
      document.body.appendChild(tooltip);
      
      const rect = this.getBoundingClientRect();
      tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
      tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    });
    
    element.addEventListener('mouseleave', function() {
      const tooltip = document.querySelector('.tooltip');
      if (tooltip) {
        tooltip.remove();
      }
    });
  });
});

// Utility Functions
function formatMoney(cents, format) {
  if (typeof cents === 'string') {
    cents = cents.replace('.', '');
  }
  let value = '';
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  const formatString = format || window.theme.moneyFormat;

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = precision || 2;
    thousands = thousands || ',';
    decimal = decimal || '.';

    if (isNaN(number) || number == null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);

    const parts = number.split('.');
    const dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
    const centsAmount = parts[1] ? (decimal + parts[1]) : '';

    return dollarsAmount + centsAmount;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
  }

  return formatString.replace(placeholderRegex, value);
}

// Debounce function for performance
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

// Throttle function for scroll events
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
} 