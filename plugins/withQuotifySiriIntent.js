const path = require("path");
const fs = require("fs");
const {
  getPbxproj,
  addBuildSourceFileToGroup,
} = require("@expo/config-plugins/build/ios/utils/Xcodeproj");

const QUOTIFY_TARGET_UUID = "13B07F861A680F5B00A75B9A";
const SIRI_INTENT_SOURCE = path.join(
  __dirname,
  "quotify-siri-intent",
  "GetQuoteIntent.swift"
);
const SIRI_INTENT_DEST = "Quotify/GetQuoteIntent.swift";

/**
 * Ensures GetQuoteIntent.swift is copied into ios/Quotify/ so the Xcode project can reference it.
 * Then adds the file to the Quotify app target so the Siri App Intent is built with the app.
 */
function withQuotifySiriIntent(config) {
  return {
    ...config,
    mods: {
      ...config.mods,
      ios: {
        ...config.mods?.ios,
        xcodeproj: async (config) => {
          const platformRoot = config.modRequest.platformProjectRoot;
          const projectRoot = config.modRequest.projectRoot;
          let project = config.modResults;

          if (typeof project === "undefined" || project === null) {
            try {
              project = getPbxproj(projectRoot);
            } catch (e) {
              return config;
            }
          }

          try {
            const destPath = path.join(platformRoot, "Quotify", "GetQuoteIntent.swift");
            const destDir = path.dirname(destPath);
            if (!fs.existsSync(SIRI_INTENT_SOURCE)) {
              console.warn("withQuotifySiriIntent: source file not found", SIRI_INTENT_SOURCE);
              return { ...config, modResults: project };
            }
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true });
            }
            fs.copyFileSync(SIRI_INTENT_SOURCE, destPath);

            addBuildSourceFileToGroup({
              filepath: SIRI_INTENT_DEST,
              groupName: "Quotify",
              project,
              targetUuid: QUOTIFY_TARGET_UUID,
            });

            return { ...config, modResults: project };
          } catch (err) {
            console.warn("withQuotifySiriIntent: could not add Siri intent file", err.message);
            return { ...config, modResults: project };
          }
        },
      },
    },
  };
}

module.exports = withQuotifySiriIntent;
