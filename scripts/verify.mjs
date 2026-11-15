import { chromium } from "@playwright/test";
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader-webgl", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ reducedMotion: "reduce" });
const errors = [];
page.on("pageerror", e => errors.push(String(e)));
await page.goto("file:///home/user/tera-twin.html", { waitUntil: "load", timeout: 60000 });
await page.waitForSelector("#twin-finder", { timeout: 30000 });
const canvases = await page.locator("#twin-finder canvas").count();
const title = await page.title();
// theme toggle works in the standalone file
await page.locator(".theme-toggle").click();
const theme = await page.locator("html").getAttribute("data-theme");
await browser.close();
if (canvases < 2 || errors.length || theme !== "light") { console.error({ title, canvases, errors, theme }); process.exit(1); }
console.log(JSON.stringify({ ok: true, title, canvases, theme }));
