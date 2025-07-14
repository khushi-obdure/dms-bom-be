import { AWS_S3_URL } from "../config";
import bcrypt from "bcrypt";

/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description this value is Empty Check
 */
export const isEmpty = (value: string | number | object): boolean => {
  if (value === null) {
    return true;
  } else if (typeof value !== "number" && value === "") {
    return true;
  } else if (typeof value === "undefined" || value === undefined) {
    return true;
  } else if (
    value !== null &&
    typeof value === "object" &&
    !Object.keys(value).length
  ) {
    return true;
  } else {
    return false;
  }
};

/**
 * @method generateOTP
 * @returns {String}
 * @description this function generates OTP of 6 digit
 */
export const generateOTP = (): string => {
  // Declare a digits variable which stores all digits
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

/**
 * @method generatePassword
 * @returns {String}
 * @description this function generates password of 8 letters with Upperscase letters, lowercase letters, numbers and special character
 */
export const generatePassword = (): string => {
  const length = 8,
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

/**
 * @method generateSlug
 * @param string name
 * @returns string slug
 * @description this function generates slug for name
 */
export const generateSlug = (name: string): string => {
  name = name.replace(/[^A-Z0-9]/gi, "-").toLowerCase();
  return name;
};

/**
 * @method isEmpty
 * @param void
 * @returns {number} unix timestamp in seconds
 * @description get unix timestamps
 */
export const getCurrentUnixTimestamp = (): number => {
  return Date.parse(new Date().toString()) / 1000;
};

/**
 *
 * @param mediaPath  will be the file path of S3
 * @returns
 */
export const getS3UrlForMedia = (mediaPath: string): string => {
  return `${AWS_S3_URL}/${mediaPath}`;
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};
