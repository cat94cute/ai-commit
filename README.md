# 🚀 ai-commit — 用 AI 自動生成 Git Commit Message

`ai-commit` 是一款命令列工具（CLI），能根據你的 `git diff` 自動產生符合 **Conventional Commits** 的 commit message。
支援多種 AI Provider（目前 Groq、Gemini、DeepSeek 已完成），讓你不必再花時間想 commit 名稱。

---

## ✨ 功能特色

- 🔍 自動分析 `git diff` 的變更內容
- ✨ 使用多家 AI 模型生成 Commit Message
- 📏 支援大型 diff，自動分 chunk 避免 token 上限
- 🎉 一鍵完成 commit

---

## 📦 安裝

### 全域安裝（建議）
```bash
npm install -g @cat94cute/ai-commit
```

## 🚀 指令使用方式

### 1. 設定 Provider

```bash
ai config-provider

❯ Groq (預設使用)
  Gemini
  DeepSeek
```

### 2. 設定 API Key

依照你選的 provider 儲存對應 API key。

```bash
ai config <API_SECRET_KEY>
```

### 3. 產生 Commit Message

```bash
ai commit
```

## 📘 完整指令表

| 指令                   | 功能                |
| -------------------- | ----------------- |
| `ai commit`          | 產生 commit message |
| `ai config-provider` | 設定 AI Provider    |
| `ai config`      | 設定 API Key        |
| `ai help`            | 列出所有指令            |

## 🧩 支援的 AI Provider

| Provider | Model 名稱                    | 支援狀態  |
| -------- | --------------------------- | ----- |
| Groq     | llama3 / llama3.1 / mixtral | 🟢 完成 |
| Gemini   | gemini-1.5 / flash          | 🟢 完成 |
| DeepSeek | deepseek-chat               | 🟢 完成 |
| OpenAI   | TBD                         | ⏳ 計畫中 |
