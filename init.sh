# init.sh
npm --save-dev install babel-cli
npm -g install babel-cli
echo '{
        "presets": [
          "es2015"
        ],
        "plugins": []
      }' >> .babelrc
npm install --save-dev babel-preset-es2015