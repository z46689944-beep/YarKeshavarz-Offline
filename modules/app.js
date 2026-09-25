// =========================================================
// YarKeshavarz - Modular Core
// =========================================================

const KEY = 'yar-keshavarz-v4-single';

const app = document.getElementById('app');
const title = document.getElementById('pageTitle');

// =========================================================
// State
// =========================================================

let state = JSON.parse(localStorage.getItem(KEY) || 'null') || {
  lands: [],
  inventory: [],
  equipment: [],
  profile: {},
  expenses: [],
  income: [],
  settings: {},
  messages: []
};

let selected = null;

let points = [];
let markers = [];
let polygon = null;
let map = null;
let watch = null;
let satellite = false;

let measureReturn = 'add';


// =========================================================
// Save
// =========================================================

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Save failed:', error);
  }
}


// =========================================================
// Page title
// =========================================================

function head(x) {
  if (title) {
    title.textContent = x;
  }
}


// =========================================================
// Helpers
// =========================================================

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


function money(value) {
  const n = Number(value || 0);

  return n.toLocaleString('fa-IR') + ' تومان';
}


function num(value) {
  const n = Number(value || 0);

  return n.toLocaleString('fa-IR');
}


function toast(message) {
  const old = document.querySelector('.yk-toast');

  if (old) {
    old.remove();
  }

  const el = document.createElement('div');

  el.className = 'yk-toast';

  el.textContent = message;

  Object.assign(el.style, {
    position: 'fixed',
    left: '20px',
    right: '20px',
    bottom: '20px',
    zIndex: '99999',
    padding: '14px',
    borderRadius: '14px',
    background: '#222',
    color: '#fff',
    textAlign: 'center',
    boxShadow: '0 5px 20px rgba(0,0,0,.25)'
  });

  document.body.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, 2500);
}


// =========================================================
// Navigation
// =========================================================

function go(route) {

  if (!app) {
    console.error('YarKeshavarz: #app not found');
    return;
  }

  try {

    if (typeof window.renderPage === 'function') {
      window.renderPage(route);
      return;
    }

    if (typeof window.views === 'object' &&
        typeof window.views[route] === 'function') {

      window.views[route]();
      return;
    }

    // fallback
    const fn = window[route];

    if (typeof fn === 'function') {
      fn();
      return;
    }

    console.warn('Route not found:', route);

  } catch (error) {

    console.error('Navigation error:', route, error);

    app.innerHTML = `
      <div class="card" style="margin:20px;text-align:center">
        <h3>خطا در باز کردن صفحه</h3>

        <p class="muted">
          صفحه موردنظر نتوانست اجرا شود.
        </p>

        <button class="primary"
                onclick="location.reload()">
          تلاش دوباره
        </button>
      </div>
    `;
  }
}


// =========================================================
// Land helpers
// =========================================================

function openLand(id) {

  selected = id;

  try {
    localStorage.setItem('yk-last-land', id);
  } catch (e) {}

  go('land');
}


function editLand(id) {

  selected = id;

  try {
    localStorage.setItem('yk-last-land', id);
  } catch (e) {}

  measureReturn = 'land';

  if (typeof window.editLandPoints === 'function') {
    window.editLandPoints(id);
  } else {
    go('measure');
  }
}


// =========================================================
// Weather
// =========================================================

function weatherFor(land) {

  if (!land) {
    return null;
  }

  if (typeof window.weatherForModule === 'function') {
    try {
      return window.weatherForModule(land);
    } catch (e) {
      console.warn('Weather module error:', e);
    }
  }

  return {
    temperature: '--',
    description: 'اطلاعات آب‌وهوا در دسترس نیست'
  };
}


// =========================================================
// Measurement return state
// =========================================================

function getMeasureReturn() {
  return measureReturn;
}


function setMeasureReturn(value) {
  measureReturn = value || 'add';
}


// =========================================================
// Compatibility bridge
// =========================================================
//
// measurement.js و بعضی ماژول‌های قدیمی از window.state,
// window.selected و ... استفاده می‌کنند.
//
// متغیرهای اصلی بالا با let نگهداری می‌شوند؛
// این bridge باعث می‌شود هر دو طرف به همان داده واقعی دسترسی داشته باشند.
// =========================================================

const bridge = [

  [
    'state',
    () => state,
    value => {
      if (value && typeof value === 'object') {
        state = value;
      }
    }
  ],

  [
    'selected',
    () => selected,
    value => {
      selected = value;
    }
  ],

  [
    'points',
    () => points,
    value => {
      points = Array.isArray(value) ? value : [];
    }
  ],

  [
    'markers',
    () => markers,
    value => {
      markers = Array.isArray(value) ? value : [];
    }
  ],

  [
    'polygon',
    () => polygon,
    value => {
      polygon = value;
    }
  ],

  [
    'map',
    () => map,
    value => {
      map = value;
    }
  ],

  [
    'watch',
    () => watch,
    value => {
      watch = value;
    }
  ],

  [
    'satellite',
    () => satellite,
    value => {
      satellite = !!value;
    }
  ],

  [
    'measureReturn',
    () => measureReturn,
    value => {
      measureReturn = value || 'add';
    }
  ]

];


for (const item of bridge) {

  const name = item[0];
  const getter = item[1];
  const setter = item[2];

  try {

    Object.defineProperty(window, name, {
      configurable: true,
      enumerable: false,
      get: getter,
      set: setter
    });

  } catch (error) {

    console.warn(
      'YK bridge failed for:',
      name,
      error
    );

  }
}


// =========================================================
// Public YK API
// =========================================================

window.YK = window.YK || {};


window.YK.getState = function() {
  return state;
};


window.YK.save = function() {
  return save();
};


window.YK.getSelected = function() {
  return selected;
};


window.YK.setSelected = function(id) {
  selected = id;
};


window.YK.getPoints = function() {
  return points;
};


window.YK.setPoints = function(value) {
  points = Array.isArray(value) ? value : [];
};


window.YK.getMeasureReturn = function() {
  return measureReturn;
};


window.YK.setMeasureReturn = function(value) {
  measureReturn = value || 'add';
};


// =========================================================
// Navigation from data-r buttons
// =========================================================

document.addEventListener('click', function(e) {

  const button = e.target.closest('[data-r]');

  if (!button) {
    return;
  }

  const route = button.dataset.r;

  if (!route) {
    return;
  }

  e.preventDefault();

  go(route);

});


// =========================================================
// Global API
// =========================================================

window.go = go;

window.openLand = openLand;

window.editLand = editLand;

window.weatherFor = weatherFor;

window.save = save;

window.toast = toast;


// =========================================================
// Measurement helpers
// =========================================================

window.startMeasureForNewLand = function() {

  selected = null;

  measureReturn = 'add';

  points = [];

  markers = [];

  polygon = null;

  try {
    sessionStorage.removeItem('yk-pending-measure');
  } catch (e) {}

  go('measure');
};


window.editLandPoints = function(id) {

  selected = id;

  measureReturn = 'land';

  try {
    localStorage.setItem('yk-last-land', id);
  } catch (e) {}

  go('measure');
};


// =========================================================
// Start application
// =========================================================

try {

  go('home');

} catch (error) {

  console.error(
    'YarKeshavarz startup error:',
    error
  );

  if (app) {

    app.innerHTML = `
      <div class="card" style="margin:20px;text-align:center">

        <h3>خطا در اجرای برنامه</h3>

        <p class="muted">
          برنامه نتوانست کامل اجرا شود.
        </p>

        <button class="primary"
                onclick="location.reload()">
          تلاش دوباره
        </button>

      </div>
    `;

  }

}


// =========================================================
// Service Worker
// =========================================================

if ('serviceWorker' in navigator) {

  window.addEventListener('load', function() {

    navigator.serviceWorker
      .register('./sw.js')
      .then(function() {

        console.log(
          'YarKeshavarz Service Worker registered'
        );

      })
      .catch(function(error) {

        console.warn(
          'Service Worker registration failed:',
          error
        );

      });

  });

}
