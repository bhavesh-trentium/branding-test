package expo.modules.dynamicbranding

import android.content.ComponentName
import android.content.pm.PackageManager
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class BrandingNativeModule : Module() {
  private val variants = listOf("default", "happy", "sleepy", "sad", "celebration")
  private val nameKeys = mapOf(
    "BrandLab" to "default",
    "BrandLab Active" to "active",
    "BrandLab Focus" to "focus",
    "BrandLab Celebration" to "celebration",
  )

  override fun definition() = ModuleDefinition {
    Name("BrandingNative")

    AsyncFunction("getCapabilities") {
      mapOf(
        "platform" to "android",
        "nativeModuleAvailable" to true,
        "iconSwitch" to "supported",
        "nameSwitch" to "supported",
        "widgets" to "supported",
        "explanation" to "Android uses declared activity-alias entries for launcher icons and display labels. Launcher refresh timing is controlled by the device.",
      )
    }

    AsyncFunction("getActiveIcon") {
      appContext.reactContext?.getSharedPreferences("brandlab.native", 0)?.getString("variant", "default") ?: "default"
    }

    AsyncFunction("setIcon") { variant: String ->
      if (variant !in variants) return@AsyncFunction mapOf("ok" to false, "message" to "Unknown icon variant: $variant")
      val context = appContext.reactContext ?: return@AsyncFunction mapOf("ok" to false, "message" to "Android application context is unavailable.")
      val prefs = context.getSharedPreferences("brandlab.native", 0)
      val name = prefs.getString("appNameKey", "default") ?: "default"
      val result = switchLauncherAlias(context.packageName, variant, name)
      if (result) prefs.edit().putString("variant", variant).apply()
      mapOf("ok" to result, "message" to if (result) "Android launcher icon change requested." else "Android could not enable the selected launcher component.")
    }

    AsyncFunction("setAppName") { name: String ->
      val nameKey = nameKeys[name] ?: return@AsyncFunction mapOf("ok" to false, "message" to "This app name is not declared in the Android manifest.")
      val context = appContext.reactContext ?: return@AsyncFunction mapOf("ok" to false, "message" to "Android application context is unavailable.")
      val prefs = context.getSharedPreferences("brandlab.native", 0)
      val variant = prefs.getString("variant", "default") ?: "default"
      val result = switchLauncherAlias(context.packageName, variant, nameKey)
      if (result) prefs.edit().putString("appNameKey", nameKey).putString("appName", name).apply()
      mapOf("ok" to result, "message" to if (result) "Android launcher label change requested." else "Android could not enable the selected app label.")
    }

    AsyncFunction("updateWidget") Coroutine { payload: Map<String, Any?> ->
      val context = appContext.reactContext
      if (context == null) {
        mapOf("ok" to false, "message" to "Android application context is unavailable.")
      } else {
        try {
          withContext(Dispatchers.IO) { BrandLabGlanceWidget.storeState(context, payload) }
          mapOf("ok" to true, "message" to "Android widget data was saved and a refresh requested.")
        } catch (error: Exception) {
          android.util.Log.e("BrandLab", "Failed to update Glance widget", error)
          mapOf("ok" to false, "message" to "Widget update failed: ${error.localizedMessage ?: "unknown error"}")
        }
      }
    }
  }

  private fun switchLauncherAlias(packageName: String, variant: String, nameKey: String): Boolean {
    val context = appContext.reactContext ?: return false
    val manager = context.packageManager
    val selected = ComponentName(packageName, "$packageName.BrandLab_${variant}_$nameKey")
    return try {
      manager.setComponentEnabledSetting(selected, PackageManager.COMPONENT_ENABLED_STATE_ENABLED, PackageManager.DONT_KILL_APP)
      for (icon in variants) for (label in nameKeys.values) {
        val component = ComponentName(packageName, "$packageName.BrandLab_${icon}_$label")
        if (component != selected) manager.setComponentEnabledSetting(component, PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP)
      }
      true
    } catch (error: Exception) {
      android.util.Log.e("BrandLab", "Unable to switch launcher alias", error)
      false
    }
  }
}
