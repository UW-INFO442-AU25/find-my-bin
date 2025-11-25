// src/pages/Quiz.jsx

import { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase/config";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  increment,
} from "firebase/firestore";

import "../styles/Quiz.css";
import "../App.css";

/*
  Quiz.jsx
  - Uses new dataset structure: categories -> itemGroups -> items
  - Randomizes conditions (cleanliness, shape) for items with skipConditions=false
  - Evaluates rules in order; first match wins
  - Persists per-question history to users/{uid}/history
  - Lifetime score updated with increment()
*/

const POINT_TIERS = [
  { sec: 5, pts: 100 },
  { sec: 10, pts: 75 },
  { sec: 20, pts: 50 },
  { sec: 30, pts: 25 },
];
const TIER_FALLBACK = 5; // after 30s
const INCORRECT_PENALTY = -10;

// Normalize dataset bin values to app bins: 'recycle' | 'compost' | 'trash'
function normalizeBin(bin) {
  if (!bin) return "trash";
  const b = String(bin).toLowerCase();
  if (b === "landfill") return "trash";
  if (b === "trash" || b === "landfill") return "trash";
  if (b === "recycle" || b === "recycling") return "recycle";
  if (b === "compost") return "compost";
  return b;
}

// Evaluate rules in order; first match wins
function determineBinFromRules(item, cleanliness, shape) {
  // If skipConditions true, use defaultBin (or fallback) immediately
  if (item.skipConditions) {
    return normalizeBin(item.defaultBin || item.default || null);
  }

  // If item has rules array, check each
  const rules = item.rules || [];
  for (const rule of rules) {
    const cond = rule.if || {};
    let match = true;

    if (cond.cleanliness) {
      // exact match required
      if (cleanliness !== cond.cleanliness) match = false;
    }
    if (cond.shape) {
      if (shape !== cond.shape) match = false;
    }

    if (match) {
      return normalizeBin(rule.bin);
    }
  }

  // fallback to explicit defaultBin or 'trash'
  return normalizeBin(item.defaultBin || item.default || null);
}

function pickRandomFrom(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function Quiz() {
  const [items, setItems] = useState([]); // base items (no randomized conditions)
  const [current, setCurrent] = useState(null); // current question (with randomized conditions + correct)
  const [choicesDisabled, setChoicesDisabled] = useState(false);
  const [answerResult, setAnswerResult] = useState("");
  const [score, setScore] = useState(0);
  const [lifetimeScore, setLifetimeScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [pointsNow, setPointsNow] = useState(100);
  const [showProgress, setShowProgress] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState("all");

  const user = auth.currentUser;
  const questionStartRef = useRef(Date.now());
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  // --------------- dataset loader ---------------
  useEffect(() => {
    mountedRef.current = true;
    fetch("src/data/item_dataset.json")
      .then((res) => res.json())
      .then((raw) => {
        const list = [];
        let nextId = 1000;

        if (raw?.categories) {
          for (const cat of raw.categories) {
            for (const group of cat.itemGroups || []) {
              // group may have .items (new format) or .materials (legacy); handle both
              if (group.items) {
                for (const item of group.items) {
                  list.push({
                    id: nextId++,
                    name: item.name,
                    skipConditions: !!item.skipConditions,
                    allowedConditionValues: item.allowedConditionValues || null,
                    rules: item.rules || null,
                    defaultBin: item.defaultBin || item.default || null,
                    tags: item.tags || [],
                    // keep original raw item so rules/allowedConditionValues available later
                    _raw: item,
                  });
                }
              }
              // legacy: materials property (support backwards compatibility)
              if (group.materials) {
                for (const matName of Object.keys(group.materials)) {
                  for (const item of group.materials[matName]) {
                    list.push({
                      id: nextId++,
                      name: item.name,
                      skipConditions: !!item.skipConditions,
                      allowedConditionValues: item.allowedConditionValues || null,
                      rules: item.rules || null,
                      defaultBin: item.defaultBin || item.default || null,
                      tags: item.tags || [],
                      _raw: item,
                    });
                  }
                }
              }
            }
          }
        }

        if (!mountedRef.current) return;
        setItems(list);

        // pick first question and generate randomized conditions for it
        if (list.length > 0) {
          const firstRaw = pickRandomFrom(list);
          const q = generateQuestion(firstRaw);
          setCurrent(q);
          questionStartRef.current = Date.now();
          startCountdown();
        }
      })
      .catch((err) => console.error("Failed to load dataset:", err));

    // cleanup on unmount
    return () => {
      mountedRef.current = false;
      clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------- auth / lifetime ---------------
  useEffect(() => {
    if (!user) {
      setLifetimeScore(0);
      return;
    }
    const docRef = doc(db, "users", user.uid);
    getDoc(docRef).then((snap) => {
      if (snap.exists()) {
        setLifetimeScore(snap.data().lifetimeScore || 0);
      } else {
        setDoc(docRef, {
          displayName: user.displayName || user.email || "Anonymous",
          lifetimeScore: 0,
          createdAt: serverTimestamp(),
        });
        setLifetimeScore(0);
      }
    });
  }, [user]);

  // --------------- leaderboard ---------------
  const loadLeaderboard = async () => {
    try {
      const snaps = await getDocs(collection(db, "users"));
      const scores = snaps.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
      scores.sort((a, b) => (b.lifetimeScore || 0) - (a.lifetimeScore || 0));
      setLeaderboard(scores.slice(0, 10));
    } catch (e) {
      console.error("Failed to load leaderboard", e);
    }
  };
  useEffect(() => {
    loadLeaderboard();
  }, []);

  // --------------- scoring ---------------
  function computePoints(elapsedSec, correct) {
    if (!correct) return INCORRECT_PENALTY;
    for (const tier of POINT_TIERS) {
      if (elapsedSec <= tier.sec) return tier.pts;
    }
    return TIER_FALLBACK;
  }

  // --------------- countdown ---------------
  const startCountdown = () => {
    clearInterval(intervalRef.current);
    questionStartRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - questionStartRef.current) / 1000;
      let points = TIER_FALLBACK;
      if (elapsed <= 5) points = 100;
      else if (elapsed <= 10) points = 75;
      else if (elapsed <= 20) points = 50;
      else if (elapsed <= 30) points = 25;
      else points = TIER_FALLBACK;

      setPointsNow(points);
      setTimeLeft(Math.max(0, 30 - elapsed));
    }, 100);

    return () => clearInterval(intervalRef.current);
  };

  // --------------- generate a full question with randomized conditions ---------------
  function generateQuestion(baseItem) {
    if (!baseItem) return null;

    const item = baseItem; // baseItem includes allowedConditionValues, rules, skipConditions, defaultBin
    let cleanliness = null;
    let shape = null;

    if (!item.skipConditions && item.allowedConditionValues) {
      const cleanList = item.allowedConditionValues.cleanliness || [];
      const shapeList = item.allowedConditionValues.shape || [];
      cleanliness = pickRandomFrom(cleanList);
      shape = pickRandomFrom(shapeList);
    }

    const correct = determineBinFromRules(item._raw || item, cleanliness, shape);

    return {
      id: item.id,
      name: item.name,
      skipConditions: item.skipConditions,
      allowedConditionValues: item.allowedConditionValues,
      rules: item.rules,
      defaultBin: item.defaultBin,
      tags: item.tags,
      cleanliness,
      shape,
      correct,
    };
  }

  // --------------- handle answers ---------------
  const handleAnswer = async (choice) => {
    if (!current) return;
    clearInterval(intervalRef.current);

    // treat 'landfill' as 'trash' for comparison
    const normalize = (s) => (s === "landfill" ? "trash" : (s || "").toLowerCase());
    const isCorrect = normalize(choice) === normalize(current.correct);

    setChoicesDisabled(true);

    const elapsedSec = (Date.now() - questionStartRef.current) / 1000;
    const points = computePoints(elapsedSec, isCorrect);

    if (isCorrect) {
      setAnswerResult(`Correct! +${points} points`);
    } else {
      setAnswerResult(
        `Incorrect — "${current.name}" belongs in ${current.correct === "trash" ? "Trash / Landfill" : current.correct
        } (${INCORRECT_PENALTY} pts)`
      );
    }

    setScore((prev) => prev + points);

    if (user) {
      const userRef = doc(db, "users", user.uid);

      // Ensure user doc exists
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          displayName: user.displayName || user.email || "Anonymous",
          lifetimeScore: 0,
          createdAt: serverTimestamp(),
        });
      }

      // increment lifetime score atomically
      try {
        await updateDoc(userRef, { lifetimeScore: increment(points) });
      } catch (e) {
        // if update fails for some reason, fallback to set
        console.error("increment failed, falling back:", e);
        const currentSnap = await getDoc(userRef);
        const prev = currentSnap.exists() ? currentSnap.data().lifetimeScore || 0 : 0;
        await updateDoc(userRef, { lifetimeScore: prev + points });
      }

      // add history record
      try {
        const historyRef = collection(userRef, "history");
        await addDoc(historyRef, {
          itemId: current.id,
          itemName: current.name,
          cleanliness: current.cleanliness || null,
          shape: current.shape || null,
          chosenBin: choice,
          correctBin: current.correct,
          correct: isCorrect,
          pointsGained: points,
          timestamp: serverTimestamp(),
        });
      } catch (e) {
        console.error("Failed writing history:", e);
      }

      // refresh local lifetime and leaderboard
      const refreshed = await getDoc(userRef);
      if (refreshed.exists()) setLifetimeScore(refreshed.data().lifetimeScore || 0);
      loadLeaderboard();
    } else {
      // guest: store local history in localStorage (optional)
      const local = JSON.parse(localStorage.getItem("trashquiz_local_history") || "[]");
      local.unshift({
        timestamp: Date.now(),
        itemId: current.id,
        itemName: current.name,
        cleanliness: current.cleanliness || null,
        shape: current.shape || null,
        chosenBin: choice,
        correctBin: current.correct,
        correct: isCorrect,
        pointsGained: points,
      });
      localStorage.setItem("trashquiz_local_history", JSON.stringify(local.slice(0, 500)));
    }

    // advance to next question after short delay
    setTimeout(() => {
      const nextRaw = pickRandomFrom(items);
      const nextQ = generateQuestion(nextRaw);
      setCurrent(nextQ);
      questionStartRef.current = Date.now();
      setAnswerResult("");
      setChoicesDisabled(false);
      startCountdown();
    }, 1200);
  };

  // --------------- load user history for modal ---------------
  const loadHistory = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const q = query(collection(userRef, "history"), orderBy("timestamp", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setHistory(list);
    } catch (e) {
      console.error("Failed loading history:", e);
    }
  };

  useEffect(() => {
    if (showProgress) loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showProgress]);

  // --------------- filtered history ---------------
  const filteredHistory = history.filter((h) => {
    if (historyFilter === "all") return true;
    if (historyFilter === "correct") return !!h.correct;
    if (historyFilter === "incorrect") return !h.correct;
    return true;
  });

  // --------------- render ---------------
  if (!current) {
    return <div className="quiz-loading">Loading quiz items...</div>;
  }

  return (
    <div className="quiz-container">
      <h1 className="quiz-title">Trash Sorting Quiz</h1>

      {user ? (
        <>
          <p className="quiz-user">
            Logged in as <strong>{user.displayName || user.email}</strong>
            <br />
            Lifetime Score: <strong>{lifetimeScore}</strong>
          </p>
          <button
            className="progress-button"
            onClick={() => setShowProgress(true)}
          >
            View My Progress
          </button>
        </>
      ) : (
        <p className="quiz-guest">Playing as guest — scores won't save</p>
      )}

      <div className="quiz-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="quiz-item">{current.name}</h2>
          <div style={{ textAlign: "right", fontSize: 14, opacity: 0.9 }}>
            <div>Score: <strong>{score}</strong></div>
            <div>Tier Points: <strong>{pointsNow}</strong></div>
          </div>
        </div>

        {/* show randomized conditions if they exist */}
        {!current.skipConditions && (current.cleanliness || current.shape) && (
          <div className="quiz-subtext" style={{ textAlign: "center", marginBottom: 8 }}>
            <span style={{ marginRight: 12 }}>Cleanliness: <strong>{current.cleanliness}</strong></span>
            <span>Shape: <strong>{current.shape}</strong></span>
          </div>
        )}

        <p className="quiz-subtext">Where should this go?</p>

        {/* POINTS BAR */}
        <div className="points-bar-container" aria-hidden>
          <div className="points-bar" style={{ width: `${Math.max(0, (timeLeft / 30) * 100)}%` }} />
          <div className="points-label">{pointsNow} pts</div>
        </div>

        <div className="quiz-buttons" role="group" aria-label="Choose bin">
          <button
            disabled={choicesDisabled}
            onClick={() => handleAnswer("landfill")}
            className="quiz-button trash"
            title="Trash / Landfill"
          >
            Trash / Landfill
          </button>

          <button
            disabled={choicesDisabled}
            onClick={() => handleAnswer("recycle")}
            className="quiz-button recycle"
            title="Recycle"
          >
            Recycle
          </button>

          <button
            disabled={choicesDisabled}
            onClick={() => handleAnswer("compost")}
            className="quiz-button compost"
            title="Compost"
          >
            Compost
          </button>
        </div>

        {answerResult && <div className="quiz-result" role="status">{answerResult}</div>}
      </div>

      <h2 className="leaderboard-title">Top Recyclers</h2>
      <div className="leaderboard" aria-live="polite">
        {leaderboard.map((u, index) => (
          <div key={u.id} className="leaderboard-row">
            <span>{index + 1}. {u.displayName || u.email}</span>
            <strong>{u.lifetimeScore || 0}</strong>
          </div>
        ))}
      </div>

      <footer className="quiz-tip">
        Tip: When in doubt, check your local city's recycling rules!
      </footer>

      {/* --- Progress Modal --- */}
      {showProgress && (
        <div className="progress-modal" role="dialog" aria-modal="true">
          <div className="progress-content">
            <h2>My Question History</h2>
            <button className="close-button" onClick={() => setShowProgress(false)}>X</button>

            {/* Filter Buttons */}
            <div className="history-filters" style={{ marginBottom: 12 }}>
              <button className={`filter-btn ${historyFilter === 'all' ? 'active' : ''}`} onClick={() => setHistoryFilter('all')}>All</button>
              <button className={`filter-btn ${historyFilter === 'correct' ? 'active' : ''}`} onClick={() => setHistoryFilter('correct')}>Correct ✅</button>
              <button className={`filter-btn ${historyFilter === 'incorrect' ? 'active' : ''}`} onClick={() => setHistoryFilter('incorrect')}>Incorrect ❌</button>
            </div>

            <div className="history-list">
              {filteredHistory.map((h) => (
                <div key={h.id} className={`history-row ${h.correct ? 'correct' : 'incorrect'}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <strong>{h.itemName}</strong>
                      <div style={{ fontSize: 13, opacity: 0.9 }}>
                        {h.cleanliness ? <>Cleanliness: {h.cleanliness} — </> : null}
                        {h.shape ? <>Shape: {h.shape}</> : null}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div>Chosen: {h.chosenBin}</div>
                      <div>Correct: {h.correctBin}</div>
                      <div>Points: {h.pointsGained} {h.correct ? '✅' : '❌'}</div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredHistory.length === 0 && <p>No history to show.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
