import { Application, Graphics } from 'pixi.js';

// 2次元ベクトル
interface Vector2 {
    x: number;
    y: number;
}

// 骨格ノード
interface Node {
    position: Vector2;
    prevPosition: Vector2; // For PBD, though not used in this step
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

// 魚クラス
class Fish {
    nodes: Node[] = [];
    graphics: Graphics;
    numNodes: number = 10; // 魚のノード数
    nodeSpacing: number = 10; // ノード間の間隔
    velocity: Vector2 = { x: 1, y: 0 }; // 魚の移動速度 (仮)
    waveAmplitude: number = 10; // 波の振幅
    waveFrequency: number = 0.1; // 波の周波数
    waveSpeed: number = 0.05; // 波の速度

    constructor(x: number, y: number) {
        this.graphics = new Graphics();
        // ノードを一直線に生成
        for (let i = 0; i < this.numNodes; i++) {
            this.nodes.push({
                position: { x: x - i * this.nodeSpacing, y: y },
                prevPosition: { x: x - i * this.nodeSpacing, y: y },
            });
        }
    }

    update(deltaTime: number) {
        // 魚の頭部を移動させる
        this.nodes[0].position.x += this.velocity.x * deltaTime;
        this.nodes[0].position.y += this.velocity.y * deltaTime;

        // 進行波モデルに基づいて各ノードの位置を更新 (簡易版)
        // PBDは後で実装
        for (let i = 1; i < this.numNodes; i++) {
            const prevNode = this.nodes[i - 1];
            const currentNode = this.nodes[i];

            // ノード間の距離を維持
            const dx = prevNode.position.x - currentNode.position.x;
            const dy = prevNode.position.y - currentNode.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const diffX = (dist - this.nodeSpacing) * (dx / dist);
            const diffY = (dist - this.nodeSpacing) * (dy / dist);

            currentNode.position.x += diffX;
            currentNode.position.y += diffY;

            // 波の動きを追加
            const waveOffset = Math.sin(i * this.waveFrequency + app.ticker.lastTime * this.waveSpeed) * this.waveAmplitude;
            // 魚の進行方向に対して垂直に波を適用
            // 現状はX軸方向の魚なのでY軸に波を適用
            currentNode.position.y += waveOffset;
        }
    }

    draw() {
        this.graphics.clear();
        // 魚の形状を仮で描画 (長方形)
        // これは後でアウトライン生成ロジックに置き換えられる
        const head = this.nodes[0].position;
        const tail = this.nodes[this.nodes.length - 1].position;
        const bodyWidth = 20; // 仮の魚の幅

        // 魚の本体を描画
        this.graphics.beginFill(0x00FF00); // 緑色で魚の本体 (仮)
        this.graphics.drawRect(tail.x, tail.y - bodyWidth / 2, head.x - tail.x, bodyWidth);
        this.graphics.endFill();

        // ノードの描画 (デバッグ用)
        this.graphics.lineStyle(1, 0xFFFFFF); // 白い線
        this.graphics.beginFill(0xFF0000); // 赤い点でノードを描画
        for (const node of this.nodes) {
            this.graphics.drawCircle(node.position.x, node.position.y, 3);
        }
        this.graphics.endFill();
    }
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

// 魚のインスタンスを作成
const fish = new Fish(app.screen.width / 2, app.screen.height / 2);
app.stage.addChild(fish.graphics);

// メインループでの波紋の更新と描画
app.ticker.add((deltaTime) => { // deltaをdeltaTimeに変更
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

    // 魚の更新と描画
    fish.update(deltaTime);
    fish.draw();
});