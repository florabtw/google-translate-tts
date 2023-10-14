const fs = require("fs");
const tts = require("../../src/index");

const [_, __, text, voice, accent] = process.argv;
const slow = process.argv[5] === "y";
const useCookies = process.argv[6] === "y";

tts.synthesize({ text, voice, accent, slow, useCookies }).then((buffer) => {
  fs.writeFileSync("sample.mp3", buffer);
});
