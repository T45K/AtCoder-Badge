const https = require("https");
const { JSDOM } = require("jsdom");

exports.handler = async (event) => {
  console.log(event);
  const user = event.queryStringParameters.user;
  const html = await new Promise((resolve) => {
    https
      .request(`https://atcoder.jp/users/${user}`, (res) => {
        let tmp = "";
        res.on("data", (line) => {
          tmp += line;
        });
        res.on("end", () => {
          resolve(tmp);
        });
      })
      .end();
  });
  const dom = new JSDOM(html);
  const rateTag = dom.window.document
    .querySelector("table.dl-table.mt-2")
    .querySelectorAll("td")[2]
    .querySelectorAll("span")[0];
  const rate = rateTag.textContent;
  const color = rateTag.attributes[0].value.split("-")[1];

  const shields = await new Promise((resolve) => {
    https
      .request(
        `https://img.shields.io/badge/${user}-${rate}-${color}.svg`,
        (res) => {
          const contentLength = res.headers["content-length"];
          let xml = "";
          res.on("data", (line) => {
            xml += line;
          });
          res.on("end", () => {
            resolve({
              contentLength: contentLength,
              xml: xml,
            });
          });
        }
      )
      .end();
  });

  return {
    statusCode: 200,
    headers: {
      "content-type": "image/svg+xml",
      "content-length": shields.contentLength,
    },
    body: shields.xml,
  };
};
