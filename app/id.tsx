import { StudentID } from '@/components/StudentID'
import { Stack } from 'expo-router'
import { View } from 'react-native'

export default function ID () {
  return (
    <View>
      <Stack.Screen
        options={{
          title: 'Ausweis',
        }}
      />
      <StudentID />
    </View>
  )
}
