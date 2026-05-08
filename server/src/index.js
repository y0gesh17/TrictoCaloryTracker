import cors from "cors";
import express from "express";

const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/analyze-image", async (req, res) => {
  const { provider, prompt, imageBase64, mimeType, apiKey } = req.body ?? {};

  if (!provider || !prompt || !imageBase64 || !mimeType || !apiKey) {
    res.status(400).send("provider, prompt, imageBase64, mimeType, and apiKey are required.");
    return;
  }

  try {
    if (provider === "chatgpt") {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: [
            {
              role: "user",
              content: [
                { type: "input_text", text: prompt },
                {
                  type: "input_image",
                  image_url: `data:${mimeType};base64,${imageBase64}`,
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        res.status(response.status).send(JSON.stringify(data));
        return;
      }

      const content = data.output?.[0]?.content?.[0]?.text ?? "";
      res.json({ content });
      return;
    }

    if (provider === "gemini") {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: imageBase64,
                    },
                  },
                ],
              },
            ],
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        res.status(response.status).send(JSON.stringify(data));
        return;
      }

      const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      res.json({ content });
      return;
    }

    res.status(400).send("Unsupported provider. Use chatgpt or gemini.");
  } catch (error) {
    res.status(500).send(error.message || "Unexpected server error.");
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`TrictoCal AI server listening on ${port}`);
});
