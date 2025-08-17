import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.GROQ_KEY || "",
});

export async function generateSummary(
  transcript: string,
  customPrompt: string
): Promise<string> {
  if (!groq.apiKey) {
    throw new Error("Groq API key is not configured");
  }

  const systemPrompt = `You are an AI assistant specialized in summarizing meeting transcripts. You will receive a meeting transcript and custom instructions for how to format the summary. Follow the custom instructions precisely while maintaining accuracy and clarity.`;

  const userPrompt = `Please summarize the following meeting transcript according to these instructions: "${customPrompt}"

Meeting Transcript:
${transcript}

Please provide a well-structured summary following the given instructions.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 2000,
    });

    const summary = completion.choices[0]?.message?.content;
    if (!summary) {
      throw new Error("No summary generated from Groq API");
    }

    return summary.trim();
  } catch (error) {
    console.error("Error generating summary with Groq:", error);
    throw new Error("Failed to generate summary. Please try again.");
  }
}
