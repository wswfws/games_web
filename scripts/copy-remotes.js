import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const REMOTES = [
  { name: "blackblast", source: join(root, "blackblast", "dist") },
  { name: "build_cat", source: join(root, "build_cat", "dist") },
  { name: "tictactoe", source: join(root, "tictactoe", "dist") },
  { name: "connect_four", source: join(root, "connect_four", "dist") },
  { name: "memory", source: join(root, "memory", "dist") },
];

const shellDist = join(root, "shell", "dist");

function copyDir(src, dest) {
  if (!existsSync(src)) return;
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const s = join(src, entry);
    const d = join(dest, entry);
    if (statSync(s).isDirectory()) {
      copyDir(s, d);
    } else {
      copyFileSync(s, d);
    }
  }
}

for (const remote of REMOTES) {
  const target = join(shellDist, "_remotes", remote.name);
  console.log(`Copying ${remote.name} -> ${target}`);
  copyDir(remote.source, target);
}

console.log("Remotes copied successfully.");
