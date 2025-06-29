import { Application, Graphics } from 'pixi.js';

async function initializeApp() {
  // 非同期関数でラップ
  // PixiJSアプリケーションの初期化
  const app = new Application();
  await app.init({
    // init() を使用
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x2c3e50, // 深い藍色
    antialias: true,
  });

  document.getElementById('app')?.appendChild(app.canvas as HTMLCanvasElement);

  // ウィンドウサイズ変更時のリサイズ処理
  window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
  });

  // MVP Step 1: 波紋の実装
  interface Ripple {
    graphics: Graphics;
    origin: { x: number; y: number };
    createdAt: number;
    maxRadius: number;
    duration: number;
    lineWidth: number;
    color: number;
  }

  const activeRipples: Ripple[] = [];

  app.canvas.addEventListener('click', (event: MouseEvent) => {
    // app.view -> app.canvas
    const origin = { x: event.clientX, y: event.clientY };
    const newRipple: Ripple = {
      graphics: new Graphics(),
      origin,
      createdAt: app.ticker.lastTime, // PixiJSのtickerのタイムスタンプを使用
      maxRadius: 100,
      duration: 2000, // 2秒で消える
      lineWidth: 2,
      color: 0xffffff, // 白
    };
    app.stage.addChild(newRipple.graphics);
    activeRipples.push(newRipple);
  });

  app.ticker.add((_delta) => {
    const currentTime = app.ticker.lastTime;
    console.log('Ticker update. Active ripples:', activeRipples.length); // 追加

    for (let i = activeRipples.length - 1; i >= 0; i--) {
      const ripple = activeRipples[i];
      const age = currentTime - ripple.createdAt;

      if (age > ripple.duration) {
        app.stage.removeChild(ripple.graphics);
        activeRipples.splice(i, 1);
        console.log('Ripple removed. Remaining ripples:', activeRipples.length); // 追加
        continue;
      }

      const progress = age / ripple.duration;
      const currentRadius = ripple.maxRadius * progress;
      const alpha = Math.sin(Math.PI * progress);

      console.log(
        `Ripple ${i}: age=${age}, progress=${progress}, radius=${currentRadius}, alpha=${alpha}`
      ); // 追加

      ripple.graphics.clear();
      ripple.graphics.setStrokeStyle({
        width: ripple.lineWidth,
        color: ripple.color,
        alpha: alpha,
      });
      ripple.graphics.circle(ripple.origin.x, ripple.origin.y, currentRadius);
    }
  });
}

initializeApp(); // 初期化関数を呼び出す
