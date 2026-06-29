import { useState } from "react";
import { loginUser, registerUser } from "../data/api";
import StatusBar from "../components/StatusBar";

const authTranslations = {
  English: {
    login: "Login",
    register: "Register",
    name: "Full Name",
    email: "Email Address",
    password: "Password",
    welcomeBack: "Welcome Back",
    getStarted: "Create Account",
    welcomeSubtitle: "Explore the cultural pride of Pune 🚩",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    errorOccurred: "An error occurred. Please try again.",
    puneExplorer: "Pune Explorer",
    enterName: "Enter full name",
    enterEmail: "Enter email",
    enterPassword: "Enter password"
  },
  Marathi: {
    login: "लॉगिन",
    register: "नोंदणी",
    name: "पूर्ण नाव",
    email: "ईमेल पत्ता",
    password: "पासवर्ड",
    welcomeBack: "पुन्हा आपले स्वागत आहे",
    getStarted: "खाते तयार करा",
    welcomeSubtitle: "पुण्याच्या सांस्कृतिक वैभवाचा अनुभव घ्या 🚩",
    dontHaveAccount: "खाते नाही का?",
    alreadyHaveAccount: "आधीच खाते आहे का?",
    errorOccurred: "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.",
    puneExplorer: "पुणे एक्सप्लोरर",
    enterName: "पूर्ण नाव प्रविष्ट करा",
    enterEmail: "ईमेल प्रविष्ट करा",
    enterPassword: "पासवर्ड प्रविष्ट करा"
  }
};

export default function AuthScreen({ onAuthSuccess, userLanguage, setUserLanguage }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const t = authTranslations[userLanguage] || authTranslations.English;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const data = await loginUser(email, password);
        onAuthSuccess(data.user);
      } else {
        if (!name) {
          setError(userLanguage === "Marathi" ? "कृपया तुमचे नाव प्रविष्ट करा" : "Please enter your name");
          setLoading(false);
          return;
        }
        const data = await registerUser(name, email, password);
        onAuthSuccess(data.user);
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError(err.message || t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#FBF8F3", height: "100%", display: "flex", flexDirection: "column", justifyCenter: "center", justifyContent: "center", padding: 24, position: "relative" }}>
      <StatusBar light={false} />

      {/* Language Switcher */}
      <div style={{ position: "absolute", top: 16, right: 16, display: "inline-flex", background: "#EDE8DF", borderRadius: 10, padding: 3 }}>
        {["English", "Marathi"].map(lang => (
          <button
            key={lang}
            onClick={() => setUserLanguage(lang)}
            style={{
              padding: "4px 10px", borderRadius: 8, border: "none", fontSize: 10, fontWeight: 700, cursor: "pointer",
              background: userLanguage === lang ? "#fff" : "none",
              color: userLanguage === lang ? "#8B3A2A" : "#6B5B52",
              transition: "0.2s"
            }}
          >
            {lang === "Marathi" ? "मराठी" : "English"}
          </button>
        ))}
      </div>

      {/* Logo Area */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#8B3A2A", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 32, boxShadow: "0 8px 16px rgba(139,58,42,0.15)" }}>
          🚩
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#1C1412", fontFamily: "Mukta", letterSpacing: 0.5 }}>
          {t.puneExplorer}
        </div>
        <div style={{ fontSize: 12, color: "#6B5B52", marginTop: 4 }}>
          {t.welcomeSubtitle}
        </div>
      </div>

      {/* Form Card */}
      <div style={{ background: "#fff", padding: 20, borderRadius: 20, border: "1px solid #EDE8DF", boxShadow: "0 6px 20px rgba(0,0,0,0.02)" }}>
        {/* Tab switchers */}
        <div style={{ display: "flex", marginBottom: 20, borderBottom: "1.5px solid #EDE8DF" }}>
          <button
            onClick={() => { setIsLogin(true); setError(""); }}
            style={{
              flex: 1, padding: "10px 0", fontSize: 13, fontWeight: 700, border: "none", background: "none", cursor: "pointer",
              color: isLogin ? "#8B3A2A" : "#6B5B52",
              borderBottom: isLogin ? "3.5px solid #8B3A2A" : "3.5px solid transparent",
              transition: "all 0.2s"
            }}
          >
            {t.login}
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(""); }}
            style={{
              flex: 1, padding: "10px 0", fontSize: 13, fontWeight: 700, border: "none", background: "none", cursor: "pointer",
              color: !isLogin ? "#8B3A2A" : "#6B5B52",
              borderBottom: !isLogin ? "3.5px solid #8B3A2A" : "3.5px solid transparent",
              transition: "all 0.2s"
            }}
          >
            {t.register}
          </button>
        </div>

        {error && (
          <div style={{ background: "#FDF2F2", color: "#DE350B", padding: "10px 12px", borderRadius: 10, fontSize: 11, fontWeight: 600, marginBottom: 16, border: "1px solid #FAD2D2" }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {!isLogin && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6B5B52", marginBottom: 6 }}>{t.name}</div>
              <input
                type="text"
                placeholder={t.enterName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #EDE8DF",
                  fontSize: 13, outline: "none", background: "#FBF8F3", fontFamily: "inherit"
                }}
              />
            </div>
          )}

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6B5B52", marginBottom: 6 }}>{t.email}</div>
            <input
              type="email"
              placeholder={t.enterEmail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #EDE8DF",
                fontSize: 13, outline: "none", background: "#FBF8F3", fontFamily: "inherit"
              }}
            />
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6B5B52", marginBottom: 6 }}>{t.password}</div>
            <input
              type="password"
              placeholder={t.enterPassword}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #EDE8DF",
                fontSize: 13, outline: "none", background: "#FBF8F3", fontFamily: "inherit"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "12px", borderRadius: 12, border: "none",
              background: "#8B3A2A", color: "#fff", fontWeight: 700, cursor: "pointer",
              fontSize: 13, marginTop: 8, boxShadow: "0 4px 10px rgba(139,58,42,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            {loading ? (
              <span style={{ fontSize: 12 }}>...</span>
            ) : (
              isLogin ? t.login : t.register
            )}
          </button>
        </form>
      </div>

      {/* Switch Link */}
      <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#6B5B52" }}>
        {isLogin ? (
          <>
            {t.dontHaveAccount}{" "}
            <span
              onClick={() => { setIsLogin(false); setError(""); }}
              style={{ color: "#8B3A2A", fontWeight: 700, cursor: "pointer" }}
            >
              {t.register}
            </span>
          </>
        ) : (
          <>
            {t.alreadyHaveAccount}{" "}
            <span
              onClick={() => { setIsLogin(true); setError(""); }}
              style={{ color: "#8B3A2A", fontWeight: 700, cursor: "pointer" }}
            >
              {t.login}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
