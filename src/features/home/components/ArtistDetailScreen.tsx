/**
 * @file ArtistDetailScreen.tsx
 * @description Trang hồ sơ nghệ sĩ — hero banner, popular songs, albums, bio.
 * @module features/home
 */

import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, UserPlus, Play } from 'lucide-react-native';
import { COLORS } from '@shared/constants/colors';
import { FONT_SIZE, SPACING, RADIUS, SHADOWS } from '@shared/constants/spacing';
import { PlayButton } from '@shared/components/PlayButton';
import { SectionHeader } from '@shared/components/SectionHeader';
import { TrackListItem } from '@shared/components/TrackListItem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ArtistDetailScreenProps {
  artistId: string;
}

export default function ArtistDetailScreen({ artistId }: ArtistDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Mock data
  const artist = {
    id: artistId,
    name: 'Sơn Tùng M-TP',
    avatarUrl: 'https://picsum.photos/seed/artist1/600/400',
    followers: 12500000,
    bio: 'Sơn Tùng M-TP là ca sĩ, nhạc sĩ, rapper và diễn viên người Việt Nam. Anh được biết đến với các bản hit như "Chạy Ngay Đi", "Hãy Trao Cho Anh", "Muộn Rồi Mà Sao Còn"...',
    genres: ['V-Pop', 'Pop', 'Hip-Hop'],
  };

  const popularTracks = Array.from({ length: 5 }, (_, i) => ({
    id: `pt${i}`,
    title: ['Chạy Ngay Đi', 'Hãy Trao Cho Anh', 'Muộn Rồi Mà Sao Còn', 'Nơi Này Có Anh', 'Lạc Trôi'][i],
    artist: artist.name,
    artistId: artist.id,
    coverUrl: `https://picsum.photos/seed/pt${i}/100/100`,
    durationSeconds: 200 + i * 30,
  }));

  const albums = [
    { id: 'al1', title: 'Sky Tour', coverUrl: 'https://picsum.photos/seed/al1/200/200', year: 2020 },
    { id: 'al2', title: 'm-tp M-TP', coverUrl: 'https://picsum.photos/seed/al2/200/200', year: 2017 },
    { id: 'al3', title: 'Singles', coverUrl: 'https://picsum.photos/seed/al3/200/200', year: 2023 },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Image source={{ uri: artist.avatarUrl }} style={styles.heroBg} contentFit="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(8,3,22,0.6)', COLORS.background]}
            style={styles.heroOverlay}
          />

          <Pressable
            onPress={() => router.back()}
            style={[styles.backBtn, { top: insets.top + SPACING.sm }]}
            hitSlop={12}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </Pressable>

          {/* Artist info overlay */}
          <View style={styles.heroInfo}>
            <Text style={styles.artistName}>{artist.name}</Text>
            <Text style={styles.artistFollowers}>
              {(artist.followers / 1_000_000).toFixed(1)}M người theo dõi
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <Pressable style={styles.followBtn}>
            <UserPlus size={16} color={COLORS.primary} />
            <Text style={styles.followBtnText}>Theo dõi</Text>
          </Pressable>
          <PlayButton size="lg" onPress={() => {}} />
        </View>

        {/* Popular Songs */}
        <View style={styles.section}>
          <SectionHeader title="Bài hát nổi bật" />
          {popularTracks.map((track, idx) => (
            <TrackListItem
              key={track.id}
              track={track}
              index={idx + 1}
              showCover
              onPress={(t) => router.push(`/player/${t.id}`)}
              onMenuPress={() => {}}
            />
          ))}
        </View>

        {/* Albums */}
        <View style={styles.section}>
          <SectionHeader title="Album & Single" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.albumsScroll}
          >
            {albums.map((album) => (
              <Pressable
                key={album.id}
                onPress={() => router.push(`/album/${album.id}` as any)}
                style={({ pressed }) => [styles.albumCard, pressed && { opacity: 0.8 }]}
              >
                <Image
                  source={{ uri: album.coverUrl }}
                  style={styles.albumImage}
                  contentFit="cover"
                  transition={200}
                />
                <Text style={styles.albumTitle} numberOfLines={1}>{album.title}</Text>
                <Text style={styles.albumYear}>{album.year}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <SectionHeader title="Giới thiệu" />
          <View style={styles.bioCard}>
            <Text style={styles.bioText}>{artist.bio}</Text>
            <View style={styles.genreTags}>
              {artist.genres.map((genre) => (
                <View key={genre} style={styles.genreTag}>
                  <Text style={styles.genreTagText}>{genre}</Text>
                </View>
              ))}
            </View>
          </View>
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

  // Hero
  heroBanner: {
    height: 320,
    position: 'relative',
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
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
  heroInfo: {
    position: 'absolute',
    bottom: SPACING['2xl'],
    left: SPACING.lg,
    right: SPACING.lg,
  },
  artistName: {
    fontSize: FONT_SIZE['4xl'],
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  artistFollowers: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.7)',
    marginTop: SPACING.xs,
  },

  // Controls
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  followBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Sections
  section: {
    marginTop: SPACING['2xl'],
  },

  // Albums
  albumsScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  albumCard: {
    width: 140,
  },
  albumImage: {
    width: 140,
    height: 140,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  albumTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  albumYear: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Bio
  bioCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bioText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  genreTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  genreTag: {
    backgroundColor: 'rgba(176,38,255,0.12)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  genreTagText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
