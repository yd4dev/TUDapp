import { RSSFeed } from '@/components/RSSFeed'
import { useFocusEffect, useNavigation } from 'expo-router'
import { useLanguage } from '../../constants/LanguageContext'

export default function HomeScreen () {
  const { strings } = useLanguage()
  const navigation = useNavigation()

  useFocusEffect(() => {
    navigation.getParent()?.setOptions({
      title: strings.feed
    })
  })
  return <RSSFeed />
}
