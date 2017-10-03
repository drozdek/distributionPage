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

// define static common path 
const commonPath = "/source/FSI_Concept_Advantage_Container/concept_advantage_container";

// get current path
var cPath = __dirname;

// same template for all tenants
var TMPL = cPath + '/../template/tmpl.ejs',

  // config differs for each tenant
  CFG_FILE = cPath + '/config/distribution_page_config.json',

  // define parent folder for tenant apps
  APP_FOLDER = commonPath + '/apps/FSI',

  // same assets folder for all tenants  
  ASSETS_FOLDER = '../assets';

var obj = {};

// slice args 
var arg = process.argv.slice(2);

// define commands for each platform
if (os.platform() === 'win32') {
  var cmd = {
    'folder_copy': 'xcopy /E assets ',
    'folder_create': 'md'
  };
}
else if (os.platform() === 'darwin') {
  var cmd = {
    'folder_copy': 'cp -R ',
    'folder_create': 'mkdir'
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
      // execute native commands
      // copy the assets folder 
      obj.path = APP_FOLDER + ph.sep + paramPath;

      //create folder       
      createFolder(obj.path);

      // create command to execute
      var cmmd = cmd.folder_copy + ASSETS_FOLDER + ' ' + obj.path + '/assets';
      //console.log(cmd);
      exec(cmmd, (err, stdout, stderr) => {
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

/**
* report error
* @method onError
* @param {object} 
*/
function onError(err) {
  if (err) {
    throw err
    return;
  }
}

/**
* @method usage
* @return {object} console
*  
*/
function usage() {
  var ret = '\n Usage: node script.js -i folder_path';
  return console.log(ret);
}

/**
* create folder
* @method createFolder
*/
function createFolder(folderName) {
  createFolderPath(folderName);
}

/**
* resolve path
* @method resolvePath
* @param {string} path
* @return {string} path
*/
function resolvePath(path) {
  return ph.resolve(path);
}

/**
* create distribution html page 
* @method creteDistributionPage
*/
function creteDistributionPage() {

  /* read config file */
  var configFile = fs.readFileSync(CFG_FILE, 'utf8');
  var cfg = JSON.parse(configFile);


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

  console.log('TMPL: ' + TMPL);

  fs.readFile(TMPL, (err, data) => {
    var data = data.toString();

    var res = ejs.render(data, {
      company_name: obj.company_name,
      company_subname: obj.company_subname,
      features: obj.features,
      pictures: obj.pictures,
      urls: obj.urls,
      background: obj.background,
      textColor: obj.text,
      video: obj.video
    });

    // render template with data obj
    ejs.render(TMPL, res);

    APP_FOLDER += ph.sep + arg[1];

    fs.writeFile(APP_FOLDER + '/index.html', res,
      function (err) {
        onError(err);
      }, function () {
        console.log('Success: File saved in folder ' + APP_FOLDER);
      });
  })
}

/**
* @method createFolderPath
* @param {string} path 
* @return {currDir}
*/
function createFolderPath(path) {
  console.log('inside createFolderPath: ' + path);
  const initDir = ph.isAbsolute(path) ? ph.sep : '';
  path.split(ph.sep).reduce((parentDir, childDir) => {
    const curDir = ph.resolve(parentDir, childDir);
    if (!fs.existsSync(curDir)) {
      fs.mkdirSync(curDir);
      creteDistributionPage();
    }
    return curDir;
  }, initDir);
}

