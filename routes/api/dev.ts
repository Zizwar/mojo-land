//import database from "../../communication/database.ts";

import { getPraserUrl } from "@/outils/cheerio.ts";

import { Handlers } from "$fresh/server.ts";
export const handler: Handlers = {
  async GET(_req, ctx) {
    const { db } = ctx.state;
    
   // const praser = await getPraserUrl(      "https://haraj.com.sa/11118118326/%D9%82%D8%B7_%D8%B3%D9%83%D9%88%D8%AA%D8%B4_%D8%B3%D8%AA%D8%B1%D9%8A%D8%AA_%D9%84%D9%84%D8%AA%D8%B2%D8%A7%D9%88%D8%AC"    );

     //  const product = await db?.getStoresMask()//getStore(1)//db?.getStores();

     const data = [
      {
        name: "Product Name",
        slug: "product-slug",
        description: "Product Description",
        vector: null,
        geolocation: null,
        storeid: null,
        price: null,
        products_attributes: [
          {
            id: 5,
            key: "Size",
            value: "M",
          },
          {
            id: 6,
            key: "Color",
            value: "Red",
          },
        ],
      },
    ];
    
     
     const ss = [{
     
      products_attributes: [{ key: "wino", value: "M" }],
      products_variations: [{ key: "wino", value: "9" }],
      products_categories: [{ name: "wino" }],
      products_images: [{ src: "https://www.wino.com/hiking-boot-image1.jpg" }],
      products_links: [{ url: "https://www.wino.com/hiking-boot" }],
    }]
const product = await db?.insertCats(data)//getStore(1)//db?.getStores();
    //console.log(res)
    return new Response(JSON.stringify(product), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
};
