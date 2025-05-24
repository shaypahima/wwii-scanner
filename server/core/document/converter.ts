import { fromBuffer } from "pdf2pic";
import * as fs from "fs";
import * as path from "path";
import { File } from "../types";
import { FileConversionError } from "../../errors/AppError";
import mammoth from "mammoth";
import puppeteer from "puppeteer";

export async function documentToImage(file: File): Promise<string> {
  try {
    let base64: string | undefined;

    if (!file.data) {
      console.log("File data is missing");
      throw new FileConversionError("File data is missing");
    }

    switch (file.mimeType) {
      case "image/png":
      case "image/jpeg":
      case "image/jpg":
        base64 = file.data.toString("base64");
        break;
      case "application/pdf":
        console.log("PDF file detected, converting to PNG...");
        const convertedFile = await pdfToPng(file.data);
        base64 = convertedFile.buffer?.toString("base64");
        if (base64) {
          file.mimeType = "image/png";
        } else {
          throw new FileConversionError("Failed to convert PDF to PNG");
        }
        break;
      case "application/msword": // DOC file
        console.log("DOC file detected, converting to PNG...");
        const convertedDocFile = await docToPng(file.data);
        base64 = convertedDocFile.buffer ? Buffer.from(convertedDocFile.buffer).toString('base64') : undefined;
        if (base64) {
          file.mimeType = "image/png";
        } else {
          throw new FileConversionError("Failed to convert DOC to PNG");
        }
        break;
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": // DOCX file
        console.log("DOCX file detected, converting to PNG...");
        const convertedDocxFile = await docxToPng(file.data);
        base64 = convertedDocxFile.buffer ? Buffer.from(convertedDocxFile.buffer).toString('base64') : undefined;
        if (base64) {
          file.mimeType = "image/png";
        } else {
          throw new FileConversionError("Failed to convert DOCX to PNG");
        }
        break;
      default:
        throw new FileConversionError(
          `Unsupported file type: ${file.mimeType}`
        );
    }
    const imageUrl = `data:${file.mimeType};base64,${base64}`;
    return imageUrl;
  } catch (error) {
    if (error instanceof FileConversionError) {
      throw error;
    }
    throw new FileConversionError("Failed to convert document to image");
  }
}

export async function pdfToPng(pdfBuffer: Buffer) {
  try {
    const savePath = path.resolve("./public");
    if (!fs.existsSync(savePath)) {
      fs.mkdirSync(savePath, { recursive: true });
    }
    const convert = fromBuffer(pdfBuffer, {
      density: 100,
      savePath: savePath,
      saveFilename: "temp",
      format: "png",
      width: 800, // A4 width
      height: 1000, // A4 height
    });

    const result = await convert(1, { responseType: "buffer" });
    if (!result || !result.buffer) {
      console.log("PDF conversion failed - no output generated");
      throw new FileConversionError(
        "PDF conversion failed - no output generated"
      );
    }
    return result;
  } catch (error) {
    if (error instanceof FileConversionError) {
      throw error;
    }
    throw new FileConversionError("Failed to convert PDF to PNG");
  }
}

/**
 * Converts a DOC file buffer to PNG
 * @param {Buffer} fileBuffer - The DOC file buffer
 * @returns {Promise<{buffer: Buffer}>} - The converted PNG buffer
 */
export async function docToPng(fileBuffer: Buffer) {
  try {
    // Convert DOC to HTML using mammoth or similar library
    const tempHtml = await mammoth.convertToHtml({ buffer: fileBuffer });

    // Use a headless browser like Puppeteer to render the HTML and capture as PNG
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set the HTML content to the page
    await page.setContent(tempHtml.value);

    // Take a screenshot as PNG
    const screenshot = await page.screenshot({
      type: "png",
      fullPage: true,
    });

    await browser.close();

    return { buffer: screenshot };
  } catch (error) {
    console.error("Error converting DOC to PNG:", error);
    throw new FileConversionError(
      `Failed to convert DOC to PNG: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Converts a DOCX file buffer to PNG
 * @param {Buffer} fileBuffer - The DOCX file buffer
 * @returns {Promise<{buffer: Buffer}>} - The converted PNG buffer
 */
export async function docxToPng(fileBuffer: Buffer) {
  try {
    // DOCX is just a newer format, but we can use the same mammoth library
    const tempHtml = await mammoth.convertToHtml({ buffer: fileBuffer });

    // Use a headless browser like Puppeteer to render the HTML and capture as PNG
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set the HTML content to the page
    await page.setContent(tempHtml.value);

    // Take a screenshot as PNG
    const screenshot = await page.screenshot({
      type: "png",
      fullPage: true,
    });

    await browser.close();

    return { buffer: screenshot };
  } catch (error) {
    console.error("Error converting DOCX to PNG:", error);
    throw new FileConversionError(
      `Failed to convert DOCX to PNG: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
