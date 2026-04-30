(function () {
  const STORAGE_KEY = 'source-court-profile-v2';
  const app = document.getElementById('app');
  const liveRegion = document.getElementById('live-region');
  const data = window.SOURCE_COURT_DATA;

  const state = {
    view: 'home',
    modal: null,
    toast: null,
    loadingMessage: '',
    profile: loadProfile(),
    session: null,
    audio: createAudioEngine()
  };

  document.addEventListener('click', handleClick);
  document.addEventListener('change', handleChange);
  document.addEventListener('keydown', handleKeydown);

  syncBodyFlags();
  render();

  function loadProfile() {
    const base = {
      name: '',
      personaId: 'detective',
      topicDraft: '',
      apiKey: '',
      careerXp: 0,
      casesCompleted: 0,
      correctVerdicts: 0,
      incorrectVerdicts: 0,
      bestStreak: 0,
      unlockedDocketCount: 1,
      completedDockets: {},
      achievements: [],
      bestModeScores: {
        campaign: 0,
        survival: 0,
        custom: 0
      },
      settings: {
        soundOn: true,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      }
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return base;
      }
      return deepMerge(base, JSON.parse(raw));
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

  function syncBodyFlags() {
    document.body.classList.toggle('reduced-motion', !!state.profile.settings.reducedMotion);
  }

  function render() {
    syncBodyFlags();
    app.innerHTML = renderView();
    if (state.modal) {
      app.insertAdjacentHTML('beforeend', renderModal());
    }
    if (state.toast) {
      app.insertAdjacentHTML('beforeend', `<div class="toast">${state.toast}</div>`);
    }
  }

  function renderView() {
    if (state.view === 'court') {
      return renderCourt();
    }
    if (state.view === 'verdict') {
      return renderVerdict();
    }
    if (state.view === 'summary') {
      return renderSummary();
    }
    return renderHome();
  }

  function renderTopbar() {
    const rank = getCurrentRank();
    if (state.session) {
      const session = state.session;
      const caseCount = session.resolvedCases + 1;
      const totalCases = session.endless ? 'Endless' : session.cases.length;
      return `
        <div class="topbar">
          <div class="brand-lockup">
            <div class="eyebrow">${session.modeLabel}</div>
            <div class="brand-title">Source Court</div>
            <div class="muted small">${rank.title} | ${state.profile.name || 'Unnamed Judge'}</div>
          </div>
          <div class="tag-row">
            <span class="score-pill">Score ${formatNumber(session.score)}</span>
            <span class="score-pill">Streak ${session.streak}</span>
            <span class="score-pill">Strikes ${session.strikes}/3</span>
            <span class="score-pill">Case ${caseCount}/${totalCases}</span>
            <button class="button ghost" data-action="toggle-sound">${state.profile.settings.soundOn ? 'Sound On' : 'Sound Off'}</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="topbar">
        <div class="brand-lockup">
          <div class="eyebrow">AP Research Edition</div>
          <div class="brand-title">Source Court</div>
          <div class="muted small">Rule sources admissible or dismissed with a proper academic record.</div>
        </div>
        <div class="tag-row">
          <span class="career-pill">${rank.title}</span>
          <button class="button ghost" data-action="toggle-sound">${state.profile.settings.soundOn ? 'Sound On' : 'Sound Off'}</button>
          <button class="button ghost" data-action="toggle-motion">${state.profile.settings.reducedMotion ? 'Motion Low' : 'Motion Full'}</button>
          <button class="button ghost" data-action="open-bench-book">Bench Book</button>
        </div>
      </div>
    `;
  }

  function renderHome() {
    const rank = getCurrentRank();
    const progress = getRankProgress();
    const currentDocket = getNextCampaignDocket();
    const recentAchievements = state.profile.achievements.slice(-4);

    return `
      <div class="screen">
        ${renderTopbar()}
        <div class="hero-grid">
          <section class="hero-main">
            <div>
              <div class="eyebrow">Judicial Career</div>
              <h1 class="screen-title">Rule Better Sources</h1>
              <p class="muted">
                Review metadata, weigh authority, currency, rigor, and objectivity, and decide whether a source belongs in serious academic research.
              </p>
            </div>
            <div class="tag-row">
              <span class="tag">${currentDocket.chapter}</span>
              <span class="tag">${currentDocket.name}</span>
              <span class="tag">${currentDocket.promotion}</span>
            </div>
            <div class="button-row">
              <button class="button primary" data-action="start-campaign">Continue Campaign</button>
              <button class="button secondary" data-action="start-survival">Start Survival Docket</button>
            </div>
          </section>
          <aside class="hero-side">
            <div class="career-banner">
              <div class="eyebrow">Long-Term Progress</div>
              <div class="panel-title">${rank.title}</div>
              <div class="meter"><div class="meter-fill" style="width:${progress.percent}%"></div></div>
              <div class="muted small">${progress.current} / ${progress.needed} XP to ${progress.nextTitle}</div>
              <div class="career-stats">
                <div class="stat-card">
                  <div class="muted small">Cases Closed</div>
                  <strong>${state.profile.casesCompleted}</strong>
                </div>
                <div class="stat-card">
                  <div class="muted small">Best Streak</div>
                  <strong>${state.profile.bestStreak}</strong>
                </div>
                <div class="stat-card">
                  <div class="muted small">Dockets Open</div>
                  <strong>${state.profile.unlockedDocketCount}</strong>
                </div>
              </div>
            </div>
            <div class="badge-card">
              <div class="panel-title">Recent Achievements</div>
              <div class="tag-row">
                ${
                  recentAchievements.length
                    ? recentAchievements.map((badge) => `<span class="tag">${badge}</span>`).join('')
                    : '<span class="muted small">No badges yet. The record is still clean and boring.</span>'
                }
              </div>
            </div>
          </aside>
        </div>

        <div class="home-grid">
          <section class="panel">
            <div class="eyebrow">Take The Oath</div>
            <div class="panel-title">Judicial Identity</div>
            <div class="field-stack">
              <label>
                Judge Name
                <input id="judge-name" data-field="name" type="text" value="${escapeHtml(state.profile.name)}" placeholder="Judge surname or handle" />
              </label>
            </div>
            <div class="panel-title">Choose A Persona</div>
            <div class="muted small">Personas keep the same courtroom identity but make one review criterion more rewarding and add a once-per-run clue power.</div>
            <div class="persona-grid">
              ${data.personas.map(renderPersonaCard).join('')}
            </div>
          </section>

          <section class="panel">
            <div class="eyebrow">Mission Clarity</div>
            <div class="panel-title">How A Case Works</div>
            <div class="overview-grid">
              <div class="rule-note">
                <strong>1. Read the file.</strong>
                <div class="muted small">Check author, publication, date, type, and the excerpt before you rush the verdict.</div>
              </div>
              <div class="rule-note">
                <strong>2. Cross-examine the source.</strong>
                <div class="muted small">Optional notes on the four criteria earn score, reinforce learning, and make verdicts less reckless.</div>
              </div>
              <div class="rule-note">
                <strong>3. Rule it.</strong>
                <div class="muted small">Call the source admissible or dismissed. Wrong rulings cost strikes. Three strikes ends the run.</div>
              </div>
              <div class="rule-note">
                <strong>4. Learn and climb.</strong>
                <div class="muted small">Every case pays out run score and career XP, so short-term pressure feeds long-term rank growth.</div>
              </div>
            </div>
          </section>
        </div>

        <section class="panel">
          <div class="eyebrow">Modes</div>
          <div class="panel-title">Choose Your Docket</div>
          <div class="mode-grid">
            <div class="mode-card">
              <div>
                <h3>Guided Campaign</h3>
                <div class="muted small">Clear structured dockets, unlock promotions, and learn the four-factor test with rising difficulty.</div>
              </div>
              <div class="tag-row">
                <span class="tag">${currentDocket.name}</span>
                <span class="tag">${currentDocket.theme}</span>
              </div>
              <button class="button primary" data-action="start-campaign">Enter Campaign</button>
            </div>
            <div class="mode-card">
              <div>
                <h3>Appeals Survival</h3>
                <div class="muted small">Random cases from your unlocked dockets. Score climbs until three strikes end the bench.</div>
              </div>
              <div class="tag-row">
                <span class="tag">3 strikes</span>
                <span class="tag">Best score ${formatNumber(state.profile.bestModeScores.survival)}</span>
              </div>
              <button class="button secondary" data-action="start-survival">Start Survival</button>
            </div>
            <div class="mode-card">
              <div>
                <h3>Custom Topic Practice</h3>
                <div class="muted small">Use the AI Director if you have a Gemini API key. If not, the offline director fabricates local practice cases so the mode still works.</div>
              </div>
              <div class="field-stack">
                <label>
                  Topic
                  <input id="topic-draft" data-field="topicDraft" type="text" value="${escapeHtml(state.profile.topicDraft)}" placeholder="Social media, AI tutors, climate migration..." />
                </label>
                <label>
                  Gemini API Key (Optional)
                  <input id="api-key" data-field="apiKey" type="password" value="${escapeHtml(state.profile.apiKey)}" placeholder="Paste only if you want live AI dockets" />
                </label>
              </div>
              <button class="button secondary" data-action="start-custom">Start Custom Practice</button>
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="eyebrow">Campaign Ladder</div>
          <div class="panel-title">Judicial Promotions</div>
          <div class="summary-grid">
            ${data.dockets.map(renderDocketCard).join('')}
          </div>
        </section>

        <section class="panel">
          <div class="eyebrow">Bench Book</div>
          <div class="panel-title">The Four Criteria</div>
          <div class="criteria-grid">
            ${data.criteria.map(renderCriteriaPreview).join('')}
          </div>
        </section>
      </div>
    `;
  }

  function renderCourt() {
    const session = state.session;
    const source = getCurrentCase();
    const persona = getPersona(state.profile.personaId);
    const rankProgress = getRankProgress();
    const tutorial = shouldShowTutorial(source);

    return `
      <div class="screen">
        ${renderTopbar()}
        <div class="court-grid">
          <div class="sidebar-stack">
            <section class="case-card">
              <div class="eyebrow">${source.difficulty} difficulty | ${source.skillFocus}</div>
              <h1 class="section-title">${source.title}</h1>
              <div class="tag-row">
                <span class="tag">${source.type}</span>
                <span class="tag">${session.modeLabel}</span>
                <span class="tag">${source.skillFocus}</span>
              </div>
              <dl class="case-meta">
                <dt>Author</dt><dd>${source.author}</dd>
                <dt>Publication</dt><dd>${source.publication}</dd>
                <dt>Date</dt><dd>${source.date}</dd>
                <dt>Purpose</dt><dd>${buildPurposeRead(source)}</dd>
              </dl>
              <div class="excerpt">"${source.excerpt}"</div>
            </section>

            <section class="panel">
              <div class="panel-title">Cross-Examination Notes</div>
              <div class="muted small">Optional, but lucrative. Every correct note teaches the criterion, boosts score, and sharpens your verdict logic.</div>
              <div class="criteria-grid">
                ${data.criteria.map((criterion) => renderCriteriaJudgeCard(criterion, source, session)).join('')}
              </div>
            </section>

            <section class="panel">
              <div class="panel-title">Ruling</div>
              <div class="muted small">Rule the source itself, not just one isolated detail. A current source can still fail if its expertise or objectivity collapses.</div>
              <div class="ruling-grid">
                <button class="ruling-button admit" data-action="submit-verdict" data-verdict="admit">
                  <strong>Rule Admissible</strong>
                  <span>Credible enough for academic use</span>
                </button>
                <button class="ruling-button dismiss" data-action="submit-verdict" data-verdict="dismiss">
                  <strong>Rule Dismissed</strong>
                  <span>Weak, biased, outdated, or unvetted</span>
                </button>
              </div>
            </section>
          </div>

          <aside class="sidebar-stack">
            <section class="bench-brief">
              <div class="eyebrow">Mission</div>
              <div class="panel-title">${session.objectiveTitle}</div>
              <div class="muted small">${session.objectiveText}</div>
              ${
                tutorial
                  ? `
                    <div class="tutorial-callout">
                      <strong>First-case walkthrough</strong>
                      <div class="muted small">Start with metadata, answer at least two note cards, then decide whether the source belongs in academic research. The four criteria cards are your whole playbook.</div>
                    </div>
                  `
                  : ''
              }
              <div class="rule-note">
                <strong>Optional notes do three things:</strong>
                <div class="muted small">They teach the criteria, they pay out extra score, and they reveal whether your reasoning is actually consistent before the verdict lands.</div>
              </div>
            </section>

            <section class="power-card">
              <div class="eyebrow">Persona Power</div>
              <div class="panel-title">${persona.name}</div>
              <div class="muted small">${persona.perk}</div>
              <div class="rule-note">
                <strong>${persona.powerTitle}</strong>
                <div class="muted small">${persona.powerDesc}</div>
              </div>
              <button class="button ghost" data-action="use-power" ${session.powerUsed ? 'disabled' : ''}>
                ${session.powerUsed ? 'Power Already Used' : 'Use Bench Power'}
              </button>
            </section>

            <section class="career-banner">
              <div class="eyebrow">Career Track</div>
              <div class="panel-title">${getCurrentRank().title}</div>
              <div class="meter"><div class="meter-fill" style="width:${rankProgress.percent}%"></div></div>
              <div class="muted small">${rankProgress.current} / ${rankProgress.needed} XP to ${rankProgress.nextTitle}</div>
              <div class="score-grid run">
                <div class="score-box">
                  <div class="muted small">Run Score</div>
                  <strong>${formatNumber(session.score)}</strong>
                </div>
                <div class="score-box">
                  <div class="muted small">Streak</div>
                  <strong>${session.streak}</strong>
                </div>
                <div class="score-box">
                  <div class="muted small">Strikes</div>
                  <strong>${session.strikes}</strong>
                </div>
                <div class="score-box">
                  <div class="muted small">Career XP</div>
                  <strong>${state.profile.careerXp}</strong>
                </div>
              </div>
            </section>

            <section class="panel">
              <div class="panel-title">Scoring Brief</div>
              <div class="rule-note">
                <strong>Correct verdict</strong>
                <div class="muted small">Big reputation payout plus streak growth.</div>
              </div>
              <div class="rule-note">
                <strong>Correct note cards</strong>
                <div class="muted small">Score bonus, stronger feedback, and double points on your persona focus.</div>
              </div>
              <div class="rule-note">
                <strong>Wrong verdict</strong>
                <div class="muted small">You keep a little note credit, but you lose the ruling bonus and take a strike.</div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    `;
  }

  function renderVerdict() {
    const outcome = state.session.lastOutcome;
    const rankProgress = getRankProgress();
    return `
      <div class="screen">
        ${renderTopbar()}
        <div class="verdict-grid">
          <section class="sidebar-stack">
            <div class="verdict-hero panel">
              <div class="stamp ${outcome.correctVerdict ? 'good' : 'bad'}">${outcome.playerVerdict ? 'Admissible' : 'Dismissed'}</div>
              <div class="status-pill ${outcome.correctVerdict ? 'good' : 'bad'}">
                ${outcome.correctVerdict ? 'Judgment Upheld' : 'Objection Sustained'}
              </div>
              <div class="screen-title">${outcome.correctVerdict ? `+${formatNumber(outcome.scoreGain)} score` : `${outcome.strikeText}`}</div>
              <div class="muted">${outcome.verdictReason}</div>
            </div>

            <div class="score-breakdown">
              <div class="panel-title">Score Breakdown</div>
              <div class="breakdown-row"><span>Ruling bonus</span><strong>${formatNumber(outcome.rulingPoints)}</strong></div>
              <div class="breakdown-row"><span>Correct cross-exam notes</span><strong>${formatNumber(outcome.notePoints)}</strong></div>
              <div class="breakdown-row"><span>Full-note mastery bonus</span><strong>${formatNumber(outcome.masteryBonus)}</strong></div>
              <div class="breakdown-row"><span>Streak pressure bonus</span><strong>${formatNumber(outcome.streakBonus)}</strong></div>
              <div class="breakdown-row"><span>Multiplier</span><strong>x${outcome.multiplier.toFixed(2)}</strong></div>
              <div class="breakdown-row"><span>Career XP gained</span><strong>${formatNumber(outcome.xpGain)}</strong></div>
            </div>
          </section>

          <aside class="sidebar-stack">
            <section class="panel">
              <div class="panel-title">Chief Justice Debrief</div>
              <div class="muted">${outcome.debrief}</div>
              <div class="rule-note">
                <strong>Skill practiced</strong>
                <div class="muted small">${outcome.skillFocus}</div>
              </div>
              <div class="rule-note">
                <strong>Teaching point</strong>
                <div class="muted small">${outcome.teachingPoint}</div>
              </div>
            </section>

            <section class="panel">
              <div class="panel-title">Criterion Review</div>
              <div class="criterion-review">
                ${outcome.criterionRows.map(renderOutcomeCriterionRow).join('')}
              </div>
            </section>

            <section class="career-banner">
              <div class="eyebrow">Career Track</div>
              <div class="panel-title">${getCurrentRank().title}</div>
              <div class="meter"><div class="meter-fill" style="width:${rankProgress.percent}%"></div></div>
              <div class="muted small">${rankProgress.current} / ${rankProgress.needed} XP to ${rankProgress.nextTitle}</div>
              ${
                outcome.unlocks.length
                  ? `<div class="tag-row">${outcome.unlocks.map((unlock) => `<span class="tag">${unlock}</span>`).join('')}</div>`
                  : ''
              }
            </section>

            <div class="single-button-row">
              <button class="button secondary" data-action="ask-ai-debrief">${outcome.aiButtonLabel}</button>
              ${outcome.aiDebrief ? `<div class="rule-note"><strong>AI Director</strong><div class="muted small">${outcome.aiDebrief}</div></div>` : ''}
              <button class="button primary" data-action="next-case">Next Case</button>
            </div>
          </aside>
        </div>
      </div>
    `;
  }

  function renderSummary() {
    const summary = state.session.summary;
    return `
      <div class="screen">
        ${renderTopbar()}
        <div class="hero-grid">
          <section class="hero-main">
            <div>
              <div class="eyebrow">${summary.modeLabel}</div>
              <h1 class="screen-title">${summary.title}</h1>
              <p class="muted">${summary.comment}</p>
            </div>
            <div class="tag-row">
              ${summary.unlocks.map((unlock) => `<span class="tag">${unlock}</span>`).join('') || '<span class="tag">No new unlocks this run</span>'}
            </div>
            <div class="button-row">
              ${summary.primaryAction}
              <button class="button ghost" data-action="retry-run">Retry Run</button>
            </div>
          </section>
          <aside class="hero-side">
            <div class="summary-grid">
              <div class="summary-card">
                <h3>Run Score</h3>
                <div class="screen-title">${formatNumber(summary.score)}</div>
              </div>
              <div class="summary-card">
                <h3>Career XP</h3>
                <div class="screen-title">${formatNumber(summary.xp)}</div>
              </div>
              <div class="summary-card">
                <h3>Best Streak</h3>
                <div class="screen-title">${summary.bestStreak}</div>
              </div>
            </div>
            <div class="badge-card">
              <div class="panel-title">Run Review</div>
              <div class="muted small">Correct verdicts ${summary.correctVerdicts} | Incorrect verdicts ${summary.incorrectVerdicts} | Cross-exam hits ${summary.correctNotes}</div>
            </div>
          </aside>
        </div>

        <section class="panel">
          <div class="eyebrow">Promotions And Achievements</div>
          <div class="panel-title">What Changed</div>
          <div class="criteria-grid">
            <div class="summary-card">
              <h3>Promotion Track</h3>
              <div class="muted small">${summary.promotionText}</div>
            </div>
            <div class="summary-card">
              <h3>Career Title</h3>
              <div class="muted small">${getCurrentRank().title}</div>
            </div>
            <div class="summary-card">
              <h3>Longest Streak</h3>
              <div class="muted small">${summary.bestStreak}</div>
            </div>
            <div class="summary-card">
              <h3>Judicial Record</h3>
              <div class="muted small">${formatNumber(state.profile.correctVerdicts)} correct | ${formatNumber(state.profile.incorrectVerdicts)} incorrect</div>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function renderPersonaCard(persona) {
    const active = state.profile.personaId === persona.id ? 'active' : '';
    return `
      <button class="persona-card ${active}" data-action="choose-persona" data-persona="${persona.id}">
        <h3>${persona.name}</h3>
        <div class="eyebrow">${getCriterion(persona.focus).label}</div>
        <div class="muted small">${persona.perk}</div>
        <div class="muted small">${persona.powerTitle}: ${persona.powerDesc}</div>
      </button>
    `;
  }

  function renderCriteriaPreview(criterion) {
    return `
      <div class="criteria-card">
        <div class="criteria-head">
          <div>
            <h3>${criterion.label}</h3>
            <div class="muted small">${criterion.description}</div>
          </div>
          <div class="criteria-short">${criterion.short}</div>
        </div>
        <div class="rule-note">
          <strong>Question to ask</strong>
          <div class="muted small">${criterion.question}</div>
        </div>
      </div>
    `;
  }

  function renderDocketCard(docket, index) {
    const unlocked = index < state.profile.unlockedDocketCount;
    const cleared = !!state.profile.completedDockets[docket.id];
    return `
      <div class="summary-card">
        <div class="eyebrow">${docket.chapter}</div>
        <h3>${docket.name}</h3>
        <div class="muted small">${docket.theme}</div>
        <div class="tag-row">
          <span class="tag">${docket.promotion}</span>
          <span class="tag">${cleared ? 'Cleared' : unlocked ? 'Unlocked' : 'Locked'}</span>
        </div>
        <button class="button ghost" data-action="start-docket" data-docket="${index}" ${unlocked ? '' : 'disabled'}>
          ${cleared ? 'Replay Docket' : 'Enter Docket'}
        </button>
      </div>
    `;
  }

  function renderCriteriaJudgeCard(criterion, source, session) {
    const playerValue = session.answers[criterion.id];
    const clueVisible = session.revealedCriterion === criterion.id;
    return `
      <div class="criteria-card">
        <div class="criteria-head">
          <div>
            <h3>${criterion.label}</h3>
            <div class="muted small">${criterion.description}</div>
          </div>
          <div class="criteria-short">${criterion.short}</div>
        </div>
        <div class="rule-note">
          <strong>Cross-exam question</strong>
          <div class="muted small">${criterion.question}</div>
        </div>
        <div class="note-row">
          <button class="note-button pass ${playerValue === true ? 'active' : ''}" data-action="answer-note" data-criterion="${criterion.id}" data-value="pass">Passes</button>
          <button class="note-button fail ${playerValue === false ? 'active' : ''}" data-action="answer-note" data-criterion="${criterion.id}" data-value="fail">Fails</button>
        </div>
        ${
          clueVisible
            ? `<div class="criteria-clue"><strong>Bench power clue</strong><div class="muted small">${source.clues[criterion.id]}</div></div>`
            : ''
        }
      </div>
    `;
  }

  function renderOutcomeCriterionRow(row) {
    return `
      <div class="criterion-review-row ${row.correct ? 'good' : 'bad'}">
        <strong>${row.label}</strong>
        <div class="muted small">You called it ${row.playerText}. Actual ruling: ${row.actualText}.</div>
        <div class="muted small">${row.clue}</div>
      </div>
    `;
  }

  function renderModal() {
    if (state.modal === 'benchBook') {
      return `
        <div class="modal">
          <div class="modal-card">
            <div class="eyebrow">Instructions</div>
            <div class="screen-title">The Bench Book</div>
            <div class="muted">The mission is simple: decide whether the source is strong enough for serious academic research. The four criteria cards are the whole loop.</div>
            <div class="criteria-grid">
              ${data.criteria.map(renderCriteriaPreview).join('')}
            </div>
            <div class="overview-grid">
              <div class="rule-note">
                <strong>Optional note cards</strong>
                <div class="muted small">They are optional for flow, but they teach the standard and pay bonus score.</div>
              </div>
              <div class="rule-note">
                <strong>Strikes</strong>
                <div class="muted small">Wrong verdicts add strikes. Three strikes end the run.</div>
              </div>
              <div class="rule-note">
                <strong>Streaks</strong>
                <div class="muted small">Consecutive correct verdicts scale the multiplier and make survival runs feel hot.</div>
              </div>
              <div class="rule-note">
                <strong>Personas</strong>
                <div class="muted small">Each persona doubles one criterion bonus and grants a once-per-run clue power.</div>
              </div>
            </div>
            <button class="button primary" data-action="close-modal">Close Bench Book</button>
          </div>
        </div>
      `;
    }

    if (state.modal === 'loading') {
      return `
        <div class="modal">
          <div class="modal-card">
            <div class="eyebrow">AI Director</div>
            <div class="screen-title">Preparing The Docket</div>
            <div class="muted">${state.loadingMessage || 'Fabricating the next case file...'}</div>
          </div>
        </div>
      `;
    }

    return '';
  }

  function handleClick(event) {
    const target = event.target.closest('[data-action]');
    if (!target) {
      return;
    }

    const action = target.getAttribute('data-action');
    if (action === 'toggle-sound') {
      state.profile.settings.soundOn = !state.profile.settings.soundOn;
      saveProfile();
      render();
      return;
    }

    if (action === 'toggle-motion') {
      state.profile.settings.reducedMotion = !state.profile.settings.reducedMotion;
      saveProfile();
      render();
      return;
    }

    if (action === 'open-bench-book') {
      state.modal = 'benchBook';
      render();
      return;
    }

    if (action === 'close-modal') {
      state.modal = null;
      render();
      return;
    }

    if (action === 'choose-persona') {
      state.profile.personaId = target.dataset.persona;
      saveProfile();
      render();
      return;
    }

    if (action === 'start-campaign') {
      startCampaign();
      return;
    }

    if (action === 'start-docket') {
      startCampaign(Number(target.dataset.docket));
      return;
    }

    if (action === 'start-survival') {
      startSurvival();
      return;
    }

    if (action === 'start-custom') {
      startCustom();
      return;
    }

    if (!state.session) {
      return;
    }

    if (action === 'answer-note') {
      state.session.answers[target.dataset.criterion] = target.dataset.value === 'pass';
      playSound('tap');
      render();
      return;
    }

    if (action === 'use-power') {
      usePersonaPower();
      return;
    }

    if (action === 'submit-verdict') {
      const verdict = target.dataset.verdict === 'admit';
      judgeCurrentCase(verdict);
      return;
    }

    if (action === 'next-case') {
      proceedAfterVerdict();
      return;
    }

    if (action === 'ask-ai-debrief') {
      requestAIDebrief();
      return;
    }

    if (action === 'retry-run') {
      retryRun();
      return;
    }

    if (action === 'continue-from-summary') {
      continueFromSummary();
      return;
    }

    if (action === 'return-home') {
      state.session = null;
      state.view = 'home';
      render();
    }
  }

  function handleChange(event) {
    const target = event.target;
    const field = target.getAttribute('data-field');
    if (!field) {
      return;
    }
    state.profile[field] = target.value.trim();
    saveProfile();
  }

  function handleKeydown(event) {
    if (event.key === 'Escape' && state.modal) {
      state.modal = null;
      render();
      return;
    }

    if (state.view !== 'court') {
      return;
    }

    if (event.key.toLowerCase() === 'a') {
      judgeCurrentCase(true);
    }
    if (event.key.toLowerCase() === 'd') {
      judgeCurrentCase(false);
    }
  }

  function startCampaign(forcedIndex) {
    if (!ensureProfileReady()) {
      return;
    }
    const docketIndex = Number.isInteger(forcedIndex) ? forcedIndex : getCurrentCampaignDocketIndex();
    const docket = data.dockets[docketIndex];
    state.session = {
      mode: 'campaign',
      modeLabel: 'Guided Campaign',
      objectiveTitle: docket.name,
      objectiveText: docket.overview,
      docketIndex: docketIndex,
      cases: cloneCases(docket.cases),
      endless: false,
      score: 0,
      streak: 0,
      strikes: 0,
      resolvedCases: 0,
      answers: resetAnswers(),
      powerUsed: false,
      revealedCriterion: null,
      focusHits: 0,
      correctNotes: 0,
      correctVerdicts: 0,
      incorrectVerdicts: 0,
      runXp: 0,
      runUnlocks: [],
      lastOutcome: null,
      summary: null
    };
    state.view = 'court';
    playSound('start');
    render();
  }

  function startSurvival() {
    if (!ensureProfileReady()) {
      return;
    }
    const pool = getUnlockedCasePool();
    state.session = {
      mode: 'survival',
      modeLabel: 'Appeals Survival',
      objectiveTitle: 'Stay On The Bench',
      objectiveText: 'Randomized cases from unlocked dockets. Survive until three strikes shut the courtroom down.',
      cases: [cloneCase(randomFrom(pool))],
      endless: true,
      score: 0,
      streak: 0,
      strikes: 0,
      resolvedCases: 0,
      answers: resetAnswers(),
      powerUsed: false,
      revealedCriterion: null,
      focusHits: 0,
      correctNotes: 0,
      correctVerdicts: 0,
      incorrectVerdicts: 0,
      runXp: 0,
      runUnlocks: [],
      lastOutcome: null,
      summary: null
    };
    state.view = 'court';
    playSound('start');
    render();
  }

  async function startCustom() {
    if (!ensureProfileReady()) {
      return;
    }
    if (!state.profile.topicDraft) {
      showToast('Enter a topic for custom practice first.');
      return;
    }

    state.modal = 'loading';
    state.loadingMessage = state.profile.apiKey
      ? 'AI Director is fabricating a live topic-specific source file.'
      : 'Offline Director is fabricating a local practice source because no API key is set.';
    render();

    const firstCase = await getCustomCase(state.profile.topicDraft);
    state.modal = null;
    state.session = {
      mode: 'custom',
      modeLabel: 'Custom Topic Practice',
      objectiveTitle: `Custom Docket: ${state.profile.topicDraft}`,
      objectiveText: 'Custom-topic survival run. Keep the bench alive, learn fast, and chase a better source judgment record.',
      topic: state.profile.topicDraft,
      cases: [firstCase],
      endless: true,
      score: 0,
      streak: 0,
      strikes: 0,
      resolvedCases: 0,
      answers: resetAnswers(),
      powerUsed: false,
      revealedCriterion: null,
      focusHits: 0,
      correctNotes: 0,
      correctVerdicts: 0,
      incorrectVerdicts: 0,
      runXp: 0,
      runUnlocks: [],
      lastOutcome: null,
      summary: null
    };
    state.view = 'court';
    playSound('start');
    render();
  }

  function usePersonaPower() {
    const session = state.session;
    if (session.powerUsed) {
      return;
    }
    const focus = getPersona(state.profile.personaId).focus;
    session.powerUsed = true;
    session.revealedCriterion = focus;
    showToast(`${getPersona(state.profile.personaId).powerTitle} revealed the ${getCriterion(focus).label} clue.`);
    playSound('power');
    render();
  }

  function judgeCurrentCase(playerVerdict) {
    const source = getCurrentCase();
    const persona = getPersona(state.profile.personaId);
    const previousRankTitle = getCurrentRank().title;
    const noteRows = data.criteria.map((criterion) => {
      const playerValue = state.session.answers[criterion.id];
      const actual = source.answers[criterion.id];
      const answered = playerValue !== null;
      const correct = answered && playerValue === actual;
      const points = correct ? (criterion.id === persona.focus ? 36 : 18) : 0;
      return {
        id: criterion.id,
        label: criterion.label,
        playerValue: playerValue,
        actual: actual,
        answered: answered,
        correct: correct,
        points: points,
        playerText: answered ? (playerValue ? 'passes' : 'fails') : 'no call',
        actualText: actual ? 'passes' : 'fails',
        clue: source.clues[criterion.id]
      };
    });

    const answeredCount = noteRows.filter((row) => row.answered).length;
    const correctNotes = noteRows.filter((row) => row.correct).length;
    const notePoints = noteRows.reduce((sum, row) => sum + row.points, 0);
    const masteryBonus = answeredCount === 4 && correctNotes === 4 ? 30 : 0;
    const correctVerdict = playerVerdict === source.verdict;
    const difficultyBonus = getDifficultyBonus(source.difficulty);
    const nextStreak = correctVerdict ? state.session.streak + 1 : 0;
    const streakBonus = correctVerdict && nextStreak >= 3 ? 25 : 0;
    const multiplier = correctVerdict ? 1 + Math.min(nextStreak, 6) * 0.12 : 1;
    const rulingPoints = correctVerdict ? 100 + difficultyBonus : 0;
    const baseScore = correctVerdict ? rulingPoints + notePoints + masteryBonus + streakBonus : Math.round(notePoints * 0.35);
    const scoreGain = Math.max(0, Math.round(baseScore * multiplier));
    const xpGain = 10 + correctNotes * 4 + (correctVerdict ? 16 : 6) + (answeredCount === 4 ? 4 : 0);

    if (correctVerdict) {
      state.session.streak = nextStreak;
      state.session.correctVerdicts += 1;
    } else {
      state.session.streak = 0;
      state.session.incorrectVerdicts += 1;
      state.session.strikes += 1;
    }

    state.session.score += scoreGain;
    state.session.correctNotes += correctNotes;
    state.session.runXp += xpGain;
    state.profile.careerXp += xpGain;
    state.profile.casesCompleted += 1;
    state.profile.correctVerdicts += correctVerdict ? 1 : 0;
    state.profile.incorrectVerdicts += correctVerdict ? 0 : 1;
    state.profile.bestStreak = Math.max(state.profile.bestStreak, state.session.streak, nextStreak);
    state.session.focusHits += noteRows.filter((row) => row.correct && row.id === persona.focus).length;

    const unlocks = applyAchievements(correctVerdict, answeredCount, correctNotes);
    const currentRankTitle = getCurrentRank().title;
    if (currentRankTitle !== previousRankTitle) {
      unlocks.push(`Rank up: ${currentRankTitle}`);
      state.session.runUnlocks.push(`Rank up: ${currentRankTitle}`);
      showToast(`Promotion recorded: ${currentRankTitle}`);
      playSound('promotion');
    }
    const debrief = buildDebrief(source, correctVerdict, noteRows);

    state.session.lastOutcome = {
      sourceId: source.id,
      playerVerdict: playerVerdict,
      correctVerdict: correctVerdict,
      strikeText: state.session.strikes >= 3 ? 'Third strike' : `Strike ${state.session.strikes}/3`,
      rulingPoints: rulingPoints,
      notePoints: notePoints,
      masteryBonus: masteryBonus,
      streakBonus: streakBonus,
      multiplier: multiplier,
      scoreGain: scoreGain,
      xpGain: xpGain,
      correctNotes: correctNotes,
      answeredCount: answeredCount,
      skillFocus: source.skillFocus,
      verdictReason: source.verdictReason,
      teachingPoint: source.teachingPoint,
      debrief: debrief,
      criterionRows: noteRows,
      unlocks: unlocks,
      aiDebrief: '',
      aiButtonLabel: state.profile.apiKey ? 'Ask AI Director For Appeal Breakdown' : 'Get Expanded Bench Breakdown'
    };

    saveProfile();
    state.view = 'verdict';
    playSound(correctVerdict ? 'correct' : 'strike');
    announce(`${correctVerdict ? 'Judgment upheld.' : 'Judgment overturned.'} ${source.verdictReason}`);
    render();
  }

  function proceedAfterVerdict() {
    state.session.resolvedCases += 1;
    if (state.session.strikes >= 3) {
      finishRun('disbarred');
      return;
    }

    if (!state.session.endless && state.session.resolvedCases >= state.session.cases.length) {
      finishRun('cleared');
      return;
    }

    if (state.session.endless && state.session.resolvedCases >= state.session.cases.length) {
      if (state.session.mode === 'custom') {
        state.modal = 'loading';
        state.loadingMessage = 'Director is fabricating the next custom source.';
        render();
        getCustomCase(state.session.topic).then((nextCase) => {
          state.modal = null;
          state.session.cases.push(nextCase);
          prepareNextCourtCase();
        });
        return;
      }
      state.session.cases.push(cloneCase(randomFrom(getUnlockedCasePool())));
    }

    prepareNextCourtCase();
  }

  function prepareNextCourtCase() {
    state.session.answers = resetAnswers();
    state.session.revealedCriterion = null;
    state.view = 'court';
    playSound('advance');
    render();
  }

  async function requestAIDebrief() {
    const outcome = state.session.lastOutcome;
    if (!outcome) {
      return;
    }

    if (!state.profile.apiKey) {
      outcome.aiDebrief = buildLocalExpandedBreakdown(getCurrentCase(), outcome);
      outcome.aiButtonLabel = 'Expanded Breakdown Ready';
      render();
      return;
    }

    state.modal = 'loading';
    state.loadingMessage = 'AI Director is drafting the appeal memo.';
    render();

    try {
      const prompt = `
Give a concise AP Research source-evaluation explanation.
Source title: ${getCurrentCase().title}
Source type: ${getCurrentCase().type}
Actual verdict: ${getCurrentCase().verdict ? 'Admissible' : 'Dismissed'}
Authority: ${getCurrentCase().answers.authority}
Currency: ${getCurrentCase().answers.currency}
Rigor: ${getCurrentCase().answers.rigor}
Objectivity: ${getCurrentCase().answers.objectivity}
Explain what makes the source strong or weak in 3 sharp sentences.
      `.trim();
      outcome.aiDebrief = await callGemini(prompt);
      outcome.aiButtonLabel = 'AI Appeal Memo Ready';
    } catch (error) {
      outcome.aiDebrief = buildLocalExpandedBreakdown(getCurrentCase(), outcome);
      outcome.aiButtonLabel = 'Used Offline Breakdown';
    }

    state.modal = null;
    render();
  }

  function finishRun(reason) {
    const session = state.session;
    const modeKey = session.mode === 'campaign' ? 'campaign' : session.mode === 'survival' ? 'survival' : 'custom';
    if (session.score > state.profile.bestModeScores[modeKey]) {
      state.profile.bestModeScores[modeKey] = session.score;
      session.runUnlocks.push(`New ${capitalize(modeKey)} high score`);
    }

    let title = 'Session Closed';
    let comment = 'The bench got what it needed: clearer judgment and one more round of source review practice.';
    let promotionText = 'No promotion changed this time.';
    let primaryAction = '<button class="button primary" data-action="return-home">Return Home</button>';

    if (session.mode === 'campaign') {
      const docket = data.dockets[session.docketIndex];
      if (reason === 'cleared') {
        title = `${docket.name} Cleared`;
        comment = `Promotion earned. You cleared the docket and moved the judicial career ladder forward without losing the courtroom identity in the process.`;
        state.profile.completedDockets[docket.id] = true;
        if (session.docketIndex + 1 >= state.profile.unlockedDocketCount && state.profile.unlockedDocketCount < data.dockets.length) {
          state.profile.unlockedDocketCount += 1;
          session.runUnlocks.push(`Unlocked ${data.dockets[state.profile.unlockedDocketCount - 1].name}`);
        }
        session.runUnlocks.push(docket.promotion);
        promotionText = `Promotion record updated: ${docket.promotion}`;
        primaryAction = state.profile.unlockedDocketCount > session.docketIndex + 1
          ? '<button class="button primary" data-action="continue-from-summary">Advance To Next Docket</button>'
          : '<button class="button primary" data-action="return-home">Return Home</button>';
        if (session.strikes === 0) {
          unlockBadge('Clean Record', session.runUnlocks);
        }
      } else {
        title = 'Mistrial';
        comment = 'Three strikes ended the docket, but the verdict screens already marked which parts of the source review process need tightening.';
        promotionText = `Docket not cleared. ${docket.promotion} stays locked until you close the chapter cleanly.`;
        primaryAction = '<button class="button primary" data-action="retry-run">Retry This Docket</button>';
      }
    }

    if (session.mode === 'survival') {
      title = 'Appeals Survival Closed';
      comment = 'The run ended, but survival mode did its job: fast source sorting, rising streak pressure, and another stack of credibility calls on the record.';
      promotionText = 'Survival mode pushes skill speed, not chapter unlocks.';
      primaryAction = '<button class="button primary" data-action="retry-run">Run Survival Again</button>';
    }

    if (session.mode === 'custom') {
      title = 'Custom Docket Closed';
      comment = 'You squeezed another batch of topic-specific source review out of the bench. That is how source literacy turns into actual judgment speed.';
      promotionText = state.profile.apiKey ? 'AI Director remains available for more topic-specific dockets.' : 'Offline Director is still ready if you want more local practice without an API key.';
      primaryAction = '<button class="button primary" data-action="retry-run">Run Custom Topic Again</button>';
    }

    saveProfile();
    session.summary = {
      title: title,
      comment: comment,
      score: session.score,
      xp: session.runXp,
      bestStreak: Math.max(session.streak, state.profile.bestStreak),
      correctVerdicts: session.correctVerdicts,
      incorrectVerdicts: session.incorrectVerdicts,
      correctNotes: session.correctNotes,
      unlocks: session.runUnlocks,
      promotionText: promotionText,
      primaryAction: primaryAction,
      modeLabel: session.modeLabel
    };
    state.view = 'summary';
    playSound(reason === 'cleared' ? 'promotion' : 'strike');
    render();
  }

  function continueFromSummary() {
    const nextIndex = state.session.docketIndex + 1;
    state.session = null;
    state.view = 'home';
    render();
    if (nextIndex < state.profile.unlockedDocketCount) {
      startCampaign(nextIndex);
    }
  }

  function retryRun() {
    const session = state.session;
    const mode = session.mode;
    const docketIndex = session.docketIndex;
    const topic = session.topic;
    state.session = null;
    state.view = 'home';
    render();
    if (mode === 'campaign') {
      startCampaign(docketIndex);
      return;
    }
    if (mode === 'survival') {
      startSurvival();
      return;
    }
    if (mode === 'custom') {
      state.profile.topicDraft = topic;
      saveProfile();
      startCustom();
    }
  }

  function ensureProfileReady() {
    const nameInput = document.getElementById('judge-name');
    if (nameInput && nameInput.value.trim()) {
      state.profile.name = nameInput.value.trim();
    }
    const topicInput = document.getElementById('topic-draft');
    if (topicInput && topicInput.value.trim()) {
      state.profile.topicDraft = topicInput.value.trim();
    }
    const apiInput = document.getElementById('api-key');
    if (apiInput && apiInput.value.trim()) {
      state.profile.apiKey = apiInput.value.trim();
    }
    saveProfile();

    if (!state.profile.name) {
      showToast('Enter a judge name before opening the docket.');
      return false;
    }
    return true;
  }

  function getCurrentRank() {
    return data.ranks.reduce((current, rank) => (state.profile.careerXp >= rank.xp ? rank : current), data.ranks[0]);
  }

  function getRankProgress() {
    const currentRank = getCurrentRank();
    const currentIndex = data.ranks.findIndex((rank) => rank.title === currentRank.title);
    const nextRank = data.ranks[Math.min(currentIndex + 1, data.ranks.length - 1)];
    if (nextRank.title === currentRank.title) {
      return { current: state.profile.careerXp, needed: state.profile.careerXp, percent: 100, nextTitle: currentRank.title };
    }
    const currentFloor = currentRank.xp;
    const nextFloor = nextRank.xp;
    return {
      current: state.profile.careerXp - currentFloor,
      needed: nextFloor - currentFloor,
      percent: ((state.profile.careerXp - currentFloor) / (nextFloor - currentFloor)) * 100,
      nextTitle: nextRank.title
    };
  }

  function getNextCampaignDocket() {
    const index = getCurrentCampaignDocketIndex();
    return data.dockets[index];
  }

  function getCurrentCampaignDocketIndex() {
    for (let index = 0; index < state.profile.unlockedDocketCount; index += 1) {
      if (!state.profile.completedDockets[data.dockets[index].id]) {
        return index;
      }
    }
    return Math.max(0, state.profile.unlockedDocketCount - 1);
  }

  function getUnlockedCasePool() {
    return data.dockets
      .slice(0, state.profile.unlockedDocketCount)
      .flatMap((docket) => docket.cases);
  }

  function getCurrentCase() {
    return state.session.cases[state.session.resolvedCases];
  }

  function getPersona(id) {
    return data.personas.find((persona) => persona.id === id) || data.personas[0];
  }

  function getCriterion(id) {
    return data.criteria.find((criterion) => criterion.id === id);
  }

  function shouldShowTutorial(source) {
    return state.session.mode === 'campaign' && state.session.docketIndex === 0 && state.session.resolvedCases === 0 && source.id === 'miracle-berry';
  }

  function buildPurposeRead(source) {
    if (!source.answers.objectivity) {
      return 'Persuasion, advocacy, or sales pressure is doing visible work.';
    }
    return 'Primarily informative, with evidence and method doing the heavy lifting.';
  }

  function buildDebrief(source, correctVerdict, noteRows) {
    const weakCriteria = noteRows.filter((row) => row.actual === false).map((row) => row.label.toLowerCase());
    const strongCriteria = noteRows.filter((row) => row.actual === true).map((row) => row.label.toLowerCase());
    if (correctVerdict && source.verdict) {
      return `Good ruling. This source survives because its ${strongCriteria.join(', ')} hold up under academic scrutiny, so the evidence earns its place in research.`;
    }
    if (correctVerdict && !source.verdict) {
      return `Good ruling. The fatal issues sit in ${weakCriteria.join(', ')}, so the source looks usable at a glance but collapses under actual source review.`;
    }
    return `The verdict missed the center of gravity. Re-check ${weakCriteria.length ? weakCriteria.join(', ') : strongCriteria.join(', ')} before you make the next call, because that is where the source either wins or loses admissibility.`;
  }

  function buildLocalExpandedBreakdown(source, outcome) {
    const actualFails = data.criteria
      .filter((criterion) => !source.answers[criterion.id])
      .map((criterion) => criterion.label.toLowerCase());
    const actualPasses = data.criteria
      .filter((criterion) => source.answers[criterion.id])
      .map((criterion) => criterion.label.toLowerCase());
    return source.verdict
      ? `This source earns admission because its ${actualPasses.join(', ')} all hold. The strongest sign is that the source explains evidence and method instead of leaning on hype.`
      : `This source should be dismissed because ${actualFails.join(', ')} break the case for academic credibility. The weak spots are not cosmetic; they undermine whether the evidence belongs in research at all.`;
  }

  function applyAchievements(correctVerdict, answeredCount, correctNotes) {
    const unlocks = [];
    if (state.session.streak >= 3) {
      unlockBadge('Hot Bench', unlocks);
    }
    if (answeredCount === 4 && correctNotes === 4) {
      unlockBadge('Four-Factor Test', unlocks);
    }
    if (state.session.focusHits >= 3) {
      unlockBadge('Persona Specialist', unlocks);
    }
    if (correctVerdict && state.session.correctVerdicts >= 5) {
      unlockBadge('Precedent Builder', unlocks);
    }
    state.session.runUnlocks = state.session.runUnlocks.concat(unlocks);
    return unlocks;
  }

  function unlockBadge(label, unlockList) {
    if (!state.profile.achievements.includes(label)) {
      state.profile.achievements.push(label);
      unlockList.push(`Badge: ${label}`);
    }
  }

  function resetAnswers() {
    return {
      authority: null,
      currency: null,
      rigor: null,
      objectivity: null
    };
  }

  function getDifficultyBonus(label) {
    if (label === 'Hard') {
      return 35;
    }
    if (label === 'Medium') {
      return 20;
    }
    return 0;
  }

  function cloneCases(cases) {
    return cases.map(cloneCase);
  }

  function cloneCase(caseData) {
    return JSON.parse(JSON.stringify(caseData));
  }

  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat().format(Math.round(value));
  }

  function randomFrom(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function escapeHtml(text) {
    return String(text || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  function showToast(message) {
    state.toast = message;
    render();
    window.setTimeout(() => {
      state.toast = null;
      render();
    }, 2200);
  }

  function announce(message) {
    liveRegion.textContent = message;
  }

  async function getCustomCase(topic) {
    if (state.profile.apiKey) {
      try {
        return await requestCustomAICase(topic);
      } catch (error) {
        return buildOfflineCustomCase(topic);
      }
    }
    return buildOfflineCustomCase(topic);
  }

  async function requestCustomAICase(topic) {
    const prompt = `
Create one AP Research source-evaluation case about "${topic}".
Return valid JSON with these keys only:
title, author, publication, date, type, difficulty, skillFocus, excerpt, verdict, answers, clues, verdictReason, teachingPoint.
answers must contain authority, currency, rigor, objectivity booleans.
Make the case short, realistic, and classroom-appropriate.
    `.trim();

    const raw = await callGemini(prompt);
    const parsed = JSON.parse(raw);
    parsed.id = `custom-${Date.now()}`;
    return parsed;
  }

  function buildOfflineCustomCase(topic) {
    const bucketNames = Object.keys(data.customTemplates);
    const bucket = randomFrom(bucketNames);
    const template = cloneCase(randomFrom(data.customTemplates[bucket]));
    const year = template.answers.currency ? 2023 + Math.floor(Math.random() * 3) : 1999 + Math.floor(Math.random() * 15);
    const topicLabel = normalizeTopic(topic);
    const source = {
      id: `offline-${Date.now()}`,
      title: template.title.replaceAll('{topic}', topicLabel),
      author: template.author,
      publication: template.publication,
      date: String(year),
      type: template.type,
      difficulty: bucket === 'credible' ? 'Medium' : 'Hard',
      skillFocus: bucket === 'credible' ? 'Whole-source judgment' : bucket === 'outdated' ? 'Currency' : 'Objectivity + Rigor',
      excerpt: template.excerpt.replaceAll('{topic}', topicLabel.toLowerCase()),
      verdict: template.verdict,
      answers: template.answers,
      clues: buildOfflineClues(template.answers, template.type),
      verdictReason: buildOfflineVerdictReason(template.verdict, template.answers),
      teachingPoint: buildOfflineTeachingPoint(template.verdict, template.answers)
    };
    return source;
  }

  function buildOfflineClues(answers, type) {
    return {
      authority: answers.authority
        ? `The author and source type suggest legitimate expertise instead of vague self-branding.`
        : `The author or institution sounds public-facing, but it does not show enough field-specific expertise to trust the claim.`,
      currency: answers.currency
        ? `The date is recent enough that the source can still speak to a current research conversation.`
        : `The date makes the evidence stale for a fast-moving topic, so older context becomes a liability.`,
      rigor: answers.rigor
        ? `${type} suggests real vetting, methodology, or institutional review rather than casual publication.`
        : `The source type does not show strong outside review, so the argument has not earned academic trust.`,
      objectivity: answers.objectivity
        ? `The tone is informative and measured instead of promotional or emotionally manipulative.`
        : `The tone or funding context pushes an agenda hard enough to weaken objectivity.`
    };
  }

  function buildOfflineVerdictReason(verdict, answers) {
    const failed = data.criteria.filter((criterion) => !answers[criterion.id]).map((criterion) => criterion.label.toLowerCase());
    return verdict
      ? 'Admissible. The source holds up across the four-factor test and behaves like evidence rather than salesmanship.'
      : `Dismissed. The source breaks down in ${failed.join(', ')}, which is enough to keep it out of serious academic use.`;
  }

  function buildOfflineTeachingPoint(verdict, answers) {
    if (verdict) {
      return 'A strong source earns trust through expertise, recency, vetting, and measured tone all working together.';
    }
    if (!answers.currency) {
      return 'A source can look scholarly and still fail if its evidence is outdated for the topic.';
    }
    if (!answers.objectivity) {
      return 'Bias often reveals itself through purpose, funding, or pressure-heavy language.';
    }
    return 'Source evaluation is about reliability, not just polish.';
  }

  function normalizeTopic(topic) {
    return topic
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/^./, (match) => match.toUpperCase());
  }

  async function callGemini(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${encodeURIComponent(state.profile.apiKey)}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Gemini request failed with status ${response.status}`);
    }

    const json = await response.json();
    return json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts
      ? json.candidates[0].content.parts[0].text
      : '';
  }

  function createAudioEngine() {
    let context = null;

    function ensureContext() {
      if (!context) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
          return null;
        }
        context = new AudioContext();
      }
      return context;
    }

    function tone(frequency, start, duration, gainValue, type) {
      const ctx = ensureContext();
      if (!ctx) {
        return;
      }
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = type || 'triangle';
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.02);
    }

    function play(kind) {
      if (!state.profile.settings.soundOn) {
        return;
      }
      const ctx = ensureContext();
      if (!ctx) {
        return;
      }
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime + 0.01;
      if (kind === 'correct') {
        tone(620, now, 0.12, 0.03, 'square');
        tone(860, now + 0.08, 0.14, 0.028, 'triangle');
      } else if (kind === 'strike') {
        tone(220, now, 0.18, 0.032, 'sawtooth');
      } else if (kind === 'promotion') {
        tone(520, now, 0.1, 0.03, 'triangle');
        tone(720, now + 0.08, 0.1, 0.03, 'triangle');
        tone(980, now + 0.16, 0.16, 0.03, 'square');
      } else if (kind === 'power') {
        tone(480, now, 0.08, 0.02, 'triangle');
        tone(680, now + 0.06, 0.12, 0.024, 'triangle');
      } else if (kind === 'advance') {
        tone(440, now, 0.08, 0.018, 'triangle');
      } else if (kind === 'start') {
        tone(360, now, 0.1, 0.02, 'triangle');
        tone(520, now + 0.08, 0.14, 0.024, 'triangle');
      } else if (kind === 'tap') {
        tone(510, now, 0.05, 0.015, 'triangle');
      }
    }

    return { play };
  }

  function playSound(kind) {
    state.audio.play(kind);
  }
})();
