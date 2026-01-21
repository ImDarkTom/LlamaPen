type CustomErrorResponse = {
    type: 'error';
    error: {
        type: string;
        message: string;
    }
}