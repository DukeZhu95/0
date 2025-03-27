import DateTimePicker from "@react-native-community/datetimepicker";
import Checkbox from "expo-checkbox";
import { Link, router } from "expo-router";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
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
  Modal,
} from "react-native";
import DatePicker from "react-native-date-picker";

import { Image } from "@/components/image";
import { SafeAreaView } from "@/components/safe-area-view";
import { colors } from "@/constants/colours";
import { calculateAge } from "@/constants/helper";
import { useFont } from "@/context/font-context";
import { useSupabase } from "@/context/supabase-provider";
import { useTheme } from "@/context/theme-context";
import { AgeRestrictionModal } from "@/components/sign-up/AgeRestrictionModal";
import { BirthdayModal } from "@/components/sign-up/BirthdayModal";

export default function SignUp() {
  const { selectedFont } = useFont();
  const { colorScheme } = useTheme();
  const { t } = useTranslation();
  const { signUp } = useSupabase();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [ageRestrictionModal, setAgeRestrictionModal] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptEULA, setAcceptEULA] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthday, setBirthday] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [age, setAge] = useState<number | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstname: "",
      lastname: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      birthday: "",
      isabove18: false,
      acceptterms: false,
      accepteula: false,
      parentEmail: "",
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

    if (!birthday) {
      Alert.alert("Error", "Please select a valid birthday.");
      return;
    }

    const birthdayDate = new Date(birthday);
    const calculatedAge = calculateAge(birthdayDate);

    // Age restrictions
    if (calculatedAge < 13) {
      setAgeRestrictionModal(true);
      return;
    }

    let role: "standard" | "minor" = calculatedAge >= 18 ? "standard" : "minor";
    let parentEmail: string | undefined = undefined;

    if (role === "minor") {
      if (!data.parentEmail) {
        Alert.alert(
          "Parent Email Required",
          "As you are under 18, please provide your parent's email for consent"
        );
        return;
      }
      parentEmail = data.parentEmail;
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
        data.username,
        data.firstname,
        data.lastname,
        data.email,
        data.password,
        birthdayDate,
        calculatedAge >= 18,
        acceptTerms,
        acceptEULA,
        role,
        parentEmail
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

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setBirthday(date.toDateString());
      setValue("birthday", date.toISOString());
      const calculatedAge = calculateAge(date);
      setAge(calculatedAge);
    }
  };

  const today = new Date();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors[colorScheme].muted }}
    >
      {/* Header Section */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 2 }}>
        <View className="flex items-center justify-start gap-4">
          <Image
            style={{ backgroundColor: colors[colorScheme]?.background }}
            className="w-[50px] h-[50px] rounded-full"
            source={require("@/assets/images/playstore.png")}
          />
          <Text
            style={{
              fontFamily: selectedFont,
              fontSize: 16,
              fontWeight: "bold",
              color: colors[colorScheme].mutedForeground,
            }}
          >
            {t("signUp.headerMessage")}
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
              name: "firstname",
              label: "First Name",
              keyboardType: "default",
              required: true,
            },
            {
              name: "lastname",
              label: "Last Name",
              keyboardType: "default",
              required: true,
            },
            {
              name: "username",
              label: "Username",
              keyboardType: "default",
              required: true,
            },
            {
              name: "email",
              label: "Email",
              keyboardType: "email-address",
              required: true,
            },
            {
              name: "password",
              label: "Password",
              keyboardType: "default",
              required: true,
              pattern:
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
              patternMessage:
                "Password must contain at least 8 characters, including uppercase, lowercase, number and special character",
              helperText:
                "Must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character",
            },
            {
              name: "confirmPassword",
              label: "Confirm Password",
              keyboardType: "default",
              required: true,
              validate: (value, formValues) =>
                value === formValues.password || "Passwords do not match",
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
                  pattern: field.pattern
                    ? {
                        value: field.pattern,
                        message: field.patternMessage,
                      }
                    : undefined,
                  validate: field.validate,
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
                    autoCapitalize={
                      field.name === "email" ||
                      field.name === "password" ||
                      field.name === "confirmPassword"
                        ? "none"
                        : "words"
                    }
                  />
                )}
                name={field.name}
              />
              {errors[field.name] && (
                <Text
                  style={{
                    color: "red",
                    fontFamily: selectedFont,
                    fontSize: 12,
                  }}
                >
                  {errors[field.name]?.message}
                </Text>
              )}
            </View>
          ))}

          {/* Birthday Picker */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              marginBottom: 4,
              fontFamily: selectedFont,
              color: colors[colorScheme]?.mutedForeground,
            }}
          >
            {t("signUp.form.birthday.label")}
          </Text>
          <TouchableOpacity
            onPress={() => setIsModalVisible(true)}
            style={{ marginLeft: 8 }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "#aa32a0",
                textDecorationLine: "underline",
              }}
            >
              Why we ask for your birthday?
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={{
              borderWidth: 1,
              borderColor: colors[colorScheme]?.border,
              padding: 14,
              borderRadius: 10,
              backgroundColor: colors[colorScheme]?.input,
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontFamily: selectedFont,
                color: birthday ? colors[colorScheme].mutedForeground : "gray",
              }}
            >
              {birthday || t("signUp.form.birthday.placeholder")}
            </Text>
          </TouchableOpacity>
          {showDatePicker && Platform.OS === "ios" && (
            <DatePicker
              modal
              date={birthday ? new Date(birthday) : new Date()}
              mode="date"
              open={showDatePicker}
              minimumDate={
                new Date(
                  today.getFullYear() - 100,
                  today.getMonth(),
                  today.getDate()
                )
              }
              maximumDate={today}
              onConfirm={(date) => {
                setShowDatePicker(false);
                if (date) {
                  setBirthday(date.toDateString());
                  setValue("birthday", date.toISOString());
                  const calculatedAge = calculateAge(date);
                  setAge(calculatedAge);
                }
              }}
              onCancel={() => setShowDatePicker(false)}
            />
          )}
          {showDatePicker && Platform.OS === "android" && (
            <DateTimePicker
              value={birthday ? new Date(birthday) : new Date()}
              mode="date"
              display="spinner"
              minimumDate={
                new Date(
                  today.getFullYear() - 100,
                  today.getMonth(),
                  today.getDate()
                )
              }
              maximumDate={today}
              onChange={handleDateChange}
            />
          )}

          {age !== null && age < 18 && age > 12 && (
            <View style={{ marginBottom: 15 }}>
              <Text
                style={{
                  fontFamily: selectedFont,
                  fontSize: 14,
                  color: colors[colorScheme].mutedForeground,
                }}
              >
                {t("signUp.form.parentEmail.label", "Parent Email")}
              </Text>
              <Controller
                control={control}
                rules={{
                  required: t(
                    "signUp.form.parentEmail.required",
                    "Parent email is required for users under 18"
                  ),
                  pattern: /^\S+@\S+\.\S+$/,
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
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
                name="parentEmail"
              />
              {errors.parentEmail && (
                <Text
                  style={{
                    color: "red",
                    fontFamily: selectedFont,
                    fontSize: 12,
                  }}
                >
                  {errors.parentEmail?.message}
                </Text>
              )}
            </View>
          )}
        </ScrollView>

        {/* Footer Section */}
        <View style={{ padding: 20 }}>
          {/* Accept Terms Checkbox */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
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
                fontSize: 12,
                flex: 1,
                color: colors[colorScheme].mutedForeground,
              }}
            >
              {t(
                "signUp.form.termsAgreement",
                "I agree that I have read and accept the"
              )}{" "}
              <Link
                href="/terms"
                style={{ fontWeight: "600", color: "#aa32a0" }}
              >
                {t("signUp.links.termsOfService", "Terms of Service")}
              </Link>{" "}
              {t("signUp.form.and", "and")}{" "}
              <Link
                href="/privacy"
                style={{ fontWeight: "600", color: "#aa32a0" }}
              >
                {t("signUp.links.privacyPolicy", "Privacy Policy")}
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
              marginTop: 20,
              flexDirection: "row",
              justifyContent: "center",
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
                ? t("signUp.buttons.creatingAccount", "Creating Account...")
                : t("signUp.buttons.createAccount")}
            </Text>
          </TouchableOpacity>

          {/* Business Sign Up Link */}
          <View style={{ marginTop: 15, alignItems: "center" }}>
            <TouchableOpacity onPress={() => router.push("/sign-up-business")}>
              <Text
                style={{
                  color: colors[colorScheme]?.accent,
                  fontSize: 14,
                  fontFamily: selectedFont,
                  fontWeight: "600",
                }}
              >
                {t("signUp.buttons.businessJoin")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Age Restriction Modal */}
      <AgeRestrictionModal
        visible={ageRestrictionModal}
        onClose={() => setAgeRestrictionModal(false)}
      />
      <BirthdayModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </SafeAreaView>
  );
}