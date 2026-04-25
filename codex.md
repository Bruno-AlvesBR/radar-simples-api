# Project Context

This is a typescript project using nestjs with mongoose.

The API has 31 routes. See .codesight/routes.md for the full route map with methods, paths, and tags.
The database has 11 models. See .codesight/schema.md for the full schema with fields, types, and relations.
Middleware includes: auth.

High-impact files (most imported, changes here affect many other files):
- src\user\schemas\user.schema.ts (imported by 7 files)
- src\auth\jwt-auth.guard.ts (imported by 6 files)
- src\auth\auth.module.ts (imported by 5 files)
- src\auth\current-user.decorator.ts (imported by 5 files)
- src\auth\google.strategy.ts (imported by 4 files)
- src\blog\blog.service.ts (imported by 4 files)
- src\keyword-research\keyword-research.service.ts (imported by 4 files)
- src\user\user.service.ts (imported by 4 files)

Required environment variables (no defaults):
- SEO_AUTOPILOT_MONGODB_URI (src\seo-autopilot\seo-autopilot-runner.ts)

Read .codesight/wiki/index.md for orientation (WHERE things live). Then read actual source files before implementing. Wiki articles are navigation aids, not implementation guides.
Read .codesight/CODESIGHT.md for the complete AI context map including all routes, schema, components, libraries, config, middleware, and dependency graph.
