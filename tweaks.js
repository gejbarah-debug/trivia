// Minimal useTweaks shim for production: persists tweak state to localStorage.
// Replaces the design-tool's TweaksPanel host protocol with a lightweight hook.
(function () {
  const STORAGE_KEY = "trivia_tweaks";

  function readStored() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  window.useTweaks = function useTweaks(defaults) {
    const { useState, useCallback } = React;
    const [state, setState] = useState(() => ({ ...defaults, ...readStored() }));

    const setTweak = useCallback((key, value) => {
      setState((prev) => {
        const next = { ...prev, [key]: value };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (e) {}
        return next;
      });
    }, []);

    return [state, setTweak];
  };
})();
