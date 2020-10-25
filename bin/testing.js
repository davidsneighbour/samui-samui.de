const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('http://localhost:1313')
  await page.screenshot({ path: 'my_screenshot.png', fullPage: true })
  await browser.close()
})()
