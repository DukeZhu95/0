import React, { useEffect, useState } from "react";
import { View, ScrollView, Alert, ActivityIndicator } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { router } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { useSupabase } from "@/context/supabase-provider";
import { supabase } from "@/config/supabase";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";

const profileSchema = z.object({
  first_name: z.string().min(2, "First name is too short"),
  last_name: z.string().min(2, "Last name is too short"),
  phone_number: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number")
    .optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function EditProfile() {
  const { user } = useSupabase();
  const [loading, setLoading] = useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone_number: "",
      bio: "",
      location: "",
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      form.reset({
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
        bio: data.bio,
        location: data.location,
      });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      if (!user?.id) return;

      const { error } = await supabase
        .from("users")
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          phone_number: values.phone_number,
          bio: values.bio,
          location: values.location,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView className="flex-1 px-4">
        <View className="flex-row justify-between items-center py-4">
          <Text className="text-2xl font-bold">Edit Profile</Text>
          <Button variant="ghost" onPress={() => router.back()}>
            <Text>Cancel</Text>
          </Button>
        </View>

        <Form {...form}>
          <View className="space-y-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormInput
                  label="First Name"
                  placeholder="Enter your first name"
                  {...field}
                />
              )}
            />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormInput
                  label="Last Name"
                  placeholder="Enter your last name"
                  {...field}
                />
              )}
            />

            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormInput
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  {...field}
                />
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormInput
                  label="Bio"
                  placeholder="Tell us about yourself"
                  multiline
                  numberOfLines={4}
                  {...field}
                />
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormInput
                  label="Location"
                  placeholder="Enter your location"
                  {...field}
                />
              )}
            />
          </View>
        </Form>

        <Button
          className="my-4"
          onPress={form.handleSubmit(onSubmit)}
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white">Save Changes</Text>
          )}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
