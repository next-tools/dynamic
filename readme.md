# Next Dynamic

There may be situations when you want next js to catch all routes and have a cms / api determine what all urls are completely dynamically. You can use this module to help you load dynamic components for one dynamic page that catches all routes except for the homepage route. Note: The latest version of this module uses the catch all routes functionality only in next js >= 9.5

## Suggested Usage

1. create a folder called `routes` (can be called anything) with an `index.js` file and other files aggregated like this

   ```js
   import dynamic from "next/dynamic";

   export const homepage = dynamic(() => import("./homepage"));
   export const about = dynamic(() => import("./about"));
   // the idea is that this routes folder becomes your new "pages" directory in a way
   // you can export your own static functions from the files and have them called when a request to the page is made as shown below
   ```

2. create the file `lib/dynamic.js`. The make function takes an async function as argument that gets the next context. Once you query your cms / api to get the route id and handle, return an object with the properties shown below. The only required property is `handle`. `setupAppData` and `setupPageData` are called in parallel. `onNotFound` is called if `handle` is undefined or `_error`.

   ```js
   import makeNextDynamic from "@next-tools/dynamic";

   export default makeNextDynamic(async (ctx) => {
     const route = await someRouteQuery(ctx.asPath);
     const handle = route ? route.handle : "_error";

     return {
       handle,
       setupAppData: async () => {
         const mod = await import("routes/_app");
         // call some app setup function that returns app data that returns data on the prop appData
         return await mod.setupData(ctx, route);
       },
       setupPageData: async () => {
         const mod = await import(`routes/${handle}`);
         // call some page specific setup function that returns page data on the prop pageData
         return await mod.setupData(ctx, route);
       },
       onNotFound: async () => {
         // maybe check for some redirects if not found
         const redirects = await queryRedirects();
         const redirectTo = checkForRedirects(uri, redirects);

         if (redirectTo) {
           ctx.res.writeHead(301, { Location: "/" + redirectTo });
           ctx.res.end();

           return { error404: false };
         }
         // if you return the prop error404 truthy, the function will try to load setupAppData and setupPageData
         // this way you can have a setup function on your routes/_error page if you want
         return { error404: true };
       }
     };
   });
   ```

3. create the file `pages/[[...args]].js` (the name `...args` matters if you use the named export `DynamicLink`)

   ```js
   import * as routes from "routes/index";
   import nextDynamic from "lib/nextDynamic";

   const Page = ({ handle }) => {
     const Cmp = routes[handle];
     // the module will handle a 404 error page for you and load ~/routes/_error.js if it exists
     return Cmp ? <Cmp /> : null;
   };
   // pass the context to nextDynamic function
   // you could also use getServerSideProps
   Page.getInitialProps = async function (ctx) {
     // make sure to pass the context in always
     const { handle, pageData, appData } = await nextDynamic(ctx);
     // do stuff with the pageData here or forward it to the dynamic component
     return { handle, pageData, appData };
   };

   export default Page;
   ```

4. since now we have one single route, the next `Link` is useless unless you want to type `href="./[[...args]]` and `as="real/path"` every single time. This module provides a named export that proxies the next link and writes the href prop for you behind the scenes. You can now use href normally and it will be set to the as prop for you. You can use the prop uri instead of href to reference a path with no leading slash. The uri prop takes precedence over the href prop. If you enter supply any of the following the route will be the homepage. `href="/", uri="", uri="__home__", home={true}`

   ```js
   import { DynamicLink } from "@next-tools/dynamic";

   const Comp = () => {
     return (
       <>
         <DynamicLink href="/">home</DynamicLink>
         <DynamicLink uri="__home__">another home</DynamicLink>
         <DynamicLink uri="about">about</DynamicLink>
         <DynamicLink href="/about">another about</DynamicLink>
       </>
     );
   };
   ```

If you don't want to use `[[...args]].js` for your route name you can also use the named export `makeDynamicLink` to generate `DynamicLink` with your path as the first and only argument
