export const getStatusColor = (status: string) => {
    switch (status) {
        case 'processed':
            return 'bg-green-100 text-green-800 border-green-200'
        case 'processing':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'failed':
            return 'bg-red-100 text-red-800 border-red-200'
        case 'holiday':
            return 'bg-purple-100 text-purple-800 border-purple-200'
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200'
    }
}
export const getStatusDot = (status: string) => {
    switch (status) {
        case 'processed':
            return 'bg-green-500'
        case 'processing':
            return 'bg-yellow-500'
        case 'failed':
            return 'bg-red-500'
        case 'holiday':
            return 'bg-purple-500'
        default:
            return 'bg-gray-500'
    }
}

export const bytesToMB = (bytes: number, decimalPlaces = 2) => {
    if (typeof bytes !== 'number' || isNaN(bytes)) return '0.00';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(decimalPlaces);
}