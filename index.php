<?php

/* Files Gallery 0.14.0
www.files.gallery | www.files.gallery/docs/ | www.files.gallery/docs/license/
---
This PHP file is only 10% of the application, used only to connect with the file system. 90% of the codebase, including app logic, interface, design and layout is managed by the app Javascript and CSS files.
---
class Config        / load config with static methods to access config options
class Login         / check and manage logins
class U             / static utility functions
class Path          / static functions to convert and validate file paths
class Json          / JSON response functions
class X3            / helper functions when running Files Gallery alongside X3 www.photo.gallery
class Tests         / outputs PHP, server and config diagnostics by url ?action=tests
class FileResponse  / outputs file, video preview image, resized image and proxies any file by PHP
class ResizeImage   / serves a resized image
class Dirs          / outputs menu json from dir structure
class Dir           / loads data array for a single dir
class File          / returns data array for a single file
class Iptc          / extract IPTC image data from images
class Exif          / extract Exif image data from images
class Filemanager   / functions that handle file operations on server
class Zipper        / create and extract zip files
class Request       / extract parameters for all actions
class CleanCache    / cleans invalid and expired cache files from the _files/cache/* dirs at specific intervals or manually
class Document      / creates the main Files Gallery document response
*/

// class Config / constructor and static methods to access config options
class Config {

  // config defaults / https://www.files.gallery/docs/config/
  // Only edit directly here if it is a temporary installation. Settings here will be lost when updating!
  // Instead, add options into external config file in your storage_path _files/config/config.php (generated on first run)
  public static $default = [
    'root' => '',
    'root_url_path' => null,
    'root_lock' => null,
    'start_path' => false,
    'username' => '',
    'password' => '',
    'load_images' => true,
    'load_files_proxy_php' => false,
    'load_images_max_filesize' => 1000000,
    'image_resize_enabled' => true,
    'image_resize_use_imagemagick' => false,
    'image_resize_cache' => true,
    'image_resize_cache_use_dir' => false,
    'image_resize_dimensions' => 320,
    'image_resize_dimensions_retina' => 480,
    'image_resize_dimensions_allowed' => '',
    'image_resize_quality' => 85,
    'image_resize_function' => 'imagecopyresampled',
    'image_resize_sharpen' => true,
    'image_resize_memory_limit' => 256,
    'image_resize_max_pixels' => 60000000,
    'image_resize_min_ratio' => 1.5,
    'image_resize_cache_direct' => false,
    'folder_preview_image' => true,
    'folder_preview_default' => '_filespreview.jpg',
    'menu_enabled' => true,
    'menu_max_depth' => 5,
    'menu_sort' => 'name_asc',
    'menu_cache_validate' => true,
    'menu_load_all' => false,
    'menu_recursive_symlinks' => true,
    'layout' => 'rows',
    'cache' => true,
    'cache_key' => 0,
    'clean_cache_interval' => 7,
    'clean_cache_allow_manual' => false,
    'image_cache_file' => 'cache.txt',
    'image_cache_max_last_access_time' => 90,
    'image_cache_validate_time' => true,
    'storage_path' => '_files',
    'files_include' => '',
    'files_exclude' => '',
    'dirs_include' => '',
    'dirs_exclude' => '',
    'allow_symlinks' => true,
    'get_mime_type' => false,
    'license_key' => '',
    'download_dir' => 'browser',
    'download_dir_cache' => 'dir',
    'assets' => '',
    'allow_all' => false,
    'allow_upload' => false,
    'allow_delete' => false,
    'allow_rename' => false,
    'allow_new_folder' => false,
    'allow_new_file' => false,
    'allow_duplicate' => false,
    'allow_text_edit' => false,
    'allow_zip' => false,
    'allow_unzip' => false,
    'allow_move' => false,
    'allow_copy' => false,
    'allow_download' => true,
    'allow_mass_download' => false,
    'allow_mass_copy_links' => false,
    'allow_settings' => false,
    'allow_check_updates' => false,
    'allow_tests' => true,
    'allow_tasks' => false,
    'demo_mode' => false,
    'upload_allowed_file_types' => '',
    'upload_max_filesize' => 0,
    'upload_exists' => 'increment',
    'ffmpeg_path' => 'ffmpeg',
    'imagemagick_path' => 'magick',
    'imagemagick_image_types' => 'heif, heic, tiff, tif, psd, dng',
    'use_google_docs_viewer' => false,
    'lang_default' => 'en',
    'lang_auto' => true,
    'index_cache' => false,
  ];

  // global application variables created on new Config()
  public static $version = '0.14.0';  // Files Gallery version
  public static $config = [];         // config array merged from _filesconfig.php, config.php and default config
  public static $localconfigpath = '_filesconfig.php'; // optional config file in current dir, useful when overriding shared configs
  public static $localconfig = [];    // config array from localconfigpath
  public static $storagepath;         // absolute storage path for cache, config, plugins and more, normally _files dir
  public static $storageconfigpath;   // absolute path to storage config, normally _files/config/config.php
  public static $storageconfig = [];  // config array from storage path, normally _files/config/config.php
  public static $cachepath;           // absolute cache path shortcut
  public static $__dir__;             // absolute __DIR__ path with normalized OS path
  public static $__file__;            // absolute __FILE__ path with normalized OS path
  public static $root;                // absolute root path interpolated from config root option, normally current dir
  public static $document_root;       // absolute server document root with normalized OS path
  public static $created = [];        // checks what dirs and files get created by config on ?action=tests

  // config construct created static app vars and merge configs
  public function __construct() {

    // get absolute __DIR__ and __FILE__ paths with normalized OS paths
    self::$__dir__ = Path::realpath(__DIR__);
    self::$__file__ = Path::realpath(__FILE__);

    // load local config _filesconfig.php if exists
    self::$localconfig = $this->load(self::$localconfigpath);

    // create initial config array from default and localconfig
    self::$config = array_replace(self::$default, self::$localconfig);

    // set absolute storagepath, create storage dirs if required, and load, create or update storage config.php
    $this->storage();

    // get server document root with normalized OS path
    self::$document_root = Path::realpath($_SERVER['DOCUMENT_ROOT']);

    // install.php - allow edit settings and create users from interface temporarily when file is named "install.php"
    // useful when installing Files Gallery, allows editing settings and creating users without having to modify config.php manually
    // remember to rename the file back to index.php once you have edited settings and/or created users.
    if(U::basename(__FILE__) === 'install.php') self::$config['allow_settings'] = true;

    // at this point we must check if login is required or user is already logged in, and then merge user config
    new Login();

    // assign root realpath after login user is resolved
    self::$root = Path::valid_root(self::get('root'));

    // error if root path does not exist
    if(!self::$root) U::error('Invalid root dir "' . self::get('root') . '"');

    // shortcut option `allow_all` allows all file actions (except settings, check_updates, tests, tasks)
    if(self::get('allow_all')) foreach (['upload', 'delete', 'rename', 'new_folder', 'new_file', 'duplicate', 'text_edit', 'zip', 'unzip', 'move', 'copy', 'download', 'mass_download', 'mass_copy_links'] as $k) self::$config['allow_'.$k] = true;
  }

  // public shortcut function to get config option Config::get('option')
  public static function get($option){
    return self::$config[$option];
  }

  // public get config comma-delimited string option as array
  public static function get_array($option) {
    $str = self::$config[$option];
    return !empty($str) && is_string($str) ? array_map('trim', explode(',', $str)) : [];
  }

  // load a config file and trim values / returns empty array if file doesn't exist
  private function load($path) {
    if(empty($path) || !file_exists($path)) return [];
    $config = include $path;
    if(empty($config) || !is_array($config)) return [];
    return array_map(function($v){
      return is_string($v) ? trim($v) : $v;
    }, $config);
  }

  // set storagepath from config, create dir if necessary
  private function storage(){

    // ignore storagepath and disable cache settings if storage_path is specifically set to FALSE
    if(self::get('storage_path') === false) {
      foreach (['cache', 'image_resize_cache', 'folder_preview_image'] as $key) self::$config[$key] = false;
      return;
    }

    // shortcut to config storage_path
    $path = rtrim(self::get('storage_path'), '\/');

    // invalid config storage_path can't be empty or non-string
    if(!$path || !is_string($path)) U::error('Invalid storage_path parameter');

    // get request ?action if any, to determine if we attempt to make dirs and files on config construct
    $action = U::get('action');

    // if ?action=tests, check what dirs and files will get created, for tests output
    if($action === 'tests') {
      foreach (['', '/config', '/config/config.php', '/cache/images', '/cache/folders', '/cache/menu'] as $key) {
        if(!file_exists($path . $key)) self::$created[] = $path . $key;
      }
    }

    // only make dirs and config if main document (no ?action, except action tests)
    $make = !$action || $action === 'tests';

    // make storage path dir if it doesn't exist or return error
    if($make) U::mkdir($path);

    // store absolute storagepath
    self::$storagepath = Path::realpath($path);

    // error in case storagepath still doesn't seem to exist from realpath()
    if(!self::$storagepath) U::error('storage_path does not exist and can\'t be created');

    // absolute cache path shortcut
    self::$cachepath = self::$storagepath . '/cache';

    // assign storage config path (normally */_files/config/config.php), from where we load config and save options
    self::$storageconfigpath = self::$storagepath . '/config/config.php';

    // load storage config (normally _files/config/config.php) or return empty array
    self::$storageconfig = $this->load(self::$storageconfigpath);

    // if storage config is not empty, update config by merging default, storageconfig and localconfig
    if(!empty(self::$storageconfig)) self::$config = array_replace(self::$default, self::$storageconfig, self::$localconfig);

    // only make storage dirs and config.php if main document or ?action=tests
    if(!$make) return;

    // create required storage dirs if they don't exist / error on fail
    foreach (['config', 'cache/images', 'cache/folders', 'cache/menu'] as $dir) U::mkdir(self::$storagepath . '/' . $dir);

    // create or update config file if older than index.php
    if(!file_exists(self::$storageconfigpath) || filemtime(self::$storageconfigpath) < filemtime(__FILE__)) self::save();
  }

  // save to config.php in storagepath (normally _files/config/config.php) or create new config.php if file doesn't exist
  public static function save($options = []){

    // merge array of parameters with current storageconfig, and intersect with default, to remove invalida/outdated options
    $save = array_intersect_key(array_replace(self::$storageconfig, $options), self::$default);

    // create exported array string with save values merged into default values, all commented out
    $export = preg_replace("/  '/", "  //'", U::var_export(array_replace(self::$default, $save)));

    // loop save options and un-comment options where values differ from default options (for convenience, only store differences)
    foreach ($save as $key => $value) if($value !== self::$default[$key]) $export = str_replace("//'" . $key, "'" . $key, $export);

    // write formatted config array to config (normally _files/config/config.php)
    return @file_put_contents(self::$storageconfigpath, '<?php ' . PHP_EOL . PHP_EOL . '// CONFIG / https://www.files.gallery/docs/config/' . PHP_EOL . '// Uncomment the parameters you want to edit.' . PHP_EOL . 'return ' . $export . ';');
  }
}

// class Login / check and manage login
class Login {

  // vars
  private $user;                    // config array for logged in user, will merge with main config
  public static $is_logged_in;      // user is logged in flag
  public static $has_public_login;  // public (default config) login exists / in this case, login is required
  public static $is_default_user;   // is default config user (login by username and password from default config.php)

  // start new login check process
  public function __construct() {

    // public (default config) login exists / in this case, login is required / also check X3:login() plugin
    self::$has_public_login = Config::get('username') && Config::get('password') ? true : X3::login();

    // check if there is any login, from default config or users, so we can check session and login attempt or show login form
    if(!self::$has_public_login && !self::users_dir()){
      // unset session token in case it remains in any active session for some reason (probably shouldn't happen)
      if(isset($_SESSION['token'])) unset($_SESSION['token']);
      return;
    }

    // un-comment below to increase login session cookie lifetime to 24 hours (or change it)
    // session_set_cookie_params(86400);

    // PHP session_start() or error
    // check active sessions, session token on login attempt or assign session token on login form
    if(session_status() === PHP_SESSION_NONE && !session_start()) U::error('Failed to initiate PHP session_start()', 500);

    // un-comment below to attempt to extend session timeout in browser and server
    // setcookie(session_name(), session_id(), time() + 3600); // default 0, means logout on browser session (window close)
    // ini_set('session.gc_maxlifetime', '3600'); // default '1440'

    // assign CSRF security $_SESSION['token'] / used in login form to compare with login attempt, and forwarded to the app (JS) so it knows there is login / could be used in all action requests also, but I see the point in that
    $this->set_session_token();

    // detect $_POST login attempt
    if($this->is_login_attempt()) {

      // on successful login, merge user config and login
      if($this->is_successful_login()) return $this->login();

    // check if browser is already logged in by session
    } else if($this->is_logged_in()){

      // ?logout=1 parameter to logout can only apply if user is already logged in
      if(U::get('logout')) {

        // we can return and serve request without login if default config does not require login
        // un-comment the below if you want to redirect to non-login version on logout, instead of showing the login form
        // if(!self::$has_public_login) return $this->clear_session();

        // logout displays login form
        return $this->form();
      }

      // merge user config and login
      return $this->login();

    // if not logged in and default config does not require login (no username or password)
    } else if(!self::$has_public_login) {

      // ?login=1 displays login form when default config does not require login
      if(U::get('login')) {

        // remove $_SESSION['username'] just in case user was removed while session remains
        if(isset($_SESSION['username'])) unset($_SESSION['username']);

      // serve request without login if default config does not require login
      } else return;
    }

    // return error if request is an action (don't display login form)
    if($this->action_request()) return;

    // display form if not logged in or login failed attempt
    $this->form();
  }

  // check if _files/users dir exists and return path
  public static function users_dir(){
    return Config::$storagepath && file_exists(Config::$storagepath . '/users') ? Config::$storagepath . '/users' : false;
  }

  // get usernames from user_dirs()
  public static function get_usernames(){
    return array_map(function($path){
      $arr = explode('/', $path); // get basename, better than basename() in case of multibyte chars
      return end($arr);           // get basename, better than basename() in case of multibyte chars
    }, self::users_dir() ? glob(self::users_dir() . '/*', GLOB_ONLYDIR|GLOB_NOSORT) : []);
  }

  // assign CSRF security $_SESSION['token']
  private function set_session_token(){
    if(isset($_SESSION['token'])) return; // token already set
    $_SESSION['token'] = bin2hex(function_exists('random_bytes') ? random_bytes(32) : openssl_random_pseudo_bytes(32));
  }

  // check if user is already logged in by session
  private function is_logged_in(){

    // exit if session username or login hash is not set
    if(!isset($_SESSION['username']) || !isset($_SESSION['login'])) return false;

    // get user config from $_SESSION username
    $this->user = $this->get_user($_SESSION['username']);

    // logged in if user found login hash matches session login hash
    // may fail if user is deleted or username/password/IP/user-agent/app-location changes
    return $this->user && $this->equals($this->login_hash($this->user), $_SESSION['login']);
  }

  // detect login attempt
  private function is_login_attempt(){

    // on javascript fetch() from non-login interface, we must populate $_POST from php://input
    if(U::get('action') === 'login' && empty($_POST)) $_POST = @json_decode(@trim(@file_get_contents('php://input')), true);

    // is login attempt if $_POST['fusername']
    return !!U::post('fusername');
  }

  // detect successful login attempt
  private function is_successful_login(){

    // login attempt if fusername, fpassword and token in $_POST and 'token' exists in $_SESSION
    if(!U::post('fusername') || !U::post('fpassword') || !U::post('token') || !isset($_SESSION['token'])) return false;

    // make sure $_SESSION token matches $_POST token
    if(!$this->equals($_SESSION['token'], U::post('token'))) return false;

    // get user config from $_POST username
    $this->user = $this->get_user($_POST['fusername']);

    // exit if can't find user or password doesn't match
    if(!$this->user || !$this->passwords_match($this->user['password'], $_POST['fpassword'])) return false;

    // store username in session
    $_SESSION['username'] = $this->user['username'];

    // store login hash specific to user, must match on active sessions
    $_SESSION['login'] = $this->login_hash($this->user);

    // successfull login
    return true;
  }

  // successfully logged in by session or login attempt
  private function login(){

    // list of excluded user config options because they should be global or have no function for user or could cause harm
    // you can add your own options here if you want to prevent some options from being changed per user
    $user_exclude = [
      'root_lock',                        // should be global and pre-assiged in _filesconfig.php
      'image_resize_use_imagemagick',     // should be global
      'image_resize_cache_use_dir',       // should be global
      'image_resize_dimensions',          // should not change per user as it invalidates shared image cache
      'image_resize_dimensions_retina',   // should not change per user as it invalidates shared image cache
      'image_resize_dimensions_allowed',  // should not change per user as it invalidates shared image cache
      'image_resize_quality',             // should not change per user as it invalidates shared image cache
      'image_resize_function',            // should not change per user as it invalidates shared image cache
      'image_resize_sharpen',             // should not change per user as it invalidates shared image cache
      'image_cache_file',                 // should be global
      'image_cache_max_last_access_time', // should be global
      'image_cache_validate_time',        // should be global
      'storage_path',                     // storage path is always global and must be defined in main config
      'ffmpeg_path',                      // should be global
      'imagemagick_path',                 // should be global
      'index_cache',                      // should be global / not available for logged in users anyway
    ];

    // we are hereby logged in
    self::$is_logged_in = true;

    // merge user config into config object
    Config::$config = array_replace(Config::$config, array_diff_key($this->user, array_flip($user_exclude)));
  }

  // clear login-specific session vars, essentially logging out the user
  private function clear_session(){
    foreach (['username', 'login'] as $key) unset($_SESSION[$key]);
  }

  // get user config from login attempt or session
  private function get_user($username){

    // trim username just in case
    $username = trim($username);

    // create lowercase username for case-insensitive comparison
    $lower_username = $this->lower($username);

    // user equals default config user / return username/password array to verify password or session login
    if($this->lower(Config::get('username')) === $lower_username) {
      self::$is_default_user = true; // is default config user
      return [
        'username' => Config::get('username'),
        'password' => Config::get('password')
      ];
    }

    // exit it _files/users dir doesn't exist
    if(!self::users_dir()) return false;

    // check if user config exists at _files/users/$username/config.php without making case-insensitive lookup
    // this should apply in most cases when username is input in identical case or from $_SESSION['username']
    // Mac OS will find user case-insensitive, but that's fine as it doesn't then matter how $_SESSION['username'] is stored
    $user = $this->get_user_config($username);
    if($user) return $user;

    // loop user dirs and make case-insensitive username comparison
    foreach (self::get_usernames() as $username) {
      // case-insensitive username matches user dir, get user config from $dirname with case in tact (for $_SESSION['username'])
      if($lower_username === $this->lower($username)) return $this->get_user_config($username);
    }
  }

  // get user config.php file for a specific user $dirname
  private function get_user_config($dirname){
    $user = U::uinclude("users/$dirname/config.php"); // return user config array
    if(!$user) return; // exit if not found
    // error if the user array does not contain password *required
    if(empty($user['password'])) return $this->error('User does not have valid password');
    // return user array merged with username, which is used for $_SESSION['login'] login_hash()
    return array_replace($user, ['username' => $dirname]);
  }

  // creates a login hash unique for username/password/IP/user-agent/app-location
  private function login_hash($user){
    return md5($user['username'] . $user['password'] . $this->ip() . $this->server('HTTP_USER_AGENT') . __FILE__);
  }

  // compares strings with more secure hash_equals() function (PHP >= 5.6)
  private function equals($secret, $user){
    return function_exists('hash_equals') ? hash_equals($secret, $user) : $secret === $user;
  }

  // match passwords using password_verify() if password is encrypted else use plain equality matching for non-encrypted passwords
  private function passwords_match($stored, $posted){
    if(password_get_info($stored)['algoName'] === 'unknown') return $this->equals($stored, $posted);
    return password_verify($posted, $stored);
  }

  // get client IP for login hash matching
  private function ip(){
    foreach(['HTTP_CLIENT_IP','HTTP_X_FORWARDED_FOR','HTTP_X_FORWARDED','HTTP_FORWARDED_FOR','HTTP_FORWARDED','REMOTE_ADDR'] as $key){
      $ip = explode(',', $this->server($key))[0];
      if($ip && filter_var($ip, FILTER_VALIDATE_IP)) return $ip;
    }
    return ''; // return empty string if nothing found
  }

  // get $_SERVER parameters helpers
  private function server($str){
    return isset($_SERVER[$str]) ? $_SERVER[$str] : '';
  }

  // lowercase username for case-insensitive username validation uses mb_strtolower() if function exists
  private function lower($str){
    return function_exists('mb_strtolower') ? mb_strtolower($str) : strtolower($str);
  }

  // check if request is an action, in which case we return error instead of the form
  private function action_request(){

    // exit if !action (or action is "tests", which requires login from the form)
    if(!U::get('action') || U::get('action') === 'tests') return false;

    // return json error if request is POST
    if($_SERVER['REQUEST_METHOD'] === 'POST') return Json::error('login');

    // login error with login link
    U::error('Please <a href="' . strtok($_SERVER['REQUEST_URI'], '?') . '">login</a> to continue', 401);
  }

  // login page / output form html and exit
  private function form() {

    // get form alert caused by logout, invalid session or incorrect login, before we destroy sessions vars
    $alert = $this->get_form_alert();

    // destroy login-specific session vars on logout or if they are invalid / session_unset()
    $this->clear_session();

    // get login form page header
    U::html_header('Login', 'page-login');

    // login page html / check language and render form via javascript (blocks simple bots)
    ?><body class="page-login-body body-loading"></body>
    <script>

    // get search parameter
    const search = location.search || '';

    // get action submit url but remove ?login and ?logout parameters
    const url = location.pathname + search.replace(/(logout|login)=(1|true)(&?|$)/g, '').replace(/(\?|&)$/, '') + location.hash;

    // history replace ?logout=1 in url to prevent navigating to ?logout=1 from browser back button
    if(search.match(/logout=(1|true)/)) history.replaceState(null, '', url);

    // Javascript Login class checks language and renders form
    class Login {

      // available languages
      langs = ['ar', 'bg', 'cs', 'da', 'de', 'en', 'el', 'es', 'et', 'fi', 'fr', 'hu', 'id', 'it', 'ja', 'ko', 'ms', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sv', 'th', 'tr', 'uk', 'zh'];

      // language object empty (English) by default
      lang = {};

      // render form
      render(lang){

        // re-assign lang object if lang loaded or assigned from localStorage
        if(lang) this.lang = lang;

        // remove loading speinner
        document.body.classList.remove('body-loading');

        // inject form
        document.body.insertAdjacentHTML('afterBegin', `
        <article class="login-container">
          <h1 class="login-header">${ this.getlang('login') }</h1>
          <?php echo $alert; ?>
          <form class="login-form" onsubmit="document.body.classList.add('form-loading')" method="post" action="${ url }">
            <input type="text" class="input" name="fusername" placeholder="${ this.getlang('username') }" required autofocus spellcheck="false" autocorrect="off" autocapitalize="off" autocomplete="off">
            <input type="password" class="input" name="fpassword" placeholder="${ this.getlang('password') }" required spellcheck="false" autocomplete="off">
            <input type="hidden" name="token" value="<?php echo $_SESSION['token']; ?>">
            <div class="login-form-buttons">
              <button type="submit" class="button login-button">${ this.getlang('login') }</button>
              <?php if(!self::$has_public_login) { ?><a href="${ url }" class="button button-secondary login-cancel-button" onclick="document.body.classList.add('form-loading')">${ this.getlang('cancel') }</a><?php } ?>
            </div>
          </form>
        </article>`);
      }

      // get language text Capitalized
      getlang(str){
        let s = this.lang[str] || str;
        return s[0].toUpperCase() + s.slice(1);
      }

      // login constructor, get language then render form
      constructor(){

        // get ?lang= url parameter
        let param = 'URLSearchParams' in window ? new URLSearchParams(location.search).get('lang') : 0;

        // get language code from 1. url param ?lang=xX, 2. localStorage, 3. navigator.languages[], 4. lang_default, 5. English
        let lang_code = [
          param,
          param !== 'reset' ? storage('files:lang:current') : 0,
          <?php if(Config::get('lang_auto')) { ?>...(navigator.languages ? navigator.languages : [navigator.language || '']).map(l => l.toLowerCase().split('-')[0]),<?php } ?>
          '<?php echo Config::get('lang_default'); ?>'
        ].find(l => l && this.langs.includes(l)) || 'en';

        // render form if language is English
        if(lang_code === 'en') return this.render();

        // check if we have language already loaded into localStorage / try-catch in case localStorage is not json
        let local = storage(`files:lang:${ lang_code }`);
        if(local) try { return this.render(JSON.parse(local)) } catch (e) {};

        // load json language file and render form with loaded language file / on error, render default English
        fetch(`<?php echo U::assetspath() ?>files.photo.gallery@<?php echo Config::$version ?>/lang/${ lang_code }.json`)
          .then(response => response.ok ? response.json() : 0)
          .then(json => {
            this.render(json);
            if(json) storage(`files:lang:${ lang_code }`, JSON.stringify(json));
          }).catch(e => this.render());
      }
    }

    // start login load language and render form
    new Login();
    </script>
    </html><?php exit; // end form and exit
  }

  // get alert string for login form
  private function alert($text, $type = 'danger'){
    return '<div class="alert alert-' . $type . '" role="alert">${ this.getlang("' . $text . '") }</div>';
  }

  // outputs an alert in login form on logout, incorrect login or session ID mismatch
  private function get_form_alert(){

    // failed login attempt, normally wrong username or password, although could be invalid login token
    if(isset($_POST['fusername'])) return $this->alert('invalid login', 'danger');

    // logged out by ?logout=1 or cookie/session expired or username/password/IP/user-agent/app-location changed
    return isset($_SESSION['username']) ? $this->alert('you were logged out', 'warning') : '';
  }
}

// class U / static utility functions (short U because I want compact function access)
class U {

  // get file basename / basically just a wrapper in case it needs to be refined on some servers
  public static function basename($path){
    return basename($path); // because setlocale(LC_ALL,'en_US.UTF-8')
    // OPTIONAL: replace basename() which may fail on UTF-8 chars if locale != UTF8
    //$arr = explode('/', str_replace('\\', '/', $path));
    //return end($arr);
  }

  // get mime type for file
  public static function mime($path){
    if(function_exists('mime_content_type')) return mime_content_type($path);
    if(function_exists('finfo_file')) return finfo_file(finfo_open(FILEINFO_MIME_TYPE), $path);
    return false;
  }

  // get file extension with options to lowercase and include dot
  public static function extension($path, $lowercase = false, $dot = false) {
  	$ext = pathinfo($path, PATHINFO_EXTENSION);
  	if(!$ext) return '';
  	if($lowercase) $ext = strtolower($ext);
  	if($dot) $ext = '.' . $ext;
  	return $ext;
  }

  // glob() wrapper for reading paths / escape [brackets] in folder names (it's complicated)
  public static function glob($path, $dirs_only = false){
    if(preg_match('/\[.+]/', $path)) $path = str_replace(['[',']', '\[', '\]'], ['\[','\]', '[[]', '[]]'], $path);
    return @glob($path, $dirs_only ? GLOB_NOSORT|GLOB_ONLYDIR : GLOB_NOSORT);
  }

  // get $_POST parameter or false
  public static function post($param){
  	return isset($_POST[$param]) && !empty($_POST[$param]) ? $_POST[$param] : false;
  }

  // get $_GET parameter or false
  public static function get($param){
  	return isset($_GET[$param]) && !empty($_GET[$param]) ? $_GET[$param] : false;
  }

  // make dir unless it already exists, error if fail
  public static function mkdir($path){
    if(!file_exists($path) && !mkdir($path, 0777, true)) U::error('Failed to create ' . $path, 500);
  }

  // helper function to check for and include various files html, php, css and js from storage_path _files/*
  public static function uinclude($file){
    if(!Config::$storagepath) return;
    $path = Config::$storagepath . '/' . $file;
    if(!file_exists($path)) return;
    $ext = U::extension($path);
    if(in_array($ext, ['html', 'php'])) return include $path;
    $src = Path::urlpath($path); // get urlpath for public resource
    if(!$src) return; // return if storagepath is non-public (not inside document root)
    $src .= '?' . filemtime($path); // append modified time of file, so updated resources don't get cached in browser
    if($ext === 'js') echo '<script src="' . $src . '"></script>';
    if($ext === 'css') echo '<link href="' . $src . '" rel="stylesheet">';
  }

  // attempt to ini_get($directive)
  public static function ini_get($directive){
    $val = function_exists('ini_get') ? @ini_get($directive) : false;
    return is_string($val) ? trim($val) : $val;
  }

  // get php ini value to bytes
  public static function ini_value_to_bytes($directive) {
    $val = U::ini_get($directive);
    if(empty($val) || !is_string($val)) return 0;
    if(function_exists('ini_parse_quantity')) return @ini_parse_quantity($val) ?: 0;
  	if(!preg_match('/^(\d+)([G|M|K])?$/i', trim($val), $m)) return 0;
  	if(!isset($m[2])) return (int) $m[1];
  	return (int) $m[1] *= ['G' => 1024 * 1024 * 1024, 'M' => 1024 * 1024, 'K' => 1024][strtoupper($m[2])];
  }

  // get memory limit in MB (if available) so we can calculate memory for image resize operations
  // cache result $memory_limit_mb because it runs in image file loops
  private static $memory_limit_mb;
  public static function get_memory_limit_mb() {
    if(isset(self::$memory_limit_mb)) return self::$memory_limit_mb;
    $val = U::ini_value_to_bytes('memory_limit');
    return self::$memory_limit_mb = $val ? $val / 1024 / 1024 : 0; // convert bytes to M
  }

  // get and validate path for exec() apps imagemagick and ffmpeg
  public static function app_path($app){
    if(!Config::get($app . '_path') || !function_exists('exec')) return;
    $path = escapeshellarg(Config::get($app . '_path'));
    // app is available and path is valid if we can detect -version and there are no errors
    return @exec("$path -version", $output, $result_code) && !$result_code ? $path : false;
  }

  // detect imagemagick type and cache response (because it might be used in files loop)
  private static $imagemagick;
  public static function imagemagick(){
    if(isset(self::$imagemagick)) return self::$imagemagick;
    // PHP imagick extension if available
    if(extension_loaded('imagick')) return self::$imagemagick = 'imagick';
    // imagemagick is available from command-line
    if(U::app_path('imagemagick')) return self::$imagemagick = 'imagemagick';
    // not avaialble
    return self::$imagemagick = false;
  }

  // readfile() wrapper function to output file with tests, clone option and headers
  public static function readfile($path, $mime, $message = false, $cache = false, $clone = false){
    if(!$path || !file_exists($path)) return false;
    if($clone && @copy($path, $clone)) U::message('cloned to ' . U::basename($clone));
    if(isset($_SERVER['HTTP_RANGE'])) return self::http_range($path, $mime, $message); // support HTTP_RANGE partial content requests
    U::header($message, $cache, $mime, filesize($path), 'inline', U::basename($path));
    if(!is_readable($path) || readfile($path) === false) U::error('Failed to read file ' . U::basename($path), 400);
    exit;
  }

  // readfile() support HTTP_RANGE requests (large video, pdf etc) when files are served through PHP
  private static function http_range($path, $mime, $message){
    // parse range start end
    list(, $range) = explode('=', $_SERVER['HTTP_RANGE'], 2);
    if(strpos($range, ',') !== false) U::error('Requested Range Not Satisfiable', 416);
    list($start, $end) = explode('-', $range);
    // vars
    $filesize = filesize($path);
    $offset = intval($start);
    $end = $end ? intval($end) : $filesize - 1;
    $length = $end - $offset + 1;
    // headers
    http_response_code(206); // 206 Partial Content
    header("Content-Range: bytes $offset-$end/$filesize");
    U::header($message, false, $mime, $length, 'inline', U::basename($path));
    // open and start stream
    $fp = fopen($path, 'rb');
    fseek($fp, $offset);
    $bufferSize = 8192;
    while (!feof($fp) && ($length > 0)) {
      $read = ($length > $bufferSize) ? $bufferSize : $length;
      echo fread($fp, $read);
      $length -= $read;
      flush();
    }
    fclose($fp);
    exit;
  }

  // return an array of supported PHP GD image resize types //
  public static function gd_image_types(){
    return array_merge(['jpeg', 'jpg', 'png', 'gif'], array_filter(['webp', 'bmp', 'avif'], function($type){
      return function_exists('imagecreatefrom' . $type);
    }));
  }

  // return an array of supported and commonly used imagemagick image types (which aren't already available in gd_image_types)
  public static function imagemagick_image_types(){
    return U::imagemagick() ? Config::get_array('imagemagick_image_types') : [];
  }

  // return an array of supported image resize types, combine gd_image_types and imagemagick_image_types
  // forwarded to javascript and used to determine what types can be used for folder preview
  public static function resize_image_types(){
    return array_merge(U::gd_image_types(), U::imagemagick_image_types());
  }

  // common error response with response code, error message and json option
  // 400 Bad Request, 403 Forbidden, 401 Unauthorized, 404 Not Found, 500 Internal Server Error
  public static function error($error = 'Error', $http_response_code = false, $is_json = false){
    if($is_json) return Json::error($error);
    if($http_response_code) http_response_code($http_response_code);
    U::header("[ERROR] $error", false);
  	exit("<h3>Error</h3>$error.");
  }

  // creates a 6-cipher md5 hash from a string or array of strings / used for cache paths and cache hashes based on config options
  public static function hash($data){
    return substr(md5(is_array($data) ? implode(':', $data) : $data), 0, 6);
  }

  // create a menu hash based on relevant $config and $root / used in menu cache file name and when cleaning cache
  // $paths.$options / for example $paths.$options.$mtime.json / 890b15.3ed872.1744195867.json
  public static function get_menu_hash($config, $root){
    // hash segment from $paths that affect menu output
    $paths = [
      Config::$document_root,
      Config::$__dir__,
      $root
    ];
    // hash segment from $options that affect menu output
    $options = [
      Config::$version,
      $config['cache_key'],
      $config['menu_max_depth'],
      $config['dirs_include'],
      $config['dirs_exclude'],
      $config['menu_sort'],
      $config['menu_load_all']
    ];
    // when menu_load_all enabled, we need to include further config options in menu hash
    if($config['menu_load_all']) $options = array_merge($options, [
      $config['files_include'],
      $config['files_exclude'],
      U::image_resize_cache_direct($config)
    ]);
    // return hash $paths.$options
    return U::hash($paths) . '.' . U::hash($options);
  }

  // get dirs hash for a specific $config and $root / used in cache file names (with md5(path) and filemtime) and to determine valid cache
  // all options here may dirs json output, so must be included in the hash
  public static function get_dirs_hash($config, $root){
    return U::hash([
      Config::$document_root,
      Config::$__dir__,
      $root,
      Config::$version,
      U::image_resize_cache_direct($config),
      $config['cache_key'],
      $config['files_include'],
      $config['files_exclude'],
      $config['dirs_include'],
      $config['dirs_exclude']
    ]);
  }

  // get current dirs hash and cache it (available for new Dir() loop operations)
  private static $current_dirs_hash;
  public static function get_current_dirs_hash(){
    if(self::$current_dirs_hash) return self::$current_dirs_hash;
    return self::$current_dirs_hash = self::get_dirs_hash(Config::$config, Config::$root);
  }

  // check if image_resize_cache_direct is enabled for a specific $config alongside required settings
  public static function image_resize_cache_direct($config){
    return $config['image_resize_cache_direct'] && $config['load_images'] && $config['image_resize_cache'] && $config['image_resize_enabled'];
  }

  // image_resize_dimensions_retina (serve larger dimension resized images for HiDPI screens) with cached response
  private static $image_resize_dimensions_retina;
  public static function image_resize_dimensions_retina(){
    if(isset(self::$image_resize_dimensions_retina)) return self::$image_resize_dimensions_retina;
    $retina = intval(Config::get('image_resize_dimensions_retina'));
    return self::$image_resize_dimensions_retina = $retina > Config::get('image_resize_dimensions') ? $retina : false;
  }

  // get common html header for main document and login page
  public static function html_header($title, $class){
  ?>
  <!doctype html><!-- www.files.gallery -->
  <html class="<?php echo $class; ?>" data-theme="contrast">
    <script>

    // fail-safe localStorage helper function
    function storage(item, val) {
      try {
        return val ? localStorage.setItem(item, val) : localStorage.getItem(item);
      } catch (e) {
        return false;
      };
    }

    // get theme from localStorage or system default
    let theme = storage('files:theme') || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'contrast');

    // if theme is not 'contrast' (default theme) then must data-theme in <html>
    if(theme !== 'contrast') document.documentElement.dataset.theme = theme;
    </script>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1">
      <meta name="robots" content="noindex, nofollow">
      <link rel="apple-touch-icon" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADABAMAAACg8nE0AAAAD1BMVEUui1f///9jqYHr9O+fyrIM/O8AAAABIklEQVR42u3awRGCQBBE0ZY1ABUCADQAoEwAzT8nz1CyLLszB6p+B8CrZuDWujtHAAAAAAAAAAAAAAAAAACOQPPp/2Y0AiZtJNgAjTYzmgDtNhAsgEkyrqDkApkVlsBDsq6wBIY4EIqBVuYVFkC98/ycCkr8CbIr6MCNsyosgJvsKxwFQhEw7APqY3mN5cBOnt6AZm/g6g2o8wYqb2B1BQcgeANXb0DuwOwNdKcHLgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeA20mArmB6Ugg0NsCcP/9JS8GAKSlVZMBk8p1GRgM2R4jMHu51a/2G1ju7wfoNrYHyCtUY3zpOthc4MgdNy3N/0PruC/JlVAwAAAAAAAAAAAAAAABwZuAHuVX4tWbMpKYAAAAASUVORK5CYII=">
      <meta name="mobile-web-app-capable" content="yes">
      <title><?php echo $title; ?></title>
      <link href="<?php echo U::assetspath(); ?>files.photo.gallery@<?php echo Config::$version ?>/css/files.css" rel="stylesheet">
      <?php // various custom includes
      U::uinclude('include/head.html');
      U::uinclude('css/custom.css');
      if(Login::$is_logged_in && !Login::$is_default_user) U::uinclude('users/' . Config::get('username') . '/css/custom.css');
      ?>
    </head>
  <?php
  }

  // output file as download using correct headers and readfile() / used to download zip and force download single files
  public static function download($file, $message, $mime, $filename){
    U::header($message, false, $mime, filesize($file), 'attachment', $filename);
    while (ob_get_level()) ob_end_clean();
    return readfile($file) !== false;
  }

  // assign assets url for plugins, Javascript, CSS and languages, defaults to CDN https://www.jsdelivr.com/
  // if you want to self-host assets: https://www.files.gallery/docs/self-hosted-assets/
  private static $assetspath;
  public static function assetspath(){
    if(self::$assetspath) return self::$assetspath;
    return self::$assetspath = Config::get('assets') ? rtrim(Config::get('assets'), '/') . '/' : 'https://cdn.jsdelivr.net/npm/';
  }

  // response headers

  // cache time 1 year for cacheable assets / can be modified if you really need to
  public static $cache_time = 31536000;

  // array of messages to go into files-response header
  private static $messages = [];

  // add messages (string or array) to files-response header
  public static function message($items = []){
    self::$messages = array_merge(self::$messages, is_string($items) ? [$items] : array_filter($items));
  }

  // set request response headers, including files-message header for diagnosing response
  public static function header($message, $cache = null, $type = false, $length = 0, $disposition = false, $filename = ''){

    // prepend main $message to $messages array
    if($message) array_unshift(self::$messages, $message);

    // append PHP response time to $messages
    if(isset($_SERVER['REQUEST_TIME_FLOAT'])) self::$messages[] = round(microtime(true) - $_SERVER['REQUEST_TIME_FLOAT'], 3) . 's';

    // append memory usage to $messages
    if(function_exists('memory_get_peak_usage')) self::$messages[] = round(memory_get_peak_usage() / 1048576, 1) . 'M';

    // assign files-message header with all $messages
    header('files-response: ' . implode(' | ', self::$messages));

    // cache response headers
    if($cache){
      $shared = Login::$is_logged_in ? 'private' : 'public'; // private or shared cache depending on login
      header('expires: ' . gmdate('D, d M Y H:i:s \G\M\T', time() + self::$cache_time));
      header('cache-control: ' . $shared . ', max-age=' . self::$cache_time . ', s-maxage=' . self::$cache_time . ', immutable');

    // no cache response headers if specifically set to false (if null, don't do anything)
    } else if($cache === false){
      header('cache-control: no-store, must-revalidate');
    }

    // assign content-type header
    if($type) header("content-type: $type");

    // assign content-length header / only assigned when reading actual files on disk when we can get filesize()
    if($length) header("content-length: $length");

    // assign content-disposition when reading files on disk, assigned to either 'inline' or 'attachment'
    if($disposition) header('content-disposition: ' . $disposition . '; filename="' . addslashes($filename) . '"');
  }

  // save config file, validate array, check root and encrypt password
  public static function save_config_file($dir, $data, $check_pass = false){

    // some minimal validation on the config data before attempting to save
    if(@preg_match_all("/^<\?php|return|password/", $data) < 3) return Json::error('Invalid user config');

    // create a test file to validate and encrypt password before we save to config
    $test_file = "$dir/test.php";

    // must be able to save test config
    if(!@file_put_contents($test_file, $data)) return Json::error('Failed to write user config');

    // get test file array
    try {
      $test = @include $test_file;
    } catch (Exception $e) {
      @unlink($test_file);
      return Json::error('Invalid config');
    }

    // silently delete the test file
    @unlink($test_file);

    // validate as array
    if(!is_array($test)) return Json::error('Invalid config');

    // validate root dir if `root` option is set
    if(!empty($test['root']) && !Path::valid_root($test['root'])) return Json::error('Invalid root dir');

    // password must exist
    if($check_pass && empty($test['password'])) return Json::error('Config must contain a password');

    // encrypt password / automatically encrypt passwords / bypass by saving passwords inside "double-quotes"
    if(!empty($test['password']) && password_get_info($test['password'])['algoName'] === 'unknown'){
      // hash and escape single-quotes for insert into array
      $hashed = str_replace("'", '\'', password_hash($test['password'], PASSWORD_DEFAULT));
      // replace password
      $data = str_replace('%PASS%', "'password' => '$hashed'" , preg_replace("/'password'\s?=>\s?'(.+)'/", '%PASS%', $data));
    }

    // save config.php
    if(!@file_put_contents("$dir/config.php", $data)) return Json::error('Failed to write config file');

    // return data
    return $data;
  }

  // var_export response with [] instead of array () / used for automatic config.php creation and ?tests=1 output
  public static function var_export($arr){
    return rtrim(str_replace('array (', '[', var_export($arr, true)), ')') . ']';
  }

  // check if a specific resize width value is allowed in config
  // checks image_resize_dimensions / image_resize_dimensions_retina / image_resize_dimensions_allowed
  public static function resize_is_allowed($width){
    if(empty($width) || !is_numeric($width)) return false;
    if($width === Config::get('image_resize_dimensions')) return true;
    if($width === Config::get('image_resize_dimensions_retina')) return true;
    // check image_resize_dimensions_allowed array
    $allowed = Config::get('image_resize_dimensions_allowed') ?: [];
    return in_array($width, array_filter(array_map('intval', is_array($allowed) ? $allowed : explode(',', $allowed))));
  }

  // ensure that $dir/_files dir exists if using image_resize_cache_use_dir / called from image/video/pdf image requests
  public static function ensure_files_dir($file){
    if(!Config::get('image_resize_cache_use_dir')) return; // exit if config image_resize_cache_use_dir is disabled
    $dir = dirname($file);                          // get parent dir of file where we will create the */_files dir
    if(file_exists("$dir/_files")) return;          // exit if _files dir already exists
    $filemtime = filemtime($dir);                   // store filemtime so we can set it back after mkdir()
    if(!@mkdir("$dir/_files", 0777)) return U::error('Failed to create /_files dir', 500); // mkdir() or error
    @touch($dir, $filemtime);                       // update dir modified time to what it was so that cache doesn't invalidate
  }

  // add new cache entry in _files/cache/images/cache.txt file
  public static function image_cache_file_append($cache, $path){
    if(!$cache || !$path || !Config::$cachepath || !Config::get('image_cache_file') || Config::get('image_resize_cache_use_dir')) return;
    $cache_file = Config::$cachepath . '/images/' . Config::get('image_cache_file'); // _files/cache/images/cache.txt
    $entry = PHP_EOL . U::basename($cache) . ':' . $path;// . PHP_EOL; // new line d4e1a4.466757.1743061702.480.jpg:/full/path/to/image.jpg
    @file_put_contents($cache_file, $entry, FILE_APPEND); // append new line (fastest and least complicated way to store entries)
  }

  // clean _files/cache/$type/*.json cache files for a specific $hash when there is no matching cache $filemtime
  public static function clean_json_cache_hash($type, $hash){
    if(!Config::$storagepath || !Config::get('cache')) return; // exit if !cache dir
    $dir = Config::$storagepath . '/cache/' . $type; // get cache dir path
    $files = file_exists($dir) ? @glob("$dir/$hash.*.json") : false; // get invalid $hash.filemtime.json file in cache dir
    if(!empty($files)) foreach ($files as $file) @unlink($file); // delete all invalid
  }
}

// class Path / various static functions to convert and validate file paths
class Path {

  // returns resolved absolute paths and normalizes slashes across OS / returns false if file does not exist
  public static function realpath($path){
    $realpath = realpath($path);
    return $realpath ? str_replace('\\', '/', $realpath) : false;
  }

  // return absolute root path if config root string is valid
  public static function valid_root($str){

    // get root realpath from string
    $root = Path::realpath($str);

    // root does not exist (or is not dir or is not readable or equals storage path)
    if(!$root || !is_dir($root) || Config::$storagepath === $root) return false;

    // return valid root if `root_lock` option is empty (default)
    if(!Config::get('root_lock')) return $root;

    // get root_lock realpath
    $root_lock = Path::realpath(Config::get('root_lock'));

    // invalid root_lock dir (doesn't exist or inaccessible)
    if(!$root_lock) return false;

    // root is invalid it it's not within root_lock dir / check resolved path and relative paths, in case root is symlink
    if(!Path::is_within_path($root, $root_lock) && !Path::is_within_path($str, Config::get('root_lock'))) return false;

    // return valid $root
    return $root;
  }

  // get absolute path by appending relative path to root path (does not resolve symlinks)
  public static function rootpath($relpath){
    return Config::$root . (strlen($relpath) ? "/$relpath" : ''); // check paths with strlen() in case dirname is '0'
  }

  // get relative path from full root path / used as internal reference and in query ?path/path
  public static function relpath($path){
    return trim(substr($path, strlen(Config::$root)), '\/');
  }

  // determines if root is accessible by URL and returns the root url path, which in turn allows files to be accessible by url
  private static function get_root_url_path(){

    // custom root url path if config `root_url_path` is assigned
    if(is_string(Config::get('root_url_path'))) return Config::get('root_url_path');

    // get $root url path (either within app dir with relaitve path or within document root with root-relative path)
    $rooturlpath = self::urlpath(Config::$root);

    // return root urlpath if set
    if($rooturlpath) return $rooturlpath === '.' ? '' : $rooturlpath;

    // exit unless root is a symlink
    // at this point, when `root` resolves outside of document root, we have to assume it's not directly accessible by url
    // if you know your `root` is accessible by url somehow (nginx/apache/symlink), you can use the `root_url_path` config option
    if(!is_link(Config::get('root'))) return false;

    // in case someone wants to entirely disable resolving url path from root symlinks that point outside of document root
    if(Config::get('root_url_path') === FALSE) return false;

    // SYMLINK helpers
    // because it's useful to point root to symlinks that might be in, but resolve outside document root

    // assign $root shortcut just to make things more readable
    $root = Config::get('root');

    // don't mess around with absolute paths that point to symlinks outside of document root, as it's pointless and complicated
    if(preg_match('/:\/|^\/|^\\\/', $root)) return false;

    // to create a base app or root relative path, we need to trim orders
    $trimmed_root = trim($root, './');

    // check if root traverses up into parent dirs somewhere, and count traversal depth
    $root_parent_depth = substr_count($root, '..');

    // if root does not traverse parent dirs, we can assume it's relative to app (index.php)
    // re-check if trimmed relative path exists and return app relative path
    if(!$root_parent_depth) return file_exists($trimmed_root) ? $trimmed_root : false;

    // attempt to assemble /root-relative path if root traverses up into parent dirs
    // must check PHP_SELF for comparison and PHP > 7
    if(!isset($_SERVER['PHP_SELF']) || version_compare(PHP_VERSION, '7.0.0') < 0) return false;

    // PHP_SELF determines application root url path, so we can check root parent compared to application path
    $php_self = $_SERVER['PHP_SELF'];

    // get relative url depth of self (-1 because includes trailing slash with filename /path/index.php)
    $php_self_depth = substr_count($php_self, '/') - 1;

    // exit if root parent depth extends beyond php self depth
    if($root_parent_depth > $php_self_depth) return false;

    // assemble root-relative url path by traversing php_self
    return rtrim(dirname($php_self, $root_parent_depth + 1), '/') . '/' . $trimmed_root;
  }

  // create url path for a file from $root_url_path + file relative path / used for dir data, get_downloadables and uploads
  private static $root_url_path;
  public static function rooturlpath($rel){

    // $root_url_path only needs to be assigned once when required
    if(!isset(self::$root_url_path)) self::$root_url_path = self::get_root_url_path();

    // return false if if $root_url_path is false
    if(self::$root_url_path === FALSE) return false; //return self::urlpath($path);

    // return $root_url_path if relative path is empty (would be the root dir)
    if(!$rel) return self::$root_url_path;

    // assemble url path for file from $root_url_path and $rel
    return self::$root_url_path . (in_array(self::$root_url_path, ['', '/']) ? '' : '/') . $rel;
  }

  // get public url path relative to script or server document root
  public static function urlpath($path){

    // first check if $path is inside app __dir__ in which case we can return app-relative url path, even if $path !is_within_docroot()
    if(self::is_within_appdir($path)) return $path === Config::$__dir__ ? '.' : substr($path, strlen(Config::$__dir__) + 1);

    // exit if $path is not within server document root (we can only assemble url if $path is relative to app or document root)
    if(!self::is_within_docroot($path)) return false;

    // return document root-relative url path
    return $path === Config::$document_root ? '/' : substr($path, strlen(Config::$document_root));
  }

  // determine if $path has url path, with $path either being inside app dir (index.php) or inside document root
  public static function has_urlpath($path){
    return self::is_within_appdir($path) || self::is_within_docroot($path);
  }

  // determines if a path is equal to or inside another path / append slash so that path/dirx/ does not match path/dir/
  public static function is_within_path($path, $root){
    return $path && strpos($path . '/', $root . '/') === 0;
  }

  // determines if $path is within application dir (so we can determine if it's accessible by relative url)
  public static function is_within_appdir($path){
    return self::is_within_path($path, Config::$__dir__);
  }

  // determines if $path is within server document root (so we can determine if it's accessible by root-relative url)
  public static function is_within_docroot($path){
    return $path && self::is_within_path($path, Config::$document_root);
  }

  // get cache path for resized image/video/pdf files
  public static function imagecachepath($path, $resize, $filesize, $filemtime){
    // store cache in $dir/_files/* if image_resize_cache_use_dir is enabled ($dir/_files/{filename.jpg}.jpg)
    if(Config::get('image_resize_cache_use_dir')) return dirname($path) . '/_files/' . U::basename($path) . ($resize === 'convert' ? '.convert' : '') . '.jpg';
    // use _files/cache/images/$hash.filesize.$filemtime.$resize.jpg
    return Config::$cachepath . '/images/' . U::hash($path) . ".$filesize.$filemtime.$resize.jpg";
  }

  // determines if relative path is valid, and returns full rootpath or false if invalid
  public static function valid_rootpath($relpath, $is_dir = false){

    // invalid if path is false (might be previously unresolved)
    if($relpath === false) return;

    // invalid if is file and path is empty (path can be '' empty string for root dir)
    if(!$is_dir && empty($relpath)) return;

    // relative path should never start or end with slash/
    if(preg_match('/^\/|\/$/', $relpath)) return;

    // get root path from relative path
    $rootpath = self::rootpath($relpath);

    // realpath may differ from rootpath if symlinked or if relpath contains parent ../ paths
    $realpath = self::realpath($rootpath);

    // invalid if file does not exist
    if(!$realpath) return;

    // additional security checks if realpath differs from rootpath, and realpath is no longer within root
    // blocks potential abuse of relative paths like ?path/../../../../dir
    if($realpath !== $rootpath && !self::is_within_path($realpath, Config::$root)) {
      if(strpos(($is_dir ? $relpath : dirname($relpath)), ':') !== false) return; // dir may not contain ':'
      if(strpos($relpath, '..') !== false) return; // path may not contain '..'
      //if(self::is_exclude($realpath, $is_dir, true)) return; // check is_exclude also on realpath / seems pointless ...
    }

    // is invalid
    if(!is_readable($realpath)) return;        // not readable
    if($is_dir && !is_dir($realpath)) return;  // invalid dir
    if(!$is_dir && !is_file($realpath)) return;// invalid file
    if(self::is_exclude($rootpath, $is_dir)) return; // rootpath is excluded

    // return full path
    return $rootpath;
  }

  // determine if path should be excluded from displaying in the gallery
  public static function is_exclude($path = false, $is_dir = true, $symlinked = false){

    // is not excluded if empty or path is root
    if(!$path || $path === Config::$root) return;

    // exclude relative paths that start with _files* (reserved for hidden items)
    if(strpos('/' . self::relpath($path), '/_files') !== false) return true;

    // exclude Files Gallery PHP application name (normally "index.php" but could be renamed)
    if($path === Config::$__file__) return true;

    // exclude symlinks if symlinks not allowed (symlinks might be sensitive)
    if($symlinked && !Config::get('allow_symlinks')) return true;

    // exclude Files Gallery storage_path (normally _files dir relative to PHP file)
    if(Config::$storagepath && self::is_within_path($path, Config::$storagepath)) return true;

    // dir path to check with `dirs_include` and `dirs_exclude` options
    $dirname = $is_dir ? $path : dirname($path);

    // check dirs_include and dirs_exclude, unless dir is root (root can't be excluded)
    if($dirname !== Config::$root){

      // exclude if `dirs_include` is assigned and $dirname does not match dirs_include regex
      if(Config::get('dirs_include') && !preg_match(Config::get('dirs_include'), self::relpath($dirname))) return true;

      // exclude if `dirs_exclude` is assigned and $dirname matches dirs_exclude regex
      if(Config::get('dirs_exclude') && preg_match(Config::get('dirs_exclude'), self::relpath($dirname))) return true;
    }

    // check files_include and files_exclude
    if(!$is_dir){

      // get file basename
      $filename = U::basename($path);

      // exclude if file is local config file (normally _filesconfig.php)
      if($filename === Config::$localconfigpath) return true;

      // exclude if `files_include` is assigned and $filename does not match files_include regex
      if(Config::get('files_include') && !preg_match(Config::get('files_include'), $filename)) return true;

      // exclude if `files_exclude` is assigned and $filename matches files_exclude regex
      if(Config::get('files_exclude') && preg_match(Config::get('files_exclude'), $filename)) return true;
    }
  }
}

// class Json / JSON response functions
class Json {

  // output json from array and exit
  public static function jexit($arr = []){
    header('content-type: application/json');
    exit(json_encode($arr));
  }

  // json error with message
  public static function error($error = 'Error'){
    self::jexit(['error' => $error]);
  }

  // output json from array and cache as .json / used by class dirs and class dir
  public static function cache($arr = [], $message = false, $cache = true){
    $json = empty($arr) ? '{}' : @json_encode($arr, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PARTIAL_OUTPUT_ON_ERROR);
    if(empty($json)) self::error(json_last_error() ? json_last_error_msg() : 'json_encode() error');
  	if($cache) @file_put_contents($cache, $json);
    U::message(['cache ' . ($cache ? 'ON' : 'OFF') ]);
    U::header($message, false, 'application/json;');
  	echo $json;
  }
}

// class X3 / functions if running Files Gallery alongside X3 www.photo.gallery
class X3 {

  // vars
  private static $path; // cache absolute X3 path
  private static $inc = '/app/x3.inc.php'; // relative path to the X3 include file that is used for checking and invalidating cache

  // checks if Files Gallery root points into X3 content and returns path to X3 root
  public static function path(){
    if(isset(self::$path)) return self::$path; // serve previously resolved path
    // loop resolved path and original config path, in case resolved path was symlinked
    foreach ([Config::$root, Config::get('root')] as $path) {
      // match /content and check if /app/x3.inc.php exists in parent
      if($path && preg_match('/(.+)\/content/', $path, $match) && file_exists($match[1] . self::$inc)) return self::$path = Path::realpath($match[1]);
    }
    // no match found
    return self::$path = false;
  }

  // attempt to load x3-login if 1. root is X3 path, 2. there is no existing login, 3. files.x3-login.php exists
  public static function login(){
    return self::path() && U::uinclude('plugins/files.x3-login.php');
  }

  // get public url path of X3, used to render X3 thumbnails instead of thumbs created by Files Gallery
  public static function x3_path(){
    return self::path() ? Path::urlpath(self::path()) : false;
  }

  // on Filemanager actions, invalidate X3 cache updating modified time of x3.inc.php
  public static function invalidate(){
    if(self::path()) @touch(self::path() . self::$inc);
  }
}

// class Tests / outputs PHP, server and config diagnostics by url ?action=tests
class Tests {

  // html response
  private $html = '';

  // construct new Tests()
  function __construct() {

    // display all errors to catch anything unusual
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    // first let's check if new Config() created dirs and files in storagepath
    $this->created();

    // title, version, server name, PHP version and server software
    $this->html .= '<h2>Files Gallery ' . Config::$version . '</h2>';
    if(isset($_SERVER['SERVER_NAME'])) $this->prop('<b>'.$_SERVER['SERVER_NAME'].'</b>');
    $this->prop('<b>PHP ' . phpversion().'</b>');
    if(isset($_SERVER['SERVER_SOFTWARE'])) $this->prop('<b>'.$_SERVER['SERVER_SOFTWARE'].'</b>');

    // check if paths root, storage_path and index.php exist and are writeable
    $this->check_path(Config::$root, 'root');
    $this->check_path(Config::$storagepath, 'storage_path');
    $this->check_path(__FILE__, U::basename(__FILE__));

    // check a few PHP extensions
    if(function_exists('extension_loaded')) {
      // check extensions gd, exif, mbstring and imagick
      foreach (['gd', 'exif', 'mbstring', 'imagick'] as $name) $this->prop($name, extension_loaded($name));
      // specifically check if imagick supports PDF (requires ghostscript)
      if(extension_loaded('imagick')) $this->prop('imagick PDF support', !empty((new Imagick())->queryFormats('PDF')));
    }

    // check if ZipArchive class exists
    $this->prop('ZipArchive', class_exists('ZipArchive'));

    // check various PHP functions
    foreach (['mime_content_type', 'finfo_file', 'iptcparse', 'exif_imagetype', 'session_start', 'ini_get', 'exec'] as $name) $this->prop($name . '()', function_exists($name));

    // check command-line apps if exec() is available (pointless to output if not available)
    if(function_exists('exec')) {

      // check ffmpeg
      $this->prop('ffmpeg', !!U::app_path('ffmpeg'));

      // check imagemagick
      $imagemagick = !!U::app_path('imagemagick');
      $this->prop('imagemagick', $imagemagick);

      // check ghostscript (required for PDF thumbnails) if imagemagick is available
      if($imagemagick) $this->prop('ghostscript', !!@exec('gs -version'));
    }

    // get various PHP ini values with ini_get()
    if(function_exists('ini_get')) foreach (['memory_limit', 'file_uploads', 'upload_max_filesize', 'post_max_size', 'max_file_uploads'] as $name) $this->prop($name, 'neutral', @ini_get($name));

    // validate regex for exclude config options
    foreach (['files_include', 'files_exclude', 'dirs_include', 'dirs_exclude'] as $key) if(Config::get($key) && @preg_match(Config::get($key), '') === false) $this->prop("Invalid <strong>$key</strong> regex", false);

    // output merged config in readable format, with sensitive properties masked out
    $this->showconfig();

    // output basic formatted tests in html format
    $this->output();

    // exit on tests output
    exit;
  }

  // checks if new Config() created dirs and files in storagepath
  // useful to run ?action=tests if you want to create config.php file before executing Files Gallery
  private function created(){
    if(empty(Config::$created)) return;
    $this->html .= '<p>Successfully created the following storage items:</p>';
    foreach (Config::$created as $key) $this->prop($key, true);
  }

  // checks if a path exists and is writeable
  private function check_path($path, $name){
    if(!$path) return $this->prop($name, false);
    if(!file_exists($path)) return $this->prop("$name does not exist", false);
    if(!is_writable($path)) return $this->prop($name . ' is not writeable ' . substr(sprintf('%o', fileperms($path)), -4) . ' [owner ' . fileowner($path) . ']', false);
    $this->prop($name, true);
  }

  // outputs and formats a property feature <div> element to html
  private function prop($name, $success = 'neutral', $value = ''){
    $class = is_string($success) ? $success : ($success ? 'success' : 'fail');
    $this->html .= "<div class=\"test $class\">$name <b>$value</b></div>";
  }

  // output merged config in readable format, with sensitive properties masked out
  private function showconfig(){

    // copy config array
    $arr = Config::$config;

    // mask sensitive values
    foreach (['root', 'storage_path', 'start_path', 'username', 'password', 'license_key', 'allow_tasks', 'index_cache', 'files_include', 'files_exclude', 'dirs_include', 'dirs_exclude'] as $prop) if($arr[$prop]) $arr[$prop] = '***';

    // create PHP array string that resembles config.php files
    $php = '<?php' . PHP_EOL . PHP_EOL . 'return ' . U::var_export($arr) . ';';

    // add to html response and highlight
    $this->html .= '<h2>Config</h2>' . highlight_string($php, true);
  }

  // output basic formatted tests in html format
  private function output(){
    echo '<!doctype html><html><head><title>Files Gallery check system and config.</title><meta name="robots" content="noindex,nofollow"><style>body{font-family:system-ui;color:#444;line-height:1.6;margin:2vw 3vw;overflow:scroll}b{font-weight:600}.test:before{display:inline-block;width:18px;text-align:center;margin-right:5px}.neutral:before{color:#BBB}.success:before{color:#78a642}.success:before,.neutral:before{content:"\2713"}.fail:before{content:"\2A09";color:firebrick}</style></head><body>' . $this->html . '</body></html>';
  }
}

// class FileResponse / outputs file, video thumb, pdf thumb, converted image, resized image or proxies any file by PHP
class FileResponse {

  // vars
  private $path;      // path to file
  private $mime;      // file mime type
  private $clone;     // clone parameter for folder preview images
  private $type;      // response type; resize, video_thumb, pdf_thumb, convert or proxy file
  private $resize;    // resize value for image response / used for resizing and for naming the cache file
  private $app;       // application used to create the image (imagemagick or ffmpeg)
  private $cachepath; // image cache path

  // ImageMagick resize image thumbnail command
  private static $cmd_resize = '%APP_PATH% "%PATH%" -flatten -auto-orient -quality %QUALITY% -thumbnail %RESIZE%x%RESIZE%\> -adaptive-sharpen 0x0.75 "%CACHE%" 2>&1';

  // ImageMagick convert from heif/heic/tiff/psd/dng to jpg for browser compatibility (no resize)
  private static $cmd_convert = '%APP_PATH% "%PATH%" -flatten -auto-orient -quality 75 "%CACHE%" 2>&1';
  //private static $cmd_convert = '%APP_PATH% "%PATH%" -flatten -auto-orient -quality 75 -resize 2000x2000\> "%CACHE%" 2>&1';

  // ImageMagick create PDF thumbnail / [0] for first page
  private static $cmd_pdf_thumb = '%APP_PATH% "%PATH%[0]" -background white -flatten -quality 80 -thumbnail %RESIZE%x%RESIZE% "%CACHE%" 2>&1';

  // FFmpeg video thumbnail
  private static $cmd_video_thumb = '%APP_PATH% -ss 3 -t 1 -hide_banner -i "%PATH%" -frames:v 1 -an -vf "thumbnail,scale=min\'(%RESIZE%,iw)\':min\'(%RESIZE%,ih)\':force_original_aspect_ratio=decrease" -r 1 -y -f mjpeg "%CACHE%" 2>&1';

  // construct FileResponse / $type, $resize and $clone parameters are optional, used when getting a folder preview image
  public function __construct($path, $type = false, $resize = false, $clone = false){

    // exit on invalid path
    if(!$path) U::error('Invalid file request', 404);

    // store path and resolve symlinks
    $this->path = Path::realpath($path);

    // get mime type for file validation
    $this->mime = U::mime($this->path);

    // clone the file (used by folder preview action)
    $this->clone = $clone;

    // get type of fileresponse / resize, video_thumb, pdf_thumb, convert / no type = proxy file request
    $this->type = $type ?: $this->get_type();

    // attempt to proxy the file by PHP when there is no $type
    if(!$this->type) return $this->proxy_file();

    // get resize value for image response / used for resizing and naming the cache file
    $this->resize = $resize ?: $this->get_resize();

    // trigger $type function / resize(), video_thumb(), pdf_thumb() or convert()
    $this->{$this->type}();
  }

  // get type of request from query / resize, video_thumb, pdf_thumb, convert / no type = proxy file request
  private function get_type(){
    foreach (['resize', 'video_thumb', 'pdf_thumb', 'convert'] as $key) if(U::get($key)) return $key;
  }

  // get file proxied through PHP / we only do this when load_files_proxy_php is enabled or for file types like .php
  private function proxy_file(){

    // don't allow getting file by proxy if !load_files_proxy_php and the file is available directly by url
    if(!Config::get('load_files_proxy_php') && Path::has_urlpath($this->path)) U::error('File can\'t be proxied', 400);

    // read file / $mime or 'application/octet-stream' if $mime is unknown (should not happen unless missing mime functions)
    U::readfile($this->path, ($this->mime ?: 'application/octet-stream'), 'File proxied', true);
  }

  // get resize value for image response / used for resizing and naming the cache file
  private function get_resize(){
    if(U::get('resize')) return intval(U::get('resize')); // resize value will come in request ?resize=480 for nor thumbnails
    if($this->type === 'convert') return 'convert'; // on convert type, images are not resized, but 'convert' is part of the cache name
    return U::image_resize_dimensions_retina() ?: Config::get('image_resize_dimensions'); // for PDF and video thumbs, use largest size
  }

  // get resized preview image / does some preliminary tests before determining imagemagick of PHP GD
  private function resize(){

    // allow resize image only if config load_images and image_resize_enabled are enabled
    foreach (['load_images', 'image_resize_enabled'] as $key) if(!Config::get($key)) U::error("Config $key disabled", 400);

    // check if requested resize value is allowed
    if(!U::resize_is_allowed($this->resize)) U::error('Resize parameter ' . U::get('resize') . ' is not allowed', 400);

    // make sure file mime type is image, unless the file is imagemagick, in which case we can't rely on mime ...
    if($this->mime && strpos($this->mime, 'image') === false && !$this->is_imagemagick()) U::error("Unsupported image type $this->mime", 415);

    // resize image with ImageMagick
    if($this->resize_use_imagemagick()) return $this->create_image('imagemagick');

    // resize image with PHP GD
    new ResizeImage($this->path, $this->resize, $this->clone);
  }

  // use imagemagick to create thumbnail if config use_imagemagick or if file is imagemagick type
  private function resize_use_imagemagick(){
    return Config::get('image_resize_use_imagemagick') || $this->is_imagemagick();
  }

  // check if file is specifically an imagemagick format (that PHP GD can't handle)
  private function is_imagemagick(){
    return in_array(U::extension($this->path, true), Config::get_array('imagemagick_image_types'));
  }

  // video thumbnail with ffmpeg / first make sure mime type is video
  private function video_thumb(){
    if($this->mime && strpos($this->mime, 'video') === false) U::error("Invalid video format $this->mime", 400);
    $this->create_image('ffmpeg');
  }

  // PDF thumbnail with imagemagick (PDF requires ghostscript) / mime must match application/pdf
  private function pdf_thumb(){
    if($this->mime && $this->mime !== 'application/pdf') U::error("Invalid PDF format $this->mime", 400);
    $this->create_image('imagemagick');
  }

  // convert non-browser image formats like heic, tif, psd and dng to browser-friendly jpg format
  private function convert(){
    if(!$this->is_imagemagick()) U::error("Invalid convert format", 400);
    $this->create_image('imagemagick');
  }

  // create image from imagemagick or ffmpeg with exec()
  private function create_image($app){

    // image_resize_cache required for exec previews, for efficiency and because we need to create the file on disk anyway
    if(!Config::get('image_resize_cache')) U::error("image_resize_cache must be enabled to store created images", 400);

    // get cache path where we will look for image or create it
    $this->cachepath = Path::imagecachepath($this->path, $this->resize, filesize($this->path), filemtime($this->path));

    // check for cached image / clone if called from folder preview
    if(U::readfile($this->cachepath, 'image/jpeg', "$this->type from cache", true, $this->clone)) return;

    // when using image_resize_cache_use_dir, we must make sure $dir/_files dir exists
    U::ensure_files_dir($this->path);

    // store app / imagemagick or ffmpeg
    $this->app = $app;

    // use PHP imagick extension if available
    if($this->is_imagick()) {
      $this->imagick_image();

    // otherwise use exec() to interact with the app on the command-line
    } else {
      $this->exec_image();
    }

    // error if for some reason, the created $this->cachepath file does not exist
    if(!file_exists($this->cachepath)) U::error('Cache file ' . U::basename($this->cachepath) . ' does not exist', 404);

    // fix for empty preview images (f.ex extremely short videos or other unknown errors), create 1px placeholder
    // this seems pointless, but might as well keep it
    if(!filesize($this->cachepath)) imagejpeg(imagecreate(1, 1), $this->cachepath);

    // add new cache entry in _files/cache/images/cache.txt file
    U::image_cache_file_append($this->cachepath, $this->path);

    // output image from cache path
    U::readfile($this->cachepath, 'image/jpeg', "$app | $this->type created", true, $this->clone);
  }

  // use PHP imagick extension if available / https://www.php.net/manual/en/intro.imagick.php
  private function is_imagick(){
    return $this->app === 'imagemagick' && extension_loaded('imagick');
  }

  // create image from PHP imagick extension / potentially used for resize, video_thumb, pdf_thumb and convert
  private function imagick_image(){
    // for pdf_thumb, we can detect up front if PDF is not supported
    if($this->type === 'pdf_thumb' && empty((new Imagick())->queryFormats('PDF'))) return U::error('Your PHP Imagick does not support the PDF format', 400);
    $imagick = new Imagick($this->path . ($this->type === 'pdf_thumb' ? '[0]' : '')); // pdf use first page
    if($imagick->getNumberImages() > 1) $imagick->mergeImageLayers(imagick::LAYERMETHOD_FLATTEN); // flatten psd
    $imagick->autoOrient(); // correct the image's orientation based on its EXIF data.
    if(is_numeric($this->resize)) { // resize
      $imagick->thumbnailImage($this->resize, $this->resize, true); // resize keep aspect
      $imagick->sharpenImage(0, 0.75); // sharpen thumbnail so it's not too blurry
    }
    $imagick->setImageFormat('jpeg');
    $imagick->setImageCompression(Imagick::COMPRESSION_JPEG);
    $imagick->setImageCompressionQuality($this->type === 'convert' ? 75 : Config::get('image_resize_quality'));
    $imagick->writeImage($this->cachepath);
    $imagick->clear();
    $imagick->destroy();
  }

  // create image from exec() / imagemagick or ffmpeg
  private function exec_image(){

    // get and validate external $app path, imagemagick or ffmpeg
    $app_path = U::app_path($this->app);

    // error if !$app_path / app is missing, or path is wrong or exec() function does not exist
    if(!$app_path) return U::error($this->app . ' is not available, check your <a href="' . U::basename(__FILE__) . '?action=tests" target="_blank">diagnostics</a>', 400);

    // get exec command string by replacing variables with real values
    $cmd = str_replace(
      ['%APP_PATH%', '%PATH%', '%CACHE%', '%RESIZE%', '%QUALITY%'],
      [$app_path, escapeshellcmd($this->path), $this->cachepath, $this->resize, Config::get('image_resize_quality')],
      self::${"cmd_$this->type"});

    // attempt to execute exec command
    exec($cmd, $output, $result_code);

    // fail if result_code is anything else than 0
    if($result_code) {

      // simply attempt to fix errors caused by video being shorter than -ss time (default -ss 3), create from first frame
      if($this->type === 'video_thumb' && preg_match('/ -ss \d+/', $cmd)) exec(preg_replace('/ -ss \d+/', '', $cmd), $output, $result_code);

      // definite unknown fail / dump data in response
      if($result_code) {

        // delete empty error cache / disabled by default ... why continue to retry a slow/failed process?
        // if(file_exists($this->cachepath) && !filesize($this->cachepath)) @unlink($this->cachepath);

        // definite error
        U::error("Error generating $this->type (\$result_code $result_code)", 500);
      }
    }
  }
}

// class ResizeImage / serves a resized image
class ResizeImage {

  // set a different fill color than black (default) for images with transparency / disabled by default []
  // only enable when strictly required, as it will assign fill color also for non-transparent images
  public static $fill_color = []; // white [255, 255, 255];

  // class properties
  private $path;        // full path to image
  private $rwidth;      // calculated resize width
  private $rheight;     // calculated resize height
  private $pixels;      // used to check if pixels > max_pixels and to calculate required memory
  private $bits;        // extracted from getimagesize() for use in set_memory_limit()
  private $channels;    // extracted from getimagesize() for use in set_memory_limit()
  private $dst_image;   // destination image GD resource with resize dimensions, also used in sharpen() and exif_orientation()

  // construct resize image, all processes in due order
  public function __construct($path, $resize, $clone = false){

    // vars
    $this->path = $path;
    $filesize = filesize($this->path);

    // create local $short vars from config 'image_resize_*' options, because it's much easier and more readable
    foreach (['cache', 'quality', 'function', 'sharpen', 'memory_limit', 'max_pixels', 'min_ratio'] as $key) {
      $$key = Config::get("image_resize_$key");
    }

    // add to response headers
    U::message(['cache ' . ($cache ? 'ON' : 'OFF'), "resize $resize", "quality $quality", $function]);

    // get cache path for image (or null for imagejpeg())
    $cachepath = $cache ? Path::imagecachepath($this->path, $resize, $filesize, filemtime($this->path)) : null;

    // attempt to load $cachepath / will simply fail if $cachepath does not exist
    if($cachepath) U::readfile($cachepath, 'image/jpeg', 'Resized image from cache', true, $clone);

    // getimagesize / original dimensions, image type, bits, channels and mime
    $imagesize = getimagesize($this->path);
    if(empty($imagesize) || !is_array($imagesize)) U::error('Failed getimagesize()', 500); // die!

    // vars extrapolated from $imagesize
    $width = (int) $imagesize[0]; // (int) because AVIF might return '0x0'
    $height = (int) $imagesize[1]; // (int) because AVIF might return '0x0'
    $ratio = max($width, $height) / $resize; // calculate resize ratio from image longest side (width or height)
    $this->rwidth = round($width / $ratio); // calculate resize width
    $this->rheight = round($height / $ratio); // calculate resize height
    $this->pixels = $width * $height; // used to check if pixels > max_pixels and to calculate required memory
    $type = $imagesize[2]; // returns one of the IMAGETYPE_XXX constants indicating the type of the image.
    $mime = isset($imagesize['mime']) && is_string($imagesize['mime']) ? $imagesize['mime'] : false;
    $this->bits = isset($imagesize['bits']) && is_numeric($imagesize['bits']) ? $imagesize['bits'] : 8;
    $this->channels = isset($imagesize['channels']) && is_numeric($imagesize['channels']) ? $imagesize['channels'] : 3;

    // get image ext string from $type or exit / used to make sure image is valid image resize type
    $ext = image_type_to_extension($type, false) ?: U::error("Invalid image type $type");

    // exit if invalid GD image resize type
    if(!in_array($ext, U::gd_image_types())) return U::error("Invalid image resize type $ext");

    // add more values to response headers
    U::message([$mime, $ext, "$width x $height", 'ratio ' . round($ratio, 2), "$this->rwidth x $this->rheight"]);

    // exit if image pixels (dimensions) exceeds 'image_resize_max_pixels' => 60000000 (default)
    if($max_pixels && $this->pixels > $max_pixels) U::error("Image pixels $this->pixels ($width x $height) exceeds `image_resize_max_pixels` $max_pixels", 400);

    // serve original if resize ratio < min_ratio, but only if filesize <= load_images_max_filesize
    if($ratio < max($min_ratio, 1) && $filesize <= Config::get('load_images_max_filesize') && !U::readfile($this->path, $mime, "Original image served, because resize ratio $ratio < min_ratio $min_ratio", true, $clone)) U::error('File does not exist', 404);

    // check if avaialble memory is sufficient to resize image, and attempt to temporarily assign higher memory_limit
    $this->set_memory_limit($memory_limit);

    // create new source image GD resource from path
    $src_image = "imagecreatefrom$ext"($this->path) ?: U::error("Function imagecreatefrom$ext() failed", 500);

    // create destination image GD resource with resize dimensions
    $this->dst_image = imagecreatetruecolor($this->rwidth, $this->rheight) ?: U::error('Function imagecreatetruecolor() failed', 500);

    // set a different fill color than black (default) for images with transparency / disabled by default $fill_color = []
    $this->set_fill_color($ext);

    // imagecopyresampled() src_image to dst_image
    if(!call_user_func($function, $this->dst_image, $src_image, 0, 0, 0, 0, $this->rwidth, $this->rheight, $width, $height)) U::error("Function $function() failed", 500);

    // destroy src_image GD resource to free up memory
    imagedestroy($src_image);

    // rotate resized image according to exif image orientation if required / only jpeg and tiff support
    if(in_array($mime, ['image/jpeg', 'image/tiff'])) $this->exif_orientation();

    // sharpen resized images, because default PHP imagecopyresized() make images blurry ...
    if($sharpen) $this->sharpen();

    // add headers for direct output if !cache / missing content-length but that's ok
    if(!$cachepath) U::header('Resized image served', true, 'image/jpeg');

    // when using 'image_resize_cache_use_dir' we must make sure $dir/_files dir exists
    if($cachepath) U::ensure_files_dir($this->path);

    // create jpg image in cache path or output directly if !cache
    if(!imagejpeg($this->dst_image, $cachepath, $quality)) U::error('PHP imagejpeg() failed', 500);

    // destroy dst_image resource to free up memory
    imagedestroy($this->dst_image);

    // if image is cached, we have nothing more to do here ...
    if(!$cachepath) exit;

    // add new cache entry in _files/cache/images/cache.txt file
    U::image_cache_file_append($cachepath, $this->path);

    // cache readfile
    if(!U::readfile($cachepath, 'image/jpeg', 'Resized image served', true, $clone)) U::error('Cache file does not exist', 404);

    // always exit
    exit;
  }

  // check if avaialble memory is sufficient to resize image, and attempt to temporarily assign new memory_limit
  private function set_memory_limit($memory_limit){
    // config image_resize_memory_limit must be assigned
    if(empty($memory_limit)) return;
    // get memory_limit in MB
    $current = U::get_memory_limit_mb();
    // pointless to make any assumptions if we can't get default memory_limit, just try to resize ...
    if(empty($current)) return;
    // calculate approximate required memory to resize image
    $required = round(($this->pixels * $this->bits / 8 * $this->channels * 1.33 + $this->rwidth * $this->rheight * 4) / 1048576, 1);
    // get new memory_limit, assigned from config image_resize_memory_limit, if higher than $current
    $new = function_exists('ini_set') ? max($current, $memory_limit) : $current;
    // error if required memory > available memory
    if($required > $new) U::error("Resizing this image requires >= {$required}M. Your PHP memory_limit is {$new}M", 400);
    // assign $new memory from config image_resize_memory_limit if > $current (default memory_limit)
    if($new > $current && @ini_set('memory_limit', $new . 'M')) U::message("{$current}M => {$new}M (min {$required}M)");
  }

  // sharpen resized images, because default PHP imagecopyresized() make images blurry ...
  private function sharpen(){
    $matrix = [
      [-1, -1, -1],
      [-1, 20, -1],
      [-1, -1, -1],
    ];
    $divisor = array_sum(array_map('array_sum', $matrix));
    $offset = 0;
    imageconvolution($this->dst_image, $matrix, $divisor, $offset);
  }

  // rotate resized image according to exif image orientation (no way we deal with this in browser)
  private function exif_orientation(){
    // attempt to get image exif array
    $exif = Exif::exif_data($this->path);
    // exit if there is no exif orientation value
    if(!$exif || !isset($exif['Orientation'])) return;
    // assign $orientation
    $orientation = $exif['Orientation'];
    // array of orientation values to rotate (4, 5 and 7  will also be flipped)
    $orientation_to_rotation = [3 => 180, 4 => 180, 5 => 270, 6 => 270, 7 => 90, 8 => 90];
    // return if orientation is not valid or is not in array (does not require rotation)
    if(!array_key_exists($orientation, $orientation_to_rotation)) return;
    // rotate image according to exif $orientation, write back to already-resized image destination resource
    $this->dst_image = imagerotate($this->dst_image, $orientation_to_rotation[$orientation], 0);
    // after rotation, orientation values 4, 5 and 7 also need to be flipped in place
    if(in_array($orientation, [4, 5, 7]) && function_exists('imageflip')) imageflip($this->dst_image, IMG_FLIP_HORIZONTAL);
    // add header props
    U::message("orientated from EXIF $orientation");
  }

  // sets a different fill color than black (default) for images with transparency / disabled by default
  private function set_fill_color($ext){
    if(!is_array(self::$fill_color) || count(self::$fill_color) !== 3 || !in_array($ext, ['png', 'gif', 'webp', 'avif'])) return;
    $color = call_user_func_array('imagecolorallocate', array_merge([$this->dst_image], self::$fill_color));
    if(imagefill($this->dst_image, 0, 0, $color)) U::message('Fill rgb(' . join(', ', self::$fill_color) . ')');
  }
}

// class Dirs / outputs menu json from dir structure
class Dirs {

  // vars
  private $dirs = []; // array of dirs to output when re-creating
  private $cache_file = false; // cache file path / gets assigned to a path if cache is enabled
  private $load_files = false; // load files into each menu dir if Config::get('menu_load_all')

  // construct Dirs
  public function __construct(){

    // first check and assign cache / returns cache json if valid
    $this->check_cache();

    // load files in each dir if config menu_load_all
    $this->load_files = Config::get('menu_load_all');

    // if not cached, get dirs starting from root dir
    $this->get_dirs(Config::$root);

    // when no cache file is found, we can remove all cache items that match menu $hash
    U::clean_json_cache_hash('menu', U::get_menu_hash(Config::$config, Config::$root));

    // outputs dirs json format and cache
    Json::cache($this->dirs, 'Dirs reloaded', $this->cache_file);
  }

  // check cache for menu and return if valid
  private function check_cache(){

    // exit if cache disabled
    if(!Config::get('cache')) return;

    // get cache hash from POST menu_cache_hash so we can assign correct cache file
    $hash = U::post('menu_cache_hash');

    // validate $hash to make sure we check and create correct cache file names (not strictly necessary, but just in case)
    if(!$hash || !preg_match('/^.{6}\..{6}\..\d+$/', $hash)) Json::error('Invalid menu cache hash');

    // assign cache file when cache is enabled / check if file exists, or write to this file when re-creating
    $this->cache_file = Config::$cachepath . "/menu/$hash.json";

    // return if cache file does not exist
    if(!file_exists($this->cache_file)) return;

    // get json from cache file
    $json = @file_get_contents($this->cache_file);

    // return if the file is empty (for some reason)
    if(empty($json)) return;

    // check if menu cache is valid by comparing folder modified dates
    if(!$this->menu_cache_is_valid($json)) return;

    // assign headers
    U::header('Valid menu cache', null, 'application/json');

    // if browser has valid menu cache stored, just confirm cache is valid // don't use Json::exit, because we already set header
    if(U::post('localstorage')) exit(json_encode(['localstorage' => true]));

    // output json cache file
    exit($json);
  }

  // check if json menu cache is valid by comparing folder dates (modified time)
  private function menu_cache_is_valid($json){
    if(!Config::get('menu_cache_validate')) return true; // don't validate deep levels beyond 2
    $arr = @json_decode($json, true); // create array to compare times
    if(empty($arr)) return;
    // loop dirs and compare modified-time to check if cache is valid / skip shallow 1st level dirs
    foreach ($arr as $val) {
      if(strpos($val['path'], '/') !== false && $val['mtime'] !== @filemtime(Path::rootpath($val['path']))) return;
    }
    return $json; // it's valid, because json folder dates match real folder dates
  }

  // get_dirs recursive directories
  private function get_dirs($path, $depth = 0) {

    // load data for dir / ignore depth 0 (root), because it's already loaded, unless load_files
    if($depth || $this->load_files) {

      // return if dir is excluded
      if(Path::is_exclude($path, true)) return;

      // get array of data for dir, including files load_files (config menu_load_all)
      $data = (new Dir($path))->load($this->load_files);

      // exit if empty / should not happen, but just on case
      if(empty($data)) return;

      // assign dir $data to array of $dirs
      $this->dirs[] = $data;

      // exit if current depth >= config menu_max_depth (don't get subdirs)
      if(Config::get('menu_max_depth') && $depth >= Config::get('menu_max_depth')) return;

      // exit if item is symlink and don't follow symlinks (don't get subdirs)
      if($data['is_link'] && !Config::get('menu_recursive_symlinks')) return;// $arr;
    }

    // get subdirs from current path
    $subdirs = U::glob("$path/*", true);

    // sort subdirs and get data for each dir (including further subdirs)
    if(!empty($subdirs)) foreach($this->sort($subdirs) as $subdir) $this->get_dirs($subdir, $depth + 1);
  }

  // sort subfolders
  private function sort($dirs){
    if(substr(Config::get('menu_sort'), 0, 4) === 'date'){
      usort($dirs, function($a, $b) {
        return filemtime($a) - filemtime($b);
      });
    } else {
      natcasesort($dirs);
    }
    return substr(Config::get('menu_sort'), -4) === 'desc' ? array_reverse($dirs) : $dirs;
  }
}

// class Dir / loads data array for a single dir with or without files
class Dir {

  // vars
  public $data; // array of public data to be returned / shared with File
  public $path; // path of dir / shared with File
  public $realpath; // dir realpath, normally the same as $path, unless $path contains symlink
  public $relpath; // dir path relative to root
  public $url_path; // url path for this dir (will equal FALSE if is not within document root)
  private $filemtime; // dir filemtime (modified time), used for cache validation and data
  public $filenames; // array of file names in dir
  private $cache_path; // calculated json file cache path

  // construct assign common vars
  public function __construct($path){
    $this->path = $path;
    $this->realpath = $path ? Path::realpath($path) : false;
    $this->relpath = Path::relpath($this->path);
    $this->url_path = Path::rooturlpath($this->relpath);
    $this->filemtime = filemtime($this->realpath);
    $this->cache_path = $this->get_cache_path();
  }

  // get dir json from cache, or reload / used by main dir files action request
  public function json(){

    // return json cache file if exists
    if(U::readfile($this->cache_path, 'application/json', 'JSON served from cache')) return;

    // when no cache file is found that matches filemtime(), we can remove all cache items that match $hash
    U::clean_json_cache_hash('folders', U::get_current_dirs_hash() . '.' . U::hash($this->path));

    // reload, encode as json, and store json cache file
    Json::cache($this->load(true), 'JSON created', $this->cache_path);
  }

  // get dir array from cache or reload / used in Document class when getting dir arrays for root and start path
  public function get(){

    // get cache if valid, also returns files[] array as bonus since it's already cached
    if($this->cache_is_valid()) return json_decode(file_get_contents($this->cache_path), true);

    // reload dir without files (we don't want to delay Document with this, unless cached)
    return $this->load();
  }

  // load dir array / used when dir is not cached (always by menu get_dirs())
  public function load($files = false){

    // dir array
    $this->data = [
      'basename' => U::basename($this->path),
      'fileperms' => substr(sprintf('%o', fileperms($this->realpath)), -4),
      'filetype' => 'dir',
      'is_readable' => is_readable($this->realpath),
      'is_writeable' => is_writeable($this->realpath),
      'is_link' => is_link($this->path),
      'is_dir' => true,
      'mime' => 'directory',
      'mtime' => $this->filemtime,
      'path' => $this->relpath,
      'files_count' => 0,
      'dirsize' => 0,
      'images_count' => 0,
      'url_path' => $this->url_path,
    ];

    // get files[] array for dir
    if($files) $this->get_files();

    // assign direct url to json cache file for faster loading from javascript / used by Dirs class (menu), only when !files
    // won't work if you have blocked public web access to cache dir files / if so, comment out the below line
    if(!$files) $this->set_json_cache_url();

    // return data array for this dir
  	return $this->data;
  }

  // get json cache path for dir (does not validate if cache file exists)
  private function get_cache_path(){
    if(!Config::get('cache') || !$this->path) return;
    return Config::$cachepath . '/folders/' . U::get_current_dirs_hash() . '.' . U::hash($this->path) . '.' . $this->filemtime . '.json';
  }

  // used to check if json cache file exists, and therefore is valid
  private function cache_is_valid(){
    return $this->cache_path && file_exists($this->cache_path);
  }

  // assign direct url to json cache file for faster loading from javascript / used by Dirs class (menu)
  private function set_json_cache_url(){
    if(Login::$is_logged_in || !$this->cache_is_valid() || !Path::has_urlpath(Config::$storagepath)) return;
    $this->data['json_cache'] = Path::urlpath($this->cache_path);
  }

  // optional get array of files from dir / only gets called if file data should be loaded
  private function get_files(){

    // forget it if we can't read dir
    if(!$this->data['is_readable']) return;

    // start files array, even if empty (so we know it's an empty folder)
    $this->data['files'] = [];

    // scandir for filenames
    $this->filenames = scandir($this->path, SCANDIR_SORT_NONE);

    // exit if dir is empty
    if(empty($this->filenames)) return;

    // prepare associative array of custom preview images (if found) / 'filename.jpg' => '_files_filename.pdf.jpg'
    $custom_previews = [];

    // only check for custom previews if load_images is enabled and url_path is public (we don't proxy custom thumbnails by PHP)
    $check_custom_previews = Config::get('load_images') && $this->url_path !== false;

    // loop filenames add to $this->data['files']
    foreach($this->filenames as $filename) {

      // skip dots
      if($filename === '.' || $filename === '..') continue;

      // skip files that start with _files (done here so we can also check for custom thumbnail images)
      if(substr($filename, 0, 6) === '_files') {

        // add potential custom preview images to $custom_previews associative array 'filename.jpg' => '_files_filename.pdf.jpg'
        if($check_custom_previews && preg_match('/^_files_(.+)\.(jpe?g|gif|png|svg)$/i', $filename, $m)) $custom_previews[$m[1]] = $filename;

        // anything that starts with _files* is excluded ...
        continue;
      }

      // add file to $this->data['files'] array
      new File($this, $filename);
  	}

    // loop custom_previews and attempt to match them with valid files in $this->data['files']
    foreach ($custom_previews as $filename => $custom_preview) {
      if(isset($this->data['files'][$filename])) $this->data['files'][$filename]['custom_preview'] = $this->url_path . (in_array($this->url_path, ['', '/']) ? '' : '/') . $custom_preview;
    }

    // clean dir/_files/* if config image_resize_cache_use_dir is enabled
    if(Config::get('image_resize_cache_use_dir')) $this->clean_files_cache();

    // sort files by natural case, with dirs on top (already sorts in javascript, but faster when pre-sorted in cache)
    uasort($this->data['files'], function($a, $b){
      if($a['is_dir'] === $b['is_dir']) return strnatcasecmp($a['basename'], $b['basename']);
      return $b['is_dir'] ? 1 : -1;
    });
  }

  // clean dir/_files/* when config image_resize_cache_use_dir is enabled
  private function clean_files_cache(){

    // check that dir/_files exists and glob() image cache files that contain double extensions (original.png.jpg)
    $files = file_exists("$this->realpath/_files") ? glob("$this->realpath/_files/*.*.jpg", GLOB_NOSORT) : false;

    // loop cache files
    if(!empty($files)) foreach ($files as $file) {

      // get original filename by removing cache extension and potential '.convert', which should match a filename in $this->data['files']
      $filename = preg_replace('/\.convert$/', '', pathinfo($file, PATHINFO_FILENAME));

      // check if cache file corresponds to a file in $this->data['files']
      $match = isset($this->data['files'][$filename]) ? $this->data['files'][$filename] : false;

      // unlink cache file if no match is found or if cache file is older than original
      if(!$match || (Config::get('image_cache_validate_time') && $match['mtime'] > filemtime($file))) @unlink($file);
    }
  }
}

// class File / returns data array for a single file
class File {

  // vars
  private $dir; // parent dir object
  private $file; // file array
  private $realpath; // realpath of item, in case symlinked, faster access for various operations
  private $image = []; // image data array, populated and assigned to $this->file['image'] if file is image
  private $image_info; // image_info from getimagesize() to get IPTC

  // public construct file
  public function __construct($dir, $filename){

    // parent dir object
    $this->dir = $dir;

    // assemble full path from parent dir path
    $path = $this->dir->path . '/' . $filename;

    // get resolved realpath, to check if file truly exists (symlink target could be deaf), and for faster function access
    $this->realpath = Path::realpath($path); // may differ from $path if symlinked

    // exit if no realpath for some reason, for example symlink target is dead
    if(!$this->realpath) return;

    // path is symlinked if realpath differs from $path
    $symlinked = $this->realpath !== $path;

    // get filetype
    $filetype = filetype($this->realpath);

    // determine if file is dir
    $is_dir = $filetype === 'dir' ? true : false;

    // skip item if excluded
    if(Path::is_exclude($path, $is_dir, $symlinked)) return;

    // count file into parent dir
    if(!$is_dir) $this->dir->data['files_count'] ++;

    // check if file is symlink (only if realpath !== path)
    $is_link = $symlinked ? is_link($path) : false;

    // get filesize if !$is_dir
    $filesize = $is_dir ? 0 : filesize($this->realpath); // filesize($path) if we only want to get size of symlink (0)

    // get relative path by appending filename to dir path
    $relpath = ltrim($this->dir->data['path'] . '/', '/') . $filename;

    // append filesize to parent dirsize
    $this->dir->data['dirsize'] += $filesize;

    // add properties to file array
    $this->file = [
      'basename' => $filename,
      'ext' => $is_dir ? '' : U::extension($is_link ? $this->realpath : $filename, true),
      'fileperms' => substr(sprintf('%o', fileperms($this->realpath)), -4),
      'filetype' => $filetype,
      'filesize' => $filesize,
      'is_readable' => is_readable($this->realpath),
      'is_writeable' => is_writeable($this->realpath),
      'is_link' => $is_link,
      'is_dir' => $is_dir,
      'mtime' => filemtime($this->realpath),
      'path' => $relpath,
      'url_path' => Path::rooturlpath($relpath),
    ];

    // assign file mime type / will return null for most files unless config get_mime_type = true (slow)
    $this->file['mime'] = $this->mime();

    // attempt to get PDF preview dimensions for better layout flow
    if($this->file['ext'] === 'pdf') {
      $dimensions = $this->im_getimagesize();
      if($dimensions) $this->file['preview_ratio'] = $dimensions[0] / $dimensions[1];
    }

    // assign image data if file is image
    $this->set_image_data();

    // read .URL shortcut files and present as links / https://fileinfo.com/extension/url
    $this->set_file_url();

    // add to dir files associative array with filename as key
    $this->dir->data['files'][$filename] = $this->file;
  }

  // get file mime type if !extension of config get_mime_type is enabled
  private function mime(){
    if($this->file['is_dir']) return 'directory'; // directory
    if(!$this->file['is_readable']) return null; // skip and return null
    if(!$this->file['ext'] || $this->file['ext'] === 'ts' || Config::get('get_mime_type')) return U::mime($this->realpath);
    return null; // don't check mime, mime will be detected from extension in javascript
  }

  // we need to make sure memory is sufficient before using exif_read_data() so folders doesn't break on massive image files
  // this is a very rough estimation
  private function memory_sufficient_exif(){
    $limit = U::get_memory_limit_mb();
    return !$limit || $limit > ($this->image['width'] * $this->image['height'] * (isset($this->image['bits']) ? $this->image['bits'] : 8) / 8 * (isset($this->image['channels']) ? $this->image['channels'] : 4) * 1.5) / 1048576;
  }

  // assign image data if file is image
  private function set_image_data(){

    // determine if file seems to be an image by checking mime or extension
    if(!$this->is_image()) return;

    // count image in dir, assuming it's some kind of image, even if !getimagesize() or !readable
    $this->dir->data['images_count'] ++;

    // pre-assign image icon, assuming it's some kind of image
    $this->file['icon'] = 'image';

    // getimagesize() wrapper, populates and re-formats $this->image and $this->image_info for iptcparse / else exit, as it's not a known image
    if(!$this->getimagesize()) return;

    // assign item mime from getimagesize() because it is more accurate and we might not have file mime yet anyway
    if(isset($this->image['mime'])) $this->file['mime'] = $this->image['mime'];

    // get image Iptc
    $this->image['iptc'] = Iptc::get($this->image_info);

    // get image exif
    $this->getimageexif();

    // invert image width height if exif orientation is > 4 && < 9, because dimensions should match browser-oriented image
    $this->image_orientation_flip_dimensions();

    // find optional panorama sizes `_files_{size}_{filename.jpg}` for equirectangular 2/1 aspect panorama images
    $this->image_panorama_sizes();

    // get image resize cache for direct access by javascript if config image_resize_cache_direct
    $this->get_image_resize_cache();

    // remove empty values and add image array to file output
    $this->file['image'] = array_filter($this->image);
  }

  // core image file extensions / we check these formats with getimagesize()
  private static $image_types_core = 'gif,jpg,jpeg,jpc,jp2,jpx,jb2,png,swf,psd,bmp,tiff,tif,wbmp,xbm,ico,webp,avif,svg,heic,heif,dng';

  // return an array of image extensions and cache response (because we don't want to compile the array for every file in the loop)
  private static $image_types;
  private static function get_image_types(){
    if(isset(self::$image_types)) return self::$image_types;
    // merge core image extensions with imagemagick_image_types, because there may be custom formats
    return self::$image_types = array_merge(explode(',', self::$image_types_core), Config::get_array('imagemagick_image_types'));
  }

  // determine if file seems to be an image by means of mime type or extension
  private function is_image(){
    if($this->file['is_dir']) return;
    if($this->file['mime']) return substr($this->file['mime'], 0, 6) === 'image/'; // check by mime if set
    return in_array($this->file['ext'], self::get_image_types()); // check extension
  }

  // getimagesize() wrapper validates and re-formats output into $this->image array
  private function getimagesize(){

    // image must be readable and ignore svg
    if(!$this->file['is_readable'] || $this->file['ext'] === 'svg') return;

    // try @getimagesize() from PHP, unless heic/heif because getimagesize() definitely does not work with these formats
    $imagesize = !in_array($this->file['ext'], ['heic', 'heif']) ? @getimagesize($this->realpath, $this->image_info) : false;

    // on false/fail try to get image dimensions from imagemagick
    if(!$imagesize) $imagesize = $this->im_getimagesize();

    // exit if empty or invalid / basically we can't get imagesize from getimagesize() or imagemagick, or the image is corrupt
    if(empty($imagesize) || !is_array($imagesize)) return;

    // add mime manually if not set (normally if processed with imagemagick)
    if(empty($imagesize['mime'])) $imagesize['mime'] = 'image/' . $this->file['ext']; // append mime manually

    // re-format properties from getimagesize() into $this->image array
    foreach ([
      'width',
      'height',
      'type',
      'bits' => 'bits',
      'channels' => 'channels',
      'mime' => 'mime'
    ] as $key => $name) if(isset($imagesize[$key])) $this->image[$name] = $imagesize[$key];

    // valid if array is !empty
    return !empty($this->image);
  }

  // imagemagick getimagesize replacement for heif/heic/dng so we can get width and height at least
  private function im_getimagesize(){

    // use PHP imagick extension if available
    if(U::imagemagick() === 'imagick') {
      try {
        $im = new Imagick();
        $im->pingImage($this->realpath);
        return [$im->getImageWidth(), $im->getImageHeight()];
      } catch(Exception $e){
        return false;
      }

    // get width and height from Imagemagick "identify" command
    } else if(U::imagemagick() === 'imagemagick'){
      $wxh = @exec('identify -ping -format "%wx%h" "' . escapeshellcmd($this->realpath) . '" 2>&1', $output, $result_code);
      if(empty($wxh) || $result_code) return false; // fail if response is empty or result_code is anything else than 0
      $dimensions = array_map('intval', array_filter(explode('x', $wxh ?: ''), 'is_numeric'));
      return count($dimensions) === 2 ? $dimensions : false;
    }

    // we can't get width or height from heic/heif without imagemagick
    return false;
  }

  // get image exif data for each file
  private function getimageexif(){
    // exif_read_data only supports jpeg and tiff
    if(!isset($this->image['mime']) || !in_array($this->image['mime'], ['image/jpeg', 'image/tiff'])) return;
    if(!$this->memory_sufficient_exif()) return; // make sure there is sufficient memory so folders response doesn't break
    $this->image['exif'] = Exif::get($this->realpath); // get exif data for image
  }

  // if image is oriented by some Exif orientation values, we need to flip width and height properties to match browser orientation
  private function image_orientation_flip_dimensions(){
    if(!isset($this->image['exif']['Orientation']) || !in_array($this->image['exif']['Orientation'], [5, 6, 7, 8])) return;
    list($this->image['width'], $this->image['height']) = [$this->image['height'], $this->image['width']]; // flip width/height
  }

  // find optional panorama sizes `_files_{size}_{filename.jpg}` for equirectangular 2/1 aspect panorama images
  private function image_panorama_sizes(){
    // must be public image (url_path), with >= 2024 and exactly 2:1 aspect ratio (equirectangular)
    if(!$this->file['url_path'] || !$this->image['width'] || $this->image['width'] <= 2048 || $this->image['width'] / $this->image['height'] !== 2) return;
    $resized = [];
    foreach ([2048, 4096, 8192] as $width) { // look for sizes 2048, 4096 and 8192
      if($width >= $this->image['width']) break; // break loop if resized image width >= original already
      if(file_exists($this->dir->realpath . '/_files_' . $width . '_' . $this->file['basename'])) $resized[] = $width;
    }
    if(!empty($resized)) $this->file['panorama_resized'] = array_reverse($resized);
  }

  // get image resize cache for direct access by javascript if config image_resize_cache_direct
  private function get_image_resize_cache(){
    if(!U::image_resize_cache_direct(Config::$config)) return;
    foreach ([Config::get('image_resize_dimensions'), U::image_resize_dimensions_retina()] as $resize) {
      if(!$resize) continue;
      $cachepath = Path::imagecachepath($this->realpath, $resize, $this->file['filesize'], $this->file['mtime']);
      $urlpath = file_exists($cachepath) ? Path::urlpath($cachepath) : false;
      if($urlpath) $this->image["resize$resize"] = $urlpath;
    }
  }

  // read and parse .URL shortcut files and present as links / https://fileinfo.com/extension/url
  private function set_file_url(){
    if(!$this->file['is_readable'] || $this->file['ext'] !== 'url') return;
    $lines = @file($this->realpath);
    if(empty($lines) || !is_array($lines)) return;
    foreach ($lines as $str) {
      if(!preg_match('/^url\s*=\s*([\S\s]+)/i', trim($str), $matches) || !isset($matches[1])) continue;
      $this->file['url'] = $matches[1];
      break;
    }
  }
}

// class Iptc / extract IPTC image data from images
class Iptc {

  // array of iptc entries with their corresponding codes to extract from IPTC, which otherwise contains tons of junk
  public static $entries = [
    'title' => '005',
    'headline' => '105',
    'description' => '120',
    'creator' => '080',
    'credit' => '110',
    'copyright' => '116',
    'keywords' => '025',
    'city' => '090',
    'sub-location' => '092',
    'province-state' => '095'
  ];

  // get iptc tag values, might be an array (keywords) or first array item (string) / attempts to fix invalid utf8
  private static function tag($value){

    // might be an array like 'keywords', just output array
    if(count($value) > 1) return $value;

    // get trimmed string value
    $string = isset($value[0]) && is_string($value[0]) ? trim($value[0]) : false;

    // invalid or empty string
    if(empty($string)) return false;

    // clamp string at 1000 chars, because some messed up images include a dump of garbled junk
    $clamped = function_exists('mb_substr') ? @mb_substr($string, 0, 1000) : @substr($string, 0, 1000);

    // return original string if the above didn't work for some ridiculous reason
    if(!$clamped) return $string;

    // return string if we can't detect valid utf-8 or string is already valid utf-8
    if(!function_exists('mb_convert_encoding') || preg_match('//u', $clamped)) return $clamped;

    // attempt to convert the encoding
    $converted = @mb_convert_encoding($clamped, 'UTF-8', @mb_list_encodings());

    // return converted value if successful
    return $converted ?: $clamped;
  }

  // get iptc from $image_info (getimagesize($path, $image_info))
  public static function get($i){

    // get iptc from $image_info (getimagesize($path, $image_info))
    $iptc = !empty($i) && is_array($i) && isset($i['APP13']) && function_exists('iptcparse') ? @iptcparse($i['APP13']) : false;

    // return empty array if falsy, error or empty[] response
    if(empty($iptc)) return [];

    // populate $entries from $iptc
    $output = [];
    foreach (self::$entries as $name => $code) {
      $value = isset($iptc['2#' . $code]) ? $iptc['2#' . $code] : false;
      $output[$name] = !empty($value) && is_array($value) ? self::tag($value) : false;
    }

    // return array with all non-empty values
    return array_filter($output);
  }
}

// class Exif / extract Exif image data from images
class Exif {

  // these are the values we want
  public static $entries = [
    'ApertureFNumber',  // from exif COMPUTED values
    //'CCDWidth'        // from exif COMPUTED values
    //'DateTime',       // only used to detect original photo time, if DateTimeOriginal is not defined
    'DateTimeOriginal', // original photo taken time, which will replace the file's date
    'ExposureTime',
    //'FNumber',
    'FocalLength',
    //'Make',           // normally pointless when there is 'Model'
    'Model',
    'Orientation',      // used only for Javascript to detect the orientation of the image and display appropriately
    'ISOSpeedRatings',
    //'Software',
  ];

  // returns the exif data array from an image, if function exists and exif array is valid
  public static function exif_data($path){
    $exif = function_exists('exif_read_data') ? @exif_read_data($path) : false;
    return !empty($exif) && is_array($exif) ? $exif : false;
  }

  // get Exif $entries for a specific image
  public static function get($path){

    // get exif
    $exif = self::exif_data($path);
    if(!$exif) return;

    // start output array
    $output = [];

    // loop $entries, check in $exif and $exif['COMPUTED'] and add to ouput
    foreach (self::$entries as $key) {
      $output[$key] = isset($exif[$key]) ? $exif[$key] : (isset($exif['COMPUTED'][$key]) ? $exif['COMPUTED'][$key] : false);
    }

    // get GPS coordinates
    $output['gps'] = self::gps($exif);

    // remove empty values and return array
    return array_filter($output);
  }

  // get GPS coordinates in array
  private static function gps($exif){

    // prepare array for coordinates
    $arr = [];

    // loop to get coordinates
    foreach (['GPSLatitude', 'GPSLongitude'] as $key) {

      // invalid exif
      if(!isset($exif[$key]) || !isset($exif[$key . 'Ref'])) return false;

      // if 'GPSLatitude' and 'GPSLongitude' are defined as string value decimal degrees, convert to degrees, minutes, seconds
      // for example 'GPSLatitude' => '4590791/120000' or 'GPSLatitude' => '38.2565916667'
      if(is_string($exif[$key]) && strpbrk($exif[$key], './')){
      	$explode = strpos($exif[$key], '/') ? explode('/', $exif[$key]) : [$exif[$key], 1];
      	$degrees_decimal = $explode[0] / $explode[1];
      	$degrees = floor($degrees_decimal);
      	$minutes_decimal = ($degrees_decimal - $degrees) * 60;
      	$minutes = floor($minutes_decimal);
      	$seconds = ($minutes_decimal - $minutes) * 60;

      // assume array with degrees, minutes and seconds (should be the standard, and how most devices store coordinates)
      } else {

        // coordinate array / attempt to create array from comma-separated string
        $coordinate = is_string($exif[$key]) ? array_map('trim', explode(',', $exif[$key])) : $exif[$key];

        // GPSLatitude and GPSLongitude need to be array with 3 values
        if(count($coordinate) < 3) return false;

        // loop
        for ($i = 0; $i < 3; $i++) {
          $part = explode('/', $coordinate[$i]);
          if(count($part) == 1) {
            $coordinate[$i] = $part[0];
          } else if (count($part) == 2) {
            if(empty($part[1])) return false; // invalid GPS, $part[1] can't be 0
            $coordinate[$i] = floatval($part[0]) / floatval($part[1]);
          } else {
            $coordinate[$i] = 0;
          }
        }

        // output
        list($degrees, $minutes, $seconds) = $coordinate;
      }

      // ref / add coordinate
      $sign = in_array($exif[$key . 'Ref'], ['W', 'S']) ? -1 : 1;
      $arr[] = $sign * ($degrees + $minutes / 60 + $seconds / 3600);
    }

    // return array
    return !empty($arr) ? $arr : false;
  }
}

// class Filemanager / functions that handle file operations on server
class Filemanager {

  // success counter for multi-item actions
  static $success = 0;
  static $count = 0;

  // file manager actions JSON response / accepts true/false or array with success property
  public static function json($res, $err){

    // create $arr from boolean with $arr['success'] or pass through existing array
    $arr = is_array($res) ? $res : ['success' => $res];

    // assign complete error if action was !success (not even partially success)
    if(!isset($arr['success']) || empty($arr['success'])) return Json::error($err);

    // on success, invalidate X3 cache if x3-plugin active
    X3::invalidate();

    // output success / remove empty values, because javascript don't need em
    Json::jexit(array_filter($arr));
  }

  // check if name is allowed and return trimmed value / duplicate, new_file, new_folder, rename, zip
  // for security and practical reasons, don't allow invalid characters <>:"'/\|?*# or .. or ends with .
  public static function name_is_allowed($name = false){
    return !empty($name) && is_string($name) && !ctype_space($name) && !preg_match('/[<>:"\'\/\\\|?*#]|\.\.|\.$/', $name);
  }

  // get unique incremental filename for functions like duplicate and zip / default increment name starts at 2
  public static function get_unique_filename($path, $i = 2) {

    // die if already unique
    if(!file_exists($path)) return $path;

    // break path into filename and extension
    $pathinfo = pathinfo($path);
    $filename = $pathinfo['filename']; // file name without extension for numbering
    $ext = !is_dir($path) && !empty($pathinfo['extension']) ? '.' . $pathinfo['extension'] : ''; // extension append to filename

    // check if file is numbered already like file-3.jpg, so we can assign to file-4.jpg instead of file-3-2.jpg
    $numbered_name = explode('-', $filename);
    $current_count = array_pop($numbered_name);
    if(count($numbered_name) && is_numeric($current_count)) {
      $filename = join('-', $numbered_name);
      $i = $current_count + 1;
    }

    // increment filename if file already exists / default start by filename-2.ext
    while (file_exists($path)) {
      $path = $pathinfo['dirname'] . '/' . $filename . '-' . $i . $ext;
      $i++;
    }

    // return first available $path
    return $path;
  }

  // recursive iterator for copy, delete, duplicate
  //protected static function iterator($path, $mode = RecursiveIteratorIterator::SELF_FIRST){
  public static function iterator($path, $mode = RecursiveIteratorIterator::SELF_FIRST){
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path, RecursiveDirectoryIterator::SKIP_DOTS), $mode, RecursiveIteratorIterator::CATCH_GET_CHILD);
    self::$count += iterator_count($iterator);
    return $iterator;
  }

  // delete single file or folder
  private static function delete_file_or_folder($path){
    return is_dir($path) && !is_link($path) ? @rmdir($path) : @unlink($path);
  }

  // delete single file or folder recursively
  public static function delete($path){

    // if dir, iterate recursively and attempt to delete all descendants / don't iterate if is symlink
    // check if_writeable() will skip dirs that are not writeable, because we can't delete direct children. However, we may still be able to delete deep descendants, so might as well try to delete what can be deleted.
    if(is_dir($path) && !is_link($path)/* && is_writable($path)*/) foreach (self::iterator($path, RecursiveIteratorIterator::CHILD_FIRST) as $item) self::$success += self::delete_file_or_folder($item->getPathname());

    // delete file or folder after first deleting recursive items in folder
    return self::delete_file_or_folder($path);
  }

  // non-recursive copy single file or folder / creates folder when necessary
  private static function copy_file_or_folder($from, $to){
    // if(Path::is_exclude($to, is_dir($from))) return false; // exclude copy $to paths? kinda pointless
    if(Path::is_within_path($to, $from)) return false; // don't allow copying files or dirs into self or same location
    //if(!is_readable($from)) return false; // already checked in valid_rootpath() filter
    // if item is symlink, we recreate the symlink in $to location
    // we can't copy() symlinks and we don't want to copy the original target file or dir of the $from symlink
    if(is_link($from)) {
      if(!function_exists('symlink')) return false; // can't proceed if symlink() doesn't work
      $target = @realpath(readlink($from)) ?: $from; // attempt to resolve symlink, so we don't end up with a chain of symlinks
      return @symlink($target, $to); // create symlink
    }
    if(is_dir($from)) return is_dir($to) || @mkdir($to, 0777, true); // is_dir already or make new dir
    if(!is_readable($from)) return false; // can't read file source / might be recursive file
    if(file_exists($to) && filemtime($to) >= filemtime($from)) return false; // file already exists and is newer than source
    if(!@copy($from, $to)) return false; // attempt to copy from to / overwrite existing older files in $to location
    @touch($to, filemtime($from)); // inherit file modified time
    return true; // return success
  }

  // copy single file or folder recursively / kinda how the default php copy() should have worked? Also used for duplicate
  public static function copy($from, $to){
    if(!self::copy_file_or_folder($from, $to)) return false; // only continue on success
    // copy dirs recursively, unless symlink (the dir symlink is already copied, and we don't want to clone the entire symlink target)
    if(is_dir($from) && !is_link($from)) {
      $iterator = self::iterator($from);
      foreach ($iterator as $descendant) self::$success += self::copy_file_or_folder($descendant, $to . '/' . $iterator->getSubPathName());
    }
    return true;
  }

  // move file or folder / uses rename() wihch is recursive by default
  private static function move($from, $to){
    // if(Path::is_exclude($to, is_dir($from))) return false; // exclude move $to paths? Kinda pointless
    if(Path::is_within_path($to, $from)) return false; // don't allow moving files or dirs into self or same location
    if(file_exists($to) && filemtime($to) >= filemtime($from)) return false; // $to already exists and is newer than $from
    // if symlink and symlink target is relative, attempt to write symlink with canonical path to preserve symlink target
    if(is_link($from) && function_exists('symlink') && !@realpath(readlink($from))) {
      $target = @realpath(dirname($from) . '/' . readlink($from)); // attempt to resolve path relative to owner dir of symlink
      if($target) return @symlink($target, $to);
    }
    return @rename($from, $to); // can overwrite existing older files, but fails to overwrite non-empty dirs, which is ok
  }

  // duplicate single file or folder recursively incrementing filename (if filename provided, use copy($from, $to) instead)
  public static function duplicate($path){

    // copy item recursively with unique incremental file name
    return self::copy($path, self::get_unique_filename($path));
  }

  // run action on array of files and folders / return succes/fail array
  public static function items($action, $paths, $dir = false){

    // count paths / recursive iterators may add to count
    self::$count = count($paths);

    // loops paths
    foreach ($paths as $path) self::$success += self::$action($path, ($dir ? $dir . '/' . U::basename($path) : false));

    // return success and fail count
    return ['success' => self::$success, 'fail' => self::$count - self::$success];
  }

  // return an array of downloadable files from within an array of $paths
  public static function get_downloadables($paths){

    // prepare downloadables array
    $downloadables = [];

    // loop dir $paths / only dir $paths are forwarded to check recursively, as JS already knows the files
    foreach ($paths as $dir) {
      //if(is_link($dir)) continue; // un-comment if you dont' want downloads to follow symlinks / also inside foreach loop
      if(Path::is_exclude($dir, true)) continue; // shouldn't be necessary when forwarded from frontend, but just in case
      foreach (self::iterator($dir) as $item) { // loop dirs get all descendants
        $path = $item->getPathname();

        // create download list from readable, non-excluded files only (not dirs, as we don't download a dir)
        if(!is_readable($path) || is_dir($path) || Path::is_exclude($path, false)/* || is_link($path)*/) continue;

        // prepare relative app path
        $relpath = Path::relpath($path);

        // append to downloadables array
        $downloadables[] = [
          'path' => $relpath,
          'url_path' => Path::rooturlpath($relpath),
          'basename' => U::basename($path),
          'ext' => U::extension($path),
          'filesize' => filesize($path)
        ];
      }
    }

    // return downloadables array
    return $downloadables;
  }
}

// class Zipper / extends Filemanager / create and extract zip files
class Zipper extends Filemanager {

  // vars
  private $zip;
  private $is_json;

  // construct check class_exists('ZipArchive') and create new ZipArchive
  public function __construct($is_json = false){
    $this->is_json = $is_json;
    if(!class_exists('ZipArchive')) U::error('Missing PHP ZipArchive class', 500, $this->is_json);
    $this->zip = new ZipArchive();
  }

  // generic open zip with errors
  private function open($dest, $flags = null){

    // open zip
    $res = @$this->zip->open($dest, $flags);

    // return error type messages / https://www.php.net/manual/en/ziparchive.open.php
    $zip_open_errors = [
      4 => 'Seek error.',
      5 => 'Read error.',
      9 => 'No such file.',
      11 => 'Can\'t open file.',
      10 => 'File already exists.',
      14 => 'Malloc failure.',
      18 => 'Invalid argument.',
      19 => 'Not a zip archive.',
      21 => 'Zip archive inconsistent.'
    ];

    //  die if error
    if($res !== true) U::error($res && isset($zip_open_errors[$res]) ? $zip_open_errors[$res] : 'Unknown zip error', 500, $this->is_json);
  }

  // extract $zip_file into $dir (optional) / $dir is parent of zip if not set
  public function extract($zip_file, $dir = false){

    // check valid zip
    if(!is_file($zip_file) || U::extension($zip_file, true) !== 'zip' || empty(filesize($zip_file))) U::error('Invalid zip file', 400, $this->is_json);

    // $dir is parent of zip if not set
    if(!$dir) $dir = dirname($zip_file);

    // check target_dir writeable
    if(!is_writable($dir)) U::error('Target dir is not writeable', 403, $this->is_json);

    // open zip file
    $this->open($zip_file);

    // extract to target_dir
    $success = @$this->zip->extractTo($dir);

    // return always close() and $success
    return @$this->zip->close() && $success;
  }

  // create a new $zip_file from multiple $paths
  public function create($paths, $zip_file = false){

    //
    $first_path = reset($paths);

    // create zip root from first array path, so we can create relative local paths inside zip
    $root = dirname($first_path) . '/';

    // unique incremental 'archive.zip' if multiple paths or filename.jpg.zip (don't append .zip if extension already zip)
    if(!$zip_file) $zip_file = self::get_unique_filename($root . (count($paths) > 1 ? 'archive.zip' : U::basename($first_path) . (U::extension($first_path, true) !== 'zip' ? '.zip' : '')));

    // create new zip file or die
    $this->open($zip_file, ZipArchive::CREATE | ZipArchive::OVERWRITE);

    // loop $paths to add files
    foreach ($paths as $path) {

      // add file or dir / if added and is_dir, add file or dir recursively
      if($this->add_file_or_dir($path, $root) && is_dir($path)) foreach(self::iterator($path) as $file) $this->add_file_or_dir($file, $root);
    }

    // detect files count in zip
    $num_files = version_compare(PHP_VERSION, '7.2.0') >= 0 ? $this->zip->count() : $this->zip->numFiles;

    // success only if close() and has files and zip file exists in tar
    return $this->zip->close() && !empty($num_files) && file_exists($zip_file);
  }

  // add_file_or_dir
  private function add_file_or_dir($path, $root){
    //if(is_link($path)) return; // un-comment if zip should not follow symlinks
    if(Path::is_exclude($path, is_dir($path)) || !is_readable($path)) return false; // file excluded, continue
    $local_path = str_replace($root, '', $path); // local path relative to root
    return is_dir($path) ? @$this->zip->addEmptyDir($local_path) : @$this->zip->addFile($path, $local_path);
  }
}

// class CleanCache / cleans invalid and expired cache files from the _files/cache/* dirs at specific intervals or manually
class CleanCache {

  // vars
  private $menu_dir;                  // _files/cache/menu
  private $folders_dir;               // _files/cache/folders
  private $images_dir;                // _files/cache/images
  private $menu_hashes = [];          // array of menu hashes used to validate menu cache
  private $folders_hashes = [];       // array of folders hashes used to validate folders cache
  private $menu_cache_count = 0;      // menu cache file count
  private $menu_cache_deleted = 0;    // menu cache deleted count
  private $folders_cache_count = 0;   // folders cache file count
  private $folders_cache_deleted = 0; // folders cache deleted count
  private $images_cache_count = 0;    // images cache file count
  private $images_cache_deleted = 0;  // images cache deleted count
  private $image_cache_file;          // path to _files/cache/images/cache.txt file if config `image_cache_file` and if exists
  private $test = false;              // ?action=clean_cache&test=1 parameter to simulate cleaning cache without actually deleting files
  private $time_limit = 59;           // increase process time limit from 30 to 59 seconds (in case of massive cache and/or slow disk)

  // construct new CleanCache()
  public function __construct(){

    // exit if cache is disabled or _files/cache dir does not exist (nothing to clean)
    if(!Config::$cachepath || !file_exists(Config::$cachepath)) exit('cache dir does not exist');

    // make sure clean cache is allowed for this request, either from app or manual request
    if(!$this->is_allowed()) return;

    // in extreme cases (1.000.000+ image cache files) you may need to temporarily increase memory if default is insufficient
    // @ini_set('memory_limit', '512M');

    // increase time limit to 59 seconds (in case of massive cache and/or slow disk)
    $this->increase_time_limit();

    // update _files/cache filemtime to current time so that we know when it was last updated (when using clean_cache_interval)
    if(Config::get('clean_cache_interval')) touch(Config::$cachepath);

    // get all dirs _files/cache/{menu|folders|images} to check for cleaning
    $this->get_cache_dirs();

    // we need to collect all user config hashes to validate cache for menu and folders
    $this->get_hashes();

    // get ?test=1 parameter to simulate cleaning cache without actually deleting any files
    $this->test = !!U::get('test');

    // clean menu cache if $this->menu_dir exists
    if($this->menu_dir) $this->clean_menu_cache();

    // clean folders cache if $this->folders_dir exists
    if($this->folders_dir) $this->clean_folders_cache();

    // clean image cache if $this->images_dir dir exists
    if($this->images_dir) $this->clean_images_cache();

    // output useful response
    $this->response();
  }

  // check if cache cleaning is allowed for this request
  private function is_allowed(){

    // when called from the app ?action=clean_cache&app=1, we must check if it's time (clean_cache_interval) to clean cache
    if(U::get('app')){
      if(!self::is_time()) exit('It\'s not yet time to clean the cache');

    // else if called manually in browser, ignore is_time() but check config `clean_cache_allow_manual`
    } else if(!Config::get('clean_cache_allow_manual')) U::error('Config `clean_cache_allow_manual` is disabled', 403);

    // is allowed
    return true;
  }

  // increase time limit to 59 seconds (in case of massive cache and/or slow disk)
  private function increase_time_limit(){
    if(!$this->time_limit) return; // in case $time_limit is disabled
    $time = U::ini_get('max_execution_time'); // get current max_execution_time (normally 30 seconds)
    if(!is_numeric($time) || $time < $this->time_limit) @set_time_limit($this->time_limit); // assign new time limit
  }

  // check if it's time to clean cache dirs, based on config clean_cache_interval / used here and forwarded to javascript config
  public static function is_time(){
    if(!Config::$cachepath || !Config::get('clean_cache_interval')) return false;
    return self::days_since(filemtime(Config::$cachepath)) > Config::get('clean_cache_interval');
  }

  // get all dirs _files/cache/{menu|folders|images} to check for cleaning
  private function get_cache_dirs(){
    foreach (['menu', 'folders', 'images'] as $key) {
      $path = Config::$cachepath . '/' . $key;
      if(file_exists($path)) $this->{ $key . '_dir' } = $path;
    }
  }

  // we need to collect all user config hashes to validate cache for menu and folders
  private function get_hashes(){

    // nothing to check if /menu/ and /folders/ dirs don't exist
    if(!$this->menu_dir && !$this->folders_dir) return;

    // get default config (not necessarily current user config)
    $default = array_replace(Config::$default, Config::$storageconfig, Config::$localconfig);

    // configs array always contains default config
    $configs = [$default];

    // add user configs to configs array
    foreach (Login::get_usernames() as $username) {
      $arr = U::uinclude("users/$username/config.php"); // return user config array
      if(is_array($arr)) $configs[] = array_replace($default, $arr); // merge user config on top of default config
    }

    // loop configs to add unique config hashes to menu_hashes and folders_hashes
    foreach ($configs as $config) {

      // get user absolute root
      $root = Path::realpath($config['root']);

      // exit if root is invalid (invalid config)
      if(!$root || Config::$storagepath === $root) continue;

      // get menu hash for $config and $root, add to menu_hashes associative array (hashes may be duplicate)
      if($this->menu_dir) $this->menu_hashes[U::get_menu_hash($config, $root)] = true;

      // get dirs hash for $config and $root, add $root to folders_hashes array for folders cache validation
      if($this->folders_dir) $this->folders_hashes[U::get_dirs_hash($config, $root)] = $root;
    }
  }

  // clean _files/cache/menu/*.json cache
  private function clean_menu_cache(){

    // get json cache files from _files/cache/menu/*
    $files = $this->get_cache_files('menu', 'json');

    // menu cache is empty (nothing to clean)
    if(empty($files)) return;

    // start $groups array to store menu cache items per menu hash, as there can only be one valid cache file per hash
    $groups = [];

    // loop menu cache files
    foreach ($files as $file) {

      // get $paths.$options.$filemtime from file name a70045.5ca3d7.6970116359.json
      $arr = explode('.', basename($file), -1);

      // pop menu cache $filemtime from array
      $filemtime = array_pop($arr);

      // create menu $hash from remaining array $paths.$options
      $hash = implode('.', $arr);

      // $hash is valid and exists in menu_hashes
      if($hash && is_numeric($filemtime) && isset($this->menu_hashes[$hash])){

        // store in hash groups with filemtime as key, as latest filemtime in group would be valid (if there are any valid)
        $groups[$hash][intval($filemtime)] = $file;

      // delete if the hash is invalid or doesn't match any current menu_hashes
      } else $this->remove('menu', $file);
    }

    // loop menu cache groups, sort by filemtime (key), keep latest, remove the rest ...
    foreach ($groups as $group) {

      // sort group items by filemtime so that latest cache file is last
      ksort($group, SORT_NUMERIC);

      // remove latest valid cache item for the group
      $latest = array_pop($group);

      // loop remove remaing cache files in group which basically must be invalid
      foreach ($group as $file) $this->remove('menu', $file);
    }
  }

  // clean _files/cache/folders/*.json cache
  private function clean_folders_cache(){

    // get json cache files from _files/cache/folders/*
    $files = $this->get_cache_files('folders', 'json');

    // folders cache is empty (nothing to cleann)
    if(empty($files)) return;

    // start $groups array to store folders cache items per $dirs_hash.$path_hash, as there can only be one valid file
    $groups = [];

    // loop cache files
    foreach ($files as $file) {

      // get $dirs_hash.$path_hash.$filemtime from file name 47b52c.404878.1744343564.json
      $arr = explode('.', basename($file), -1);

      // match $dirs_hash in filename with folders_hashes
      if(count($arr) === 3 && is_numeric($arr[2]) && isset($this->folders_hashes[$arr[0]])){

        // split array into variables
        list($dirs_hash, $path_hash, $filemtime) = $arr;

        // group cache files that are created for the same path with the same dirs_hash (only one can be valid)
        $groups["$dirs_hash.$path_hash"][intval($filemtime)] = [
          'file' => $file,                            // absolute json cache file path
          'root' => $this->folders_hashes[$dirs_hash] // root path this cache exists for
        ];

      // delete if the hash doesn't match any current folders_hashes
      } else $this->remove('folders', $file);
    }

    // loop groups to check if any file in each group is valid ($dir must exist and filemtime must match a file in group)
    foreach ($groups as $group) {

      // sort group by mtime key so that most recent cache filemtime is last
      ksort($group, SORT_NUMERIC);

      // get most recent cache filemtime entry, which is most likely valid, although we will compare all entries in group
      $last = end($group);

      // load most recent cache file into array
      $arr = @json_decode(@file_get_contents($last['file']), true);

      // assemble absolute dir path for this group (will be identical for all group entries because same $dirs_hash.$path_hash)
      $dir_path = !empty($arr) ? $last['root'] . ($arr['path'] ? '/' . $arr['path'] : '') : false;

      // get dir filemtime() if dir exists, so we can check if there is a cache file in this group that matches
      $dir_mtime = $dir_path && file_exists($dir_path) ? filemtime($dir_path) : false;

      // if dir exists and has a cache file in this group that matches the filemtime, we can keep it (remove from array)
      if($dir_mtime && isset($group[$dir_mtime])) unset($group[$dir_mtime]);

      // loop remove remaining invalid cache files in group (only one can be valid)
      foreach ($group as $mtime) $this->remove('folders', $mtime['file']);
    }
  }

  // clean _files/cache/images/*.jpg cache
  private function clean_images_cache(){

    // get jpg cache files from _files/cache/images/*
    $files = $this->get_cache_files('images', 'jpg');

    // get _files/cache/images/cache.txt file path if enabled and exists (so we can use it to check created cache files)
    $this->image_cache_file = $this->get_image_cache_file();

    // initiate $map associative array so that image cache files can be checked vs cache.txt file
    $map = [];

    // loop image cache files and delete invalid items
    foreach ($files as $file) {

      // get filename
      $filename = basename($file);

      // split filename into array to extract parts / $pathhash.$filesize.$filemtime.$image_resize_dimensions.jpg
      $arr = explode('.', $filename);

      // delete cache file if name is invalid or resize is invalid or file exceeds max last access time
      if(
        count($arr) !== 5 ||
        ($arr[3] != 'convert' && !U::resize_is_allowed(intval($arr[3]))) ||
        $this->exceeds_max_last_access_time($file)
      ) {
        $this->remove('images', $file);

      // add remaining valid cache files to $map associative array for checkup vs cache.txt file
      // 0 identifies unchecked item in case of duplicate filenames in cache.txt file
      } else if($this->image_cache_file) $map[$filename] = 0;
    }

    // exit if $map is empty, return and delete cache file (if exists) because there is no cache or all cache was already deleted
    if(empty($map)) return $this->remove_image_cache_file();

    // read cache.txt file into lines / one line for each created cache file
    $lines = @file($this->image_cache_file, FILE_SKIP_EMPTY_LINES|FILE_IGNORE_NEW_LINES);

    // exit if files is empty / delete empty cache file (unless there is some error response)
    if(empty($lines)) return is_array($lines) ? $this->remove_image_cache_file() : false;

    // count lines so we can check if cache.txt file needs to be updated after processing entries
    $line_count = count($lines);

    // loop cache.txt file entries, keep valid entries, remove the rest
    foreach ($lines as $index => $line) {

      // make sure entry is valid $cachefile.jpg:/path/to/file.jpg and can be parsed into $filename and $path
      if(strpos($line, ':')){

        // get cache $filename and original $path from entry
        list($filename, $path) = explode(':', $line, 2);

        // check if entry corresponds to existing cache file in $map array and isn't a duplicate entry
        if(isset($map[$filename]) && !$map[$filename]){

          // fix an issue when two entries might have got added into same line
          // I think this was resolved when we added PHP_EOL in front of new lines ...
          /*if(strpos($path, ':') && preg_match('/(.+)([a-z0-9]{6}\.\d+\.\d+\.\d+\.jpg:.+$)/', $path, $matches)){
            $path = $matches[1]; // re-assign $path for current entry
            $lines[$index] = "$filename:$path"; // correct this line
            array_push($lines, $matches[2]); // push extracted line to end of array
          }*/

          // mark this item checked so we can ignore further duplicate entries
          $map[$filename] = 1;

          // keep image if entry represents a valid cache file ($filesize and $filemtime must match original)
          if($this->cache_file_entry_valid($filename, $path)) continue;

          // delete expired cache $filename
          $this->remove('images', "$this->images_dir/$filename");
        }
      }

      // remove invalid entry from $lines array (if !test)
      if(!$this->test) unset($lines[$index]);
    }

    // delete cache.txt file if lines array is empty after processing entries
    if(empty($lines)) return $this->remove_image_cache_file();

    // rewrite remaining lines if line count changed (if !test)
    if(!$this->test && count($lines) !== $line_count) @file_put_contents($this->image_cache_file, implode(PHP_EOL, $lines));
  }

  // get path for _files/cache/images/cache.txt image_cache_file if it exists / stores image cache file references as they get created
  private function get_image_cache_file(){
    if(!Config::get('image_cache_file')) return;
    $path = $this->images_dir . '/' . Config::get('image_cache_file');
    return file_exists($path) ? $path : false;
  }

  // remove _files/cache/images/cache.txt file
  private function remove_image_cache_file(){
    if(!$this->image_cache_file || $this->test) return;
    @unlink($this->image_cache_file);
  }

  // check if image cache file exceeds image_cache_max_last_access_time / deletes image files if they haven't been accessed since X days
  private function exceeds_max_last_access_time($file){
    // only check if image_cache_max_last_access_time is set (0 = disabled)
    if(!Config::get('image_cache_max_last_access_time')) return;
    // true if last access time for cache file exceeds config image_cache_max_last_access_time
    return self::days_since(@fileatime($file)) > Config::get('image_cache_max_last_access_time');
  }

  // calculate days since specific timestamp (seconds) / static because accessed from non-object
  public static function days_since($time){
    return $time ? (time() - $time) / 86400 : 0;
  }

  // check if images cache.txt file entry is valid / 2fd489.350621.1587906784.320.jpg /path/to/image.jpg
  private function cache_file_entry_valid($filename, $path){

    // invalid if original path doesn't exist
    if(!file_exists($path)) return;

    // get filesize and filemtime from cache filename (name is already validated in $map array)
    list($filesize, $filemtime) = array_map('intval', array_slice(explode('.', $filename), 1, 2));


    // if empty filesize and filemtime (dir preview images), valid if filemtime(cache) >= filemtime(path)
    if(!$filesize && !$filemtime) return filemtime("$this->images_dir/$filename") >= filemtime($path);

    // valid if filesize and filemtime in name matches filesize() and filemtime() for original $path
    return $filesize === filesize($path) && $filemtime === filemtime($path);
  }

  // get all cache files for any $type and $ext
  private function get_cache_files($type, $ext){

    // get all cache files for specific $type and $ext
    $files = @glob($this->{ $type . '_dir' } . '/*.' . $ext, GLOB_NOSORT);

    // store the total amount of $type cache files for useful response
    if(!empty($files)) $this->{ $type . '_cache_count' } = count($files);

    // return files array
    return $files ?: [];
  }

  // remove a cache file and add to delete count
  private function remove($type, $path){
    if(!$this->test) @unlink($path);
    //echo "[$type] Deleted " . basename($path) . '<br>'; // verbose per-file response (kinda useless)
    $this->{ $type . '_cache_deleted' } ++;
  }

  // cache cleaner response text shows delete count / total count for each cache type (visible when run from browser ?action=clean_cache)
  private function response(){
    U::header('Cache cleaned'); // so we can check response time and memory consumed
    if($this->test) echo '<strong>[TEST]</strong><br>';
    foreach (['menu', 'folders', 'images'] as $k){
      if(!$this->{ $k . '_dir' }) continue;
      $count = $this->{$k . '_cache_count'};
      $delete_count = $this->{$k . '_cache_deleted'};
      echo "Deleted $delete_count of $count $k cache files<br>";
    }
  }
}

// class Request / extract parameters for all actions
class Request {

  // vars
  public $action;
  public $params;
  public $is_post;

  // construct
  public function __construct(){
    $this->action = U::get('action');
    $this->is_post = $_SERVER['REQUEST_METHOD'] === 'POST';
    $this->params = $this->get_request_data();
    if(!is_array($this->params)) $this->error('Invalid parameters');
  }

  // get request data parameters
  public function get_request_data(){
    if(!$this->is_post) return $_GET;
    if(isset($_POST) && !empty($_POST)) return $_POST;
    $php_input = @json_decode(@trim(@file_get_contents('php://input')), true); // javascript fetch()
    return $php_input ?: [];
  }

  // get specific string value parameter from data (dir, file path etc)
  public function param($param){
    if(!isset($this->params[$param])) return false;
    //$p = $this->params[$param];
    //if(!is_string($p) || !is_bool($p)) $this->error("Invalid $param parameter"); // must be string if exists
    return is_string($this->params[$param]) ? trim($this->params[$param]) : $this->params[$param]; // trim it
  }

  // error response based on request type / 400 Bad Request default / 401, 403, 404, 500
  public function error($err, $code = 400){
    if($this->is_post) return Json::error($err);
    U::error($err, $code);
  }
}

// class Document / creates the main Files Gallery document response
class Document {

  // private Document class vars
  private $start_path = '';             // start_path extracted and validated from query or $config['start_path']
  private $absolute_start_path = false; // absolute path of start_path, for validation and dirs preload
  private $dirs = [];                   // array of dirs to be preloaded, normally root and query or start_path (if not same as root)
  private $menu_exists = false;         // determines if menu exists from config and checks for dirs in root
  private $menu_cache_hash = false;     // assign a menu cache hash so menu cache can be validated on load
  private $menu_cache_file = false;     // assign direct access to menu json cache file when menu_cache_validate is disabled
  private $index_html = false;          // timestamp when index_cache is used to create index.html

  // document construct tasks
  public function __construct(){

    // first we must get and validate start_path from ?query or config start_path
    $this->get_start_path();

    // always get root dir array (outputs as json, for javascript)
    $this->dirs[''] = (new Dir(Config::$root))->get();

    // get start path dir (if valid and not same as root, in case symlinked)
    if($this->absolute_start_path && Path::realpath($this->absolute_start_path) !== Config::$root) $this->dirs[$this->start_path] = (new Dir($this->absolute_start_path))->get();

    // prepare menu variables menu_exists, menu_cache_hash and menu_cache_file
    $this->prepare_menu();

    // output main Files Gallery document HTML
    $this->HTML();
  }

  // get start_path from ?query or from config start_path (if set)
  private function get_start_path(){

    // first check if we have a query path
    $query_path = $this->get_query_path();

    // we have a query path (although it's not necessarily a valid dir)
    if($query_path){

      // assign query_path as start_path
      $this->start_path = $query_path;

      // check and return valid root path from query path
      $this->absolute_start_path = Path::valid_rootpath($this->start_path, true);

    // start path from config with error response invalid (path must exist, non-excluded and must be inside root)
    } else if(Config::get('start_path')) {

      // shortcut
      $start_path = Config::get('start_path');

      // get realpath from `start_path` config option
      // `start_path` should be relative to root dir, but check also check if path is relative to app (backwards compatibility)
      $this->absolute_start_path = Path::realpath(Path::rootpath($start_path)) ?: Path::realpath($start_path);

      // error if path does not exist or !is within root or is_exclude
      if(!$this->absolute_start_path || !Path::is_within_path($this->absolute_start_path, Config::$root) || Path::is_exclude($this->absolute_start_path)) U::error('Invalid start_path ' . $start_path);

      // assign root-relative start_path to forward to javascript
      $this->start_path = Path::relpath($this->absolute_start_path);
    }
  }

  // parse query_string and get first ?parameter to be considered path
  private function get_query_path(){
    if($this->index_html) return; // exit if we are generating index.html index_cache, as query will be manageg by javascript
    if(empty($_SERVER['QUERY_STRING'])) return; // exit if !QUERY_STRING
    $path = explode('&', $_SERVER['QUERY_STRING'])[0]; // get first parameter in QUERY_STRING for path
    if(!$path || strpos($path, '=') !== false) return; // make sure path exists and is not assigned parameter=value
    return trim(rawurldecode($path), '/'); // trime and decode
  }

  // prepare main menu variables
  private function prepare_menu(){

    // exit if !menu_enabled
    if(!Config::get('menu_enabled')) return;

    // get root dirs / used to decide if menu_exists, breadcrumbs and to generate shallow menu_cache_hash
    $root_dirs = array_filter(U::glob(Config::$root . '/*', true), function($dir){
      return !Path::is_exclude($dir, true, is_link($dir));
    });

    // menu exists only if root_dirs is not empty
    $this->menu_exists = !empty($root_dirs);

    // exit if !menu_exists
    if(!$this->menu_exists) return;

    // get menu_cache_hash used to validate first level shallow menu cache and when !menu_cache_validate
    $this->menu_cache_hash = $this->get_menu_cache_hash($root_dirs);

    // get JSON menu_cache_file to forward to Javascript if menu_cache_validate is disabled
    $this->get_menu_cache_file();
  }

  // menu_cache_hash used to validate first level shallow menu cache (no validation required) and when !menu_cache_validate
  private function get_menu_cache_hash($root_dirs){

    // get latest dir filemtime from root/subdirs
    $latest = max(array_map(function($dir){
      return filemtime($dir);
    }, array_merge([Config::$root], $root_dirs)));

    // return unique menu cache hash based on various $config (that might affect menu), $root and latest dir filemtime from root/subdirs
    return U::get_menu_hash(Config::$config, Config::$root) . '.' . $latest;
  }

  // get JSON menu_cache_file to forward to Javascript if menu_cache_validate is disabled
  private function get_menu_cache_file(){

    // exit if menu_cache_validate or !cache or !storage is_within_doc_root
    if(Config::get('menu_cache_validate') || !Config::get('cache') || !Path::has_urlpath(Config::$storagepath)) return;

    // check if valid menu json cache file exists
    $path = Config::$cachepath . '/menu/' . $this->menu_cache_hash . '.json';
    $url_path = file_exists($path) ? Path::urlpath($path) : false;
    if($url_path) $this->menu_cache_file = $url_path . '?' . filemtime($path);
  }

  // start index.html index_cache if enabled and assigned by url parameter ?create_index_cache=passphrase
  private function start_index_cache(){
    // check ?create_index_cache=passphrase matches config index_cache passphrase
    if(Config::get('index_cache') !== TRUE && U::get('create_index_cache') !== Config::get('index_cache')) U::error('Incorrect passphrase for index_cache');
    // index_cache does not work if login is required
    if(Login::$has_public_login) U::error('Config index_cache can\'t be used when login is required');
    // index_cache can only be created from non-logged in user (must create a public accessible html page)
    if(Login::$is_logged_in) U::error("You must <a href=\"?logout=1&create_index_cache=$create_index_cache\">logout</a> to generate index_cache");
    // assign index_html as a unique timestamp
    $this->index_html = time();
    // start output buffering
    ob_start();
    // add HTML comment at top of document so we can easily recognize if response is cached index.html
    echo "<!-- index_html $this->index_html -->";
  }

  // save index_cache index.html and exit
  private function save_index_cache(){
    // save index.html with current buffer response
    $success = file_put_contents('./index.html', ob_get_clean());
    // output success message and exit
    exit(($success ? 'Created' : 'Failed to create') . ' <a href=".">index.html</a> index_cache ' . $this->index_html);
  }

  // output main Files Gallery document HTML
  private function HTML(){

    // main document, output version, request time and memory
    U::header('Version ' . Config::$version);

    // start index.html index_cache if enabled and assigned by url parameter ?create_index_cache=passphrase
    if(Config::get('index_cache') && U::get('create_index_cache')) $this->start_index_cache();

    // main document html start
    U::html_header($this->start_path ? U::basename($this->start_path) : './', 'menu-' . ($this->menu_exists ? 'enabled' : 'disabled sidebar-closed'));
    ?>
    <body class="body-loading"<?php if(Login::$is_logged_in) echo ' data-username="' . htmlspecialchars(Config::get('username')) . '"'; ?>>
      <main id="main">
        <nav id="topbar" class="topbar-sticky">
          <div id="topbar-top">
            <div id="search-container"><input id="search" class="input" type="search" placeholder="search" size="1" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" disabled></div>
            <div id="change-layout" class="dropdown"></div>
            <div id="change-sort" class="dropdown"></div>
          </div>
          <div id="topbar-breadcrumbs"></div>
          <div id="files-sortbar"></div>
          <div class="topbar-select"></div>
          <div id="topbar-info" class="info-hidden"></div>
        </nav>
        <div id="files-container"><div id="files" class="list files-<?php echo Config::get('layout'); ?>"></div></div>
      </main>

      <?php if($this->menu_exists) { ?>
      <aside id="sidebar">
        <button id="sidebar-toggle" type="button" class="button-icon"></button>
        <div id="sidebar-inner">
          <div id="sidebar-topbar"></div>
          <div id="sidebar-menu"></div>
        </div>
      </aside>
      <div id="sidebar-bg"></div>
      <?php } ?>

      <div id="contextmenu" class="dropdown-menu" tabindex="-1"></div>

      <?php U::uinclude('include/footer.html'); ?>

<!-- javascript -->
<script>
const _c = <?php echo json_encode($this->get_javascript_config(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_PARTIAL_OUTPUT_ON_ERROR); ?>;
var CodeMirror = {};
</script>
<?php

// load _files/js/custom.js if the file exists
U::uinclude('js/custom.js');
// load user custom js / disabled by default because it seems a bit pointless / un-comment if required
// if(Login::$is_logged_in && !Login::$is_default_user) U::uinclude('users/' . Config::get('username') . '/js/custom.js');

// preload all Javascript assets
foreach (array_filter([
  'toastify-js@1.12.0/src/toastify.min.js',
  'sweetalert2@11.19.1/dist/sweetalert2.min.js',
  'animejs@3.2.2/lib/anime.min.js',
  'yall-js@3.2.0/dist/yall.min.js',
  'filesize@9.0.11/lib/filesize.min.js',
  'screenfull@5.2.0/dist/screenfull.min.js',
  'dayjs@1.11.13/dayjs.min.js',
  'dayjs@1.11.13/plugin/localizedFormat.js',
  'dayjs@1.11.13/plugin/relativeTime.js',
  (in_array(Config::get('download_dir'), ['zip', 'files']) ? 'js-file-downloader@1.1.25/dist/js-file-downloader.min.js' : false),
  'file-saver@2.0.5/dist/FileSaver.min.js',
  'jszip@3.10.1/dist/jszip.min.js',
  'codemirror@6.65.7/mode/meta.js',
  'files.photo.gallery@' . Config::$version . '/js/files.js'
]) as $key) echo '<script src="' . U::assetspath() . $key . '"></script>' . PHP_EOL;
?></body></html><?php

  // if index_html (index_cache), save index.html and exit
  if($this->index_html) $this->save_index_cache();

  // end HTML
  }

  // get Javascript config array / includes config properties and calculated values specifically for Javascript
  private function get_javascript_config(){

    // exclude config user settings for frontend (Javascript) when sensitive and/or not used in frontend
    $exclude = [
      'root',
      'root_url_path',
      'start_path',
      'image_resize_cache',
      'image_resize_quality',
      'image_resize_function',
      'image_resize_cache_direct',
      'menu_load_all',
      'cache_key',
      'clean_cache_interval',
      'image_cache_file',
      'image_cache_max_last_access_time',
      'image_cache_validate_time',
      'storage_path',
      'files_include',
      'files_exclude',
      'dirs_include',
      'dirs_exclude',
      'username',
      'password',
      'allow_tasks',
      'allow_symlinks',
      'menu_recursive_symlinks',
      'image_resize_sharpen',
      'get_mime_type',
      'license_key',
      'ffmpeg_path',
      'imagemagick_path',
      'folder_preview_default',
      'image_resize_dimensions_allowed',
      'download_dir_cache',
      'index_cache'
    ];

    // assemble config array without excluded items
    $config = array_diff_key(Config::$config, array_flip($exclude));

    // return Javascript config array, merged (some values overridden) with main $config
    return array_replace($config, [
      'script' => U::basename(__FILE__), // so JS knows where to post
      'menu_exists' => $this->menu_exists, // so JS knows if menu exists
      'menu_cache_hash' => $this->menu_cache_hash, // hash to post from JS when loading menu to check cache
      'menu_cache_file' => $this->menu_cache_file, // direct url to JSON menu cache file if !menu_cache_validate
      'start_path' => $this->start_path, // assign calculated start_path for first JS load
      'query_path_invalid' => $this->start_path && !$this->absolute_start_path, // invalid query path forward to JS
      'dirs' => $this->dirs, // preload dirs array for Javascript, will be served as json
      'dirs_hash' => U::get_current_dirs_hash(), // dirs_hash to manage JS localStorage
      'resize_image_types' => U::resize_image_types(), // let JS know what image types can be resized
      'imagemagick_image_types' => U::imagemagick_image_types(), // let JS know what image types can be converted with imagemagick
      'image_resize_dimensions_retina' => U::image_resize_dimensions_retina(), // calculated retina
      'location_hash' => md5(Config::$root), // so JS can assume localStorage for relative paths like menu items open
      'is_logged_in' => Login::$is_logged_in, // for login/logout interface
      'username' => Login::$is_logged_in ? Config::get('username') : false, // username if logged in, for settings interface
      'has_public_login' => Login::$has_public_login,
      'session_token' => !$this->index_html && isset($_SESSION['token']) ? $_SESSION['token'] : false, // token means there is login
      'version' => Config::$version, // forward version to JS
      'index_html' => $this->index_html, // timestamp when is index.html created from index_cache option
      'server_exif' => function_exists('exif_read_data'), // so images can be oriented from exif orientation if detected
      'image_resize_memory_limit' => $this->get_image_resize_memory_limit(), // so JS can calculate what images can be resized
      'md5' => $this->get_md5('6c6963656e73655f6b6579'), // calculate md5 hash
      'ffmpeg' => !!U::app_path('ffmpeg'), // ffmpeg required for video thumbnails
      'imagemagick' => !!U::imagemagick(), // detect imagemagick
      'imagemagick_pdf' => U::imagemagick() === 'imagick' ? !empty((new Imagick())->queryFormats('PDF')) : !!U::imagemagick(), // pdf support
      'lang_custom' => $this->lang_custom(), // get custom language files _files/lang/*.json
      'x3_path' => X3::x3_path(), // in case of used with X3, forward X3 url path for thumbnails
      'userx' => isset($_SERVER['USERX']) ? $_SERVER['USERX'] : false, // forward USERX from server (if set)
      'assets' => U::assetspath(), // calculated assets path (Javascript and CSS files from CDN or local)
      'watermark_files' => $this->get_watermark_files(), // get uploaded watermark files (font, image) from _files/watermark/*
      'ZipArchive_enabled' => class_exists('ZipArchive'), // required for zip and unzip functions on server
      'upload_max_filesize' => $this->get_upload_max_filesize(), // let the upload interface know upload_max_filesize
      'custom_previews' => $this->get_custom_previews(), // get custom preview images from _files/previews/*
      'is_clean_cache_time' => !$this->index_html && CleanCache::is_time(), // check if is time to clean cache
    ]);
  }

  // get image resize memory_limit so JS can calculate at what dimensions images can be resized
  private function get_image_resize_memory_limit(){
    if(!function_exists('ini_set')) return U::get_memory_limit_mb();
    return (int) max(U::get_memory_limit_mb(), Config::get('image_resize_memory_limit'));
  }

  // calculate md5 hash from string
  private function get_md5($str){
    $str = Config::get(hex2bin($str));
    return $str ? md5($str) : false;
  }

  // look for custom language files in _files/lang/*.json and forward to Javascript
  private function lang_custom() {
    if(!Config::$storagepath) return false;
    $dir = Config::$storagepath . '/lang'; // custom languages path
    $files = is_dir($dir) ? glob($dir . '/*.json') : false; // get language json files
    if(empty($files)) return false; // exit
    $langs = []; // start languages array
    foreach ($files as $path) { // loop language files
      $json = @file_get_contents($path);
      $data = !empty($json) ? @json_decode($json, true) : false;
      if(!empty($data)) $langs[strtok(U::basename($path), '.')] = $data; // assign language as array
    }
    return !empty($langs) ? $langs : false; // return array of languages with values
  }

  // common function to return url paths for files in any storagepath dir (watermark, custom previews)
  private function get_storage_dir_files($dirname){
    if(!Config::$storagepath || !Path::has_urlpath(Config::$storagepath)) return;
    $path = Config::$storagepath . '/' . $dirname;
    if(!file_exists($path) || !is_readable($path)) return;
    $urlpath = Path::urlpath($path);
    return array_map(function($file) use ($urlpath){
      return $urlpath . '/' . basename($file);
    }, @glob($path . '/*', GLOB_NOSORT) ?: []);
  }

  // search for watermark files (font, image) in _files/watermark/* for Uppy Compressor
  private function get_watermark_files() {
    return Config::get('allow_upload') ? $this->get_storage_dir_files('watermark') : false;
  }

  // get custom preview images from _files/previews/*
  private function get_custom_previews(){
    $previews = $this->get_storage_dir_files('previews');
    return !empty($previews) ? array_combine(array_map(function($preview){
      return pathinfo($preview, PATHINFO_FILENAME); // "pdf": "_files\/previews\/pdf.jpg",
    }, $previews), $previews) : false;
  }

  // get upload_max_filesize for uploader interface, limited by PHP upload_max_filesize, post_max_size and config upload_max_filesize
  private function get_upload_max_filesize(){
    if(!Config::get('allow_upload')) return 0; // just return 0 if upload is disabled
    $arr = array_filter([U::ini_value_to_bytes('upload_max_filesize'), U::ini_value_to_bytes('post_max_size'), Config::get('upload_max_filesize')]); // don't include falsy values
    return empty($arr) ? 0 : min($arr);
  }
}



/* Files Gallery application logic starts here */

// set UTF-8 locale so that basename() and other string functions work correctly with multi-byte strings.
setlocale(LC_ALL, 'en_US.UTF-8');

// start new Config()
new Config();

// process actions ?action=
if(U::get('action')){

  // start new request
  $request = new Request();

  // action shortcut
  $action = $request->action;

  // only allow valid actions
  if(!in_array($action, [
    'files',            // load files data for a single dir
    'dirs',             // create menu from dirs in root
    'load_text_file',   // load a text-based file
    'check_updates',    // check if app updates are available
    'do_update',        // update the app
    'save_license',     // save license key
    'delete',           // filemanager delete
    'text_edit',        // filemanager edit text file
    'unzip',            // filemanager unzip
    'rename',           // filemanager rename file or folder
    'new_file',         // filemanager create new empty text file
    'new_folder',       // filemanager create new empty folder
    'zip',              // filemanager create zip file from multiple sources
    'copy',             // filemanager copy files
    'move',             // filemanager move files
    'duplicate',        // filemanager duplicate files
    'get_downloadables',// get downloadable files recursively from a specific dir
    'upload',           // filemanager upload files
    'download_dir_zip', // create zip from dir recursively and download
    'preview',          // get preview image for folder
    'file',             // get file or preview image with ?resize parameter
    'download',         // force download a file
    'tasks',            // run tasks plugin
    'login',            // login by XHR
    'ping',             // login ping check
    'settings',         // edit settings and users
    'tests',            // ?action=tests output
    'clean_cache'       // clean cache action
  ])) $request->error("Invalid action '$action'");

  // check that request method POST/GET matches action / below actions are GET only, all others are POST
  if($request->is_post === in_array($action, [
    'download_dir_zip',
    'preview',
    'file',
    'download',
    'tasks',
    'tests',
    'clean_cache'
  ])) $request->error("Invalid request method {$_SERVER['REQUEST_METHOD']} for action=$action");

  // make sure actions with config allow_{$action} (most write actions) are allowed
  if(isset(Config::$config['allow_' . $action]) && !Config::$config['allow_' . $action]) $request->error("$action not allowed");

  // block all write actions in demo mode (that's what demo_mode option is for)
  if(Config::get('demo_mode') && in_array($action, ['upload', 'delete', 'rename', 'new_folder', 'new_file', 'duplicate', 'text_edit', 'zip', 'unzip', 'move', 'copy'])) $request->error("$action not allowed in demo mode");

  // block all download actions [get_downloadables, download_dir_zip, download] if !allow_download
  if(!Config::get('allow_download') && strpos($action, 'download') !== false) $request->error('Download not allowed');

  // block all mass download actions [get_downloadables, download_dir_zip] if !allow_mass_download
  if(!Config::get('allow_mass_download') && in_array($action, ['get_downloadables', 'download_dir_zip'])) $request->error('Mass download not allowed');

  // prepare and validate $dir (full) from ?file parameter (if isset) for various actions
  $dir = $request->param('dir');
  if($dir !== false){ // explicitly check !== false because $dir could be valid '' empty (root)
    $dir = Path::valid_rootpath($dir, true);
    if(!$dir) $request->error('Invalid dir path');
    // some actions require $dir to be writeable
    if(in_array($action, ['copy', 'move', 'unzip', 'upload']) && !is_writable($dir)) $request->error('Dir is not writeable');
  // actions that strictly require $dir (it's optional for some actions)
  } else if(in_array($action, ['files', 'copy', 'move', 'upload', 'download_dir_zip', 'preview'])){
    $request->error('Missing dir parameter');
  }

  // prepare and validate $file (full) from ?file parameter (if isset) for various actions
  $file = $request->param('file');
  if($file){
    $file = Path::valid_rootpath($file);
    if(!$file) $request->error('Invalid file path');
  // actions that strictly require $file
  } else if(in_array($action, ['load_text_file', 'file', 'download'])){
    $request->error('Missing file parameter');
  }

  // validate items for Filemanager actions (all but upload)
  if(isset($request->params['items'])){

    // assign $items
    $items = $request->params['items'];

    // invalid $items if false, empty array or !array
    if(empty($items) || !is_array($items)) $request->error('Invalid items parameter');

    // assign [paths] / make sure each item.path exists, is valid, not excluded, and relative to Config::$root
    $paths = array_values(array_filter(array_map(function($item){
      return Path::valid_rootpath($item['path'], $item['is_dir']);
    }, $items)));

    // no valid item paths
    if(empty($paths)) $request->error('Invalid item paths');

    // shortcut because many actions only apply to a single item
    $first_path = reset($paths);

    // only actions new_file and new_file are allowed on root dir / other actions don't make sense for root
    if($first_path === Config::$root && !in_array($action, ['new_file', 'new_folder'])) $request->error("Can't $action root directory");

    // prepare $new_path for actions rename (required), new_file, new_folder, zip and duplicate
    $new_path = false; // instantiate var because it's optional for all actions except rename
    $name = $request->param('name'); // get ?name parameter
    if($name !== false) {

      // check if $name is allowed
      if(!Filemanager::name_is_allowed($name)) $request->error(trim("Invalid name $name"));

      // get parent dir / if new_folder or new_file, use selected item path, else dirname() of selected item path
      $parent_dir = in_array($action, ['new_folder', 'new_file']) ? $first_path : dirname($first_path);
      if(!is_dir($parent_dir)) $request->error('Not a directory'); // parent path must be dir
      if(!is_writable($parent_dir)) $request->error('Dir is not writeable'); // dir must be writeable

      // assign $new_path from $name
      $new_path = $parent_dir . '/' . $name;
      if(file_exists($new_path)) $request->error((is_dir($new_path) ? 'Dir' : 'File') . ' already exists');
    }

  // actions that require items parameter
  } else if(in_array($action, ['copy', 'delete', 'duplicate', 'get_downloadables', 'move', 'new_file', 'new_folder', 'rename', 'text_edit', 'unzip', 'zip'])){
    $request->error('Missing items parameter');
  }

  /* ACTIONS */

  // get files from dir_target
  if($action === 'files') {

    // output dir array in json format (checks json cache first)
    (new Dir($dir))->json();

  // get dirs for menu
  } else if($action === 'dirs'){
    new Dirs();

  // read text file
  } else if($action === 'load_text_file'){
    header('content-type: text/plain; charset=UTF-8');
    if(@readfile($file) === false) U::error('failed to read file', 500);

  // check Files Gallery updates JSON file from jsdelivr.com repository
  } else if($action === 'check_updates'){
    $json = @json_decode(@file_get_contents('https://data.jsdelivr.com/v1/package/npm/files.photo.gallery'), true);
    $latest = !empty($json) && isset($json['versions'][0]) && version_compare($json['versions'][0], Config::$version) > 0 ? $json['versions'][0] : false;
    Json::jexit([
      'success' => $latest,
      'writeable' => $latest && is_writable(__FILE__) // only check if __FILE__ is writeable if $latest
    ]);

  // attempt to update Files Gallery index.php to latest version via remote repository jsdelivr.com
  } else if($action === 'do_update'){
    // various requirements, which would normally be satisfied if accessed from the interface
    $version = $request->param('version');
    if(!$version || !Config::get('allow_check_updates') || version_compare($version, Config::$version) <= 0 || !is_writable(__FILE__)) $request->error('Error');
    $get = @file_get_contents('https://cdn.jsdelivr.net/npm/files.photo.gallery@' . $version . '/index.php');
    if(empty($get) || strpos($get, '<?php') !== 0 || !@file_put_contents(__FILE__, $get)) Json::error('failed to update');
    Json::jexit(['success' => true]);

  // save input license key to user config
  } else if($action === 'save_license'){
    $key = $request->param('key');
    Json::jexit([
      'success' => $key && Config::$storageconfigpath && Config::save(['license_key' => $key]),
      'md5' => $key ? md5($key) : false
    ]);

  // delete items
  } else if($action === 'delete') {
    Filemanager::json(Filemanager::items('delete', $paths), 'failed to delete items');

  // text_edit write to file
  } else if($action === 'text_edit'){
    if(!isset($request->params['text']) || !is_string($request->params['text'])) $request->error('Invalid text parameter');
    if(!is_writeable($first_path)) $request->error('File is not writeable');
    if(!is_file($first_path)) $request->error('Not a file');
    if(@file_put_contents($first_path, $request->params['text']) === false) $request->error('failed to write to file', 500);
    @touch(dirname($first_path)); // invalidate cache by updating parent dir mtime
    Filemanager::json(true, 'failed to write to file');

  // unzip zip file
  } else if($action === 'unzip'){

    // extract single zip file to $dir / if !$dir, it uses zip file parent
    Filemanager::json((new Zipper(true))->extract($first_path, $dir), 'Failed to extract zip file');

  // rename
  } else if($action === 'rename'){

    // new_path (derrved from $name) is required for rename action
    if(!$new_path) $request->error('Missing name parameter');

    // attempt to rename single file
    Filemanager::json(@rename($first_path, $new_path), 'Rename failed');

  // new_file
  } else if($action === 'new_file'){

    // attempt to create new file from $new_path or assign unique incremental filename "untitled-file.txt"
    Filemanager::json(@touch($new_path?:Filemanager::get_unique_filename($first_path . '/untitled-file.txt')), 'Create new file failed');

  // new_folder
  } else if($action === 'new_folder'){

    // attempt to create new directory from $new_path or assign unique incremental folder name from "untitled-folder"
    Filemanager::json(@mkdir($new_path?:Filemanager::get_unique_filename($first_path . '/untitled-folder')), 'Create new folder failed');

  // zip items / $new_path is optional, will create auto-named zip in current dir if empty
  } else if($action === 'zip') {
    Filemanager::json((new Zipper(true))->create($paths, $new_path), 'Failed to zip items');

  // copy or move use identical pre-process
  } else if(in_array($action, ['copy', 'move'])) {

    // don't allow copy/move items over themselves copy/move dirs into themselves (may cause infinite recursion)
    // this is already blocked in copy function, but better detect up front for items array and respond appropriately
    $valid_copy_move_paths = array_filter($paths, function($path) use ($dir){
      return !Path::is_within_path($dir . '/' . U::basename($path), $path);
    });

    // can't copy/move into self error
    if(empty($valid_copy_move_paths)) $request->error("can't $action into self");

    // response
    Filemanager::json(Filemanager::items($action, $valid_copy_move_paths, $dir), $action . ' failed');

  // duplicate / really just a shortcut for copy into same dir
  } else if($action === 'duplicate') {

    // duplicates a single item with provided $name (pre-assigned to $new_path)
    if($new_path) Filemanager::json(Filemanager::copy($first_path, $new_path), 'duplicate failed');

    // duplicates an array of files and dirs, automatically incrementing file names
    Filemanager::json(Filemanager::items('duplicate', $paths), 'duplicate failed');

  // get_downloadables returns an array of downloadable files recursively from an array of directories
  } else if($action === 'get_downloadables'){

    // return an array of downloadable files from within an array of $paths
    Json::jexit(Filemanager::get_downloadables($paths));

  // upload
  } else if($action === 'upload'){

    // get $_FILES['file'] array
    $upload = isset($_FILES) && isset($_FILES['file']) && is_array($_FILES['file']) ? $_FILES['file'] : false;

    // invalid $_FILES['file']
    if(empty($upload) || !isset($upload['error']) || is_array($upload['error'])) $request->error('Invalid $_FILES[]');

    // PHP meaningful file upload errors / https://www.php.net/manual/en/features.file-upload.errors.php
    if($upload['error'] !== 0) {
      $upload_errors = [
        1 => 'Uploaded file exceeds upload_max_filesize directive in php.ini',
        2 => 'Uploaded file exceeds MAX_FILE_SIZE directive specified in the HTML form',
        3 => 'The uploaded file was only partially uploaded',
        4 => 'No file was uploaded',
        6 => 'Missing a temporary folder',
        7 => 'Failed to write file to disk.',
        8 => 'A PHP extension stopped the file upload.'
      ];
      $request->error(isset($upload_errors[$upload['error']]) ? $upload_errors[$upload['error']] : 'unknown error');
    }

    // invalid $upload['size']
    if(!isset($upload['size']) || empty($upload['size'])) $request->error('Invalid file size');

    // $upload['size'] must not exceed $config['upload_max_filesize']
    if(Config::get('upload_max_filesize') && $upload['size'] > Config::get('upload_max_filesize')) $request->error('File size [' . $upload['size'] . '] exceeds upload_max_filesize option [' . Config::get('upload_max_filesize') . ']');

    // get filename
    $filename = $upload['name'];

    // for security reasons, slashes are never allowed in file names
    if(strpos($filename, '/') !== false || strpos($filename, '\\') !== false) $request->error('Illegal \slash/ in filename ' . $filename);

    // get allowed_file_types / 'image/*, .pdf, .mp4'
    $allowed_file_types = Config::get_array('upload_allowed_file_types');

    // check allowed_file_types
    if(!empty($allowed_file_types)){
      $mime = U::mime($upload['tmp_name']) ?: $upload['type']; // mime from PHP or upload[type]
      $ext = U::extension($filename, true, true); // get extension lowercase starting with .dot
      $is_valid = false; // default !is_valid until validated
      // check if extension match || wildcard match mime type image/*
      foreach ($allowed_file_types as $allowed_file_type) if($ext === ('.' . ltrim($allowed_file_type, '.')) || fnmatch($allowed_file_type, $mime)) {
        $is_valid = true;
        break;
      }

      // invalid file type
      if(!$is_valid) $request->error("Invalid file type $filename");

      // for additional security, check if uploaded image is an actual image with exif_imagetype() function
      if(function_exists('exif_imagetype') && in_array($ext, ['.gif', '.jpeg', '.jpg', '.png', '.swf', '.psd', '.bmp', '.tif', '.tiff', '.webp', '.avif']) && !@exif_imagetype($upload['tmp_name'])) $request->error("Invalid image type $filename");
    }

    // create subdirs when relativePath exists (keeps folder structure from drag and drop)
    $relative_path = $request->param('relativePath');
    if(!empty($relative_path) && $relative_path != 'null' && $relative_path != $filename && strpos($relative_path, '/') !== false){
      $new_dir = dirname("$dir/$relative_path");
      if(file_exists($new_dir) || @mkdir($new_dir, 0777, true)) $dir = $new_dir;
    }

    // assign move to path
    $move_path = "$dir/$filename";

    // fail if config upload_exists === false
    if(Config::get('upload_exists') === 'fail' && file_exists($move_path)) $request->error("$filename already exists");

    // increment file name if file name already exists
    if(Config::get('upload_exists') === 'increment') $move_path = Filemanager::get_unique_filename($move_path);

    // all is well! attempt to move_uploaded_file() / JSON RESPONSE
    Filemanager::json([
      'success' => @move_uploaded_file($upload['tmp_name'], $move_path),
      'filename' => $filename, // return filename in case it was incremented or renamed
      'url' => Path::rooturlpath(Path::relpath($move_path)), // for usage with showLinkToFileUploadResult
    ], 'failed to move_uploaded_file()');

  // $_GET download_dir_zip / download files in directory as zip file
  } else if($action === 'download_dir_zip'){

    // check download_dir enabled
    if(Config::get('download_dir') !== 'zip') $request->error('download_dir zip disabled');

    // create zip cache directly in dir (recommended, so that dir can be renamed while zip cache remains)
    if(!Config::$storagepath || Config::get('download_dir_cache') === 'dir') {
      if(!is_writable($dir)) $request->error('Dir is not writeable', 500);
      $zip_file_name = '_files.zip';
      $zip_file = $dir . '/' . $zip_file_name;

    // create zip file in storage _files/zip/$dirname.$md5.zip /
    } else {
      U::mkdir(Config::$storagepath . '/zip');
      $zip_file_name = U::basename($dir) . '.' . U::hash($dir) . '.zip';
      $zip_file = Config::$storagepath . '/zip/' . $zip_file_name;
    }

    // cached / download_dir_cache && file_exists() && zip is not older than dir time
    $cached = Config::get('download_dir_cache') && file_exists($zip_file) && filemtime($zip_file) >= filemtime($dir);

    // create zip if !cached
    if(!$cached && !(new Zipper())->create([$dir], $zip_file)) $request->error('Failed to create ZIP file', 500);

    // ignore user abort so we can delete file also on download cancel
    if(!Config::get('download_dir_cache')) @ignore_user_abort(true);

    // output zip file as download using correct headers and readfile()
    U::download($zip_file, $zip_file_name . ($cached ? ' cached' : ' created'), 'application/zip', U::basename($dir) . '.zip');

    // delete temporary zip file if cache disabled
    if(!Config::get('download_dir_cache')) @unlink($zip_file);

  // $_GET folder preview from images/video inside dir
  } else if($action === 'preview'){

    // allow folder preview image only if folder_preview_image, load_images, image_resize_enabled and cache
    foreach (['folder_preview_image', 'load_images', 'image_resize_enabled', 'image_resize_cache'] as $key) if(!Config::get($key)) $request->error("Config option $key disabled", 403);

    // 1. first check if default folder_preview_default '_filespreview.jpg' exists in dir / must be resized
    $default = Config::get('folder_preview_default') ? $dir . '/' . Config::get('folder_preview_default') : false;
    if($default && file_exists($default)) {
      U::message(Config::get('folder_preview_default'));
      new ResizeImage($default, Config::get('image_resize_dimensions')); // default resize for small preview images
    }

    // 2. assign cache path
    $cachepath = Path::imagecachepath($dir, Config::get('image_resize_dimensions'), 0, 0);

    // check if preview cache file exists
    if(file_exists($cachepath)) {

      // make sure cache file is newer than filemtime($dir), else cached image may have expired
      if(filemtime($cachepath) >= filemtime($dir)) U::readfile($cachepath, 'image/jpeg', 'Preview image from cache', true);

      // silently delete expired cache file if it is older filemtime($dir)
      @unlink($cachepath);

    // prepare various cache tasks if cache file doesn't exist
    } else {

      // when using 'image_resize_cache_use_dir' we must make sure $dir/_files dir exists
      U::ensure_files_dir($dir);

      // add new cache entry in _files/cache/images/cache.txt file as there definitely be a new entry from the below
      U::image_cache_file_append($cachepath, $dir);
    }

    // 3. glob files to look for images and video
    $files = U::glob("$dir/*");

    // files found
    if(!empty($files)) {

      // prepare arrays of supported image and video formats
      $image_types = U::resize_image_types();
      $video_types = U::app_path('ffmpeg') ? ['mp4', 'm4v', 'm4p', 'webm', 'ogv', 'mkv', 'avi', 'mov', 'wmv'] : [];

      // loop files to locate first match
      foreach ($files as $file) {

        // get file extension lowercase
        $ext = U::extension($file, true);

        // skip if !extension
        if(empty($ext)) continue;

        // found image resize type
        if(in_array($ext, $image_types)) {
          $type = 'resize';

        // found video_thumb type
        } else if(in_array($ext, $video_types)){
          $type = 'video_thumb';

        // found pdf_thumb type
        } else if($ext === 'pdf' && U::imagemagick()){
          $type = 'pdf_thumb';

        // skip if nothing found
        } else {
          continue;
        }

        // skip if file is_exclude or !readable
        if(Path::is_exclude($file, false) || !is_readable($file)) continue;

        // return preview image $type with default image_resize_dimensions and clone into preview $cachepath for fast access
        new FileResponse($file, $type, Config::get('image_resize_dimensions'), $cachepath);

        // break loop and return file
        break; exit;
      }
    }

    // 4. nothing found (no images in dir)
    // create empty 1px in $cachepath, and output (so next check knows dir is empty or has no images, unless updated)
    if(imagejpeg(imagecreate(1, 1), $cachepath)) U::readfile($cachepath, 'image/jpeg', '1px placeholder image created and cached', true);

  // $_GET file / resize parameter for preview images, else will proxy any file
  } else if($action === 'file'){
    new FileResponse($file);

  // $_GET force download single file by PHP
  } else if($action === 'download'){

    // output file as download using correct headers and readfile()
    U::download($file, 'Download ' . U::basename($file), U::mime($file) ?: 'application/octet-stream', U::basename($file));

  // $_GET tasks plugin (for pre-caching or clearing cache, not official plugin yet ...)
  } else if($action === 'tasks'){
    if(!U::uinclude('plugins/files.tasks.php')) $request->error('Can\'t find tasks plugin', 404);

  // login from within Files Gallery with fetch() return json success
  } else if($action === 'login'){
    Json::jexit(['success' => true]);

  // Login ping / checks if user is still logged in, shows login form or logs out
  } else if($action === 'ping'){

    // [experimental] un-comment the below to extend session cookie lifetime on each ping, if you are being logged out prematurely
    // setcookie(session_name(), session_id(), time() + 3600); // 3600 seconds / 1 hour (becomes arbitrary)

    // send username and session_token for app to check if we are still logged in to the same user and session
    Json::jexit([
      'username' => Config::get('username'), // username will return empty if was logged out to public non-login version
      'session_token' => isset($_SESSION['token']) ? $_SESSION['token'] : false,
    ]);

  // settings / load settings and users / save, edit, create new users
  } else if($action === 'settings'){

    // storage path `_files` must exist at this point if we are going to load, edit, create or delete any config
    if(!Config::$storagepath) return Json::error('Storage path does not exist');

    // LOAD users
    if($request->param('load')) {

      // start users array with default config first
      $users = ['default' => @file_get_contents(Config::$storageconfigpath) ?: ''];

      // get users dir
      $users_dir = Login::users_dir();

      // loop user dirs and get configs
      if($users_dir) foreach (glob("$users_dir/*", GLOB_ONLYDIR) as $dir) {

        // get user data from config.php if file exists (it should normally always exist)
        $user_data = file_exists("$dir/config.php") ? @file_get_contents("$dir/config.php") : false;

        // populate $users array only if config data exists and is non-empty (valid)
        if($user_data) {
          $users[U::basename($dir)] = $user_data;

        // delete invalid user dirs
        } else Filemanager::delete($dir);
      }

      // return user array with configs
      return Json::jexit($users);
    }

    // block all settings write actions in demo mode
    if(Config::get('demo_mode')) $request->error("Action not allowed in demo mode");

    // create local $short vars from request parameters
    foreach (['username', 'new_name', 'is_new', 'is_rename', 'is_default', 'data', 'remove'] as $k) $$k = $request->param($k);

    // if is default _files/config/config.php, save and return with doing further checks
    if($is_default) return Json::jexit(['success' => true, 'data' => U::save_config_file(Config::$storagepath . '/config', $data)]);

    // $username must be set and not equal default
    if(!$username || strtolower($username) === 'default') return Json::error('Invalid username' . ($username ? " '$username'" : ''));

    // config path vars
    $users_dir = Config::$storagepath . '/users';
    $user_dir =  "$users_dir/$username";

    // REMOVE / Remove user dir and return
    if($remove) return Json::jexit(['success' => !!Filemanager::delete($user_dir)]);

    // prepare $user_dir_new for new users and renamed users
    $user_dir_new = $new_name ? "$users_dir/$new_name" : false;

    // new user or renamed user
    if($new_name){

      // check if name is allowed (we don't need to check existing usernames)
      if(!Filemanager::name_is_allowed($new_name)) return Json::error('Invalid username');

      // if user dir already exists (for some reason)
      if(file_exists($user_dir_new)) {

        // if user config.php file exists, then user is already valid and can't overwrite valid users
        if(file_exists("$user_dir_new/config.php")) return Json::error('Username already exists');

        // delete invalid user dir, because it will get recreated or renamed (shouldn't really exist in the first place)
        Filemanager::delete($user_dir_new);
      }
    }

    // create user dir if is new user (renamed user we rename dir)
    if($is_new && !@mkdir($user_dir_new, 0777, true)) return Json::error('Failed to create user dir');

    // make sure dir already exists for existing users
    if(!$is_new && !is_dir($user_dir)) return Json::error('Username does not exist');

    // validate and save config.php file
    $data = U::save_config_file($user_dir, $data, true);

    // rename user dir
    if($is_rename && !@rename($user_dir, $user_dir_new)) return Json::error('Failed to rename user');

    // success return new
    Json::jexit(['success' => true, 'data' => $data]);

  // output PHP and server features by url ?action=tests / for diagnostics only
  } else if($action === 'tests'){
    new Tests();

  // cleans invalid and expired cache files from the _files/cache/* dirs at specific intervals `clean_cache_interval` or manually
  } else if($action === 'clean_cache'){
    new CleanCache();

  // invalid action 400
  } else {
    $request->error("Invalid action $action");
  }

// output main Files Gallery document html if !action
} else {
  new Document();
}

// THE END!
