// Room-based multiplayer helpers built on Firebase Realtime DB.
// Exposes window.MP for use by app.jsx.
(function () {
  const db = window.FB_DB;
  const ROOM_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // exclude confusable chars
  const QUESTION_DURATION_MS = 15_000;
  const RESULT_DURATION_MS = 6_000;
  const ROUND_DURATION_MS = QUESTION_DURATION_MS + RESULT_DURATION_MS;
  const TOTAL_QUESTIONS = 8;

  const sv = firebase.database.ServerValue;

  function newRoomCode() {
    let s = "";
    for (let i = 0; i < 4; i++) s += ROOM_CHARS[Math.floor(Math.random() * ROOM_CHARS.length)];
    return s;
  }

  function newPlayerId() {
    return "p_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  }

  async function createRoom({ name, avatar }) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = newRoomCode();
      const playerId = newPlayerId();
      const roomRef = db.ref("rooms/" + code);
      const exists = (await roomRef.child("meta").once("value")).exists();
      if (exists) continue;
      await roomRef.set({
        meta: {
          hostId: playerId,
          state: "lobby",
          createdAt: sv.TIMESTAMP,
        },
        players: {
          [playerId]: {
            name, avatar,
            score: 0, correctCount: 0, streak: 0,
            isHost: true,
            joinedAt: sv.TIMESTAMP,
          },
        },
      });
      roomRef.child("players/" + playerId).onDisconnect().remove();
      return { code, playerId };
    }
    throw new Error("تعذّر إنشاء غرفة، حاول مجددًا");
  }

  async function joinRoom(rawCode, { name, avatar }) {
    const code = (rawCode || "").trim().toUpperCase();
    if (code.length !== 4) throw new Error("رمز الغرفة يجب أن يكون 4 أحرف");
    const roomRef = db.ref("rooms/" + code);
    const snap = await roomRef.once("value");
    if (!snap.exists()) throw new Error("الغرفة غير موجودة");
    const meta = snap.child("meta").val() || {};
    if (meta.state && meta.state !== "lobby") throw new Error("اللعبة بدأت بالفعل");
    const playerId = newPlayerId();
    await roomRef.child("players/" + playerId).set({
      name, avatar,
      score: 0, correctCount: 0, streak: 0,
      isHost: false,
      joinedAt: sv.TIMESTAMP,
    });
    roomRef.child("players/" + playerId).onDisconnect().remove();
    return { code, playerId };
  }

  async function startRoom(code, questions) {
    const roomRef = db.ref("rooms/" + code);
    await roomRef.child("questions").set(questions);
    await roomRef.child("meta").update({
      state: "playing",
      startedAt: sv.TIMESTAMP,
      totalQuestions: questions.length,
    });
  }

  async function submitAnswer(code, playerId, qIndex, payload) {
    const playerRef = db.ref("rooms/" + code + "/players/" + playerId);
    const updates = {
      score: payload.score,
      correctCount: payload.correctCount,
      streak: payload.streak,
    };
    updates["answers/" + qIndex] = {
      pickIdx: payload.pickIdx,
      correct: payload.correct,
      gained: payload.gained,
      timeBonus: payload.timeBonus,
      ts: sv.TIMESTAMP,
    };
    await playerRef.update(updates);
  }

  async function endRoom(code) {
    await db.ref("rooms/" + code + "/meta").update({ state: "finished" });
  }

  async function leaveRoom(code, playerId) {
    try { await db.ref("rooms/" + code + "/players/" + playerId).remove(); } catch {}
  }

  function watchRoom(code, callback) {
    const ref = db.ref("rooms/" + code);
    const handler = ref.on("value", (snap) => callback(snap.val()));
    return () => ref.off("value", handler);
  }

  window.MP = {
    createRoom, joinRoom, startRoom, submitAnswer, endRoom, leaveRoom, watchRoom,
    QUESTION_DURATION_MS, RESULT_DURATION_MS, ROUND_DURATION_MS, TOTAL_QUESTIONS,
  };
})();
