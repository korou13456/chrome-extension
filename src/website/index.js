import prettier from "prettier/standalone";
import parserBabel from "prettier/parser-babel";

import { minify } from "terser";

async function uglifyCode(code) {
  return (
    await minify(code, {
      compress: false,
      format: {
        comments: false,
        quote_style: 1,
      },
      keep_classnames: true,
      keep_fnames: true,
    })
  ).code;
}

(d) => {
  new Promise(async () => {});
};

function beautifyCode(code) {
  return prettier.format(code, {
    parser: "babel",
    plugins: [parserBabel],
    tabWidth: 4,
    singleQuote: true,
    arrowParens: "always",
  });
}

window.beautifyCode = beautifyCode;
window.uglifyCode = uglifyCode;
