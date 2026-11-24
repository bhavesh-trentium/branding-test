import SwiftUI
import UIKit
import WidgetKit

private let brandLabAppGroup = "group.com.brandlab.demo"
private let brandLabPayloadKey = "brandlab.widget.payload"

struct BrandLabEntry: TimelineEntry {
  let date: Date
  let variant: String
  let stateLabel: String
  let streak: Int
  let progress: Double
  let lastActivityAt: String

  static let placeholder = BrandLabEntry(
    date: .now,
    variant: "default",
    stateLabel: "Default",
    streak: 4,
    progress: 0.62,
    lastActivityAt: ISO8601DateFormatter().string(from: .now)
  )
}

struct BrandLabProvider: TimelineProvider {
  func placeholder(in context: Context) -> BrandLabEntry { .placeholder }

  func getSnapshot(in context: Context, completion: @escaping (BrandLabEntry) -> Void) {
    completion(readEntry())
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<BrandLabEntry>) -> Void) {
    let entry = readEntry()
    let nextRefresh = Calendar.current.date(byAdding: .hour, value: 2, to: .now) ?? .now.addingTimeInterval(7200)
    completion(Timeline(entries: [entry], policy: .after(nextRefresh)))
  }

  private func readEntry() -> BrandLabEntry {
    guard let payload = UserDefaults(suiteName: brandLabAppGroup)?.dictionary(forKey: brandLabPayloadKey) else { return .placeholder }
    return BrandLabEntry(
      date: .now,
      variant: payload["variant"] as? String ?? "default",
      stateLabel: payload["stateLabel"] as? String ?? "Default",
      streak: payload["streak"] as? Int ?? 0,
      progress: payload["dailyProgress"] as? Double ?? 0,
      lastActivityAt: payload["lastActivityAt"] as? String ?? ""
    )
  }
}

struct BrandLabWidgetView: View {
  @Environment(\.widgetFamily) private var family
  let entry: BrandLabEntry

  private var accent: Color {
    switch entry.variant {
    case "happy": Color(red: 0.96, green: 0.65, blue: 0.25)
    case "sleepy": Color(red: 0.42, green: 0.54, blue: 0.72)
    case "sad": Color(red: 0.39, green: 0.45, blue: 0.53)
    case "celebration": Color(red: 0.91, green: 0.40, blue: 0.33)
    default: Color(red: 0.45, green: 0.40, blue: 0.91)
    }
  }

  private var activityLabel: String {
    guard let date = ISO8601DateFormatter().date(from: entry.lastActivityAt) else { return "Today" }
    return date.formatted(date: .abbreviated, time: .omitted)
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 10) {
      HStack {
        Text("BRANDLAB").font(.system(size: 10, weight: .bold, design: .rounded)).tracking(1.1)
        Spacer()
        Text("\(entry.streak) day streak").font(.system(size: 10, weight: .semibold, design: .rounded))
      }
      Spacer(minLength: 2)
      HStack(spacing: 10) {
        ZStack {
          RoundedRectangle(cornerRadius: 15, style: .continuous).fill(accent).frame(width: 46, height: 46).rotationEffect(.degrees(-5))
          Text(entry.variant == "sleepy" ? "☾" : entry.variant == "sad" ? "·" : entry.variant == "celebration" ? "✹" : "✦")
            .font(.system(size: 24, weight: .heavy)).foregroundStyle(.white)
        }
        VStack(alignment: .leading, spacing: 4) {
          Text("\(entry.stateLabel) mode").font(.system(size: family == .systemSmall ? 15 : 17, weight: .bold, design: .rounded)).lineLimit(1)
          Text("Daily progress").font(.system(size: 10, weight: .medium, design: .rounded)).foregroundStyle(.secondary)
        }
        if family == .systemMedium {
          Spacer()
          Text("\(Int(entry.progress * 100))%").font(.system(size: 20, weight: .bold, design: .rounded)).foregroundStyle(accent)
        }
      }
      ProgressView(value: min(max(entry.progress, 0), 1)).tint(accent)
      Text("Last activity · \(activityLabel)").font(.system(size: 9, weight: .medium, design: .rounded)).foregroundStyle(.secondary).lineLimit(1)
    }
    .padding(16)
    .containerBackground(for: .widget) { Color.brandLabSurface }
  }
}

extension Color {
  /// Follows system dark mode; matches the app's light (#F7F7FC) and dark (#191C28) surfaces.
  static let brandLabSurface = Color(UIColor { traits in
    traits.userInterfaceStyle == .dark
      ? UIColor(red: 0.098, green: 0.110, blue: 0.157, alpha: 1)
      : UIColor(red: 0.969, green: 0.969, blue: 0.988, alpha: 1)
  })
}

struct BrandLabWidget: Widget {
  let kind = "BrandLabWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: BrandLabProvider()) { entry in
      BrandLabWidgetView(entry: entry)
    }
    .configurationDisplayName("BrandLab")
    .description("A live look at your BrandLab activity and branding state.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}

@main
struct BrandLabWidgetBundle: WidgetBundle {
  var body: some Widget { BrandLabWidget() }
}
