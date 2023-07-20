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
  hasTextAfterAtSymbol(text: string) {
    const regex = /@(.+)$/;
    return regex.test(text);
  }

  getNameAfterAtSymbol(text: string) {
    const regex = /@([^ ]+)/;
    const match = regex.exec(text);
    return match ? match[1] : null;
  }
  getWebsiteIfHasCRUD(crud: string, text: string) {
    if (this.hasTextAfterAtSymbol(crud)) return this.getWebsite(text);
    return null;
  }

  getJsonInText(text: string) {
    const regex = /{([^}]*)}/g;
    const matches = Array.from(text.matchAll(regex));
    return matches.map((match) => JSON.parse(match[0]));
  }
}
