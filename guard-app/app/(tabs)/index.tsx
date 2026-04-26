import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View
} from "react-native";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../firebase.js";
import { styles } from "../../styles/styles";

export default function HomeScreen() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [employee, setEmployee] = useState<any>(null);
  // 🔥 ADD THIS STATE
const [showSuccess, setShowSuccess] = useState(false);
const successAnim = useRef(new Animated.Value(0)).current;
const [confirmLoading, setConfirmLoading] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  const [scanTime, setScanTime] = useState("");

  const [currentUID, setCurrentUID] = useState("");
  const [attendanceCount, setAttendanceCount] = useState(0);
  const TOTAL_EMPLOYEES = 9;

  const [screenState, setScreenState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const router = useRouter();
  const scanningRef = useRef(false);

  const getTodayInfo = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    return { today, month: today.slice(0, 7) };
  }, []);

  const resetEmployeeState = useCallback(() => {
    setEmployee(null);
    setEditing(false);
    setEditedItems([]);
    setNewItem("");
    setCurrentUID("");
    setScanTime("");
  }, []);

  const getTodayAttendanceCount = useCallback(async () => {
    try {
      const { today, month } = getTodayInfo();

      const snap = await getDocs(
        collection(db, "History", month, "days", today, "logs")
      );

      let count = 0;
      snap.forEach((docSnap) => {
        if (docSnap.data().IN) count++;
      });

      setAttendanceCount(count);
    } catch (error) {
      console.log("❌ Attendance count error:", error);
    }
  }, [getTodayInfo]);

  const fetchEmployee = useCallback(
    async (uid: string) => {
      try {
        const empSnap = await getDoc(doc(db, "employees", uid));

        if (!empSnap.exists()) {
          setEmployee(null);
          setEditedItems([]);
          setScreenState("error");
          scanningRef.current = false;
          return;
        }

        const data = empSnap.data();
        const { today, month } = getTodayInfo();

        const historyRef = doc(
          db,
          "History",
          month,
          "days",
          today,
          "logs",
          uid
        );

        const historySnap = await getDoc(historyRef);

        if (historySnap.exists() && historySnap.data().OUT) {
          setScreenState("error");
          setEmployee(null);
          setEditedItems([]);
          scanningRef.current = false;
          return;
        }

        setEmployee(data);
        setEditedItems(data.items || []);
        setScreenState("success");
        scanningRef.current = false;
      } catch (error) {
        console.log("❌ Fetch employee error:", error);
        setEmployee(null);
        setEditedItems([]);
        setScreenState("error");
        scanningRef.current = false;
      }
    },
    [getTodayInfo]
  );

  const scanNfc = useCallback(async () => {
    if (scanningRef.current) return;

    scanningRef.current = true;
    setScreenState("idle");

    try {
      await NfcManager.cancelTechnologyRequest().catch(() => {});
      await NfcManager.requestTechnology(NfcTech.Ndef);

      const tag = await NfcManager.getTag();

      if (!tag?.ndefMessage) {
        scanningRef.current = false;
        return;
      }

      setScreenState("loading");

      const payload = tag.ndefMessage[0]?.payload;

      if (!payload) {
        scanningRef.current = false;
        setScreenState("error");
        return;
      }

      const uid = String.fromCharCode(...payload).slice(3);

      setCurrentUID(uid);
      setScanTime(new Date().toLocaleString());

      await fetchEmployee(uid);
    } catch (e) {
      console.log("❌ NFC Error:", e);
      setScreenState("idle");
      scanningRef.current = false;
    } finally {
      try {
        await NfcManager.cancelTechnologyRequest();
      } catch {}
    }
  }, [fetchEmployee]);

  useEffect(() => {
    NfcManager.start();
    scanNfc();
    getTodayAttendanceCount();

    return () => {
      try {
        NfcManager.cancelTechnologyRequest();
      } catch {}
    };
  }, [scanNfc, getTodayAttendanceCount]);

  useEffect(() => {
    if (employee) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [employee, fadeAnim]);

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    if (screenState === "idle") {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }

    return () => {
      if (animation) animation.stop();
    };
  }, [screenState, pulseAnim]);

  const addItem = useCallback(() => {
    const trimmed = newItem.trim();
    if (!trimmed) return;

    setEditedItems((prev) => [...prev, trimmed]);
    setNewItem("");
  }, [newItem]);

  const removeItem = useCallback((index: number) => {
    setEditedItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

 const handleConfirm = useCallback(async () => {
  if (!employee || !currentUID || confirmLoading) return;

  setConfirmLoading(true);

  try {
    const { today, month } = getTodayInfo();
    const now = new Date().toISOString();

    const dateRef = doc(db, "History", month, "days", today);
    await setDoc(dateRef, { createdAt: now }, { merge: true });

    const historyRef = doc(
      db,
      "History",
      month,
      "days",
      today,
      "logs",
      currentUID
    );

    const snap = await getDoc(historyRef);

    if (!snap.exists()) {
      const logsSnap = await getDocs(
        collection(db, "History", month, "days", today, "logs")
      );

      let attendanceNo = 1;

      logsSnap.forEach((docSnap) => {
        if (docSnap.data().IN) attendanceNo++;
      });

      await setDoc(historyRef, {
        name: employee.name,
        employeeno: employee.employeeno,
        position: employee.position || "", // ✅ ADD THIS
        items: editedItems,
        IN: now,
        OUT: null,
        attendanceNo,
      });
    } else {
      await updateDoc(historyRef, {
        OUT: now,
        items: editedItems,
      });
    }

    await updateDoc(doc(db, "employees", currentUID), {
      items: editedItems,
    });

    await getTodayAttendanceCount();

    // ✅ SHOW CUSTOM POPUP
    setShowSuccess(true);
    Animated.timing(successAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(successAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowSuccess(false));
    }, 1500);

    resetEmployeeState();
    setScreenState("idle");
    scanNfc();
  } catch (error) {
    console.log("❌ Confirm error:", error);
  } finally {
    setConfirmLoading(false);
  }
}, [
  employee,
  currentUID,
  editedItems,
  getTodayInfo,
  getTodayAttendanceCount,
  resetEmployeeState,
  scanNfc,
  confirmLoading,
]);

  const handleScanAgain = useCallback(() => {
    resetEmployeeState();
    setScreenState("idle");
    scanNfc();
  }, [resetEmployeeState, scanNfc]);

  return (
    <View style={{ flex: 1, backgroundColor: "#1f3f5b" }}>
      <SafeAreaView style={{ backgroundColor: "#1f3f5b" }}>
        <StatusBar backgroundColor="#1f3f5b" barStyle="light-content" />
        <ExpoStatusBar style="light" backgroundColor="#1f3f5b" />

        <View style={styles.navbar}>
          
          <Text style={styles.title}>Guard App</Text>

          <Text style={styles.attendanceText}>
            Attendance Count: {attendanceCount} / {TOTAL_EMPLOYEES}
          </Text>

          <Pressable onPress={() => setMenuOpen(!menuOpen)}>
            <Ionicons name="menu" size={26} color="#fff" />
          </Pressable>
        </View>
        

        
      </SafeAreaView>

     <KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : "height"}
>
  <SafeAreaView
    style={[
      { flex: 1 },
      screenState === "idle" && { backgroundColor: "#bbf7d0" },
      screenState === "loading" && { backgroundColor: "#dcfce7" },
      screenState === "success" && { backgroundColor: "#f4f7fb" },
      screenState === "error" && { backgroundColor: "#fecaca" },
    ]}
  >
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
        {!employee && screenState === "idle" && (
          <View style={styles.content}>
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim }],
                backgroundColor: "#fff",
                padding: 30,
                borderRadius: 100,
              }}
            >
              <Ionicons name="scan-outline" size={50} color="#16a34a" />
            </Animated.View>

            <Text style={{ marginTop: 20, fontSize: 20, fontWeight: "700" }}>
              Tap NFC Card
            </Text>
          </View>
        )}

        {screenState === "loading" && (
          <View style={styles.content}>
            <View
              style={{
                backgroundColor: "#fff",
                paddingVertical: 30,
                paddingHorizontal: 40,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                minWidth: 220,
              }}
            >
              <ActivityIndicator size="large" color="#16a34a" />
              <Text
                style={{
                  marginTop: 15,
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#166534",
                }}
              >
                Reading card...
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  fontSize: 14,
                  color: "#4b5563",
                  textAlign: "center",
                }}
              >
                Fetching employee data
              </Text>
            </View>
          </View>
        )}

        {screenState === "error" && (
          <View style={styles.content}>
            <Text style={{ fontSize: 22, fontWeight: "800" }}>
              ❌ Card Already OUT
            </Text>

            <Pressable
              onPress={handleScanAgain}
              style={[
                styles.confirmBtn,
                { marginTop: 20, backgroundColor: "#dc2626" },
              ]}
            >
              <Text style={styles.confirmText}>Scan Again</Text>
            </Pressable>
          </View>
        )}

        {employee && screenState === "success" && (
          <View style={styles.content}>
            <Animated.View
              style={[styles.employeeContainer, { opacity: fadeAnim }]}
            >
              <Text style={styles.employeeName}>{employee.name}</Text>

              <Text style={styles.employeeId}>
                Employee No: {employee.employeeno}
              </Text>

              {editedItems.map((item, i) => (
                <View
                  key={`${item}-${i}`}
                  style={[
                    styles.itemCard,
                    {
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    },
                  ]}
                >
                  <Text>{item}</Text>

                  {editing && (
                    <Pressable onPress={() => removeItem(i)}>
                      <Text style={{ marginLeft: 10, color: "red" }}>✕</Text>
                    </Pressable>
                  )}
                </View>
              ))}

              {editing && (
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 10,
                    alignItems: "center",
                  }}
                >
                  <TextInput
                    value={newItem}
                    onChangeText={setNewItem}
                    placeholder="Add item"
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      padding: 8,
                      borderRadius: 8,
                    }}
                  />

                  <Pressable
                    onPress={addItem}
                    style={{
                      marginLeft: 10,
                      backgroundColor: "#16a34a",
                      padding: 10,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: "#fff" }}>Add</Text>
                  </Pressable>
                </View>
              )}

              {editing ? (
                <Pressable
                  style={styles.confirmBtn}
                  onPress={() => setEditing(false)}
                >
                  <Text style={styles.confirmText}>Done Editing</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={styles.confirmBtn}
                  onPress={() => setEditing(true)}
                >
                  <Text style={styles.confirmText}>Edit Items</Text>
                </Pressable>
              )}

             <Pressable
  style={[styles.confirmBtn, confirmLoading && { opacity: 0.6 }]}
  onPress={handleConfirm}
  disabled={confirmLoading}
>
  {confirmLoading ? (
    <ActivityIndicator color="#fff" />
  ) : (
    <Text style={styles.confirmText}>Confirm</Text>
  )}
</Pressable>
            </Animated.View>
          </View>
        )}
        </ScrollView>
  </SafeAreaView>
</KeyboardAvoidingView>
{/* ✅ MOVE MENU HERE */}
{menuOpen && (
  <View
    style={{
      position: "absolute",
      top: 90,
      right: 20,
      backgroundColor: "#fff",
      padding: 15,
      borderRadius: 10,
      zIndex: 99999,
      elevation: 20,
    }}
  >
    <Pressable
  onPress={() => {
    setMenuOpen(false);
    router.push("/records");
  }}
  style={{
    flexDirection: "row", // ✅ important
    alignItems: "center",
    paddingVertical: 8,
  }}
>
  <Ionicons name="document-text-outline" size={18} color="#333" />

  <Text style={{ fontSize: 16, marginLeft: 10 }}>
    Records
  </Text>
</Pressable>
  </View>
)}

{showSuccess && (
  <Animated.View
    style={{
      position: "absolute",
      top: 100,
      alignSelf: "center",
      backgroundColor: "#16a34a",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 20,
      flexDirection: "row",
      alignItems: "center",
      opacity: successAnim,
      transform: [
        {
          translateY: successAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-20, 0],
          }),
        },
      ],
    }}
  >
    <Ionicons name="checkmark-circle" size={18} color="#fff" />
    <Text style={{ color: "#fff", marginLeft: 8, fontWeight: "600" }}>
      Success
    </Text>
  </Animated.View>
)}
    </View>
  );
}