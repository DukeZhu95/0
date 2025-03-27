import { View, Text } from 'react-native'
import React from 'react'
import Contests from '@/components/exploremore/contests/contests'
import { colors } from '@/constants/colours'
import { useTheme } from '@/context/theme-context';

export default function ContestList() {
  const { colorScheme } = useTheme();
  return (
    <View style={{backgroundColor:colors[colorScheme]?.background }}>
      <Contests />
    </View>
  )
}