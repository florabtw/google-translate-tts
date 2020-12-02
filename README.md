google-translate-tts
---

This package is for using Google Translate to create audio clips in node js.

## Installation

`npm install google-translate-tts`

or

`yarn add google-translate-tts`

## Usage

Find a voice to use:

```
const tts = require('google-translate-tts');

// lookup by name
const voice = tts.voices.findByName('English (United States)');

// lookup by code
const voice = tts.voices.findByCode('en-US');

// an array of all voices
console.log(tts.voices);

// voice shape
{
  code: 'en-US',
  name: 'English (United States)'
}
```

Download an audio clip:

```
const fs = require('fs');
const tts = require('google-translate-tts');

// notice that `tts.synthesize` returns a Promise<Buffer>
const saveFile = async () => {
    const buffer = await tts.synthesize({
        text: 'Hello, world!',
        voice: 'en-US'
    });

    fs.writeFileSync('hello-world.mp3', buffer);
};

saveFile();
```
