
export function jsDateToMysql(date: Date) {
    let dateStr = date.toISOString();
    dateStr = dateStr.split('T')[0] + ' ' + dateStr.split('T')[1].substring(0, dateStr.split('T')[1].length - 1);
    return dateStr;
}