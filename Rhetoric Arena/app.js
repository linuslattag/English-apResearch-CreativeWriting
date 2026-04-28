(function () {
  const STORAGE_KEY = 'rhetoric-arena-save-v1';
  const app = document.getElementById('app');
  const liveRegion = document.getElementById('live-region');
  const data = window.RA_DATA;
  const allItems = buildItemIndex(data.content);
  const arenaById = Object.fromEntries(data.arenas.map((arena) => [arena.id, arena]));
  const bossById = Object.fromEntries(data.bosses.map((boss) => [boss.id, boss]));
  const categoryHints = {
    'Defensible Claim': 'A defensible claim takes a position someone could actually debate.',
    'Weak Claim': 'A weak claim is too broad, obvious, or vague to build strong reasoning.',
    Evidence: 'Evidence supplies proof, data, or concrete example.',
    Commentary: 'Commentary explains how the evidence supports the claim.'
  };

  const state = {
    currentMode: 'campaign',
    profile: loadProfile(),
    toast: null,
    timerId: null,
    timerPulse: false,
    audio: createAudioEngine(),
    session: null,
    endlessSeed: 0,
    shouldFocus: true
  };

  syncBodyFlags();
  render();
  document.addEventListener('keydown', handleGlobalKeydown);

  function buildItemIndex(content) {
    const index = {};
    Object.keys(content).forEach((mechanic) => {
      content[mechanic].forEach((item) => {
        index[item.id] = Object.assign({ mechanic: mechanic }, item);
      });
    });
    return index;
  }

  function loadProfile() {
    const base = {
      xp: 0,
      totalScore: 0,
      sessionsPlayed: 0,
      titlesUnlocked: ['Fresh Ink'],
      badges: [],
      currentTitle: 'Fresh Ink',
      unlockedArenaCount: 1,
      roundBest: {},
      bossBest: {},
      arenaCompletions: {},
      endlessBest: 0,
      bossRushBest: 0,
      practiceHistory: [],
      settings: {
        soundMuted: false,
        volume: 0.6,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        timerEnabled: true
      },
      teacherSettings: {
        arenaId: data.arenas[0].id,
        difficulty: 'standard',
        timerEnabled: true,
        presentationMode: false
      }
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return base;
      }
      const parsed = JSON.parse(raw);
      return deepMerge(base, parsed);
    } catch (error) {
      return base;
    }
  }

  function deepMerge(target, source) {
    const output = Array.isArray(target) ? target.slice() : Object.assign({}, target);
    Object.keys(source || {}).forEach((key) => {
      const sourceValue = source[key];
      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        target[key] &&
        typeof target[key] === 'object' &&
        !Array.isArray(target[key])
      ) {
        output[key] = deepMerge(target[key], sourceValue);
      } else {
        output[key] = sourceValue;
      }
    });
    return output;
  }

  function saveProfile() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.profile));
  }

  function getLevelFromXp(xp) {
    return Math.floor(xp / 180) + 1;
  }

  function getCurrentTitle(level) {
    return data.titles.reduce((current, entry) => (level >= entry.level ? entry.title : current), data.titles[0].title);
  }

  function getXpProgress(level, xp) {
    const currentFloor = (level - 1) * 180;
    const currentCeiling = level * 180;
    return {
      current: xp - currentFloor,
      needed: currentCeiling - currentFloor,
      pct: ((xp - currentFloor) / (currentCeiling - currentFloor)) * 100
    };
  }

  function syncProgressDerived() {
    const level = getLevelFromXp(state.profile.xp);
    const newTitle = getCurrentTitle(level);
    state.profile.level = level;
    if (!state.profile.titlesUnlocked.includes(newTitle)) {
      state.profile.titlesUnlocked.push(newTitle);
    }
    state.profile.currentTitle = newTitle;
  }

  function syncBodyFlags() {
    document.body.classList.toggle('reduced-motion', !!state.profile.settings.reducedMotion);
    document.body.classList.toggle('presentation-mode', !!state.profile.teacherSettings.presentationMode);
  }

  function render() {
    syncProgressDerived();
    const levelProgress = getXpProgress(state.profile.level, state.profile.xp);
    const shouldFocus = state.shouldFocus;
    app.innerHTML = `
      <div class="chrome">
        <aside class="rail left-rail">
          ${renderLeftRail(levelProgress)}
        </aside>
        <main class="stage">
          ${renderMainStage()}
        </main>
        <aside class="rail right-rail">
          ${renderRightRail(levelProgress)}
        </aside>
      </div>
      ${state.toast ? renderToast() : ''}
    `;
    bindUI();
    if (shouldFocus) {
      focusFirstInteractive();
      state.shouldFocus = false;
    }
  }

  function renderLeftRail(levelProgress) {
    const modeButtons = [
      ['campaign', 'Campaign Mode'],
      ['endless', 'Endless Mode'],
      ['practice', 'Practice Mode'],
      ['bossRush', 'Boss Rush'],
      ['teacher', 'Teacher Mode']
    ]
      .map(
        ([mode, label]) => `
          <button class="nav-button ${state.currentMode === mode ? 'active' : ''}" data-action="switch-mode" data-mode="${mode}">
            ${label}
          </button>
        `
      )
      .join('');

    return `
      <div class="top-stack">
        <div class="logo-row">
          <div class="brand-mark">RA</div>
          <div class="brand-title">
            <div class="eyebrow">Arcade AP Lang</div>
            <div class="round-title">Rhetoric Arena</div>
          </div>
        </div>
        <div class="coach-box">
          <div class="coach-head">
            <div class="coach-icon">DS</div>
            <div>
              <strong>Dean Static</strong>
              <div class="muted small">${pickLine(data.announcerLines.opening)}</div>
            </div>
          </div>
        </div>
        <div class="panel">
          <div class="pill-row">
            <span class="stat-pill">Level <strong>${state.profile.level}</strong></span>
            <span class="stat-pill">Title <strong>${state.profile.currentTitle}</strong></span>
          </div>
          <div class="progress-stack">
            <div class="progress-bar"><div class="progress-fill" style="width:${clamp(levelProgress.pct, 0, 100)}%"></div></div>
            <div class="small muted">${Math.round(levelProgress.current)} / ${levelProgress.needed} XP to next rank</div>
          </div>
        </div>
        <div class="mode-stack">
          ${modeButtons}
        </div>
      </div>
    `;
  }

  function renderRightRail(levelProgress) {
    const completedArenas = Object.keys(state.profile.arenaCompletions).length;
    const recentBadges = state.profile.badges.slice(-4);
    const timerLabel = state.profile.settings.timerEnabled ? 'Timer On' : 'Timer Off';
    const soundLabel = state.profile.settings.soundMuted ? 'Muted' : `Volume ${Math.round(state.profile.settings.volume * 100)}%`;

    return `
      <div class="metric-card">
        <strong>Total Score</strong>
        <div class="big">${formatNumber(state.profile.totalScore)}</div>
        <div class="muted small">${state.profile.sessionsPlayed} rounds cleared</div>
      </div>
      <div class="metric-card">
        <strong>Arenas Cleared</strong>
        <div class="big">${completedArenas} / ${data.arenas.length}</div>
        <div class="muted small">Campaign ladder progress</div>
      </div>
      <div class="metric-card">
        <strong>Best Endless</strong>
        <div class="big">${formatNumber(state.profile.endlessBest)}</div>
        <div class="muted small">Boss Rush best ${formatNumber(state.profile.bossRushBest)}</div>
      </div>
      <div class="panel settings-stack">
        <strong>Quick Controls</strong>
        <button class="toggle" data-action="toggle-sound">${soundLabel}</button>
        <label class="small muted" for="volume-slider">Volume</label>
        <input id="volume-slider" data-action="volume-change" type="range" min="0" max="1" step="0.05" value="${state.profile.settings.volume}" />
        <button class="toggle" data-action="toggle-timer">${timerLabel}</button>
        <button class="toggle" data-action="toggle-motion">${state.profile.settings.reducedMotion ? 'Reduced Motion On' : 'Reduced Motion Off'}</button>
      </div>
      <div class="panel">
        <strong>Recent Badges</strong>
        <div class="pill-row">
          ${
            recentBadges.length
              ? recentBadges
                  .map((badge) => `<span class="pill">${badge}</span>`)
                  .join('')
              : '<span class="muted small">No badges yet. The arena remains unimpressed.</span>'
          }
        </div>
      </div>
      <div class="panel">
        <strong>Teacher Snapshot</strong>
        <div class="small muted">Classroom setup remembers arena, difficulty, timer, and presentation mode.</div>
        <div class="pill-row">
          <span class="pill">${arenaById[state.profile.teacherSettings.arenaId].name}</span>
          <span class="pill">${capitalize(state.profile.teacherSettings.difficulty)}</span>
        </div>
      </div>
    `;
  }

  function renderMainStage() {
    if (state.session) {
      return renderSession();
    }

    switch (state.currentMode) {
      case 'endless':
        return renderEndlessHub();
      case 'practice':
        return renderPracticeHub();
      case 'bossRush':
        return renderBossRushHub();
      case 'teacher':
        return renderTeacherHub();
      case 'campaign':
      default:
        return renderCampaignHub();
    }
  }

  function renderCampaignHub() {
    const nextArena = data.arenas[Math.min(state.profile.unlockedArenaCount - 1, data.arenas.length - 1)];
    const arenaCards = data.arenas
      .map((arena, index) => {
        const isLocked = index >= state.profile.unlockedArenaCount;
        const progress = getArenaProgress(arena);
        const medal = progress.bestMedal || '--';
        const isCurrent = index === state.profile.unlockedArenaCount - 1;
        return `
          <button class="arena-tile ${isLocked ? 'locked' : ''} ${isCurrent ? 'current' : ''}" data-action="view-arena" data-arena-id="${arena.id}" ${isLocked ? 'disabled' : ''}>
            <div class="pill-row">
              <span class="arena-pill">${arena.focus}</span>
              <span class="arena-pill">${progress.cleared}/${arena.rounds.length + 1} cleared</span>
            </div>
            <h3>${arena.name}</h3>
            <div>${arena.theme}</div>
            <div class="progress-bar"><div class="progress-fill" style="width:${progress.pct}%"></div></div>
            <div class="small muted">${isLocked ? 'Locked behind previous arena boss.' : `Best medal: ${medal}`}</div>
          </button>
        `;
      })
      .join('');

    return `
      <div class="main-header">
        <div class="eyebrow">Campaign Mode</div>
        <div class="hero-grid">
          <section class="hero-banner">
            <div>
              <h1 class="title">Climb The Rhetoric Ladder</h1>
              <p class="subtitle">
                Short, high-energy AP Lang battles with combos, medals, bosses, and just enough announcer chaos to keep the pressure useful.
              </p>
            </div>
            <div class="hero-stats">
              <div class="hero-stat">
                <div class="muted small">Next Arena</div>
                <div class="value">${nextArena.name}</div>
              </div>
              <div class="hero-stat">
                <div class="muted small">Current Title</div>
                <div class="value">${state.profile.currentTitle}</div>
              </div>
              <div class="hero-stat">
                <div class="muted small">Best Streak Badge</div>
                <div class="value">${findBestBadge()}</div>
              </div>
            </div>
            <div class="quick-actions">
              <button class="btn primary" data-action="continue-campaign">Continue Campaign</button>
              <button class="btn secondary" data-action="start-random-practice">Quick Remix Round</button>
            </div>
          </section>
          <section class="panel">
            <strong>Campaign Rhythm</strong>
            <div class="summary-grid">
              <div class="summary-card">
                <div class="muted small">Rounds</div>
                <div class="big">30-90s</div>
              </div>
              <div class="summary-card">
                <div class="muted small">Feedback</div>
                <div class="big">Instant</div>
              </div>
              <div class="summary-card">
                <div class="muted small">Bosses</div>
                <div class="big">${data.bosses.length}</div>
              </div>
            </div>
            <div class="arena-callout">
              <strong>Win Condition</strong>
              <div class="muted">
                Read quickly, reason cleanly, and keep the combo alive long enough to make the score meter ridiculous.
              </div>
            </div>
          </section>
        </div>
      </div>
      <section class="panel">
        <div class="prompt-head">
          <div>
            <div class="eyebrow">Arena Ladder</div>
            <div class="round-title">Tournament Path</div>
          </div>
          <div class="small muted">Each arena: 3 short rounds + 1 boss</div>
        </div>
        <div class="arena-grid">${arenaCards}</div>
      </section>
      ${renderArenaPreview(state.profile.selectedArenaId || data.arenas[Math.min(state.profile.unlockedArenaCount - 1, data.arenas.length - 1)].id)}
    `;
  }

  function renderArenaPreview(arenaId) {
    const arena = arenaById[arenaId];
    if (!arena) {
      return '';
    }
    const boss = bossById[arena.bossId];
    const progress = getArenaProgress(arena);
    const roundButtons = arena.rounds
      .map((round) => {
        const best = state.profile.roundBest[round.id];
        return `
          <button class="choice-pill" data-action="start-campaign-round" data-arena-id="${arena.id}" data-round-id="${round.id}">
            <span>${round.title}</span>
            <span>${best ? `${best.medal} ${formatNumber(best.score)}` : 'Unplayed'}</span>
          </button>
        `;
      })
      .join('');

    const bossBest = state.profile.bossBest[boss.id];
    const isBossUnlocked = progress.cleared >= arena.rounds.length;

    return `
      <section class="panel">
        <div class="prompt-head">
          <div>
            <div class="eyebrow">${arena.focus}</div>
            <div class="round-title">${arena.name}</div>
          </div>
          <div class="pill-row">
            <span class="pill">${arena.theme}</span>
            <span class="pill">${progress.bestMedal || 'No medal yet'}</span>
          </div>
        </div>
        <div class="hero-grid">
          <div class="summary-grid">
            <div class="summary-card">
              <strong>Skill Focus</strong>
              <div>${arena.focus}</div>
            </div>
            <div class="summary-card">
              <strong>Cleared</strong>
              <div>${progress.cleared} / ${arena.rounds.length + 1}</div>
            </div>
            <div class="summary-card">
              <strong>Boss</strong>
              <div>${boss.name}</div>
            </div>
          </div>
          <div class="panel">
            <strong>Round Queue</strong>
            <div class="meta-row">${roundButtons}</div>
            <button class="btn ${isBossUnlocked ? 'primary' : 'ghost'}" data-action="start-campaign-boss" data-arena-id="${arena.id}" ${isBossUnlocked ? '' : 'disabled'}>
              ${isBossUnlocked ? `Fight Boss: ${boss.name}` : 'Clear all short rounds to unlock boss'}
            </button>
            <div class="small muted">${bossBest ? `Best boss clear: ${bossBest.medal} ${formatNumber(bossBest.score)}` : 'Boss not cleared yet.'}</div>
          </div>
        </div>
      </section>
    `;
  }

  function renderEndlessHub() {
    return `
      <div class="main-header">
        <div class="eyebrow">Endless Mode</div>
        <h1 class="title">Keep The Streak Alive</h1>
        <p class="subtitle">
          Randomized micro-battles from your unlocked mechanics. Three misses end the run. Your best score goes on the board.
        </p>
      </div>
      <div class="hero-grid">
        <section class="panel">
          <strong>How It Works</strong>
          <div class="pill-row">
            <span class="pill">Mixed mechanics</span>
            <span class="pill">3 lives</span>
            <span class="pill">Score escalates with combo</span>
          </div>
          <div class="muted">This is the clean replay loop: faster rounds, no menu drag, and constant skill remix.</div>
          <div class="quick-actions">
            <button class="btn primary" data-action="start-endless">Start Endless</button>
            <button class="btn ghost" data-action="switch-mode" data-mode="campaign">Back To Campaign</button>
          </div>
        </section>
        <section class="panel">
          <strong>Your Endless Board</strong>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="muted small">Best Score</div>
              <div class="big">${formatNumber(state.profile.endlessBest)}</div>
            </div>
            <div class="summary-card">
              <div class="muted small">Unlocked Mechanics</div>
              <div class="big">${getUnlockedMechanics().length}</div>
            </div>
            <div class="summary-card">
              <div class="muted small">Current Level</div>
              <div class="big">${state.profile.level}</div>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function renderPracticeHub() {
    const unlockedArenas = data.arenas.slice(0, state.profile.unlockedArenaCount);
    const arenaButtons = unlockedArenas
      .map(
        (arena) => `
          <button class="choice-pill" data-action="practice-arena" data-arena-id="${arena.id}">
            <span>${arena.name}</span>
            <span>${arena.focus}</span>
          </button>
        `
      )
      .join('');
    return `
      <div class="main-header">
        <div class="eyebrow">Practice Mode</div>
        <h1 class="title">Target The Weak Spot</h1>
        <p class="subtitle">Choose an arena, replay a mechanic, and build score confidence without campaign lock pressure.</p>
      </div>
      <section class="panel">
        <strong>Unlocked Practice Arenas</strong>
        <div class="meta-row">${arenaButtons}</div>
      </section>
      <section class="panel">
        <strong>Quick Launch</strong>
        <div class="quick-actions">
          <button class="btn primary" data-action="start-random-practice">Random Mixed Practice</button>
          <button class="btn secondary" data-action="practice-arena" data-arena-id="${data.arenas[0].id}">Start From Audience Arena</button>
        </div>
      </section>
    `;
  }

  function renderBossRushHub() {
    const unlockedBosses = data.bosses.filter((boss, index) => index < state.profile.unlockedArenaCount);
    return `
      <div class="main-header">
        <div class="eyebrow">Boss Rush</div>
        <h1 class="title">No Easy Rounds</h1>
        <p class="subtitle">Bosses only. Multi-stage pressure. Great for flexing. Terrible for excuses.</p>
      </div>
      <div class="hero-grid">
        <section class="panel">
          <strong>Unlocked Bosses</strong>
          <div class="meta-row">
            ${unlockedBosses
              .map(
                (boss) => `
                  <button class="choice-pill" data-action="start-single-boss" data-boss-id="${boss.id}">
                    <span>${boss.name}</span>
                    <span>${state.profile.bossBest[boss.id] ? state.profile.bossBest[boss.id].medal : 'Uncleared'}</span>
                  </button>
                `
              )
              .join('')}
          </div>
        </section>
        <section class="panel">
          <strong>Rush It</strong>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="muted small">Best Rush</div>
              <div class="big">${formatNumber(state.profile.bossRushBest)}</div>
            </div>
            <div class="summary-card">
              <div class="muted small">Unlocked</div>
              <div class="big">${unlockedBosses.length}</div>
            </div>
            <div class="summary-card">
              <div class="muted small">Pressure</div>
              <div class="big">High</div>
            </div>
          </div>
          <div class="quick-actions">
            <button class="btn primary" data-action="start-boss-rush">Start Boss Rush</button>
          </div>
        </section>
      </div>
    `;
  }

  function renderTeacherHub() {
    const arenaOptions = data.arenas
      .map(
        (arena) => `<option value="${arena.id}" ${arena.id === state.profile.teacherSettings.arenaId ? 'selected' : ''}>${arena.name}</option>`
      )
      .join('');
    const teacherArena = arenaById[state.profile.teacherSettings.arenaId];
    const practicedSkills = collectArenaSkills(teacherArena);
    return `
      <div class="main-header">
        <div class="eyebrow">Teacher Mode</div>
        <h1 class="title">Classroom Challenge Control</h1>
        <p class="subtitle">Pick the arena, timer, difficulty, and presentation mode. Then launch a replayable projected round with almost no friction.</p>
      </div>
      <div class="hero-grid">
        <section class="teacher-box">
          <div class="teacher-controls">
            <label>
              <strong>Arena</strong>
              <select data-action="teacher-arena">
                ${arenaOptions}
              </select>
            </label>
            <label>
              <strong>Difficulty</strong>
              <select data-action="teacher-difficulty">
                <option value="relaxed" ${state.profile.teacherSettings.difficulty === 'relaxed' ? 'selected' : ''}>Relaxed</option>
                <option value="standard" ${state.profile.teacherSettings.difficulty === 'standard' ? 'selected' : ''}>Standard</option>
                <option value="savage" ${state.profile.teacherSettings.difficulty === 'savage' ? 'selected' : ''}>Savage</option>
              </select>
            </label>
            <button class="toggle" data-action="teacher-toggle-timer">${state.profile.teacherSettings.timerEnabled ? 'Timer Enabled' : 'Timer Disabled'}</button>
            <button class="toggle" data-action="teacher-toggle-presentation">${state.profile.teacherSettings.presentationMode ? 'Presentation Mode On' : 'Presentation Mode Off'}</button>
            <div class="quick-actions">
              <button class="btn primary" data-action="launch-teacher-round">Launch Classroom Challenge</button>
              <button class="btn secondary" data-action="launch-teacher-boss">Launch Arena Boss</button>
            </div>
          </div>
        </section>
        <section class="panel">
          <strong>What This Practices</strong>
          <div class="pill-row">${practicedSkills.map((skill) => `<span class="pill">${skill}</span>`).join('')}</div>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="muted small">Arena</div>
              <div class="big">${teacherArena.name}</div>
            </div>
            <div class="summary-card">
              <div class="muted small">Rounds</div>
              <div class="big">${teacherArena.rounds.length}</div>
            </div>
            <div class="summary-card">
              <div class="muted small">Boss</div>
              <div class="big">${bossById[teacherArena.bossId].name}</div>
            </div>
          </div>
          <div class="muted">
            Teachers can swap arenas, timer settings, and difficulty without touching the code. Content expands by editing the local prompt arrays in <code>data.js</code>.
          </div>
        </section>
      </div>
    `;
  }

  function renderSession() {
    if (state.session.phase === 'summary') {
      return renderSummaryScreen();
    }

    const session = state.session;
    const current = session.items[session.index];
    const progressPct = ((session.index + (session.phase === 'feedback' ? 1 : 0)) / session.items.length) * 100;
    const timerPct = session.timerActive ? (session.timeRemaining / session.timeLimit) * 100 : 100;
    const timerClass = session.timeRemaining <= 10 ? 'pressure' : '';
    const isBoss = session.kind.toLowerCase().includes('boss');

    return `
      <div class="round-shell">
        <div class="${isBoss ? 'boss-banner' : 'panel'}">
          <div class="prompt-head">
            <div>
              <div class="eyebrow">${session.modeLabel}</div>
              <div class="round-title">${session.title}</div>
            </div>
            <div class="score-line">
              <div class="score-box">
                <div class="muted small">Score</div>
                <strong>${formatNumber(session.score)}</strong>
              </div>
              <div class="score-box">
                <div class="muted small">Combo</div>
                <strong>x${session.multiplier.toFixed(2)}</strong>
              </div>
              <div class="score-box">
                <div class="muted small">Streak</div>
                <strong>${session.combo}</strong>
              </div>
              ${
                session.lives !== null
                  ? `<div class="score-box">
                      <div class="muted small">Lives</div>
                      <strong>${session.lives}</strong>
                    </div>`
                  : ''
              }
            </div>
          </div>
          <div class="progress-stack">
            <div class="progress-bar"><div class="progress-fill" style="width:${progressPct}%"></div></div>
            <div class="timer-bar"><div class="timer-fill ${timerClass}" style="width:${timerPct}%"></div></div>
            <div class="small muted">
              ${session.timerActive ? `${Math.ceil(session.timeRemaining)}s left` : 'Timer disabled'} | ${session.index + 1} / ${session.items.length} decisions
            </div>
          </div>
        </div>
        <div class="round-topline">
          <section class="prompt-panel">
            ${renderCurrentChallenge(current, session)}
          </section>
          <aside class="battlefield">
            <div class="coach-box">
              <div class="coach-head">
                <div class="coach-icon">${isBoss ? 'IV' : 'CM'}</div>
                <div>
                  <strong>${isBoss ? 'Ivy Voss' : 'Coach Margot'}</strong>
                  <div class="muted">${session.coachLine}</div>
                </div>
              </div>
              ${session.feedback ? renderFeedback(session.feedback) : '<div class="muted">Lock a choice to hear the arena talk back.</div>'}
            </div>
            <div class="panel">
              <strong>Skill Feed</strong>
              <div class="pill-row">
                <span class="pill">${data.mechanics[current.mechanic].name}</span>
                <span class="pill">${current.skill || data.mechanics[current.mechanic].skill}</span>
                <span class="pill">${session.timerActive ? 'Timer Live' : 'Timer Off'}</span>
              </div>
            </div>
            ${
              isBoss
                ? `<div class="panel">
                    <strong>Boss Meter</strong>
                    <div class="health-bar"><div class="health-fill" style="width:${(session.index / session.items.length) * 100}%"></div></div>
                    <div class="small muted">${session.index} stages cleared of ${session.items.length}</div>
                  </div>`
                : ''
            }
          </aside>
        </div>
      </div>
    `;
  }

  function renderCurrentChallenge(challenge, session) {
    const mechanic = data.mechanics[challenge.mechanic];
    const headline = challenge.question || challenge.goal || challenge.claim || challenge.thesis || challenge.position || challenge.statement || challenge.argument;
    const promptHead = `
      <div class="prompt-head">
        <div>
          <div class="prompt-label">${mechanic.name}</div>
          ${challenge.stageLabel ? `<div class="eyebrow">${challenge.stageLabel}</div>` : ''}
          <div class="prompt-question">${headline}</div>
        </div>
        <div class="round-badge">${mechanic.icon} ${mechanic.short}</div>
      </div>
    `;

    if (challenge.mechanic === 'snap') {
      return `
        ${promptHead}
        <div class="passage-block">${challenge.stem}</div>
        <div class="muted">${mechanic.howTo}</div>
        <div class="option-grid">
          ${challenge.options
            .map(
              (option, index) => `
                <button class="choice-card" data-action="snap-answer" data-option-index="${index}">
                  <strong><span class="hotkey">${index + 1}</span> Read</strong>
                  <div>${option.label}</div>
                </button>
              `
            )
            .join('')}
        </div>
      `;
    }

    if (challenge.mechanic === 'claimChaos') {
      return `
        ${promptHead}
        <div class="sort-board">
          <div class="argument-block">${challenge.statement}</div>
          <div class="bins">
            ${data.categories
              .map(
                (category, index) => `
                  <button class="bin-button" data-action="claim-answer" data-category="${category}">
                    <span>${category}</span>
                    <span class="hotkey">${index + 1}</span>
                  </button>
                `
              )
              .join('')}
          </div>
        </div>
        <div class="muted">${mechanic.howTo}</div>
      `;
    }

    if (challenge.mechanic === 'evidence') {
      return `
        ${promptHead}
        <div class="argument-block"><strong>Claim:</strong> ${challenge.claim}</div>
        <div class="muted">${mechanic.howTo}</div>
        <div class="option-grid">
          ${challenge.options
            .map(
              (option, index) => `
                <button class="choice-card" data-action="evidence-answer" data-option-index="${index}">
                  <strong><span class="hotkey">${index + 1}</span> Evidence</strong>
                  <div>${option.label}</div>
                </button>
              `
            )
            .join('')}
        </div>
      `;
    }

    if (challenge.mechanic === 'logic') {
      return `
        ${promptHead}
        <div class="argument-block"><strong>Claim:</strong> ${challenge.thesis}</div>
        <div class="logic-assembly">
          <div class="logic-slots">
            ${[0, 1, 2, 3]
              .map((slot) => {
                const stepIndex = session.logicSelection[slot];
                return `
                  <div class="logic-slot">
                    <strong>Step ${slot + 1}</strong>
                    <div>${stepIndex !== undefined ? challenge.shuffledSteps[stepIndex].text : 'Choose from the bank below'}</div>
                  </div>
                `;
              })
              .join('')}
          </div>
          <div class="muted">${mechanic.howTo}</div>
          <div class="logic-bank">
            ${challenge.shuffledSteps
              .map(
                (step, index) => `
                  <button class="step-card ${session.logicSelection.includes(index) ? 'selected disabled' : ''}" data-action="logic-pick" data-step-index="${index}" ${session.logicSelection.includes(index) ? 'disabled' : ''}>
                    <strong><span class="hotkey">${index + 1}</span> Step Card</strong>
                    <div>${step.text}</div>
                  </button>
                `
              )
              .join('')}
          </div>
          <div class="quick-actions">
            <button class="btn ghost" data-action="logic-reset">Reset Order</button>
            <button class="btn primary" data-action="logic-submit" ${session.logicSelection.length === challenge.shuffledSteps.length ? '' : 'disabled'}>Lock Order</button>
          </div>
        </div>
      `;
    }

    if (challenge.mechanic === 'style') {
      return `
        ${promptHead}
        <div class="revision-block"><strong>Weak sentence:</strong> ${challenge.weak}</div>
        <div class="muted">${mechanic.howTo}</div>
        <div class="option-grid">
          ${challenge.options
            .map(
              (option, index) => `
                <button class="choice-card" data-action="style-answer" data-option-index="${index}">
                  <strong><span class="hotkey">${index + 1}</span> Revision</strong>
                  <div>${option.label}</div>
                </button>
              `
            )
            .join('')}
        </div>
      `;
    }

    if (challenge.mechanic === 'fallacy') {
      return `
        ${promptHead}
        <div class="argument-block"><strong>${challenge.enemy} says:</strong> ${challenge.argument}</div>
        <div class="muted">${mechanic.howTo}</div>
        <div class="option-grid">
          ${challenge.options
            .map(
              (option, index) => `
                <button class="choice-card" data-action="fallacy-answer" data-option-index="${index}">
                  <strong><span class="hotkey">${index + 1}</span> Counter</strong>
                  <div>${option.label}</div>
                </button>
              `
            )
            .join('')}
        </div>
      `;
    }

    if (challenge.mechanic === 'synthesis') {
      const selectedSources = session.synthesisSources;
      const commentarySelected = session.synthesisCommentary;
      return `
        ${promptHead}
        <div class="argument-block"><strong>Position:</strong> ${challenge.position}</div>
        <div class="muted">Step 1: choose up to two source cards. Step 2: pick the commentary that turns them into reasoning.</div>
        <div class="source-grid">
          ${challenge.sources
            .map(
              (source, index) => `
                <button class="source-card ${selectedSources.includes(source.id) ? 'selected' : ''}" data-action="toggle-source" data-source-id="${source.id}" ${
                  !selectedSources.includes(source.id) && selectedSources.length >= 2 ? 'disabled' : ''
                }>
                  <strong><span class="hotkey">${index + 1}</span> ${source.id}: ${source.label}</strong>
                  <div>${source.snippet}</div>
                </button>
              `
            )
            .join('')}
        </div>
        <div class="option-grid">
          ${challenge.commentaryOptions
            .map(
              (option, index) => `
                <button class="choice-card ${commentarySelected === index ? 'selected' : ''}" data-action="pick-commentary" data-option-index="${index}">
                  <strong><span class="hotkey">${index + 1 + challenge.sources.length}</span> Commentary</strong>
                  <div>${option.label}</div>
                </button>
              `
            )
            .join('')}
        </div>
        <div class="quick-actions">
          <button class="btn primary" data-action="synthesis-submit" ${
            selectedSources.length >= 1 && commentarySelected !== null ? '' : 'disabled'
          }>Lock Synthesis</button>
        </div>
      `;
    }

    return `<div class="empty-state">Unknown mechanic. The arena judges us both.</div>`;
  }

  function renderFeedback(feedback) {
    return `
      <div class="feedback-banner ${feedback.quality}">
        <strong>${feedback.headline}</strong>
        <div>${feedback.text}</div>
        ${feedback.bonus ? `<div class="small">${feedback.bonus}</div>` : ''}
      </div>
    `;
  }

  function renderSummaryScreen() {
    const summary = state.session.summary;
    const unlockLines = summary.unlocks.length
      ? summary.unlocks.map((unlock) => `<span class="pill">${unlock}</span>`).join('')
      : '<span class="muted small">No new unlocks this run. The next one is close.</span>';
    return `
      <div class="summary-screen">
        <div class="prompt-head">
          <div>
            <div class="eyebrow">${state.session.modeLabel}</div>
            <div class="round-title">Round Clear</div>
          </div>
          <div class="medal-row">
            <div class="medal ${summary.medal.toLowerCase()}">${summary.medal}</div>
          </div>
        </div>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="muted small">Score</div>
            <div class="big">${formatNumber(summary.score)}</div>
          </div>
          <div class="summary-card">
            <div class="muted small">Grade</div>
            <div class="big">${summary.grade}</div>
          </div>
          <div class="summary-card">
            <div class="muted small">XP Earned</div>
            <div class="big">${summary.xp}</div>
          </div>
          <div class="summary-card">
            <div class="muted small">Strong Reads</div>
            <div class="big">${summary.strong}</div>
          </div>
          <div class="summary-card">
            <div class="muted small">Combo Peak</div>
            <div class="big">${summary.maxCombo}</div>
          </div>
          <div class="summary-card">
            <div class="muted small">Accuracy</div>
            <div class="big">${summary.accuracy}%</div>
          </div>
        </div>
        <div class="panel">
          <strong>Performance Readout</strong>
          <div class="muted">${summary.comment}</div>
          <div class="pill-row">${unlockLines}</div>
        </div>
        <div class="panel">
          <strong>Skill Categories Practiced</strong>
          <div class="pill-row">${summary.skills.map((skill) => `<span class="pill">${skill}</span>`).join('')}</div>
        </div>
        <div class="quick-actions">
          <button class="btn primary" data-action="retry-session">Run It Again</button>
          ${renderSummaryContinueButton()}
          <button class="btn ghost" data-action="return-home">Back To Menu</button>
        </div>
      </div>
    `;
  }

  function renderSummaryContinueButton() {
    const session = state.session;
    if (session.mode === 'campaign' && session.nextAction) {
      if (session.nextAction.type === 'boss') {
        return `<button class="btn secondary" data-action="continue-summary">Fight Boss</button>`;
      }
      if (session.nextAction.type === 'round') {
        return `<button class="btn secondary" data-action="continue-summary">Next Round</button>`;
      }
    }
    return '';
  }

  function bindUI() {
    app.querySelectorAll('[data-action]').forEach((element) => {
      const eventName =
        element.tagName === 'SELECT' || (element.tagName === 'INPUT' && element.type === 'range') ? 'change' : 'click';
      element.addEventListener(eventName, onAction);
    });
  }

  function onAction(event) {
    const target = event.currentTarget;
    const action = target.getAttribute('data-action');
    if (!action) {
      return;
    }

    if (action === 'switch-mode') {
      state.currentMode = target.dataset.mode;
      state.session = null;
      clearTimer();
      state.shouldFocus = true;
      render();
      return;
    }

    if (action === 'continue-campaign') {
      const nextTarget = findNextCampaignTarget();
      if (nextTarget.type === 'round') {
        startCampaignRound(nextTarget.arenaId, nextTarget.roundId);
      } else {
        startCampaignBoss(nextTarget.arenaId);
      }
      return;
    }

    if (action === 'view-arena') {
      state.profile.selectedArenaId = target.dataset.arenaId;
      saveProfile();
      state.shouldFocus = true;
      render();
      return;
    }

    if (action === 'start-campaign-round') {
      startCampaignRound(target.dataset.arenaId, target.dataset.roundId);
      return;
    }

    if (action === 'start-campaign-boss') {
      startCampaignBoss(target.dataset.arenaId);
      return;
    }

    if (action === 'start-random-practice') {
      startRandomPractice();
      return;
    }

    if (action === 'practice-arena') {
      startPracticeArena(target.dataset.arenaId);
      return;
    }

    if (action === 'start-endless') {
      startEndless();
      return;
    }

    if (action === 'start-boss-rush') {
      startBossRush();
      return;
    }

    if (action === 'start-single-boss') {
      startSingleBoss(target.dataset.bossId);
      return;
    }

    if (action === 'toggle-sound') {
      state.profile.settings.soundMuted = !state.profile.settings.soundMuted;
      saveProfile();
      render();
      return;
    }

    if (action === 'volume-change') {
      state.profile.settings.volume = Number(target.value);
      saveProfile();
      render();
      return;
    }

    if (action === 'toggle-timer') {
      state.profile.settings.timerEnabled = !state.profile.settings.timerEnabled;
      saveProfile();
      render();
      return;
    }

    if (action === 'toggle-motion') {
      state.profile.settings.reducedMotion = !state.profile.settings.reducedMotion;
      syncBodyFlags();
      saveProfile();
      render();
      return;
    }

    if (action === 'teacher-arena') {
      state.profile.teacherSettings.arenaId = target.value;
      saveProfile();
      render();
      return;
    }

    if (action === 'teacher-difficulty') {
      state.profile.teacherSettings.difficulty = target.value;
      saveProfile();
      render();
      return;
    }

    if (action === 'teacher-toggle-timer') {
      state.profile.teacherSettings.timerEnabled = !state.profile.teacherSettings.timerEnabled;
      saveProfile();
      render();
      return;
    }

    if (action === 'teacher-toggle-presentation') {
      state.profile.teacherSettings.presentationMode = !state.profile.teacherSettings.presentationMode;
      syncBodyFlags();
      saveProfile();
      render();
      return;
    }

    if (action === 'launch-teacher-round') {
      launchTeacherRound();
      return;
    }

    if (action === 'launch-teacher-boss') {
      launchTeacherBoss();
      return;
    }

    if (action === 'retry-session') {
      retrySession();
      return;
    }

    if (action === 'continue-summary') {
      continueFromSummary();
      return;
    }

    if (action === 'return-home') {
      clearTimer();
      state.session = null;
      state.shouldFocus = true;
      render();
      return;
    }

    if (!state.session || state.session.phase === 'feedback' || state.session.phase === 'summary') {
      return;
    }

    if (action === 'snap-answer' || action === 'evidence-answer' || action === 'style-answer' || action === 'fallacy-answer') {
      evaluateChoice(Number(target.dataset.optionIndex));
      return;
    }

    if (action === 'claim-answer') {
      evaluateClaim(target.dataset.category);
      return;
    }

    if (action === 'logic-pick') {
      pickLogicStep(Number(target.dataset.stepIndex));
      return;
    }

    if (action === 'logic-reset') {
      state.session.logicSelection = [];
      render();
      return;
    }

    if (action === 'logic-submit') {
      submitLogic();
      return;
    }

    if (action === 'toggle-source') {
      toggleSynthesisSource(target.dataset.sourceId);
      return;
    }

    if (action === 'pick-commentary') {
      state.session.synthesisCommentary = Number(target.dataset.optionIndex);
      render();
      return;
    }

    if (action === 'synthesis-submit') {
      submitSynthesis();
    }
  }

  function startCampaignRound(arenaId, roundId) {
    const arena = arenaById[arenaId];
    const round = arena.rounds.find((entry) => entry.id === roundId);
    const items = round.items.map((id) => prepareChallenge(allItems[id]));
    startSession({
      mode: 'campaign',
      kind: 'round',
      modeLabel: `Campaign Mode | ${arena.name}`,
      title: round.title,
      coachLine: round.coach,
      arenaId: arena.id,
      roundId: round.id,
      items: items,
      timeLimit: getAdjustedTimer(round.timer, false),
      timerActive: state.profile.settings.timerEnabled,
      nextAction: getCampaignNextAction(arena, round),
      perItemTimer: false
    });
  }

  function startCampaignBoss(arenaId) {
    const arena = arenaById[arenaId];
    const boss = bossById[arena.bossId];
    startBossSession({
      mode: 'campaign',
      kind: 'boss',
      modeLabel: `Campaign Boss | ${arena.name}`,
      title: boss.name,
      coachLine: boss.intro,
      arenaId: arena.id,
      bossId: boss.id,
      timeLimit: getAdjustedTimer(boss.timer, true),
      timerActive: state.profile.settings.timerEnabled,
      items: boss.stages.map((stage) => prepareChallenge(allItems[stage.itemId], stage.label)),
      nextAction: getCampaignPostBossAction(arena),
      perItemTimer: false
    });
  }

  function startPracticeArena(arenaId) {
    const arena = arenaById[arenaId];
    const round = arena.rounds[0];
    const sampleRounds = arena.rounds.slice(0, 2);
    const items = sampleRounds.flatMap((entry) => entry.items.slice(0, Math.min(2, entry.items.length))).map((id) => prepareChallenge(allItems[id]));
    startSession({
      mode: 'practice',
      kind: 'practice',
      modeLabel: `Practice Mode | ${arena.name}`,
      title: `${arena.name} Remix`,
      coachLine: `Practice set from ${arena.name}. Focus on control, then speed.`,
      arenaId: arena.id,
      roundId: round.id,
      items: items,
      timeLimit: getAdjustedTimer(70, false),
      timerActive: state.profile.settings.timerEnabled,
      perItemTimer: false
    });
  }

  function startRandomPractice() {
    const unlocked = data.arenas.slice(0, state.profile.unlockedArenaCount);
    const candidateRounds = shuffle(unlocked.flatMap((arena) => arena.rounds)).slice(0, 3);
    const items = candidateRounds.flatMap((round) => shuffle(round.items).slice(0, 2)).map((id) => prepareChallenge(allItems[id]));
    startSession({
      mode: 'practice',
      kind: 'practice',
      modeLabel: 'Practice Mode | Mixed',
      title: 'Quick Remix',
      coachLine: 'Mixed skills, short set, zero ceremony.',
      items: items,
      timeLimit: getAdjustedTimer(78, false),
      timerActive: state.profile.settings.timerEnabled,
      perItemTimer: false
    });
  }

  function startEndless() {
    startSession({
      mode: 'endless',
      kind: 'endless',
      modeLabel: 'Endless Mode',
      title: 'Streak Reactor',
      coachLine: 'Three flawed answers and the run is over. Otherwise, keep feeding the machine.',
      items: buildEndlessBatch(6),
      timeLimit: 18,
      timerActive: state.profile.settings.timerEnabled,
      lives: 3,
      perItemTimer: true
    });
  }

  function startBossRush() {
    const unlockedBosses = data.bosses.filter((boss, index) => index < state.profile.unlockedArenaCount);
    const items = unlockedBosses.flatMap((boss) =>
      boss.stages.map((stage) => prepareChallenge(allItems[stage.itemId], `${boss.name} | ${stage.label}`))
    );
    startSession({
      mode: 'bossRush',
      kind: 'bossRush',
      modeLabel: 'Boss Rush',
      title: 'Boss Ladder',
      coachLine: 'Every boss, no filler, one long climb. Pace yourself and keep the line of reasoning intact.',
      items: items,
      timeLimit: Math.max(120, items.length * 14),
      timerActive: state.profile.settings.timerEnabled,
      perItemTimer: false
    });
  }

  function startSingleBoss(bossId) {
    const boss = bossById[bossId];
    const arena = arenaById[boss.arenaId];
    startBossSession({
      mode: 'bossRush',
      kind: 'boss',
      modeLabel: `Boss Rush | ${arena.name}`,
      title: boss.name,
      coachLine: boss.intro,
      arenaId: arena.id,
      bossId: boss.id,
      timeLimit: getAdjustedTimer(boss.timer, true),
      timerActive: state.profile.settings.timerEnabled,
      items: boss.stages.map((stage) => prepareChallenge(allItems[stage.itemId], stage.label)),
      perItemTimer: false
    });
  }

  function launchTeacherRound() {
    const arena = arenaById[state.profile.teacherSettings.arenaId];
    const round = arena.rounds[0];
    const items = round.items.map((id) => prepareChallenge(allItems[id]));
    startSession({
      mode: 'teacher',
      kind: 'teacher',
      modeLabel: `Teacher Mode | ${arena.name}`,
      title: `${arena.name} Classroom Challenge`,
      coachLine: `Projected challenge: ${capitalize(state.profile.teacherSettings.difficulty)} difficulty.`,
      arenaId: arena.id,
      roundId: round.id,
      items: items,
      timeLimit: getTeacherTimer(round.timer),
      timerActive: state.profile.teacherSettings.timerEnabled,
      perItemTimer: false
    });
  }

  function launchTeacherBoss() {
    const arena = arenaById[state.profile.teacherSettings.arenaId];
    const boss = bossById[arena.bossId];
    startBossSession({
      mode: 'teacher',
      kind: 'teacherBoss',
      modeLabel: `Teacher Boss | ${arena.name}`,
      title: boss.name,
      coachLine: boss.intro,
      arenaId: arena.id,
      bossId: boss.id,
      timeLimit: getTeacherTimer(boss.timer),
      timerActive: state.profile.teacherSettings.timerEnabled,
      items: boss.stages.map((stage) => prepareChallenge(allItems[stage.itemId], stage.label)),
      perItemTimer: false
    });
  }

  function prepareChallenge(item, labelOverride) {
    const prepared = JSON.parse(JSON.stringify(item));
    prepared.mechanic = item.mechanic;
    if (labelOverride) {
      prepared.stageLabel = labelOverride;
    }
    if (prepared.mechanic === 'logic') {
      prepared.shuffledSteps = shuffle(
        prepared.steps.map((stepText, index) => ({
          originalIndex: index,
          text: stepText
        }))
      );
    }
    return prepared;
  }

  function startSession(config) {
    clearTimer();
    const timeLimit = config.timeLimit;
    state.session = {
      mode: config.mode,
      kind: config.kind,
      modeLabel: config.modeLabel,
      title: config.title,
      coachLine: config.coachLine,
      arenaId: config.arenaId || null,
      roundId: config.roundId || null,
      bossId: config.bossId || null,
      items: config.items,
      index: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      multiplier: 1,
      strong: 0,
      weak: 0,
      flawed: 0,
      timerActive: config.timerActive,
      timeLimit: timeLimit,
      timeRemaining: timeLimit,
      perItemTimer: !!config.perItemTimer,
      feedback: null,
      phase: 'play',
      responses: [],
      nextAction: config.nextAction || null,
      lives: config.lives || null,
      rushQueue: config.rushQueue || null,
      logicSelection: [],
      synthesisSources: [],
      synthesisCommentary: null,
      launchConfig: config
    };
    state.shouldFocus = true;
    playSound('bossIntro', String(config.kind).toLowerCase().includes('boss'));
    render();
    if (config.timerActive) {
      startTimer();
    }
  }

  function startBossSession(config) {
    startSession(config);
  }

  function startTimer() {
    clearTimer();
    state.timerPulse = false;
    state.timerId = window.setInterval(() => {
      if (!state.session || state.session.phase !== 'play') {
        clearTimer();
        return;
      }
      state.session.timeRemaining = Math.max(0, state.session.timeRemaining - 0.2);
      if (state.session.timeRemaining <= 10 && !state.timerPulse) {
        playSound('pressure', true);
        state.timerPulse = true;
      }
      if (state.session.timeRemaining <= 0) {
        handleTimeout();
        return;
      }
      render();
    }, 200);
  }

  function clearTimer() {
    if (state.timerId) {
      window.clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function handleTimeout() {
    if (!state.session) {
      return;
    }
    if (!state.session.perItemTimer) {
      finishSession('timeout');
      return;
    }
    const feedback = {
      quality: 'flawed',
      headline: 'Timer Burn',
      text: 'Speed matters, but clarity matters more. The arena took the point back.',
      bonus: 'No score for this decision. Combo reset.'
    };
    finalizeResponse({ quality: 'flawed', score: 0, feedback: feedback, response: 'Timed out' });
  }

  function evaluateChoice(optionIndex) {
    const challenge = state.session.items[state.session.index];
    const option = challenge.options[optionIndex];
    const quality = option.quality;
    const score = scoreFromQuality(quality, challenge.mechanic);
    const feedback = buildFeedbackFromOption(quality, option.feedback, score);
    finalizeResponse({ quality: quality, score: score, feedback: feedback, response: option.label });
  }

  function evaluateClaim(category) {
    const challenge = state.session.items[state.session.index];
    let quality = 'flawed';
    if (category === challenge.answer) {
      quality = 'strong';
    } else if (
      (challenge.answer === 'Defensible Claim' && category === 'Weak Claim') ||
      (challenge.answer === 'Weak Claim' && category === 'Defensible Claim') ||
      (challenge.answer === 'Evidence' && category === 'Commentary') ||
      (challenge.answer === 'Commentary' && category === 'Evidence')
    ) {
      quality = 'weak';
    }

    const feedbackText =
      quality === 'strong'
        ? `${challenge.explanation}`
        : quality === 'weak'
          ? `Close, but this belongs under ${challenge.answer}. ${categoryHints[challenge.answer]}`
          : `Not this lane. ${challenge.answer} fits because ${challenge.explanation.toLowerCase()}`;

    finalizeResponse({
      quality: quality,
      score: scoreFromQuality(quality, challenge.mechanic),
      feedback: buildFeedbackFromOption(quality, feedbackText, scoreFromQuality(quality, challenge.mechanic)),
      response: category
    });
  }

  function pickLogicStep(stepIndex) {
    if (state.session.logicSelection.includes(stepIndex)) {
      return;
    }
    state.session.logicSelection.push(stepIndex);
    render();
  }

  function submitLogic() {
    const challenge = state.session.items[state.session.index];
    const selected = state.session.logicSelection.map((index) => challenge.shuffledSteps[index].originalIndex);
    let matches = 0;
    selected.forEach((value, index) => {
      if (value === index) {
        matches += 1;
      }
    });
    const quality = matches === 4 ? 'strong' : matches >= 2 ? 'weak' : 'flawed';
    const message =
      quality === 'strong'
        ? 'That line of reasoning builds cleanly from problem to proof to counterargument to finish.'
        : quality === 'weak'
          ? 'Part of the sequence works, but the organization still blurs the line of reasoning.'
          : 'The points exist, but the order weakens how the reasoning lands on a reader.';
    finalizeResponse({
      quality: quality,
      score: scoreFromQuality(quality, challenge.mechanic),
      feedback: buildFeedbackFromOption(quality, message, scoreFromQuality(quality, challenge.mechanic)),
      response: selected.join(',')
    });
  }

  function toggleSynthesisSource(sourceId) {
    const selected = state.session.synthesisSources;
    if (selected.includes(sourceId)) {
      state.session.synthesisSources = selected.filter((item) => item !== sourceId);
    } else if (selected.length < 2) {
      state.session.synthesisSources = selected.concat(sourceId);
    }
    render();
  }

  function submitSynthesis() {
    const challenge = state.session.items[state.session.index];
    const selectedSources = state.session.synthesisSources;
    const sourceFit = selectedSources.reduce((total, sourceId) => {
      const source = challenge.sources.find((entry) => entry.id === sourceId);
      return total + (source ? source.fit : 0);
    }, 0);
    const commentary = challenge.commentaryOptions[state.session.synthesisCommentary];
    let quality = 'flawed';
    if (sourceFit >= 4 && commentary.quality === 'strong') {
      quality = 'strong';
    } else if (sourceFit >= 2 && commentary.quality !== 'flawed') {
      quality = 'weak';
    }
    const response = `${selectedSources.join('+')} | ${commentary.label}`;
    finalizeResponse({
      quality: quality,
      score: scoreFromQuality(quality, challenge.mechanic),
      feedback: buildFeedbackFromOption(quality, commentary.feedback, scoreFromQuality(quality, challenge.mechanic)),
      response: response
    });
  }

  function buildFeedbackFromOption(quality, text, score) {
    const labelMap = {
      strong: 'Strong Read',
      weak: 'Usable, Not Optimal',
      flawed: 'Flawed Move'
    };
    return {
      quality: quality,
      headline: labelMap[quality],
      text: text,
      bonus: score > 0 ? `+${score} score before combo and time bonuses.` : 'Combo reset. The arena remains brutally honest.'
    };
  }

  function finalizeResponse(result) {
    const session = state.session;
    if (!session || session.phase !== 'play') {
      return;
    }

    clearTimer();
    const timeBonus = session.timerActive ? Math.round(session.timeRemaining * 3) : 18;
    let comboBonus = 0;
    if (result.quality === 'strong') {
      session.combo += 1;
      session.strong += 1;
      comboBonus = session.combo * 12;
    } else if (result.quality === 'weak') {
      session.combo += 1;
      session.weak += 1;
      comboBonus = session.combo * 6;
    } else {
      session.flawed += 1;
      session.combo = 0;
      if (session.lives !== null) {
        session.lives -= 1;
      }
    }
    session.maxCombo = Math.max(session.maxCombo, session.combo);
    session.multiplier = 1 + Math.min(session.combo, 8) * 0.1;
    const totalAward = Math.max(0, Math.round((result.score + timeBonus + comboBonus) * session.multiplier));
    session.score += totalAward;
    session.responses.push({
      itemId: session.items[session.index].id,
      quality: result.quality,
      response: result.response,
      points: totalAward
    });
    session.feedback = {
      quality: result.feedback.quality,
      headline: result.feedback.headline,
      text: result.feedback.text,
      bonus:
        result.quality === 'flawed'
          ? result.feedback.bonus
          : `${result.feedback.bonus} Time bonus ${timeBonus}. Combo bonus ${comboBonus}.`
    };
    session.phase = 'feedback';
    playSound(result.quality, true);
    announce(`${result.feedback.headline}. ${result.feedback.text}`);
    render();

    const delay = state.profile.settings.reducedMotion ? 220 : 760;
    window.setTimeout(() => {
      if (!state.session || state.session.phase !== 'feedback') {
        return;
      }
      if (session.lives !== null && session.lives <= 0) {
        finishSession('out-of-lives');
        return;
      }
      advanceSession();
    }, delay);
  }

  function advanceSession() {
    const session = state.session;
    if (!session) {
      return;
    }
    session.index += 1;
    session.feedback = null;
    session.phase = 'play';
    session.logicSelection = [];
    session.synthesisSources = [];
    session.synthesisCommentary = null;
    if (session.index >= session.items.length) {
      if (session.mode === 'endless') {
        session.items = session.items.concat(buildEndlessBatch(4));
      } else {
        finishSession('completed');
        return;
      }
    }
    if (session.perItemTimer) {
      session.timeRemaining = session.timeLimit;
    }
    render();
    if (session.timerActive) {
      startTimer();
    }
  }

  function finishSession(reason) {
    clearTimer();
    const session = state.session;
    const attempts = session.strong + session.weak + session.flawed;
    const accuracy = attempts ? Math.round(((session.strong + session.weak * 0.55) / attempts) * 100) : 0;
    const medal = getMedal(accuracy, session.flawed === 0, session.strong === attempts);
    const grade = getGrade(accuracy);
    const xp = Math.round(session.strong * 18 + session.weak * 10 + session.maxCombo * 4 + (medal === 'Perfect' ? 30 : medal === 'Gold' ? 18 : medal === 'Silver' ? 10 : 4));
    const skills = Array.from(
      new Set(session.items.map((item) => item.skill || data.mechanics[item.mechanic].skill))
    );
    const comment = buildSummaryComment(accuracy, medal, reason);
    const unlocks = applySessionRewards(session, medal, xp);
    session.summary = {
      score: session.score,
      medal: medal,
      grade: grade,
      xp: xp,
      strong: session.strong,
      maxCombo: session.maxCombo,
      accuracy: accuracy,
      skills: skills,
      comment: comment,
      unlocks: unlocks
    };
    session.phase = 'summary';
    playSound(medal === 'Perfect' || medal === 'Gold' ? 'levelClear' : 'weak', true);
    render();
  }

  function applySessionRewards(session, medal, xp) {
    const unlocks = [];
    const previousLevel = state.profile.level;
    state.profile.xp += xp;
    state.profile.totalScore += session.score;
    state.profile.sessionsPlayed += 1;
    syncProgressDerived();
    if (state.profile.level > previousLevel) {
      unlocks.push(`Rank up: ${state.profile.currentTitle}`);
      playSound('rankUp', true);
      showToast(pickLine(data.announcerLines.rankUp));
    }

    if (session.roundId) {
      const currentBest = state.profile.roundBest[session.roundId];
      if (!currentBest || session.score > currentBest.score) {
        state.profile.roundBest[session.roundId] = { score: session.score, medal: medal };
        unlocks.push(`New best for ${session.title}`);
      }
    }

    if (session.bossId) {
      const currentBossBest = state.profile.bossBest[session.bossId];
      if (!currentBossBest || session.score > currentBossBest.score) {
        state.profile.bossBest[session.bossId] = { score: session.score, medal: medal };
        unlocks.push(`Boss record set: ${session.title}`);
      }
    }

    if (session.mode === 'campaign') {
      if (session.kind === 'round') {
        unlocks.push(`Campaign progress saved in ${arenaById[session.arenaId].name}`);
      }
      if (session.kind === 'boss') {
        state.profile.arenaCompletions[session.arenaId] = medal;
        const arenaIndex = data.arenas.findIndex((arena) => arena.id === session.arenaId);
        if (arenaIndex === state.profile.unlockedArenaCount - 1 && state.profile.unlockedArenaCount < data.arenas.length) {
          state.profile.unlockedArenaCount += 1;
          unlocks.push(`Unlocked ${data.arenas[state.profile.unlockedArenaCount - 1].name}`);
        }
      }
    }

    if (session.mode === 'endless') {
      if (session.score > state.profile.endlessBest) {
        state.profile.endlessBest = session.score;
        unlocks.push('New Endless high score');
      }
    }

    if (session.mode === 'bossRush') {
      if (session.score > state.profile.bossRushBest) {
        state.profile.bossRushBest = session.score;
        unlocks.push('New Boss Rush high score');
      }
    }

    if (session.maxCombo >= 5 && !state.profile.badges.includes('Combo Pilot')) {
      state.profile.badges.push('Combo Pilot');
      unlocks.push('Badge unlocked: Combo Pilot');
    }
    if (session.strong >= 4 && !state.profile.badges.includes('Sharp Reader')) {
      state.profile.badges.push('Sharp Reader');
      unlocks.push('Badge unlocked: Sharp Reader');
    }
    if (medal === 'Perfect' && !state.profile.badges.includes('Perfect Page')) {
      state.profile.badges.push('Perfect Page');
      unlocks.push('Badge unlocked: Perfect Page');
    }
    if (session.kind.includes('boss') && !state.profile.badges.includes('Boss Breaker')) {
      state.profile.badges.push('Boss Breaker');
      unlocks.push('Badge unlocked: Boss Breaker');
    }

    saveProfile();
    return unlocks;
  }

  function retrySession() {
    if (!state.session) {
      return;
    }
    const config = state.session.launchConfig;
    if (!config) {
      state.session = null;
      render();
      return;
    }
    startSession({
      mode: config.mode,
      kind: config.kind,
      modeLabel: config.modeLabel,
      title: config.title,
      coachLine: config.coachLine,
      arenaId: config.arenaId,
      roundId: config.roundId,
      bossId: config.bossId,
      items: config.items.map((item) => prepareChallenge(allItems[item.id], item.stageLabel)),
      timeLimit: config.timeLimit,
      timerActive: config.timerActive,
      nextAction: config.nextAction,
      lives: config.lives || null,
      rushQueue: config.rushQueue || null,
      perItemTimer: config.perItemTimer
    });
  }

  function continueFromSummary() {
    const nextAction = state.session.nextAction;
    if (!nextAction) {
      state.session = null;
      state.shouldFocus = true;
      render();
      return;
    }
    if (nextAction.type === 'round') {
      startCampaignRound(nextAction.arenaId, nextAction.roundId);
      return;
    }
    if (nextAction.type === 'boss') {
      startCampaignBoss(nextAction.arenaId);
      return;
    }
    state.session = null;
    state.shouldFocus = true;
    render();
  }

  function getCampaignNextAction(arena, round) {
    const roundIndex = arena.rounds.findIndex((entry) => entry.id === round.id);
    const nextRound = arena.rounds[roundIndex + 1];
    if (nextRound) {
      return { type: 'round', arenaId: arena.id, roundId: nextRound.id };
    }
    return { type: 'boss', arenaId: arena.id };
  }

  function getCampaignPostBossAction(arena) {
    const arenaIndex = data.arenas.findIndex((entry) => entry.id === arena.id);
    const nextArena = data.arenas[arenaIndex + 1];
    if (nextArena) {
      return { type: 'round', arenaId: nextArena.id, roundId: nextArena.rounds[0].id };
    }
    return null;
  }

  function findNextCampaignTarget() {
    const availableArenas = data.arenas.slice(0, state.profile.unlockedArenaCount);
    for (const arena of availableArenas) {
      const nextRound = arena.rounds.find((round) => !state.profile.roundBest[round.id]);
      if (nextRound) {
        return { type: 'round', arenaId: arena.id, roundId: nextRound.id };
      }
      if (!state.profile.bossBest[arena.bossId]) {
        return { type: 'boss', arenaId: arena.id };
      }
    }
    const finalArena = availableArenas[availableArenas.length - 1] || data.arenas[0];
    return { type: 'round', arenaId: finalArena.id, roundId: finalArena.rounds[0].id };
  }

  function getArenaProgress(arena) {
    const clearedRounds = arena.rounds.filter((round) => !!state.profile.roundBest[round.id]).length;
    const bossCleared = !!state.profile.bossBest[arena.bossId];
    const cleared = clearedRounds + (bossCleared ? 1 : 0);
    const medalCandidates = [];
    arena.rounds.forEach((round) => {
      if (state.profile.roundBest[round.id]) {
        medalCandidates.push(state.profile.roundBest[round.id].medal);
      }
    });
    if (state.profile.bossBest[arena.bossId]) {
      medalCandidates.push(state.profile.bossBest[arena.bossId].medal);
    }
    return {
      cleared: cleared,
      pct: (cleared / (arena.rounds.length + 1)) * 100,
      bestMedal: highestMedal(medalCandidates)
    };
  }

  function highestMedal(medals) {
    const order = ['Bronze', 'Silver', 'Gold', 'Perfect'];
    let bestIndex = -1;
    medals.forEach((medal) => {
      const index = order.indexOf(medal);
      if (index > bestIndex) {
        bestIndex = index;
      }
    });
    return bestIndex >= 0 ? order[bestIndex] : null;
  }

  function getUnlockedMechanics() {
    const arenas = data.arenas.slice(0, state.profile.unlockedArenaCount);
    return Array.from(new Set(arenas.flatMap((arena) => arena.rounds.map((round) => round.mechanic))));
  }

  function buildEndlessBatch(count) {
    const unlockedMechanics = getUnlockedMechanics();
    const mechanicPool = unlockedMechanics.length ? unlockedMechanics : ['snap'];
    const items = [];
    for (let index = 0; index < count; index += 1) {
      const mechanic = randomFrom(mechanicPool);
      items.push(prepareChallenge(randomFrom(data.content[mechanic])));
    }
    return items;
  }

  function getAdjustedTimer(base, isBoss) {
    if (!state.profile.settings.timerEnabled) {
      return base;
    }
    return isBoss ? base : base;
  }

  function getTeacherTimer(base) {
    const difficulty = state.profile.teacherSettings.difficulty;
    if (difficulty === 'relaxed') {
      return Math.round(base * 1.3);
    }
    if (difficulty === 'savage') {
      return Math.round(base * 0.78);
    }
    return base;
  }

  function collectArenaSkills(arena) {
    const skillSet = new Set();
    arena.rounds.forEach((round) => {
      round.items.forEach((itemId) => {
        const item = allItems[itemId];
        if (item) {
          skillSet.add(item.skill || data.mechanics[item.mechanic].skill);
        }
      });
    });
    bossById[arena.bossId].stages.forEach((stage) => {
      const item = allItems[stage.itemId];
      if (item) {
        skillSet.add(item.skill || data.mechanics[item.mechanic].skill);
      }
    });
    return Array.from(skillSet);
  }

  function findBestBadge() {
    return state.profile.badges[state.profile.badges.length - 1] || 'Not yet';
  }

  function getMedal(accuracy, flawFree, allStrong) {
    if (allStrong) {
      return 'Perfect';
    }
    if (accuracy >= 82) {
      return 'Gold';
    }
    if (accuracy >= 68) {
      return 'Silver';
    }
    return 'Bronze';
  }

  function getGrade(accuracy) {
    if (accuracy >= 95) return 'A+';
    if (accuracy >= 88) return 'A';
    if (accuracy >= 80) return 'B';
    if (accuracy >= 72) return 'C';
    return 'D';
  }

  function buildSummaryComment(accuracy, medal, reason) {
    if (reason === 'out-of-lives') {
      return 'The run cracked under pressure, but the feedback already told you where the logic leaked. Queue it again before the sting wears off.';
    }
    if (reason === 'timeout') {
      return 'The clock cut the round short. Your reads improved, but the arena still wants cleaner pace under pressure.';
    }
    if (medal === 'Perfect') {
      return 'That round was clean, fast, and annoyingly defensible. Exactly the kind of performance that makes replay tempting.';
    }
    if (accuracy >= 82) {
      return 'Strong round. A few sharper reads and this score starts flirting with Perfect territory.';
    }
    if (accuracy >= 68) {
      return 'Solid momentum. You are seeing the rhetorical moves, but the best options still separate themselves under pressure.';
    }
    return 'Useful round. The mistakes were loud enough to teach something, which is not glamorous but does work.';
  }

  function scoreFromQuality(quality, mechanic) {
    const heavier = mechanic === 'logic' || mechanic === 'synthesis';
    if (quality === 'strong') {
      return heavier ? 160 : 120;
    }
    if (quality === 'weak') {
      return heavier ? 90 : 70;
    }
    return 0;
  }

  function playSound(name, allowed) {
    if (!allowed || state.profile.settings.soundMuted) {
      return;
    }
    state.audio.play(name, state.profile.settings.volume);
  }

  function createAudioEngine() {
    let ctx = null;
    function ensure() {
      if (!ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
          return null;
        }
        ctx = new AudioContext();
      }
      return ctx;
    }

    function tone(freq, start, duration, gainValue, type) {
      const context = ensure();
      if (!context) {
        return;
      }
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type || 'triangle';
      oscillator.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.02);
    }

    function play(name, volume) {
      const context = ensure();
      if (!context) {
        return;
      }
      const start = context.currentTime + 0.01;
      const gainValue = Math.max(0.0001, volume * 0.04);
      if (context.state === 'suspended') {
        context.resume();
      }
      if (name === 'strong') {
        tone(660, start, 0.12, gainValue, 'square');
        tone(880, start + 0.08, 0.14, gainValue * 0.9, 'triangle');
      } else if (name === 'weak') {
        tone(420, start, 0.12, gainValue * 0.8, 'triangle');
      } else if (name === 'flawed') {
        tone(220, start, 0.18, gainValue, 'sawtooth');
      } else if (name === 'levelClear') {
        tone(520, start, 0.12, gainValue, 'triangle');
        tone(660, start + 0.08, 0.12, gainValue, 'triangle');
        tone(880, start + 0.16, 0.18, gainValue, 'triangle');
      } else if (name === 'rankUp') {
        tone(550, start, 0.12, gainValue, 'square');
        tone(740, start + 0.06, 0.12, gainValue, 'square');
        tone(990, start + 0.12, 0.18, gainValue * 1.1, 'triangle');
      } else if (name === 'pressure') {
        tone(300, start, 0.08, gainValue * 0.8, 'square');
        tone(300, start + 0.18, 0.08, gainValue * 0.8, 'square');
      } else if (name === 'bossIntro') {
        tone(180, start, 0.22, gainValue, 'sawtooth');
        tone(240, start + 0.14, 0.22, gainValue, 'sawtooth');
      }
    }

    return { play };
  }

  function handleGlobalKeydown(event) {
    if (!state.session || state.session.phase !== 'play') {
      return;
    }
    const challenge = state.session.items[state.session.index];
    if (event.key === 'Escape') {
      clearTimer();
      state.session = null;
      render();
      return;
    }

    if (challenge.mechanic === 'logic') {
      if (event.key >= '1' && event.key <= String(challenge.shuffledSteps.length)) {
        const index = Number(event.key) - 1;
        if (!state.session.logicSelection.includes(index)) {
          pickLogicStep(index);
        }
      }
      if (event.key === 'Enter' && state.session.logicSelection.length === challenge.shuffledSteps.length) {
        submitLogic();
      }
      if (event.key.toLowerCase() === 'r') {
        state.session.logicSelection = [];
        render();
      }
      return;
    }

    if (challenge.mechanic === 'synthesis') {
      const sourceCount = challenge.sources.length;
      if (event.key >= '1' && event.key <= String(sourceCount)) {
        toggleSynthesisSource(challenge.sources[Number(event.key) - 1].id);
        return;
      }
      const commentaryStart = sourceCount + 1;
      const commentaryEnd = sourceCount + challenge.commentaryOptions.length;
      const asNumber = Number(event.key);
      if (asNumber >= commentaryStart && asNumber <= commentaryEnd) {
        state.session.synthesisCommentary = asNumber - commentaryStart;
        render();
        return;
      }
      if (event.key === 'Enter' && state.session.synthesisCommentary !== null) {
        submitSynthesis();
      }
      return;
    }

    if (event.key >= '1' && event.key <= '4') {
      const index = Number(event.key) - 1;
      if (challenge.mechanic === 'claimChaos') {
        evaluateClaim(data.categories[index]);
      } else {
        evaluateChoice(index);
      }
    }
  }

  function focusFirstInteractive() {
    const first = app.querySelector('button:not([disabled]), select, input');
    if (first) {
      first.focus();
    }
  }

  function showToast(message) {
    state.toast = message;
    render();
    window.setTimeout(() => {
      state.toast = null;
      render();
    }, 2400);
  }

  function renderToast() {
    return `<div class="toast">${state.toast}</div>`;
  }

  function announce(message) {
    liveRegion.textContent = message;
  }

  function pickLine(lines) {
    return lines[Math.floor(Math.random() * lines.length)];
  }

  function randomFrom(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function formatNumber(value) {
    return new Intl.NumberFormat().format(Math.round(value));
  }

  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
})();
