import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1f3f5b", // ✅ match home screen
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#ffffff",
  },

  list: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  // 🔷 MONTH & DATE CARDS
  dateCard: {
    backgroundColor: "#2a3c54",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,

    // ✨ premium shadow
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },

  dateText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "600",
  },

  // 🧾 RECORD CARD (WHITE)
  recordCard: {
    backgroundColor: "#f4f7fb",
    padding: 20,
    borderRadius: 20,
    marginBottom: 14,

    // ✨ softer shadow
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  name: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "700",
  },

  subText: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 2,
  },

  timeContainer: {
    marginTop: 10,
  },

  inText: {
    color: "#16a34a",
    fontSize: 14,
    fontWeight: "500",
  },

  outText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "500",
  },

  itemsHeader: {
    color: "#111827",
    marginTop: 12,
    fontWeight: "600",
    fontSize: 14,
  },

  item: {
    color: "#374151",
    fontSize: 13,
    marginLeft: 4,
  },

  emptyText: {
    color: "#cbd5e1",
    textAlign: "center",
    marginTop: 20,
  },
});