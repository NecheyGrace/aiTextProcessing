import { useState } from "react";

export default function App() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [summary, setSummary] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newMessage = { text: inputText, type: "user" };
    setMessages([...messages, newMessage]);
    setInputText("");
    setLoading(true);

    try {
      // Call Language Detection API
      const langResponse = await fetch(
        "https://api.example.com/detect-language",
        {
          method: "POST",
          body: JSON.stringify({ text: inputText }),
          headers: { "Content-Type": "application/json" },
        }
      );
      const langData = await langResponse.json();
      setDetectedLanguage(langData.language);

      const botMessage = {
        text: `Detected Language: ${langData.language}`,
        type: "bot",
      };

      setMessages([...messages, newMessage, botMessage]);
    } catch (error) {
      console.error("Error detecting language", error);
    }

    setLoading(false);
  };

  const handleSummarize = async () => {
    if (detectedLanguage !== "en" || inputText.length <= 150) return;
    try {
      const summaryResponse = await fetch("https://api.example.com/summarize", {
        method: "POST",
        body: JSON.stringify({ text: inputText }),
        headers: { "Content-Type": "application/json" },
      });
      const summaryData = await summaryResponse.json();
      setSummary(summaryData.summary);
    } catch (error) {
      console.error("Error summarizing text", error);
    }
  };

  const handleTranslate = async () => {
    try {
      const translateResponse = await fetch(
        "https://api.example.com/translate",
        {
          method: "POST",
          body: JSON.stringify({
            text: inputText,
            targetLang: selectedLanguage,
          }),
          headers: { "Content-Type": "application/json" },
        }
      );
      const translateData = await translateResponse.json();
      setTranslatedText(translateData.translation);
    } catch (error) {
      console.error("Error translating text", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <div className="flex-1 overflow-auto p-4 border rounded bg-white">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 my-2 max-w-xs rounded-lg ${
              msg.type === "user"
                ? "bg-blue-500 text-white ml-auto"
                : "bg-gray-300 text-black"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {detectedLanguage && (
          <p className="text-sm text-gray-600">
            Detected Language: {detectedLanguage}
          </p>
        )}
        {summary && <p className="text-sm text-gray-600">Summary: {summary}</p>}
        {translatedText && (
          <p className="text-sm text-gray-600">Translated: {translatedText}</p>
        )}
      </div>
      <div className="flex items-center gap-2 mt-4">
        <textarea
          className="flex-1 p-2 border rounded"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          className="bg-blue-500 text-white p-2 rounded"
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
      <div className="flex gap-2 mt-4">
        {inputText.length > 150 && detectedLanguage === "en" && (
          <button
            className="bg-green-500 text-white p-2 rounded"
            onClick={handleSummarize}
          >
            Summarize
          </button>
        )}
        <select
          className="border p-2 rounded"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="pt">Portuguese</option>
          <option value="es">Spanish</option>
          <option value="ru">Russian</option>
          <option value="tr">Turkish</option>
          <option value="fr">French</option>
        </select>
        <button
          className="bg-purple-500 text-white p-2 rounded"
          onClick={handleTranslate}
        >
          Translate
        </button>
      </div>
    </div>
  );
}
