// YarKeshavarz Offline Loader V4 - cache bust
(async function () {
  try {
    const mod = await import("./offline/offline-ai.js?v=20260919-v4");

    window.YarKeshavarzOffline = {
      ...(window.YarKeshavarzOffline || {}),
      findOfflineAnswer:
        mod.findOfflineAnswer ||
        mod.default ||
        window.YarKeshavarzOffline?.findOfflineAnswer
    };

    console.log("YarKeshavarz Offline AI V4 loaded");
  } catch (error) {
    console.error("Offline AI load failed:", error);
  }
})();
