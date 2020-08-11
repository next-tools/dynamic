import React from "react";
import regeneratorRuntime from "regenerator-runtime";
import { default as NextLink } from "next/link";

export default (getEvents, opts = {}) => async (...args) => {
  const errHandle = opts.errorHandle || "_error";
  const events = await getEvents(...args);
  const { setupAppData, setupPageData, onNotFound, handle, ...rest } = events;
  let appData;
  let pageData;

  if (!handle || handle === errHandle) {
    const { error404 } = await wrapEvent(onNotFound)();

    if (error404) {
      const [errorAppData, errorPageData] = await Promise.all([
        wrapEvent(setupAppData)(),
        wrapEvent(setupPageData)()
      ]);
      appData = errorAppData;
      pageData = errorPageData;
    }
  } else {
    const [routeAppData, routePageData] = await Promise.all([
      wrapEvent(setupAppData)(),
      wrapEvent(setupPageData)()
    ]);
    appData = routeAppData;
    pageData = routePageData;
  }

  return { appData, pageData, handle, ...rest };
};

export const DynamicLink = function ({ href, uri, base, home, children }) {
  let url = base || "/[[...args]]";
  let asProp = uri ? "/" + uri : href;

  if (uri === "__home__" || home) {
    asProp = "/";
  }

  return (
    <NextLink href={url} as={asProp}>
      {children}
    </NextLink>
  );
};

export const makeDynamicLink = (base) => (props) => (
  <DynamicLink {...props} base={base} />
);

const defaultPromise = async () => ({});

const wrapEvent = (event = defaultPromise) => async () => {
  try {
    return await event();
  } catch (error) {
    return { error: error.toString() };
  }
};
