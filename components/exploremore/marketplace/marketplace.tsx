import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { SafeAreaView } from '@/components/safe-area-view'
import { useTranslation } from 'react-i18next'
import { useCoins } from '@/hooks/useCoins'
import { useMarketplaceItems } from '@/hooks/useMarketplaceItems'
import Entypo from '@expo/vector-icons/Entypo'
import { supabase } from '@/config/supabase'

export default function Marketplace() {
  const { t } = useTranslation()
  const { coins, updateCoins } = useCoins()

  // State to hold the current user's ID
  const [userId, setUserId] = useState<string | null>(null)

  // Fetch the current user from Supabase Auth on mount
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error) {
        console.error('Error fetching user:', error)
      } else if (user) {
        setUserId(user.id)
        console.log('User ID:', user.id)
      }
    }
    getUser()
  }, [])

  // Get marketplace items for fonts and themes
  const {
    items: fontItems,
    loading: loadingFont,
    error: errorFont,
  } = useMarketplaceItems('font')
  const {
    items: themeItems,
    loading: loadingTheme,
    error: errorTheme,
  } = useMarketplaceItems('theme')

  // State to track which items the user has unlocked
  const [unlockedItems, setUnlockedItems] = useState<Set<string>>(new Set())

  // Fetch the unlocked items for the current user from the join table
  useEffect(() => {
    if (!userId) return
    const fetchUnlockedItems = async () => {
      const { data, error } = await supabase
        .from('user_unlocked_items')
        .select('item_id')
        .eq('user_id', userId)

      if (error) {
        console.error('Error fetching unlocked items:', error)
      } else if (data) {
        const unlockedSet = new Set(data.map((d: any) => d.item_id))
        setUnlockedItems(unlockedSet)
      }
    }
    fetchUnlockedItems()
  }, [userId])

  // Function to unlock an item when pressed
  const handleUnlock = async (item: any) => {
    if (!userId) {
      Alert.alert('Error', 'User not logged in')
      return
    }
    // Check if the item is already unlocked
    if (unlockedItems.has(item.id)) {
      Alert.alert('Already Unlocked', 'This item is already unlocked.')
      return
    }
    // Check if the user has enough coins to cover the item's price
    if (coins === null || coins < item.price) {
      Alert.alert(
        'Insufficient Coins',
        'You do not have enough coins to unlock this item.',
      )
      return
    }

    // Insert the unlock record into the join table
    const { error } = await supabase.from('user_unlocked_items').insert([
      {
        user_id: userId,
        item_id: item.id,
      },
    ])

    if (error) {
      console.error('Error unlocking item:', error)
      Alert.alert('Error', 'Failed to unlock item. Please try again.')
    } else {
      // Deduct the item price from the user's coins
      updateCoins(coins - item.price)
      Alert.alert('Success', `${item.name} unlocked!`)
      // Update local state to reflect the unlocked item
      setUnlockedItems(new Set(unlockedItems).add(item.id))
    }
  }

  // Render each marketplace item as a tappable element
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleUnlock(item)}>
      <View className="p-3 border-b border-gray-300 flex-row items-center">
        <View className="flex-1">
          <Text className="text-lg font-bold">
            {item.name} {item.description}
          </Text>
          <Text className="text-lg text-gray-600">{item.price} coins</Text>
        </View>
        {unlockedItems.has(item.id) ? (
          <Entypo name="check" size={20} color="green" />
        ) : (
          <Entypo name="lock" size={20} color="black" />
        )}
      </View>
    </TouchableOpacity>
  )

  // While fetching user data, show a loading indicator or fallback UI
  if (!userId) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading user...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="text-center w-screen h-screen">
      <View className="p-4 flex-row h-auto">
        <Text className="text-xl">{t('profile.info.coins')}</Text>
        <Text className="text-xl pl-4">{coins}</Text>
      </View>
      <View className="flex-1 p-4 bg-secondary">
        {/* Theme Items */}
        <Text className="text-xl font-bold mt-6 mb-2">Theme Items</Text>
        {loadingTheme ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : null}
        {errorTheme ? <Text className="text-red-500">{errorTheme}</Text> : null}
        <FlatList
          data={themeItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          className="flex-1 bg-slate-500"
        />
        {/* Font Items */}
        <Text className="text-xl font-bold mb-2">Font Items</Text>
        {loadingFont ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : null}
        {errorFont ? <Text className="text-red-500">{errorFont}</Text> : null}
        <FlatList
          data={fontItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          className="flex-1 bg-slate-500 pb-20"
        />
      </View>
    </SafeAreaView>
  )
}