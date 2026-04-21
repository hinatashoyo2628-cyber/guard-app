import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fb",
  },

  navbar: {
    height: 75,
    backgroundColor: "#1f3f5b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  title: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
  },

  attendanceText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1f3f5b",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },

  dropdown: {
    position: "absolute",
    top: 80,
    right: 20,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 10,
    width: 170,
    elevation: 10,
    zIndex: 10,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },

  menuText: {
    fontSize: 14,
    color: "#334155",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  statusText: {
    fontSize: 16,
    color: "#64748b",
  },

  // 🔥 CARD
  employeeContainer: {
    width: "100%",
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 26,

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },

  employeeName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1f3f5b",
  },

  employeeId: {
    marginTop: 6,
    fontSize: 14,
    color: "#64748b",
  },

  timeText: {
    marginTop: 8,
    fontSize: 13,
    color: "#94a3b8",
  },

  itemsHeader: {
    marginTop: 22,
    fontSize: 16,
    fontWeight: "700",
    color: "#1f3f5b",
  },

  itemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginTop: 12,
  },

  itemText: {
    fontSize: 15,
    color: "#334155",
  },

  removeText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "700",
  },

  addRow: {
    flexDirection: "row",
    marginTop: 14,
    gap: 10,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },

  addBtn: {
    backgroundColor: "#2f6f9f",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 14,
  },

  addText: {
    color: "#fff",
    fontWeight: "700",
  },

  editBtn: {
  marginTop: 18,
  backgroundColor: "#2f6f9f", // corporate blue
  paddingVertical: 14,
  borderRadius: 12,
  alignItems: "center",
},

confirmBtn: {
  marginTop: 14,
  backgroundColor: "#1f3f5b", // darker main brand
  paddingVertical: 15,
  borderRadius: 12,
  alignItems: "center",
},

editText: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 15,
},

confirmText: {
  color: "#ffffff",
  fontSize: 16,
  fontWeight: "700",
},
});