import ExpoModulesCore
import UIKit
import WidgetKit

public class BrandingNativeModule: Module {
  private let appGroup = "group.com.brandlab.demo"
  private let widgetPayloadKey = "brandlab.widget.payload"
  private let variants = ["default", "happy", "sleepy", "sad", "celebration"]

  public func definition() -> ModuleDefinition {
    Name("BrandingNative")

    AsyncFunction("getCapabilities") { () async -> [String: Any] in
      let supportsAlternateIcons = await MainActor.run { UIApplication.shared.supportsAlternateIcons }
      let supportsWidgetExtension = ProcessInfo.processInfo.operatingSystemVersion.majorVersion >= 17
      [
        "platform": "ios",
        "nativeModuleAvailable": true,
        "iconSwitch": supportsAlternateIcons ? "supported" : "requires-configuration",
        "nameSwitch": "requires-rebuild",
        "widgets": supportsWidgetExtension ? "supported" : "unavailable",
        "explanation": supportsWidgetExtension
          ? "iOS supports declared alternate icons and WidgetKit. The app display name is configured at build time."
          : "This WidgetKit extension targets iOS 17 or newer. The app display name is configured at build time.",
      ]
    }

    AsyncFunction("getActiveIcon") { (promise: Promise) in
      DispatchQueue.main.async {
        let name = UIApplication.shared.alternateIconName ?? ""
        let variant = name.replacingOccurrences(of: "AppIcon-", with: "").lowercased()
        promise.resolve(self.variants.contains(variant) ? variant : "default")
      }
    }

    AsyncFunction("setIcon") { (variant: String, promise: Promise) in
      guard self.variants.contains(variant) else {
        promise.resolve(["ok": false, "message": "Unknown iOS icon variant: \(variant)"])
        return
      }
      DispatchQueue.main.async {
        guard UIApplication.shared.supportsAlternateIcons else {
          promise.resolve(["ok": false, "message": "This iOS app build does not support alternate icons."])
          return
        }
        let name = variant == "default" ? nil : "AppIcon-\(variant.capitalized)"
        UIApplication.shared.setAlternateIconName(name) { error in
          if let error {
            NSLog("[BrandLab] iOS alternate icon update failed: %@", error.localizedDescription)
            promise.resolve(["ok": false, "message": "iOS rejected the icon change: \(error.localizedDescription)"])
          } else {
            promise.resolve(["ok": true, "message": "iOS alternate icon change completed."])
          }
        }
      }
    }

    AsyncFunction("setAppName") { (name: String) -> [String: Any] in
      ["ok": false, "message": "iOS does not support runtime display-name changes. Set CFBundleDisplayName and rebuild the app."]
    }

    AsyncFunction("updateWidget") { (payload: [String: Any]) -> [String: Any] in
      guard let defaults = UserDefaults(suiteName: self.appGroup) else {
        return ["ok": false, "message": "App Group \(self.appGroup) is unavailable. Check the host and widget entitlements."]
      }
      defaults.set(payload, forKey: self.widgetPayloadKey)
      WidgetCenter.shared.reloadAllTimelines()
      return ["ok": true, "message": "Widget data was saved to the App Group and a WidgetKit refresh requested."]
    }
  }
}
