import React, { useState } from "react";
import { parseIntentAI } from "../aiParser/parseIntentAI";

const IntentForm = ({ executeIntent }) => {
  const [textInput, setTextInput] = useState("");
  const [manualMode, setManualMode] = useState(false); // ✅ toggle AI/manual
  const [form, setForm] = useState({
    token: "",
    amount: "",
    recipient: "",
    note: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (manualMode) {
      // ✅ manual mode just uses form state
      executeIntent(form);
      setForm({ token: "", amount: "", recipient: "", note: "" });
      setManualMode(false);
      return;
    }

    try {
      const { parseIntentAI } = await import("../aiParser/parseIntentAI");
      const intent = await parseIntentAI(textInput);
   
    if (intent?.error){
    alert(intent.message);
    setManualMode(true);
    setForm(intent.fallback); // blank template
  } else {
    executeIntent(intent);
    setTextInput("");}
  }catch (err) {
      console.error("Error submitting intent:", err);
      alert("Something went wrong. Switching to manual input.");
      setManualMode(true);
    }
  };

  const startVoiceInput = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    recognition.onresult = async (event) => {
      const speechText = event.results[0][0].transcript;
      setTextInput(speechText);
      const intent = await parseIntentAI(speechText);
      if (intent) executeIntent(intent);
    };
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
      {!manualMode ? (
        <>
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder='e.g. "Send 0.1 TTRUST to 0xABC for lunch"'
          style={{ width: "400px", padding: "0.5rem" }}
        />
        <button type="submit" style={{ marginLeft: "1rem" }}>Send</button>
        </>
      ):(
         <>
          <input
            type="text"
            placeholder="Token (TTRUST, USDC...)"
            value={form.token}
            onChange={(e) => setForm({ ...form, token: e.target.value })}
          />
          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <input
            type="text"
            placeholder="Recipient address"
            value={form.recipient}
            onChange={(e) => setForm({ ...form, recipient: e.target.value })}
          />
          <input
            type="text"
            placeholder="Note (optional)"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
          <button type="submit">Send Manual</button>
        </>
      )}
      </form>
      <button onClick={startVoiceInput} style={{ marginTop: "1rem" }}>
        Speak Intent
      </button>
    </div>
  );
};

export default IntentForm;
