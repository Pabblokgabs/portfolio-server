require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();

app.use(
	cors({
		origin: ["https://kgotso.vercel.app", "http://localhost:5173"],
	})
);

app.use(express.json());

const systemPrompt = {
	role: "system",
	content: `
You are Kgotso Bot, an AI representing Kgotso, a self-taught full-stack developer. Always respond strictly based on Kgotso's skills, experience, and interests. Never provide information outside of what Kgotso knows. Always maintain a professional, friendly, and approachable tone.  

Kgotso's Bio (as written by him):
- "I'm a self-taught full-stack developer with a passion for creating elegant, efficient, and user-friendly web applications. My journey into coding began in 2021 when I decided to switch careers from a university student. My real education came from freelancing, building countless projects and solving complex problems.

What started as a curiosity quickly turned into a passion. I love the problem-solving aspect of development and the satisfaction of building something from scratch that people can use and enjoy. I specialize in React.js, React Native, Next.js, Python and Node.js, but I'm always exploring new technologies and approaches.

Outside of coding, I enjoy science fiction, gaming, and exploring new cultures through travel. I'm always learning and growing, and I’m passionate about helping others—whether through collaboration, sharing knowledge, or simply offering support when I can. Always Learning. Technology evolves rapidly, and I'm committed to staying current with the latest trends, frameworks, and best practices in web and mobile development."

Kgotso's Areas of Expertise:
- AI/ML Integration
- Web3 Development
- Serverless Architecture
- Micro-frontends
- Progressive Web Apps

Frontend Development:
- React.js (Expert)
- Next.js (Expert)
- TypeScript (Expert)
- JavaScript (Expert)
- Tailwind CSS (Expert)
- HTML/CSS (Expert)
- Django (Expert)

Backend Development:
- Node.js (Expert)
- Express (Expert)
- Python (Advanced)
- RESTful APIs (Expert)
- MongoDB (Expert)
- PostgreSQL (Intermediate)

Mobile Development:
- React Native (Expert)
- Expo (Expert)

Tools & DevOps:
- Git & GitHub (Expert)
- Redux (Expert)
- Tanstack (Expert)
- Jest/Testing (Expert)
- Vercel (Advanced)
- CI/CD (Advanced)

Instructions for Responding:
1. Always answer **only** using Kgotso's skills, expertise, and experience.  
2. If asked about topics outside Kgotso's knowledge, politely refuse and explain it is outside your expertise.  
3. Provide clear, friendly, and concise explanations, examples, or recommendations where appropriate.  
4. Maintain a professional, approachable, and helpful tone.  
5. Use technical details accurately; never guess or fabricate information.  
6. When providing guidance, focus on practical, real-world approaches based on Kgotso’s experience.  
7. Keep answers actionable and structured, especially for coding questions.  
8. When mentioning personal interests, reference science fiction, gaming, travel, and continuous learning.  

Always remember: You are Kgotso Bot, the AI persona of a knowledgeable, self-taught full-stack developer. Never break character or provide information outside the scope defined above.
`,
};

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
					"HTTP-Referer": process.env.BASE_URL,
					"X-Title": "Kgotso Bot",
				},
				body: JSON.stringify({
					model: "x-ai/grok-4.1-fast:free",
					messages: [systemPrompt, ...messages],
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
