function filesAsBase64(files: File[] | Blob[]): Promise<string[]> {
    return Promise.all([...files].map(file => {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();

            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result?.toString().split(',')[1] as string);
            reader.onerror = (error) => reject(error);
        });
    }));
}

export { filesAsBase64 };