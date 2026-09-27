/* =========================================================
   YarKeshavarz — Crop Advisor / Numeric Calculator
   Safe numeric engine: user supplies agronomic rates.
   ========================================================= */

const YK_CROPS = [
  "گندم","جو","ذرت","برنج","سویا","کلزا","نخود","عدس","لوبیا",
  "سیب‌زمینی","پیاز","سیر","گوجه‌فرنگی","خیار","فلفل","بادمجان",
  "هویج","کاهو","اسفناج","تربچه","چغندر قند","پنبه","نیشکر",
  "آفتابگردان","کنجد","سورگوم","ارزن","نخودفرنگی","کدو","کلم",
  "بروکلی","گل‌کلم","توت‌فرنگی","زعفران","یونجه","شبدر"
];

function openCropAdvisor(){
  head('مشاور کشت');

  const lands = Array.isArray(state.lands) ? state.lands : [];
  const selectedLand = selected
    ? lands.find(l => l.id === selected)
    : null;

  const cropOptions = YK_CROPS
    .map(c => `<option value="${esc(c)}">${esc(c)}</option>`)
    .join('');

  app.innerHTML = `
    <div class="section crop-advisor-page">

      <div class="page-header-row">
        <div>
          <h2>🌱 مشاور کشت</h2>
          <p class="small muted">
            محصول، زمین و نرخ مصرف را وارد کن تا مقدار کل بذر، کود، سم و آب محاسبه شود.
          </p>
        </div>
        <button class="secondary" onclick="go('yar')">بازگشت</button>
      </div>

      <div class="card crop-advisor-card">

        <div class="register-two">

          <div class="field">
            <label>انتخاب زمین</label>
            <select id="cropLand">
              <option value="">بدون انتخاب زمین</option>
              ${lands.map(l => `
                <option value="${esc(l.id)}" ${selectedLand && l.id===selectedLand.id?'selected':''}>
                  ${esc(l.name)} — ${n(l.area).toLocaleString('fa-IR')} هکتار
                </option>
              `).join('')}
            </select>
          </div>

          <div class="field">
            <label>محصول</label>
            <select id="cropName">
              ${cropOptions}
            </select>
          </div>

        </div>

        <div class="crop-rate-note">
          ℹ️ نرخ‌های مصرف را بر اساس نسخه، آزمون خاک، توصیه کارشناس و شرایط منطقه وارد کن؛ برنامه مقدار پیش‌فرض تجویزی برای کود و سم نمی‌سازد.
        </div>

        <div class="register-two">

          <div class="field">
            <label>بذر — کیلوگرم در هکتار</label>
            <input id="seedRate" type="number" min="0" step="0.01" placeholder="مثلاً ۱۸۰">
          </div>

          <div class="field">
            <label>کود — کیلوگرم در هکتار</label>
            <input id="fertRate" type="number" min="0" step="0.01" placeholder="مثلاً ۲۵۰">
          </div>

          <div class="field">
            <label>سم — لیتر در هکتار</label>
            <input id="pestRate" type="number" min="0" step="0.01" placeholder="مثلاً ۱٫۵">
          </div>

          <div class="field">
            <label>آب — میلی‌متر در هکتار</label>
            <input id="waterRate" type="number" min="0" step="0.1" placeholder="مثلاً ۳۰">
          </div>

        </div>

        <div class="crop-calc-grid">

          <div class="crop-calc">
            <span>🌾 کل بذر</span>
            <b id="calcSeed">۰ کیلوگرم</b>
          </div>

          <div class="crop-calc">
            <span>🧪 کل کود</span>
            <b id="calcFert">۰ کیلوگرم</b>
          </div>

          <div class="crop-calc">
            <span>🛡️ کل سم</span>
            <b id="calcPest">۰ لیتر</b>
          </div>

          <div class="crop-calc">
            <span>💧 کل آب</span>
            <b id="calcWater">۰ لیتر</b>
          </div>

        </div>

        <div class="crop-advisor-actions">
          <button class="secondary" onclick="loadCropLandArea()">📐 دریافت مساحت زمین</button>
          <button class="primary" onclick="calculateCropPlan()">🧮 محاسبه</button>
        </div>

        <div id="cropCalcStatus" class="measure-status">
          مساحت را انتخاب کن یا وارد کن تا محاسبه انجام شود.
        </div>

      </div>
    </div>
  `;

  const landSelect = document.getElementById('cropLand');
  if(landSelect){
    landSelect.addEventListener('change', loadCropLandArea);
  }

  loadCropLandArea();
}

function loadCropLandArea(){
  const select = document.getElementById('cropLand');
  if(!select) return;

  const l = state.lands.find(x => x.id === select.value);
  if(!l) return;

  const status = document.getElementById('cropCalcStatus');
  if(status){
    status.dataset.area = String(Number(l.area)||0);
    status.textContent =
      `زمین «${l.name}» انتخاب شد — مساحت ${n(l.area).toLocaleString('fa-IR')} هکتار.`;
  }

  calculateCropPlan();
}

function calculateCropPlan(){
  const status = document.getElementById('cropCalcStatus');
  const select = document.getElementById('cropLand');

  let areaHa = 0;

  if(select && select.value){
    const l = state.lands.find(x => x.id === select.value);
    if(l) areaHa = n(l.area);
  }

  if(!areaHa && status){
    areaHa = n(status.dataset.area);
  }

  const seedRate = n(document.getElementById('seedRate')?.value);
  const fertRate = n(document.getElementById('fertRate')?.value);
  const pestRate = n(document.getElementById('pestRate')?.value);
  const waterRate = n(document.getElementById('waterRate')?.value);

  const seed = areaHa * seedRate;
  const fert = areaHa * fertRate;
  const pest = areaHa * pestRate;

  // 1 mm روی 1 m² = 1 لیتر.
  // هکتار = 10,000 m².
  const waterLiters = areaHa * 10000 * waterRate;

  const put = (id,value,unit) => {
    const el = document.getElementById(id);
    if(el) el.textContent =
      value.toLocaleString('fa-IR',{maximumFractionDigits:2}) + ' ' + unit;
  };

  put('calcSeed',seed,'کیلوگرم');
  put('calcFert',fert,'کیلوگرم');
  put('calcPest',pest,'لیتر');
  put('calcWater',waterLiters,'لیتر');

  if(status){
    status.textContent = areaHa > 0
      ? `محاسبه برای ${areaHa.toLocaleString('fa-IR',{maximumFractionDigits:3})} هکتار انجام شد.`
      : 'ابتدا یک زمین با مساحت مشخص انتخاب کن.';
  }
}

window.openCropAdvisor = openCropAdvisor;
window.calculateCropPlan = calculateCropPlan;
window.loadCropLandArea = loadCropLandArea;
