import { format, compareAsc } from 'date-fns';

export class DateTime {
  static getCurrentDateTime(sourceFormat) {
    return format(new Date(), sourceFormat);
  }

  public isDifferenceTwoDays = (targetDate: string, days: number): boolean =>{
    const currentDate = new Date(); // Current date and time
    const target = new Date(targetDate); // Target date (ensure it's in a valid format)

    // Calculate the difference in milliseconds
    const differenceInMilliseconds = Math.abs(target.getTime() - currentDate.getTime());

    // Convert the difference to days
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

    // Return true if the difference is at least 2 days
    return differenceInDays >= days;

}

}
