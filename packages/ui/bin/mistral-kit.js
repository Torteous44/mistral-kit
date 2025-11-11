#!/usr/bin/env node
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import process from "node:process";

const ROUTES = [
  {
    name: "Chat proxy",
    slug: "mistral",
    importPath: "@mistral/ui/next/api/chat",
    runtime: "edge",
    dynamic: "force-dynamic",
  },
  {
    name: "Embeddings proxy",
    slug: "embeddings",
    importPath: "@mistral/ui/next/api/embeddings",
    runtime: "edge",
  },
  {
    name: "Upload text",
    slug: "upload-text",
    importPath: "@mistral/ui/next/api/upload-text",
    runtime: "nodejs",
    dynamic: "force-dynamic",
  },
  {
    name: "Weather proxy",
    slug: "weather",
    importPath: "@mistral/ui/next/api/weather",
    runtime: "edge",
    dynamic: "force-dynamic",
  },
];

function printHelp() {
  console.log(`mistral-kit <command>

Commands:
  init            Scaffold Next.js API routes for @mistral/ui

Options:
  --dir <path>        Root directory of your Next.js app (default: .)
  --app-dir <path>    Path to the app directory relative to --dir (default: auto-detect src/app or app)
  --force             Overwrite existing files
  --help              Show this message

Examples:
  npx mistral-kit init
  pnpm mistral-kit init -- --dir apps/site
  pnpm mistral-kit init -- --dir apps/site --app-dir src/app
`);
}

function parseOptions(tokens) {
  const opts = { dir: ".", appDir: undefined, force: false };
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === "--force") {
      opts.force = true;
      continue;
    }
    if (token === "--dir") {
      opts.dir = tokens[++i] ?? opts.dir;
      continue;
    }
    if (token.startsWith("--dir=")) {
      opts.dir = token.split("=")[1];
      continue;
    }
    if (token === "--app-dir") {
      opts.appDir = tokens[++i];
      continue;
    }
    if (token.startsWith("--app-dir=")) {
      opts.appDir = token.split("=")[1];
      continue;
    }
    if (token === "--help" || token === "-h") {
      opts.help = true;
      continue;
    }
    console.warn(`Unknown option: ${token}`);
  }
  return opts;
}

function ensureDir(filePath) {
  mkdirSync(dirname(filePath), { recursive: true });
}

function buildRouteContents(route) {
  const handlerName = `${route.slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}Handler`;
  const lines = [
    `import { POST as ${handlerName} } from "${route.importPath}";`,
    "",
    `export const runtime = "${route.runtime}";`,
  ];

  if (route.dynamic) {
    lines.push(`export const dynamic = "${route.dynamic}";`);
  }

  lines.push(`export const POST = ${handlerName};`, "");
  return lines.join("\n");
}

function resolveAppDirectory(baseDir, override) {
  if (override) {
    return join(baseDir, override);
  }
  const candidateWithSrc = join(baseDir, "src/app");
  if (existsSync(candidateWithSrc)) return candidateWithSrc;
  return join(baseDir, "app");
}

function runInit(options) {
  const cwd = process.cwd();
  const baseDir = resolve(cwd, options.dir ?? ".");
  const appDir = resolveAppDirectory(baseDir, options.appDir);
  const results = [];

  ROUTES.forEach((route) => {
    const routeFile = join(appDir, "api", route.slug, "route.ts");
    const displayPath = relative(cwd, routeFile);
    if (existsSync(routeFile) && !options.force) {
      results.push({ path: displayPath, status: "skipped", reason: "exists" });
      return;
    }

    ensureDir(routeFile);
    writeFileSync(routeFile, buildRouteContents(route), "utf8");
    results.push({ path: displayPath, status: "written" });
  });

  console.log(`\nScaffolded API routes in ${relative(cwd, appDir) || "."}\n`);
  results.forEach((result) => {
    if (result.status === "written") {
      console.log(`  ✓ ${result.path}`);
    } else {
      console.log(`  • ${result.path} (skipped — already exists)`);
    }
  });

  console.log(
    "\nSet MISTRAL_API_KEY in your environment and point your UI components at /api/mistral."
  );
}

function main() {
  const [command, ...rest] = process.argv.slice(2);
  const options = parseOptions(rest);

  if (!command || command === "help" || options.help) {
    printHelp();
    process.exit(0);
  }

  if (command === "init") {
    runInit(options);
    return;
  }

  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}

main();
