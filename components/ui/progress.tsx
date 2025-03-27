// Progress.tsx
import React from "react";
import { View } from "react-native";

interface ProgressProps {
  value: number;
  className?: string;
}

export const Progress = React.forwardRef<View, ProgressProps>(
  ({ value, className }, ref) => {
    return (
      <View
        ref={ref}
        className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
      >
        <View
          className={`h-full ${className}`}
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </View>
    );
  },
);
