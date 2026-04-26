import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen
          name="records"
          options={({ navigation, route }) => ({
            title: "Records",

            headerStyle: {
              backgroundColor: "#1f3f5b",
            },

            headerTintColor: "#ffffff",

            headerTitleStyle: {
              fontWeight: "600",
            },

            // 🔥 PRINT → GO TO SIGNATURE SCREEN
            headerRight: () => {
              const params = route?.params as any;

              const showPrint = params?.selectedDate;
              if (!showPrint) return null;

              return (
                <Pressable
                  onPress={() => {
                    navigation.navigate("signature", {
                      records: JSON.stringify(params?.records || []),
                      date: params?.selectedDate, // ✅ ONLY DATE
                    });
                  }}
                  style={{ marginRight: 15 }}
                >
                  <Ionicons name="print-outline" size={22} color="#fff" />
                </Pressable>
              );
            },
          })}
        />

        {/* ✅ SIGNATURE SCREEN */}
        <Stack.Screen
          name="signature"
          options={{
            title: "Signature",
            headerStyle: { backgroundColor: "#1f3f5b" },
            headerTintColor: "#fff",
          }}
        />

        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', title: 'Modal' }}
        />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}