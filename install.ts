#!/usr/bin/env bun

import { existsSync, mkdirSync, copyFileSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const TOOL_DESCRIPTION = `Search through past conversation histories in the current repository.

Searches:
- Session titles
- Message content (user and assistant messages)
- Tool invocations (grep, edit, bash, read, etc.)
- File paths mentioned or edited
- Files modified in patch parts (find which sessions changed a file)

Features:
- Keyword search (exact matches)
- Regex search (advanced patterns)
- Fuzzy search (typo-tolerant matching)
- Date filtering (today, last 7 days, date ranges)
- Role filtering (search only your messages or AI responses)
- File modification tracking (find which sessions edited a file)
- Case-sensitive option
- Configurable result limit (default: 50)
- Fuzzy threshold control (strictness)
- Results sorted by most recent first
- Works with OpenCode v1.2+ (SQLite) and v1.1.x (JSON files)

Examples:
- "Search my history for 'ripgrep'"
- "Search history for 'storage.*\\.ts' with regex"
- "Search history for 'storag' using fuzzy mode" (finds "storage")
- "Find conversations about authentication"
- "Search for 'grap' with fuzzy search" (finds "grep")
- "Search only my messages for 'storage'" (role: user)
- "Which sessions modified src/storage.ts?" (file modification search)`;

function getOpenCodeToolDir(): string {
  const home = homedir();

  const possiblePaths = [
    join(home, ".opencode", "tool"),
    join(home, ".config", "opencode", "tool"),
  ];

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      return path;
    }
  }

  const defaultPath = join(home, ".opencode", "tool");
  console.log(`📁 Creating OpenCode tool directory: ${defaultPath}`);
  mkdirSync(defaultPath, { recursive: true });
  return defaultPath;
}

function install() {
  console.log("🔍 OpenCode History Search Installer\n");

  try {
    const toolDir = getOpenCodeToolDir();
    const scriptDir = import.meta.dir;

    const sourcePath = join(scriptDir, "dist", "history-search.ts");
    const targetPath = join(toolDir, "history-search.ts");
    const descPath = join(toolDir, "history-search.txt");

    if (!existsSync(sourcePath)) {
      console.error("❌ Error: dist/history-search.ts not found");
      console.error("   Please run: bun run build");
      process.exit(1);
    }

    console.log(`📦 Installing to: ${toolDir}`);

    copyFileSync(sourcePath, targetPath);
    console.log("✅ Copied history-search.ts");

    writeFileSync(descPath, TOOL_DESCRIPTION);
    console.log("✅ Created history-search.txt (tool description)");

    console.log("\n🎉 Installation complete!");
    console.log("\n📝 Usage:");
    console.log(
      "   Ask OpenCode: \"Search my conversation history for 'storage'\"",
    );
    console.log("   Or: \"Search for 'storag' using fuzzy mode\"");
    console.log("\n💡 Restart OpenCode if it's currently running");
  } catch (error) {
    console.error("\n❌ Installation failed:", error);
    process.exit(1);
  }
}

install();
