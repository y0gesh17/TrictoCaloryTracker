import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

const days = ["M", "T", "W", "T", "F", "S", "S"];

export default function ModernCalendar({ onSelectDate }: any) {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState(today.getDate());

  const getDaysInMonth = () => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handleSelect = (day: number) => {
    setSelected(day);

    const date = new Date(year, month, day)
      .toISOString()
      .split("T")[0];

    onSelectDate?.(date);
  };

  const changeMonth = (dir: number) => {
    let newMonth = month + dir;
    let newYear = year;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setMonth(newMonth);
    setYear(newYear);
  };

  return (
    <View className="bg-white rounded-3xl p-4 shadow-md">

      {/* HEADER */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity onPress={() => changeMonth(-1)}>
          <Text className="text-lg">‹</Text>
        </TouchableOpacity>

        <Text className="font-semibold text-lg">
          {new Date(year, month).toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </Text>

        <TouchableOpacity onPress={() => changeMonth(1)}>
          <Text className="text-lg">›</Text>
        </TouchableOpacity>
      </View>

      {/* WEEK DAYS */}
      <View className="flex-row justify-between mb-2">
        {days.map((d, i) => (
          <Text key={i} className="text-gray-400 text-xs w-8 text-center">
            {d}
          </Text>
        ))}
      </View>

      {/* DAYS GRID */}
      <View className="flex-row flex-wrap">
        {Array.from({ length: getDaysInMonth() }).map((_, i) => {
          const day = i + 1;
          const isSelected = selected === day;

          return (
            <TouchableOpacity
              key={day}
              onPress={() => handleSelect(day)}
              className="w-[14.2%] items-center mb-3"
            >
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  isSelected
                    ? "bg-purple-500"
                    : "bg-transparent"
                }`}
              >
                <Text
                  className={`text-sm ${
                    isSelected ? "text-white font-bold" : "text-gray-700"
                  }`}
                >
                  {day}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}