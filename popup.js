const replyBox = document.getElementById("replyBox");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");

generateBtn.addEventListener("click", async () => {
    const emailText = document.getElementById("emailInput").value.trim();
    const tone = document.getElementById("toneSelect").value;

    if (!emailText) {
        replyBox.innerText = "⚠️ Please enter email content first.";
        replyBox.classList.remove("loading");
        return;
    }

    replyBox.innerText = "Generating reply...";
    replyBox.classList.add("loading");

    try {
        const response = await fetch("http://localhost:8080/api/email/generate", { // matches backend
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emailContent: emailText, tone }) // matches EmailRequest fields
        });

        if (!response.ok) throw new Error("Backend not reachable. Is Spring Boot running?");

        const data = await response.text(); // backend returns plain string
        replyBox.innerText = data || "No reply received.";
    } catch (err) {
        console.error("Error:", err);
        replyBox.innerText = "Error: " + err.message;
    } finally {
        replyBox.classList.remove("loading");
    }
});

copyBtn.addEventListener("click", () => {
    const reply = replyBox.innerText.trim();
    if (!reply || reply.startsWith("⚠️") || reply.startsWith("❌") || reply.startsWith("⏳")) {
        alert("No valid reply to copy!");
        return;
    }
    navigator.clipboard.writeText(reply).then(() => {
        const originalText = copyBtn.innerText; 
        copyBtn.innerText = "Copied!";         
        copyBtn.disabled = true;                

        setTimeout(() => {
            copyBtn.innerText = originalText;    
            copyBtn.disabled = false;             
        }, 2000);
    });
});
