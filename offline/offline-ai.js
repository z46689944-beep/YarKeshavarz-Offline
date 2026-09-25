// YarKeshavarz Offline AI V4 — محصول‌محور، چندلایه و آفلاین
// این فایل مستقل است و برای بازگرداندن رفتار «نام محصول → شناسنامه کامل → بخش‌های تخصصی» طراحی شده.
// بدون اینترنت و بدون API.

const PROFILE_MARK="__YK_CROP_PROFILE_V4__";
const CTX_KEY="yk-offline-context-v4";

function norm(s=""){
  return String(s).toLowerCase()
    .replace(/[يى]/g,"ی").replace(/ك/g,"ک")
    .replace(/\u200c/g," ")
    .replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/[^؀-ۿa-z0-9\s]/gi," ")
    .replace(/\s+/g," ").trim();
}

function esc(v=""){
  return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

function remember(role,text,crop=null){
  try{
    const a=JSON.parse(localStorage.getItem(CTX_KEY)||"[]");
    a.push({role,text:String(text).slice(0,1800),crop,ts:Date.now()});
    localStorage.setItem(CTX_KEY,JSON.stringify(a.slice(-12)));
  }catch{}
}

function lastCrop(){
  try{
    const a=JSON.parse(localStorage.getItem(CTX_KEY)||"[]");
    for(let i=a.length-1;i>=0;i--) if(a[i]?.crop) return a[i].crop;
  }catch{}
  return null;
}

const PROFILES={
  "سیر":{
    scientificName:"Allium sativum",
    aliases:["garlic"],
    summary:"سیر یک گیاه پیازی است که بخش اقتصادی آن پیاز مرکب از حبه‌هاست. کیفیت غده به رقم، تاریخ کاشت، دوره خنک، خاک زهکش‌دار، یکنواختی آب و تغذیه متعادل وابسته است.",
    climate:"بسیاری از تیپ‌های سیر برای تشکیل مناسب پیاز به دوره خنک نیاز دارند. طول روز، دمای منطقه و تیپ سیر روی زمان تشکیل و درشت‌شدن پیاز اثر می‌گذارند.",
    temperature:"دمای مناسب به تیپ و مرحله رشد وابسته است؛ از گرمای شدید در مراحل تشکیل پیاز و از یخبندان شدید در استقرار باید جلوگیری شود.",
    season:"در بسیاری از مناطق، کشت پاییزه پس از خنک‌شدن هوا انجام می‌شود؛ در مناطق بسیار سرد ممکن است تقویم متفاوت باشد.",
    soil:"خاک سبک تا متوسط، عمیق، حاصلخیز و زهکش‌دار. خاک سنگین و ماندابی خطر پوسیدگی حبه و ریشه را افزایش می‌دهد.",
    ph:"کمی اسیدی تا خنثی معمولاً مناسب است؛ مقدار دقیق باید با آزمون خاک و شرایط منطقه تفسیر شود.",
    ec:"سیر نسبت به شوری حساسیت قابل‌توجهی دارد؛ EC آب و خاک قبل از برنامه‌ریزی جدی بررسی شود.",
    propagation:["اصلی‌ترین روش تکثیر زراعی استفاده از حبه‌های سالم و درشت است.","حبه‌ها باید عاری از علائم پوسیدگی، نماتد و بیماری باشند.","اندازه و سلامت حبه روی یکنواختی سبزشدن و اندازه پیاز اثر دارد."],
    planting:["حبه‌ها را با قطب مناسب در خاک قرار بده و از آسیب مکانیکی به صفحه قاعده جلوگیری کن.","عمق و فاصله دقیق به اندازه حبه، بافت خاک، اقلیم و روش آبیاری وابسته است.","زمین باید نرم، یکنواخت و دارای زهکشی مناسب باشد.","تناوب با محصولات غیرهم‌خانواده به کاهش برخی بیماری‌های خاکزاد کمک می‌کند."],
    growthDays:"دوره رشد به تیپ، تاریخ کاشت، دما و منطقه وابسته است؛ برای تصمیم برداشت از علائم بلوغ استفاده کن.",
    irrigation:"در دوره رشد فعال، رطوبت خاک باید یکنواخت باشد اما خاک نباید ماندابی شود. نزدیک رسیدگی و برداشت، آبیاری معمولاً کاهش می‌یابد تا پوست‌گیری و انبارمانی بهتر شود.",
    irrigationStages:["استقرار و ریشه‌زایی","رشد برگ و تشکیل اندام زیرزمینی","درشت‌شدن پیاز؛ جلوگیری از تنش شدید","کاهش آب نزدیک رسیدگی و برداشت"],
    nutrition:"ازت برای رشد رویشی لازم است اما مصرف بیش از حد می‌تواند رسیدگی و انبارمانی را به تأخیر بیندازد. پتاسیم و گوگرد نیز در کیفیت و تشکیل محصول مهم‌اند.",
    fertilizer:["نسخه کود را بر اساس آزمون خاک و کیفیت آب تنظیم کن.","ازت را بیش از نیاز و خیلی دیر مصرف نکن.","فسفر و پتاسیم را با توجه به آزمون و مرحله رشد مدیریت کن.","در کمبودهای ریزمغذی، ابتدا تشخیص و سپس اصلاح انجام شود."],
    care:["کنترل علف‌های هرز در ابتدای فصل مهم است چون سیر رقابت ضعیفی دارد.","زهکشی و سلامت ریشه را مرتب بررسی کن.","برگ‌های غیرطبیعی، لکه‌دار و بوته‌های ضعیف را برای تشخیص زودهنگام بررسی کن."],
    pests:["تریپس؛ معمولاً با آسیب سطحی و نقره‌ای‌شدن برگ همراه است.","نماتدهای ساقه و پیاز؛ می‌توانند باعث ضعف و بدشکلی شوند.","برخی مگس‌ها و آفات پیاز؛ پایش و بهداشت بقایا مهم است."],
    diseases:["پوسیدگی سفید؛ بیماری مهم خاکزاد که با رطوبت و سابقه مزرعه ارتباط دارد.","زنگ؛ لکه‌ها و جوش‌های نارنجی/قهوه‌ای روی برگ.","پوسیدگی‌های ریشه و پیاز؛ زهکشی ضعیف و حبه آلوده ریسک را بالا می‌برد."],
    harvest:"وقتی بخش قابل‌توجهی از برگ‌ها زرد و خوابیده شده و پیاز به اندازه و بلوغ مناسب رسیده باشد. برداشت خیلی زود یا تأخیر طولانی می‌تواند کیفیت و انبارمانی را کاهش دهد.",
    postHarvest:"پس از برداشت، پیازها باید با حداقل ضربه جابه‌جا و برای خشک‌شدن/عمل‌آوری در شرایط مناسب قرار گیرند.",
    storage:"محیط خشک، خنک و دارای تهویه مناسب؛ از رطوبت بالا، تراکم زیاد و ورود حبه‌های آلوده جلوگیری شود.",
    yield:"عملکرد به رقم، تراکم، تاریخ کاشت، حاصلخیزی، آب و سلامت مزرعه وابسته است؛ عدد ثابت بدون داده محلی قابل اتکا نیست.",
    economics:"هزینه حبه بذری، آماده‌سازی زمین، آب، کود، کنترل علف هرز، کارگر، برداشت و خشک‌کردن را جدا ثبت کن.",
    risks:["پوسیدگی سفید و بیماری‌های خاکزاد","نماتد","آب اضافی و زهکشی ضعیف","ازت بیش از حد","انتخاب نامناسب تاریخ کاشت"]
  },

  "گندم":{
    scientificName:"Triticum spp.",
    summary:"غله فصل خنک که عملکرد آن به رقم، تاریخ کاشت، استقرار، آب، تغذیه و کنترل علف‌های هرز وابسته است.",
    climate:"فصل خنک؛ تحمل سرما و طول فصل با رقم و منطقه تغییر می‌کند.",
    season:"تقویم پاییزه یا بهاره با توجه به اقلیم و رقم تعیین می‌شود.",
    soil:"خاک حاصلخیز با زهکشی مناسب.",
    planting:["بذر سالم و یکنواخت","تنظیم تاریخ و تراکم بر اساس رقم و منطقه","استقرار یکنواخت و کنترل علف هرز اولیه"],
    irrigation:"استقرار، ساقه‌رفتن، خوشه‌دهی/گلدهی و پرشدن دانه مراحل مهم مدیریت آب هستند.",
    irrigationStages:["استقرار","ساقه‌رفتن","خوشه‌دهی و گلدهی","پرشدن دانه"],
    nutrition:"نیتروژن، فسفر، پتاسیم و گوگرد بر اساس آزمون خاک و هدف عملکرد مدیریت شوند.",
    fertilizer:["ازت را متناسب با نیاز و مرحله رشد تقسیم کن.","از مصرف بی‌حساب کود پرهیز کن.","آزمون خاک را مبنای فسفر و پتاسیم قرار بده."],
    care:["پایش علف‌های هرز","پایش بیماری‌های برگی","بررسی خوابیدگی و تنش آبی"],
    pests:["شته‌ها","سن گندم و آفات سن‌مانند","کرم‌های برگ‌خوار"],
    diseases:["زنگ‌ها","سفیدک پودری","لکه‌برگی‌ها","سیاهک‌ها"],
    harvest:"برداشت در بلوغ مناسب و با توجه به رطوبت دانه و خطر ریزش.",
    postHarvest:"خشک‌کردن و پاک‌سازی مناسب پیش از انبار.",
    storage:"کنترل رطوبت، تهویه و آفات انباری.",
    economics:"هزینه بذر، کود، آب، ماشین‌آلات، سموم، برداشت و حمل را جدا ثبت کن.",
    risks:["تنش خشکی","گرمای پایان فصل","خوابیدگی","آفات سن‌مانند","بیماری‌های زنگ"]
  },

  "گوجه فرنگی":{
    aliases:["گوجه","گوجه‌فرنگی"],
    scientificName:"Solanum lycopersicum",
    summary:"محصول گرمادوست با حساسیت بالا به دمای گلدهی، یکنواختی آب، تغذیه و بیماری‌های برگی.",
    climate:"گرم و آفتابی؛ گرمای شدید یا سرمای زمان گلدهی می‌تواند تشکیل میوه را کاهش دهد.",
    soil:"خاک عمیق، حاصلخیز و زهکش‌دار.",
    planting:["نشای سالم","فاصله مناسب برای تهویه","قیم یا تربیت بوته در ارقام مناسب"],
    irrigation:"آبیاری یکنواخت و جلوگیری از خشکی شدید و سپس آب سنگین.",
    nutrition:"تعادل نیتروژن، پتاسیم، کلسیم و منیزیم اهمیت دارد.",
    fertilizer:["برنامه تغذیه بر اساس آزمون خاک/آب و مرحله رشد باشد.","از نیتروژن اضافی پرهیز کن."],
    care:["تهویه و هرس مناسب","پایش برگ و میوه","مدیریت علف‌های هرز"],
    pests:["شته","تریپس","سفیدبالک","کنه تارتن"],
    diseases:["بلایت زودرس و دیررس","لکه‌های برگی","پژمردگی‌های خاکزاد","ویروس‌ها"],
    harvest:"بر اساس بازار از سبز بالغ تا رنگ نهایی.",
    postHarvest:"کاهش ضربه و مدیریت دما.",
    storage:"دمای نگهداری با مرحله رنگ و زنجیره سرد هماهنگ شود.",
    risks:["ترک میوه","پوسیدگی گلگاه","تنش دما","ویروس‌ها","نوسان آب"]
  },

  "خیار":{
    aliases:["خیار گلخانه‌ای"],
    scientificName:"Cucumis sativus",
    summary:"محصول گرمادوست با رشد سریع که آب، تغذیه، تهویه و کنترل رطوبت در آن بسیار مهم است.",
    climate:"گرم؛ در گلخانه دما و رطوبت باید پیوسته پایش شوند.",
    soil:"سبک تا متوسط، غنی و زهکش‌دار.",
    planting:["بذر یا نشای سالم","تراکم متناسب با فضای کشت","تربیت بوته متناسب با سیستم"],
    irrigation:"رطوبت یکنواخت؛ خشکی شدید و سپس آبیاری سنگین باعث افت کیفیت می‌شود.",
    nutrition:"نیتروژن و پتاسیم همراه با کلسیم و منیزیم در تعادل.",
    care:["تهویه","تربیت بوته","برداشت منظم","پایش زیر برگ"],
    pests:["کنه","شته","تریپس","سفیدبالک"],
    diseases:["سفیدک پودری","سفیدک داخلی","پوسیدگی ریشه","ویروس‌ها"],
    harvest:"برداشت مکرر و در اندازه بازار برای حفظ تولید.",
    postHarvest:"خنک‌سازی مناسب و کاهش ضربه.",
    storage:"از سرمای بیش از حد که باعث آسیب سرمازدگی می‌شود جلوگیری شود.",
    risks:["رطوبت بالا","سفیدک‌ها","تنش آبی","دمای پایین"]
  },

  "پیاز":{
    scientificName:"Allium cepa",
    summary:"محصول پیازی با حساسیت به طول روز، دمای فصل و یکنواختی آب.",
    climate:"رقم باید با طول روز و اقلیم منطقه سازگار باشد.",
    soil:"خاک نرم، عمیق و زهکش‌دار.",
    planting:["بذر، نشا یا پیازچه بسته به سیستم","تاریخ کاشت با طول روز و رقم هماهنگ شود"],
    irrigation:"رطوبت یکنواخت در رشد پیاز و کاهش تدریجی آب نزدیک رسیدگی.",
    nutrition:"ازت بیش از حد در اواخر فصل رسیدگی و انبارمانی را مختل می‌کند.",
    pests:["تریپس پیاز","مگس پیاز","شته"],
    diseases:["سفیدک داخلی","لکه ارغوانی","پوسیدگی ریشه و پیاز"],
    harvest:"وقتی گردن نرم و خوابیدگی برگ‌ها در حد مناسب رخ دهد.",
    postHarvest:"عمل‌آوری گردن و خشک‌کردن مناسب.",
    storage:"تهویه و رطوبت کنترل‌شده.",
    risks:["تریپس","پوسیدگی انباری","آب اضافی نزدیک برداشت","عدم سازگاری طول روز"]
  },

  "سیب زمینی":{
    aliases:["سیب‌زمینی"],
    scientificName:"Solanum tuberosum",
    summary:"محصول غده‌ای فصل خنک تا معتدل؛ دمای بالا، ماندابی شدن و نوسان شدید رطوبت کیفیت غده را کاهش می‌دهد.",
    climate:"خنک تا معتدل.",
    soil:"خاک نرم، عمیق و زهکش‌دار.",
    planting:["غده بذری سالم","جوانه‌زده و یکنواخت","خاک‌دهی متناسب با سیستم کشت"],
    irrigation:"رطوبت یکنواخت به‌خصوص در شروع غده‌زایی و رشد غده.",
    nutrition:"نیتروژن زیاد رشد رویشی را بیش از حد می‌کند؛ تعادل پتاسیم مهم است.",
    pests:["سوسک کلرادو","شته","مینوزها"],
    diseases:["بلایت دیررس","بلایت زودرس","پوسیدگی‌های خاکزاد"],
    harvest:"پس از تکمیل پوست‌گیری و رسیدن غده‌ها.",
    postHarvest:"خشک‌شدن پوست و کاهش آسیب مکانیکی.",
    storage:"دمای مناسب، تاریکی، تهویه و کنترل جوانه‌زنی.",
    risks:["بلایت دیررس","گرما","نوسان آب","آسیب مکانیکی"]
  },

  "انگور":{
    aliases:["مو","تاک"],
    scientificName:"Vitis vinifera",
    summary:"محصول باغی که هرس، تربیت، نورگیری، آب، تغذیه و مدیریت بیماری‌ها روی کیفیت خوشه اثر دارند.",
    climate:"اقلیم مناسب باید با رقم و هدف تولید هماهنگ شود.",
    soil:"خاک عمیق و زهکش‌دار.",
    planting:["رقم و پایه سازگار","فاصله و سیستم تربیت متناسب با منطقه"],
    irrigation:"آب در استقرار و رشد خوشه مهم است؛ تنش و نوسان آب باید با مرحله رشد مدیریت شود.",
    nutrition:"بر اساس آزمون خاک و برگ.",
    care:["هرس و تربیت","تنظیم تاج","مدیریت نورگیری","پایش خوشه"],
    pests:["تریپس","کنه","زنجره‌ها","آفات خوشه"],
    diseases:["سفیدک سطحی","سفیدک داخلی","پوسیدگی خوشه"],
    harvest:"بر اساس قند، اسیدیته، رنگ و هدف بازار.",
    postHarvest:"برداشت ملایم و کاهش آسیب خوشه.",
    storage:"برای انگور تازه، زنجیره سرد و رطوبت مناسب مهم است.",
    risks:["بیماری‌های قارچی","تنش آب","ترک یا آسیب خوشه","گرمای شدید"]
  }
};

// تکمیل خودکار برای محصولاتی که پروفایل تخصصی ندارند.
const GENERIC_GROUPS={
  "گندم":"غلات","جو":"غلات","ذرت":"غلات","برنج":"غلات",
  "نخود":"حبوبات","عدس":"حبوبات","لوبیا":"حبوبات",
  "کلزا":"دانه‌های روغنی","سویا":"دانه‌های روغنی",
  "کاهو":"سبزی و صیفی","فلفل":"سبزی و صیفی","بادمجان":"سبزی و صیفی",
  "زعفران":"گیاهان دارویی و ادویه‌ای","گل محمدی":"گیاهان دارویی و ادویه‌ای",
  "سیب":"باغی","بادام":"باغی","پسته":"باغی","گردو":"باغی","انار":"باغی"
};

function profileFor(name){
  if(PROFILES[name]) return {...PROFILES[name],name};
  const group=GENERIC_GROUPS[name]||"محصول کشاورزی";
  return {
    name,
    summary:`${name} یک ${group} است. مدیریت موفق آن به رقم، اقلیم، مرحله رشد، خاک، آب و هدف تولید وابسته است.`,
    climate:"اقلیم مناسب به گونه و رقم وابسته است؛ دما، طول فصل، بارندگی و خطر یخبندان باید بررسی شوند.",
    soil:"خاک حاصلخیز و دارای زهکشی مناسب؛ pH و شوری باید با آزمون خاک و آب مشخص شوند.",
    ph:"pH مناسب را بر اساس آزمون خاک و نیاز محصول تفسیر کن.",
    ec:"تحمل شوری گونه‌محور است؛ EC آب و خاک را اندازه بگیر.",
    season:"تاریخ کاشت باید با دمای خاک، رقم و خطر سرما/گرما هماهنگ شود.",
    propagation:["روش تکثیر بسته به محصول می‌تواند بذر، نشا، قلمه، پیاز، غده، ریزوم یا نهال باشد.","مواد تکثیری سالم و یکنواخت انتخاب شود."],
    planting:["بذر/نهال سالم و یکنواخت انتخاب کن.","عمق و فاصله کاشت باید با رقم، بافت خاک و روش آبیاری تنظیم شود.","تراکم نامناسب می‌تواند بیماری و رقابت را افزایش دهد."],
    irrigation:"آبیاری بر اساس مرحله رشد، بافت خاک، رطوبت واقعی، هوا و روش آبیاری تنظیم شود.",
    irrigationStages:["استقرار","رشد رویشی","تشکیل اندام اقتصادی","رسیدگی"],
    nutrition:"تغذیه بر اساس آزمون خاک/آب/برگ و مرحله رشد تنظیم شود.",
    fertilizer:["از نسخه ثابت برای همه مناطق استفاده نکن.","کوددهی را با نیاز واقعی و آزمون هماهنگ کن."],
    care:["پایش منظم","کنترل علف‌های هرز","بررسی سلامت ریشه و برگ","ثبت عملیات مزرعه"],
    pests:["شته‌ها","کنه‌ها","تریپس‌ها","آفات اختصاصی محصول"],
    diseases:["بیماری‌های برگی","پوسیدگی‌های ریشه و طوقه","بیماری‌های اختصاصی محصول"],
    harvest:"بر اساس شاخص بلوغ و هدف بازار/مصرف تعیین شود.",
    postHarvest:"کاهش ضربه، گرما و رطوبت اضافی و انتقال سریع به شرایط مناسب.",
    storage:"دما، رطوبت و تهویه باید با محصول و هدف نگهداری هماهنگ شوند.",
    yield:"عملکرد به رقم، منطقه، آب، خاک و مدیریت وابسته است؛ عدد ثابت بدون داده محلی اعلام نشود.",
    economics:"هزینه بذر/نهال، آماده‌سازی، آب، کود، حفاظت، کارگر، ماشین، برداشت و ضایعات ثبت شود.",
    risks:["تنش آبی","شوری","دمای نامناسب","آفات و بیماری‌ها","تفاوت رقم و منطقه"]
  };
}

function detectCrop(q){
  const n=norm(q);
  const names=Object.keys(PROFILES).concat(Object.keys(GENERIC_GROUPS));
  const aliases={};
  for(const [k,p] of Object.entries(PROFILES)) for(const a of (p.aliases||[])) aliases[norm(a)]=k;
  for(const name of names) if(n===norm(name) || n.includes(" "+norm(name)+" ") || n.startsWith(norm(name)+" ") || n.endsWith(" "+norm(name))) return name;
  for(const [a,k] of Object.entries(aliases)) if(n===a || n.includes(a)) return k;
  return null;
}

function detectIntent(q){
  const n=norm(q);
  if(/آبیاری|آبدهی|کم آبی|تنش خشکی/.test(n)) return "irrigation";
  if(/کود|کوددهی|تغذیه|اوره|ازت|نیتروژن|فسفر|پتاس/.test(n)) return "fertilizer";
  if(/کاشت|کشت|بذر|نشا|تکثیر|تاریخ کاشت|فاصله|تراکم/.test(n)) return "planting";
  if(/آفت|شته|کنه|تریپس|سفیدبالک|کرم/.test(n)) return "pest";
  if(/بیماری|قارچ|باکتری|ویروس|پوسیدگی|لکه|سفیدک|زنگ/.test(n)) return "disease";
  if(/خاک|پی اچ|ph|شوری|ec|زهکشی|ماده آلی|بافت/.test(n)) return "soil";
  if(/برداشت|رسیدگی|انبار|سردخانه|پس از برداشت/.test(n)) return "harvest";
  if(/هزینه|درآمد|سود|قیمت|اقتصاد/.test(n)) return "economics";
  return "general";
}

function makeProfilePayload(p){
  const sections=[
    ["🌤️","شرایط و اقلیم",[["اقلیم",p.climate],["دما",p.temperature],["فصل مناسب",p.season],["دوره رشد/رسیدگی",p.growthDays]]],
    ["🌱","خاک و شرایط زمین",[["خاک مناسب",p.soil],["pH",p.ph],["شوری / EC",p.ec]]],
    ["🌾","کاشت و تکثیر",[["روش تکثیر",p.propagation],["روش و نکات کاشت",p.planting]]],
    ["💧","آبیاری",[["نیاز و مدیریت آب",p.irrigation],["مراحل حساس",p.irrigationStages]]],
    ["🧪","تغذیه و کود",[["تغذیه",p.nutrition],["راهنمای کود",p.fertilizer]]],
    ["🌿","داشت و مراقبت",[["عملیات مهم",p.care]]],
    ["🐛","آفات",[["آفات مهم",p.pests]]],
    ["🦠","بیماری‌ها",[["بیماری‌های مهم",p.diseases]]],
    ["🧺","برداشت",[["زمان / نشانه برداشت",p.harvest]]],
    ["📦","پس از برداشت و انبار",[["پس از برداشت",p.postHarvest],["انبارداری",p.storage]]],
    ["💰","عملکرد و اقتصاد",[["عملکرد",p.yield],["اقتصاد",p.economics]]],
    ["⚠️","ریسک‌های مهم",[["ریسک‌ها",p.risks]]]
  ].map(x=>({icon:x[0],title:x[1],items:x[2].filter(y=>y[1])})).filter(x=>x.items.length);
  return {name:p.name,scientificName:p.scientificName||"",summary:p.summary||"",sections};
}

function answerForIntent(p,intent){
  const map={
    planting:["🌾 کاشت و تکثیر",[["فصل مناسب",p.season],["روش تکثیر",p.propagation],["روش و نکات کاشت",p.planting],["دوره رشد/رسیدگی",p.growthDays]]],
    irrigation:["💧 آبیاری",[["نیاز و مدیریت آب",p.irrigation],["مراحل حساس",p.irrigationStages]]],
    fertilizer:["🧪 تغذیه و کود",[["تغذیه",p.nutrition],["راهنمای کود",p.fertilizer]]],
    pest:["🐛 آفات",[["آفات مهم",p.pests]]],
    disease:["🦠 بیماری‌ها",[["بیماری‌های مهم",p.diseases]]],
    soil:["🌱 خاک و شرایط زمین",[["خاک",p.soil],["pH",p.ph],["EC/شوری",p.ec],["اقلیم",p.climate]]],
    harvest:["🧺 برداشت و پس از برداشت",[["برداشت",p.harvest],["پس از برداشت",p.postHarvest],["انبارداری",p.storage]]],
    economics:["💰 عملکرد و اقتصاد",[["عملکرد",p.yield],["اقتصاد",p.economics]]]
  };
  const x=map[intent];
  if(!x)return null;
  return "🌱 "+p.name+"\n\n"+x[0]+"\n"+x[1].map(([k,v])=>v?`• ${k}: ${Array.isArray(v)?v.join("؛ "):v}`:"").filter(Boolean).join("\n")+
    "\n\nℹ️ این راهنمای آفلاین پایه است؛ اعداد دقیق باید با رقم، منطقه، آزمون خاک/آب و شرایط واقعی مزرعه تطبیق داده شوند.";
}

function renderStyle(){
  if(document.getElementById("yk-v4-style")) return;
  const s=document.createElement("style");s.id="yk-v4-style";s.textContent=`
  .yk-crop-profile{direction:rtl;color:#17362a;font-family:inherit}
  .yk-crop-intro{display:flex;gap:12px;padding:14px;background:linear-gradient(135deg,#eef8f2,#fff);border:1px solid #dbe9e1;border-radius:18px;margin-bottom:10px}
  .yk-crop-intro-icon{width:48px;height:48px;flex:0 0 48px;border-radius:15px;display:grid;place-items:center;background:#e2f2e8;font-size:26px}
  .yk-crop-intro h3{margin:0 0 5px;font-size:17px;color:#145b40}.yk-crop-intro p{margin:6px 0 0;font-size:11px;line-height:2;color:#4d6258}
  .yk-crop-hint{font-size:10px;color:#6b7b73;background:#f5f8f6;border-radius:12px;padding:9px 11px;margin:8px 0}
  .yk-crop-sections{display:grid;gap:8px}.yk-crop-section{background:#fff;border:1px solid #dce8e1;border-radius:16px;overflow:hidden;box-shadow:0 4px 13px rgba(13,55,40,.05)}
  .yk-crop-section summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:8px;padding:13px 11px;font-weight:800;color:#173f32}.yk-crop-section summary::-webkit-details-marker{display:none}
  .yk-crop-icon{width:32px;height:32px;flex:0 0 32px;border-radius:10px;background:#eaf4ee;display:grid;place-items:center;font-size:17px}.yk-crop-title{flex:1;font-size:12px}.yk-crop-chevron{font-size:18px;color:#6d8177}
  .yk-crop-section[open] summary{background:#f4f9f6}.yk-crop-body{padding:0 11px 10px;border-top:1px solid #edf2ef}.yk-crop-item{padding:10px 2px;border-bottom:1px dashed #e5ece8}.yk-crop-item:last-child{border-bottom:0}
  .yk-crop-item>b{display:block;font-size:10px;color:#25624b;margin-bottom:4px}.yk-crop-item p,.yk-crop-item ul{margin:0;font-size:10px;line-height:1.95;color:#334c41}.yk-crop-item ul{padding-right:18px}.yk-crop-note{margin-top:9px;padding:10px 11px;border-radius:13px;background:#fffaf0;border:1px solid #eee0bd;color:#6b6042;font-size:9px;line-height:1.8}
  `;
  document.head.appendChild(s);
}

function renderProfile(raw){
  let p;try{p=JSON.parse(raw.slice(PROFILE_MARK))}catch{return null}
  if(!p?.name)return null;renderStyle();
  const val=v=>Array.isArray(v)?`<ul>${v.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:`<p>${esc(v)}</p>`;
  return `<div class="yk-crop-profile"><div class="yk-crop-intro"><div class="yk-crop-intro-icon">🌱</div><div><h3>${esc(p.name)}</h3>${p.scientificName?`<div style="font-size:10px;color:#6b7b73">🔬 ${esc(p.scientificName)}</div>`:""}<p>${esc(p.summary||"")}</p></div></div><div class="yk-crop-hint">برای دیدن جزئیات هر موضوع، روی همان بخش بزن.</div><div class="yk-crop-sections">${(p.sections||[]).map(s=>`<details class="yk-crop-section"><summary><span class="yk-crop-icon">${s.icon}</span><span class="yk-crop-title">${esc(s.title)}</span><span class="yk-crop-chevron">⌄</span></summary><div class="yk-crop-body">${s.items.map(x=>`<div class="yk-crop-item"><b>${esc(x[0])}</b>${val(x[1])}</div>`).join("")}</div></details>`).join("")}</div><div class="yk-crop-note">ℹ️ این شناسنامه راهنمای پایه آفلاین است؛ تاریخ کاشت، مقدار آب، کود و سایر اعداد باید با رقم، منطقه، آزمون خاک/آب و شرایط واقعی مزرعه تطبیق داده شوند.</div></div>`;
}

function installRenderer(){
  if(!window.yarRender || window.__YK_V4_RENDERER__)return;
  const original=window.yarRender;
  window.yarRender=function(){
    const box=document.getElementById("yarChat");
    const msgs=window.yarMessages;
    if(!box||!Array.isArray(msgs))return original();
    box.innerHTML=msgs.map(m=>{
      const user=m.role==="user";let body="";
      if(m.image)body+=`<img class="yar-msg-image" src="${esc(m.image)}" alt="عکس ارسالی">`;
      if(m.text){
        if(!user&&m.text.startsWith(PROFILE_MARK))body+=renderProfile(m.text)||`<span>${esc(m.text).replace(/\n/g,"<br>")}</span>`;
        else body+=`<span>${esc(m.text).replace(/\n/g,"<br>")}</span>`;
      }
      return `<div class="yar-msg ${user?"user":"bot"}"><div>${body}</div></div>`;
    }).join("");
    box.scrollTop=box.scrollHeight;
  };
  window.__YK_V4_RENDERER__=true;
}

function findOfflineAnswer(question=""){
  const q=norm(question);if(!q)return "🌱 سؤال کشاورزی‌ات را بنویس.";
  let crop=detectCrop(q);
  const intent=detectIntent(q);
  if(!crop && /همین محصول|این محصول|آبیاریش|کودش|بیماریش|آفتش|برداشتش/.test(q)) crop=lastCrop();

  if(crop){
    const p=profileFor(crop);
    remember("user",question,crop);
    // نام تنها یا درخواست تعریف کلی => شناسنامه کامل چندبخشی
    const onlyCrop=(norm(question)===norm(crop)) || (p.aliases||[]).some(a=>norm(question)===norm(a));
    if(intent==="general" || intent==="definition" || onlyCrop){
      const payload=PROFILE_MARK+JSON.stringify(makeProfilePayload(p));
      remember("bot",payload,crop);installRenderer();return payload;
    }
    const targeted=answerForIntent(p,intent);
    if(targeted){remember("bot",targeted,crop);return targeted}
    const payload=PROFILE_MARK+JSON.stringify(makeProfilePayload(p));remember("bot",payload,crop);installRenderer();return payload;
  }

  // fallback to بانک فعلی پروژه
  try{
    const db=window.__YK_AGRICULTURE_DB__||[];
    const tokens=q.split(" ").filter(x=>x.length>1);
    let best=null,score=0;
    for(const item of db){
      let s=0;
      for(const k of item.keywords||[]) if(q.includes(norm(k)))s+=norm(k).includes(" ")?5:2;
      for(const t of tokens) if(norm(item.topic||"").includes(t))s++;
      if(s>score){score=s;best=item}
    }
    if(best&&score>=2){
      let out=`🌱 ${best.topic}\n\n`;
      if(best.general)out+=best.general+"\n\n";
      if(best.solution)out+=`✅ راهکار کلی:\n${best.solution}\n\n`;
      out+="ℹ️ برای توصیه دقیق، محصول، مرحله رشد و شرایط واقعی مزرعه را مشخص کن.";
      return out.trim();
    }
  }catch{}
  return "🌱 برای این سؤال در بانک آفلاین پاسخ کافی پیدا نکردم. نام محصول + موضوع را بنویس؛ مثلاً «سیر»، «سیر آبیاری» یا «گندم بیماری».";
}

export {findOfflineAnswer};
export default findOfflineAnswer;

if(typeof window!=="undefined"){
  window.YarKeshavarzOffline={findOfflineAnswer};
  // اگر بانک قدیمی روی window در دسترس باشد، fallback از آن استفاده می‌کند.
  try{window.__YK_AGRICULTURE_DB__=window.__YK_AGRICULTURE_DB__||[];}catch{}
  const oldStart=window.yarRender;
  if(oldStart)installRenderer();
}
