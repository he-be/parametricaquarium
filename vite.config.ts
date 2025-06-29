import { defineConfig } from 'vite';

export default defineConfig({
  // プロジェクトのルートディレクトリ
  root: './',
  // 開発サーバーの設定
  server: {
    host: '0.0.0.0', // すべてのネットワークインターフェースでリッスン
    port: 3000,      // 開発サーバーのポート
  },
  // ビルド設定
  build: {
    outDir: 'dist', // ビルド出力ディレクトリ
    emptyOutDir: true, // ビルド時に出力ディレクトリをクリア
  },
});
