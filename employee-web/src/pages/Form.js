import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import "./styles/Form.css";

import { FiPlus, FiTrash2 } from "react-icons/fi";

export default function Form() {
  const [items, setItems] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState(null); // 🔥 NEW

  // 🔥 Detect screen size
  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // 🔥 Load data (UPDATED)
  useEffect(() => {
    const loadData = async () => {
      const docRef = doc(db, "employees", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        setUserData(data); // ✅ STORE NAME + EMPLOYEE NO

        if (data.items) {
          setItems(data.items.map(i => ({
            value: i,
            locked: true,
            showDelete: false
          })));
        }
      }

      setItems(prev => [
        ...prev,
        { value: "", locked: false, showDelete: false }
      ]);
    };

    loadData();
  }, []);

  const handleChange = (value, index) => {
    const updated = [...items];
    updated[index].value = value;
    setItems(updated);
  };

  const saveToFirestore = async (updatedItems) => {
    const filtered = updatedItems
      .filter(i => i.value.trim() !== "")
      .map(i => i.value);

    await setDoc(
      doc(db, "employees", auth.currentUser.uid),
      {
        email: auth.currentUser.email,
        items: filtered,
        updatedAt: new Date()
      },
      { merge: true }
    );
  };

  const handleAdd = async (index) => {
    const updated = [...items];
    updated[index].locked = true;

    updated.push({ value: "", locked: false, showDelete: false });

    setItems(updated);
    await saveToFirestore(updated);
  };

  const handleRemove = async (index) => {
    let updated = items.filter((_, i) => i !== index);

    if (!updated.some(i => !i.locked)) {
      updated.push({ value: "", locked: false, showDelete: false });
    }

    setItems(updated);
    await saveToFirestore(updated);
  };

  // 🔥 Swipe logic (mobile only)
  const handleSwipe = (direction, index) => {
    if (!isMobile) return;

    const updated = items.map((item, i) => ({
      ...item,
      showDelete: direction === "left" && i === index
    }));

    setItems(updated);
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  return (
    <div className="form-container">
      <div className="form-card">

        {/* 🔥 USER HEADER */}
      {userData && (
  <div className="user-bar">
    <div className="user-box">
      <p className="label">Name</p>
      <p className="value">{userData.name}</p>
    </div>

    <div className="user-box">
      <p className="label">ID</p>
      <p className="value">{userData.employeeno}</p>
    </div>

    {/* ✅ NEW POSITION */}
    <div className="user-box">
      <p className="label">Position</p>
      <p className="value">{userData.position}</p>
    </div>
  </div>
)}
        <h2>Item List</h2>

        {items.map((item, index) => {
          let startX = 0;

          return (
            <div
              key={index}
              className="swipe-container"
              onTouchStart={(e) => {
                if (!isMobile || !item.locked || !item.value) return;
                startX = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                if (!isMobile || !item.locked || !item.value) return;

                const endX = e.changedTouches[0].clientX;

                if (startX - endX > 60) handleSwipe("left", index);
                if (endX - startX > 60) handleSwipe("right", index);
              }}
            >
              <div className={`item-row ${item.showDelete ? "swiped" : ""}`}>
                <input
                  type="text"
                  value={item.value}
                  placeholder={`Item ${index + 1}`}
                  onChange={(e) => handleChange(e.target.value, index)}
                  readOnly={item.locked}
                />

                {!item.locked && item.value && (
                  <button
                    className="icon-btn add-btn"
                    onClick={() => handleAdd(index)}
                  >
                    <FiPlus />
                  </button>
                )}

                {/* 💻 PC always show delete */}
                {item.locked && (!isMobile || item.showDelete) && (
                  <button
                    className="swipe-delete"
                    onClick={() => handleRemove(index)}
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}