# ESLint エラー解決の試行錯誤ログ

このドキュメントは、ESLint の設定に関する問題解決の過程を時系列で記録したものです。

## 2025-06-29

### 1. 初期エラーと状況把握

**状況**: MVP実装完了後、`npm run lint` を実行した際に以下のエラーが発生。

```
Oops! Something went wrong! :(

ESLint: 8.57.1

ESLint couldn't find the config "@typescript-eslint/recommended" to extend from. Please check that the name of the config is correct.

The config "@typescript-eslint/recommended" was referenced from the config file in "/home/mh/dev/parametricaquarium/.eslintrc.json".
```

**分析**: `@typescript-eslint/recommended` 設定が見つからないというエラー。これは、`@typescript-eslint/eslint-plugin` パッケージが正しくインストールされていないか、ESLint がそのパスを解決できていないことを示唆。

**試行1**: `package.json` の依存関係 (`eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`) のバージョンを確認。`eslint@^8.0.0`, `@typescript-eslint/eslint-plugin@^6.0.0`, `@typescript-eslint/parser@^6.0.0` であった。互換性はあるはずと判断。

**試行2**: `node_modules` を削除し、`npm install` を再実行してクリーンな状態から依存関係を再構築。

**結果**: エラーは解消せず、同じエラーが再発。

### 2. ESLint バージョンの調整

**状況**: `npm install` 後もエラーが続くため、ESLint のバージョンが古く、警告が出ていた点に着目。

**試行3**: `eslint@latest` で ESLint を最新バージョンに更新。

**結果**: `ESLint: 9.30.0` に更新されたが、新たなエラーが発生。

```
ESLint couldn't find an eslint.config.(js|mjs|cjs) file.

From ESLint v9.0.0, the default configuration file is now eslint.config.js.
If you are using a .eslintrc.* file, please follow the migration guide
to update your configuration file to the new format:

https://eslint.org/docs/latest/use/configure/migration-guide
```

**分析**: ESLint v9 から設定ファイルの形式が `.eslintrc.json` から `eslint.config.js` に変更されたため、既存の設定ファイルが認識されなくなった。

**試行4**: 一時的な回避策として、ESLint を `8.57.1` にダウングレード。

**結果**: 再び元のエラー (`ESLint couldn't find the config "@typescript-eslint/recommended"`) が再発。ダウングレードしても問題が解決しないことから、`@typescript-eslint` のバージョンとの非互換性の可能性を再検討。

**試行5**: `@typescript-eslint/eslint-plugin` と `@typescript-eslint/parser` を `6.0.0` に固定して再インストール。

**結果**: エラーは解消せず、同じエラーが再発。

### 3. 設定ファイルの簡素化と環境設定

**状況**: エラーが続くため、設定ファイルを簡素化して問題の切り分けを試みる。

**試行6**: `.eslintrc.json` の `extends` から `@typescript-eslint/recommended` と `@typescript-eslint/recommended-requiring-type-checking` を一時的に削除し、`"eslint:recommended"` のみとする。

**結果**: ESLint は実行されるようになったが、多くのエラー（`@typescript-eslint/prefer-const` が見つからない、`no-undef` など）が発生。これは、`@typescript-eslint` 関連のルールが認識されなくなったことと、ブラウザのグローバル変数が認識されていないため。

**試行7**: `.eslintrc.json` を元の状態に戻し、`env` に `browser: true` を追加。また、`tsconfig.json` に `vite.config.ts` と `vitest.config.ts` を `include` するように変更。

**結果**: 再び元のエラー (`ESLint couldn't find the config "@typescript-eslint/recommended"`) が再発。

### 4. 依存関係のクリーンアップと再インストール

**状況**: エラーが解決しないため、依存関係の破損を疑い、より徹底的なクリーンアップを試みる。

**試行8**: `npm cache clean --force` を実行し、npm のキャッシュを完全にクリア。その後、`node_modules` を削除し、`npm install` を再実行。

**結果**: エラーは解消せず、同じエラーが再発。

### 5. `eslint.config.js` への移行と新たな問題

**状況**: `.eslintrc.json` での問題解決が困難なため、ESLint v9 で推奨される `eslint.config.js` への移行を試みる。

**試行9**: `eslint.config.js` を作成し、`.eslintrc.json` の内容を移行。`package.json` の `lint` スクリプトを更新し、`.eslintrc.json` を削除。

**結果**: 新たなエラーが発生。

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'typescript-eslint' imported from /home/mh/dev/parametricaquarium/eslint.config.js
```

**分析**: `eslint.config.js` で `typescript-eslint` というパッケージをインポートしようとしているが、正しくは `@typescript-eslint/eslint-plugin` であるため。

**試行10**: `eslint.config.js` の `import tseslint from "typescript-eslint";` を `import tseslint from "@typescript-eslint/eslint-plugin";` に修正。また、`eslint.config.js` が ES Modules 形式であるため、`package.json` に `"type": "module"` を追加。

**結果**: 新たなエラーが発生。

```
TypeError: tseslint.configs.recommended is not iterable
```

**分析**: `tseslint.configs.recommended` が配列ではなく単一のオブジェクトを返しているにもかかわらず、スプレッド構文 (`...`) を使用しているため。

**試行11**: `eslint.config.js` の `...tseslint.configs.recommended` を `tseslint.configs.recommended` に修正（スプレッドを削除）。

**結果**: 再び新たなエラーが発生。

```
A config object is using the "extends" key, which is not supported in flat config system.
```

**分析**: `pluginJs.configs.recommended` や `tseslint.configs.recommended` の内部で `extends` キーが使用されているため。ESLint v9 の Flat Config System では `extends` はサポートされていない。

**試行12**: ESLint の公式ドキュメントの Flat Config System の移行ガイドを参考に、`eslint.config.js` を再構築し、`pluginJs.configs.recommended` と `tseslint.configs.recommended` を適切に展開する。

**結果**: 再び `TypeError: tseslint.configs.recommended is not iterable` が発生。これは、`tseslint.configs.recommended` が配列ではなく単一のオブジェクトを返しているにもかかわらず、スプレッド構文 (`...`) を使用しているため。

**試行13**: `eslint.config.js` の `...tseslint.configs.recommended` を `tseslint.configs.recommended` に修正（スプレッドを再度削除）。

**結果**: 再び `A config object is using the "extends" key, which is not supported in flat config system.` が発生。

### 6. 現状と今後の対応

**現状**: ESLint v8.x と Flat Config System の互換性の問題、または `@typescript-eslint` の設定の複雑さにより、ローカル環境での ESLint エラーの解決がループしている状態。CI環境でも同様のエラーが発生している。

**今後の対応**: `eslint.config.js` の使用を中止し、元の `.eslintrc.json` に戻す。そして、以前から発生していた `ESLint couldn't find the config "@typescript-eslint/recommended" to extend from.` というエラーの解決に再度取り組む。このエラーは、`@typescript-eslint/eslint-plugin` のバージョンと ESLint のバージョン、またはその依存関係の解決に根本的な問題がある可能性が高い。

### 7. CIでのESLintエラーと解決の試み

**状況**: ローカルでのESLint設定が安定したと判断し、CIにプッシュしたが、CIでESLintエラーが発生し続ける。

**エラーメッセージ**: 
```
Invalid option '--ext' - perhaps you meant '-c'?
You're using eslint.config.js, some command line flags are no longer available. Please see https://eslint.org/docs/latest/use/command-line-interface for details.
```

**分析**: ローカルでは `eslint.config.js` を削除し、`.eslintrc.json` に戻したが、CI環境では `eslint.config.js` が存在し、ESLint v9のFlat Config Systemが有効になっていることを示唆。これは、CIが古いコミットをチェックアウトしているか、または `eslint.config.js` が `.gitignore` に含まれていないため、Gitが追跡しているため。

**試行14**: ローカルの `issue-1` ブランチの最新の状態をリモートにプッシュし、CIが最新のコミットを正しく取得することを確認。

**結果**: `Everything up-to-date` と表示され、ローカルとリモートは同期していることを確認。CIは引き続き同じエラーで失敗。

**分析**: CIワークフローファイル `.github/workflows/ci.yml` の `pull_request` トリガーが `main` ブランチのみを対象としていたため、`issue-1` ブランチでのCIが正しく実行されていなかった。

**試行15**: `.github/workflows/ci.yml` を修正し、`pull_request` の `branches` を `[ "main", "issue-1" ]` に変更。

**結果**: CIが `issue-1` ブランチでも実行されるようになったが、まだ同じエラーで失敗。

**分析**: CI環境が `eslint.config.js` を使用しているというエラーが続くのは、CIのワークスペースが完全にクリーンアップされていないか、またはGitHub Actionsのキャッシュが原因である可能性が高い。

**今後の対応**: 
-   CIワークフローに、`npm ci` の前に `rm -f eslint.config.js` を追加し、`eslint.config.js` が確実に存在しないようにする。
-   `actions/setup-node` のキャッシュを一時的に無効にするか、キャッシュキーを変更して、新しい依存関係が確実にインストールされるようにする。
