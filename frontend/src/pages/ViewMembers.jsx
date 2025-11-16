import { useState, useEffect } from "react";
import "../styles/theme.css";
import "../styles/ViewMembers.css";
import API from "../services/axiosClient";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const res = await API.get("/members/all");
      setMembers(res.data);
    } catch (err) {
      console.error("Failed to load members", err);
    }
  };

  const addMember = async () => {

    if (!name.trim()) {
      alert("Enter a member name");
      return;
    }
    if (!email.trim()) {
      alert("Enter a member email");
      return;
    }

    try {
      await API.post("/members/add", {
        name,
        email
      });

      setName("");
      setEmail("");
      loadMembers();
    } catch (err) {
      alert("Failed to add member");
      console.error(err);
    }
  };

  const removeMember = async (id) => {
    try {
      await API.delete(`/members/delete/${id}`);
      loadMembers();
    } catch (err) {
      alert("Failed to remove member");
    }
  };

  return (
    <div className="theme-root">
      <div className="members-container">

        <h1 className="members-title">Group Members</h1>
        <p className="members-subtitle">Manage people in your expense group.</p>

        {/* INPUT SECTION */}
        <div className="member-input-row">

          <input
            className="member-input"
            placeholder="Enter member name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="member-input"
            type="email"
            placeholder="Enter member email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button className="add-btn" onClick={addMember}>
            Add Member
          </button>
        </div>

        {/* MEMBER LIST */}
        <div className="members-list">
          {members.map((m) => (
            <div key={m.id} className="member-card">
              <div>
                <div className="member-name">{m.name}</div>
                <div className="member-email">{m.email}</div>
              </div>

              <button
                className="remove-btn"
                onClick={() => removeMember(m.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
