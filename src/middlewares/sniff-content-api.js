"use strict";
const { sanitize } = require("@strapi/utils");
/**
 * `sniff-content-api` middleware
 */

function isAPIRoute(url) {
  return url.split("/")[1] === "api";
}

function determineOperation(HTTP_METHOD) {
  if (HTTP_METHOD === "POST") {
    return "create";
  }
  if (HTTP_METHOD === "PUT") {
    return "update";
  }
  if (HTTP_METHOD === "DELETE") {
    return "delete";
  }
  // Add a default
}

module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    // view requests coming into the strapi app globally
    // filter out specifically the requests onto the content API. Rudimentary filter by the /api/ route.

    await next();

    // perform the request on this end, however, to make sure successful requests are logged and not failed ones.
    const url = ctx.request.url;

    if (
      isAPIRoute(url) &&
      ctx.request.method !== "GET" &&
      ctx.response.status === 200
    ) {
      // Make sure the request is an API route, not a GET method and is "successful"
      const api = url.split("/")[1];
      const modelDef = strapi.getModel(`api::${api}.${api}`);
      const sanitizedData = sanitize.sanitizers.defaultSanitizeOutput(
        modelDef,
        ctx.response.body
      );
      // Emit an event to the event to make sure the audit logs grab it
      // This event assumes the URL is 'ideal', i.e api routes have a prefix of API and the url is in the shape: /api/<content-type>/
      await strapi.eventHub.emit(
        `entry.${determineOperation(ctx.request.method)}`,
        {
          meta: "Testing",
        }
      );
    }
  };
};
