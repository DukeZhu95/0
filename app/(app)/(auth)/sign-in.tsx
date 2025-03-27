import { useForm } from "react-hook-form";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "@/components/safe-area-view";
import { supabase } from "@/config/supabase";
import { colors } from "@/constants/colours";
import { useTheme } from "@/context/theme-context";
import { Link, router } from "expo-router";
import { Image } from "@/components/image";
import { useFont } from "@/context/font-context";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function SignIn() {
  const { selectedFont } = useFont();
  const { colorScheme } = useTheme();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function onSubmit({ identifier, password }) {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: identifier.includes("@") ? identifier : undefined,
        password,
      });

      if (error) throw error;
    } catch (error) {
      Alert.alert(t("signIn.alerts.signInError.title"), error.message);
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors[colorScheme]?.card,
        paddingHorizontal: 24,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title & Description */}
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <View className="flex flex-row items-center justify-start my-8 gap-4">
              <Image
                style={{ backgroundColor: colors[colorScheme]?.background }}
                className="w-[50px] h-[50px] rounded-full"
                source={require("@/assets/images/playstore.png")}
              />
            </View>
            <Text
              style={{
                fontSize: 14,
                color: colors[colorScheme]?.mutedForeground,
                fontFamily: selectedFont,
                textAlign: "center",
              }}
            >
              {t("signIn.headerMessage")}
            </Text>
          </View>

          {/* Input Fields */}
          <View style={{ marginBottom: 20 }}>
            {/* Identifier (Email or Username) */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                marginLeft: 8,
                marginBottom: 4,
                fontFamily: selectedFont,
                color: colors[colorScheme]?.mutedForeground,
              }}
            >
              {t("signIn.form.email")}
            </Text>
            <TextInput
              placeholder={t("signIn.form.emailPlaceholder")}
              placeholderTextColor={colors[colorScheme]?.mutedForeground}
              style={{
                fontFamily: selectedFont,
                borderWidth: 1,
                borderColor: colors[colorScheme]?.border,
                padding: 14,
                borderRadius: 10,
                marginBottom: 12,
                fontSize: 16,
                backgroundColor: colors[colorScheme]?.input,
                color: colors[colorScheme]?.secondaryForeground,
              }}
              autoCapitalize="none"
              onChangeText={(text) => setValue("identifier", text)}
            />
            <View className="relative">
            {/* Password */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                marginBottom: 4,
                marginLeft: 8,
                fontFamily: selectedFont,
                color: colors[colorScheme]?.mutedForeground,
              }}
            >
              {t("signIn.form.password")}
            </Text>
            <TextInput
              placeholder={t("signIn.form.passwordPlaceholder")}
              placeholderTextColor={colors[colorScheme]?.mutedForeground}
              style={{
                fontFamily: selectedFont,
                borderWidth: 1,
                borderColor: colors[colorScheme]?.border,
                padding: 14,
                borderRadius: 10,
                marginBottom: 12,
                fontSize: 16,
                backgroundColor: colors[colorScheme]?.input,
                color: colors[colorScheme]?.secondaryForeground,
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              onChangeText={(text) => setValue("password", text)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-1 bottom-[25%] w-[30px] h-[30px] flex justify-center items-center"
            >
              <Ionicons
                style={{ textAlign: "center" }}
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="gray"
              />
            </TouchableOpacity></View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            onPress={() => router.push("/forgot-password")}
            style={{ alignSelf: "flex-end", marginBottom: 20 }}
          >
            <Text
              style={{
                color: colors[colorScheme]?.accent,
                fontFamily: selectedFont,
                fontSize: 14,
              }}
            >
              {t("signIn.buttons.forgotPassword")}
            </Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            style={{
              backgroundColor: colors[colorScheme]?.background,
              paddingVertical: 14,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: colors[colorScheme]?.foreground,
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {t("signIn.buttons.signIn")}
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 16,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: colors[colorScheme]?.mutedForeground,
                fontFamily: selectedFont,
              }}
            >
              {t("signIn.buttons.noAccount")}
            </Text>
            <TouchableOpacity onPress={() => router.push("/sign-up")}>
              <Text
                style={{
                  color: colors[colorScheme]?.accent,
                  fontSize: 14,
                  fontFamily: selectedFont,
                  fontWeight: "600",
                  marginLeft: 5,
                }}
              >
                {t("signIn.buttons.signUp")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Terms and Privacy */}
        <View style={{ alignItems: "center", marginTop: 20, marginBottom: 10 }}>
          <Text
            style={{
              fontSize: 12,
              color: colors[colorScheme]?.mutedForeground,
              textAlign: "center",
            }}
          >
            {t("signIn.termsAndPrivacy.message")}
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 5,
            }}
          >
            <Link
              href="/terms"
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "#aa32a0",
                textDecorationLine: "underline",
              }}
            >
              {t("signIn.termsAndPrivacy.termsOfService")}
            </Link>
            <Text
              style={{
                fontSize: 12,
                color: colors[colorScheme]?.mutedForeground,
                marginHorizontal: 5,
              }}
            >
              {t("signIn.termsAndPrivacy.andAccepted")}
            </Text>
            <Link
              href="/privacy"
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "#aa32a0",
                textDecorationLine: "underline",
              }}
            >
              {t("signIn.termsAndPrivacy.privacyPolicy")}
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
