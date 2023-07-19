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

const checker = new PromptChecker();
/*const text1 = "example.com";
const text2 = "john@ example.com";
const text3 = "jane@doe@example .com fdfg";


console.log("text1", checker.getNameAfterAtSymbol(text1));
console.log("text2", checker.getWebsite(text2));
console.log("text3", checker.getWebsite(text3));

*/
const text4 = "http://jane@doe@example.com dfg";
console.log("text4", checker.getBulkWebsites(text4));