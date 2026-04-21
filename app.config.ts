import { ExpoConfig, ConfigContext } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: config.name || 'music-expo-app',
    slug: config.slug || 'music-expo-app',
    plugins: [
      ...(config.plugins || []),
      [
        'react-native-fbsdk-next',
        {
          appID: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID,
          clientToken: process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN,
          displayName: 'Music App',
          scheme: `fb${process.env.EXPO_PUBLIC_FACEBOOK_APP_ID}`
        }
      ]
    ]
  }
}
