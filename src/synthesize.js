const https = require("https");

const token = (() => {
  const request = () =>
    new Promise((resolve, reject) => {
      const req = https.request(
        "https://translate.google.com/?hl=en&tab=TT",
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data = data + chunk));
          res.on("end", () => resolve(data));
        }
      );
      req.on("error", reject);
      req.end();
    });

  const tokenMatch = /"SNlM0e":"([\w:]+)"/;

  const get = async () => {
    const html = await request();
    console.log(html.split("\n")[0]);
    const match = html.match(tokenMatch);

    if (!match || !match.length)
      throw new Error("No token found when parsing translate.google.com");

    return match[0];
  };

  return { get };
})();

const synthesize = (() => {
  const options = {
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    hostname: "translate.google.com",
    method: "POST",
    path: "/_/TranslateWebserverUi/data/batchexecute",
  };

  const body = ({ slow = false, text, token, voice }) => {
    const values = JSON.stringify([text, voice, slow ? true : null, "null"]);
    const data = JSON.stringify([[["jQ1olc", values, null, "generic"]]]);
    const params = new URLSearchParams({
      "f.req": data,
      ...(token && { at: token }),
    });
    return params.toString();
  };

  const request = (opts) =>
    new Promise((resolve, reject) => {
      const request = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data = data + chunk));
        res.on("end", () => resolve(data));
      });
      console.log("body", body(opts));
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

  const synthesize = async ({ useToken = false, ...opts }) => {
    const token_ = useToken && (await token.get());
    return request({ token: token_, ...opts }).then(toBuffer);
  };

  return synthesize;
})();

module.exports = synthesize;
