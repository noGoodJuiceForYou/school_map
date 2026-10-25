# TKKC 校园导览 · school-map

厦门大学嘉庚学院校园地图/导航系统，包含三个模块：

| 模块 | 目录 | 技术栈 | 默认端口 |
| --- | --- | --- | --- |
| 后端服务 | `back_end/school-map/` | Spring Boot 3.5.6 / Java 21 / MyBatis / MySQL | 8080 |
| 手机端（H5） | `client/git_uniapp/` | UniApp + Vue 3（HBuilderX 工程） | 8081 |
| 后台管理端 | `manage-web/` | Vue 3 + Vite 6 + Element Plus（RuoYi-Vue 3.9） | 5173 |

主要功能：高德地图打点与室内外指引、地点搜索、路线规划与步行动画、地点详情与图片、用户登录注册、评论与图片投稿、后台地点/子地点 CRUD、评论人工审核、图片审核、用户管理。

> 仓库主远端为 GitHub：<https://github.com/noGoodJuiceForYou/school_map>（原 Gitee 镜像已废弃）。

---

## 环境要求

- JDK 21、Maven 3.8+
- MySQL 8.0+
- Node.js 18+（仅管理端需要）
- HBuilderX（运行/打包客户端 H5 推荐使用；社区版即可）

---

## 本地启动步骤

### 1. 准备数据库

1. 创建数据库（`school_map`，字符集 `utf8mb4`）：

   ```sql
   CREATE DATABASE school_map DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
   ```

2. 导入仓库根目录的表结构与示例数据（该 dump 只含表结构/数据，不含建库语句）：

   ```bash
   mysql -u root -p school_map < _localhost-2026_04_21_23_54_25-dump.sql
   ```

   Windows PowerShell 不支持 `<` 重定向，可改用：

   ```powershell
   Get-Content .\_localhost-2026_04_21_23_54_25-dump.sql -Raw | mysql -u root -p school_map
   ```

   或直接用 Navicat / DataGrip 导入该 SQL 文件到 `school_map` 库。

   > dump 里是演示账号（如管理员 `yyc / 123456`，`identity = 1` 表示管理员，`0` 表示普通用户），仅用于本地调试。

### 2. 启动后端

1. 复制配置模板并填入自己的数据库/密钥：

   ```bash
   cd back_end/school-map
   cp src/main/resources/application.example.yml src/main/resources/application.yml
   ```

   > ⚠️ Maven 用的是 `JAVA_HOME` 指向的 JDK，必须为 21（`mvn -v` 应显示 `Java version: 21`）。若系统 PATH 里的 `java` 是 1.8，需先把 `JAVA_HOME` 指到 JDK 21，否则编译报「不支持发行版本」。

   需要修改的项：`spring.datasource.password`（MySQL 密码）、`spring.ai.dashscope.api-key`、`yyc.alioss.*`（阿里云 OSS）。

   也可以不改文件，改用环境变量注入：`DB_USERNAME`、`DB_PASSWORD`、`DASHSCOPE_API_KEY`、`OSS_BUCKET_NAME`、`OSS_ENDPOINT`、`OSS_ACCESS_KEY_ID`、`OSS_ACCESS_KEY_SECRET`。

2. 启动：

   ```bash
   mvn spring-boot:run
   ```

   验证：用 Postman/curl 调用 `POST http://localhost:8080/user/login`（body 为 `{"username":"yyc","password":"123456"}`），返回 `code` 为 `1` 即表示后端与数据库都正常。

   ```bash
   curl -X POST http://localhost:8080/user/login -H "Content-Type: application/json" -d "{\"username\":\"yyc\",\"password\":\"123456\"}"
   ```

   > `application.yml` 已被 `.gitignore` 忽略，不要提交。

### 3. 启动后台管理端

```bash
cd manage-web
npm install
cp .env.example .env.local   # 填入高德 key（地图选点需要）
npm run dev
```

浏览器打开 <http://localhost:5173>，用管理员账号登录（默认 `yyc / 123456`）。

- 开发环境 `/api` 会被 Vite 代理到 `http://localhost:8080`（见 `vite.config.js`，后端地址取自 `VITE_APP_BASE_URL`，未配置时用默认值）。后端换了地址就在 `manage-web/.env.development` 增加一行 `VITE_APP_BASE_URL = 'http://新地址:端口'`。
- 生产构建：`npm run build:prod`，产物在 `manage-web/dist`，按 `/admin/` 子路径部署。

### 4. 启动手机端（H5）

```bash
cd client/git_uniapp
cp .env.example .env        # 填入 VITE_AMAP_KEY / VITE_AMAP_SECURITY_CODE / VITE_COZE_TOKEN
```

然后用 HBuilderX 打开 `client/git_uniapp` 目录 → 菜单 **运行 → 运行到浏览器 → Chrome**，默认 <http://localhost:8081>。

> 该工程是 HBuilderX 工程（编译依赖 HBuilderX 内置工具链），`package.json` 里没有 dev/build 脚本，`npm run dev:h5` 不可用。

- 高德地图 key 在 `main.js` 中按环境变量动态加载，`index.html` 不再写死 key。
- 请求后端的地址写死在 `client/git_uniapp/utils/request.js` 的 `BASE_URL = 'http://localhost:8080'`，换机器/换后端地址时改这里。
- 生产打包：HBuilderX 菜单 **发行 → 网站-PC Web**，产物在 `unpackage/dist/build/web`。

---

## 端口与地址速查

| 地址 | 说明 |
| --- | --- |
| `http://localhost:8080` | 后端 API |
| `http://localhost:8081` | 手机端 H5（开发） |
| `http://localhost:5173` | 后台管理端（开发） |

后端 CORS 已放行 `localhost:8081`、`localhost:5173-5175` 与生产域名 `xujcmap.top`（见 `config/WebConfig`）。换端口需同步修改。

---

## 常见问题

**地图空白 / 提示 key 无效**
检查 `.env` 里的 `VITE_AMAP_KEY`、`VITE_AMAP_SECURITY_CODE` 是否与高德控制台一致；高德 key 需为「Web 端(JS API)」类型，且安全密钥要配对使用。修改 `.env` 后需重启开发服务器。

**跨域（CORS）报错**
确认后端已启动，且前端访问的端口在 `WebConfig` 的白名单内。

**图片上传失败**
后端需要可用的阿里云 OSS 配置（`yyc.alioss.*`），否则图片上传与审核相关接口会报错。

**管理端登录失败**
提示「权限不足」说明该账号 `user.identity` 不为 1，需要管理员账号。

**AI 助手（Coze）无法使用**
`VITE_COZE_TOKEN` 未配置或已过期；相关页面为 `client/git_uniapp/static/coze-chat.html`。不配置不影响地图等主要功能。

---

## 目录结构

```
back_end/school-map/      Spring Boot 后端
  src/main/java/com/map/
    controller/admin|user 接口层
    service/              业务逻辑
    mapper/               MyBatis 接口（XML 在 resources/mapper）
    pojo/                 实体 / DTO / VO / Result / PageResult
    config/               CORS、OSS、AI
  src/main/resources/
    application.example.yml  配置模板（复制为 application.yml）
client/git_uniapp/        UniApp 客户端（HBuilderX 工程）
  pages/map/              主地图页
  components/             搜索栏、弹窗、评论、图片预览等
  composables/            useMap/useAuth/useComments/useRoutePlanning...
  utils/request.js        uni.request 封装
  config/map.js           地图 key（读 .env）与默认中心/缩放
manage-web/               Vue 3 后台管理端
  src/views/              地点、子地点、评论审核、图片审核、用户管理
```

---

## 贡献

提交前请确认没有把 `application.yml`、`.env` 等含密钥的文件加入版本库。

