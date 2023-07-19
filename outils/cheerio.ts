
import cheerio from "https://cdn.skypack.dev/cheerio";


export const getPraserUrl = async (url: RequestInfo|URL)=>{ 
    if(!url)return {err:"not link"}
    const selectorArticle = "article[data-testid='post-article']";

const response = await fetch(url);

const html = await response.text();

const $ = cheerio.load(html);

//const links = $("a").map((_, element) => $(element).attr("href")).get();
const article = $(selectorArticle).text()

return article

}
