const path = require("path");
const util = require("util");
const fs = require("fs");
const cliArgs = process.argv;
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

(async () => {
  if (cliArgs && cliArgs.length > 0) {
    const folderArg = path.dirname(cliArgs[3]);
    const frontmatterArg = cliArgs[4];
    const data =
      frontmatterArg && typeof frontmatterArg === "string"
        ? JSON.parse(frontmatterArg)
        : null;
    const videoId = data.video.youtube;
    // https://i.ytimg.com/vi/49FXjBiccG4/sddefault.jpg
    // https://i.ytimg.com/vi/49FXjBiccG4/maxresdefault.jpg
    // https://ytimg.googleusercontent.com/vi/49FXjBiccG4/sddefault.jpg
    // https://ytimg.googleusercontent.com/vi/49FXjBiccG4/maxresdefault.jpg
    const videoThumbnail = util.format(
      "https://ytimg.googleusercontent.com/vi/%s/maxresdefault.jpg",
      videoId,
    );
    const writeFilePromise = util.promisify(fs.writeFile);

    async function downloadFile(url, outputPath) {
      const x = await fetch(url);
      const x_1 = await x.arrayBuffer();
      return await writeFilePromise(outputPath, Buffer.from(x_1));
    }

    downloadFile(videoThumbnail, folderArg + "/header.jpg");
  }
})();
