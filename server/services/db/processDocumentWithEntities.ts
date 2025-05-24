
import { AppError } from "../../errors/AppError"; 
import { prisma } from "../../controllers/documents";
import { DatabaseDocument, DatabaseEntity, Document } from "../../core/types";
import { EntityType } from "@prisma/client";


export async function processDocumentWithEntities(documentData: Document) : Promise<DatabaseDocument> {
  try {
    // Process entities first - check if they exist or need to be created
    const processedEntities : DatabaseEntity[] = await Promise.all(
      documentData.entities.map(async (entity) => {
        // For date entities, convert the name to a Date object
        let dateValue: string | undefined ;
        if (entity.type === EntityType.date) {
          dateValue = new Date(entity.name).toISOString();
        }

        // Check if entity already exists in the database
        const existingEntity = await prisma.entity.findFirst({
          where: {
            name: entity.name,
            type: entity.type
          },
        });

        if (existingEntity) {
          return existingEntity ;
        } else {
          // Create new entity
          return await prisma.entity.create({
            data: {
              name: entity.name,
              type: entity.type as EntityType,
              date: entity.type === EntityType.date ? dateValue : null,
            },
          });
        }
      })
    );

    // Now create the document with entity connections
    const createdDocument : DatabaseDocument = await prisma.document.create({
      data: {
        title: documentData.title,
        fileName: documentData.fileName,
        content: documentData.content,
        imageUrl: documentData.imageUrl,
        documentType: documentData.documentType,
        entities: {
          connect: processedEntities.map((entity : DatabaseEntity) => ({ id: entity.id })),
        },
      },
      include: {
        entities: true,
      },
    });

    return createdDocument;
  } catch (error: unknown) {
    console.error('Error processing document with entities:', error);
    if (error instanceof Error) {
      throw new AppError(`Failed to process document: ${error.message}`);
    }
    throw new AppError('Failed to process document: Unknown error');
  }
}
