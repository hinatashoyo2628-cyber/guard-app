import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, getDocs, updateDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import SignatureScreen from "react-native-signature-canvas";
import { db } from "../firebase";
import { fillAndPrintPdf } from "../utils/fillPdf";

export default function SignaturePage() {
  const router = useRouter();
  const { records, date } = useLocalSearchParams();

  const signatureRef = useRef<any>(null);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [signatureReady, setSignatureReady] = useState(false);
  const [signatureKey, setSignatureKey] = useState(0);

  let parsedRecords: any[] = [];

  try {
    parsedRecords = JSON.parse(records as string);
    console.log("📦 Parsed records:", parsedRecords.length);
  } catch (e) {
    console.log("❌ Failed to parse records:", e);
  }

  useEffect(() => {
    console.log("📄 Signature screen mounted");

    const timer = setTimeout(() => {
      console.log("✅ Signature canvas allowed to render");
      setSignatureReady(true);
      setSignatureKey((prev) => prev + 1);
    }, 600);

    return () => {
      clearTimeout(timer);
      console.log("📄 Signature screen unmounted");
    };
  }, []);

  useEffect(() => {
    let interval: any;

    if (loading) {
      console.log("⏳ Loading started...");
      setProgress(0);

      interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? prev : prev + 10));
      }, 200);
    }

    return () => clearInterval(interval);
  }, [loading]);

  const handleOK = async (signature: string) => {
    if (loading) return;

    if (!signature) {
      console.log("❌ Signature empty");
      return;
    }

    console.log("✍️ Signature captured");

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

      console.log("✅ Done! Going back...");
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

  const reloadSignaturePad = () => {
    setSignatureReady(false);

    setTimeout(() => {
      setSignatureKey((prev) => prev + 1);
      setSignatureReady(true);
    }, 300);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#1f3f5b" }}>

      {/* 🔥 DARK BACKGROUND (DOES NOT BLOCK TOUCH) */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      />

      {/* 🔥 CENTER SIGNATURE BOX */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        
        {!signatureReady ? (
          <View
            style={{
              width: "85%",
              height: 260,
              backgroundColor: "#fff",
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" color="#1f3f5b" />
            <Text style={{ marginTop: 10 }}>Loading signature pad...</Text>
          </View>
        ) : (
          <View
            style={{
              width: "85%",
              height: 260,
              backgroundColor: "#fff",
              borderRadius: 20,
              overflow: "hidden",
              borderWidth: 2,
              borderColor: "#1f3f5b",
            }}
          >
            <SignatureScreen
              key={signatureKey}
              ref={signatureRef}
              onOK={handleOK}
              onBegin={() => console.log("🖊️ Start drawing")}
              onEnd={() => console.log("🛑 End drawing")}
              penColor="black"
              minWidth={2.5}
              maxWidth={4}
              style={{ flex: 1 }}
              webStyle={`
                .m-signature-pad--footer {display: none;}
                .m-signature-pad {
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: #ffffff;
                }
                canvas {
                  background-color: #ffffff;
                }
                body, html {
                  margin: 0;
                  padding: 0;
                  overflow: hidden;
                  touch-action: none;
                }
              `}
              androidLayerType="hardware"
            />
          </View>
        )}
      </View>

      {/* 🔥 BUTTONS */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          paddingVertical: 20,
          backgroundColor: "#ffffff",
        }}
      >
        <Pressable
          onPress={handleClear}
          disabled={loading || !signatureReady}
          style={{
            backgroundColor: "#ef4444",
            paddingVertical: 16,
            paddingHorizontal: 28,
            borderRadius: 16,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            Clear
          </Text>
        </Pressable>

        <Pressable
          onPress={reloadSignaturePad}
          style={{
            backgroundColor: "#64748b",
            paddingVertical: 16,
            paddingHorizontal: 28,
            borderRadius: 16,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            Reload
          </Text>
        </Pressable>

        <Pressable
          onPress={() => signatureRef.current?.readSignature()}
          disabled={loading || !signatureReady}
          style={{
            backgroundColor: "#1f3f5b",
            paddingVertical: 16,
            paddingHorizontal: 28,
            borderRadius: 16,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            Print
          </Text>
        </Pressable>
      </View>

      {/* 🔥 LOADING OVERLAY */}
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
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 10 }}>
            Processing... {progress}%
          </Text>
        </View>
      )}
    </View>
  );
}