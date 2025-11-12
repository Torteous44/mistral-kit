#!/usr/bin/env node
import { mkdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import process from "node:process";

const ROUTES = [
  {
    name: "Chat proxy",
    slug: "mistral",
    importPath: "@matthewporteous/mistral-kit/next/api/chat",
    runtime: "edge",
    dynamic: "force-dynamic",
  },
  {
    name: "Embeddings proxy",
    slug: "embeddings",
    importPath: "@matthewporteous/mistral-kit/next/api/embeddings",
    runtime: "edge",
  },
  {
    name: "Upload text",
    slug: "upload-text",
    importPath: "@matthewporteous/mistral-kit/next/api/upload-text",
    runtime: "nodejs",
    dynamic: "force-dynamic",
  },
  {
    name: "Weather proxy",
    slug: "weather",
    importPath: "@matthewporteous/mistral-kit/next/api/weather",
    runtime: "edge",
    dynamic: "force-dynamic",
  },
];


function printHelp() {
  console.log(`mistral-kit <command>

Commands:
  init            Scaffold Next.js API routes for @matthewporteous/mistral-kit

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

  const cssUpdate = ensureGlobalCssSources(appDir, baseDir, cwd);

  console.log(`\nScaffolded API routes in ${relative(cwd, appDir) || "."}\n`);
  results.forEach((result) => {
    if (result.status === "written") {
      console.log(`  ✓ ${result.path}`);
    } else {
      console.log(`  • ${result.path} (skipped — already exists)`);
    }
  });

  if (cssUpdate.status === "written") {
    console.log(`\n  ✓ Added Tailwind @source directives to ${cssUpdate.path}`);
  } else if (cssUpdate.status === "skipped") {
    console.log(
      `\n  • Skipped Tailwind @source directives (missing ${cssUpdate.path})`
    );
  } else if (cssUpdate.status === "unchanged") {
    console.log(`\n  • Tailwind @source directives already configured`);
  }

  console.log(
    "\nSet MISTRAL_API_KEY in your environment and point your UI components at /api/mistral."
  );
}

function ensureGlobalCssSources(appDir, baseDir, cwd) {
  const globalsPath = join(appDir, "globals.css");
  const displayPath = relative(cwd, globalsPath);
  if (!existsSync(globalsPath)) {
    return { status: "skipped", path: displayPath };
  }

  const original = readFileSync(globalsPath, "utf8");
  const normalized = original.replace(/\r\n/g, "\n");
  const directives = buildSourceDirectives(globalsPath, baseDir, cwd);
  if (directives.length === 0) {
    return { status: "unchanged", path: displayPath };
  }

  const lines = normalized.split("\n");
  const filteredLines = lines.filter(
    (line) => !isScaffoldedSourceLine(line)
  );
  const rest = filteredLines.join("\n").replace(/^\n+/, "");
  const block = directives.join("\n");
  let nextContent = rest ? `${block}\n\n${rest}` : `${block}`;
  if (!nextContent.endsWith("\n")) {
    nextContent += "\n";
  }

  if (normalized === nextContent) {
    return { status: "unchanged", path: displayPath };
  }

  writeFileSync(globalsPath, nextContent, "utf8");
  return { status: "written", path: displayPath };
}

function isScaffoldedSourceLine(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("@source")) return false;
  return (
    trimmed.includes("@matthewporteous/mistral-kit") ||
    trimmed.includes("packages/ui/src")
  );
}

function buildSourceDirectives(globalsPath, baseDir, cwd) {
  const cssDir = dirname(globalsPath);
  const directives = [];

  const workspaceSrc = findWorkspaceSourceDir(baseDir, cwd);
  if (workspaceSrc) {
    directives.push(
      buildSourceDirective(cssDir, workspaceSrc, "**/*.{ts,tsx,js,jsx}")
    );
  }

  const distDir = join(
    baseDir,
    "node_modules",
    "@matthewporteous",
    "mistral-kit",
    "dist"
  );
  directives.push(buildSourceDirective(cssDir, distDir, "**/*.{ts,tsx,js,jsx}"));

  return directives;
}

function buildSourceDirective(fromDir, targetDir, glob) {
  const relPath = normalizeForCss(relative(fromDir, targetDir) || ".");
  const prefix = relPath.startsWith(".") ? relPath : `./${relPath}`;
  return `@source "${prefix}/${glob}";`;
}

function normalizeForCss(pathValue) {
  return pathValue.split("\\").join("/");
}

function findWorkspaceSourceDir(baseDir, cwd) {
  const seen = new Set();
  const roots = [cwd, baseDir];

  for (const root of roots) {
    let current = root;
    while (!seen.has(current)) {
      seen.add(current);
      const candidate = resolve(current, "packages/ui/src");
      if (existsSync(candidate)) {
        return candidate;
      }
      const parent = dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }

  return null;
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
