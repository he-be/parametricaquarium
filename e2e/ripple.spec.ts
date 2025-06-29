import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // コンソールエラーが発生した場合にテストを失敗させる
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error(`Browser console error: ${msg.text()}`);
      test.fail(`Console error detected: ${msg.text()}`);
    }
  });
});

test('should display a flat colored background', async ({ page }) => {
  await page.goto('/');
  // 背景色が設定されていることを確認 (bodyのスタイルをチェック)
  const backgroundColor = await page.evaluate(() => {
    return getComputedStyle(document.body).backgroundColor;
  });
  expect(backgroundColor).toBe('rgb(44, 62, 80)'); // #2c3e50
});

test('should create a ripple on click and verify animation logs', async ({ page }) => {
  await page.goto('/');

  // コンソールログを収集するための配列
  const consoleLogs: string[] = [];
  page.on('console', (msg) => {
    consoleLogs.push(msg.text());
  });

  await page.mouse.click(100, 100); // 画面をクリック

  // 波紋のアニメーションログが出力されるまで待機
  await expect
    .poll(
      async () => {
        return consoleLogs.some(
          (log) =>
            log.includes('Ticker update. Active ripples: 1') && log.includes('Ripple 0: age=')
        );
      },
      {
        message: 'Expected ripple animation logs to appear',
        timeout: 5000, // 5秒待機
      }
    )
    .toBe(true);

  // 波紋が描画されるのを少し待つ
  await page.waitForTimeout(1000); // 1秒待機

  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
});
