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

    return `
      <div class="screen">
        ${renderTopbar()}
        
        <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
          
          <div style="text-align: center; margin-bottom: 40px; margin-top: 20px;">
            <span style="font-size: 4rem; display: block; margin-bottom: 10px; filter: drop-shadow(0 0 15px rgba(212, 175, 55, 0.5));">⚖️</span>
            <h1 style="font-size: 3rem; font-weight: 900; letter-spacing: 0.1em; color: var(--gold); text-transform: uppercase; font-family: var(--display); margin: 0;">Source Court</h1>
            <p class="muted" style="margin-top: 10px; font-size: 1.1rem;">Review metadata, weigh criteria, and rule if a source belongs in academic research.</p>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 15px 25px; margin-bottom: 30px;">
            <div>
              <div class="eyebrow">Current Rank</div>
              <div style="font-size: 1.2rem; font-weight: bold; color: var(--gold);">${rank.title}</div>
            </div>
            <div style="flex: 1; margin: 0 30px;">
              <div class="meter" style="margin: 0;"><div class="meter-fill" style="width:${progress.percent}%"></div></div>
              <div class="muted small" style="margin-top: 5px; text-align: center;">${progress.current} / ${progress.needed} XP to ${progress.nextTitle}</div>
            </div>
            <div style="text-align: right;">
              <div class="eyebrow">Best Streak</div>
              <div style="font-size: 1.2rem; font-weight: bold; color: #fbbf24;">${state.profile.bestStreak} 🔥</div>
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 25px; margin-bottom: 20px;">
            <div style="font-size: 1.2rem; font-weight: 800; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
              <span style="background: var(--gold); color: #000; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 1rem; font-weight: 900;">1</span> Enter Your Name
            </div>
            <input id="judge-name" data-field="name" type="text" value="${escapeHtml(state.profile.name)}" placeholder="Judge's Last Name (e.g., Smith)" style="width: 100%; padding: 15px; border-radius: var(--radius-sm); border: 1px solid var(--line-strong); background: var(--bg); color: white; font-size: 1.1rem;" />
          </div>

          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 25px; margin-bottom: 20px;">
            <div style="font-size: 1.2rem; font-weight: 800; margin-bottom: 5px; display: flex; align-items: center; gap: 10px;">
              <span style="background: var(--gold); color: #000; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 1rem; font-weight: 900;">2</span> Select Playstyle
            </div>
            <p class="muted small" style="margin-bottom: 20px;">Your persona grants you double points for correctly evaluating specific criteria.</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">
              ${data.personas.map(renderPersonaCard).join('')}
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 25px; margin-bottom: 40px;">
            <div style="font-size: 1.2rem; font-weight: 800; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
              <span style="background: var(--gold); color: #000; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 1rem; font-weight: 900;">3</span> Start the Docket
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin-bottom: 30px;">
              <button class="button primary" style="padding: 20px; font-size: 1.1rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid transparent;" data-action="start-campaign">
                <strong>⚖️ Continue Campaign</strong>
                <span style="font-size: 0.8rem; opacity: 0.8; font-weight: normal; text-transform: none; letter-spacing: 0;">${currentDocket.chapter}: ${currentDocket.name}</span>
              </button>
              <button class="button secondary" style="padding: 20px; font-size: 1.1rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;" data-action="start-survival">
                <strong>🔥 Appeals Survival</strong>
                <span style="font-size: 0.8rem; opacity: 0.8; font-weight: normal; text-transform: none; letter-spacing: 0;">Random cases, 3 strikes</span>
              </button>
            </div>

            <div style="display: flex; align-items: center; text-align: center; margin: 30px 0; color: var(--muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: bold;">
              <span style="flex: 1; border-bottom: 1px solid var(--line-strong); margin-right: 15px;"></span>
              OR ENDLESS AI PRACTICE
              <span style="flex: 1; border-bottom: 1px solid var(--line-strong); margin-left: 15px;"></span>
            </div>

            <div style="display: grid; gap: 10px; margin-bottom: 15px;">
              <input id="topic-draft" data-field="topicDraft" type="text" value="${escapeHtml(state.profile.topicDraft)}" placeholder="Enter custom topic: e.g., Fast food, Social media..." style="width: 100%; padding: 15px; border-radius: var(--radius-sm); border: 1px solid rgba(16, 185, 129, 0.4); background: rgba(16,185,129,0.05); color: white; font-size: 1rem;" />
              <input id="api-key" data-field="apiKey" type="password" value="${escapeHtml(state.profile.apiKey)}" placeholder="Gemini API Key (Required for AI Practice)" style="width: 100%; padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--line-strong); background: var(--bg); color: white;" />
            </div>
            <button class="button" style="width: 100%; padding: 15px; font-size: 1.1rem; background: linear-gradient(135deg, #4ade80, #0d9488); color: #000; border: none;" data-action="start-custom">✨ Generate Custom AI Docket</button>

          </div>
        </div>
      </div>
    `;
  }
 function renderCourt() {
    const session = state.session;
    const source = getCurrentCase();
    const persona = getPersona(state.profile.personaId);

    return `
      <div class="screen">
        ${renderTopbar()}
        <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
          
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px;">
            <div>
              <div class="eyebrow" style="color: var(--gold); margin-bottom: 5px;">${source.difficulty} difficulty | ${source.skillFocus}</div>
              <h1 style="font-size: 2.2rem; font-family: var(--display); margin: 0;">${source.title}</h1>
            </div>
            <div class="tag-row">
              <span class="tag">${source.type}</span>
              <span class="tag">${session.modeLabel}</span>
            </div>
          </div>

          <div class="case-card" style="margin-bottom: 30px; padding: 30px; background: var(--surface); border-top: 4px solid var(--gold); border-radius: var(--radius-md); box-shadow: var(--shadow);">
            <div style="display: grid; grid-template-columns: auto 1fr; gap: 12px 20px; border-bottom: 1px solid var(--line); padding-bottom: 20px; margin-bottom: 20px;">
              <span style="color: var(--gold); font-size: 0.8rem; text-transform: uppercase; font-weight: bold; letter-spacing: 0.1em;">Author</span>
              <span style="font-weight: 500; color: var(--text);">${source.author}</span>
              <span style="color: var(--gold); font-size: 0.8rem; text-transform: uppercase; font-weight: bold; letter-spacing: 0.1em;">Publication</span>
              <span style="font-weight: 500; color: var(--text);">${source.publication}</span>
              <span style="color: var(--gold); font-size: 0.8rem; text-transform: uppercase; font-weight: bold; letter-spacing: 0.1em;">Date</span>
              <span style="font-weight: 500; color: var(--text);">${source.date}</span>
              <span style="color: var(--gold); font-size: 0.8rem; text-transform: uppercase; font-weight: bold; letter-spacing: 0.1em;">Purpose</span>
              <span style="font-weight: 500; color: var(--text);">${buildPurposeRead(source)}</span>
            </div>
            <div class="excerpt-box" style="font-family: var(--body); font-size: 1.25rem; line-height: 1.8; color: #e2e8f0; border-left: 3px solid var(--gold); padding-left: 20px; font-style: italic;">
              "${source.excerpt}"
            </div>
          </div>

          <div class="panel" style="margin-bottom: 30px; padding: 25px; background: rgba(255,255,255,0.02); border: 1px solid var(--line); border-radius: var(--radius-md);">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); padding-bottom: 15px; margin-bottom: 20px;">
              <h3 style="color: var(--gold); text-transform: uppercase; letter-spacing: 0.1em; font-size: 1.1rem; margin: 0;">Cross-Examination</h3>
              <span class="muted small">Optional | +Score for correct checks</span>
            </div>
            <div style="display: grid; gap: 15px;">
              ${data.criteria.map((criterion) => renderCriteriaJudgeCard(criterion, source, session)).join('')}
            </div>
          </div>

          <div class="panel" style="padding: 30px; background: var(--surface); border: 1px solid var(--line-strong); border-radius: var(--radius-md); text-align: center;">
            <h3 style="color: var(--text); font-size: 1.4rem; margin: 0 0 5px 0;">Issue Your Ruling</h3>
            <div class="muted small" style="margin-bottom: 25px;">Rule the source itself. A current source can still fail if its expertise or objectivity collapses.</div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <button class="ruling-button" data-action="submit-verdict" data-verdict="admit" style="padding: 20px; background: rgba(16, 185, 129, 0.05); border: 2px solid rgba(16, 185, 129, 0.4); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s;">
                <strong style="display: block; font-size: 1.2rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--admit); margin-bottom: 5px;">Rule Admissible</strong>
                <span style="font-size: 0.85rem; color: var(--text); opacity: 0.8;">Credible & Academic</span>
              </button>
              <button class="ruling-button" data-action="submit-verdict" data-verdict="dismiss" style="padding: 20px; background: rgba(239, 68, 68, 0.05); border: 2px solid rgba(239, 68, 68, 0.4); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s;">
                <strong style="display: block; font-size: 1.2rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--dismiss); margin-bottom: 5px;">Rule Dismissed</strong>
                <span style="font-size: 0.85rem; color: var(--text); opacity: 0.8;">Flawed or Biased</span>
              </button>
            </div>
          </div>

          <div style="height: 100px;"></div>
        </div>
      </div>
    `;
  }

  function renderVerdict() {
    const session = state.session;
    const caseRecord = session.history[session.history.length - 1];
    const isCorrect = caseRecord.correct;
    const color = isCorrect ? 'var(--admit)' : 'var(--dismiss)';
    const bg = isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';

    return `
      <div class="screen">
        ${renderTopbar()}
        <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
          
          <div style="text-align: center; margin: 40px 0;">
            <div style="display: inline-flex; align-items: center; justify-content: center; padding: 15px 40px; border-radius: 8px; border: 4px solid ${color}; transform: rotate(-3deg); font-size: 3rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: ${color}; text-shadow: 0 0 20px ${color}; box-shadow: inset 0 0 20px rgba(0,0,0,0.5);">
              ${caseRecord.playerVerdict === 'admit' ? 'ADMISSIBLE' : 'DISMISSED'}
            </div>
            <div style="margin-top: 25px;">
              <span style="display: inline-block; padding: 10px 20px; border-radius: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; background: ${bg}; color: ${color}; border: 1px solid ${color};">
                ${isCorrect ? 'JUDGMENT UPHELD (+1 STREAK)' : 'OBJECTION SUSTAINED (STRIKE)'}
              </span>
            </div>
            <div style="font-size: 2rem; font-weight: bold; color: var(--gold); font-family: monospace; margin-top: 20px;">
              +${caseRecord.scoreEarned} XP
            </div>
          </div>

          <div class="panel" style="margin-bottom: 30px; background: rgba(255,255,255,0.02); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 30px;">
            <h3 style="color: var(--gold); text-transform: uppercase; font-size: 1.1rem; border-bottom: 1px solid var(--line); padding-bottom: 15px; margin-bottom: 20px;">Chief Justice Debrief</h3>
            <div style="font-size: 1.15rem; line-height: 1.6; margin-bottom: 30px; color: var(--text);">
              <strong style="color: ${caseRecord.source.ruling === 'admit' ? 'var(--admit)' : 'var(--dismiss)'}">Actual Ruling: ${caseRecord.source.ruling === 'admit' ? 'Admissible' : 'Dismissed'}.</strong><br>
              <div style="margin-top: 10px;">${caseRecord.source.explanation}</div>
            </div>
            
            <div style="display: grid; gap: 12px; margin-bottom: 30px;">
              ${Object.entries(caseRecord.notes).map(([critId, correct]) => {
                const crit = data.criteria.find(c => c.id === critId);
                const noteColor = correct ? "var(--admit)" : "var(--dismiss)";
                return `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 15px; background: rgba(0,0,0,0.4); border-radius: 8px; border-left: 4px solid ${noteColor};">
                    <span style="font-size: 1rem; font-weight: 600;">${crit.name}: ${correct ? 'Correct' : 'Incorrect'} Note</span>
                    <span style="color: var(--gold); font-family: monospace; font-size: 1.1rem;">+${correct ? caseRecord.noteScoreBreakdown[critId] : 0} XP</span>
                  </div>
                `;
              }).join('')}
              ${Object.keys(caseRecord.notes).length === 0 ? "<p style='color: var(--muted); font-size: 1rem; text-align: center; padding: 20px; background: rgba(0,0,0,0.2); border-radius: 8px;'>No evidence gathering attempted.</p>" : ""}
            </div>
          </div>

          <button class="button primary" style="width: 100%; padding: 25px; font-size: 1.3rem; border-radius: var(--radius-md);" data-action="next-case">Bring in the Next Source</button>
          <div style="height: 100px;"></div>
        </div>
      </div>
    `;
  }

  function renderEnd() {
    const session = state.session;
    const runScore = session.score;
    const runStreak = session.maxStreak;
    const isMistrial = session.strikes >= 3;
    const title = isMistrial ? "MISTRIAL" : "DOCKET CLEARED";
    const subtitle = isMistrial ? "You Have Been Disbarred (3 Strikes)" : "Campaign Progress Secured";
    const color = isMistrial ? "var(--dismiss)" : "var(--admit)";

    return `
      <div class="screen">
        ${renderTopbar()}
        <div style="max-width: 600px; margin: 40px auto; text-align: center; padding: 20px;">
          <div class="panel" style="padding: 50px 30px; background: var(--surface); border: 1px solid var(--line); border-top: 4px solid ${color}; border-radius: var(--radius-lg); box-shadow: var(--shadow);">
            <div style="font-size: 3.5rem; font-weight: 900; text-transform: uppercase; font-family: var(--display); margin-bottom: 10px; color: ${color};">${title}</div>
            <div style="color: var(--muted); font-size: 1.3rem; margin-bottom: 40px;">${subtitle}</div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px;">
              <div style="background: rgba(0,0,0,0.4); padding: 25px; border-radius: 12px; border: 1px solid var(--line);">
                <div style="font-size: 3rem; font-weight: bold; color: var(--gold); font-family: monospace;">${runScore}</div>
                <div style="font-size: 0.9rem; text-transform: uppercase; font-weight: bold; letter-spacing: 0.1em; color: var(--muted); margin-top: 5px;">Run XP Earned</div>
              </div>
              <div style="background: rgba(0,0,0,0.4); padding: 25px; border-radius: 12px; border: 1px solid var(--line);">
                <div style="font-size: 3rem; font-weight: bold; color: #fbbf24; font-family: monospace;">${runStreak}</div>
                <div style="font-size: 0.9rem; text-transform: uppercase; font-weight: bold; letter-spacing: 0.1em; color: var(--muted); margin-top: 5px;">Best Streak</div>
              </div>
            </div>
            
            <button class="button primary" style="width: 100%; padding: 25px; font-size: 1.3rem; border-radius: var(--radius-md);" data-action="return-home">Return to Main Menu</button>
          </div>
        </div>
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
