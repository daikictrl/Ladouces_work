import { useSignIn, useSignUp, useSSO } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, TextInput, TouchableOpacity, View } from "../../components/tw";
import VerificationModal from "../../components/VerificationModal";
import {
  completeAuthSession,
  getClerkErrorMessage,
} from "../../utils/auth-session";

WebBrowser.maybeCompleteAuthSession();

export default function SignUp() {
  const router = useRouter();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { startSSOFlow } = useSSO();

  const [isSignIn, setIsSignIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | undefined>();

  const toggleMode = () => {
    setIsSignIn(!isSignIn);
    setEmail("");
    setError(undefined);
    setModalError(undefined);
    setPassword("");
    setShowPassword(false);
  };

  const handleSubmit = async () => {
    const emailAddress = email.trim().toLowerCase();

    if (!emailAddress || !signIn || !signUp) return;

    setIsLoading(true);
    setError(undefined);
    setModalError(undefined);

    try {
      if (isSignIn) {
        const { error } = await signIn.emailCode.sendCode({ emailAddress });

        if (!error) {
          setEmail(emailAddress);
          setShowModal(true);
        } else {
          setError(getClerkErrorMessage(error, "Failed to send code"));
        }
      } else {
        const { error: createError } = await signUp.create({
          emailAddress,
          password,
        });
        if (createError) {
          setError(
            getClerkErrorMessage(createError, "Failed to create account"),
          );
          setIsLoading(false);
          return;
        }

        if (signUp.isTransferable) {
          setIsSignIn(true);
          const { error: transferError } = await signIn.emailCode.sendCode({
            emailAddress,
          });

          if (transferError) {
            setError(
              getClerkErrorMessage(
                transferError,
                "An account already exists. Please sign in.",
              ),
            );
            return;
          }

          setEmail(emailAddress);
          setShowModal(true);
          return;
        }

        const { error: sendError } = await signUp.verifications.sendEmailCode();
        if (!sendError) {
          setEmail(emailAddress);
          setShowModal(true);
        } else {
          setError(
            getClerkErrorMessage(sendError, "Failed to send verification code"),
          );
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(getClerkErrorMessage(err, "Something went wrong."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (code: string) => {
    if (!signIn || !signUp) return;

    setModalLoading(true);
    setModalError(undefined);
    try {
      if (isSignIn) {
        const { error } = await signIn.emailCode.verifyCode({ code });

        if (error) {
          setModalError(getClerkErrorMessage(error, "Invalid code."));
          return;
        }

        const result = await completeAuthSession({
          resource: signIn,
          onComplete: () => {
            setShowModal(false);
            router.replace("/(tabs)/home" as any);
          },
        });

        if (!result.completed) {
          setModalError(result.message);
        }
      } else {
        const { error } = await signUp.verifications.verifyEmailCode({ code });

        if (error) {
          setModalError(getClerkErrorMessage(error, "Invalid code."));
          return;
        }

        const result = await completeAuthSession({
          resource: signUp,
          onComplete: () => {
            setShowModal(false);
            router.replace("/(tabs)/home" as any);
          },
        });

        if (!result.completed) {
          setModalError(result.message);
        }
      }
    } catch (err: any) {
      console.error(err);
      setModalError(getClerkErrorMessage(err, "Invalid code."));
    } finally {
      setModalLoading(false);
    }
  };

  const handleSSO = async (strategy: "oauth_google" | "oauth_apple") => {
    setIsLoading(true);
    setError(undefined);
    try {
      const {
        createdSessionId,
        setActive: ssoSetActive,
        signIn: ssoSignIn,
        signUp: ssoSignUp,
      } = await startSSOFlow({
        strategy,
        redirectUrl: Linking.createURL("oauth-callback"),
      });

      // Determine the session ID — it may come directly or from the signIn/signUp resource
      const sessionId =
        createdSessionId ??
        ssoSignIn?.createdSessionId ??
        ssoSignUp?.createdSessionId;

      if (sessionId && ssoSetActive) {
        await ssoSetActive({ session: sessionId });
        router.replace("/(tabs)/home" as any);
      } else {
        // User likely cancelled the OAuth flow (closed browser mid-auth).
        // Don't show a scary error — just let them try again.
        console.log("SSO flow was not completed — user may have cancelled.");
      }
    } catch (err: any) {
      // AuthSession errors from closing the browser are expected — don't treat as failures
      const message = err?.message ?? "";
      const isCancellation =
        message.includes("cancelled") ||
        message.includes("canceled") ||
        message.includes("dismiss");

      if (!isCancellation) {
        console.error("OAuth error:", err);
        setError(
          getClerkErrorMessage(
            err,
            "Social authentication failed. Please try again.",
          ),
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f8fafc",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View className="flex-1 px-8 pt-6 pb-8 justify-between">
        <View>
          {/* Header */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 mb-8"
          >
            <Ionicons name="arrow-back" size={20} color="#0f172a" />
          </TouchableOpacity>

          {/* Title & Subtitle */}
          <Text className="text-3xl font-heading text-text mb-3">
            {isSignIn ? "Sign In" : "Create an account"}
          </Text>
          <Text className="text-base text-gray-500 mb-6 leading-6">
            {isSignIn
              ? "Welcome back! Please enter your details."
              : "Let's help you set up your account, it won't take long."}
          </Text>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-text mb-2 ml-1">
                Email
              </Text>
              <View
                className={`bg-surface rounded-2xl border ${error ? "border-red-500" : "border-gray-100"} shadow-sm px-4 py-4 flex-row items-center`}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#94a3b8"
                  className="mr-3"
                />
                <TextInput
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="flex-1 text-base text-text p-0"
                  style={{ paddingVertical: 0 }}
                  placeholderTextColor="#94a3b8"
                />
              </View>
              {error ? (
                <Text className="text-red-500 text-sm mt-2 ml-1">{error}</Text>
              ) : null}
            </View>
            {!isSignIn ? (
              <View>
                <Text className="text-sm font-medium text-text mb-2 ml-1">
                  Password
                </Text>
                <View
                  className={`bg-surface rounded-2xl border shadow-sm px-4 py-4 flex-row items-center`}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#94a3b8"
                    className="mr-3"
                  />
                  <TextInput
                    placeholder="Create a password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    className="flex-1 text-base text-text p-0"
                    style={{ paddingVertical: 0 }}
                    placeholderTextColor="#94a3b8"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((s) => !s)}
                    className="ml-3 p-2"
                  >
                    <Ionicons
                      name={showPassword ? "eye" : "eye-off"}
                      size={20}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>

          {/* Main Action Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.8}
            className={`w-full py-4 rounded-2xl items-center shadow-lg mt-8 ${
              email && (!isSignIn ? password : true) && !isLoading
                ? "bg-primary"
                : "bg-primary/50"
            }`}
            disabled={!email || (!isSignIn && !password) || isLoading}
          >
            <Text className="text-white font-semibold text-lg">
              {isLoading ? "Please wait..." : isSignIn ? "Sign In" : "Sign Up"}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-8">
            <View className="flex-1 h-[1px] bg-gray-200" />
            <Text className="mx-4 text-gray-500 text-sm font-medium">
              Or Continue with
            </Text>
            <View className="flex-1 h-[1px] bg-gray-200" />
          </View>

          {/* Social Logins */}
          <View className="flex-row justify-between space-x-4">
            <TouchableOpacity
              onPress={() => handleSSO("oauth_google")}
              className="flex-1 flex-row justify-center items-center py-4 rounded-2xl bg-surface border border-gray-200 shadow-sm"
            >
              <Ionicons
                name="logo-google"
                size={20}
                color="#DB4437"
                className="mr-2"
              />
              <Text className="font-semibold text-text">Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSSO("oauth_apple")}
              className="flex-1 flex-row justify-center items-center py-4 rounded-2xl bg-surface border border-gray-200 shadow-sm"
            >
              <Ionicons
                name="logo-apple"
                size={20}
                color="#000000"
                className="mr-2"
              />
              <Text className="font-semibold text-text">Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Toggle */}
        <TouchableOpacity
          onPress={toggleMode}
          className="py-4 items-center mt-auto"
        >
          <Text className="text-base text-gray-500 font-medium">
            {isSignIn ? "Don't have an account? " : "Already have an account? "}
            <Text className="text-primary font-bold">
              {isSignIn ? "Sign Up" : "Sign In"}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>

      <VerificationModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        email={email}
        onVerify={handleVerify}
        isLoading={modalLoading}
        error={modalError}
      />
    </View>
  );
}
