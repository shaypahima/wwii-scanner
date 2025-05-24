import { Groq } from "groq-sdk";
import { GroqServiceError } from "../../errors/AppError";

const groq = new Groq();

const prompt = `you are a document scanner.
given the following file input, your output will be a JSON object with the following structure, return only the JSON object:
{
  "title": string, // A descriptive title for the document
  "content": string, // content summary
  "document_type": "letter"|"report"|"photo"|"newspaper"|"list"|"diary_entry"|"book"|"map"|"biography",
  "entities": [{
    "name": string,
    "type": "person"|"location"|"organization"|"event"|"date"|"unit"
  }]
}

Please analyze the document and provide a detailed response following this structure.`;

export async function processImageWithGroq(dataUrl: string): Promise<string> {
  try {
    console.log("sending request to groq...");
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new GroqServiceError('No content received from Groq API');
    }
    console.log("content", content);
    return content;
  } catch (error) {
    if (error instanceof GroqServiceError) {
      throw error;
    }
    throw new GroqServiceError('Failed to process image with Groq');
  }
} 