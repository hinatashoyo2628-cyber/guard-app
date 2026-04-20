import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2f7",
  },

  navbar: {
    height: 70,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },

  title: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // 🔥 NEW ATTENDANCE BADGE
  attendanceText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563eb",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  dropdown: {
    position: "absolute",
    top: 75,
    right: 20,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 8,
    width: 170,
    elevation: 10,
    zIndex: 10,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },

  menuText: {
    fontSize: 14,
    color: "#374151",
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
    color: "#6b7280",
    textAlign: "center",
    opacity: 0.8,
  },

  // 🔥 EMPLOYEE CARD
  employeeContainer: {
    width: "100%",
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 20,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  employeeName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },

  employeeId: {
    marginTop: 6,
    fontSize: 14,
    color: "#6b7280",
  },

  timeText: {
    marginTop: 6,
    fontSize: 12,
    color: "#9ca3af",
  },

  itemsHeader: {
    marginTop: 20,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  // 🔥 ITEM CARD
  itemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 10,
  },

  itemText: {
    fontSize: 15,
    color: "#374151",
  },

  removeText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "700",
  },

  // 🔥 ADD ITEM
  addRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },

  addBtn: {
    backgroundColor: "#10b981",
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: 12,
  },

  addText: {
    color: "#fff",
    fontWeight: "600",
  },

  // 🔥 BUTTONS
  editBtn: {
    marginTop: 15,
    backgroundColor: "#f59e0b",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },

  editText: {
    color: "#fff",
    fontWeight: "600",
  },

  confirmBtn: {
    marginTop: 18,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",

    shadowColor: "#2563eb",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  confirmText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});