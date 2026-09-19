(async function () {
  try {
    const mod = await import("./offline/offline-ai.js");

    window.YarKeshavarzOffline = {
      ...(window.YarKeshavarzOffline || {}),
      findOfflineAnswer:
        mod.findOfflineAnswer ||
        mod.default ||
        window.YarKeshavarzOffline?.findOfflineAnswer
    };

    console.log("YarKeshavarz Offline AI loaded");
  } catch (error) {
    console.error("Offline AI load failed:", error);
  }
})();
