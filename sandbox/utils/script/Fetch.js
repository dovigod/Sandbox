import { resolveQueryString } from "./api";

export class Fetch {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async get(endPoint, option) {
    const queryString = resolveQueryString(option?.query);
    const target = this.baseUrl + endPoint + queryString;
    const headers = {
      "Content-Type": "application/json",
      ...option?.headers,
    };

    const response = await fetch(target, {
      method: "GET",
      headers,
      signal: option?.signal,
      credentials: option?.credential || "same-origin",
    });
    const extracted = await response.json();
    return extracted;
  }
  static async post(endPoint, option) {
    const queryString = resolveQueryString(option?.query);
    const target = this.baseUrl + endPoint + queryString;
    const body = option?.body ? (option.body instanceof FormData ? option.body : JSON.stringify(option.body)) : "";
    const headers = {
      ...option?.headers,
    };

    if (option?.accessToken) {
      headers["Authorization"] = `Bearer ${option.accessToken}`;
    }
    const response = await fetch(target, {
      method: "POST",
      headers,
      body,
      credentials: option?.credential || "same-origin",
      signal: option?.signal,
    });

    const extracted = await response.json();

    if (extracted.success) {
      return extracted;
    }
  }
}
