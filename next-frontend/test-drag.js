const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  await page.goto('http://localhost:3000/preview/test-drag-layers-player', { waitUntil: 'networkidle0' });
  
  // Wait for Answer Bank chips to load
  await page.waitForSelector('[data-answer-bank] [role="button"]');
  console.log("Page loaded.");

  // Get the first chip in the bank
  const chip = await page.$('[data-answer-bank] [role="button"]');
  const chipBox = await chip.boundingBox();
  console.log("Chip box:", chipBox);

  // Get slot 1
  const slot = await page.$('[data-layer-index="0"]');
  const slotBox = await slot.boundingBox();
  console.log("Slot box:", slotBox);

  // Drag chip to slot
  await page.mouse.move(chipBox.x + chipBox.width / 2, chipBox.y + chipBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(slotBox.x + slotBox.width / 2, slotBox.y + slotBox.height / 2, { steps: 20 });
  await page.mouse.up();
  
  await new Promise(r => setTimeout(r, 1000));
  console.log("Dropped into slot 1.");

  // Now, try dragging it OUT of the slot to slot 2
  const slot2 = await page.$('[data-layer-index="1"]');
  const slot2Box = await slot2.boundingBox();
  console.log("Slot 2 box:", slot2Box);

  // The chip should now be inside slot 1. Find it.
  const chipInSlot = await page.$('[data-layer-index="0"] [role="button"]');
  if (!chipInSlot) {
    console.log("Chip not found in slot 1!");
  } else {
    const newChipBox = await chipInSlot.boundingBox();
    console.log("Chip in slot box:", newChipBox);

    await page.mouse.move(newChipBox.x + newChipBox.width / 2, newChipBox.y + newChipBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(slot2Box.x + slot2Box.width / 2, slot2Box.y + slot2Box.height / 2, { steps: 20 });
    await page.mouse.up();
    
    await new Promise(r => setTimeout(r, 1000));
    console.log("Attempted to drop into slot 2.");
    
    const chipInSlot2 = await page.$('[data-layer-index="1"] [role="button"]');
    if (chipInSlot2) {
      console.log("SUCCESS: Chip is in slot 2!");
    } else {
      console.log("FAIL: Chip is NOT in slot 2!");
    }
  }

  await browser.close();
})();
