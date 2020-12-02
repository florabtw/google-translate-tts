const https = require("https");
const tts = require("../src/index");

test("All language codes are valid", async (done) => {
  const responses = tts.languages.map((language) => {
    return tts
      .synthesize({ text: "test", voice: language.code })
      .catch((err) => {
        console.log("language code failed: " + language.code);
        console.log(err);
        done.fail("language code failed: " + language.code);
      });
  });

  await Promise.all(responses);
  done();
}, 10000);
