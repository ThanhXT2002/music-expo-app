/**
 * @file AlbumDetailScreen.tsx
 * @description Màn hình chi tiết album — hero ảnh bìa, track list, album info.
 * @module features/home
 */

import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Play, Shuffle, Heart, MoreHorizontal } from 'lucide-react-native';
import { COLORS } from '@shared/constants/colors';
import { FONT_SIZE, SPACING, RADIUS, SHADOWS } from '@shared/constants/spacing';
import { PlayButton } from '@shared/components/PlayButton';
import { TrackListItem } from '@shared/components/TrackListItem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COVER_SIZE = SCREEN_WIDTH * 0.55;

interface AlbumDetailScreenProps {
  albumId: string;
}

export default function AlbumDetailScreen({ albumId }: AlbumDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Mock data
  const album = {
    id: albumId,
    title: 'Sky Tour',
    artist: 'Sơn Tùng M-TP',
    artistId: 'a1',
    year: 2020,
    coverUrl: 'https://picsum.photos/seed/album1/400/400',
    trackCount: 8,
    totalDuration: '32 phút',
  };

  const tracks = Array.from({ length: 8 }, (_, i) => ({
    id: `at${i + 1}`,
    title: `Bài hát ${i + 1} — ${album.title}`,
    artist: album.artist,
    artistId: album.artistId,
    coverUrl: album.coverUrl,
    durationSeconds: 180 + Math.floor(Math.random() * 120),
  }));

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Image source={{ uri: album.coverUrl }} style={styles.heroBg} contentFit="cover" blurRadius={50} />
          <LinearGradient
            colors={['rgba(8,3,22,0.2)', 'rgba(8,3,22,0.75)', COLORS.background]}
            style={styles.heroGradient}
          />

          <Pressable
            onPress={() => router.back()}
            style={[styles.backBtn, { top: insets.top + SPACING.sm }]}
            hitSlop={12}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </Pressable>

          <View style={[styles.coverWrap, { marginTop: insets.top + 56 }]}>
            <Image source={{ uri: album.coverUrl }} style={styles.coverImage} contentFit="cover" transition={300} />
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.albumTitle}>{album.title}</Text>
          <Pressable onPress={() => router.push(`/artist/${album.artistId}` as any)}>
            <Text style={styles.albumArtist}>{album.artist}</Text>
          </Pressable>
          <Text style={styles.albumMeta}>
            {album.year} · {album.trackCount} bài · {album.totalDuration}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <View style={styles.controlsLeft}>
            <Pressable style={styles.iconBtn} hitSlop={8}>
              <Heart size={22} color={COLORS.textSecondary} />
            </Pressable>
            <Pressable style={styles.iconBtn} hitSlop={8}>
              <MoreHorizontal size={22} color={COLORS.textSecondary} />
            </Pressable>
          </View>
          <View style={styles.controlsRight}>
            <Pressable style={styles.shuffleBtn}>
              <Shuffle size={18} color={COLORS.textPrimary} />
            </Pressable>
            <PlayButton size="lg" onPress={() => {}} />
          </View>
        </View>

        {/* Track list */}
        <View style={styles.trackList}>
          {tracks.map((track, idx) => (
            <TrackListItem
              key={track.id}
              track={track}
              index={idx + 1}
              showCover={false}
              onPress={(t) => router.push(`/player/${t.id}`)}
              onMenuPress={() => {}}
            />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroSection: {
    height: COVER_SIZE + 140,
    position: 'relative',
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backBtn: {
    position: 'absolute',
    left: SPACING.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverWrap: {
    alignItems: 'center',
    ...SHADOWS.ambient,
  },
  coverImage: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: RADIUS.lg,
  },
  infoSection: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING['2xl'],
  },
  albumTitle: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  albumArtist: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  albumMeta: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING['2xl'],
  },
  controlsLeft: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  controlsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shuffleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  trackList: {
    marginTop: SPACING['2xl'],
  },
});
