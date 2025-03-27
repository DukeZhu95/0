import React, { useEffect, useState } from "react";
import { FlatList, View, Text } from "react-native";


interface Notification {
  id: number;
  user_id: number;
  type: string;
  reference: number;
  is_read: boolean;
  created_at: string;
}

const notificationTypeInfo = [
  {
    type: "like",
    title: "New like",
    message: "Someone has liked your video",
  },
  {
    type: "follower",
    title: "New follower",
    message: "You have gained a new follower",
  },
];

export default function NotificationDisplay() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      user_id: 1,
      type: "like",
      reference: 1,
      is_read: false,
      created_at: "2024-12-21 07:02:15.302858+00",
    },
    {
      id: 2,
      user_id: 2,
      type: "follower",
      reference: 2,
      is_read: true,
      created_at: "2024-12-28 07:24:14.455448+00",
    },
    {
      id: 3,
      user_id: 3,
      type: "like",
      reference: 3,
      is_read: false,
      created_at: "2024-12-25 07:02:15.302858+00",
    },
    {
      id: 4,
      user_id: 4,
      type: "follower",
      reference: 4,
      is_read: true,
      created_at: "2024-12-20 07:24:14.455448+00",
    },
    {
      id: 5,
      user_id: 5,
      type: "like",
      reference: 5,
      is_read: true,
      created_at: "2024-12-23 07:02:15.302858+00",
    },
    {
      id: 6,
      user_id: 6,
      type: "follower",
      reference: 6,
      is_read: true,
      created_at: "2024-12-29 07:24:14.455448+00",
    },
  ]);

  const renderItem = ({ item }: { item: Notification }) => {
    const typeIndex = notificationTypeInfo.findIndex(
      (type) => type.type == item.type
    );
    return (
      <View
        className="h-20 border-2 border-black-100 rounded-md p-2 mb-6"
        style={
          item.is_read
            ? { backgroundColor: "#9D9D9D" }
            : { backgroundColor: "white" }
        }
      >
        <Text className="text-xl">{notificationTypeInfo[typeIndex].title}</Text>
        <Text className="text-lg">
          {notificationTypeInfo[typeIndex].message}
        </Text>
      </View>
    );
  };
  return (
    <View>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text className="text-xl text-[#9D9D9D]">No new notifications</Text>
        }
      />
    </View>
  );
}
