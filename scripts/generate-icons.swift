import AppKit
import CoreGraphics
import Foundation

struct IconSpec {
  let name: String
  let color: NSColor
  let kind: String
}

let specs = [
  IconSpec(name: "default", color: NSColor(calibratedRed: 0.455, green: 0.400, blue: 0.910, alpha: 1), kind: "orbit"),
  IconSpec(name: "happy", color: NSColor(calibratedRed: 0.957, green: 0.651, blue: 0.255, alpha: 1), kind: "sun"),
  IconSpec(name: "sleepy", color: NSColor(calibratedRed: 0.424, green: 0.537, blue: 0.722, alpha: 1), kind: "moon"),
  IconSpec(name: "sad", color: NSColor(calibratedRed: 0.388, green: 0.451, blue: 0.525, alpha: 1), kind: "drop"),
  IconSpec(name: "celebration", color: NSColor(calibratedRed: 0.914, green: 0.408, blue: 0.333, alpha: 1), kind: "sparkles"),
]

let size = 1024
let output = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
let densitySizes = ["mipmap-mdpi": 48, "mipmap-hdpi": 72, "mipmap-xhdpi": 96, "mipmap-xxhdpi": 144, "mipmap-xxxhdpi": 192]

func pathForStar(cx: CGFloat, cy: CGFloat, outer: CGFloat, inner: CGFloat, points: Int = 4, rotation: CGFloat = -.pi / 2) -> NSBezierPath {
  let path = NSBezierPath()
  for i in 0..<(points * 2) {
    let radius = i.isMultiple(of: 2) ? outer : inner
    let angle = rotation + CGFloat(i) * .pi / CGFloat(points)
    let point = NSPoint(x: cx + cos(angle) * radius, y: cy + sin(angle) * radius)
    if i == 0 { path.move(to: point) } else { path.line(to: point) }
  }
  path.close()
  return path
}

for spec in specs {
  let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
  guard let context = NSGraphicsContext.current?.cgContext else { fatalError("Missing drawing context") }
  context.setAllowsAntialiasing(true)
  context.setShouldAntialias(true)

  spec.color.setFill()
  NSBezierPath(rect: NSRect(x: 0, y: 0, width: size, height: size)).fill()

  let cream = NSColor(calibratedRed: 1, green: 0.969, blue: 0.894, alpha: 1)
  let center = CGPoint(x: 512, y: 512)
  let plate = NSBezierPath(ovalIn: NSRect(x: 194, y: 194, width: 636, height: 636))
  cream.withAlphaComponent(0.16).setFill()
  plate.fill()

  switch spec.kind {
  case "orbit":
    let ring = NSBezierPath(ovalIn: NSRect(x: 274, y: 274, width: 476, height: 476))
    ring.lineWidth = 30
    cream.setStroke()
    ring.stroke()
    cream.setFill()
    NSBezierPath(ovalIn: NSRect(x: 466, y: 466, width: 92, height: 92)).fill()
    pathForStar(cx: 704, cy: 687, outer: 92, inner: 34).fill()
  case "sun":
    for index in 0..<8 {
      let angle = CGFloat(index) * .pi / 4
      let ray = pathForStar(cx: center.x + cos(angle) * 210, cy: center.y + sin(angle) * 210, outer: 62, inner: 26, points: 4, rotation: angle)
      cream.setFill()
      ray.fill()
    }
    cream.setFill()
    NSBezierPath(ovalIn: NSRect(x: 364, y: 364, width: 296, height: 296)).fill()
    spec.color.setFill()
    NSBezierPath(ovalIn: NSRect(x: 431, y: 475, width: 32, height: 48)).fill()
    NSBezierPath(ovalIn: NSRect(x: 561, y: 475, width: 32, height: 48)).fill()
    let smile = NSBezierPath()
    smile.lineWidth = 24
    smile.lineCapStyle = .round
    smile.move(to: NSPoint(x: 445, y: 435))
    smile.curve(to: NSPoint(x: 579, y: 435), controlPoint1: NSPoint(x: 478, y: 368), controlPoint2: NSPoint(x: 546, y: 368))
    spec.color.setStroke()
    smile.stroke()
  case "moon":
    cream.setFill()
    NSBezierPath(ovalIn: NSRect(x: 334, y: 316, width: 360, height: 360)).fill()
    spec.color.setFill()
    NSBezierPath(ovalIn: NSRect(x: 454, y: 374, width: 330, height: 330)).fill()
    pathForStar(cx: 360, cy: 675, outer: 60, inner: 24).fill()
    pathForStar(cx: 705, cy: 362, outer: 43, inner: 17).fill()
  case "drop":
    let drop = NSBezierPath()
    drop.move(to: NSPoint(x: 512, y: 735))
    drop.curve(to: NSPoint(x: 698, y: 484), controlPoint1: NSPoint(x: 653, y: 662), controlPoint2: NSPoint(x: 698, y: 583))
    drop.curve(to: NSPoint(x: 512, y: 293), controlPoint1: NSPoint(x: 698, y: 365), controlPoint2: NSPoint(x: 615, y: 293))
    drop.curve(to: NSPoint(x: 326, y: 484), controlPoint1: NSPoint(x: 409, y: 293), controlPoint2: NSPoint(x: 326, y: 365))
    drop.curve(to: NSPoint(x: 512, y: 735), controlPoint1: NSPoint(x: 326, y: 583), controlPoint2: NSPoint(x: 371, y: 662))
    drop.close()
    cream.setFill()
    drop.fill()
    spec.color.withAlphaComponent(0.65).setFill()
    NSBezierPath(ovalIn: NSRect(x: 466, y: 425, width: 92, height: 92)).fill()
  case "sparkles":
    cream.setFill()
    pathForStar(cx: 512, cy: 512, outer: 244, inner: 105, points: 8).fill()
    spec.color.setFill()
    NSBezierPath(ovalIn: NSRect(x: 457, y: 457, width: 110, height: 110)).fill()
    cream.setFill()
    pathForStar(cx: 743, cy: 728, outer: 67, inner: 27).fill()
    pathForStar(cx: 284, cy: 352, outer: 56, inner: 23).fill()
  default: break
  }

  NSGraphicsContext.restoreGraphicsState()
  let data = rep.representation(using: .png, properties: [:])!
  try data.write(to: output.appendingPathComponent("\(spec.name).png"))

  guard let sourceImage = NSImage(contentsOf: output.appendingPathComponent("\(spec.name).png")) else { fatalError("Unable to open generated icon") }
  for (folder, pixels) in densitySizes {
    let folderURL = output.appendingPathComponent("android/\(folder)", isDirectory: true)
    try FileManager.default.createDirectory(at: folderURL, withIntermediateDirectories: true)
    let resized = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: pixels, pixelsHigh: pixels, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: resized)
    sourceImage.draw(in: NSRect(x: 0, y: 0, width: pixels, height: pixels), from: .zero, operation: .copy, fraction: 1)
    NSGraphicsContext.restoreGraphicsState()
    try resized.representation(using: .png, properties: [:])!.write(to: folderURL.appendingPathComponent("brandlab_\(spec.name).png"))
  }
}
