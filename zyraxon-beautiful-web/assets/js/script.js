const testimonials = [
  { name: 'Aisha Rahman', role: 'Founder, Mosaic', quote: "ELY replaced a stack of five tools with one. My team finally feels focused again.", img: 21 },
  { name: 'Daniel Chen', role: 'Lead Designer, Onyx', quote: "The interface disappears when you need it to. That's the highest compliment I can give software.", img: 32 },
  { name: 'Sofia Martinez', role: 'PM, Hoverly', quote: "We shipped our v1 three weeks early. The real-time preview changed how we work.", img: 48 }
];

const list = document.getElementById('testimonialsList');
if (list) {
  list.innerHTML = testimonials.map(t => `
    <div class="reveal rounded-3xl border border-white/10 bg-white/[0.03] p-7 hover:bg-white/[0.06] transition">
      <div class="flex text-gold text-sm mb-4">★★★★★</div>
      <p class="text-paper/70 leading-relaxed">"${t.quote}"</p>
      <div class="mt-6 flex items-center gap-3">
        <img src="https://i.pravatar.cc/60?img=${t.img}" alt="${t.name}" class="w-10 h-10 rounded-full ring-2 ring-white/10">
        <div>
          <div class="font-semibold text-sm">${t.name}</div>
          <div class="text-xs text-paper/40">${t.role}</div>
        </div>
      </div>
    </div>
  `).join('');
}

const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.15 });
reveals.forEach(r => io.observe(r));

const glow = document.createElement('div');
glow.className = 'cursor-glow';
document.body.appendChild(glow);
window.addEventListener('mousemove', (e) => {
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});

const form = document.getElementById('signupForm');
const toast = document.getElementById('toast');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    toast.classList.remove('opacity-0');
    setTimeout(() => toast.classList.add('opacity-0'), 2800);
    form.reset();
  });
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      const el = document.querySelector(id);
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior:'smooth', block:'start' }); }
    }
  });
});