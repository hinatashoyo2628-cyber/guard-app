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
          options={({ navigation }) => ({
            title: "Records",

            headerStyle: {
              backgroundColor: "#1f3f5b",
            },

            headerTintColor: "#ffffff",

            headerTitleStyle: {
              fontWeight: "600",
            },

            // 🔥 PRINT BUTTON CONNECTED
            headerRight: () => (
              <Pressable
                onPress={() => {
                  navigation.setParams({ triggerPrint: Date.now() });
                }}
                style={{ marginRight: 15 }}
              >
                <Ionicons name="print-outline" size={22} color="#fff" />
              </Pressable>
            ),
          })}
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