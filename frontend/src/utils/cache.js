// src/utils/cache.js
export function loadCache() {
    try {
      const raw = localStorage.getItem("cache");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
  
  export function saveCache(obj) {
    try {
      localStorage.setItem("cache", JSON.stringify(obj));
    } catch {
      // ignore
    }
  }
  