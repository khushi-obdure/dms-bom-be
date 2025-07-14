import moment from 'moment';

export function convertCreatedAt(createdAt: string | string[] | Date) {
    if (Array.isArray(createdAt)) {
        return createdAt.map(date => moment(date as string).utc().format('YYYY-MM-DD HH:mm:ss'));
    } else if (typeof createdAt === 'string') {
        return moment(createdAt).utc().format('YYYY-MM-DD HH:mm:ss');
    } else {
        return typeof createdAt.toString === 'function'
            ? createdAt.toString() // Convert to string if possible
            : JSON.stringify(createdAt); // Or handle differently based on the type
    }
}