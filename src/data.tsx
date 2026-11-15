/// <reference types="vite/client" />
import { createContext, useContext } from "react";
import earth from "./assets/earth.jpg";
import earthSpec from "./assets/earth_spec.jpg";
import earthNormal from "./assets/earth_normal.jpg";
import earthClouds from "./assets/earth_clouds.png";
import mars from "./assets/mars.jpg";
import marsBump from "./assets/mars_bump.jpg";
import moon from "./assets/moon.jpg";
import moonBump from "./assets/moon_bump.jpg";
import stars from "./assets/stars.jpg";
import blackPoint from "./assets/field/black-point.jpg";
import haughton from "./assets/field/haughton.jpg";
import atacama from "./assets/field/atacama.jpg";
import moonRover from "./assets/field/moon-rover.jpg";
import marsRover from "./assets/field/mars-rover.jpg";


// ===== core =====
// ===== i18n.tsx =====
export type Lang = "en" | "ar";
export type Bi = readonly [string, string]; // [English, Arabic]

export const LangContext = createContext<Lang>("en");

/** Bilingual text renderer. Always uses <span> so it is valid inside <p>,
 *  headings, labels, and table cells; block layout is applied with CSS. */
export function Bi({
  t,
  className = "",
  arClass = "",
  inline = false,
}: {
  t: Bi;
  className?: string;
  arClass?: string;
  inline?: boolean;
}) {
  const lang = useContext(LangContext);
  const block = inline ? "" : "block ";
  if (lang === "en") return <span className={`${block}${className}`}>{t[0]}</span>;
  return (
    <span className={`${block}${className} font-ar ${arClass}`} dir="rtl">
      {t[1]}
    </span>
  );
}

export function useLang() {
  return useContext(LangContext);
}

/** Pick plain text for attributes, titles, and generated reports. */
export function pick(lang: Lang, t: Bi) {
  return lang === "ar" ? t[1] : t[0];
}


// ===== lib/url.ts =====
export function readParam(key: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(key);
}

export function patchParams(patch: Record<string, string | null | undefined>) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === undefined || value === "") url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  window.history.replaceState(null, "", url);
}

// ===== theme =====
export type Theme = "dark" | "light";
export const ThemeContext = createContext<Theme>("dark");
export function useTheme() { return useContext(ThemeContext); }

// ===== data =====
// ===== data.ts =====
export type BodyId = "earth" | "mars" | "moon";
export type Cat = "volcano" | "canyon" | "crater" | "mountain" | "polar" | "dune" | "plain";

export const BODY_IDS: BodyId[] = ["earth", "mars", "moon"];

export const BODIES: Record<
  BodyId,
  { name: Bi; short: string; accent: string; source: { label: Bi; url: string }[] }
> = {
  earth: {
    name: ["Earth", "الأرض"],
    short: "EARTH",
    accent: "#4aa3ff",
    source: [
      { label: ["NASA Earth Facts", "حقائق ناسا عن الأرض"], url: "https://science.nasa.gov/earth/facts/" },
      { label: ["NASA Earth Observatory", "مرصد الأرض التابع لناسا"], url: "https://earthobservatory.nasa.gov/" },
    ],
  },
  mars: {
    name: ["Mars", "المريخ"],
    short: "MARS",
    accent: "#ff7a4a",
    source: [
      { label: ["NASA Mars Facts", "حقائق ناسا عن المريخ"], url: "https://science.nasa.gov/mars/facts/" },
      { label: ["NASA Mars Exploration", "ناسا – استكشاف المريخ"], url: "https://science.nasa.gov/planetary-science/programs/mars-exploration/" },
    ],
  },
  moon: {
    name: ["Moon", "القمر"],
    short: "MOON",
    accent: "#cfd2dc",
    source: [
      { label: ["NASA Moon Facts", "حقائق ناسا عن القمر"], url: "https://science.nasa.gov/moon/facts/" },
      { label: ["NASA LRO Mission", "مهمة المستكشف القمري LRO"], url: "https://science.nasa.gov/mission/lro/" },
    ],
  },
};

export const CATS: Record<Cat, { color: string; name: Bi }> = {
  volcano: { color: "#ff5a36", name: ["Volcanoes", "البراكين"] },
  canyon: { color: "#b46bff", name: ["Canyons & rifts", "الأخاديد والصدوع"] },
  crater: { color: "#ffd23f", name: ["Craters & basins", "الفوهات والأحواض"] },
  mountain: { color: "#3ddc84", name: ["Mountains", "الجبال"] },
  polar: { color: "#5ce1ff", name: ["Polar ice", "الجليد القطبي"] },
  dune: { color: "#ff7eb6", name: ["Deserts & dust", "الصحارى والغبار"] },
  plain: { color: "#4d8dff", name: ["Lava plains & lowlands", "سهول الحمم والمنخفضات"] },
};

export interface Entry {
  name: Bi;
  lat: number;
  lon: number;
  stat: Bi;
  desc: Bi;
}
export interface Group {
  id: string;
  cat: Cat;
  why: Bi;
  earth?: Entry;
  mars?: Entry;
  moon?: Entry;
}

const e = (
  nEn: string,
  nAr: string,
  lat: number,
  lon: number,
  sEn: string,
  sAr: string,
  dEn: string,
  dAr: string
): Entry => ({ name: [nEn, nAr], lat, lon, stat: [sEn, sAr], desc: [dEn, dAr] });

export const GROUPS: Group[] = [
  {
    id: "shield",
    cat: "volcano",
    why: [
      "Broad domes built by runny lava erupting from one vent for millions of years. Weaker gravity and no moving plates let Mars stack its lava far higher.",
      "قباب عريضة بنتها حمم سائلة انبثقت من فوهة واحدة ملايين السنين. الجاذبية الأضعف وغياب حركة الصفائح سمحا للمريخ بتكديس حممه إلى ارتفاعات أكبر بكثير.",
    ],
    earth: e("Mauna Kea & Mauna Loa, Hawaii", "مونا كيا ومونا لوا – هاواي", 19.5, -155.6, "4,207 m above sea level · ~10 km from seafloor", "4,207 م فوق سطح البحر · ~10 كم من قاع المحيط", "Shield volcanoes over a hotspot in the Pacific plate. Mauna Loa is Earth's largest active volcano.", "براكين درعية فوق نقطة ساخنة تحت الصفيحة الهادئة. مونا لوا أكبر بركان نشط على الأرض."),
    mars: e("Olympus Mons", "جبل أوليمبوس", 18.65, -133.8, "~21.9 km high · ~600 km wide", "ارتفاعه ~21.9 كم · عرضه ~600 كم", "The tallest known volcano in the Solar System, about 2.5× the height of Everest above sea level.", "أعلى بركان معروف في المجموعة الشمسية، ويعادل نحو 2.5 ضعف ارتفاع إفرست عن سطح البحر."),
    moon: e("Marius Hills", "تلال ماريوس", 14.0, -56.0, "~300 domes & cones", "~300 قبة ومخروط بركاني", "A volcanic plateau in Oceanus Procellarum covered with lava domes and cones from ancient eruptions.", "هضبة بركانية في محيط العواصف تغطيها قباب ومخاريط حممية من ثورات قديمة."),
  },
  {
    id: "volcprov",
    cat: "volcano",
    why: [
      "Large regions where rising heat cracks and uplifts the crust, feeding lines of volcanoes.",
      "مناطق واسعة تؤدي فيها الحرارة الصاعدة إلى تشقق القشرة ورفعها فتتغذى عليها سلاسل من البراكين.",
    ],
    earth: e("Iceland · Mid-Atlantic Ridge", "أيسلندا · حيد وسط الأطلسي", 64.9, -18.5, "~30 active volcanic systems", "~30 نظاماً بركانياً نشطاً", "Where the North American and Eurasian plates pull apart, lava reaches the surface above sea level.", "حيث تتباعد الصفيحتان الأمريكية الشمالية والأوراسية فتصعد الحمم إلى السطح فوق مستوى البحر."),
    mars: e("Tharsis Montes", "جبال ثارسيس", 1.0, -112.5, "3 volcanoes on a 5,000 km bulge", "3 براكين على انتفاخ بطول 5,000 كم", "Arsia, Pavonis and Ascraeus Mons sit in a line on the huge Tharsis volcanic rise.", "أرسيا وبافونيس وأسكرايوس تصطف على ارتفاع ثارسيس البركاني الضخم."),
    moon: e("Aristarchus Plateau", "هضبة أريستارخوس", 24.0, -48.5, "Brightest large crater · 40 km", "ألمع فوهة كبيرة · 40 كم", "A raised volcanic block with lava channels and glassy ash deposits, near a very young impact crater.", "كتلة بركانية مرتفعة فيها قنوات حممية ورواسب رماد زجاجي بجوار فوهة حديثة العهد."),
  },
  {
    id: "canyon",
    cat: "canyon",
    why: [
      "Long, deep trenches that expose the layers of the crust. On Earth they are mostly carved by rivers; on Mars the crust itself cracked open.",
      "خنادق طويلة وعميقة تكشف طبقات القشرة. على الأرض نحتتها الأنهار غالباً، أما على المريخ فتشققت القشرة نفسها.",
    ],
    earth: e("Grand Canyon, USA", "الوادي العظيم – الولايات المتحدة", 36.1, -112.1, "446 km long · up to 1.8 km deep", "طوله 446 كم · عمقه حتى 1.8 كم", "Carved by the Colorado River through about 2 billion years of rock layers.", "نحته نهر كولورادو عبر طبقات صخرية عمرها نحو ملياري سنة."),
    mars: e("Valles Marineris", "وادي مارينر", -13.9, -59.2, "~4,000 km long · up to 7 km deep", "طوله ~4,000 كم · عمقه حتى 7 كم", "The largest canyon system known — it would stretch across the entire United States.", "أكبر منظومة أخاديد معروفة — ستمتد عبر الولايات المتحدة بأكملها."),
    moon: e("Vallis Schröteri", "وادي شروتر", 26.2, -50.8, "160 km long · ~1 km deep", "طوله 160 كم · عمقه ~1 كم", "A sinuous lava channel (rille) that starts at a volcanic crater shaped like a cobra's head.", "قناة حممية متعرجة (شق) تبدأ من فوهة بركانية على شكل رأس أفعى."),
  },
  {
    id: "rift",
    cat: "canyon",
    why: [
      "Places where the ground is being pulled apart, creating long fault-bounded valleys.",
      "أماكن تتباعد فيها الأرض فتنشأ أودية طويلة تحدها الصدوع.",
    ],
    earth: e("East African Rift", "الصدع الأفريقي الشرقي", 7.0, 37.0, "~3,000 km · Africa slowly splitting", "~3,000 كم · أفريقيا تتشقق ببطء", "A continental rift where the Nubian and Somali plates are moving apart a few millimetres a year.", "صدع قاري تتباعد عنده الصفيحتان النوبية والصومالية بضعة ملّيمترات كل عام."),
    mars: e("Noctis Labyrinthus", "متاهة نوكتيس", -7.0, -101.0, "Maze of valleys up to 5 km deep", "متاهة أودية بعمق حتى 5 كم", "The 'Labyrinth of the Night' at the head of Valles Marineris, formed by collapsing, cracked ground.", "«متاهة الليل» عند رأس وادي مارينر، تكوّنت بانهيار الأرض المتشققة."),
    moon: e("Vallis Rheita", "وادي ريتا", -42.5, 51.5, "~445 km long valley", "وادٍ بطول ~445 كم", "A giant chain of overlapping craters and gouges thrown out by the Rheita impact.", "سلسلة ضخمة من الحفر المتداخلة نتجت عن مقذوفات اصطدام ريتا."),
  },
  {
    id: "bigcrater",
    cat: "crater",
    why: [
      "Impact craters hundreds of kilometres wide, made by asteroids – on Earth most are erased by erosion, on the Moon and Mars they last billions of years.",
      "فوهات اصطدام بعرض مئات الكيلومترات صنعتها كويكبات؛ على الأرض تمحوها عوامل التعرية أما على القمر والمريخ فتبقى مليارات السنين.",
    ],
    earth: e("Chicxulub, Mexico", "تشيكشولوب – المكسيك", 21.3, -89.5, "~180 km wide · 66 million years old", "عرضها ~180 كم · عمرها 66 مليون سنة", "Buried under the Yucatán Peninsula; the impact is linked to the extinction of the non-bird dinosaurs.", "مدفونة تحت شبه جزيرة يوكاتان؛ ويرتبط اصطدامها بانقراض الديناصورات غير الطائرة."),
    mars: e("Gale Crater", "فوهة غيل", -5.4, 137.8, "154 km wide · Mount Sharp 5.5 km", "عرضها 154 كم · جبل شارب 5.5 كم", "Landing site of NASA's Curiosity rover, which found evidence of an ancient lake.", "موقع هبوط مسبار كيوريوسيتي التابع لناسا الذي وجد أدلة على بحيرة قديمة."),
    moon: e("Copernicus", "كوبرنيكوس", 9.6, -20.1, "93 km wide · 3.8 km deep", "عرضها 93 كم · عمقها 3.8 كم", "A young crater (~800 million years) with terraced walls, central peaks and bright rays.", "فوهة فتية (~800 مليون سنة) ذات جدران مدرّجة وقمم مركزية وأشعة ساطعة."),
  },
  {
    id: "smallcrater",
    cat: "crater",
    why: [
      "Small, sharp 'bowl' craters that are young and well preserved.",
      "فوهات صغيرة حادة على شكل «وعاء» حديثة العهد ومحفوظة جيداً.",
    ],
    earth: e("Meteor Crater, Arizona", "فوهة النيزك – أريزونا", 35.03, -111.02, "1.2 km wide · ~50,000 years", "عرضها 1.2 كم · ~50,000 سنة", "One of the best-preserved impact craters on Earth, used to train Apollo astronauts.", "من أفضل فوهات الاصطدام حفظاً على الأرض، وتدرّب فيها رواد أبولو."),
    mars: e("Victoria Crater", "فوهة فيكتوريا", -2.05, -5.5, "~730 m wide · 70 m deep", "عرضها ~730 م · عمقها 70 م", "Explored for two years by the Opportunity rover, which studied layered rock in its walls.", "استكشفها مسبار أوبورتيونيتي عامين ودرس الطبقات الصخرية في جدرانها."),
    moon: e("Linné Crater", "فوهة لينيه", 27.7, 11.8, "2.2 km wide · 600 m deep", "عرضها 2.2 كم · عمقها 600 م", "A tiny, fresh crater in Mare Serenitatis with bright ejected material around it.", "فوهة صغيرة طازجة في بحر الصفاء تحيط بها مواد ساطعة مقذوفة."),
  },
  {
    id: "basin",
    cat: "crater",
    why: [
      "The very biggest scars of the early Solar System, left by planetoid-sized impacts.",
      "أضخم ندوب المجموعة الشمسية المبكرة تركتها اصطدامات أجرام بحجم الكويكبات الكبيرة.",
    ],
    earth: e("Vredefort Dome, South Africa", "قبة فريدفورت – جنوب أفريقيا", -27.0, 27.5, "~300 km original · 2 billion years", "~300 كم في الأصل · ملياري سنة", "The largest verified impact structure on Earth, now eroded to a ring of hills.", "أكبر بنية اصطدام مؤكدة على الأرض، وقد تآكلت إلى حلقة من التلال."),
    mars: e("Hellas Planitia", "سهل هيلاس", -42.4, 70.5, "~2,300 km wide · 7 km deep", "عرضه ~2,300 كم · عمقه 7 كم", "One of the largest visible impact basins in the Solar System; its floor often has frost and clouds.", "من أكبر أحواض الاصطدام المرئية في المجموعة الشمسية، وكثيراً ما يغطي قاعه الصقيع والغيوم."),
    moon: e("South Pole–Aitken Basin", "حوض القطب الجنوبي – إيتكن", -53.0, -169.0, "~2,500 km wide · ~8 km deep", "عرضه ~2,500 كم · عمقه ~8 كم", "The Moon's oldest and biggest basin, on the far side. Target of NASA's Artemis and sample missions.", "أقدم وأكبر أحواض القمر على وجهه البعيد، وهو هدف لبرنامج أرتميس ومهام جمع العينات."),
  },
  {
    id: "range",
    cat: "mountain",
    why: [
      "On Earth, ranges rise where plates collide. On Mars and the Moon, mountain chains are mostly the raised rims of giant impact basins.",
      "على الأرض ترتفع السلاسل حيث تتصادم الصفائح. أما على المريخ والقمر فمعظم السلاسل هي حواف مرتفعة لأحواض اصطدام عملاقة.",
    ],
    earth: e("Himalayas", "الهيمالايا", 28.0, 86.9, "Everest 8,849 m", "إفرست 8,849 م", "Formed by the collision of India and Eurasia; still rising ~5 mm per year.", "تكوّنت من اصطدام الهند بأوراسيا، ولا تزال ترتفع ~5 مم سنوياً."),
    mars: e("Charitum Montes", "جبال خاريتوم", -58.0, -40.0, "Rim of Argyre basin · ~3 km", "حافة حوض أرجير · ~3 كم", "Rugged mountains raised by the Argyre impact, south of the great basin.", "جبال وعرة رفعها اصطدام أرجير جنوب الحوض الكبير."),
    moon: e("Montes Apenninus", "جبال الأبنين القمرية", 18.9, -3.7, "600 km chain · peaks to 5 km", "سلسلة بطول 600 كم · قمم حتى 5 كم", "The southeast rim of the Imbrium basin; Apollo 15 landed at its foot.", "الحافة الجنوبية الشرقية لحوض الأمطار؛ وقد هبطت أبولو 15 عند سفحها."),
  },
  {
    id: "alps",
    cat: "mountain",
    why: ["Two mountain ranges that share a name, but not a birth.", "سلسلتان تتشاركان الاسم لا النشأة."],
    earth: e("The Alps", "جبال الألب", 46.5, 9.0, "Mont Blanc 4,806 m", "مون بلان 4,806 م", "A folded chain created as Africa pushed into Europe; glaciers still carve its valleys.", "سلسلة التوائية نشأت من دفع أفريقيا لأوروبا، وما زالت الأنهار الجليدية تنحت أوديتها."),
    moon: e("Montes Alpes", "جبال الألب القمرية", 47.5, -1.5, "~280 km · cut by Vallis Alpes", "~280 كم · يشقها وادي الألب", "Mountains on the rim of Imbrium basin, split by a 166 km long straight valley.", "جبال على حافة حوض الأمطار يشقها وادٍ مستقيم طوله 166 كم."),
  },
  {
    id: "northice",
    cat: "polar",
    why: ["Frozen water stored at the high latitudes.", "مياه متجمدة مخزنة عند خطوط العرض العالية."],
    earth: e("Greenland Ice Sheet", "الغطاء الجليدي لغرينلاند", 72.0, -40.0, "1.7 million km² · up to 3 km thick", "1.7 مليون كم² · سماكته حتى 3 كم", "Holds enough ice to raise global sea level by about 7 m if it all melted.", "يحتوي جليداً يكفي لرفع مستوى البحار نحو 7 م لو ذاب بالكامل."),
    mars: e("Planum Boreum (north cap)", "سهل بوريوم (القلنسوة الشمالية)", 87.0, 0.0, "~1,000 km wide · water ice", "عرضه ~1,000 كم · جليد مائي", "Layered water-ice cap with spiral troughs, dusted by seasonal carbon-dioxide frost.", "قلنسوة جليد مائي طبقية بأخاديد حلزونية يغطيها صقيع ثاني أكسيد الكربون الموسمي."),
    moon: e("Peary Crater (north pole)", "فوهة بيري (القطب الشمالي)", 88.6, 33.0, "73 km wide · shadowed floor", "عرضها 73 كم · قاع مظلل", "Permanently shadowed regions near the pole may hold water ice.", "مناطق مظلمة دائماً قرب القطب قد تحتوي جليداً مائياً."),
  },
  {
    id: "southice",
    cat: "polar",
    why: ["The southern reservoirs of ice, a record of past climates.", "مستودعات الجليد الجنوبية، وهي سجل للمناخات الماضية."],
    earth: e("Antarctic Ice Sheet", "الغطاء الجليدي لأنتاركتيكا", -80.0, 45.0, "14 million km² · avg. 2 km thick", "14 مليون كم² · متوسط سماكته 2 كم", "Holds ~90% of Earth's ice and ~70% of its fresh water.", "يحتوي نحو 90% من جليد الأرض و70% من مياهها العذبة."),
    mars: e("Planum Australe (south cap)", "سهل أوستراليه (القلنسوة الجنوبية)", -86.0, 0.0, "~350 km wide · CO₂ & water ice", "عرضه ~350 كم · جليد ثاني أكسيد الكربون والماء", "A permanent cap of carbon-dioxide ice over thick layers of water ice.", "قلنسوة دائمة من جليد ثاني أكسيد الكربون فوق طبقات سميكة من جليد الماء."),
    moon: e("Shackleton Crater", "فوهة شاكلتون", -89.5, 0.0, "21 km wide · 4.2 km deep", "عرضها 21 كم · عمقها 4.2 كم", "A candidate site for Artemis missions: its floor never sees sunlight and may hold ice.", "موقع مرشح لمهام أرتميس: قاعها لا يرى الشمس أبداً وقد يحتوي جليداً."),
  },
  {
    id: "lavaplain",
    cat: "plain",
    why: ["Vast flat plains made of cooled basalt lava.", "سهول مسطحة شاسعة من حمم البازلت المتجمدة."],
    earth: e("Deccan Traps, India", "فخاخ الدكن – الهند", 19.0, 74.5, "~500,000 km² of basalt", "~500,000 كم² من البازلت", "Flood-basalt plateau erupted ~66 million years ago.", "هضبة بازلتية فيضية ثارت قبل ~66 مليون سنة."),
    mars: e("Utopia Planitia", "سهل يوتوبيا", 46.7, 117.5, "~3,300 km wide plain", "سهل بعرض ~3,300 كم", "A giant smooth lowland covered by lava and sediments; Viking 2 and China's Zhurong landed here.", "سهل منخفض أملس ضخم تغطيه الحمم والرواسب؛ هبط فيه فايكنغ 2 والمسبار الصيني تشورونغ."),
    moon: e("Mare Imbrium", "بحر الأمطار", 32.8, -15.6, "~1,150 km wide basalt plain", "سهل بازلتي بعرض ~1,150 كم", "Dark lava filled a giant impact basin about 3.2–3.9 billion years ago.", "ملأت الحمم الداكنة حوضاً عملاقاً قبل نحو 3.2–3.9 مليار سنة."),
  },
  {
    id: "lowland",
    cat: "plain",
    why: ["Huge low basins that cover much of a world's surface.", "أحواض منخفضة هائلة تغطي جزءاً كبيراً من سطح العالم."],
    earth: e("Pacific Ocean basin", "حوض المحيط الهادئ", 0.0, -150.0, "165 million km² · basalt seafloor", "165 مليون كم² · قاع بازلتي", "The ocean floor is young volcanic rock about 4 km below sea level.", "قاع المحيط صخر بركاني فتي يقع نحو 4 كم تحت مستوى البحر."),
    mars: e("Vastitas Borealis", "الأراضي المنخفضة الشمالية", 68.0, 20.0, "Lowlands ~5 km below the south", "منخفضات أدنى بنحو 5 كم من الجنوب", "A smooth northern plain that may once have held an ocean.", "سهل شمالي أملس ربما احتضن محيطاً في الماضي."),
    moon: e("Oceanus Procellarum", "محيط العواصف", 18.4, -57.4, "~2,500 km · largest 'sea'", "~2,500 كم · أكبر «بحر»", "The largest dark lava plain on the near side.", "أكبر سهل حممي داكن على الوجه القريب."),
  },
  {
    id: "desert",
    cat: "dune",
    why: ["Dry, dusty ground shaped by wind and temperature.", "أرض جافة مغبرة صاغتها الرياح ودرجات الحرارة."],
    earth: e("Sahara Desert", "الصحراء الكبرى", 23.0, 12.0, "9.2 million km² · largest hot desert", "9.2 مليون كم² · أكبر صحراء حارة", "Sand seas and rocky plateaus shaped by wind; dust travels as far as the Amazon.", "بحار رملية وهضاب صخرية صاغتها الرياح؛ ويصل غبارها حتى الأمازون."),
    mars: e("Meridiani Planum", "سهل ميريديانى", -2.0, -0.5, "Flat plain rich in hematite", "سهل مستوٍ غني بالهيماتيت", "Opportunity rover drove over 45 km here across wind-ripples and iron-rich 'blueberries'.", "قطع مسبار أوبورتيونيتي أكثر من 45 كم هنا فوق تموجات الرياح و«التوت الأزرق» الغني بالحديد."),
    moon: e("Mare Tranquillitatis", "بحر الهدوء", 8.5, 31.4, "Apollo 11 site · regolith dust", "موقع أبولو 11 · غبار الريغوليث", "A flat plain covered by fine, sharp lunar dust where humans first walked in 1969.", "سهل مسطح يغطيه غبار قمري ناعم حاد، مشى عليه البشر لأول مرة عام 1969."),
  },
  {
    id: "dunes",
    cat: "dune",
    why: ["Fields of wind-blown sand dunes.", "حقول من الكثبان الرملية التي تنقلها الرياح."],
    earth: e("Namib Sand Sea", "بحر الرمال في ناميب", -24.7, 15.2, "Dunes up to ~380 m", "كثبان حتى ~380 م", "Some of the tallest dunes on Earth, in the oldest desert in the world.", "بعض أعلى الكثبان على الأرض في أقدم صحراء في العالم."),
    mars: e("Proctor Crater Dunes", "كثبان فوهة بروكتر", -47.5, 30.5, "Dark basaltic dune field", "حقل كثبان بازلتية داكنة", "Dark dunes of volcanic sand inside a crater, imaged by NASA's Mars Reconnaissance Orbiter.", "كثبان داكنة من رمال بركانية داخل فوهة، صورها مسبار ناسا MRO."),
  },
];

/* ----------------------------- Planet facts ----------------------------- */

export interface FactRow {
  key: string;
  label: Bi;
}
export const FACT_ROWS: FactRow[] = [
  { key: "diameter", label: ["Diameter", "القطر"] },
  { key: "gravity", label: ["Gravity", "الجاذبية"] },
  { key: "day", label: ["Day length", "طول اليوم"] },
  { key: "year", label: ["Year", "السنة"] },
  { key: "atmosphere", label: ["Atmosphere", "الغلاف الجوي"] },
  { key: "temp", label: ["Temperature", "درجة الحرارة"] },
  { key: "moons", label: ["Moons", "الأقمار"] },
  { key: "distance", label: ["Distance from Sun", "البعد عن الشمس"] },
  { key: "highest", label: ["Highest point", "أعلى نقطة"] },
  { key: "lowest", label: ["Lowest point", "أخفض نقطة"] },
  { key: "water", label: ["Water", "الماء"] },
  { key: "terrain", label: ["Terrain", "التضاريس"] },
];

export const FACTS: Record<BodyId, Record<string, Bi>> = {
  earth: {
    diameter: ["12,742 km", "12,742 كم"],
    gravity: ["9.81 m/s² (1 g)", "9.81 م/ث² (1 g)"],
    day: ["24 hours", "24 ساعة"],
    year: ["365.25 days", "365.25 يوماً"],
    atmosphere: ["Nitrogen 78%, oxygen 21%, argon ~1%", "نيتروجين 78%، أكسجين 21%، أرجون ~1%"],
    temp: ["Average +15 °C · range −89 to +57 °C", "المتوسط +15 °م · المدى من −89 إلى +57 °م"],
    moons: ["1 (the Moon)", "1 (القمر)"],
    distance: ["149.6 million km (1 AU)", "149.6 مليون كم (وحدة فلكية)"],
    highest: ["Mount Everest · 8,849 m", "قمة إفرست · 8,849 م"],
    lowest: ["Challenger Deep · −10,935 m", "أعمق نقطة في خندق ماريانا · −10,935 م"],
    water: ["71% of the surface is liquid-water oceans", "71% من السطح محيطات من الماء السائل"],
    terrain: [
      "Oceans, continents, folded mountain chains, rift valleys, ice sheets and deserts – constantly reshaped by plate tectonics, water, wind and life.",
      "محيطات وقارات وسلاسل جبال التوائية وصدوع وصفائح جليدية وصحارى — تعيد صياغتها باستمرار الصفائح التكتونية والماء والرياح والحياة.",
    ],
  },
  mars: {
    diameter: ["6,779 km (53% of Earth)", "6,779 كم (53% من الأرض)"],
    gravity: ["3.71 m/s² (0.38 g)", "3.71 م/ث² (0.38 g)"],
    day: ["24 h 39 min (a “sol”)", "24 ساعة و39 دقيقة («سول»)"],
    year: ["687 Earth days", "687 يوماً أرضياً"],
    atmosphere: ["Carbon dioxide 95%, nitrogen 2.8%, argon 2% — very thin", "ثاني أكسيد الكربون 95%، نيتروجين 2.8%، أرجون 2% — رقيق جداً"],
    temp: ["Average −63 °C · range −140 to +20 °C", "المتوسط −63 °م · المدى من −140 إلى +20 °م"],
    moons: ["2 (Phobos, Deimos)", "2 (فوبوس وديموس)"],
    distance: ["227.9 million km (1.52 AU)", "227.9 مليون كم (1.52 وحدة فلكية)"],
    highest: ["Olympus Mons · ~21.9 km", "جبل أوليمبوس · ~21.9 كم"],
    lowest: ["Hellas Planitia floor · ~ −7.2 km", "قاع سهل هيلاس · ~ −7.2 كم"],
    water: ["No liquid water on the surface; ice at the poles and underground", "لا ماء سائل على السطح؛ جليد عند القطبين وتحت الأرض"],
    terrain: [
      "Cold rocky desert: giant volcanoes, huge canyons, polar caps of water ice and CO₂, and dry ancient river channels.",
      "صحراء صخرية باردة: براكين عملاقة وأخاديد ضخمة وقلنسوات قطبية من جليد الماء وثاني أكسيد الكربون ومجارٍ نهرية قديمة جافة.",
    ],
  },
  moon: {
    diameter: ["3,475 km (27% of Earth)", "3,475 كم (27% من الأرض)"],
    gravity: ["1.62 m/s² (0.17 g)", "1.62 م/ث² (0.17 g)"],
    day: ["29.5 Earth days (sunrise to sunrise)", "29.5 يوماً أرضياً (من شروق إلى شروق)"],
    year: ["Orbits Earth every 27.3 days", "تدور حول الأرض كل 27.3 يوماً"],
    atmosphere: ["Almost none — a thin exosphere of helium, neon and argon", "شبه معدوم — غلاف خارجي رقيق من الهيليوم والنيون والأرجون"],
    temp: ["Day up to +127 °C · night down to −173 °C", "نهاراً حتى +127 °م · ليلاً حتى −173 °م"],
    moons: ["0", "0"],
    distance: ["384,400 km from Earth (avg.)", "384,400 كم عن الأرض (في المتوسط)"],
    highest: ["Selenean Summit · ≈ +10.8 km", "قمة سيلينيان · ≈ +10.8 كم"],
    lowest: ["South Pole–Aitken floor · ≈ −9 km", "قاع حوض القطب الجنوبي–إيتكن · ≈ −9 كم"],
    water: ["No liquid water; ice in permanently shadowed polar craters", "لا ماء سائل؛ جليد في فوهات قطبية مظللة دائماً"],
    terrain: [
      "Bright, heavily cratered highlands and dark basalt plains (“maria”) buried under fine dust. With no wind or water, craters survive for billions of years.",
      "مرتفعات ساطعة مليئة بالفوهات وسهول بازلتية داكنة («بحار») مغطاة بغبار ناعم. ومع غياب الرياح والماء تبقى الفوهات مليارات السنين.",
    ],
  },
};

export const TERRAIN_NOTES: Record<BodyId, Bi[]> = {
  earth: [
    ["Plate tectonics builds mountains, trenches and volcanoes along moving plate edges.", "تكتونية الصفائح تبني الجبال والخنادق والبراكين على حواف الصفائح المتحركة."],
    ["Liquid water carves river valleys and canyons and fills oceans up to 11 km deep.", "الماء السائل ينحت الأودية والأخاديد ويملأ محيطات بعمق يصل إلى 11 كم."],
    ["Active weather and life erase most impact craters within millions of years.", "الطقس النشط والحياة يمحوان معظم فوهات الاصطدام خلال ملايين السنين."],
  ],
  mars: [
    ["Two very different halves: smooth northern lowlands and old, cratered southern highlands, ~5 km higher.", "نصفان مختلفان جداً: سهول شمالية ملساء ومرتفعات جنوبية قديمة مليئة بالفوهات أعلى بنحو 5 كم."],
    ["No plate tectonics, so volcanoes stay over one hotspot and grow gigantic (Olympus Mons).", "لا تكتونية صفائح، فتبقى البراكين فوق نقطة ساخنة واحدة وتنمو إلى أحجام ضخمة (أوليمبوس)."],
    ["Dry river networks and lake deposits show water once flowed on the surface billions of years ago.", "شبكات أنهار جافة ورواسب بحيرات تبيّن أن الماء جرى على السطح قبل مليارات السنين."],
  ],
  moon: [
    ["The near side has dark basalt 'seas'; the far side is almost all bright cratered highland.", "الوجه القريب فيه «بحار» بازلتية داكنة، والوجه البعيد مرتفعات ساطعة مليئة بالفوهات في معظمه."],
    ["Billions of years of impacts have churned the surface into a layer of dust and rubble (regolith).", "مليارات السنين من الاصطدامات حوّلت السطح إلى طبقة من الغبار والركام (الريغوليث)."],
    ["Polar craters are so deep they never see sunlight and are among the coldest places known.", "الفوهات القطبية عميقة لدرجة أنها لا ترى الشمس أبداً وهي من أبرد الأماكن المعروفة."],
  ],
};

export const PAIR_NOTES: Record<string, Bi> = {
  "earth-mars": [
    "Mars has about half of Earth's diameter and 28% of its surface area — roughly the same as Earth's dry land. Its thin CO₂ air gives little protection from radiation and big temperature swings, and gravity is only 38% of Earth's. Days are nearly the same length, but a Martian year lasts twice as long.",
    "قطر المريخ نحو نصف قطر الأرض ومساحة سطحه 28% من مساحة سطحها — أي ما يعادل تقريباً اليابسة على الأرض. غلافه الجوي الرقيق من ثاني أكسيد الكربون يوفر حماية ضعيفة من الإشعاع وتقلبات الحرارة، وجاذبيته 38% فقط من جاذبية الأرض. طول اليوم متقارب تقريباً، لكن السنة المريخية ضعف السنة الأرضية.",
  ],
  "earth-moon": [
    "The Moon is about a quarter of Earth's width and has no air, no oceans and no weather. Gravity is one-sixth of Earth's, and temperatures swing by 300 °C between day and night. Its surface keeps the record of 4 billion years of impacts.",
    "عرض القمر نحو ربع عرض الأرض، ولا هواء فيه ولا محيطات ولا طقس. جاذبيته سُدس جاذبية الأرض، وتتغير حرارته بنحو 300 °م بين النهار والليل. ويحتفظ سطحه بسجل أربعة مليارات سنة من الاصطدامات.",
  ],
  "mars-moon": [
    "Both are dry, cratered worlds, but Mars has a thin atmosphere, dust storms, volcanoes and canyons, and about twice the Moon's diameter and gravity. The Moon is airless, so its craters and footprints stay unchanged for ages.",
    "كلاهما عالم جاف مليء بالفوهات، لكن للمريخ غلافاً جوياً رقيقاً وعواصف غبار وبراكين وأخاديد، وقطره وجاذبيته نحو ضعف القمر. أما القمر فلا هواء فيه، لذا تبقى فوهاته وآثار الأقدام بلا تغيير لأزمنة طويلة.",
  ],
};

export function pairKey(a: BodyId, b: BodyId) {
  return [a, b].sort().join("-");
}


// ===== mission-data.ts =====
/* Field-site catalog and bilingual copy ported from the uploaded mission-lab.js. */
export const siteData = [
  {
    id: "black-point", lat: 35.6, lon: -111.5, scores: [95, 92, 68, 64, 96],
    access: 61, airport: 110, cost: 2, season: "Oct–Nov", seasonAr: "أكتوبر–نوفمبر",
    tested: true, badge: "NASA D-RATS field test", badgeAr: "اختبار ميداني NASA D-RATS",
    name: "Black Point Lava Flow, Arizona", nameAr: "تدفق حمم بلاك بوينت، أريزونا",
    terrain: "Basaltic lava flow", terrainAr: "تدفق حمم بازلتية",
    hazard: "Jagged basalt and abrasive dust", hazardAr: "بازلت حاد وغبار كاشط",
    warning: "Sharp basalt edges can abrade seals, wheels, and suit joints. Add dust-ingress and mobility tests; this is a terrestrial proxy, not lunar regolith.",
    warningAr: "قد تُتلف حواف البازلت الحادة الأختام والعجلات ومفاصل البدلات. أضف اختبارات دخول الغبار والحركة؛ هذا نموذج أرضي وليس تربة قمرية.",
    img: "https://images-assets.nasa.gov/image/jsc2008e138809/jsc2008e138809~medium.jpg",
    imgAlt: "NASA Lunar Electric Rover field test at Black Point Lava Flow",
    imgAltAr: "اختبار ناسا للمركبة القمرية الكهربائية في تدفق حمم بلاك بوينت",
    imgCaption: "Lunar Electric Rover, Desert RATS, 2008",
    imgCaptionAr: "المركبة القمرية الكهربائية، Desert RATS، 2008",
    imgSource: "https://images.nasa.gov/details/jsc2008e138809",
    imgSourceName: "NASA/JSC archive"
  },
  {
    id: "haughton", lat: 75.4, lon: -89.7, scores: [91, 87, 28, 43, 99],
    access: 24, airport: 300, cost: 5, season: "Jul–Aug", seasonAr: "يوليو–أغسطس",
    tested: true, badge: "NASA-led Haughton-Mars Project", badgeAr: "مشروع هوتون-المريخ بقيادة ناسا",
    name: "Haughton Crater, Devon Island", nameAr: "فوهة هوتون، جزيرة ديفون",
    terrain: "Polar desert / impact crater", terrainAr: "صحراء قطبية / فوهة اصطدام",
    hazard: "Permafrost, cold, and isolation", hazardAr: "الجليد الدائم والبرد والعزلة",
    warning: "Extreme cold and remote operations can stress batteries, lubricants, and rescue plans. Add cold-soak and communications-loss scenarios.",
    warningAr: "قد يضغط البرد الشديد والعمل عن بُعد على البطاريات ومواد التشحيم وخطط الإنقاذ. أضف سيناريوهات التبريد وفقدان الاتصال.",
    img: "https://images-assets.nasa.gov/image/ARC-2007-ACD07-0170-005/ARC-2007-ACD07-0170-005~medium.jpg",
    imgAlt: "NASA K-10 rovers surveying the Haughton impact crater",
    imgAltAr: "مركبتا K-10 التابعتان لناسا تستكشفان فوهة هوتون",
    imgCaption: "K-10 rover field survey, Haughton-Mars Project",
    imgCaptionAr: "مسح ميداني بمركبة K-10، مشروع هوتون-المريخ",
    imgSource: "https://images.nasa.gov/details/ARC-2007-ACD07-0170-005",
    imgSourceName: "NASA Ames archive"
  },
  {
    id: "atacama", lat: -22.9, lon: -68.2, scores: [86, 93, 79, 63, 42],
    access: 77, airport: 100, cost: 3, season: "Mar–Nov", seasonAr: "مارس–نوفمبر",
    tested: false, badge: "NASA Earth observation", badgeAr: "رصد ناسا للأرض",
    name: "Atacama Desert, Chile", nameAr: "صحراء أتاكاما، تشيلي",
    terrain: "Hyper-arid volcanic plateau", terrainAr: "هضبة بركانية شديدة الجفاف",
    hazard: "Fine dust and extreme aridity", hazardAr: "غبار ناعم وجفاف شديد",
    warning: "Exceptionally dry, dusty air is useful for filtration and materials trials, but does not reproduce lunar vacuum, radiation, or electrostatic charging.",
    warningAr: "يفيد الهواء شديد الجفاف والغبار في اختبارات الترشيح والمواد، لكنه لا يحاكي فراغ القمر أو الإشعاع أو الشحنات الكهروستاتيكية.",
    img: "https://images-assets.nasa.gov/image/PIA20973/PIA20973~medium.jpg",
    imgAlt: "NASA Terra satellite view of the Atacama Desert at Chuquicamata, Chile",
    imgAltAr: "صورة قمر تيرا التابع لناسا لصحراء أتاكاما عند تشوكويكاماتا، تشيلي",
    imgCaption: "Terra/ASTER observation, Atacama Desert",
    imgCaptionAr: "رصد تيرا/ASTER لصحراء أتاكاما",
    imgSource: "https://images.nasa.gov/details/PIA20973",
    imgSourceName: "NASA/JPL-Caltech"
  }
] as const;

export type MissionSite = (typeof siteData)[number];
export type SiteId = MissionSite["id"];
export type MissionTarget = "mars" | "moon";

export const scoreKeys = ["terrain", "geology", "logistics", "safety", "heritage"] as const;
export type ScoreKey = (typeof scoreKeys)[number];
export const defaultWeights = [30, 25, 20, 15, 10];
export const scoreColors = ["#9ec9eb", "#e1b78d", "#a9d2b7"];

export const gravity = [
  { id: "earth", value: 9.81, en: "Earth", ar: "الأرض" },
  { id: "moon", value: 1.62, en: "Moon", ar: "القمر" },
  { id: "mars", value: 3.71, en: "Mars", ar: "المريخ" }
] as const;

export const missionCopy = {
  en: {
    skipLoading: "Skip loading", labKicker: "FIELD RESEARCH / DECISION SUPPORT", labEyebrow: "MISSION ANALOG SITE FINDER",
    brandCaption: "EXPLORING<br>THE UNIVERSE", navEarth: "Earth", navMoon: "The Moon", navLab: "Mission Lab",
    navMissions: "Missions", navDiscover: "Discover", heroEyebrow: "THE VIEW FROM OUT HERE",
    heroTitle: "One home.<br><em>Endless</em> horizons.",
    heroCopy: "From the blue world beneath our feet to the Moon that calls us forward, exploration changes how we see everything.",
    heroButton: "Begin exploring", heroCoordinate: "EARTH / MOON SYSTEM",
    introLabel: "OUR COSMIC NEIGHBORHOOD", introTitle: "Look up.<br>Look <em>closer.</em>",
    introCopy: "Every discovery begins with a question. NASA explores the worlds around us to understand our own—and to make the impossible feel a little closer.",
    introLink: "See what we're exploring", earthEyebrow: "OUR PALE BLUE DOT",
    earthTitle: "Earth,<br><em>unfiltered.</em>",
    earthCopy: "Our home is a living, changing world. From orbit, satellites reveal the intricate systems that connect every ocean, forest, and city.",
    earthButton: "Explore our planet", earthNote: "A WORLD WORTH KNOWING",
    moonLabel: "OUR CLOSEST NEIGHBOR", moonEyebrow: "BACK TO THE MOON",
    moonTitle: "A familiar<br>light. A <em>new</em><br>beginning.",
    moonCopy: "The Moon is more than a destination. It's our proving ground for living and working beyond Earth—and the first step toward Mars.",
    moonLink: "Meet the Artemis generation", missionLabel: "THE NEXT GIANT LEAP",
    missionTitle: "Curiosity has<br><em>no finish line.</em>",
    missionCopy: "Robots, telescopes, and human explorers—each mission brings a new perspective on the universe we share.",
    closingEyebrow: "THE UNIVERSE IS CLOSER THAN YOU THINK",
    closingTitle: "Wonder is<br>just the <em>beginning.</em>",
    closingButton: "Keep exploring NASA", footerMission: "EXPLORING FOR THE BENEFIT OF ALL", backTop: "BACK TO TOP",
    pageDescription: "Explore Earth, the Moon, and the next chapter of human spaceflight with NASA.",
    ogDescription: "Compare Earth analog sites for Moon and Mars missions, tune your criteria, and build a mission-ready report.",
    labTitle: "Find the right", labTitleEm: "ground for the unknown.",
    labIntro: "Compare real Earth environments as testbeds for lunar and Martian missions. Tune the priorities, see the trade-offs, and make the next decision with your eyes open.",
    twinKicker: "PLANETARY SURFACE COMPARISON", twinTitle: "Find a <em>geographical twin.</em>",
    twinIntro: "Pick a place on one world, choose an environment profile, and explore example analogs on another. NASA basemaps are real; the match scores are a clearly labeled demonstration.",
    sourceWorld: "FROM", targetWorld: "TO", environmentProfile: "ENVIRONMENT PROFILE",
    findSimilar: "Find Similar Spaces", resetMap: "Reset", mapClickHint: "Click the source map to choose an area. Drag to pan; use the controls or scroll to zoom.",
    noPoint: "No area selected", targetHint: "Similar areas appear here", twinMatches: "ILLUSTRATIVE GEOGRAPHICAL TWINS",
    similarAreas: "Example similar spaces", demoIndex: "DEMO MATCH INDEX · NOT A SCIENTIFIC RESULT",
    twinScienceNote: "NASA spacecraft imagery and elevation basemaps are used for visual context. Temperature, solar exposure, water availability, terrain labels, and similarity percentages below are sample values for the prototype—not outputs from a scientific model.",
    dataSources: "MAP DATA",
    stepSites: "Choose sites", stepWeights: "Set priorities", stepResults: "Review results", chooseSites: "Choose your field sites",
    chooseNote: "Compare two or three candidate locations at once.", customHeading: "Have coordinates in mind?",
    customNote: "Enter a point to find the nearest site in this catalog. Distance is a straight-line estimate. If all three slots are full, it replaces the last selected site.",
    latitude: "Latitude", longitude: "Longitude", nearestEmpty: "Enter valid coordinates to find the nearest catalog site.",
    tuneWeights: "Tune mission priorities", reset: "Reset", weightsNote: "Change each weight; the site scores and ranking recalculate instantly.",
    destination: "Mission destination", mars: "Mars", moon: "The Moon", analyze: "Analyze selected sites", skipAnalysis: "Skip analysis animation",
    awaiting: "AWAITING FIELD SELECTION", placeholderTitle: "Your comparison<br>starts here.",
    placeholderText: "Choose two or three analog sites, then run the analysis to reveal the scorecard, map, and engineering trade-offs.",
    analysisComplete: "ANALYSIS COMPLETE", resultsTitle: "Mission fit, at a glance.", exportReport: "Export mission report",
    radarKicker: "MULTI-CRITERIA VIEW", radarTitle: "Capability radar", globeKicker: "SITE LOCATOR", globeTitle: "Earth field view",
    terrain: "Terrain", elevation: "Elevation", heatmap: "Heatmap", focusSite: "Focus site", geology: "Geology", logistics: "Logistics",
    safety: "Safety", heritage: "Mission heritage",
    mapNote: "Illustrative globe view. Elevation and heat layers are schematic, not navigational data.",
    photoKicker: "FIELD / FLIGHT HARDWARE", photoTitle: "Ground meets the target world.",
    photoSourceNote: "NASA archival field and spacecraft images. Captions link to the original records.",
    logisticsKicker: "GETTING THERE IS PART OF THE MISSION", logisticsTitle: "Logistics & access",
    estimateNote: "Access and cost indicators are qualitative planning estimates, not quotes or travel advice.",
    warningKicker: "ENGINEERING WATCHLIST", warningTitle: "Turn terrain into test cases.",
    gravityKicker: "STRUCTURAL LOAD GAP", gravityTitle: "Same mass. Different weight.", payloadMass: "Equipment mass",
    gravityNote: "Weight is an idealized gravity load (mass × surface gravity); real structural design requires mission-specific loads and safety factors.",
    disclaimer: "Scores are comparative planning aids based on illustrative public-domain criteria, not NASA recommendations, certified site surveys, or operational safety guidance. Verify local permits, weather, access, and hazards before field work.",
    footerLine: "A little perspective changes everything.", moonCaption: "THE MOON", moonDistance: "384,400 KM FROM HOME",
    cardHuman: "01 / HUMAN EXPLORATION", cardArtemis: "Our return to the Moon",
    cardScience: "02 / EARTH SCIENCE", cardPlanet: "Our changing planet", cardEarth: "See Earth in a new light",
    cardDeep: "03 / DEEP SPACE", cardUnknown: "Into the unknown", cardUniverse: "Explore the universe",
    noSites: "Select at least two sites to compare.",
    maxSites: "Compare no more than three sites.", selectionStatus: "{count} / 3 selected",
    weightsTotal: "Priority weights are relative; they are normalized automatically for scoring.",
    nearestFound: "Nearest catalog site: {name} — about {distance} km away.",
    useNearest: "Use this site", score: "MISSION FIT", rank: "RANK {rank}", tested: "VERIFIED FIELD PROGRAM",
    notTested: "NO HARDWARE TEST CLAIMED", scoreLabels: ["Terrain match", "Geology", "Logistics", "Safety", "Mission heritage"],
    metricLabels: ["Terrain", "Geology", "Access", "Safety", "Heritage"],
    hybridKicker: "HYBRID SITE SUGGESTION", hybridTitle: "{first} + {second}",
    hybridText: "Together these sites cover more weighted capabilities than either alone (+{gain} fit points). {reason}",
    hybridReason: "They complement one another across {items}.", hybridSame: "The selected sites already provide the strongest overall combination in this catalog.",
    selectTwoFirst: "Select two or three sites before running the analysis.",
    analysisRunning: "Comparing terrain, access, and mission fit…", badgeNASA: "NASA VERIFIED",
    airport: "Nearest airport", cost: "Field cost", season: "Best season", accessScore: "Access index",
    costLow: "Low", costMedium: "Medium", costHigh: "High", costVeryHigh: "Very high",
    warningLabel: "ENGINEERING NOTE", moonWeight: "Weight on Moon", marsWeight: "Weight on Mars",
    reportTitle: "MISSION ANALOG SITE REPORT", reportTarget: "Mission destination", reportGenerated: "Generated from current browser selections",
    reportSites: "Compared sites", reportWeights: "Priority weights", reportHybrid: "Suggested hybrid", reportWarnings: "Engineering watchlist", reportWeight: "Weight (N)", reportVsEarth: "vs Earth",
    reportDisclaimer: "Planning aid only. Scores and logistics are illustrative estimates, not official NASA data, a site survey, or safety guidance.",
    customInvalid: "Use a latitude from −90 to 90 and longitude from −180 to 180.",
    title: "Tera Twin — Earth & Planetary Analog Explorer"
  },
  ar: {
    skipLoading: "تخطي التحميل", labKicker: "بحث ميداني / دعم القرار", labEyebrow: "مستكشف مواقع محاكاة المهمات",
    brandCaption: "استكشاف<br>الكون", navEarth: "الأرض", navMoon: "القمر", navLab: "مختبر المهمات",
    navMissions: "المهمات", navDiscover: "اكتشف", heroEyebrow: "منظر من هناك",
    heroTitle: "موطن واحد.<br><em>آفاق</em> لا تنتهي.",
    heroCopy: "من عالمنا الأزرق إلى القمر الذي يدعونا للمضي قدماً، يغيّر الاستكشاف نظرتنا إلى كل شيء.",
    heroButton: "ابدأ الاستكشاف", heroCoordinate: "نظام الأرض / القمر",
    introLabel: "جوارنا الكوني", introTitle: "ارفع نظرك.<br>وانظر <em>أقرب.</em>",
    introCopy: "يبدأ كل اكتشاف بسؤال. تستكشف ناسا العوالم من حولنا لفهم عالمنا، وجعل ما يبدو مستحيلاً أقرب إلينا.",
    introLink: "اكتشف ما نستكشفه", earthEyebrow: "نقطتنا الزرقاء الشاحبة",
    earthTitle: "الأرض،<br><em>كما هي.</em>",
    earthCopy: "موطننا عالم حي ومتغير. تكشف الأقمار الصناعية من المدار الأنظمة الدقيقة التي تربط المحيطات والغابات والمدن.",
    earthButton: "استكشف كوكبنا", earthNote: "عالم يستحق المعرفة",
    moonLabel: "أقرب جيراننا", moonEyebrow: "العودة إلى القمر",
    moonTitle: "ضوء مألوف،<br>وبداية <em>جديدة.</em>",
    moonCopy: "القمر أكثر من مجرد وجهة؛ إنه ميدان اختبار للعيش والعمل خارج الأرض، والخطوة الأولى نحو المريخ.",
    moonLink: "تعرّف على جيل أرتميس", missionLabel: "القفزة العملاقة التالية",
    missionTitle: "للفضول<br><em>لا خط نهاية.</em>",
    missionCopy: "تمنحنا الروبوتات والتلسكوبات والمستكشفون منظوراً جديداً للكون الذي نتشاركه.",
    closingEyebrow: "الكون أقرب مما تتصور",
    closingTitle: "الدهشة هي<br><em>مجرد البداية.</em>",
    closingButton: "تابع استكشاف ناسا", footerMission: "نستكشف لمنفعة الجميع", backTop: "إلى الأعلى",
    pageDescription: "استكشف الأرض والقمر والفصل التالي من رحلات البشر إلى الفضاء مع ناسا.",
    ogDescription: "قارن مواقع محاكاة أرضية لمهمات القمر والمريخ، وعدّل المعايير وأنشئ تقرير المهمة.",
    labTitle: "اختر", labTitleEm: "أرضاً للمجهول.",
    labIntro: "قارن بيئات أرضية حقيقية كمواقع اختبار للمهمات القمرية والمريخية. عدّل الأولويات، واستكشف المفاضلات، واتخذ قرارك التالي بوضوح.",
    twinKicker: "مقارنة أسطح الكواكب", twinTitle: "اكتشف <em>النظير الجغرافي.</em>",
    twinIntro: "اختر منطقة على أحد العوالم وحدد نمط البيئة لاستكشاف أمثلة مشابهة على عالم آخر. خرائط ناسا حقيقية؛ أما درجات التشابه فهي توضيحية بوضوح.",
    sourceWorld: "من", targetWorld: "إلى", environmentProfile: "النمط البيئي",
    findSimilar: "ابحث عن أماكن مشابهة", resetMap: "إعادة", mapClickHint: "انقر على خريطة المصدر لاختيار منطقة. اسحب لتحريك الخريطة واستخدم الأزرار أو عجلة الفأرة للتكبير.",
    noPoint: "لم تُحدد منطقة", targetHint: "ستظهر المناطق المشابهة هنا", twinMatches: "نظائر جغرافية توضيحية",
    similarAreas: "أمثلة على مناطق متشابهة", demoIndex: "مؤشر تجريبي · ليس نتيجة علمية",
    twinScienceNote: "تُستخدم صور المركبات الفضائية وخرائط الارتفاع من ناسا للسياق البصري. درجات الحرارة والتعرض الشمسي وتوفر المياه ووصف التضاريس ونسب التشابه أدناه قيم نموذجية للنسخة التجريبية، وليست ناتجة عن نموذج علمي.",
    dataSources: "مصادر الخرائط",
    stepSites: "اختر المواقع", stepWeights: "حدد الأولويات", stepResults: "راجع النتائج", chooseSites: "اختر مواقع العمل الميداني",
    chooseNote: "قارن موقعين أو ثلاثة مواقع مرشحة في الوقت نفسه.", customHeading: "لديك إحداثيات محددة؟",
    customNote: "أدخل نقطة للعثور على أقرب موقع في هذا الدليل. المسافة تقدير بخط مستقيم. إذا امتلأت الخيارات الثلاثة فسيُستبدل آخر موقع محدد.",
    latitude: "خط العرض", longitude: "خط الطول", nearestEmpty: "أدخل إحداثيات صحيحة للعثور على أقرب موقع في الدليل.",
    tuneWeights: "اضبط أولويات المهمة", reset: "إعادة الضبط", weightsNote: "غيّر الأوزان لتُحدّث درجات المواقع وترتيبها فوراً.",
    destination: "وجهة المهمة", mars: "المريخ", moon: "القمر", analyze: "حلّل المواقع المحددة", skipAnalysis: "تخطي حركة التحليل",
    awaiting: "بانتظار اختيار المواقع", placeholderTitle: "تبدأ المقارنة<br>من هنا.",
    placeholderText: "اختر موقعين أو ثلاثة، ثم ابدأ التحليل لعرض النتائج والخريطة والمفاضلات الهندسية.",
    analysisComplete: "اكتمل التحليل", resultsTitle: "ملاءمة الموقع للمهمة.", exportReport: "تصدير تقرير المهمة",
    radarKicker: "مقارنة متعددة المعايير", radarTitle: "رادار القدرات", globeKicker: "محدد المواقع", globeTitle: "مواقع العمل على الأرض",
    terrain: "التضاريس", elevation: "الارتفاعات", heatmap: "حراري", focusSite: "تركيز الخريطة", geology: "الجيولوجيا", logistics: "الخدمات اللوجستية",
    safety: "السلامة", heritage: "سجل المهمات",
    mapNote: "عرض توضيحي للكرة الأرضية. طبقتا الارتفاع والحرارة تخطيطيتان وليستا بيانات ملاحية.",
    photoKicker: "الميدان / معدات الرحلات", photoTitle: "الميدان يلتقي بعالم الهدف.",
    photoSourceNote: "صور أرشيفية لناسا للميدان والمركبات الفضائية. ترتبط التعليقات بالسجلات الأصلية.",
    logisticsKicker: "الوصول جزء من المهمة", logisticsTitle: "الخدمات اللوجستية والوصول",
    estimateNote: "مؤشرات الوصول والتكلفة تقديرات تخطيطية وصفية وليست عروض أسعار أو نصائح سفر.",
    warningKicker: "قائمة تنبيهات هندسية", warningTitle: "حوّل التضاريس إلى اختبارات.",
    gravityKicker: "فجوة الأحمال الإنشائية", gravityTitle: "الكتلة ذاتها. والوزن مختلف.", payloadMass: "كتلة المعدات",
    gravityNote: "الوزن حمل جاذبية مثالي (الكتلة × جاذبية السطح)؛ يتطلب التصميم الإنشائي الفعلي أحمالاً ومعاملات أمان خاصة بالمهمة.",
    disclaimer: "الدرجات أداة مقارنة تخطيطية وفق معايير توضيحية وليست توصية من ناسا أو مسحاً معتمداً للموقع أو إرشادات سلامة تشغيلية. تحقّق من التصاريح والطقس والوصول والمخاطر قبل العمل الميداني.",
    footerLine: "قليل من المنظور يغيّر كل شيء.", moonCaption: "القمر", moonDistance: "يبعد 384,400 كم عن الأرض",
    cardHuman: "01 / استكشاف بشري", cardArtemis: "العودة إلى القمر",
    cardScience: "02 / علوم الأرض", cardPlanet: "كوكبنا المتغير", cardEarth: "اكتشف الأرض من منظور جديد",
    cardDeep: "03 / أعماق الفضاء", cardUnknown: "إلى المجهول", cardUniverse: "استكشف الكون",
    noSites: "اختر موقعين على الأقل للمقارنة.",
    maxSites: "يمكن مقارنة ثلاثة مواقع كحد أقصى.", selectionStatus: "{count} / 3 مواقع",
    weightsTotal: "الأوزان نسبية وتُطبّع تلقائياً عند حساب الدرجات.",
    nearestFound: "أقرب موقع في الدليل: {name} — يبعد نحو {distance} كم.",
    useNearest: "استخدم هذا الموقع", score: "ملاءمة المهمة", rank: "الترتيب {rank}", tested: "برنامج ميداني موثّق",
    notTested: "لا يوجد ادعاء باختبار معدات", scoreLabels: ["ملاءمة التضاريس", "الجيولوجيا", "الخدمات", "السلامة", "سجل المهمات"],
    metricLabels: ["التضاريس", "الجيولوجيا", "الوصول", "السلامة", "السجل"],
    hybridKicker: "اقتراح الموقع الهجين", hybridTitle: "{first} + {second}",
    hybridText: "يغطي الموقعان معاً قدرات موزونة أكثر من أي موقع منفرد (+{gain} نقطة ملاءمة). {reason}",
    hybridReason: "يكمل أحدهما الآخر في {items}.", hybridSame: "المواقع المحددة تقدم بالفعل أقوى توليفة إجمالية في هذا الدليل.",
    selectTwoFirst: "اختر موقعين أو ثلاثة قبل بدء التحليل.",
    analysisRunning: "تجري مقارنة التضاريس والوصول وملاءمة المهمة…", badgeNASA: "موثّق في أرشيف ناسا",
    airport: "أقرب مطار", cost: "تكلفة الميدان", season: "أفضل موسم", accessScore: "مؤشر الوصول",
    costLow: "منخفضة", costMedium: "متوسطة", costHigh: "مرتفعة", costVeryHigh: "مرتفعة جداً",
    warningLabel: "ملاحظة هندسية", moonWeight: "الوزن على القمر", marsWeight: "الوزن على المريخ",
    reportTitle: "تقرير موقع محاكاة المهمة", reportTarget: "وجهة المهمة", reportGenerated: "أُنشئ التقرير وفق اختيارات المتصفح الحالية",
    reportSites: "المواقع المقارنة", reportWeights: "أوزان الأولوية", reportHybrid: "الموقع الهجين المقترح", reportWarnings: "قائمة التنبيهات الهندسية", reportWeight: "الوزن (نيوتن)", reportVsEarth: "مقارنة بالأرض",
    reportDisclaimer: "أداة تخطيط فقط. الدرجات واللوجستيات تقديرات توضيحية وليست بيانات رسمية من ناسا أو مسحاً للموقع أو إرشادات سلامة.",
    customInvalid: "استخدم خط عرض بين −90 و90 وخط طول بين −180 و180.",
    title: "تيرا توين — مستكشف الأرض ونظائر الكواكب"
  }
} as const;
export type MissionCopy = (typeof missionCopy)["en"];
export type MissionCopyKey = keyof MissionCopy;

export function mt<K extends MissionCopyKey>(lang: Lang, key: K): MissionCopy[K] {
  return (missionCopy[lang] as MissionCopy)[key] ?? missionCopy.en[key];
}

export function siteName(site: MissionSite, lang: Lang) {
  return lang === "ar" ? site.nameAr : site.name;
}

export function interpolate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    values[key] === undefined ? match : String(values[key])
  );
}


// ===== candidate-data.ts =====
/**
 * Hypothetical / candidate exploration targets.
 * These are NOT confirmed discovered places. Values are illustrative planning
 * estimates for comparing environments, not scientific measurements.
 */
export interface CandidateSite {
  id: string;
  body: BodyId;
  name: Bi;
  region: Bi;
  lat: number;
  lon: number;
  tempC: number;
  water: number;        // 0–100 probability / evidence of accessible water
  habitability: number; // 0–100 human living possibility (shielded habitat proxy)
  meteor: number;       // 0–100 meteoroid impact risk
  solar: number;        // 0–100 solar particle / radiation risk
  dust: number;         // 0–100 dust / regolith hazard
  note: Bi;
}

export const BODY_GRAVITY: Record<BodyId, number> = {
  earth: 9.81,
  mars: 3.71,
  moon: 1.62,
};

export const CANDIDATE_SITES: CandidateSite[] = [
  {
    id: "earth-subglacial",
    body: "earth",
    name: ["Subglacial Lake Margin", "حافة بحيرة تحت جليدية"],
    region: ["Antarctic interior", "داخل القارة القطبية الجنوبية"],
    lat: -78, lon: 120,
    tempC: -20, water: 85, habitability: 35, meteor: 5, solar: 8, dust: 2,
    note: [
      "A hidden liquid-water margin beneath ice; analog for isolated biospheres and ice-covered worlds.",
      "حافة ماء سائل مخفية تحت الجليد؛ نموذج لمحيات معزولة وعوالم مغطاة بالجليد.",
    ],
  },
  {
    id: "earth-aquifer",
    body: "earth",
    name: ["Deep Crustal Aquifer", "خزان جوفي عميق"],
    region: ["Northeast Africa", "شمال شرق أفريقيا"],
    lat: 28, lon: 30,
    tempC: 45, water: 70, habitability: 25, meteor: 5, solar: 10, dust: 15,
    note: [
      "Warm, dark, mineral-rich groundwater system; proxy for subsurface habitats.",
      "منظومة مياه جوفية دافئة مظلمة غنية بالمعادن؛ نموذج لمواطن تحت السطح.",
    ],
  },
  {
    id: "earth-lava-tube",
    body: "earth",
    name: ["High-Altitude Lava Tube", "أنبوب حمم مرتفع"],
    region: ["Central Andes", "وسط جبال الأنديز"],
    lat: -20, lon: -68,
    tempC: 5, water: 40, habitability: 30, meteor: 6, solar: 25, dust: 10,
    note: [
      "Sheltered volcanic cavity with cold, dry air; analog for protected off-world habitats.",
      "تجويف بركاني محمي بهواء بارد جاف؛ نموذج لمحميات خارج الأرض.",
    ],
  },
  {
    id: "mars-polar-cave",
    body: "mars",
    name: ["South Polar Ice Cave", "كهف جليدي قطبي جنوبي"],
    region: ["Planum Australe", "السهل القطبي الجنوبي"],
    lat: -85, lon: 0,
    tempC: -90, water: 80, habitability: 15, meteor: 35, solar: 55, dust: 30,
    note: [
      "Candidate ice-rich cavity near the polar cap; high water interest, severe cold and radiation.",
      "كهف مرشح غني بالجليد قرب القلنسوة القطبية؛ أهمية مائية عالية مع برد وإشعاع شديدين.",
    ],
  },
  {
    id: "mars-glacier",
    body: "mars",
    name: ["Mid-Latitude Debris Glacier", "نهر جليدي حطامي متوسط العرض"],
    region: ["Deuteronilus Mensae", "ديوتيرونيلوس مينساي"],
    lat: 40, lon: 120,
    tempC: -55, water: 65, habitability: 20, meteor: 30, solar: 50, dust: 40,
    note: [
      "Dust-mantled glacier-like form; possible shallow ice with moderate access.",
      "شكل شبيه بنهر جليدي مغطى بالغبار؛ جليد محتمل قريب من السطح مع وصول متوسط.",
    ],
  },
  {
    id: "mars-lava-tube",
    body: "mars",
    name: ["Equatorial Lava Tube", "أنبوب حمم استوائي"],
    region: ["Tharsis margin", "هامش ثارسيس"],
    lat: 5, lon: -100,
    tempC: -20, water: 35, habitability: 30, meteor: 25, solar: 45, dust: 35,
    note: [
      "Collapsed skylight candidate; natural shielding and milder temperatures.",
      "فتحة انهيار مرشحة؛ حماية طبيعية وحرارة أقل قسوة.",
    ],
  },
  {
    id: "moon-polar-crater",
    body: "moon",
    name: ["South Pole Shadowed Crater", "فوهة مظللة بالقطب الجنوبي"],
    region: ["Shackleton–de Gerlache ridge", "حافة شاكلتون–دي جيرلاش"],
    lat: -89, lon: 0,
    tempC: -220, water: 75, habitability: 10, meteor: 45, solar: 60, dust: 50,
    note: [
      "Permanently shadowed cold trap; strong water-ice interest but extreme environment.",
      "مصيدة برد دائمة الظل؛ اهتمام قوي بجليد الماء لكن بيئة قاسية جداً.",
    ],
  },
  {
    id: "moon-lava-tube",
    body: "moon",
    name: ["Lava Tube Skylight", "فتحة أنبوب حمم"],
    region: ["Marius Hills", "تلال ماريوس"],
    lat: 25, lon: -30,
    tempC: -30, water: 20, habitability: 25, meteor: 30, solar: 55, dust: 45,
    note: [
      "Possible subsurface void; shielding from radiation and micrometeoroids.",
      "فراغ تحت سطحي محتمل؛ حماية من الإشعاع والنيازك الدقيقة.",
    ],
  },
  {
    id: "moon-highland-ice",
    body: "moon",
    name: ["Highland Regolith Ice Patch", "بقعة جليد في المرتفعات"],
    region: ["Southern highlands", "المرتفعات الجنوبية"],
    lat: -60, lon: 45,
    tempC: -150, water: 55, habitability: 12, meteor: 40, solar: 58, dust: 48,
    note: [
      "Dispersed regolith ice candidate; lower concentration but broader access.",
      "جليد منتشر في الريغوليث؛ تركيز أقل لكن وصول أوسع.",
    ],
  },
];

export const CANDIDATE_CRITERIA = [
  { key: "temperature", label: ["Temperature", "درجة الحرارة"], unit: "°C" },
  { key: "gravity", label: ["Gravity", "الجاذبية"], unit: "m/s²" },
  { key: "water", label: ["Water probability", "احتمالية وجود ماء"], unit: "%" },
  { key: "habitability", label: ["Living possibility", "إمكانية المعيشة"], unit: "%" },
  { key: "meteor", label: ["Meteor risk", "خطر النيازك"], unit: "%" },
  { key: "solar", label: ["Solar risk", "خطر الشمس"], unit: "%" },
  { key: "dust", label: ["Dust risk", "خطر الغبار"], unit: "%" },
] as const;

export type CandidateCriterionKey = (typeof CANDIDATE_CRITERIA)[number]["key"];

export const DIRECTIONS: { from: BodyId; to: BodyId }[] = [
  { from: "earth", to: "mars" },
  { from: "mars", to: "earth" },
  { from: "moon", to: "mars" },
  { from: "mars", to: "moon" },
  { from: "earth", to: "moon" },
  { from: "moon", to: "earth" },
];

export function getCandidateSite(id: string): CandidateSite {
  const site = CANDIDATE_SITES.find((s) => s.id === id);
  if (!site) throw new Error(`Unknown candidate site: ${id}`);
  return site;
}

export function sitesForBody(body: BodyId): CandidateSite[] {
  return CANDIDATE_SITES.filter((s) => s.body === body);
}


// ===== textures.ts =====
export const TEX = { earth, earthSpec, earthNormal, earthClouds, mars, marsBump, moon, moonBump, stars };

export const MAP_IMG: Record<string, string> = { earth, mars, moon };


// ===== assets.ts =====
/** Local copies of the NASA archival photos referenced by the uploaded mission lab. */
export const FIELD_PHOTOS: Record<SiteId, string> = {
  "black-point": blackPoint,
  haughton,
  atacama,
};

export const BODY_PHOTOS = {
  moon: {
    src: moonRover,
    source: "https://images.nasa.gov/details/S71-43943",
    sourceName: "NASA/JSC archive",
    alt: ["Apollo 15 Lunar Roving Vehicle tracks and Hadley-Apennine landing site", "آثار مركبة أبولو 15 القمرية وموقع هبوط هادلي-أبينين"] as const,
    caption: ["Apollo 15 Lunar Roving Vehicle, 1971", "المركبة القمرية لأبولو 15، 1971"] as const,
  },
  mars: {
    src: marsRover,
    source: "https://images.nasa.gov/details/PIA13081",
    sourceName: "NASA/JPL-Caltech/Cornell",
    alt: ["NASA Mars Exploration Rover Opportunity view of the Martian landscape", "منظر لمشهد مريخي التقطته المركبة الجوالة أوبورتيونيتي التابعة لناسا"] as const,
    caption: ["Opportunity rover, Endeavour crater", "المركبة أوبورتيونيتي، فوهة إنديفور"] as const,
  },
};


// ===== candidate comparison logic =====
const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function criterionValue(site: CandidateSite, key: CandidateCriterionKey): number {
  switch (key) {
    case "temperature": return site.tempC;
    case "gravity": return BODY_GRAVITY[site.body];
    case "water": return site.water;
    case "habitability": return site.habitability;
    case "meteor": return site.meteor;
    case "solar": return site.solar;
    case "dust": return site.dust;
  }
}

/** Similarity of two sites for one criterion, 0–100. Risk similarity means
 *  "similar risk level", not "safe". */
export function criterionSimilarity(a: CandidateSite, b: CandidateSite, key: CandidateCriterionKey): number {
  const va = criterionValue(a, key);
  const vb = criterionValue(b, key);
  if (key === "temperature") return clamp(100 - Math.abs(va - vb) * 0.75);
  if (key === "gravity") return clamp((Math.min(va, vb) / Math.max(va, vb)) * 100);
  return clamp(100 - Math.abs(va - vb));
}

export interface CandidateComparison {
  criteria: { key: CandidateCriterionKey; a: number; b: number; similarity: number }[];
  overall: number;
}

export function compareSites(a: CandidateSite, b: CandidateSite): CandidateComparison {
  const criteria = CANDIDATE_CRITERIA.map((c) => ({
    key: c.key,
    a: criterionValue(a, c.key),
    b: criterionValue(b, c.key),
    similarity: criterionSimilarity(a, b, c.key),
  }));
  const overall = criteria.reduce((sum, c) => sum + c.similarity, 0) / criteria.length;
  return { criteria, overall };
}

export function bestPair(from: BodyId, to: BodyId) {
  let best: { a: CandidateSite; b: CandidateSite; result: CandidateComparison } | null = null;
  for (const a of sitesForBody(from)) {
    for (const b of sitesForBody(to)) {
      const result = compareSites(a, b);
      if (!best || result.overall > best.result.overall) best = { a, b, result };
    }
  }
  if (!best) throw new Error("No candidate sites for direction");
  return best;
}

export function directionMatrix() {
  return DIRECTIONS.map((direction) => ({ direction, best: bestPair(direction.from, direction.to) }));
}

export function formatCriterionValue(key: CandidateCriterionKey, value: number): string {
  if (key === "temperature") return `${Math.round(value)}°C`;
  if (key === "gravity") return `${value.toFixed(2)} m/s²`;
  return `${Math.round(value)}%`;
}

export function similarityTone(value: number): "low" | "mid" | "high" {
  if (value < 40) return "low";
  if (value < 70) return "mid";
  return "high";
}
