/**
 * @file SongDetailScreen.tsx
 * @description Màn hình chi tiết bài hát — hero thumbnail, metadata, actions, lyrics, related.
 * Thiết kế với ambient blur background và glassmorphism.
 * @module features/home
 */

import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft, Heart, Download, ListPlus, Share2, Play, Shuffle,
} from 'lucide-react-native';
import { COLORS } from '@shared/constants/colors';
import { FONT_SIZE, SPACING, RADIUS, SHADOWS } from '@shared/constants/spacing';
import { PlayButton } from '@shared/components/PlayButton';
import { TrackListItem } from '@shared/components/TrackListItem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COVER_SIZE = SCREEN_WIDTH * 0.65;

interface SongDetailScreenProps {
  songId: string;
}

// ─── Action Button ───────────────────────────────────────────────────────────

function ActionButton({ icon: Icon, label, color, onPress }: {
  icon: any;
  label: string;
  color?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.actionBtn} hitSlop={4}>
      <View style={styles.actionIconWrap}>
        <Icon size={20} color={color ?? COLORS.textSecondary} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SongDetailScreen({ songId }: SongDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Mock data — sẽ thay bằng API call useQuery
  const song = {
    id: songId,
    title: 'Chạy Ngay Đi',
    artist: 'Sơn Tùng M-TP',
    album: 'Sky Tour',
    year: 2018,
    coverUrl: 'https://picsum.photos/seed/song1/400/400',
    durationSeconds: 258,
    genre: 'V-Pop',
  };

  const relatedTracks = [
    { id: 'r1', title: 'Hãy Trao Cho Anh', artist: 'Sơn Tùng M-TP', coverUrl: 'https://picsum.photos/seed/r1/100/100', durationSeconds: 241, artistId: 'a1' },
    { id: 'r2', title: 'Muộn Rồi Mà Sao Còn', artist: 'Sơn Tùng M-TP', coverUrl: 'https://picsum.photos/seed/r2/100/100', durationSeconds: 312, artistId: 'a1' },
    { id: 'r3', title: 'Có Chắc Yêu Là Đây', artist: 'Sơn Tùng M-TP', coverUrl: 'https://picsum.photos/seed/r3/100/100', durationSeconds: 195, artistId: 'a1' },
    { id: 'r4', title: 'Nơi Này Có Anh', artist: 'Sơn Tùng M-TP', coverUrl: 'https://picsum.photos/seed/r4/100/100', durationSeconds: 280, artistId: 'a1' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section with ambient background */}
        <View style={styles.heroSection}>
          {/* Blurred background image */}
          <Image
            source={{ uri: song.coverUrl }}
            style={styles.heroBgImage}
            contentFit="cover"
            blurRadius={60}
          />
          <LinearGradient
            colors={['rgba(8,3,22,0.3)', 'rgba(8,3,22,0.7)', COLORS.background]}
            style={styles.heroGradient}
          />

          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            style={[styles.backBtn, { top: insets.top + SPACING.sm }]}
            hitSlop={12}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </Pressable>

          {/* Album cover */}
          <View style={[styles.coverContainer, { marginTop: insets.top + 60 }]}>
            <Image
              source={{ uri: song.coverUrl }}
              style={styles.coverImage}
              contentFit="cover"
              transition={300}
            />
          </View>
        </View>

        {/* Song Info */}
        <View style={styles.infoSection}>
          <Text style={styles.songTitle}>{song.title}</Text>
          <Pressable onPress={() => router.push(`/artist/a1` as any)}>
            <Text style={styles.songArtist}>{song.artist}</Text>
          </Pressable>
          <Text style={styles.songMeta}>
            {song.album} · {song.year} · {song.genre}
          </Text>
        </View>

        {/* Play buttons */}
        <View style={styles.playSection}>
          <Pressable style={styles.shuffleBtn}>
            <Shuffle size={18} color={COLORS.textPrimary} />
            <Text style={styles.shuffleBtnText}>Trộn bài</Text>
          </Pressable>
          <PlayButton size="lg" onPress={() => router.push(`/player/${songId}`)} />
        </View>

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          <ActionButton icon={Heart} label="Thích" onPress={() => {}} />
          <ActionButton icon={Download} label="Tải xuống" onPress={() => {}} />
          <ActionButton icon={ListPlus} label="Playlist" onPress={() => {}} />
          <ActionButton icon={Share2} label="Chia sẻ" onPress={() => {}} />
        </View>

        {/* Lyrics Preview */}
        <View style={styles.lyricsSection}>
          <Text style={styles.sectionTitle}>Lời bài hát</Text>
          <Pressable style={styles.lyricsCard}>
            <LinearGradient
              colors={['rgba(108,92,231,0.15)', 'rgba(176,38,255,0.08)']}
              style={styles.lyricsGradient}
            >
              <Text style={styles.lyricsPreview} numberOfLines={4}>
                {'Chạy ngay đi... chạy ngay đi...\nĐừng quay đầu lại, đừng nhìn vào mắt tôi\nChạy ngay đi... trốn khỏi tôi...\nTrước khi tôi kịp ôm em vào trong vòng tay'}
              </Text>
              <Text style={styles.lyricsMore}>Xem đầy đủ →</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Related tracks */}
        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>Bài hát liên quan</Text>
          {relatedTracks.map((track) => (
            <TrackListItem
              key={track.id}
              track={track}
              onPress={(t) => router.push(`/song/${t.id}` as any)}
              onMenuPress={() => {}}
            />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Hero
  heroSection: {
    height: COVER_SIZE + 160,
    position: 'relative',
  },
  heroBgImage: {
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
  coverContainer: {
    alignItems: 'center',
    ...SHADOWS.ambient,
  },
  coverImage: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: RADIUS.xl,
  },

  // Info
  infoSection: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING['2xl'],
  },
  songTitle: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  songArtist: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  songMeta: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },

  // Play Section
  playSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING['2xl'],
    marginTop: SPACING['2xl'],
    paddingHorizontal: SPACING.lg,
  },
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shuffleBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING['3xl'],
    marginTop: SPACING['2xl'],
  },
  actionBtn: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },

  // Lyrics
  lyricsSection: {
    marginTop: SPACING['3xl'],
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  lyricsCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  lyricsGradient: {
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
  },
  lyricsPreview: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textPrimary,
    lineHeight: 26,
    fontWeight: '500',
  },
  lyricsMore: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: SPACING.md,
  },

  // Related
  relatedSection: {
    marginTop: SPACING['3xl'],
    paddingHorizontal: SPACING.lg,
  },
});
