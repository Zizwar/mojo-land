export default class PromptChecker {
  getWebsite(text: string) {
    const regex = /^(http|https):\/\/([^ "]+)/;
    const match = regex.exec(text);
    return match ? match[0] : null;
  }
  getBulkWebsites(text: string) {
    const regex = /(http|https):\/\/([^ "]+)/g;
    const matches = text.match(regex);
    return matches ? matches : [];
  }
  hasAnyTextAfterAtSymbol(text: string) {
    const regex = /@(.+)$/;
    return regex.test(text);
  }

  getNameAfterAtSymbol(text: string) {
    const regex = /@([^ ]+)/;
    const match = regex.exec(text);
    return match ? match[1] : null;
  }
}


