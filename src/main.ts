import { Application, Graphics } from 'pixi.js';

// 2次元ベクトル
interface Vector2 {
    x: number;
    y: number;
}

// 波紋オブジェクト
interface Ripple {
    graphics: Graphics; // PixiJS Graphics object for drawing
    origin: Vector2;
    createdAt: number;
    maxRadius: number;
    duration: number;
    lineWidth: number;
    color: number;
}

// アプリケーションの初期化
const app = new Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x2c3e50, // 深い藍色
    antialias: true,
});

// DOMにキャンバスを追加
document.body.appendChild(app.view as HTMLCanvasElement);

// ウィンドウサイズ変更時のリサイズ処理
window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
});

console.log('PixiJS application initialized with dark blue background.');

// アクティブな波紋を管理する配列
const activeRipples: Ripple[] = [];

// マウスクリックイベントリスナー
app.view.addEventListener('pointerdown', (event: PointerEvent) => {
    const x = event.clientX;
    const y = event.clientY;

    const newRipple: Ripple = {
        graphics: new Graphics(),
        origin: { x, y },
        createdAt: app.ticker.lastTime, // PixiJSのtickerの時間を使用
        maxRadius: 150,
        duration: 1500, // ミリ秒
        lineWidth: 2,
        color: 0xFFFFFF, // 白
    };

    app.stage.addChild(newRipple.graphics);
    activeRipples.push(newRipple);
});

// メインループでの波紋の更新と描画
app.ticker.add((delta) => {
    const currentTime = app.ticker.lastTime; // 現在の時間を取得

    for (let i = activeRipples.length - 1; i >= 0; i--) {
        const ripple = activeRipples[i];
        const age = currentTime - ripple.createdAt;

        if (age > ripple.duration) {
            // 波紋の寿命が尽きたら削除
            app.stage.removeChild(ripple.graphics);
            ripple.graphics.destroy();
            activeRipples.splice(i, 1);
            continue;
        }

        const progress = age / ripple.duration;
        const currentRadius = ripple.maxRadius * progress;
        const alpha = Math.sin(Math.PI * progress); // フェードイン・フェードアウト

        ripple.graphics.clear();
        ripple.graphics.lineStyle(ripple.lineWidth, ripple.color, alpha);
        ripple.graphics.drawCircle(ripple.origin.x, ripple.origin.y, currentRadius);
    }
});
