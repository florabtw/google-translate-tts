const https = require("https");

const cookie = (() => {
  const get = () =>
    new Promise((resolve, reject) => {
      const request = https.get("https://translate.google.com", (res) => {
        const setCookies = res.headers["set-cookie"];
        const cookies = setCookies.map((sc) => sc.split(";")[0]);
        const cookieString = cookies.join("; ");
        resolve(cookieString);
      });
      request.on("error", reject);
      request.end();
    });

  return { get };
})();

const synthesize = (() => {
  const options = (cookie) => ({
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      cookie,
    },
    hostname: "translate.google.com",
    method: "POST",
    path: "/_/TranslateWebserverUi/data/batchexecute",
  });

  const body = ({ slow = false, text, voice }) => {
    const values = JSON.stringify([text, voice, slow ? true : null, "null"]);
    const data = JSON.stringify([[["jQ1olc", values, null, "generic"]]]);
    const params = new URLSearchParams({ "f.req": data });
    return params.toString();
  };

  const request = ({ cookie = "", ...opts }) =>
    new Promise((resolve, reject) => {
      const request = https.request(options(cookie), (res) => {
        let data = "";
        res.on("data", (chunk) => (data = data + chunk));
        res.on("end", () => resolve(data));
      });
      request.write(body(opts));
      request.on("error", reject);
      request.end();
    });

  /* Response looks like:
   *
   *   )]}'
   *
   *   [["wrb.fr","jQ1olc","[\"<base 64 data>\"]"]]
   *   ,["di",52]
   *   ,["af.httprm",51,"8692744518077823928",2]
   *   ]
   */
  const toBuffer = (response) => {
    const slice = response.split("\n").slice(1).join("");
    const json = JSON.parse(slice);
    const dataString = json[0][2];
    const dataArray = JSON.parse(dataString);

    if (dataArray === null)
      throw new Error("Unable to parse audio data. Check your request params.");

    return Buffer.from(dataArray[0], "base64");
  };

  const synthesize = async ({ useCookies, ...opts }) => {
    const cookie_ = useCookies ? await cookie.get() : "";
    return request({ cookie: cookie_, ...opts }).then(toBuffer);
  };

  return synthesize;
})();

module.exports = synthesize;
