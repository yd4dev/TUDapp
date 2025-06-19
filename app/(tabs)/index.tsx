import { RSSFeed } from '@/components/RSSFeed'
import { useFocusEffect, useNavigation } from 'expo-router'
import { t } from '../../constants/i18n'

export default function HomeScreen () {
  const navigation = useNavigation()

  useFocusEffect(() => {
    navigation.getParent()?.setOptions({
      title: t.feed
    })
  })
  return <RSSFeed />
}
