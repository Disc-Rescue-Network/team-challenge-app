import { setCookie, getCookie, hasCookie, deleteCookie } from "cookies-next";
import { OptionsType } from "cookies-next/lib/types";

export const setMyCookie = (
  key: string,
  value: string,
  options: OptionsType
) => {
  setCookie(key, value, options);
};

export const getMyCookie = (key: string) => {
  return getCookie(key);
};

export const hasMyCookie = (key: string) => {
  return hasCookie(key);
};

// export const deleteMyCookie = (key: string) => {
//   deleteCookie(key);
// };
