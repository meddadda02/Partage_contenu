import { useState, useEffect } from "react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    bio: "",
    password: "",
    photo: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("No access token found.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:8000/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user data");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load user data.");
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");

    const data = new FormData();
    data.append("email", formData.email);
    data.append("bio", formData.bio);
    data.append("New_password", formData.password);
    if (formData.photo) data.append("photo", formData.photo);

    try {
      const response = await fetch("http://localhost:8000/user/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!response.ok) throw new Error("Failed to update user");

      const result = await response.json();
      setUser(result.user);
      setIsEditing(false);
    } catch {
      setError("Failed to update profile.");
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("access_token");
    if (!window.confirm("Are you sure you want to delete your account?")) return;

    try {
      const res = await fetch("http://localhost:8000/user/me", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete account");

      alert("Account deleted.");
      window.location.href = "/login";
    } catch {
      setError("Failed to delete account.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!user) return <div>No user data found.</div>;

  const photoUrl = user.photo || "https://via.placeholder.com/140";

  return (
    <>
      <style>
        {`
          .profile-container {
            max-width: 600px;
            margin: auto;
            padding: 30px;
            font-family: Arial, sans-serif;
            background-color: #fff;
            border-radius: 16px;
            box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
          }

          .profile-img {
            width: 140px;
            height: 140px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid #fff;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .button {
            padding: 10px 24px;
            font-size: 1rem;
            border: none;
            border-radius: 24px;
            cursor: pointer;
            margin: 10px;
          }

          .btn-edit {
            background-color: #0095f6;
            color: white;
          }

          .btn-delete {
            background-color: #e60000;
            color: white;
          }

          .btn-save {
            background-color: #28a745;
            color: white;
          }

          .input-field {
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #ccc;
            width: 100%;
          }

          .input-label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
          }

          .error-message {
            color: red;
            text-align: center;
          }
        `}
      </style>

      <div className="profile-container">
        <h1 style={{ textAlign: "center" }}>Your Profile</h1>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img
            src={photoUrl}
            alt="Profile"
            className="profile-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/140";
            }}
          />
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Bio:</strong> {user.bio || "No bio set."}</p>
        </div>

        <div style={{ textAlign: "center" }}>
          <button className="button btn-edit" onClick={() => {
            setFormData({
              email: user.email || "",
              bio: user.bio || "",
              password: "",
              photo: null,
            });
            setIsEditing(true);
          }}>
            Edit Profile
          </button>

          <button className="button btn-delete" onClick={handleDelete}>
            Delete Account
          </button>
        </div>

        {isEditing && (
          <form onSubmit={handleUpdate} style={{ marginTop: "20px" }}>
            <div>
              <label className="input-label">Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="input-label">Bio:</label>
              <input
                type="text"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label">New Password:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label">Profile Photo:</label>
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleChange}
                style={{ marginBottom: "10px" }}
              />
            </div>
            <button type="submit" className="button btn-save">
              Save Changes
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default Profile;
