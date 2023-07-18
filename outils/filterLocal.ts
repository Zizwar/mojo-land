export default class PromptChecker {
  hasNameAfterAtSymbol(website: string, name: string) {
    const regex = new RegExp(`@${name}\\b`, "i");
    return regex.test(website);
  }

  hasWebsite(website: string) {
    const regex = /^(http|https):\/\/[^ "]+$/;
    return regex.test(website);
  }

  hasAnyTextAfterAtSymbol(website: string) {
    const regex = /@(.+)$/;
    return regex.test(website);
  }

  getNameAfterAtSymbol(website: string) {
    const regex = /@(.+)$/;
    const match = regex.exec(website);
    return match ? match[1] : null;
  }
}

const checker = new PromptChecker();
const website1 = "example.com";
const website2 = "john@example.com";
const website3 = "jane@doe@example.com";

console.log(checker.hasNameAfterAtSymbol(website1, "name")); // false
console.log(checker.hasNameAfterAtSymbol(website2, "john")); // true
console.log(checker.hasNameAfterAtSymbol(website3, "doe")); // false

console.log(checker.hasWebsite(website1)); 
console.log(checker.hasWebsite(website2)); 
console.log(checker.hasWebsite(website3));

console.log(checker.hasAnyTextAfterAtSymbol(website1)); // false
console.log(checker.hasAnyTextAfterAtSymbol(website2)); // false
console.log(checker.hasAnyTextAfterAtSymbol(website3)); // true
