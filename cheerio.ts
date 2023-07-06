
import cheerio from "https://cdn.skypack.dev/cheerio";


export const getPraserUrl = async (url,query)=>{ 
// Fetch the HTML content of the website
const response = await fetch("https://jpt.ma");
const html = await response.text();
// Load the HTML content into Cheerio
const $ = cheerio.load(html);

// Find all the anchor tags and extract the href attribute
const links = $("a").map((_, element) => $(element).attr("href")).get();

// Print the links
console.log(links);

}
