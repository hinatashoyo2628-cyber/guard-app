import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../firebase.js";
import { styles } from "../../styles/styles";

export default function HomeScreen() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [status, setStatus] = useState("Waiting for scan...");
  const [employee, setEmployee] = useState<any>(null);

  const [editing, setEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  const [scanTime, setScanTime] = useState("");

  const [currentUID, setCurrentUID] = useState("");

  // 🔥 NEW
  const [attendanceCount, setAttendanceCount] = useState(0);
  const TOTAL_EMPLOYEES = 9;
  const router = useRouter();

  const scanningRef = useRef(false);

  useEffect(() => {
    NfcManager.start();
    scanNfc();
    getTodayAttendanceCount(); // 🔥 load count

    return () => {
      try {
        NfcManager.cancelTechnologyRequest();
      } catch {}
    };
  }, []);

  // 🔥 COUNT FUNCTION
  const getTodayAttendanceCount = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const logsRef = collection(db, "History", today, "logs");
      const snap = await getDocs(logsRef);

      let count = 0;

      snap.forEach((doc) => {
        const data = doc.data();
        if (data.IN) count++;
      });

      setAttendanceCount(count);
      return count;
    } catch (e) {
      console.log("❌ Count error:", e);
      return 0;
    }
  };

  const scanNfc = async () => {
    if (scanningRef.current) return;

    scanningRef.current = true;

    try {
      setStatus("Tap NFC card...");

      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();

      if (!tag || !tag.ndefMessage) {
        scanningRef.current = false;
        setTimeout(scanNfc, 1500);
        return;
      }

      const payload = tag.ndefMessage[0].payload;
      const uid = String.fromCharCode(...payload).slice(3);

      console.log("✅ UID:", uid);

      setCurrentUID(uid);

      const now = new Date().toLocaleString();
      setScanTime(now);

      await fetchEmployee(uid);

    } catch (ex) {
      console.log("❌ NFC Error:", ex);
    } finally {
      try {
        await NfcManager.cancelTechnologyRequest();
      } catch {}
      scanningRef.current = false;
    }
  };

  const fetchEmployee = async (uid: string) => {
    try {
      const ref = doc(db, "employees", uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        setEmployee(data);
        setEditedItems(data.items || []);
        setStatus("Employee Found");
      } else {
        setStatus("No employee found");
      }
    } catch (e) {
      console.log("❌ Fetch error:", e);
      setStatus("Error fetching data");
    }
  };

  const removeItem = (index: number) => {
    setEditedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    setEditedItems((prev) => [...prev, newItem]);
    setNewItem("");
  };

  // 🔥 MAIN LOGIC (UPDATED)
  const handleConfirm = async () => {
  try {
    if (!currentUID) return;

    const today = new Date().toISOString().split("T")[0]; // 2026-04-20
    const month = today.slice(0, 7); // 2026-04
    const now = new Date().toISOString();

    // ✅ FIX: CREATE MONTH DOCUMENT
    await setDoc(
      doc(db, "History", month),
      { createdAt: now },
      { merge: true }
    );

    // ✅ FIX: CREATE DAY DOCUMENT
    await setDoc(
      doc(db, "History", month, "days", today),
      { createdAt: now },
      { merge: true }
    );

    // ✅ YOUR EXISTING LOG PATH (UNCHANGED)
    const historyRef = doc(
      db,
      "History",
      month,
      "days",
      today,
      "logs",
      currentUID
    );

    const employeeRef = doc(db, "employees", currentUID);

    const snap = await getDoc(historyRef);

    if (!snap.exists()) {
      await setDoc(historyRef, {
        name: employee.name,
        employeeno: employee.employeeno,
        items: editedItems,
        IN: now,
        OUT: null,
        attendanceNo: Date.now(),
      });

      alert("Time IN recorded");
    } else {
      const data = snap.data();

      if (!data.OUT) {
        await updateDoc(historyRef, {
          OUT: now,
          items: editedItems,
        });

        alert("Time OUT recorded");
      } else {
        alert("Employee already timed OUT today");
        return;
      }
    }

    // ✅ KEEP THIS
    await updateDoc(employeeRef, {
      items: editedItems,
    });

  } catch (e) {
    console.log("❌ Save error:", e);
  }

  scanningRef.current = false;
  setEmployee(null);
  setEditing(false);
  setStatus("Waiting for scan...");

  setTimeout(scanNfc, 300);
};

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔥 NAVBAR UPDATED */}
      <View style={styles.navbar}>
        <Text style={styles.title}>Guard App</Text>

        <Text style={styles.attendanceText}>
          {attendanceCount} / {TOTAL_EMPLOYEES}
        </Text>

        <Pressable onPress={() => setMenuOpen(!menuOpen)}>
          <Ionicons name="menu" size={26} color="#111827" />
        </Pressable>
      </View>

      {menuOpen && (
        <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)}>
          <BlurView intensity={40} style={styles.overlay} />
        </Pressable>
      )}

      {menuOpen && (
          <View style={styles.dropdown}>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                console.log("👉 Navigate to Records");
                setMenuOpen(false);
                router.push("/records"); // ✅ FIXED
              }}
            >
              <Ionicons name="document-text-outline" size={18} />
              <Text style={styles.menuText}>Records</Text>
            </Pressable>

            <Pressable style={styles.menuItem}>
              <Ionicons name="settings-outline" size={18} />
              <Text style={styles.menuText}>Settings</Text>
            </Pressable>
          </View>
        )}

      <View style={styles.content}>
        {!employee ? (
          <Text style={styles.statusText}>{status}</Text>
        ) : (
          <View style={styles.employeeContainer}>
            <Text style={styles.employeeName}>{employee.name}</Text>

            <Text style={styles.employeeId}>
              Employee No: {employee.employeeno}
            </Text>

            <Text style={styles.timeText}>🕒 {scanTime}</Text>

            <Text style={styles.itemsHeader}>Items:</Text>

            {editing ? (
              <>
                {editedItems.map((item, index) => (
                  <View key={index} style={styles.itemCard}>
                    <Text style={styles.itemText}>{item}</Text>

                    <Pressable onPress={() => removeItem(index)}>
                      <Text style={styles.removeText}>✕</Text>
                    </Pressable>
                  </View>
                ))}

                <View style={styles.addRow}>
                  <TextInput
                    value={newItem}
                    onChangeText={setNewItem}
                    placeholder="Add item"
                    style={styles.input}
                  />

                  <Pressable style={styles.addBtn} onPress={addItem}>
                    <Text style={styles.addText}>Add</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              editedItems.map((item, index) => (
                <View key={index} style={styles.itemCard}>
                  <Text style={styles.itemText}>{item}</Text>
                </View>
              ))
            )}

            {editing ? (
              <Pressable
                style={styles.confirmBtn}
                onPress={() => setEditing(false)}
              >
                <Text style={styles.confirmText}>Done Editing</Text>
              </Pressable>
            ) : (
              <>
                <Pressable
                  style={styles.editBtn}
                  onPress={() => setEditing(true)}
                >
                  <Text style={styles.editText}>Edit Items</Text>
                </Pressable>

                <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
                  <Text style={styles.confirmText}>Confirm</Text>
                </Pressable>
              </>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}