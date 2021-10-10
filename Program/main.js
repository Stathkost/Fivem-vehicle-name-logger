const { readdirSync, readFileSync, createWriteStream } = require("fs");
const { parseString } = require("xml2js");

const fullMainPath = process.argv[2];
const txtname = process.argv[3];

let finalArr = [];
let errorArr = [];
let counter = 0;

if (/[\\/:*?"<>|!]/.test(process.argv[3])) {
  console.log(
    `\x1b[31mError ${txtname} is invalid. Plase remove special characters and try again!\x1b[0m\x1b[1m`
  );
  process.exit(1);
}

const getDirectories = (source, self) => {
  if (self) {
    getFilesInDirectory(source);
  }

  counter++;
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .forEach((item) => {
      getFilesInDirectory(source + "/" + item);
      getDirectories(source + "/" + item, false);
    });
};

const getFilesInDirectory = (source) => {
  readdirSync(source).forEach((file) => {
    if (/\bhandling([0-9]?)+\.meta\b/.test(file)) {
      const path = source + "/" + file;
      parseXML(path, source, file);
    }
  });
};

const parseXML = (path, source, file) => {
  parseString(readFileSync(path), (err, result) => {
    try {
      let json = JSON.parse(JSON.stringify(result));

      for (const item of json.CHandlingDataMgr.HandlingData) {
        for (const item2 of item.Item) {
          const carName = item2.handlingName;

          finalArr.push(
            path.substr(fullMainPath.length + 1).replace("handling.meta", "") +
              " : " +
              carName
          );
          console.log(`\x1b[1m\x1b[34m Car:\x1b[0m\x1b[1m ${carName}`);
        }
      }
    } catch (err) {
      //console.log(err);
      console.log(`\x1b[1m\x1b[31mError reading ${path}\x1b[0m`);
      errorArr.push(`Error reading ${path}`);
    }
  });
};

const writeFile = (fileName, arr, errArr) => {
  if (finalArr.length === 0) {
    console.log("Did not find anything...");
    return;
  }

  let file = createWriteStream(fileName);
  file.write(
    `This file create with Fivem vehicle name logger!!!\nTotal cars found: ${finalArr.length} \n\n\n\n\n\n[CarNames]` +
      "\n\n"
  );
  arr.forEach((v) => {
    file.write(v + "\n");
  });

  file.write("\n[ERRORS]" + "\n");
  errArr.forEach((v) => {
    file.write(v + "\n");
  });

  file.end();
  console.log(`File '${fileName}' created!`);
};

console.log("Searching...");
getDirectories(fullMainPath, true);
console.log(`\n\n\x1b[1mFrom\x1b[32m ${counter}\x1b[0m\x1b[0m\x1b[1m folders`);
console.log(
  `\x1b[1mWere written\x1b[33m ${finalArr.length} \x1b[0m\x1b[1mspawn names`
);

writeFile(`./../TXT/${txtname}.txt`, finalArr, errorArr);
