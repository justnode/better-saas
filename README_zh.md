# Better SaaS

[English](README.md) | 中文版 

一个现代化的全栈 SaaS 应用程序，基于 Next.js 15 构建，集成了身份验证、支付、文件管理和国际化功能，并配备了全面的测试套件。

## 🚀 功能特性

- **🔐 身份验证**: 邮箱/密码和社交登录（GitHub、Google），基于 Better Auth
- **💳 支付系统**: Stripe 集成，支持订阅管理和计费仪表板
- **📁 文件管理**: 文件上传、预览和管理，支持 AWS S3/R2 存储
- **🌍 国际化**: 多语言支持（英语/中文），基于 next-intl
- **📱 响应式设计**: 现代 UI，使用 Radix UI 和 Tailwind CSS v4
- **📖 文档系统**: 内置文档系统，基于 Fumadocs
- **🔒 路由保护**: 基于角色的访问控制和路由保护
- **👥 管理后台**: 用户管理和系统管理
- **⚡ 性能优化**: 使用 Next.js 15 App Router 和 Turbo 模式优化
- **🧪 测试**: 全面的测试套件，包括 Jest、Playwright 和集成测试

## 🛠️ 技术栈

### 前端

- **框架**: Next.js 15 (App Router)
- **UI 组件**: Radix UI + Tailwind CSS
- **状态管理**: Zustand
- **数据获取**: SWR
- **样式**: Tailwind CSS v4
- **图标**: Lucide React

### 后端

- **运行时**: Node.js
- **数据库**: PostgreSQL 配合 Drizzle ORM
- **身份验证**: Better Auth
- **支付**: Stripe
- **文件存储**: AWS S3/Cloudflare R2
- **验证**: Zod

### 开发与测试

- **语言**: TypeScript
- **包管理器**: pnpm
- **代码质量**: Biome（格式化、代码检查）
- **环境**: @t3-oss/env-nextjs
- **单元测试**: Jest 配合 React Testing Library
- **集成测试**: Jest 配合数据库集成
- **端到端测试**: Playwright 支持多浏览器
- **测试覆盖率**: 全面的覆盖率报告

## 📖 文档

完整的项目文档已迁移至在线文档站点，请访问：

**🌐 [https://www.better-saas.org/zh/docs](https://www.better-saas.org/zh/docs)**

在线文档包含：

- 🏗️ 架构设计与系统概述
- 📦 详细安装与配置指南
- 🔧 API 接口文档与示例
- 🎨 UI 组件库使用说明
- 🧪 测试策略与最佳实践
- 🚀 部署指南与生产环境配置
- 🌍 国际化实现方案
- 💳 支付集成与订阅管理

> 💡 **提示**：在线文档会持续更新，建议收藏以获取最新信息。

## 🚀 快速开始

### 前置要求

- Node.js 18+
- pnpm
- PostgreSQL 数据库
- Stripe 账户（用于支付）
- AWS S3 或 Cloudflare R2（用于文件存储）

### 安装

1. **克隆仓库**

   ```bash
   git clone <repository-url>
   cd better-saas
   ```

2. **安装依赖**

   ```bash
   pnpm install
   ```

3. **设置环境变量**

   ```bash
   cp env.example .env
   ```

   填写必要的环境变量：

   - `DATABASE_URL`: PostgreSQL 连接字符串
   - `BETTER_AUTH_SECRET`: 身份验证的随机密钥
   - `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: GitHub OAuth 应用凭证
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth 应用凭证
   - `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`: Stripe API 密钥
   - `NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY` & `NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY`: Stripe 价格 ID
   - `R2_*`: Cloudflare R2 或 AWS S3 配置
   - `NEXT_PUBLIC_APP_URL`: 应用的 URL
   - `ADMIN_EMAILS`: 管理员邮箱地址，用逗号分隔

4. **设置数据库**

   ```bash
   pnpm db:push
   ```

5. **启动开发服务器**

   ```bash
   pnpm dev
   ```

   在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

应用支持多种语言：

- 英语（默认）
- 中文（简体）

语言文件位于 `src/i18n/messages/` 目录。

## 🤝 贡献

1. Fork 仓库
2. 创建功能分支
3. 进行更改
4. 为新功能编写测试
5. 运行测试和质量检查：
   ```bash
   pnpm test:all
   pnpm check
   pnpm typecheck
   ```
6. 确保所有测试通过且满足覆盖率要求
7. 提交 Pull Request

## 📄 许可证

本项目基于 MIT 许可证。 

## 🤝 社区与支持
扫码添加作者微信，邀请你进入专属答疑微信群，获取配套的视频教程和实战项目代码。
<div align="center">
  <img src="public/images/wechat.png" alt="WeChat" width="30%" />
</div>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=justnode/better-saas&type=Date)](https://www.star-history.com/#justnode/better-saas&Date)