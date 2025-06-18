import { RSSFeed } from '@/components/RSSFeed'
import { useFocusEffect, useNavigation } from 'expo-router'

export default function HomeScreen () {
  const navigation = useNavigation()

  useFocusEffect(() => {
    navigation.getParent()?.setOptions({
      title: 'Feed'
    })
  })
  return <RSSFeed />
}
