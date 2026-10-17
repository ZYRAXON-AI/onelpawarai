// Streakly — Habit Tracker logic
// Storage: localStorage (persists per device)

const STORAGE_KEY = 'streakly_habits';

function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function loadHabits() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveHabits(habits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

let habits = loadHabits();

function computeStreak(habit) {
  // habit.completions: array of YYYY-MM-DD strings
  const set = new Set(habit.completions || []);
  let streak = 0;
  const d = new Date();
  // Walk backwards from today, counting consecutive days
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (set.has(key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      // allow "today not yet done" without breaking streak from yesterday
      if (streak === 0 && key === todayKey()) {
        d.setDate(d.getDate() - 1);
        continue;
      }
      break;
    }
  }
  return streak;
}

function isDoneToday(habit) {
  return (habit.completions || []).includes(todayKey());
}

function render() {
  const list = document.getElementById('habit-list');
  const empty = document.getElementById('empty-state');
  list.innerHTML = '';

  if (habits.length === 0) {
    empty.classList.remove('hidden');
  } else {
    empty.classList.add('hidden');
  }

  habits.forEach((habit, idx) => {
    const done = isDoneToday(habit);
    const streak = computeStreak(habit);
    const li = document.createElement('li');
    li.className = 'habit-card' + (done ? ' done' : '');
    li.innerHTML = `
      <button class="habit-check" data-idx="${idx}" aria-label="Mark done">${done ? '✓' : ''}</button>
      <div class="habit-info">
        <div class="habit-name ${done ? 'done' : ''}">${escapeHtml(habit.name)}</div>
        <div class="habit-meta">Added ${formatDate(habit.createdAt)}</div>
      </div>
      <span class="streak-badge">🔥 ${streak} day${streak === 1 ? '' : 's'}</span>
      <button class="habit-delete" data-del="${idx}" aria-label="Delete">✕</button>
    `;
    list.appendChild(li);
  });

  updateStats();
}

function updateStats() {
  document.getElementById('stat-habits').textContent = habits.length;
  document.getElementById('stat-done').textContent = habits.filter(isDoneToday).length;
  const best = habits.reduce((m, h) => Math.max(m, computeStreak(h)), 0);
  document.getElementById('stat-best').textContent = best;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (e) {
    return '';
  }
}

// Add habit
document.getElementById('add-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('habit-name');
  const name = input.value.trim();
  if (!name) return;
  habits.push({ name, createdAt: new Date().toISOString(), completions: [] });
  saveHabits(habits);
  input.value = '';
  render();
});

// Toggle done / delete (delegated)
document.getElementById('habit-list').addEventListener('click', (e) => {
  const check = e.target.closest('.habit-check');
  const del = e.target.closest('.habit-delete');
  if (check) {
    const idx = parseInt(check.dataset.idx, 10);
    const habit = habits[idx];
    if (!habit) return;
    const key = todayKey();
    habit.completions = habit.completions || [];
    const pos = habit.completions.indexOf(key);
    if (pos >= 0) {
      habit.completions.splice(pos, 1); // un-done
    } else {
      habit.completions.push(key);
    }
    saveHabits(habits);
    render();
  }
  if (del) {
    const idx = parseInt(del.dataset.del, 10);
    if (confirm('Delete this habit?')) {
      habits.splice(idx, 1);
      saveHabits(habits);
      render();
    }
  }
});

// Reset today's completions
document.getElementById('clear-done').addEventListener('click', () => {
  const key = todayKey();
  habits.forEach(h => {
    if (h.completions) h.completions = h.completions.filter(c => c !== key);
  });
  saveHabits(habits);
  render();
});

// Initial render
render();