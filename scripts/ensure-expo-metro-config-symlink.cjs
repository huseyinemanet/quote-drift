#!/usr/bin/env node
/**
 * Ensures nested node_modules paths used by Metro exist as symlinks to hoisted
 * packages. When require() runs from within expo or expo-router, Node looks in
 * their node_modules first; npm hoists to root, so we create symlinks.
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const nodeModules = path.join(root, "node_modules");

function getDependencyNames(pkgPath) {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    const deps = { ...pkg.dependencies, ...pkg.peerDependencies };
    return Object.keys(deps || {});
  } catch {
    return [];
  }
}

function ensureSymlink(baseDir, depName, targetPath) {
  if (!fs.existsSync(targetPath)) return;
  const isScoped = depName.startsWith("@");
  const symlinkPath = isScoped
    ? path.join(baseDir, depName)
    : path.join(baseDir, depName);
  try {
    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
    if (isScoped) {
      const scopeDir = path.dirname(symlinkPath);
      if (!fs.existsSync(scopeDir)) fs.mkdirSync(scopeDir, { recursive: true });
    }
    const relativeTarget = path.relative(path.dirname(symlinkPath), targetPath);
    if (fs.existsSync(symlinkPath)) {
      const stat = fs.lstatSync(symlinkPath);
      if (stat.isSymbolicLink()) {
        const current = fs.readlinkSync(symlinkPath);
        if (path.resolve(path.dirname(symlinkPath), current) === targetPath) return;
      }
      fs.unlinkSync(symlinkPath);
    }
    fs.symlinkSync(relativeTarget, symlinkPath);
  } catch (e) {
    console.warn("postinstall: could not create symlink", depName, e.message);
  }
}

const parents = [
  { name: "expo", base: path.join(nodeModules, "expo", "node_modules") },
  { name: "expo-router", base: path.join(nodeModules, "expo-router", "node_modules") },
  { name: "react-native", base: path.join(nodeModules, "react-native", "node_modules") },
];

for (const { name, base } of parents) {
  const pkgPath = path.join(nodeModules, name, "package.json");
  if (!fs.existsSync(pkgPath)) continue;
  for (const dep of getDependencyNames(pkgPath)) {
    const target = dep.startsWith("@")
      ? path.join(nodeModules, dep.split("/")[0], dep.split("/")[1])
      : path.join(nodeModules, dep);
    ensureSymlink(base, dep, target);
  }
}
