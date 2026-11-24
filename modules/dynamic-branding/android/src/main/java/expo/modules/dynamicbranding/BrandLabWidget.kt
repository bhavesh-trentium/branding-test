package expo.modules.dynamicbranding

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.LocalSize
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.LinearProgressIndicator
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.action.actionStartActivity
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.appwidget.updateAll
import androidx.glance.background
import androidx.glance.color.ColorProvider as DayNightColor
import androidx.glance.layout.Alignment
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.width
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

private val SMALL = DpSize(180.dp, 110.dp)
private val MEDIUM = DpSize(320.dp, 150.dp)
// Day/night pairs follow the system dark mode; values match the app's light and dark themes.
private val SURFACE = DayNightColor(day = Color(0xFFF7F7FC), night = Color(0xFF191C28))
private val TEXT = DayNightColor(day = Color(0xFF202334), night = Color(0xFFF2F3F8))
private val MUTED = DayNightColor(day = Color(0xFF85899B), night = Color(0xFF9A9FB3))
private val TRACK = DayNightColor(day = Color(0xFFE8E9F0), night = Color(0xFF2B2F40))

class BrandLabGlanceWidget : GlanceAppWidget() {
  override val sizeMode = SizeMode.Responsive(setOf(SMALL, MEDIUM))

  override suspend fun provideGlance(context: Context, id: GlanceId) {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    val mood = prefs.getString("stateLabel", "Default") ?: "Default"
    val streak = prefs.getInt("streak", 0)
    val progress = prefs.getFloat("dailyProgress", 0f).coerceIn(0f, 1f)
    val variant = prefs.getString("variant", "default") ?: "default"
    val lastActivity = formatDay(prefs.getString("lastActivityAt", null))
    // MainActivity has no launcher filter (aliases own it), so ask the package manager for the active entry point.
    val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
    provideContent {
      val modifier = GlanceModifier.fillMaxSize().background(SURFACE).cornerRadius(20.dp).padding(16.dp)
      BrandLabWidgetContent(
        modifier = if (launch != null) modifier.clickable(actionStartActivity(launch)) else modifier,
        mood = mood, streak = streak, progress = progress, accent = accentFor(variant), lastActivity = lastActivity,
      )
    }
  }

  @Composable
  private fun BrandLabWidgetContent(modifier: GlanceModifier, mood: String, streak: Int, progress: Float, accent: Color, lastActivity: String) {
    val expanded = LocalSize.current.width >= MEDIUM.width
    Column(modifier = modifier, verticalAlignment = Alignment.Vertical.CenterVertically) {
      Text("BRANDLAB  ·  $streak DAY STREAK", style = TextStyle(color = MUTED, fontSize = 10.sp, fontWeight = FontWeight.Bold))
      Spacer(GlanceModifier.height(8.dp))
      Row(modifier = GlanceModifier.fillMaxWidth(), verticalAlignment = Alignment.Vertical.CenterVertically) {
        Text("✦", style = TextStyle(color = ColorProvider(accent), fontSize = 18.sp, fontWeight = FontWeight.Bold))
        Spacer(GlanceModifier.width(8.dp))
        Text("$mood mode", modifier = GlanceModifier.defaultWeight(), maxLines = 1, style = TextStyle(color = TEXT, fontSize = 16.sp, fontWeight = FontWeight.Bold))
        if (expanded) Text("${(progress * 100).toInt()}%", style = TextStyle(color = ColorProvider(accent), fontSize = 18.sp, fontWeight = FontWeight.Bold))
      }
      Spacer(GlanceModifier.height(10.dp))
      LinearProgressIndicator(progress = progress, modifier = GlanceModifier.fillMaxWidth().height(6.dp), color = ColorProvider(accent), backgroundColor = TRACK)
      Spacer(GlanceModifier.height(8.dp))
      Text(
        if (expanded) "Last activity · $lastActivity" else "${(progress * 100).toInt()}% today · $lastActivity",
        maxLines = 1,
        style = TextStyle(color = MUTED, fontSize = 11.sp),
      )
    }
  }

  companion object {
    private const val PREFS = "brandlab.widget"

    private fun accentFor(variant: String) = when (variant) {
      "happy" -> Color(0xFFF4A641)
      "sleepy" -> Color(0xFF6C89B8)
      "sad" -> Color(0xFF637286)
      "celebration" -> Color(0xFFE96855)
      else -> Color(0xFF7465E8)
    }

    /** "2026-11-24T05:10:00.000Z" -> "24 Nov" in the device's locale and time zone. */
    private fun formatDay(iso: String?): String {
      if (iso.isNullOrEmpty()) return "Today"
      return try {
        val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply { timeZone = TimeZone.getTimeZone("UTC") }
        SimpleDateFormat("d MMM", Locale.getDefault()).format(parser.parse(iso)!!)
      } catch (error: Exception) {
        iso.take(10)
      }
    }

    suspend fun storeState(context: Context, data: Map<String, Any?>) {
      context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
        .putString("variant", data["variant"]?.toString() ?: "default")
        .putString("stateLabel", data["stateLabel"]?.toString() ?: "Default")
        .putInt("streak", (data["streak"] as? Number)?.toInt() ?: 0)
        .putFloat("dailyProgress", (data["dailyProgress"] as? Number)?.toFloat() ?: 0f)
        .putString("lastActivityAt", data["lastActivityAt"]?.toString() ?: "")
        .commit() // synchronous (caller is on Dispatchers.IO) so updateAll never renders stale values

      BrandLabGlanceWidget().updateAll(context)
    }
  }
}

class BrandLabWidgetReceiver : GlanceAppWidgetReceiver() {
  override val glanceAppWidget: GlanceAppWidget = BrandLabGlanceWidget()
}
