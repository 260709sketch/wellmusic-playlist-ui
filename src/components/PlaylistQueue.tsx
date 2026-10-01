import { unknownTrackImageUri } from '@/constants/images'
import SFSymbol from '@/components/SFSymbol'
import myTrackPlayer, { MusicRepeatMode } from '@/helpers/trackPlayerIndex'
import { setPlayList, getPlayList } from '@/store/playList'
import { FlashList } from '@shopify/flash-list'
import React, { useCallback, useMemo } from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'

export type PlaylistQueueProps = {
  playList: any[] | null
  currentMusic: any
  repeatMode: MusicRepeatMode
  onPlaySong?: (song: any) => void
}

export const PlaylistQueue = React.memo(({ playList, currentMusic, repeatMode, onPlaySong }: PlaylistQueueProps) => {
  const handleReorderSong = useCallback((song: any, action: 'top' | 'up' | 'down' | 'bottom') => {
    const list = getPlayList()
    const index = list.findIndex((s: any) => s.id === song.id && s.platform === song.platform)
    if (index === -1) return
    const newList = [...list]
    const [item] = newList.splice(index, 1)
    switch (action) {
      case 'top': newList.unshift(item); break
      case 'up': index > 0 ? newList.splice(index - 1, 0, item) : newList.unshift(item); break
      case 'down': index < newList.length ? newList.splice(index + 1, 0, item) : newList.push(item); break
      case 'bottom': newList.push(item); break
    }
    setPlayList(newList)
  }, [])

  const handleLongPressReorder = useCallback((song: any) => {
    Alert.alert('调整播放顺序', '', [
      { text: '置顶', onPress: () => handleReorderSong(song, 'top') },
      { text: '上移', onPress: () => handleReorderSong(song, 'up') },
      { text: '下移', onPress: () => handleReorderSong(song, 'down') },
      { text: '置底', onPress: () => handleReorderSong(song, 'bottom') },
      { text: '取消', style: 'cancel' },
    ])
  }, [handleReorderSong])

  const renderItem = useCallback(({ item: song }: any) => (
    <TouchableOpacity
      activeOpacity={0.82}
      style={[
        styles.queueItem,
        currentMusic?.id === song.id && styles.queueItemActive,
      ]}
      onPress={() => {
        if (onPlaySong) onPlaySong(song)
        else myTrackPlayer.play(song, true)
      }}
    >
      <FastImage
        source={{ uri: song.artwork ?? unknownTrackImageUri, cache: 'immutable' }}
        style={styles.queueItemArtwork}
        resizeMode="cover"
      />
      <View style={styles.queueItemInfo}>
        <Text
          style={[
            styles.queueItemTitle,
            currentMusic?.id === song.id && styles.queueItemTitleActive,
          ]}
          numberOfLines={1}
        >
          {song.title}
        </Text>
        <Text style={styles.queueItemArtist} numberOfLines={1}>
          {song.artist}
          {song.platform ? ` · ${song.platform}` : ''}
        </Text>
      </View>
      {currentMusic?.id === song.id && (
        <SFSymbol systemName="speaker.wave.3" size={19} color="rgba(255,255,255,0.8)" />
      )}
      <TouchableOpacity
        onPress={(event) => { event.stopPropagation(); myTrackPlayer.remove(song) }}
        style={styles.queueTrailingButton}
      >
        <SFSymbol systemName="trash" size={25} color="rgba(255,255,255,0.68)" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={(event) => event.stopPropagation()}
        onLongPress={(event) => { event.stopPropagation(); handleLongPressReorder(song) }}
        style={styles.queueTrailingButton}
      >
        <SFSymbol systemName="line.3.horizontal" size={24} color="rgba(255,255,255,0.68)" />
      </TouchableOpacity>
    </TouchableOpacity>
  ), [currentMusic, onPlaySong, handleLongPressReorder])

  const keyExtractor = useCallback((item: any) => item.id + '_' + (item.platform || ''), [])

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.queueTitleRow}>
        <Text style={styles.queueScreenTitle}>
          播放队列 · {playList?.length || 0}
        </Text>
      </View>

      <View style={styles.queueModeSegment}>
        <TouchableOpacity
          style={[styles.queueModeItem, repeatMode === MusicRepeatMode.QUEUE && styles.queueModeItemActive]}
          onPress={() => myTrackPlayer.setRepeatMode(MusicRepeatMode.QUEUE)}
        >
          <SFSymbol systemName="repeat" size={19} color={repeatMode === MusicRepeatMode.QUEUE ? '#ffffff' : 'rgba(255,255,255,0.7)'} />
          <Text style={styles.queueModeText}>顺序</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.queueModeItem, repeatMode === MusicRepeatMode.SHUFFLE && styles.queueModeItemActive]}
          onPress={() => myTrackPlayer.setRepeatMode(MusicRepeatMode.SHUFFLE)}
        >
          <SFSymbol systemName="shuffle" size={20} color={repeatMode === MusicRepeatMode.SHUFFLE ? '#ffffff' : 'rgba(255,255,255,0.7)'} />
          <Text style={styles.queueModeText}>随机</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.queueModeItem, repeatMode === MusicRepeatMode.SINGLE && styles.queueModeItemActive]}
          onPress={() => myTrackPlayer.setRepeatMode(MusicRepeatMode.SINGLE)}
        >
          <SFSymbol systemName="repeat.1" size={19} color={repeatMode === MusicRepeatMode.SINGLE ? '#ffffff' : 'rgba(255,255,255,0.7)'} />
          <Text style={styles.queueModeText}>单曲</Text>
        </TouchableOpacity>
      </View>

      <FlashList
        style={styles.queueList}
        contentContainerStyle={styles.queueListContent}
        showsVerticalScrollIndicator={false}
        data={playList || []}
        keyExtractor={keyExtractor}
        initialNumToRender={10}
        maxToRenderPerBatch={4}
        windowSize={3}
        removeClippedSubviews={true}
        getItemLayout={(_, index) => ({ length: 80, offset: 80 * index, index })}
        onScrollToIndexFailed={() => {}}
        ListEmptyComponent={<Text style={styles.queueEmpty}>队列为空</Text>}
        renderItem={renderItem}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  queueTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  queueScreenTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#fff',
    letterSpacing: -0.25,
  },
  queueModeSegment: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.055)',
    marginBottom: 16,
  },
  queueModeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.10)',
  },
  queueModeItemActive: {
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
  queueModeText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.78)',
  },
  queueList: {
    flex: 1,
  },
  queueListContent: {
    paddingBottom: 210,
    gap: 10,
  },
  queueEmpty: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 60,
    fontSize: 15,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 4,
    paddingVertical: 10,
    gap: 10,
  },
  queueItemActive: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  queueItemArtwork: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  queueItemInfo: {
    flex: 1,
    flexShrink: 3,
    alignItems: 'flex-start',
  },
  queueItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 3,
  },
  queueItemTitleActive: {
    color: '#fff',
  },
  queueItemArtist: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
  },
  queueTrailingButton: {
    width: 30,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
