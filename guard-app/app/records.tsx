import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../firebase.js";
import { styles } from "../styles/recordsStyles";

export default function RecordsScreen() {
  const [months, setMonths] = useState<string[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [records, setRecords] = useState<any[]>([]);

  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    loadMonths();
  }, []);

  // 🔥 LOAD MONTHS (supports OLD + NEW)
  const loadMonths = async () => {
    try {
      const snap = await getDocs(collection(db, "History"));

      const monthSet = new Set<string>();

      snap.forEach((doc) => {
        const id = doc.id;

        // OLD structure (2026-04-20)
        if (id.length === 10) {
          monthSet.add(id.slice(0, 7));
        } else {
          // NEW structure (2026-04)
          monthSet.add(id);
        }
      });

      const list = Array.from(monthSet);
      list.sort((a, b) => (a < b ? 1 : -1));

      setMonths(list);
      console.log("📅 Months:", list);
    } catch (e) {
      console.log("❌ Month error:", e);
    }
  };

  // 🔥 LOAD DATES (supports BOTH structures)
  const loadDates = async (month: string) => {
    try {
      const list: string[] = [];

      // OLD structure
      const oldSnap = await getDocs(collection(db, "History"));
      oldSnap.forEach((doc) => {
        const id = doc.id;
        if (id.startsWith(month) && id.length === 10) {
          list.push(id);
        }
      });

      // NEW structure
      try {
        const newSnap = await getDocs(
          collection(db, "History", month, "days")
        );

        newSnap.forEach((doc) => {
          list.push(doc.id);
        });
      } catch {}

      list.sort((a, b) => (a < b ? 1 : -1));

      setDates(list);
      setSelectedMonth(month);

      console.log("📆 Dates:", list);
    } catch (e) {
      console.log("❌ Date error:", e);
    }
  };

  // 🔥 LOAD RECORDS (supports BOTH)
  const loadRecords = async (date: string) => {
    try {
      let snap;

      // TRY NEW
      if (selectedMonth) {
        snap = await getDocs(
          collection(db, "History", selectedMonth, "days", date, "logs")
        );
      }

      // FALLBACK OLD
      if (!snap || snap.empty) {
        snap = await getDocs(collection(db, "History", date, "logs"));
      }

      const list: any[] = [];
      snap.forEach((doc) => list.push(doc.data()));

      setRecords(list);
      setSelectedDate(date);

      console.log("👥 Records:", list);
    } catch (e) {
      console.log("❌ Records error:", e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Records</Text>

      {/* BACK */}
      {(selectedMonth || selectedDate) && (
        <Pressable
          style={styles.backBtn}
          onPress={() => {
            if (selectedDate) {
              setSelectedDate(null);
              setRecords([]);
            } else {
              setSelectedMonth(null);
              setDates([]);
            }
          }}
        >
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
      )}

      {/* MONTHS */}
      {!selectedMonth && (
        <FlatList
          data={months}
          keyExtractor={(item) => item}
          style={styles.list}
          ListEmptyComponent={
            <Text style={{ color: "#9ca3af" }}>No records yet</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.dateCard}
              onPress={() => loadDates(item)}
            >
              <Text style={styles.dateText}>{item}</Text>
            </Pressable>
          )}
        />
      )}

      {/* DATES */}
      {selectedMonth && !selectedDate && (
        <FlatList
          data={dates}
          keyExtractor={(item) => item}
          style={styles.list}
          ListEmptyComponent={
            <Text style={{ color: "#9ca3af" }}>No days yet</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.dateCard}
              onPress={() => loadRecords(item)}
            >
              <Text style={styles.dateText}>{item}</Text>
            </Pressable>
          )}
        />
      )}

      {/* RECORDS */}
      {selectedDate && (
        <FlatList
          data={records}
          keyExtractor={(_, i) => i.toString()}
          style={styles.list}
          ListEmptyComponent={
            <Text style={{ color: "#9ca3af" }}>
              No records for this date
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.recordCard}>
              <Text style={styles.name}>{item.name}</Text>

              <Text style={styles.subText}>
                ID: {item.employeeno}
              </Text>

              <Text style={styles.inText}>
                IN: {item.IN ? new Date(item.IN).toLocaleString() : "-"}
              </Text>

              <Text style={styles.outText}>
                OUT: {item.OUT ? new Date(item.OUT).toLocaleString() : "-"}
              </Text>

              <Text style={styles.itemsHeader}>Items:</Text>

              {item.items?.map((i: string, idx: number) => (
                <Text key={idx} style={styles.item}>
                  • {i}
                </Text>
              ))}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}