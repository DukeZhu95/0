import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { View } from "react-native";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-lg web:transition-shadow web:hover:shadow-md web:focus-within:shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-background ",
        shadow: "bg-background  web:shadow-md",
        outlined: "bg-transparent ",
        elevated: "bg-card-elevated  web:shadow-lg",
      },
      padding: {
        none: "p-0",
        sm: "p-2",
        md: "p-4",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  },
);

type CardProps = React.ComponentPropsWithoutRef<typeof View> &
  VariantProps<typeof cardVariants>;

const Card = React.forwardRef<React.ElementRef<typeof View>, CardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <View
        className={cn(cardVariants({ variant, padding, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";

export { Card, cardVariants };
export type { CardProps };