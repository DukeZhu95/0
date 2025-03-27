import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";

import { useFont } from "@/context/font-context";

export default function OnboardingScreen() {
  const { selectedFont } = useFont();
  const { t } = useTranslation();

  const gifs = [
    require("../../assets/gifs/onboarding1.gif"),
    require("../../assets/gifs/onboarding2.gif"),
    require("../../assets/gifs/onboarding3.gif"),
    require("../../assets/gifs/onboarding5.gif"),
  ];

  const [currentGifIndex, setCurrentGifIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentGifIndex((prevIndex: number) => (prevIndex + 1) % gifs.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <ImageBackground
      source={gifs[currentGifIndex]}
      style={{
        flex: 1,
        justifyContent: "flex-end",
        padding: 20,
      }}
    >
      <LinearGradient
        colors={[
          "rgba(59, 175, 215, 0.01)",
          "rgba(59, 175, 215, 0.8)",
          "rgba(31, 92, 113, 0.9)",
        ]}
        locations={[0, 0.5, 1]}
        style={{
          position: "absolute",
          top: "50%",
          bottom: 0,
          left: 0,
          right: 0,
          justifyContent: "flex-start",
        }}
      />
      {/* Heading */}
      <Text
        style={{
          color: "#fff",
          fontSize: 22,
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 30,
          fontFamily: selectedFont,
        }}
      >
        {t("welcomeScreen.exploreChallenges")}
        {"\n"}
        {t("welcomeScreen.thatInspire")}
      </Text>

      {/* Buttons */}
      <TouchableOpacity
        onPress={() => {
          router.push("/sign-up");
        }}
        style={{
          backgroundColor: "#fff",
          paddingVertical: 12,
          borderRadius: 10,
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            color: "hsl(195, 57%, 28%)",
            fontFamily: selectedFont,
          }}
        >
          {t("welcomeScreen.signUp")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          router.push("/sign-in");
        }}
        style={{
          backgroundColor: "transparent",
          paddingVertical: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#fff",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "hsl(0, 0%, 100%)",
            fontFamily: selectedFont,
          }}
        >
          {t("welcomeScreen.signIn")}
        </Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}