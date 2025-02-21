import { useState, useEffect, useRef } from "react";

export default function App() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [error, setError] = useState("");
  const chatContainerRef = useRef(null);

  const languages = [
    { code: "en", name: "English" },
    { code: "pt", name: "Portuguese" },
    { code: "es", name: "Spanish" },
    { code: "ru", name: "Russian" },
    { code: "tr", name: "Turkish" },
    { code: "fr", name: "French" },
  ];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (text, type = "user") => {
    setMessages((prev) => [
      ...prev,
      { text, type, timestamp: new Date().getTime() },
    ]);
  };

  const summarizeText = (text) => {
    if (text.length <= 150) return text;
    return text.split(" ").slice(0, 30).join(" ") + "... (summary)";
  };

  const detectLanguage = async (text) => {
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(
          text
        )}`
      );
      const data = await response.json();
      return data[2];
    } catch (error) {
      console.error("Language detection failed:", error);
      return "unknown";
    }
  };

  const translateText = async (text, targetLang) => {
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
          text
        )}`
      );
      const data = await response.json();
      return data[0].map((t) => t[0]).join(" ");
    } catch (error) {
      console.error("Translation failed:", error);
      return "Translation Error";
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    try {
      setLoading(true);
      setError("");
      addMessage(inputText, "user");

      const detectedLang = await detectLanguage(inputText);
      addMessage(`Detected Language: ${detectedLang}`, "system");

      if (detectedLang !== selectedLanguage) {
        const translatedText = await translateText(inputText, selectedLanguage);
        addMessage(
          `Translated (${selectedLanguage}): ${translatedText}`,
          "system"
        );
      }

      setInputText("");
    } catch (err) {
      setError("Failed to process message. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-lg mx-auto bg-gray-100 rounded-lg shadow-lg overflow-hidden pt-16">
      <header className="bg-blue-500 text-white text-center text-lg font-bold p-3 rounded-t-lg shadow-md">
        AI Text Processor
      </header>
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message, index) => (
          <div
            key={`${message.timestamp}-${index}`}
            className={`max-w-[80%] p-3 rounded-lg ${
              message.type === "user"
                ? "ml-auto bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {message.text.length > 150
              ? summarizeText(message.text)
              : message.text}
          </div>
        ))}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex space-x-2 mb-4">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex space-x-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="3"
          />
          <button
            onClick={handleSend}
            disabled={loading || !inputText.trim()}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
