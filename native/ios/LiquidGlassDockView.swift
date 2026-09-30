import SwiftUI
import UIKit

// MARK: - 液态玻璃背景（纯SwiftUI，iOS26用glassEffect，低版本用material）
struct LiquidGlassBackground: View {
    var body: some View {
        if #available(iOS 26.0, *) {
            Rectangle()
                .glassEffect(.regular, in: Rectangle())
        } else {
            Rectangle()
                .fill(.ultraThinMaterial)
        }
    }
}

// MARK: - 通用 SwiftUI 宿主容器（以后所有 SwiftUI 组件都通过这个渲染）
struct SwiftUIContentView<Content: View>: View {
    let content: () -> Content

    var body: some View {
        ZStack {
            LiquidGlassBackground()
            content()
        }
    }
}

// MARK: - React Native 原生视图
@objc(LiquidGlassDockView)
class LiquidGlassDockView: UIView {
    private var hostingController: UIHostingController<AnyView>?

    override init(frame: CGRect) {
        super.init(frame: frame)
        setupHosting()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupHosting()
    }

    private func setupHosting() {
        backgroundColor = .clear
        isOpaque = false

        // 用 UIHostingController 包装 SwiftUI 视图
        let rootView = SwiftUIContentView {
            Color.clear
        }
        let host = UIHostingController(rootView: AnyView(rootView))
        host.view.backgroundColor = .clear
        host.view.frame = bounds
        host.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        addSubview(host.view)
        hostingController = host
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        hostingController?.view.frame = bounds
    }

    // React Native 子视图放在 SwiftUI 宿主上面
    override func addSubview(_ view: UIView) {
        super.addSubview(view)
        if let hostView = hostingController?.view {
            sendSubviewToBack(hostView)
        }
    }

    override func insertSubview(_ view: UIView, at index: Int) {
        super.insertSubview(view, at: index)
        if let hostView = hostingController?.view {
            sendSubviewToBack(hostView)
        }
    }
}
