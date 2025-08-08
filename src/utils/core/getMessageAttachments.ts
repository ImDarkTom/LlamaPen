import db from '@/lib/db';

export async function getMessageAttachmentBlobs(attachments: number[] | undefined): Promise<Blob[]> {
    return (await db.attachments.bulkGet(attachments || []))
		.filter((attachment): attachment is UserAttachment => attachment !== undefined)
		.map((attachment) => attachment.content);
}