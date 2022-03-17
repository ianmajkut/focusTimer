//set-env.ts
// import { writeFile } from 'fs';
const fs = require('fs');
// Configure Angular environment.ts file path
const targetPathProd = './src/environments/environment.prod.ts';
const targetPath = './src/environments/environment.ts';

const colors = require('colors');
require('dotenv').config();

const envConfigFile = `export const environment = {
firebase: {
          apiKey: '${process.env['FIRE_KEY']}',
          authDomain: '${process.env['AUTH_DOMAIN']}',
          projectId: '${process.env['PROJECT_ID']}',
          storageBucket: '${process.env['STORAGE_BUCKET']}',
          messagingSenderId: '${process.env['MESSAGING_SENDER_ID']}',
          appId: '${process.env['APP_ID']}',
          },
production: false
}
`;

const envConfigFileProd = `export const environment = {
firebase: {
          apiKey: '${process.env['FIRE_KEY']}',
          authDomain: '${process.env['AUTH_DOMAIN']}',
          projectId: '${process.env['PROJECT_ID']}',
          storageBucket: '${process.env['STORAGE_BUCKET']}',
          messagingSenderId: '${process.env['MESSAGING_SENDER_ID']}',
          appId: '${process.env['APP_ID']}',
          },
production: true
}
`;

console.log(
  colors.magenta(
    'The file `environment.ts` will be written with the following content: \n'
  )
);

console.log(colors.grey(envConfigFile));
fs.writeFile(targetPath, envConfigFile, function (err: any) {
  if (err) {
    throw console.error(err);
  } else {
    console.log(
      colors.magenta(
        `Angular environment.ts file generated correctly at ${targetPath} \n`
      )
    );
  }
});

fs.writeFile(targetPathProd, envConfigFileProd, function (err: any) {
  if (err) {
    throw console.error(err);
  } else {
    console.log(
      colors.magenta(
        `Angular environment.prod.ts file generated correctly at ${targetPathProd} \n`
      )
    );
  }
});
