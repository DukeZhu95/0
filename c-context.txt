// app/context/SupabaseProvider.tsx

import { supabase } from "@/config/supabase";
import { Session, User } from "@supabase/supabase-js";
import { useFonts } from "expo-font";
import { useRouter, useSegments, SplashScreen } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

SplashScreen.preventAutoHideAsync();

type SupabaseContextProps = {
  auth: any; // Ideally, replace 'any' with a proper type from Supabase
  user: User | null;
  profile: any | null;
  session: Session | null;
  initialized?: boolean;
  signUp: (
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    birthday: Date,
    isAbove18: boolean,
    acceptTerms: boolean,
    acceptEULA: boolean,
    userType: "standard" | "minor" | "business",
    parentEmail?: string,
    referralCode?: string,
    businessName?: string,
    businessType?: string,
    website?: string
  ) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteOwnAccount: () => Promise<void>;
};

type SupabaseProviderProps = {
  children: React.ReactNode;
};

export const SupabaseContext = createContext<SupabaseContextProps>({
  auth: supabase.auth,
  user: null,
  profile: null,
  session: null,
  initialized: false,
  signUp: async () => {},
  signInWithPassword: async () => {},
  signOut: async () => {},
  deleteOwnAccount: async () => {},
});

export const useSupabase = () => useContext(SupabaseContext);

export const useAuth = () => useSupabase();

export const SupabaseProvider = ({ children }: SupabaseProviderProps) => {
  const router = useRouter();
  const segments = useSegments();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  const [fontsLoaded] = useFonts({
    "Roboto-Regular": require("../assets/fonts/free/Roboto-Regular.ttf"),
    "Handlee-Regular": require("../assets/fonts/paid/Handlee-Regular.ttf"),
    "OpenSans-Regular": require("../assets/fonts/free/OpenSans-Regular.ttf"),
    "NotoSans-Regular": require("../assets/fonts/free/NotoSans-Regular.ttf"),
    "Cursive-Regular": require("../assets/fonts/paid/CedarvilleCursive-Regular.ttf"),
  });

  const signUp = async (
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    birthday: Date,
    isAbove18: boolean,
    acceptTerms: boolean,
    acceptEULA: boolean,
    userType: "standard" | "minor" | "business",
    parentEmail?: string,
    referralCode?: string,
    businessName?: string,
    businessType?: string,
    website?: string
  ) => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          username: username.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: fullName,
          isabove18: isAbove18,
          acceptterms: acceptTerms,
          accepteula: acceptEULA,
          role: userType,
          business_name: businessName,
          business_type: businessType,
          website: website,
        },
      },
    });
    if (error) {
      throw error;
    }

    if (data.user) {
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: data.user.id,
          username: username.trim(),
          email: email.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          isabove18: isAbove18,
          acceptterms: acceptTerms,
          accepteula: acceptEULA,
          role: userType,
          birthday,
          business_name: businessName,
          business_type: businessType,
          website: website,
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      if (userType === "minor" && parentEmail) {
        const { data: parentUser, error: parentError } = await supabase
          .from("users")
          .select("*")
          .eq("email", parentEmail.trim())
          .single();

        if (parentError || !parentUser) {
          Alert.alert(
            "Parental Consent Error",
            "Parent email not found. Please ensure your parent has an account."
          );
          return;
        }

        const { error: consentError } = await supabase
          .from("parental_controls")
          .insert([
            {
              parent_id: parentUser.id,
              child_id: data.user.id,
              consent_given: false,
            },
          ]);

        if (consentError) {
          throw consentError;
        }

        Alert.alert(
          "Account Created",
          "Account created successfully! Please wait for your parent's consent."
        );
      } else {
        Alert.alert("Success", "Account created successfully!");
      }

      if (referralCode && referralCode.trim().length > 0) {
        const { data: referrer, error: referrerError } = await supabase
          .from("users")
          .select("id, coins, total_coins_earned")
          .eq("id", referralCode.trim()) // user’s ID is the code
          .single();

        if (referrerError) {
          console.error("Referral code error:", referrerError.message);
        } else if (referrer) {
          const { error: referralInsertError } = await supabase
            .from("referrals")
            .insert([
              {
                referrer_id: referrer.id,
                referee_id: data.user.id,
              },
            ]);

          if (referralInsertError) {
            console.error(
              "Error inserting referral record:",
              referralInsertError.message
            );
          } else {
            // Update coin balances:
            // Referrer: +30 coins
            // Referee (this newly signed-up user): +20 coins
            const { error: referrerCoinError } = await supabase
              .from("users")
              .update({
                coins: (referrer.coins || 0) + 30,
                total_coins_earned: (referrer.total_coins_earned || 0) + 30,
              })
              .eq("id", referrer.id);

            if (referrerCoinError) {
              console.error(
                "Error updating referrer coins:",
                referrerCoinError.message
              );
            }

            // Now update the new user’s coins
            const { data: newUserData, error: newUserError } = await supabase
              .from("users")
              .select("coins, total_coins_earned")
              .eq("id", data.user.id)
              .single();

            if (!newUserError && newUserData) {
              const { coins, total_coins_earned } = newUserData;
              const { error: newUserCoinError } = await supabase
                .from("users")
                .update({
                  coins: (coins || 0) + 20,
                  total_coins_earned: (total_coins_earned || 0) + 20,
                })
                .eq("id", data.user.id);

              if (newUserCoinError) {
                console.error(
                  "Error updating new user coins:",
                  newUserCoinError.message
                );
              }
            }
          }
        }
      }
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    }

    if (data.user) {
      setUser(data.user);
      setSession(data.session);
      router.replace("/(app)/(protected)");
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setUser(null);
    setSession(null);
    router.push("/(app)/(auth)/sign-in");
  };

  const deleteOwnAccount = async () => {
    if (!user) {
      Alert.alert("Error", "You need to be logged in to delete your account.");
      return;
    }

    try {
      const response = await fetch(
        "https://masswgndvgtpdabpknsx.supabase.co/functions/v1/deleteaccount",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`, // User authentication
          },
          body: JSON.stringify({ user_id: user.id }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete account");
      }

      // Logout user locally
      setUser(null);
      setSession(null);

      Alert.alert(
        "Account Deleted",
        "Your account has been successfully deleted."
      );
      router.replace("/(app)/(auth)/sign-in");
    } catch (error) {
      console.error("Error deleting account:", error.message);
      Alert.alert("Error", "Failed to delete your account.");
    }
  };

  useEffect(() => {
    if (!initialized) return;

    const inProtectedGroup = segments[1] === "(protected)";

    if (session && !inProtectedGroup) {
      router.replace("/(app)/(protected)");
    } else if (!session) {
      router.replace("/(app)/welcome");
    }

    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 500);
  }, [initialized, fontsLoaded, session]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session ? session.user : null);
      setInitialized(true);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session ? session.user : null);
      }
    );

    return () => {
      // For Supabase v2, unsubscribe correctly
      authListener.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setProfile(data);
      }
    };
    fetchProfile();
  }, [user]);

  return (
    <SupabaseContext.Provider
      value={{
        auth: supabase.auth, // Added auth property
        user,
        profile,
        session,
        initialized,
        signUp,
        signInWithPassword,
        signOut,
        deleteOwnAccount,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
};
