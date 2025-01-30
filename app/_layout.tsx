import React from "react";
import { Stack } from "expo-router";

import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { LinearGradient } from "expo-linear-gradient"

export default function Layout() {
  return (
    <GluestackUIProvider>
      <Stack
        screenOptions={{
          headerBackground:() => {
            return (
              <LinearGradient
                className="w-full h-full"
                colors={["#8637CF", "#0F55A1"]}
                start={[0, 1]}
                end={[1, 0]}
              />
            );
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Stack.Screen
          name="edit/[id]"
          options={{
            title: 'Edit',
          }}
        />
      </Stack>
    </GluestackUIProvider>
  );
}
