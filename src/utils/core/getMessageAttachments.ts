import db from '@/lib/db';

export async function getMessageAttachments(messageId: number): Promise<UserAttachment[]> {
	return await db.attachments
		.where('messageId')
		.equals(messageId)
		.toArray();
}