// Mobile menu toggle
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
menuBtn?.addEventListener('click', () => mobileMenu.classList.toggle('show'));

// Theme toggle (simple demo — toggles a class you can extend)
const themeToggle = document.getElementById('themeToggle');

// Function to update the theme toggle button text
function updateThemeButtonText() {
    if (themeToggle) {
        themeToggle.textContent = document.body.classList.contains('light') ? 'Light' : 'Dark';
    }
}

// Set initial state of the theme toggle button
document.addEventListener('DOMContentLoaded', updateThemeButtonText);

// Add click event listener to toggle theme
themeToggle?.addEventListener('click', () => {
  document.body.classList.toggle('light');
  updateThemeButtonText();
});

// Animated counters when in view (support + or % suffix)
const counters = document.querySelectorAll('[data-count]');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = +el.getAttribute('data-count');
      const originalText = el.textContent.trim();
      const suffix = originalText.replace(/[0-9]/g, ''); // lấy ký tự ngoài số, ví dụ + hoặc %
      let start = 0;
      const step = Math.ceil(target / 60);
      const t = setInterval(() => {
        start += step;
        if (start >= target) {
          start = target;
          clearInterval(t);
        }
        el.textContent = start + suffix;
      }, 20);
      io.unobserve(el);
    }
  });
}, { threshold: .4 });
counters.forEach(c => io.observe(c));

// Contact form (client-side demo only)
const f = document.getElementById('contactForm');
f?.addEventListener('submit', (e) => {
  e.preventDefault();
  document.getElementById('formMsg').textContent = 'Thanks! We\'ll get back to you soon.';
  f.reset();
});

// Newsletter (client-side demo only)
const n = document.getElementById('newsletter');
n?.addEventListener('submit', (e) => {
  e.preventDefault();
  document.getElementById('newsMsg').textContent = 'Subscribed. Check your inbox!';
  n.reset();
});



// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = document.querySelector(id);
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// Scroll animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Hiển thị phần tử khi nó lọt vào khung nhìn
            entry.target.classList.add('is-visible');
        } else {
            // Ẩn phần tử khi nó rời khỏi khung nhìn
            entry.target.classList.remove('is-visible');
        }
    });
}, { threshold: 0.2 }); // Kích hoạt khi phần tử hiện 20% trên màn hình

document.querySelectorAll('.animate').forEach(el => observer.observe(el));

// Dropdown for nav link
const servicesNavBtn = document.getElementById('services-nav-btn');
const dropdownMenu = servicesNavBtn?.nextElementSibling;

servicesNavBtn?.addEventListener('click', (e) => {
    e.preventDefault(); // Ngăn trình duyệt cuộn lên đầu trang
    dropdownMenu.classList.toggle('show');
    servicesNavBtn.classList.toggle('active'); // Thêm/xoá class active để xoay icon
});

// Close dropdown if user clicks outside
document.addEventListener('click', (e) => {
    if (!servicesNavBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove('show');
        servicesNavBtn.classList.remove('active'); // Xóa class active khi đóng
    }
});

// Image data for each project
const projectsData = {
    project1: [
        'https://images.unsplash.com/photo-1505692794403-34d4982f88aa?q=80&w=1200',
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200'
    ],
    project2: [
        'https://images.unsplash.com/photo-1597047084897-51e81819a499?q=80&w=1200',
        'https://images.unsplash.com/photo-1588880331179-bc9b0f49615a?q=80&w=1200',
        'https://images.unsplash.com/photo-1588880331179-bc9b0f49615a?q=80&w=1200',
    ],
    project3: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200',
        'https://images.unsplash.com/photo-1560518883-ce09204cb647?q=80&w=1200'
    ],
    project4: [
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200',
        'https://images.unsplash.com/photo-1505692794403-34d4982f88aa?q=80&w=1200',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200'
    ],
    project5: [
        'https://images.unsplash.com/photo-1500043357865-c6b8827edfef?q=80&w=1200',
        'https://images.unsplash.com/photo-1588880331179-bc9b0f49615a?q=80&w=1200'
    ],
    project6: [
        'https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=1200',
        'https://images.unsplash.com/photo-1560518883-ce09204cb647?q=80&w=1200',
        'https://images.unsplash.com/photo-1505692794403-34d4982f88aa?q=80&w=1200'
    ],
    project7: [
        'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1200',
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200'
    ],
    project8: [
        'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200',
        'https://images.unsplash.com/photo-1588880331179-bc9b0f49615a?q=80&w=1200'
    ]
};

// Modal elements
const modal = document.createElement('div');
modal.classList.add('modal');
modal.innerHTML = `
    <div class="modal-content">
        <button class="modal-close">&times;</button>
        <div class="modal-images"></div>
    </div>
`;
document.body.appendChild(modal);

const modalImages = modal.querySelector('.modal-images');
const modalCloseBtn = modal.querySelector('.modal-close');

// Handle project card clicks
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', (e) => {
        e.preventDefault();
        const projectId = card.dataset.project;
        const images = projectsData[projectId];
        if (images) {
            modalImages.innerHTML = images.map(src => `<img src="${src}" alt="Project image">`).join('');
            modal.style.display = 'flex';
        }
    });
});

// Close modal
modalCloseBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Handle ESC key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") {
        modal.style.display = "none";
    }
});

// Swiper.js initialization
document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo tất cả các swiper trên trang
    const swiperInstances = document.querySelectorAll('.init-swiper');
    swiperInstances.forEach((swiperElement) => {
        let swiperConfig = swiperElement.querySelector('.swiper-config');
        if (swiperConfig) {
            swiperConfig = JSON.parse(swiperConfig.textContent);
            new Swiper(swiperElement, swiperConfig);
        }
    });
});
