import React from 'react'
import { Platform } from 'react-native'
import { KumoneGlassTabBar } from '@/components/KumoneGlassTabBar'
import { FloatingPillDock } from '@/components/FloatingPillDock'

/**
 * 自适应底部栏
 * - iOS 26 以上：液态玻璃效果（KumoneGlassTabBar）
 * - iOS 26 以下：悬浮胶囊（FloatingPillDock）
 */
export const AutoAdaptiveDock = () => {
	const iosVersion = parseFloat(Platform.Version as string)

	// iOS 26 以上使用液态玻璃，以下使用悬浮胶囊
	if (iosVersion >= 26) {
		return <KumoneGlassTabBar isLiquidGlass={true} />
	}

	return <FloatingPillDock />
}
