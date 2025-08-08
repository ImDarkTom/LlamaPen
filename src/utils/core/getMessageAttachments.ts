import db from '@/lib/db';

export async function getMessageAttachmentBlobs(messageId: number): Promise<Blob[]> {
	const results = await db.attachments
		.where('messageId')
		.equals(messageId)
		.toArray();

	return results.map((item) => item.content);
}