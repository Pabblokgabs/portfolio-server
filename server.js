require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();

// ====== CORS ======
app.use(
	cors({
		origin: ["https://kgotso.vercel.app", "http://localhost:5173"],
	})
);

app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/contact", async (req, res) => {
	try {
		const { name, email, message, subject } = req.body;
		console.log(req.body);

		if (!name || !email || !message) {
			return res
				.status(400)
				.json({ error: "Name, email, and message are required." });
		}

		await resend.emails.send({
			from: "Kgotso Portfolio Contact <onboarding@resend.dev>",
			to: process.env.CONTACT_RECEIVER,
			subject: subject || `New message from ${name}`,
			html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || "No subject"}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
		});

		res.json({ success: true, message: "Message sent successfully!" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.post("/chat", async (req, res) => {
	try {
		const { messages } = req.body;
		console.log(messages);

		if (!messages || !Array.isArray(messages)) {
			return res.status(400).json({ error: "Messages array is required." });
		}

		const response = await fetch(
			"https://openrouter.ai/api/v1/chat/completions",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
					"Content-Type": "application/json",
					"HTTP-Referer": "https://kgotso.vercel.app",
					"X-Title": "Kgotso Bot",
				},
				body: JSON.stringify({
					model: "x-ai/grok-4.1-fast:free",
					messages,
				}),
			}
		);

		const data = await response.json();
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
