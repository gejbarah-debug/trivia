/* global React, ReactDOM */
const { useState, useEffect, useMemo, useRef } = React;

const QUESTIONS_BANK = window.QUESTIONS_BANK;
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
function TopBar({ theme, onToggleTheme, screen, onNav }) {
  return (
    <div className="top-bar">
      <div className="brand">
        <span className="brand-mark">🎯</span>
        <span>لعبة المعلومات</span>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {screen !== "home" && (
          <button className="theme-toggle" onClick={() => onNav("home")} title="الرئيسية" aria-label="الرئيسية">🏠</button>
        )}
        <button className="theme-toggle" onClick={onToggleTheme} aria-label="تبديل الثيم">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </div>
  );
}

// ===== شاشة البداية =====
function HomeScreen({ name, setName, avatar, setAvatar, onStart, onNav, hi }) {
  return (
    <div className="home">
      <div className="home-hero">
        <span className="home-eyebrow">⚡ تحدّي عائلي</span>
        <h1 className="home-title">
          <span className="word w1">لعبة</span>{" "}
          <span className="word w2">المعلومات</span>
        </h1>
        <p className="home-subtitle">
          ٨ أسئلة في فن وثقافة، علوم وجغرافيا. ٣٠ ثانية للسؤال، ٣ أرواح، وكلما كنت أسرع كلما زادت نقاطك.
        </p>
      </div>

      <div className="home-card">
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

        <div className="home-footer-row" style={{ marginTop: 24 }}>
          <div className="stat-pill p1"><div className="num">8</div><div className="lbl">أسئلة</div></div>
          <div className="stat-pill p2"><div className="num">30s</div><div className="lbl">لكل سؤال</div></div>
          <div className="stat-pill p3"><div className="num">3</div><div className="lbl">أرواح</div></div>
        </div>

        <button
          className="start-btn"
          style={{ marginTop: 22 }}
          disabled={!name.trim() || avatar === null}
          onClick={onStart}
        >
          🚀 ابدأ التحدّي
        </button>
      </div>

      <div className="home-nav">
        <button className="nav-pill is-active" onClick={() => onNav("home")}>
          <span className="dot" style={{ background: "var(--c-pink)" }}></span>
          البداية
        </button>
        <button className="nav-pill" onClick={() => onNav("leaderboard")}>
          <span className="dot" style={{ background: "var(--c-purple)" }}></span>
          لوحة المتصدرين
        </button>
      </div>
      {hi > 0 && <div style={{ textAlign: "center", color: "var(--c-ink-soft)", fontWeight: 700, fontSize: 14 }}>أعلى نتيجة لك: <span style={{ color: "var(--c-pink)" }}>{hi}</span></div>}
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

// ===== أيقونة قلب =====
function Heart({ lost }) {
  return (
    <svg className={`heart ${lost ? "lost" : ""}`} viewBox="0 0 24 24">
      <path d="M12 21s-7-4.5-9.5-9C0.5 8 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4 4.5 8C19 16.5 12 21 12 21z"
        fill={lost ? "var(--c-ink-soft)" : "var(--c-pink)"} stroke="var(--c-ink)" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

// ===== شاشة السؤال =====
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
        <TimerRing remaining={timer} total={30} />
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
              <button
                key={i}
                className={cls}
                data-color={colors[i]}
                onClick={() => onAnswer(i)}
                disabled={locked}
              >
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

// ===== شاشة النتيجة بعد كل سؤال =====
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
            : <>الإجابة الصحيحة كانت: <b>{correctAnswerText}</b></>
          }
        </p>
        <div className="points-row">
          <div className="points-cell gain">
            <div className="lbl">نقاط السؤال</div>
            <div className="val">+{gained}</div>
          </div>
          <div className="points-cell time">
            <div className="lbl">مكافأة السرعة</div>
            <div className="val">+{timeBonus}</div>
          </div>
          <div className="points-cell total">
            <div className="lbl">المجموع</div>
            <div className="val">{totalScore}</div>
          </div>
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

// ===== شاشة النهاية =====
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

// ===== لوحة المتصدرين =====
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
          <div className="podium-cell silver">
            <div className="rank">2</div>
            <div className="podium-av">{AVATARS[top3[1].avatar].emoji}</div>
            <div className="podium-name">{top3[1].name}</div>
            <div className="podium-score">{top3[1].score}</div>
          </div>
          <div className="podium-cell gold">
            <div className="rank">1</div>
            <div className="podium-av">{AVATARS[top3[0].avatar].emoji}</div>
            <div className="podium-name">{top3[0].name}</div>
            <div className="podium-score">{top3[0].score}</div>
          </div>
          <div className="podium-cell bronze">
            <div className="rank">3</div>
            <div className="podium-av">{AVATARS[top3[2].avatar].emoji}</div>
            <div className="podium-name">{top3[2].name}</div>
            <div className="podium-score">{top3[2].score}</div>
          </div>
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
        <button className="btn btn-yellow" style={{ flex: "0 0 auto", padding: "16px 36px" }} onClick={onBack}>
          ← رجوع
        </button>
      </div>
    </div>
  );
}

// ===== Confetti =====
function Confetti({ active }) {
  if (!active) return null;
  const pieces = Array.from({ length: 36 });
  const colors = ["var(--c-pink)", "var(--c-yellow)", "var(--c-teal)", "var(--c-purple)", "var(--c-green)"];
  return (
    <>
      {pieces.map((_, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            background: colors[i % colors.length],
            border: "2px solid var(--c-ink)",
            animationDelay: `${Math.random() * 0.4}s`,
            animationDuration: `${1.4 + Math.random() * 0.8}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
            borderRadius: i % 3 === 0 ? "50%" : "2px",
          }}
        />
      ))}
    </>
  );
}

// ===== التطبيق الرئيسي =====
function App() {
  const [tweaks, setTweak] = window.useTweaks({ theme: "light" });

  const [screen, setScreen] = useState("home");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timer, setTimer] = useState(30);
  const [locked, setLocked] = useState(false);
  const [lastPick, setLastPick] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [hi, setHi] = useState(() => Number(localStorage.getItem("trivia_hi") || 0));

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tweaks.theme);
  }, [tweaks.theme]);

  useEffect(() => {
    if (screen !== "quiz" || locked) return;
    if (timer <= 0) {
      handleAnswer(-1);
      return;
    }
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [screen, timer, locked]);

  function startGame() {
    const pool = shuffle(QUESTIONS_BANK).slice(0, 8).map(q => ({
      ...q,
      ...(() => {
        const idxs = shuffle([0,1,2,3]);
        return {
          options: idxs.map(i => q.options[i]),
          correct: idxs.indexOf(q.correct),
        };
      })(),
    }));
    setQuestions(pool);
    setQIndex(0);
    setScore(0);
    setLives(3);
    setStreak(0);
    setCorrectCount(0);
    setTimer(30);
    setLocked(false);
    setLastPick(null);
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
      if (score > hi) {
        setHi(score);
        localStorage.setItem("trivia_hi", String(score));
      }
      setScreen("end");
    } else {
      setQIndex((i) => i + 1);
      setTimer(30);
      setLocked(false);
      setLastPick(null);
      setScreen("quiz");
    }
  }

  const player = { name, avatar };
  const showConfetti = screen === "result" && lastResult?.correct;

  return (
    <>
      <BgDecor />
      <TopBar
        theme={tweaks.theme}
        onToggleTheme={() => setTweak("theme", tweaks.theme === "dark" ? "light" : "dark")}
        screen={screen}
        onNav={(s) => setScreen(s)}
      />
      <div className="app-shell">
        {screen === "home" && (
          <HomeScreen
            name={name} setName={setName}
            avatar={avatar} setAvatar={setAvatar}
            onStart={startGame}
            onNav={setScreen}
            hi={hi}
          />
        )}
        {screen === "quiz" && questions[qIndex] && (
          <QuestionScreen
            player={player}
            qIndex={qIndex}
            total={questions.length}
            question={questions[qIndex]}
            score={score}
            lives={lives}
            streak={streak}
            timer={timer}
            onAnswer={handleAnswer}
            locked={locked}
            lastPick={lastPick}
          />
        )}
        {screen === "result" && lastResult && (
          <ResultScreen
            correct={lastResult.correct}
            gained={lastResult.gained}
            timeBonus={lastResult.timeBonus}
            totalScore={lastResult.totalScore}
            isLast={qIndex >= questions.length - 1}
            lives={lives}
            correctAnswerText={questions[qIndex]?.options[questions[qIndex].correct]}
            onNext={nextQuestion}
          />
        )}
        {screen === "end" && (
          <EndScreen
            player={player}
            score={score}
            correctCount={correctCount}
            total={questions.length}
            onPlayAgain={startGame}
            onLeaderboard={() => setScreen("leaderboard")}
          />
        )}
        {screen === "leaderboard" && (
          <Leaderboard
            player={player}
            score={score}
            onBack={() => setScreen("home")}
          />
        )}
      </div>
      <Confetti active={showConfetti} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
