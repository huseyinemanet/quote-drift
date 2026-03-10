const path = require("path");
const { getPbxproj } = require("@expo/config-plugins/build/ios/utils/Xcodeproj");

const WATCH_TARGET_NAME = "Quotify Watch App";
const WATCH_SUBFOLDER = "QuotifyWatch";
const WATCH_BUNDLE_ID = "com.huseyinemanet.quotify.watchkitapp";

const WATCH_SOURCE_FILES = [
  "QuotifyWatchApp.swift",
  "ContentView.swift",
  "QuoteStore.swift",
];

const WATCH_RESOURCE_FILES = ["QuotifyWatch-Info.plist"];

/**
 * Expo config plugin that adds the Quotify Watch App target to the iOS project
 * so that `expo prebuild` preserves it. Run after prebuild; the ios/QuotifyWatch
 * folder must exist with the Swift and plist files.
 */
function withQuotifyWatch(config) {
  return {
    ...config,
    mods: {
      ...config.mods,
      ios: {
        ...config.mods?.ios,
        xcodeproj: async (config) => {
          const platformRoot = config.modRequest.platformProjectRoot;
          let project = config.modResults;

          if (typeof project === "undefined" || project === null) {
            try {
              project = getPbxproj(platformRoot);
            } catch (e) {
              return config;
            }
          }

          const watchTarget = project.getTarget("com.apple.product-type.application.watchapp2");
          if (watchTarget) {
            return { ...config, modResults: project };
          }

          try {
            const target = project.addTarget(
              WATCH_TARGET_NAME,
              "watch2_app",
              WATCH_SUBFOLDER,
              WATCH_BUNDLE_ID
            );

            const existingGroup = project.pbxGroupByName(WATCH_SUBFOLDER);
            if (!existingGroup) {
              const groupKey = project.pbxCreateGroup(WATCH_SUBFOLDER, WATCH_SUBFOLDER);
              const firstProject = project.getFirstProject();
              const mainGroup = project.getPBXGroupByKey(firstProject.firstProject.mainGroup);
              if (mainGroup && mainGroup.children) {
                mainGroup.children.push({ value: groupKey, comment: WATCH_SUBFOLDER });
              }
            }

            project.addBuildPhase([], "PBXSourcesBuildPhase", "Sources", target.uuid);
            project.addBuildPhase([], "PBXResourcesBuildPhase", "Resources", target.uuid);

            const watchPath = path.join(platformRoot, WATCH_SUBFOLDER);
            for (const file of WATCH_SOURCE_FILES) {
              const filepath = path.relative(platformRoot, path.join(watchPath, file));
              project.addBuildSourceFileToGroup({
                filepath: filepath.replace(/\\/g, "/"),
                groupName: WATCH_SUBFOLDER,
                project,
                targetUuid: target.uuid,
              });
            }
            for (const file of WATCH_RESOURCE_FILES) {
              const filepath = path.relative(platformRoot, path.join(watchPath, file));
              project.addResourceFileToGroup({
                filepath: filepath.replace(/\\/g, "/"),
                groupName: WATCH_SUBFOLDER,
                isBuildFile: true,
                project,
                targetUuid: target.uuid,
              });
            }

            const nativeTargets = project.pbxNativeTargetSection();
            const buildConfigs = project.pbxXCBuildConfigurationSection();
            const watchConfigListId = nativeTargets[target.uuid].buildConfigurationList;

            for (const key of Object.keys(buildConfigs)) {
              if (key.endsWith("_comment")) continue;
              const buildConfig = buildConfigs[key];
              if (buildConfig.isa !== "XCBuildConfiguration") continue;
              const lists = project.pbxXCConfigurationList();
              const listEntry = Object.entries(lists).find(
                ([k, v]) =>
                  !k.endsWith("_comment") &&
                  v.buildConfigurations?.some((c) => c.value === key)
              );
              if (!listEntry || listEntry[0] !== watchConfigListId) continue;
              buildConfig.buildSettings.SDKROOT = "watchos";
              buildConfig.buildSettings.TARGETED_DEVICE_FAMILY = "4";
              buildConfig.buildSettings.WATCHOS_DEPLOYMENT_TARGET = "10.0";
              buildConfig.buildSettings.CODE_SIGN_STYLE = "Automatic";
            }

            return { ...config, modResults: project };
          } catch (err) {
            console.warn("withQuotifyWatch: could not add Watch target", err.message);
            return config;
          }
        },
      },
    },
  };
}

module.exports = withQuotifyWatch;
