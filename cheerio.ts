
import cheerio from "https://cdn.skypack.dev/cheerio";


export const getPraserUrl = async (url="https://haraj.com.sa/",query)=>{ 
    const selectorArticle = "article[data-testid='post-article']";

const response = await fetch(url);

const html = await response.text();

const $ = cheerio.load(html);

//const links = $("a").map((_, element) => $(element).attr("href")).get();
const article = $(selectorArticle).text()

return article

}
