import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../firebase.js";
import { fillAndPrintPdf } from "../utils/fillPdf";

export default function RecordsScreen() {
  const [months, setMonths] = useState<string[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [records, setRecords] = useState<any[]>([]);

  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const router = useRouter();

  // 🔥 LISTEN TO PRINT TRIGGER
  const { triggerPrint } = useLocalSearchParams();

  useEffect(() => {
    loadMonths();
  }, []);

  // 🔥 RUN PRINT WHEN BUTTON CLICKED
  useEffect(() => {
    if (triggerPrint && records.length > 0) {
      fillAndPrintPdf(records);
    }
  }, [triggerPrint]);

  const formatMonth = (month: string) => {
    const [year, m] = month.split("-");
    return new Date(Number(year), Number(m) - 1).toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const loadMonths = async () => {
    const snap = await getDocs(collection(db, "History"));
    const set = new Set<string>();

    snap.forEach((doc) => {
      const id = doc.id;
      if (id.length === 10) set.add(id.slice(0, 7));
      else set.add(id);
    });

    const list = Array.from(set).sort((a, b) => (a < b ? 1 : -1));
    setMonths(list);
  };

  const loadDates = async (month: string) => {
    const list: string[] = [];

    const oldSnap = await getDocs(collection(db, "History"));
    oldSnap.forEach((doc) => {
      if (doc.id.startsWith(month) && doc.id.length === 10) {
        list.push(doc.id);
      }
    });

    try {
      const newSnap = await getDocs(
        collection(db, "History", month, "days")
      );
      newSnap.forEach((doc) => list.push(doc.id));
    } catch {}

    list.sort((a, b) => (a < b ? 1 : -1));
    setDates(list);
    setSelectedMonth(month);
  };

  const loadRecords = async (date: string) => {
    let snap;

    if (selectedMonth) {
      snap = await getDocs(
        collection(db, "History", selectedMonth, "days", date, "logs")
      );
    }

    if (!snap || snap.empty) {
      snap = await getDocs(collection(db, "History", date, "logs"));
    }

    const list: any[] = [];
    snap.forEach((doc) => list.push(doc.data()));

    setRecords(list);
    setSelectedDate(date);

    // 🔥 IMPORTANT: enables print button ONLY here
    router.setParams({
      selectedDate: date,
      records: list, // 🔥 THIS IS THE MISSING PIECE
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f4f6f8" }}>

      {!selectedMonth && (
        <FlatList
          data={months}
          keyExtractor={(item) => item}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => loadDates(item)}
              style={{
                backgroundColor: "#ffffff",
                padding: 16,
                borderRadius: 14,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: "#e5e7eb",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>
                {formatMonth(item)}
              </Text>
            </Pressable>
          )}
        />
      )}

      {selectedMonth && !selectedDate && (
        <FlatList
          data={dates}
          keyExtractor={(item) => item}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => loadRecords(item)}
              style={{
                backgroundColor: "#ffffff",
                padding: 16,
                borderRadius: 14,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: "#e5e7eb",
              }}
            >
              <Text style={{ fontSize: 14, color: "#374151" }}>
                {formatDate(item)}
              </Text>
            </Pressable>
          )}
        />
      )}

      {selectedDate && (
        <FlatList
          data={records}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => {
            const isOut = !!item.OUT;

            return (
              <View
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 18,
                  marginBottom: 14,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                }}
              >
                <View
                  style={{
                    backgroundColor: isOut ? "#fee2e2" : "#dcfce7",
                    padding: 14,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontWeight: "700", color: isOut ? "#991b1b" : "#065f46" }}>
                    {item.name}
                  </Text>

                  <Text style={{ fontSize: 12, fontWeight: "700", color: isOut ? "#dc2626" : "#16a34a" }}>
                    {isOut ? "OUT" : "IN"}
                  </Text>
                </View>

                <View style={{ padding: 14 }}>
                  <Text style={{ color: "#6b7280", fontSize: 13 }}>
                    Employee ID: {item.employeeno}
                  </Text>

                  <View style={{ flexDirection: "row", marginTop: 12 }}>
                    <View style={{ flex: 1, backgroundColor: "#f9fafb", padding: 10, borderRadius: 10, marginRight: 6 }}>
                      <Text style={{ fontSize: 11, color: "#9ca3af" }}>IN</Text>
                      <Text style={{ fontWeight: "600" }}>
                        {item.IN ? formatTime(item.IN) : "-"}
                      </Text>
                    </View>

                    <View style={{ flex: 1, backgroundColor: "#f9fafb", padding: 10, borderRadius: 10, marginLeft: 6 }}>
                      <Text style={{ fontSize: 11, color: "#9ca3af" }}>OUT</Text>
                      <Text style={{ fontWeight: "600" }}>
                        {item.OUT ? formatTime(item.OUT) : "-"}
                      </Text>
                    </View>
                  </View>

                  {item.items?.length > 0 && (
                    <View style={{ marginTop: 12, backgroundColor: "#f9fafb", padding: 12, borderRadius: 12 }}>
                      <Text style={{ fontSize: 12, color: "#6b7280", marginBottom: 8, fontWeight: "600" }}>
                        Items
                      </Text>

                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                        {item.items.map((i: string, idx: number) => (
                          <View key={idx} style={{ backgroundColor: "#e5e7eb", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                            <Text style={{ fontSize: 12, color: "#111827" }}>{i}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}