#!/usr/bin/env node
/**
 * EAS Build: inject GoogleService-Info.plist from secret into ios/Quotify/
 * so Xcode can find it. Run as eas-build-post-install.
 *
 * Set ONE of these secrets in Expo Dashboard (project → Secrets):
 * - GOOGLE_SERVICES_PLIST_CONTENT: raw XML content (paste entire plist file)
 * - GOOGLE_SERVICES_PLIST_BASE64:  base64-encoded plist (avoids newline/quote issues)
 * - GOOGLE_SERVICES_PLIST_PATH:    path to plist file (if EAS provides path for file upload)
 */
const fs = require("fs");
const path = require("path");

const outPath = path.join(__dirname, "..", "ios", "Quotify", "GoogleService-Info.plist");
const outDir = path.dirname(outPath);

function fail(msg) {
  console.error("[eas-inject-google-services]", msg);
  process.exit(1);
}

if (!process.env.EAS_BUILD) {
  console.log("[eas-inject-google-services] Not in EAS build, skipping.");
  process.exit(0);
}

const pathVar = process.env.GOOGLE_SERVICES_PLIST_PATH;
const contentVar = process.env.GOOGLE_SERVICES_PLIST_CONTENT;
const base64Var = process.env.GOOGLE_SERVICES_PLIST_BASE64;

if (pathVar) {
  const src = path.resolve(pathVar);
  if (!fs.existsSync(src)) {
    fail("GOOGLE_SERVICES_PLIST_PATH points to missing file: " + src);
  }
  if (!fs.existsSync(outDir)) {
    fail("Output directory does not exist: " + outDir);
  }
  fs.copyFileSync(src, outPath);
  console.log("[eas-inject-google-services] Copied from GOOGLE_SERVICES_PLIST_PATH to", outPath);
  process.exit(0);
}

if (base64Var) {
  if (!fs.existsSync(outDir)) {
    fail("Output directory does not exist: " + outDir);
  }
  const content = Buffer.from(base64Var, "base64").toString("utf8");
  fs.writeFileSync(outPath, content, "utf8");
  console.log("[eas-inject-google-services] Wrote GoogleService-Info.plist from GOOGLE_SERVICES_PLIST_BASE64");
  process.exit(0);
}

if (contentVar) {
  if (!fs.existsSync(outDir)) {
    fail("Output directory does not exist: " + outDir);
  }
  fs.writeFileSync(outPath, contentVar, "utf8");
  console.log("[eas-inject-google-services] Wrote GoogleService-Info.plist from GOOGLE_SERVICES_PLIST_CONTENT");
  process.exit(0);
}

fail(
  "Missing secret: set GOOGLE_SERVICES_PLIST_CONTENT (paste plist XML), GOOGLE_SERVICES_PLIST_BASE64, or GOOGLE_SERVICES_PLIST_PATH in Expo Dashboard → project → Secrets for production builds."
);
