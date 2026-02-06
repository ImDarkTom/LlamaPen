export default function setPageTitle(title?: string) {
	if (!title) {
		document.title = `LlamaPen`
	} else {
		document.title = `${title} - LlamaPen`;
	}
}