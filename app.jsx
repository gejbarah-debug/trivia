/* global React, ReactDOM */
const { useState, useEffect, useMemo, useRef } = React;

// Read these dynamically — window.QUESTIONS_BANK is replaced after questions.json
// loads, so don't snapshot at module load.
const AVATARS = window.AVATARS;
const LEADERBOARD_SEED = window.LEADERBOARD_SEED;

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const buildQuizPool = (count = 8) => {
  const bank = window.QUESTIONS_BANK || [];
  return shuffle(bank).slice(0, count).map((q) => {
    const idxs = shuffle([0, 1, 2, 3]);
    return {
      category: q.category,
      question: q.question,
      options: idxs.map((i) => q.options[i]),
      correct: idxs.indexOf(q.correct),
    };
  });
};

// ===== خلفية زخرفية =====
function BgDecor() {
  return (
    <div className="bg-decor" aria-hidden="true">
      <svg className="bg-blob-1" width="380" height="380" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="92" fill="var(--c-pink)" stroke="var(--c-ink)" strokeWidth="4" />
      </svg>
      <svg className="bg-blob-2" width="320" height="320" viewBox="0 0 200 200">
        <polygon points="100,10 130,80 195,90 145,135 160,195 100,160 40,195 55,135 5,90 70,80" fill="var(--c-yellow)" stroke="var(--c-ink)" strokeWidth="4"/>
      </svg>
      <svg className="bg-blob-3" width="260" height="260" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="92" fill="var(--c-teal)" stroke="var(--c-ink)" strokeWidth="4"/>
      </svg>
      <svg className="bg-blob-4" width="120" height="120" viewBox="0 0 200 200">
        <rect x="20" y="20" width="160" height="160" rx="36" fill="var(--c-purple)" stroke="var(--c-ink)" strokeWidth="6" transform="rotate(15 100 100)"/>
      </svg>
    </div>
  );
}

// ===== شريط علوي =====
function TopBar({ theme, onToggleTheme, screen, onHome }) {
  return (
    <div className="top-bar">
      <div className="brand">
        <span className="brand-mark">🎯</span>
        <span>لعبة المعلومات</span>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {screen !== "home" && (
          <button className="theme-toggle" onClick={onHome} title="الرئيسية" aria-label="الرئيسية">🏠</button>
        )}
        <button className="theme-toggle" onClick={onToggleTheme} aria-label="تبديل الثيم">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </div>
  );
}

// ===== HomeMenu (mode picker) =====
function HomeMenu({ onPick, hi }) {
  return (
    <div className="home">
      <div className="home-hero">
        <span className="home-eyebrow">⚡ تحدّي عائلي</span>
        <h1 className="home-title">
          <span className="word w1">لعبة</span>{" "}
          <span className="word w2">المعلومات</span>
        </h1>
        <p className="home-subtitle">
          العب بمفردك أو تحدَّ أصدقاءك في غرفة مباشرة. ٨ أسئلة، ١٥ ثانية، نقاط حسب السرعة.
        </p>
      </div>

      <div className="mode-grid">
        <button className="mode-btn mode-sp" onClick={() => onPick("sp")}>
          <div className="mode-icon">🎯</div>
          <div className="mode-title">لاعب واحد</div>
          <div className="mode-desc">تحدَّ نفسك</div>
        </button>
        <button className="mode-btn mode-create" onClick={() => onPick("create")}>
          <div className="mode-icon">👑</div>
          <div className="mode-title">إنشاء غرفة</div>
          <div className="mode-desc">ادعُ الأصدقاء</div>
        </button>
        <button className="mode-btn mode-join" onClick={() => onPick("join")}>
          <div className="mode-icon">🚪</div>
          <div className="mode-title">انضم بغرفة</div>
          <div className="mode-desc">باستخدام رمز</div>
        </button>
      </div>

      {hi > 0 && (
        <div style={{ textAlign: "center", color: "var(--c-ink-soft)", fontWeight: 700, fontSize: 14 }}>
          أعلى نتيجة لك (لاعب واحد): <span style={{ color: "var(--c-pink)" }}>{hi}</span>
        </div>
      )}
    </div>
  );
}

// ===== Setup (name + avatar) — used for both SP and MP =====
function SetupCard({ title, subtitle, name, setName, avatar, setAvatar, extra, primaryLabel, onPrimary, onCancel, busy, error, primaryDisabled }) {
  return (
    <div className="home">
      <div className="home-hero">
        <span className="home-eyebrow">{subtitle}</span>
        <h1 className="home-title">
          <span className="word w1">{title.split(" ")[0]}</span>{" "}
          <span className="word w2">{title.split(" ").slice(1).join(" ")}</span>
        </h1>
      </div>

      <div className="home-card">
        {extra}
        <div className="section-label">اختر اسمك</div>
        <input
          className="name-input"
          placeholder="مثال: لينا"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 18))}
          maxLength={18}
        />

        <div className="section-label" style={{ marginTop: 24 }}>اختر شخصيتك</div>
        <div className="avatar-grid">
          {AVATARS.map((a) => (
            <button
              key={a.id}
              className={`avatar-tile ${avatar === a.id ? "is-selected" : ""}`}
              onClick={() => setAvatar(a.id)}
              title={a.name}
              aria-label={a.name}
            >
              {a.emoji}
            </button>
          ))}
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="result-actions" style={{ marginTop: 22 }}>
          <button className="btn btn-secondary" onClick={onCancel}>← رجوع</button>
          <button
            className="btn btn-primary"
            disabled={busy || primaryDisabled || !name.trim() || avatar === null}
            onClick={onPrimary}
          >
            {busy ? "..." : primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== المؤقت الدائري =====
function TimerRing({ remaining, total }) {
  const pct = remaining / total;
  const r = 30;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  const isLow = remaining <= 10;
  const isCritical = remaining <= 5;
  return (
    <div className="timer-ring-wrap">
      <div className={`timer-ring ${isCritical ? "is-critical" : isLow ? "is-low" : ""}`}>
        <svg width="68" height="68">
          <circle cx="34" cy="34" r={r} fill="none" stroke="var(--c-bg-2)" strokeWidth="6" />
          <circle
            cx="34" cy="34" r={r}
            fill="none"
            stroke={isCritical ? "var(--c-ink)" : "var(--c-purple)"}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <span className="num">{remaining}</span>
      </div>
    </div>
  );
}

function Heart({ lost }) {
  return (
    <svg className={`heart ${lost ? "lost" : ""}`} viewBox="0 0 24 24">
      <path d="M12 21s-7-4.5-9.5-9C0.5 8 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4 4.5 8C19 16.5 12 21 12 21z"
        fill={lost ? "var(--c-ink-soft)" : "var(--c-pink)"} stroke="var(--c-ink)" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

// ===== Single-Player Quiz =====
function QuestionScreen({ player, qIndex, total, question, score, lives, streak, timer, onAnswer, locked, lastPick }) {
  const colors = ["p", "y", "t", "u"];
  const letters = ["أ", "ب", "ج", "د"];
  return (
    <div className="quiz">
      <div className="quiz-hud">
        <div className="hud-pill hud-score">
          <span className="ico">⭐</span>
          <span className="num">{score}</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${((qIndex) / total) * 100}%` }}></div>
        </div>
        <div className="hud-pill hud-lives" aria-label={`أرواح متبقية ${lives}`}>
          {[0,1,2].map(i => <Heart key={i} lost={i >= lives} />)}
        </div>
      </div>

      <div className="player-strip">
        <div className="av">{AVATARS[player.avatar].emoji}</div>
        <div className="name">{player.name}</div>
        {streak >= 2 && <div className="streak">سلسلة ×{streak}</div>}
      </div>

      <div className="question-card">
        <TimerRing remaining={timer} total={15} />
        <div className="q-meta" style={{ marginTop: 8, paddingRight: 96 }}>
          <span className="cat-tag">📚 {question.category}</span>
          <span className="q-num">سؤال {qIndex + 1} / {total}</span>
        </div>
        <div className="q-text">{question.question}</div>
        <div className="options-grid">
          {question.options.map((opt, i) => {
            let cls = "option-btn";
            if (locked) {
              if (i === question.correct) cls += " is-correct";
              else if (i === lastPick) cls += " is-wrong";
              else cls += " is-faded";
            }
            return (
              <button key={i} className={cls} data-color={colors[i]} onClick={() => onAnswer(i)} disabled={locked}>
                <span className="option-letter">{letters[i]}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ResultScreen({ correct, gained, timeBonus, totalScore, isLast, onNext, lives, correctAnswerText }) {
  const fact = correct
    ? ["رهيب! 🎉", "ممتاز!", "أحسنت!", "بطل/ة!"][Math.floor(Math.random()*4)]
    : ["للأسف خاطئ", "حاول مرة أخرى", "لا بأس!", "قريب جدًا"][Math.floor(Math.random()*4)];
  return (
    <div className={`result ${correct ? "result-correct" : "result-wrong"}`}>
      <div className="result-card">
        <div className="result-emoji">{correct ? "🎉" : (lives === 0 ? "💔" : "😅")}</div>
        <h2 className="result-headline">{fact}</h2>
        <p className="result-body">
          {correct
            ? <>الإجابة <b>صحيحة</b>. كلما أسرعت كلما زادت نقاطك!</>
            : <>الإجابة الصحيحة كانت: <b>{correctAnswerText}</b></>}
        </p>
        <div className="points-row">
          <div className="points-cell gain"><div className="lbl">نقاط السؤال</div><div className="val">+{gained}</div></div>
          <div className="points-cell time"><div className="lbl">مكافأة السرعة</div><div className="val">+{timeBonus}</div></div>
          <div className="points-cell total"><div className="lbl">المجموع</div><div className="val">{totalScore}</div></div>
        </div>
        <div className="result-actions">
          <button className="btn btn-primary" onClick={onNext}>
            {isLast || lives === 0 ? "النتيجة النهائية ←" : "السؤال التالي ←"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EndScreen({ player, score, correctCount, total, onPlayAgain, onLeaderboard }) {
  const pct = total > 0 ? (correctCount / total) * 100 : 0;
  const tier = pct >= 80 ? { emoji: "🏆", title: "أسطورة المعلومات!", c: "var(--c-yellow)" }
    : pct >= 50 ? { emoji: "⭐", title: "أداء رائع!", c: "var(--c-pink)" }
    : { emoji: "💪", title: "محاولة جيدة", c: "var(--c-teal)" };
  return (
    <div className="end-state">
      <div className="result-card" style={{ background: tier.c }}>
        <div className="result-emoji">{tier.emoji}</div>
        <h1 className="end-headline">{tier.title}</h1>
        <p className="result-body" style={{ color: "var(--c-ink)" }}>
          أجبت بشكل صحيح على <b>{correctCount}</b> من <b>{total}</b> أسئلة
        </p>
        <div className="end-tags">
          <div className="end-tag">⭐ {score} نقطة</div>
          <div className="end-tag">{AVATARS[player.avatar].emoji} {player.name}</div>
          <div className="end-tag">📊 {Math.round(pct)}%</div>
        </div>
        <div className="result-actions" style={{ marginTop: 18 }}>
          <button className="btn btn-secondary" onClick={onPlayAgain}>↻ إعادة اللعب</button>
          <button className="btn btn-primary" onClick={onLeaderboard}>لوحة المتصدرين 🏅</button>
        </div>
      </div>
    </div>
  );
}

function Leaderboard({ player, score, onBack }) {
  const all = useMemo(() => {
    const me = score > 0 && player.avatar !== null
      ? [{ name: player.name + " (أنت)", avatar: player.avatar, score, isSelf: true, streak: 0 }]
      : [];
    return [...LEADERBOARD_SEED, ...me].sort((a, b) => b.score - a.score);
  }, [player, score]);
  const top3 = all.slice(0, 3);
  const rest = all.slice(3);
  return (
    <div className="lb">
      <div className="home-hero">
        <span className="home-eyebrow">🏅 الأبطال</span>
        <h1 className="home-title" style={{ fontSize: "clamp(40px,7vw,72px)" }}>
          <span className="word w1">لوحة</span> <span className="word w2">المتصدّرين</span>
        </h1>
      </div>
      {top3.length >= 3 && (
        <div className="lb-podium">
          <div className="podium-cell silver"><div className="rank">2</div><div className="podium-av">{AVATARS[top3[1].avatar].emoji}</div><div className="podium-name">{top3[1].name}</div><div className="podium-score">{top3[1].score}</div></div>
          <div className="podium-cell gold"><div className="rank">1</div><div className="podium-av">{AVATARS[top3[0].avatar].emoji}</div><div className="podium-name">{top3[0].name}</div><div className="podium-score">{top3[0].score}</div></div>
          <div className="podium-cell bronze"><div className="rank">3</div><div className="podium-av">{AVATARS[top3[2].avatar].emoji}</div><div className="podium-name">{top3[2].name}</div><div className="podium-score">{top3[2].score}</div></div>
        </div>
      )}
      <div className="lb-list">
        {rest.map((row, i) => (
          <div key={i} className={`lb-row ${row.isSelf ? "is-self" : ""}`}>
            <div className="lb-rank">#{i + 4}</div>
            <div className="lb-av">{AVATARS[row.avatar].emoji}</div>
            <div>
              <div className="lb-name">{row.name}</div>
              {row.streak > 0 && <div className="lb-streak">🔥 سلسلة {row.streak}</div>}
            </div>
            <div></div>
            <div className="lb-score">{row.score}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button className="btn btn-yellow" style={{ flex: "0 0 auto", padding: "16px 36px" }} onClick={onBack}>← رجوع</button>
      </div>
    </div>
  );
}

function Confetti({ active }) {
  if (!active) return null;
  const pieces = Array.from({ length: 36 });
  const colors = ["var(--c-pink)", "var(--c-yellow)", "var(--c-teal)", "var(--c-purple)", "var(--c-green)"];
  return (
    <>
      {pieces.map((_, i) => (
        <span key={i} className="confetti-piece" style={{
          left: `${Math.random() * 100}%`,
          background: colors[i % colors.length],
          border: "2px solid var(--c-ink)",
          animationDelay: `${Math.random() * 0.4}s`,
          animationDuration: `${1.4 + Math.random() * 0.8}s`,
          transform: `rotate(${Math.random() * 360}deg)`,
          borderRadius: i % 3 === 0 ? "50%" : "2px",
        }} />
      ))}
    </>
  );
}

// ===== Single Player flow (unchanged from original) =====
function SinglePlayerGame({ onExit, hi, setHi }) {
  const [screen, setScreen] = useState("setup");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timer, setTimer] = useState(15);
  const [locked, setLocked] = useState(false);
  const [lastPick, setLastPick] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    if (screen !== "quiz" || locked) return;
    if (timer <= 0) { handleAnswer(-1); return; }
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [screen, timer, locked]);

  function startGame() {
    setQuestions(buildQuizPool(8));
    setQIndex(0); setScore(0); setLives(3); setStreak(0); setCorrectCount(0);
    setTimer(15); setLocked(false); setLastPick(null);
    setScreen("quiz");
  }

  function handleAnswer(pickIdx) {
    if (locked) return;
    const q = questions[qIndex];
    const correct = pickIdx === q.correct;
    const timeBonus = correct ? Math.max(0, timer * 10) : 0;
    const base = correct ? 50 : 0;
    const streakBonus = correct && streak >= 1 ? streak * 20 : 0;
    const gained = base + streakBonus;
    const totalGained = gained + timeBonus;

    setLocked(true);
    setLastPick(pickIdx);
    if (correct) {
      setScore((s) => s + totalGained);
      setStreak((s) => s + 1);
      setCorrectCount((c) => c + 1);
    } else {
      setLives((l) => l - 1);
      setStreak(0);
    }
    setLastResult({ correct, gained, timeBonus, totalScore: score + (correct ? totalGained : 0) });
    setTimeout(() => setScreen("result"), 900);
  }

  function nextQuestion() {
    const isLast = qIndex >= questions.length - 1;
    if (isLast || lives <= 0) {
      if (score > hi) { setHi(score); localStorage.setItem("trivia_hi", String(score)); }
      setScreen("end");
    } else {
      setQIndex((i) => i + 1);
      setTimer(15); setLocked(false); setLastPick(null);
      setScreen("quiz");
    }
  }

  const player = { name, avatar };
  const showConfetti = screen === "result" && lastResult?.correct;

  return (
    <>
      {screen === "setup" && (
        <SetupCard
          subtitle="🎯 لاعب واحد"
          title="ابدأ التحدي"
          name={name} setName={setName}
          avatar={avatar} setAvatar={setAvatar}
          primaryLabel="🚀 ابدأ التحدّي"
          onPrimary={startGame}
          onCancel={onExit}
        />
      )}
      {screen === "quiz" && questions[qIndex] && (
        <QuestionScreen
          player={player} qIndex={qIndex} total={questions.length}
          question={questions[qIndex]} score={score} lives={lives} streak={streak}
          timer={timer} onAnswer={handleAnswer} locked={locked} lastPick={lastPick}
        />
      )}
      {screen === "result" && lastResult && (
        <ResultScreen
          correct={lastResult.correct} gained={lastResult.gained}
          timeBonus={lastResult.timeBonus} totalScore={lastResult.totalScore}
          isLast={qIndex >= questions.length - 1} lives={lives}
          correctAnswerText={questions[qIndex]?.options[questions[qIndex].correct]}
          onNext={nextQuestion}
        />
      )}
      {screen === "end" && (
        <EndScreen
          player={player} score={score} correctCount={correctCount}
          total={questions.length}
          onPlayAgain={startGame}
          onLeaderboard={() => setScreen("leaderboard")}
        />
      )}
      {screen === "leaderboard" && (
        <Leaderboard player={player} score={score} onBack={onExit} />
      )}
      <Confetti active={showConfetti} />
    </>
  );
}

// ===== Multiplayer setup (create/join) =====
function MPSetup({ mode, onSuccess, onCancel }) {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!name.trim() || avatar === null) return;
    if (mode === "join" && code.trim().length !== 4) {
      setError("رمز الغرفة 4 أحرف");
      return;
    }
    setBusy(true); setError("");
    try {
      const r = mode === "create"
        ? await window.MP.createRoom({ name: name.trim(), avatar })
        : await window.MP.joinRoom(code, { name: name.trim(), avatar });
      onSuccess(r.code, r.playerId);
    } catch (e) {
      setError(e.message || "حدث خطأ");
      setBusy(false);
    }
  }

  return (
    <SetupCard
      subtitle={mode === "create" ? "👑 إنشاء غرفة" : "🚪 انضم بغرفة"}
      title={mode === "create" ? "غرفة جديدة" : "ادخل الغرفة"}
      name={name} setName={setName}
      avatar={avatar} setAvatar={setAvatar}
      extra={mode === "join" && (
        <>
          <div className="section-label">رمز الغرفة</div>
          <input
            className="name-input code-input"
            placeholder="ABCD"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4))}
            maxLength={4}
          />
          <div style={{ height: 18 }} />
        </>
      )}
      primaryLabel={mode === "create" ? "أنشئ الغرفة" : "انضم"}
      onPrimary={submit}
      onCancel={onCancel}
      busy={busy}
      error={error}
      primaryDisabled={mode === "join" && code.length !== 4}
    />
  );
}

// ===== Multiplayer Lobby =====
function Lobby({ room, code, playerId, onLeave }) {
  const me = room.players?.[playerId];
  if (!me) return null;
  const isHost = !!me.isHost;
  const players = Object.entries(room.players || {})
    .map(([id, p]) => ({ ...p, id }))
    .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
  const [copied, setCopied] = useState(false);

  function copyCode() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }
  }

  async function handleStart() {
    if (!isHost) return;
    const pool = buildQuizPool(window.MP.TOTAL_QUESTIONS);
    await window.MP.startRoom(code, pool);
  }

  return (
    <div className="home">
      <div className="home-hero">
        <span className="home-eyebrow">🎮 غرفة اللعب</span>
        <h1 className="home-title" style={{ fontSize: "clamp(48px, 11vw, 96px)" }}>
          <span className="word w1">رمز</span> <span className="word w2">{code}</span>
        </h1>
        <button className="nav-pill" onClick={copyCode}>{copied ? "✓ نُسخ" : "📋 نسخ الرمز"}</button>
      </div>
      <div className="home-card">
        <div className="section-label">اللاعبون ({players.length})</div>
        <div className="lobby-players">
          {players.map((p) => (
            <div key={p.id} className={`lobby-player ${p.id === playerId ? "is-self" : ""}`}>
              <div className="lobby-av">{AVATARS[p.avatar].emoji}</div>
              <div className="lobby-info">
                <div className="lobby-name">{p.name}{p.id === playerId ? " (أنت)" : ""}</div>
                {p.isHost && <div className="lobby-host">👑 مضيف</div>}
              </div>
            </div>
          ))}
        </div>
        {isHost ? (
          <button className="start-btn" style={{ marginTop: 18 }} onClick={handleStart}>
            🚀 ابدأ اللعبة
          </button>
        ) : (
          <div className="lobby-waiting">في انتظار المضيف لبدء اللعبة...</div>
        )}
        <button className="btn btn-secondary" style={{ marginTop: 12, width: "100%" }} onClick={onLeave}>← مغادرة الغرفة</button>
      </div>
    </div>
  );
}

// ===== Live scoreboard during MP game =====
function MPLiveBoard({ players, myId }) {
  return (
    <div className="mp-board">
      {players.map((p, i) => (
        <div key={p.id} className={`mp-board-row ${p.id === myId ? "is-self" : ""}`}>
          <div className="mp-board-rank">#{i + 1}</div>
          <div className="mp-board-av">{AVATARS[p.avatar].emoji}</div>
          <div className="mp-board-name">{p.name}{p.id === myId ? " (أنت)" : ""}</div>
          <div className="mp-board-score">{p.score || 0}</div>
        </div>
      ))}
    </div>
  );
}

// ===== Multiplayer Game (synced quiz) =====
function MPGame({ room, code, playerId, onLeave }) {
  const me = room.players[playerId];
  const startedAt = room.meta.startedAt;
  const questions = room.questions || [];
  const total = questions.length || window.MP.TOTAL_QUESTIONS;
  const Q_DUR = window.MP.QUESTION_DURATION_MS;
  const ROUND = window.MP.ROUND_DURATION_MS;

  const [now, setNow] = useState(window.serverNow());
  useEffect(() => {
    const t = setInterval(() => setNow(window.serverNow()), 250);
    return () => clearInterval(t);
  }, []);

  const elapsed = startedAt ? Math.max(0, now - startedAt) : 0;
  const qIndex = Math.floor(elapsed / ROUND);
  const inRound = elapsed % ROUND;
  const phase = inRound < Q_DUR ? "question" : "result";
  const timer = phase === "question" ? Math.max(0, Math.ceil((Q_DUR - inRound) / 1000)) : 0;

  // Host transitions room to "finished" when game's over.
  useEffect(() => {
    if (qIndex >= total && me.isHost && room.meta.state === "playing") {
      window.MP.endRoom(code).catch(() => {});
    }
  }, [qIndex, total, me.isHost, room.meta.state, code]);

  if (qIndex >= total) {
    return (
      <div className="home">
        <div className="home-hero"><h2 className="home-title" style={{fontSize:"clamp(32px,5vw,48px)"}}>احتساب النتائج...</h2></div>
      </div>
    );
  }

  const question = questions[qIndex];
  const myAnswer = me.answers?.[qIndex];

  async function handleAnswer(pickIdx) {
    if (myAnswer) return;
    if (phase !== "question") return;
    const correct = pickIdx === question.correct;
    const timeBonus = correct ? Math.max(0, timer * 10) : 0;
    const base = correct ? 50 : 0;
    const myStreak = me.streak || 0;
    const streakBonus = correct && myStreak >= 1 ? myStreak * 20 : 0;
    const gained = base + streakBonus;
    const newStreak = correct ? myStreak + 1 : 0;
    const newScore = (me.score || 0) + gained + timeBonus;
    const newCorrect = (me.correctCount || 0) + (correct ? 1 : 0);
    try {
      await window.MP.submitAnswer(code, playerId, qIndex, {
        pickIdx, correct, gained, timeBonus,
        score: newScore, correctCount: newCorrect, streak: newStreak,
      });
    } catch (e) {
      console.error("submitAnswer failed", e);
    }
  }

  const colors = ["p", "y", "t", "u"];
  const letters = ["أ", "ب", "ج", "د"];
  const players = Object.entries(room.players || {})
    .map(([id, p]) => ({ ...p, id }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="quiz">
      <div className="quiz-hud">
        <div className="hud-pill hud-score">
          <span className="ico">⭐</span>
          <span className="num">{me.score || 0}</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${(qIndex / total) * 100}%` }}></div>
        </div>
        <div className="hud-pill" title="رمز الغرفة"><span className="ico">🎮</span><span style={{fontFamily:"Cairo", fontWeight:900}}>{code}</span></div>
      </div>

      <MPLiveBoard players={players} myId={playerId} />

      <div className="question-card">
        <TimerRing remaining={timer} total={15} />
        <div className="q-meta" style={{ marginTop: 8, paddingRight: 96 }}>
          <span className="cat-tag">📚 {question.category}</span>
          <span className="q-num">سؤال {qIndex + 1} / {total}</span>
        </div>
        <div className="q-text">{question.question}</div>
        <div className="options-grid">
          {question.options.map((opt, i) => {
            let cls = "option-btn";
            if (phase === "result") {
              if (i === question.correct) cls += " is-correct";
              else if (myAnswer && i === myAnswer.pickIdx && !myAnswer.correct) cls += " is-wrong";
              else cls += " is-faded";
            } else if (myAnswer && myAnswer.pickIdx === i) {
              cls += " is-correct";
            }
            return (
              <button key={i} className={cls} data-color={colors[i]}
                onClick={() => handleAnswer(i)}
                disabled={phase !== "question" || !!myAnswer}>
                <span className="option-letter">{letters[i]}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
        {phase === "result" && (
          <div className="mp-result-banner">
            {myAnswer?.correct ? <>🎉 صحيح! +{(myAnswer.gained || 0) + (myAnswer.timeBonus || 0)} نقطة</>
              : myAnswer ? <>❌ خاطئ. الإجابة: {question.options[question.correct]}</>
              : <>⏰ انتهى الوقت. الإجابة: {question.options[question.correct]}</>}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Multiplayer End =====
function MPEnd({ room, code, playerId, onLeave }) {
  const players = Object.entries(room.players || {})
    .map(([id, p]) => ({ ...p, id }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));
  const top3 = players.slice(0, 3);
  const rest = players.slice(3);
  const myRank = players.findIndex((p) => p.id === playerId) + 1;
  const myMedal = myRank === 1 ? "🥇" : myRank === 2 ? "🥈" : myRank === 3 ? "🥉" : "🎖️";

  return (
    <div className="lb">
      <div className="home-hero">
        <span className="home-eyebrow">🏆 النتائج النهائية</span>
        <h1 className="home-title" style={{ fontSize: "clamp(40px,7vw,72px)" }}>
          <span className="word w1">{myMedal}</span>{" "}
          <span className="word w2">المركز {myRank}</span>
        </h1>
      </div>

      {top3.length >= 3 && (
        <div className="lb-podium">
          <div className="podium-cell silver">
            <div className="rank">2</div>
            <div className="podium-av">{AVATARS[top3[1].avatar].emoji}</div>
            <div className="podium-name">{top3[1].name}</div>
            <div className="podium-score">{top3[1].score || 0}</div>
          </div>
          <div className="podium-cell gold">
            <div className="rank">1</div>
            <div className="podium-av">{AVATARS[top3[0].avatar].emoji}</div>
            <div className="podium-name">{top3[0].name}</div>
            <div className="podium-score">{top3[0].score || 0}</div>
          </div>
          <div className="podium-cell bronze">
            <div className="rank">3</div>
            <div className="podium-av">{AVATARS[top3[2].avatar].emoji}</div>
            <div className="podium-name">{top3[2].name}</div>
            <div className="podium-score">{top3[2].score || 0}</div>
          </div>
        </div>
      )}

      {top3.length > 0 && top3.length < 3 && (
        <div className="lb-list">
          {top3.map((p, i) => (
            <div key={p.id} className={`lb-row ${p.id === playerId ? "is-self" : ""}`}>
              <div className="lb-rank">#{i + 1}</div>
              <div className="lb-av">{AVATARS[p.avatar].emoji}</div>
              <div><div className="lb-name">{p.name}</div></div>
              <div></div>
              <div className="lb-score">{p.score || 0}</div>
            </div>
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <div className="lb-list">
          {rest.map((p, i) => (
            <div key={p.id} className={`lb-row ${p.id === playerId ? "is-self" : ""}`}>
              <div className="lb-rank">#{i + 4}</div>
              <div className="lb-av">{AVATARS[p.avatar].emoji}</div>
              <div><div className="lb-name">{p.name}</div></div>
              <div></div>
              <div className="lb-score">{p.score || 0}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button className="btn btn-yellow" style={{ padding: "16px 36px" }} onClick={onLeave}>← الرئيسية</button>
      </div>
    </div>
  );
}

// ===== Multiplayer Room (routes between lobby/game/end) =====
function MultiplayerRoom({ code, playerId, onExit }) {
  const [room, setRoom] = useState(null);

  useEffect(() => {
    const unsub = window.MP.watchRoom(code, (data) => setRoom(data));
    return unsub;
  }, [code]);

  // Also try to remove player on tab close.
  useEffect(() => {
    const handler = () => { try { window.MP.leaveRoom(code, playerId); } catch {} };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [code, playerId]);

  async function leave() {
    try { await window.MP.leaveRoom(code, playerId); } catch {}
    onExit();
  }

  if (!room) {
    return (
      <div className="home">
        <div className="home-hero">
          <h2 className="home-title" style={{ fontSize: "clamp(32px,5vw,48px)" }}>جارٍ الاتصال...</h2>
        </div>
      </div>
    );
  }

  const me = room.players?.[playerId];
  if (!me) {
    return (
      <div className="home">
        <div className="home-card" style={{ textAlign: "center" }}>
          <h2 style={{ marginBottom: 12 }}>تمت إزالتك من الغرفة</h2>
          <button className="btn btn-primary" onClick={onExit}>← الرئيسية</button>
        </div>
      </div>
    );
  }

  const state = room.meta?.state || "lobby";

  if (state === "lobby") return <Lobby room={room} code={code} playerId={playerId} onLeave={leave} />;
  if (state === "playing") return <MPGame room={room} code={code} playerId={playerId} onLeave={leave} />;
  if (state === "finished") return <MPEnd room={room} code={code} playerId={playerId} onLeave={leave} />;
  return null;
}

// ===== App root =====
function App() {
  const [tweaks, setTweak] = window.useTweaks({ theme: "light" });
  const [route, setRoute] = useState({ name: "home" });
  const [hi, setHi] = useState(() => Number(localStorage.getItem("trivia_hi") || 0));
  const [questionCount, setQuestionCount] = useState((window.QUESTIONS_BANK || []).length);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tweaks.theme);
  }, [tweaks.theme]);

  useEffect(() => {
    if (typeof window.loadQuestions === "function") {
      window.loadQuestions().then((n) => setQuestionCount(n));
    }
  }, []);

  function pickMode(mode) {
    if (mode === "sp") setRoute({ name: "sp" });
    else if (mode === "create") setRoute({ name: "mp-create" });
    else if (mode === "join") setRoute({ name: "mp-join" });
  }

  const goHome = () => setRoute({ name: "home" });

  return (
    <>
      <BgDecor />
      <TopBar
        theme={tweaks.theme}
        onToggleTheme={() => setTweak("theme", tweaks.theme === "dark" ? "light" : "dark")}
        screen={route.name}
        onHome={goHome}
      />
      <div className="app-shell">
        {route.name === "home" && <HomeMenu onPick={pickMode} hi={hi} />}
        {route.name === "sp" && <SinglePlayerGame onExit={goHome} hi={hi} setHi={setHi} />}
        {route.name === "mp-create" && (
          <MPSetup mode="create" onSuccess={(code, playerId) => setRoute({ name: "mp-room", code, playerId })} onCancel={goHome} />
        )}
        {route.name === "mp-join" && (
          <MPSetup mode="join" onSuccess={(code, playerId) => setRoute({ name: "mp-room", code, playerId })} onCancel={goHome} />
        )}
        {route.name === "mp-room" && (
          <MultiplayerRoom code={route.code} playerId={route.playerId} onExit={goHome} />
        )}
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
