import db from "@/lib/db";

export async function addAttachmentsToDB(
    attachments: File[],
    messageId: number,
) {
	const attachmentMap: Omit<UserAttachment, 'id'>[] = attachments.map((attachment) => {
		return {
			content: attachment,
			created: new Date(),
			messageId,
		}
	})

	await db.attachments.bulkAdd(attachmentMap);
}