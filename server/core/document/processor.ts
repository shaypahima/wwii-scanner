import { File, AnalysisResult, ParsedAnalysis } from "../types";
import { processImageWithGroq } from "../../services/ai/groq";
import { documentToImage } from "./converter";
import { parseAnalysis } from "./parser";
import { AppError } from "../../errors/AppError";


export async function processDocument(file: File): Promise<AnalysisResult> {
  try {
    // Step 1: Convert document to image
    const dataUrl = await documentToImage(file);
    // Step 2: Process image with AI
    const analysisResult = await processImageWithGroq(dataUrl);
    // Step 3: Parse and validate analysis
    const objectifiedAnalysis : ParsedAnalysis = parseAnalysis(analysisResult);
    console.log("done processing document");
    return {
      analysis: objectifiedAnalysis,
      image: dataUrl,
      fileName: file.name
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to process document" );
  }
} 