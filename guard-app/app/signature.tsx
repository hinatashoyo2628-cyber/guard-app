import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    Text,
    View,
} from "react-native";
import SignatureScreen from "react-native-signature-canvas";
import { fillAndPrintPdf } from "../utils/fillPdf";

import { collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function SignaturePage() {
  const router = useRouter();
  const { records, date } = useLocalSearchParams();

  const signatureRef = useRef<any>(null);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  let parsedRecords: any[] = [];

  try {
    parsedRecords = JSON.parse(records as string);
  } catch {}

  useEffect(() => {
    let interval: any;

    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? prev : prev + 10));
      }, 200);
    }

    return () => clearInterval(interval);
  }, [loading]);

  const handleOK = async (signature: string) => {
    if (loading) return;

    setLoading(true);

    try {
      if (!date) return;

      const month = (date as string).slice(0, 7);

      const snap = await getDocs(
        collection(db, "History", month, "days", date as string, "logs")
      );

      for (const d of snap.docs) {
        await updateDoc(d.ref, { signature });
      }

      const updated = parsedRecords.map((r) => ({
        ...r,
        signature,
      }));

      setProgress(95);

      await fillAndPrintPdf(updated);

      setProgress(100);

      router.back();
    } catch (e) {
      console.log("❌ Signature save error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (!loading) signatureRef.current?.clearSignature();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#1f3f5b" }}>
      
      {/* 🔥 SPOTLIGHT LAYOUT (NO OVERLAY ON TOP) */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        
        {/* OUTSIDE DARK AREA */}
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0,0,0,0.65)",
          }}
        />

        {/* SIGN BOX */}
        <View
          style={{
            width: "90%",
            height: 260,
            backgroundColor: "#fff",
            borderRadius: 20,
            borderWidth: 3,
            borderColor: "#1f3f5b",
            overflow: "hidden",
            zIndex: 2, // 🔥 ABOVE DARK BG
          }}
        >
          <SignatureScreen
            ref={signatureRef}
            onOK={handleOK}
            penColor="black"
            minWidth={2.5}
            maxWidth={4}
            webStyle={`
              .m-signature-pad--footer {display: none;}
              body,html {
                margin:0;
                padding:0;
                background:#fff;
              }
            `}
          />
        </View>
      </View>

      {/* 🔥 BUTTONS */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          paddingVertical: 20,
          backgroundColor: "#f8fafc",
        }}
      >
        <Pressable
          onPress={handleClear}
          style={{
            backgroundColor: "#ef4444",
            paddingVertical: 16,
            paddingHorizontal: 40,
            borderRadius: 16,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
            Clear
          </Text>
        </Pressable>

        <Pressable
          onPress={() => signatureRef.current?.readSignature()}
          style={{
            backgroundColor: "#1f3f5b",
            paddingVertical: 16,
            paddingHorizontal: 40,
            borderRadius: 16,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
            Print
          </Text>
        </Pressable>
      </View>

      {/* 🔥 LOADING (BLOCKS ALL TOUCH) */}
      {loading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 30,
              borderRadius: 20,
              alignItems: "center",
              width: 220,
            }}
          >
            <ActivityIndicator size="large" color="#1f3f5b" />

            <Text style={{ marginTop: 15, fontWeight: "700" }}>
              Processing...
            </Text>

            <Text style={{ marginTop: 5 }}>{progress}%</Text>
          </View>
        </View>
      )}
    </View>
  );
}