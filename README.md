# 校园工具箱 · Campus Kit

> 一个不用安装、双击就能用的校园小工具合集。纯 HTML / CSS / JavaScript 实现，零第三方依赖。
> 本项目是团队 GitHub 协作流程的练习产物，由小组成员通过「独立分支 → Pull Request → 相互审查 → 合并」共同完成。

## 项目简介

日常上课、自习时会用到一堆零散的小工具：计时、记事、换算、抽座位……
本项目把四件最常用的小事做到一个页面里，打开就能用，不需要联网、不需要安装、不需要构建。

## 运行方法

**方式一：直接打开（最简单）**

下载或克隆本仓库后，双击 `index.html`，用任意现代浏览器打开即可。

**方式二：起一个本地服务器（推荐）**

部分浏览器对本地文件有安全限制，用本地服务器打开更稳：

```bash
git clone https://github.com/zzzz1000-l/teamproject.git
cd teamproject
python -m http.server 8000
```

然后在浏览器访问 <http://localhost:8000>。

> 无需 Node.js、无需 npm install、无需任何构建步骤。

**环境要求**：Chrome / Edge / Firefox / Safari 等现代浏览器（支持 ES5+ 与 CSS 变量即可）。

## 功能说明

页面为 2×2 卡片布局，共四个模块：

| # | 模块 | 功能 | 负责人 |
|---|------|------|--------|
| 01 | **专注番茄钟** | 25 分钟专注 / 5 分钟短休 / 15 分钟长休三种模式；圆环进度显示；时间到自动提示音；今日完成数本地保存 | cmsq |
| 02 | **今日待办** | 添加、勾选、删除待办事项，数据保存在浏览器本地，刷新不丢失 | （待填） |
| 03 | **单位换算** | 厘米 ↔ 英寸、斤 ↔ 公斤、摄氏 ↔ 华氏，输入即时换算 | （待填） |
| 04 | **随机座位抽取** | 按教室的行数与列数随机抽一个座位，支持「不重复抽取」，可用于课堂点名 | （待填） |

## 成员与分工

| GitHub 用户名 | 负责内容 | 主要文件 |
|---|---|---|
| [zzzz1000-l](https://github.com/zzzz1000-l) | 仓库负责人、README 维护、最终合并 | `README.md` |
| [cmsq](https://github.com/cmsq) | 页面骨架与整体样式、专注番茄钟模块 | `index.html`、`style.css`、`script/timer.js` |
| （待填） | 今日待办模块 | `script/todo.js` |
| （待填） | 单位换算模块 | `script/convert.js` |
| （待填） | 随机座位抽取模块 | `script/random.js` |

## 目录结构

```
teamproject/
├── index.html          # 页面结构：四张功能卡片
├── style.css           # 全部样式：CSS 变量、卡片网格、响应式
├── script/
│   ├── timer.js        # 01 专注番茄钟
│   ├── todo.js         # 02 今日待办（待实现）
│   ├── convert.js      # 03 单位换算（待实现）
│   └── random.js       # 04 随机座位抽取（待实现）
└── README.md           # 本文件
```

## 协作流程

本项目按以下 Git 规范协作，这也是本次课程练习的核心内容：

1. **`main` 是共享主干**，始终保证可运行，任何人不得直接在 `main` 上提交。
2. **每位成员从 `main` 拉出自己的独立分支**，命名格式为 `<用户名>-<任务>`，例如 `cmsq-ui`、`xxx-todo`。
3. 在自己的分支上完成一项**有实际意义的改动**后，提交并推送到远端。
4. **发起 Pull Request**，说明这次改了什么、为什么这么改。
5. Pull Request 需**至少一名其他成员审查**并留下意见或批准，通过后由提交者合并到 `main`。
6. 合并完成后，所有成员拉取最新的 `main`（`git pull origin main`），确认项目仍可正常运行。

### 常用命令速查

```bash
git clone <仓库地址>              # 克隆仓库到本地
git checkout -b <用户名>-<任务>    # 从 main 创建并切换到自己的分支
git add .
git commit -m "feat: 说明这次改了什么"
git push -u origin <分支名>        # 第一次推送需要 -u

# 别人合并后，同步最新 main 到自己的分支
git checkout main
git pull origin main
git checkout <自己的分支>
git merge main
```

## 模块开发须知（给后续组员）

- **不要修改 `index.html` 的结构和 `style.css`**（骨架与样式由 cmsq 统一维护），否则多人同时改同一文件极易冲突。
- 每张卡片里都留有 `.placeholder` 占位块，实现时把占位内容替换成实际控件即可，`index.html` 里对应的位置都写好了注释与 HTML 模板。
- 样式类已经备好，可直接复用：
  - `.btn` / `.btn-primary` / `.btn-ghost` —— 按钮
  - `.field` / `.field-label` / `.field-input` —— 输入框
  - `.card-meta` —— 底部说明文字
  - `.seat-display` / `.seat-roll` —— 用于展示大号结果
- 新写的脚本在 `index.html` 底部按注释位置引入即可。

## 更新记录

| 日期 | 内容 |
|---|---|
| 2026-11-01 | 初始化仓库，添加 README |
| 2026-11-01 | 组长完成第一次提交测试 |
| 2026-11-02 | 搭建页面骨架与整体样式，实现专注番茄钟模块 |
| （待填） | 今日待办模块 |
| （待填） | 单位换算模块 |
| （待填） | 随机座位抽取模块 |

---

深圳技术大学 · 团队协作练习项目
