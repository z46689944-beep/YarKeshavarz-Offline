// =========================================================
// YarKeshavarz - STARTUP DEBUG
// فقط برای پیدا کردن خطای واقعی برنامه
// =========================================================

(function () {

  'use strict';

  const app = document.getElementById('app');

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showError(error, title) {

    console.error(
      'YarKeshavarz DEBUG ERROR:',
      error
    );

    const message =
      error && error.stack
        ? error.stack
        : String(error);

    if (!app) {
      return;
    }

    app.innerHTML = `
      <div
        style="
          direction:rtl;
          margin:20px;
          padding:20px;
          border-radius:18px;
          background:#fff;
          box-shadow:0 4px 20px rgba(0,0,0,.12);
        "
      >

        <h2 style="margin-top:0">
          ${escapeHtml(title || 'خطای واقعی برنامه')}
        </h2>

        <p>
          خطای اصلی برنامه پیدا شد:
        </p>

        <pre
          style="
            direction:ltr;
            text-align:left;
            white-space:pre-wrap;
            overflow:auto;
            padding:14px;
            border-radius:12px;
            background:#f2f2f2;
            font-size:13px;
            line-height:1.6;
          "
        >${escapeHtml(message)}</pre>

        <button
          onclick="location.reload()"
          style="
            width:100%;
            border:0;
            border-radius:12px;
            padding:14px;
            font-size:16px;
            cursor:pointer;
          "
        >
          تلاش دوباره
        </button>

      </div>
    `;
  }


  // =======================================================
  // Global JavaScript error
  // =======================================================

  window.addEventListener(
    'error',
    function (event) {

      showError(
        event.error || event.message,
        'خطای JavaScript'
      );

    }
  );


  // =======================================================
  // Promise error
  // =======================================================

  window.addEventListener(
    'unhandledrejection',
    function (event) {

      showError(
        event.reason || 'Unhandled Promise rejection',
        'خطای Promise'
      );

    }
  );


  // =======================================================
  // Check required elements
  // =======================================================

  try {

    if (!app) {

      throw new Error(
        'عنصر #app در index.html پیدا نشد.'
      );

    }

  } catch (error) {

    showError(
      error,
      'خطای ساختار index.html'
    );

    return;

  }


  // =======================================================
  // Check views
  // =======================================================

  try {

    if (
      typeof window.go !== 'function' &&
      typeof window.renderPage !== 'function'
    ) {

      throw new Error(
        'تابع go یا renderPage پیدا نشد. ' +
        'احتمالاً pages/views.js قبل از app.js اجرا نشده یا خطای نحوی دارد.'
      );

    }

  } catch (error) {

    showError(
      error,
      'خطای pages/views.js'
    );

    return;

  }


  // =======================================================
  // Run Home
  // =======================================================

  try {

    if (typeof window.go === 'function') {

      window.go('home');

      return;

    }


    if (
      typeof window.renderPage ===
      'function'
    ) {

      window.renderPage('home');

      return;

    }


    throw new Error(
      'هیچ تابعی برای باز کردن صفحه اصلی پیدا نشد.'
    );

  } catch (error) {

    showError(
      error,
      'خطا هنگام باز کردن صفحه اصلی'
    );

  }

})();
