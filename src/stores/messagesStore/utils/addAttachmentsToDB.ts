import db from "@/lib/db";
import { toRaw } from "vue";

export async function addAttachmentsToDB(
    attachments: File[],
    messageId: number,
) {
    const allAttachments = toRaw(attachments);
	const attachmentMap: Omit<UserAttachment, 'id'>[] = allAttachments.map((attachment) => {
		return {
			content: attachment,
			created: new Date(),
			messageId,
		}
	})

	await db.attachments.bulkAdd(attachmentMap);
}