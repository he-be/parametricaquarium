import { Application, Graphics } from 'pixi.js';

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
