// faces.swift — for each image path, print "<faces> <largest face height 0–1> <path>" using macOS Vision.
// session.mjs compiles it once (swiftc -O) into tools/.bin/faces and uses it to tell a camera take
// (a big face in most frames) from a screen recording (none, or a small one in a corner).
import Foundation
import Vision

for path in CommandLine.arguments.dropFirst() {
    let request = VNDetectFaceRectanglesRequest()
    let handler = VNImageRequestHandler(url: URL(fileURLWithPath: path), options: [:])
    try? handler.perform([request])
    let faces = request.results ?? []
    let tallest = faces.map { $0.boundingBox.height }.max() ?? 0
    print("\(faces.count) \(String(format: "%.3f", tallest)) \(path)")
}
