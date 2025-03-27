import { useForm, Controller } from "react-hook-form";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import Checkbox from "expo-checkbox";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "@/components/safe-area-view";
import { colors } from "@/constants/colours";
import { useTheme } from "@/context/theme-context";
import { Link, router } from "expo-router";
import { Image } from "@/components/image";
import { useFont } from "@/context/font-context";
import { useSupabase } from "@/context/supabase-provider";

export default function BusinessSignUp() {
  const { selectedFont } = useFont();
  const { colorScheme } = useTheme();
  const { t } = useTranslation();
  const { signUp } = useSupabase();
  const [isAbove18, setIsAbove18] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptEULA, setAcceptEULA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      businessName: "",
      email: "",
      // phoneNumber: "",
      businessType: "",
      password: "",
      confirmPassword: "",
      website: "",
      isabove18: false,
      acceptterms: false, // Ensure this is a boolean
      accepteula: false,
    },
  });

  async function onSubmit(data) {
    if (!acceptTerms) {
      Alert.alert(
        t("signUp.alerts.agreementRequired.title"),
        t("signUp.alerts.agreementRequired.message")
      );
      return;
    }
    if (!acceptEULA) {
      Alert.alert(
        "EULA Agreement Required",
        "You must accept the End User License Agreement to proceed."
      );
      return;
    }
    if (data.password !== data.confirmPassword) {
      Alert.alert(
        t("signUp.alerts.passwordMismatch.title"),
        t("signUp.alerts.passwordMismatch.message")
      );
      return;
    }
    setIsLoading(true);
    try {
      await signUp(
        data.businessName, // Username field (treated as business name)
        data.businessName, // First Name (same as business name)
        "", // No Last Name for business accounts)
        data.email,
        // data.phoneNumber,
        data.password,
        new Date(), // No birthday required for business)
        isAbove18,
        acceptTerms,
        acceptEULA,
        "business", // Ensure this is a string
        undefined, // parentEmail (optional)
        undefined, // referralCode (optional)
        data.businessName, // Business Name)
        data.businessType, // Business Type)
        data.website // Website field)
      );
      Alert.alert(
        t("signUp.alerts.success.title"),
        t("signUp.alerts.success.message")
      );
      router.replace("/");
    } catch (error) {
      Alert.alert(
        t("signUp.alerts.signUpError.title"),
        error.message || t("signUp.alerts.signUpError.message")
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors[colorScheme].muted }}
    >
      {/* Header Section */}
      <View style={{ padding: 4 }}>
        <View className="flex items-center justify-center gap-4">
          <Image
            style={{ backgroundColor: colors[colorScheme]?.background }}
            className="w-[50px] h-[50px] rounded-full"
            source={require("@/assets/images/playstore.png")}
          />
          <Text
          style={{
            fontFamily: selectedFont,
            fontSize: 16,
            color: colors[colorScheme].mutedForeground,
            paddingHorizontal: 24,
          }}
        >
          {t("signUp.headerMessageBusiness")}
        </Text>
        </View>
      </View>

      {/* Scrollable Form Fields Section */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 20,
            borderRadius: 8,
            backgroundColor: colors[colorScheme]?.card,
          }}
          showsVerticalScrollIndicator={false}
        >
          {[
            {
              name: "businessName",
              label: "Business Name",
              keyboardType: "default",
              required: true,
            },
            {
              name: "email",
              label: "Business Email",
              keyboardType: "email-address",
              required: true,
            },
            // {
            //   name: "phoneNumber",
            //   label: "Phone Number",
            //   keyboardType: "phone-pad",
            //   required: false,
            // },
            {
              name: "businessType",
              label: "Business Type",
              keyboardType: "default",
              required: true,
            },
            {
              name: "website",
              label: "Website",
              keyboardType: "url",
              required: true,
            },
            {
              name: "password",
              label: "Password",
              keyboardType: "default",
              required: true,
            },
            {
              name: "confirmPassword",
              label: "Confirm Password",
              keyboardType: "default",
              required: true,
            },
          ].map((field) => (
            <View key={field.name} style={{ marginBottom: 15 }}>
              <Text
                style={{
                  fontFamily: selectedFont,
                  fontSize: 14,
                  color: colors[colorScheme].mutedForeground,
                }}
              >
                {t(`signUp.form.${field.name}.label`, field.label)}
              </Text>
              <Controller
                control={control}
                rules={{
                  required: field.required
                    ? t(
                        `signUp.form.${field.name}.required`,
                        `${field.label} is required`
                      )
                    : false,
                  pattern:
                    field.name === "email"
                      ? /^\S+@\S+\.\S+$/
                      : field.name === "website"
                        ? /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(:\d{1,5})?(\/.*)?$/i
                        : undefined,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: colors[colorScheme].border,
                      borderRadius: 5,
                      padding: 10,
                      fontFamily: selectedFont,
                      backgroundColor: colors[colorScheme].input,
                      color: colors[colorScheme].mutedForeground,
                    }}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    secureTextEntry={
                      field.name === "password" ||
                      field.name === "confirmPassword"
                    }
                    keyboardType={field.keyboardType}
                  />
                )}
                name={field.name}
              />
              {errors[field.name] && (
                <Text
                  style={{
                    color: colors[colorScheme].destructive,
                    fontFamily: selectedFont,
                    fontSize: 12,
                  }}
                >
                  {errors[field.name]?.message}
                </Text>
              )}
            </View>
          ))}
         
        </ScrollView>
         {/* Footer Section */}
         <View style={{ paddingHorizontal: 20 }}>
            {/* Accept Age Checkbox */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginTop: 10,
              }}
            >
              <Checkbox
                value={isAbove18}
                onValueChange={(value) => {
                  setIsAbove18(value);
                  setValue(" isabove18", value);
                }}
                color={isAbove18 ? colors[colorScheme].accent : undefined}
              />
              <Text
                style={{
                  marginLeft: 10,
                  fontSize: 12,
                  flex: 1,
                  color: colors[colorScheme].mutedForeground,
                }}
              >
                {t(
                  "Acknowledgement",
                  "I agree that I meet the age requirement as specified in the Terms of Service and Privacy Policy"
                )}{" "}
              </Text>
            </View>

            {/* Accept Terms Checkbox */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Checkbox
                value={acceptTerms}
                onValueChange={(value) => {
                  setAcceptTerms(value);
                  setValue("acceptterms", value);
                }}
                color={acceptTerms ? colors[colorScheme].accent : undefined}
              />
              <Text
                style={{
                  marginLeft: 10,
                  // textTransform: "uppercase",
                  fontSize: 12,
                  color: colors[colorScheme].mutedForeground,
                }}
              >
                I agree that i have read and I accept the {"\n"}
                <Link
                  href="/terms"
                  className="underline"
                  style={{ fontSize: 12, fontWeight: "600", color: "#aa32a0" }}
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  style={{ fontSize: 12, fontWeight: "600", color: "#aa32a0" }}
                >
                  Privacy Policy
                </Link>
              </Text>
            </View>
            {/* Accept EULA Checkbox */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginTop: 10,
              }}
            >
              <Checkbox
                value={acceptEULA}
                onValueChange={(value) => {
                  setAcceptEULA(value);
                  setValue("accepteula", value);
                }}
                color={acceptEULA ? colors[colorScheme].accent : undefined}
              />
              <Text
                style={{
                  marginLeft: 10,
                  fontSize: 12,
                  flex: 1,
                  color: colors[colorScheme].mutedForeground,
                }}
              >
                I agree to the{" "}
                <Link
                  href="/eula"
                  style={{ fontWeight: "600", color: "#aa32a0" }}
                >
                  End User License Agreement (EULA)
                </Link>
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading
                  ? colors[colorScheme].mutedForeground
                  : colors[colorScheme].background,
                padding: 15,
                borderRadius: 5,
                alignItems: "center",
                marginVertical: 10,
                flexDirection: "row", // This ensures horizontal layout
                justifyContent: "center", // Centers items horizontally
              }}
            >
              {isLoading ? (
                <ActivityIndicator
                  size="small"
                  color={colors[colorScheme]?.foreground}
                  style={{ marginRight: 10 }}
                />
              ) : null}
              <Text
                style={{
                  fontFamily: selectedFont,
                  fontSize: 18,
                  color: isLoading
                    ? colors[colorScheme]?.background
                    : colors[colorScheme]?.foreground,
                }}
              >
                {isLoading
                  ? "Creating Account..."
                  : t("signUp.buttons.createAccount")}
              </Text>
            </TouchableOpacity>
          </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}