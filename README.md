# 匹咖揪運動工作室網站

PickleChill 品牌形象與揪團資訊網站，使用 React + Vite 建置。

## 開始使用

```bash
npm install
npm run dev
```

正式建置：

```bash
npm run build
```

## 發佈到 GitHub Pages

專案已包含 `.github/workflows/deploy.yml`。推送到 GitHub 的 `main` 分支後：

1. 進入 GitHub repo 的 `Settings`。
2. 選擇 `Pages`。
3. 將 `Build and deployment` 的 Source 設為 `GitHub Actions`。
4. 後續每次推送到 `main` 都會自動重新部署。

## 專案架構

```text
public/assets/              圖片等公開素材
src/
  components/
    layout/                 頁首與頁尾
    sections/               首頁各內容區塊
    ui/                     共用小元件
  data/siteContent.js       常修改的活動、服務與社群資料
  hooks/                    共用 React hooks
  styles/global.css         全站樣式
  App.jsx                   組合網站各區塊
  main.jsx                  React 進入點
```

## 日常更新

- 修改活動時間、費用、服務內容、教練資料或社群連結：`src/data/siteContent.js`
- 更新 Logo 或招生圖：替換 `public/assets/` 中的同名圖片
- 修改某個首頁區塊：`src/components/sections/`
- 修改網站配色與排版：`src/styles/global.css`

收到 LINE 群組網址後，填入 `src/data/siteContent.js` 的 `lineGroupUrl` 即可。
