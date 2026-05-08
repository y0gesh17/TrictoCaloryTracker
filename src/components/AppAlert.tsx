import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type AlertAction = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "danger" | "muted";
};

type AppAlertProps = {
  visible: boolean;
  title: string;
  message?: string;
  type?: "success" | "warning" | "danger" | "info";
  actions?: AlertAction[];
  onClose: () => void;
};

const iconByType = {
  success: "checkmark-circle",
  warning: "alert-circle",
  danger: "trash",
  info: "information-circle",
} as const;

const colorByType = {
  success: ["#22C55E", "#16A34A"],
  warning: ["#FBBF24", "#F97316"],
  danger: ["#F87171", "#DC2626"],
  info: ["#38BDF8", "#16A34A"],
} as const;

export default function AppAlert({
  visible,
  title,
  message,
  type = "info",
  actions,
  onClose,
}: AppAlertProps) {
  const buttons = actions?.length
    ? actions
    : [{ label: "Got it", variant: "primary" as const }];

  const handlePress = (action: AlertAction) => {
    onClose();
    action.onPress?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/45 items-center justify-center px-6">
        <LinearGradient
          colors={["#FFFFFF", "#ECFDF5", "#FFF7ED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: "100%",
            borderRadius: 30,
            padding: 22,
            shadowColor: "#16a34a",
            shadowOpacity: 0.2,
            shadowRadius: 24,
            elevation: 8,
          }}
        >
          <View className="items-end">
            <TouchableOpacity onPress={onClose} className="p-1">
              <Ionicons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          <View className="items-center">
            <LinearGradient
              colors={colorByType[type]}
              style={{
                width: 76,
                height: 76,
                borderRadius: 38,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons name={iconByType[type]} size={40} color="white" />
            </LinearGradient>

            <Text className="text-2xl font-bold text-gray-950 text-center">
              {title}
            </Text>

            {!!message && (
              <Text className="text-gray-500 text-center mt-2 leading-5">
                {message}
              </Text>
            )}
          </View>

          <View className="mt-6">
            {buttons.map((action) => {
              const danger = action.variant === "danger";
              const muted = action.variant === "muted";

              return (
                <TouchableOpacity
                  key={action.label}
                  onPress={() => handlePress(action)}
                  className="mb-2"
                >
                  {muted ? (
                    <View className="rounded-2xl bg-white/80 py-4">
                      <Text className="text-center font-semibold text-gray-500">
                        {action.label}
                      </Text>
                    </View>
                  ) : (
                    <LinearGradient
                      colors={
                        danger
                          ? ["#F87171", "#DC2626"]
                          : ["#22C55E", "#16A34A"]
                      }
                      style={{ borderRadius: 16, paddingVertical: 15 }}
                    >
                      <Text className="text-white text-center font-bold">
                        {action.label}
                      </Text>
                    </LinearGradient>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}
