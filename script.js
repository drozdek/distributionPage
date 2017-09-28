/**
*
* Create a Distribution Page dynamically.
*
* To create it a config JSON file is required which consists of
* various information about company,
* colors, and text used on template, and images which are needed to
* create a page.
*
*
* Rafal Drozdowski, 2017
*
*/

var fs = require('fs'),
  ejs = require('ejs'),
  ph = require('path'),
  exec = require('child_process').exec,
  os = require('os');

var CFG_FILE = './config/distribution_page_config.json',
  TMPL = './views/tmpl.ejs';

// slice args
var arg = process.argv.slice(2);

// define static cmd for each platform
// to copy folder with its content
if (os.platform() === 'win32') {
  var cmd = {
    'FOLDER_COPY': 'xcopy /E assets ',
  };
}
else if (os.platform() === 'darwin') {
  var cmd = {
    'FOLDER_COPY': 'cp -R assets'
  };
}

switch (arg[0]) {
  case '-i': {
    //increase index to get path
    var paramPath = arg[1];
    // regex to asses if path is correct
    var regex = /\s+/ig;

    var res = regex.test(paramPath);
    if (!res) {
      var normalizedPath = ph.normalize(paramPath);
      createFolder(resolvePath(normalizedPath));

      // execute native commands
      // copy the assets folder
      exec(cmd.FOLDER_COPY + ' ' + paramPath + ph.sep, (err, stdout, stderr) => {
        if (err)
          console.log(err);
        else if (stdout)
          console.log(stdout);
        else if (stderr)
          console.log(stderr);
      });

    }
    else {
      console.log('path incorrect');
    }
    break;
  }
  case '-h':
  case '--help': {
    usage();
  }
  default: {
    usage();
  }
}

if (arg.length === 0) {
  usage();
}

/* error function */
function onError(err) {
  if (err) {
    throw err
    return;
  }
}

/* usage info */
function usage() {
  var ret = '\n Usage: node script.js -i folder_path';
  return console.log(ret);
}

/* save output*/
//var folderName = obj.company_name_header.replace(/\s/, '').toLowerCase();

/* create directory if doesn't exist */
function createFolder(folderName) {
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
    creteDistributionPage(folderName);
  }
  else {
    creteDistributionPage(folderName);
    console.log('Folder ' + folderName + ' exists. Creating a page only.');
  }
}

/* create absoute path */
function resolvePath(path) {
  return ph.resolve(path);
}


/* create a Distribution Page */
function creteDistributionPage(folderName) {

  /* read config file */
  var configFile = fs.readFileSync(CFG_FILE, 'utf8');
  var cfg = JSON.parse(configFile);
  //console.log(cfg);

  /* get all information from config file */
  var obj = {
    company_name: cfg.info.company_name,
    company_subname: cfg.info.company_subname,
    features: cfg.features,
    pictures: cfg.pictures,
    urls: cfg.urls,
    background: cfg.colors.background,
    text: cfg.colors.text,
    video: cfg.video.url
  };

  /* check for empty properties and if are return error */
  for (var x in obj) {
    if (obj[x] === undefined || obj[x] === '') {
      console.error('\n ERROR: ' + x + ' cannot be empty');
      return;
    }
  }


  fs.readFile(TMPL, (err, data) => {
    var data = data.toString();

    var res = ejs.render(data, {
      company_name_header: obj.company_name,
      company_name_subheader: obj.company_subname,
      features: obj.features,
      pictures: obj.pictures,
      urls: obj.urls,
      background: obj.background,
      textColor: obj.text,
      video: obj.video
    });

    // render template with data obj
    ejs.render(TMPL, res);

    fs.writeFile(folderName + '/index.html', res,
      function (err) {
        onError(err);
      }, function () {
        console.log('Success: File saved in folder ' + folderName);
      });

  })

}