import React from "react";
import regeneratorRuntime from "regenerator-runtime";

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

const defaultPromise = async () => ({});

const wrapEvent = (event = defaultPromise) => async () => {
  try {
    return await event();
  } catch (error) {
    return { error: error.toString() };
  }
};
