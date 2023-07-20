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
  matchJsonInText(text: string) {
    const regex = /"(.*?)":/g;

    const matches = Array.from(text.matchAll(regex));

    const results: never[] = [];
    matches.forEach((match) => {
      const key = match[1];
      const start = match.index + match[0].length; //

      let end = text.indexOf(",", start);

      if (end === -1) end = text.indexOf("}", start) ;

      const value = text
        .slice(start, end)
        .trim()
        .replaceAll('"', "")
        .replaceAll("'", "");
      results[key] = value;
    });

    return results;
  }

  regexIno(content:string, pattern = new RegExp(matcher.product, "g")) {
    let match;
    const matchArr = [];
    while ((match = pattern.exec(content))) {
      match = match[1]?.trim();
      if (match) matchArr.push(match);
    }
    return matchArr;
  }


  get messages() {
    const INTIAL = `This is a message from the user, and he may inquire about the products and stores we have in a database. What I want from you is as follows: If he is inquiring about a product, add: {product: “Here are keywords for the product according to rule 2”} - If he is inquiring about prices, add along the lines of: {price:123} - If he is looking for characteristics in the product such as length, color, etc., add along the lines: {options:"red,size"} if he is looking for a store Add: {store: "Add here search keywords for the store according to rule 2"} if - if it is outside the context of stores, products, and e-commerce, add {out:true} else {out:false} always add out _ rule 2: convert to keywords i.e. any message and give the result like the following add keyword english and arabic like "keyword_1 | keyword_word2 | keyword_word3" _ don't explain to me, give me the result in json format as you requested { store: string, product: string, price: float options:array out:bool } -- user message are:`;
    return { INTIAL };
  }
}

const matcher = {
  https: 'https(.*?)"',
  dictionary: "{(.*?)}",
  tuple: "((.*?))",
  array: "[(.*?)]",
  src: ' src="(.*?)" ',
  product: 'product: "(.*?)"',
  custom: (_r) => _r,
};