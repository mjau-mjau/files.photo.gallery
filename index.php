<?php

/* Files app 0.7.0
www.files.gallery | www.files.gallery/docs/ | www.files.gallery/docs/license/
---
This PHP file is only 10% of the application, used only to connect with the file system. 90% of the codebase, including app logic, interface, design and layout is managed by the app Javascript and CSS files. */

// so that basename() and other functions work correctly on multi-byte strings.
setlocale(LC_ALL,'en_US.UTF-8');

// config
class config {

  // CONFIG / [READ MORE] https://www.files.gallery/docs/config/
  // Only edit directly if it is a temporary installation. Settings added here will be lost when updating!
  // Instead, add options from external config file in your storage_path [_files/config/config.php]
  public static $default = array(

    // paths
    'root' => '',
    'start_path' => false,

    // login
    'username' => '',
    'password' => '',

    // images
    'load_images' => true,
    'load_files_proxy_php' => false,
    'load_images_max_filesize' => 1000000,
    'image_resize_enabled' => true,
    'image_resize_cache' => true,
    'image_resize_dimensions' => 320,
    'image_resize_dimensions_retina' => 480,
    'image_resize_dimensions_allowed' => '',
    'image_resize_types' => 'jpeg, png, gif, webp, bmp',
    'image_resize_quality' => 85,
    'image_resize_function' => 'imagecopyresampled',
    'image_resize_sharpen' => true,
    'image_resize_memory_limit' => 128,
    'image_resize_max_pixels' => 30000000,
    'image_resize_min_ratio' => 1.5,
    'image_resize_cache_direct' => false,
    'folder_preview_image' => true,
    'folder_preview_default' => '_filespreview.jpg',

    // menu
    'menu_enabled' => true,
    'menu_show' => true,
    'menu_max_depth' => 5,
    'menu_sort' => 'name_asc',
    'menu_cache_validate' => true,
    'menu_load_all' => false,
    'menu_recursive_symlinks' => true,

    // files layout
    'layout' => 'rows',
    'sort' => 'name_asc',
    'sort_dirs_first' => true,
    'sort_function' => 'locale',

    // cache
    'cache' => true,
    'cache_key' => 0,
    'storage_path' => '_files',

    // exclude files directories regex
    'files_exclude' => '',
    'dirs_exclude' => '',
    'allow_symlinks' => true,

    // various
    'title' => '%name% [%count%]',
    'history' => true,
    'transitions' => true,
    'click' => 'popup',
    'click_window' => '',
    'click_window_popup' => true,
    'code_max_load' => 100000,
    'topbar_sticky' => 'scroll',
    'check_updates' => false,
    'allow_tasks' => false,
    'get_mime_type' => false,
    'context_menu' => true,
    'prevent_right_click' => false,
    'license_key' => '',
    'filter_live' => true,
    'filter_props' => 'name, filetype, mime, features, title',
    'download_dir' => 'browser',
    'download_dir_cache' => 'dir',
    'assets' => '',

    // filemanager options
    'allow_upload' => false,
    'allow_delete' => false,
    'allow_rename' => false,
    'allow_new_folder' => false,
    'allow_new_file' => false,
    'allow_duplicate' => false,
    'allow_text_edit' => false,
    'demo_mode' => false,

    // uploader options
    'upload_allowed_file_types' => '',
    'upload_max_filesize' => 0,
    'upload_exists' => 'increment',

    // popup options
    'popup_video' => true,

    // video
    'video_thumbs' => true,
    'video_ffmpeg_path' => 'ffmpeg',

    // language
    'lang_default' => 'en',
    'lang_auto' => true,
  );

  // config (will popuplate)
  public static $config = array();

  // app vars
  static $__dir__ = __DIR__;
  static $__file__ = __FILE__;
  static $version = '0.7.0';
  static $root;
  static $doc_root;
  static $has_login = false;
  static $storage_path;
  static $storage_is_within_doc_root = false;
  static $storage_config_realpath;
  static $storage_config;
  static $cache_path;
  static $image_resize_cache_direct;
  static $image_resize_dimensions_retina = false;
  static $dirs_hash = false;
  static $local_config_file = '_filesconfig.php';
  static $username = false;
  static $password = false;
  static $x3_path = false;
  static $assets;

  // get config
  private function get_config($path) {
    if(empty($path) || !file_exists($path)) return array();
    $config = include $path;
    return empty($config) || !is_array($config) ? array() : array_map(function($v){
      return is_string($v) ? trim($v) : $v;
    }, $config);
  }

  // files check system and config [diagnostics]
  private function files_check($local_config, $storage_path, $storage_config, $user_config, $user_valid){

    // display all errors to catch anything unusual
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    // BASIC DIAGNOSTICS
    echo '<!doctype html><html><head><title>Files App check system and config.</title><meta name="robots" content="noindex,nofollow"><style>body{font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif; color: #444;line-height:1.6;margin:0 auto;max-width:700px}.container{background-color:#F3F3F3;padding:.5vw 2vw 2vw;border-radius:3px;margin:1vw;overflow:scroll}.test:before{display:inline-block;width:18px;text-align:center;margin-right:5px}.neutral:before{color:#BBB}.success:before{color:#78a642}.success:before,.neutral:before{content:"\2713"}.fail:before{content:"\2716";color:firebrick}</style></head><body><div class="container"><h2>Files App ' . config::$version . '</h2><div style="margin:-1rem 0 .5rem">' . (isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] . '<br>' : '') . 'PHP ' . phpversion() . '<br>' . (isset($_SERVER['SERVER_SOFTWARE']) ? $_SERVER['SERVER_SOFTWARE'] : '') . '<p><i>* The following tests are only to help diagnose feature-specific issues.</i></p></div>';
    // prop output helper
    function prop($name, $success = 'neutral', $val = false){
      return '<div class="test ' . (is_bool($success) ? ($success ? 'success' : 'fail') : $success) . '">'. $name . ($val ? ': <b>' . $val . '</b>' : '') . '</div>';
    }
    // filesystem exists/writeable
    function exists_writeable($path, $name){ // display additional permissions+owner info only if $path is !writeable
      echo file_exists($path) ? prop($name . ' is_writeable ' . (!is_writable($path) ? ' ' . substr(sprintf('%o', fileperms($path)), -4) . ' [owner ' . fileowner($path) . ']' : ''), is_writable($path)) : prop($name . ' "' . $path . '" does not exist', false);
    }
    exists_writeable(config::$config['root']?:'.', 'root');
    exists_writeable(config::$config['storage_path'], 'storage_path');
    if((file_exists(config::$config['root']) && !is_writable(config::$config['root'])) || (file_exists(config::$config['storage_path']) && !is_writable(config::$config['storage_path']))) exists_writeable(__FILE__, _basename(__FILE__));
    // extension_loaded
    if(function_exists('extension_loaded')) foreach (['gd', 'exif', 'mbstring'] as $name) echo prop($name, extension_loaded($name));
    // zip
    echo prop('ZipArchive', class_exists('ZipArchive'));
    // function_exsists
    foreach (['mime_content_type', 'finfo_file', 'iptcparse', 'exif_imagetype', 'session_start', 'ini_get', 'exec'] as $name) echo prop($name . '()', function_exists($name));
    // check ffmpeg if exec (else don't check, because could be enabled even if exec() is not)
    if(function_exists('exec')) echo prop('ffmpeg', !!get_ffmpeg_path());
    // ini_get
    if(function_exists('ini_get')) foreach (['memory_limit', 'file_uploads', 'upload_max_filesize', 'post_max_size', 'max_file_uploads'] as $name) echo prop($name, 'neutral', @ini_get($name));

    // CONFIG OUTPUT
    echo '</div><div class="container"><h3>Config</h3>';
    // invalid and duplicate arrays
    $user_invalid = array_diff_key($user_config, self::$default);
    $user_duplicate = array_intersect_assoc($user_valid, self::$default);

    // items
    $items = array(
      ['arr' => $local_config, 'comment' => "// LOCAL CONFIG\n// " . self::$local_config_file],
      ['arr' => $storage_config, 'comment' => "// STORAGE CONFIG\n// " . rtrim($storage_path ?: '', '\/') . '/config/config.php'],
      ['arr' => $user_invalid, 'comment' => "// INVALID PARAMS\n// The following custom parameters will be ignored as they are not valid:", 'var' => '$invalid', 'hide' => empty($user_invalid)],
      ['arr' => $user_duplicate, 'comment' => "// DUPLICATE DEFAULT PARAMS\n// The following custom parameters will have no effect as they are identical to defaults:", 'var' => '$duplicate', 'hide' => empty($user_duplicate)],
      ['arr' => $user_valid, 'comment' => "// USER CONFIG\n// User config parameters.", 'var' => '$user', 'hide' => (empty($local_config) || empty($storage_config)) && empty($user_invalid)],
      ['arr' => self::$config, 'comment' => "// CONFIG\n// User parameters merged with default parameters.", 'var' => '$config'],
      ['arr' => self::$default, 'comment' => "// DEFAULT CONFIG\n// Default config parameters.", 'var' => '$default'],
      //['arr' => array_diff_key(get_class_vars('config'), array_flip(['default', 'config'])), 'comment' => "// STATIC VARS\n// Static app vars.", 'var' => '$static']
    );

    // loop
    $output = '<?php' . PHP_EOL;
    foreach ($items as $arr => $props) {
      $is_empty = empty($props['arr']);
      if(isset($props['hide']) && $props['hide']) continue;
      foreach (['username', 'password', 'license_key', 'allow_tasks', '__dir__', '__file__'] as $prop) if(isset($props['arr'][$prop]) && !empty($props['arr'][$prop]) && is_string($props['arr'][$prop])) $props['arr'][$prop] = '***';
      $export = $is_empty ? 'array ()' : var_export($props['arr'], true);
      $comment = preg_replace('/\n/', " [" . count($props['arr']) . "]\n", $props['comment'], 1);
      $var = isset($props['var']) ? $props['var'] . ' = ' : 'return ';
      $output .= PHP_EOL . $comment . PHP_EOL . $var . $export . ';' . PHP_EOL;
    }
    highlight_string($output . PHP_EOL . ';?>');
    echo '</div></body></html>';
    exit;
  }

  // check if root points to a dir inside X3 content / invalidate X3 cache on filemanager action / X3 license
  private function x3_check() {
    if(empty(self::$config['root']) || !is_string(self::$config['root'])) return;
    $path_arr = explode('/content', self::$config['root']);
    if(count($path_arr) < 2 || !@file_exists($path_arr[0] . '/app/x3.inc.php')) return;
    self::$x3_path = real_path($path_arr[0]);
    if(!self::$has_login) get_include('plugins/files.x3-login.php'); // optional x3 login plugin
  }

  // save config
  public static function save_config($config = array()){
    $save_config = array_intersect_key(array_replace(self::$storage_config, $config), self::$default);
    $export = preg_replace("/  '/", "  //'", var_export(array_replace(self::$default, $save_config), true));
    foreach ($save_config as $key => $value) if($value !== self::$default[$key]) $export = str_replace("//'" . $key, "'" . $key, $export);
    return @file_put_contents(config::$storage_config_realpath, '<?php ' . PHP_EOL . PHP_EOL . '// CONFIG / https://www.files.gallery/docs/config/' . PHP_EOL . '// Uncomment the parameters you want to edit.' . PHP_EOL . 'return ' . $export . ';');
  }

  // construct
  function __construct($is_doc = false) {

    // normalize OS paths
    self::$__dir__ = real_path(__DIR__);
    self::$__file__ = real_path(__FILE__);

    // local config
    $local_config = self::get_config(self::$local_config_file);

    // storage config
    $storage_path = isset($local_config['storage_path']) ? $local_config['storage_path'] : self::$default['storage_path'];
    $storage_realpath = !empty($storage_path) ? real_path($storage_path) : false;
    if($is_doc && $storage_realpath === self::$__dir__) error('<strong>storage_path must be a unique dir.</strong>');
    self::$storage_config_realpath = $storage_realpath ? $storage_realpath . '/config/config.php' : false;
    self::$storage_config = self::get_config(self::$storage_config_realpath);

    // config
    $user_config = array_replace(self::$storage_config, $local_config);
    $user_valid = array_intersect_key($user_config, self::$default);
    self::$config = array_replace(self::$default, $user_valid);

    // root
    self::$root = real_path(self::$config['root']);

    // files check with ?check=true
    if(get('check')) self::files_check($local_config, $storage_path, self::$storage_config, $user_config, $user_valid);
    // if(get('phpinfo')) { phpinfo(); exit; } // check system phpinfo with ?phpinfo=true / disabled for security

    // root does not exist
    if($is_doc && !self::$root) error('root dir "' . self::$config['root'] . '" does not exist.');

    // doc root
    self::$doc_root = real_path($_SERVER['DOCUMENT_ROOT']);

    // login credentials
    self::$username = self::$config['username'];
    self::$password = self::$config['password'];

    // has_login
    self::$has_login = self::$username || self::$password ? true : false;

    // $image_cache
    $image_cache = self::$config['image_resize_enabled'] && self::$config['image_resize_cache'] && self::$config['load_images'] ? true : false;

    // cache enabled
    if($image_cache || self::$config['cache']){

      // create storage_path
      if(empty($storage_realpath)){
        $storage_path = is_string($storage_path) ? rtrim($storage_path, '\/') : false;
        if(empty($storage_path)) error('Invalid storage_path parameter.');
        mkdir_or_error($storage_path);
        $storage_realpath = real_path($storage_path);
        if(empty($storage_realpath)) error("storage_path <strong>$storage_path</strong> does not exist and can't be created.");
        self::$storage_config_realpath = $storage_realpath . '/config/config.php'; // update since it wasn't assigned
      }
      self::$storage_path = $storage_realpath;

      // storage path is within doc root
      if(is_within_docroot(self::$storage_path)) self::$storage_is_within_doc_root = true;

      // cache_path real path
      self::$cache_path = self::$storage_path . '/cache';

      // create storage dirs
      if($is_doc){
        $create_dirs = [$storage_realpath . '/config'];
        if($image_cache) $create_dirs[] = self::$cache_path . '/images';
        if(self::$config['cache']) array_push($create_dirs, self::$cache_path . '/folders', self::$cache_path . '/menu');
        foreach($create_dirs as $create_dir) mkdir_or_error($create_dir);
      }

      // create/update config file, with default parameters commented out.
      if($is_doc && self::$storage_config_realpath && (!file_exists(self::$storage_config_realpath) || filemtime(self::$storage_config_realpath) < filemtime(__FILE__))) self::save_config();

      // image resize cache direct
      if(self::$config['image_resize_cache_direct'] && !self::$has_login && self::$config['load_images'] && self::$config['image_resize_cache'] && self::$config['image_resize_enabled'] && self::$storage_is_within_doc_root) self::$image_resize_cache_direct = true;
    }

    // check if root points to a dir inside X3 content / allows invalidate X3 cache on filemanager actions, X3 resized images and X3 license
    self::x3_check();

    // image_resize_dimensions_retina
    if(self::$config['image_resize_dimensions_retina'] && self::$config['image_resize_dimensions_retina'] > self::$config['image_resize_dimensions']) self::$image_resize_dimensions_retina = self::$config['image_resize_dimensions_retina'];

    // dirs hash
    self::$dirs_hash = substr(md5(self::$doc_root . self::$__dir__ . self::$root . self::$version .  self::$config['cache_key'] . self::$image_resize_cache_direct . self::$config['files_exclude'] . self::$config['dirs_exclude']), 0, 6);

    // Assign assets url for plugins/JS/CSS/languages, defaults to CDN
    if($is_doc) self::$assets = empty(self::$config['assets']) ? 'https://cdn.jsdelivr.net/npm/' : rtrim(self::$config['assets'], '/') . '/';

    // login
    if(self::$has_login) check_login($is_doc);
  }
};

// login page
function login_page($is_login_attempt, $sidx, $is_logout, $client_hash){
?>
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no, shrink-to-fit=no">
    <meta name="robots" content="noindex,nofollow">
    <title>Login</title>
    <link href="<?php echo config::$assets ?>files.photo.gallery@<?php echo config::$version ?>/css/files.css" rel="stylesheet">
    <?php get_include('css/custom.css'); ?>
  </head>
  <body><div id="files-login-container"></div></body>
  <script>
    document.getElementById('files-login-container').innerHTML = '\
    <h1 class="header mb-5">Login</h1>\
    <?php if($is_login_attempt && $_POST['sidx'] !== $sidx) { ?><div class="alert alert-danger" role="alert"><strong>PHP session ID mismatch</strong><br>If the error persists, your PHP is incorrectly creating new session ID for each request.</div><?php } else if($is_login_attempt) { ?>\
    <div class="alert alert-danger" role="alert">Incorrect login!</div><?php } else if($is_logout) { ?>\
    <div class="alert alert-warning" role="alert">You are now logged out.</div><?php } ?>\
    <form>\
      <div class="mylogin">\
        <input type="text" name="username" placeholder="Username">\
        <input type="password" name="password" placeholder="Password">\
      </div>\
        <input type="text" name="fusername" class="form-control form-control-lg mb-3" placeholder="Username" required autofocus spellcheck="false" autocorrect="off" autocapitalize="off">\
        <input type="password" name="fpassword" class="form-control form-control-lg mb-3" placeholder="Password" required spellcheck="false">\
      <input type="hidden" name="client_hash" value="<?php echo $client_hash; ?>">\
      <input type="hidden" name="sidx" value="<?php echo $sidx; ?>">\
      <input type="submit" value="Login" class="btn btn-lg btn-files-light btn-login">\
    </form>';
    document.getElementsByTagName('form')[0].addEventListener('submit', function(){
      this.action = '<?php echo isset($_GET['logout']) ? strtok($_SERVER['REQUEST_URI'], '?') : $_SERVER['REQUEST_URI']; ?>';
      this.method = 'post';
    }, false);
  </script>
</html>
<?php exit; // end form and exit
}

// check login
function check_login($is_doc){
  if($is_doc && empty(config::$username)) error('Username cannot be empty.');
  if($is_doc && empty(config::$password)) error('Password cannot be empty.');
  if(session_status() === PHP_SESSION_NONE && !session_start() && $is_doc) error('Failed to initiate PHP session_start();', 500);

  // [security] client hash and login hash
  foreach(['HTTP_CLIENT_IP','HTTP_X_FORWARDED_FOR','HTTP_X_FORWARDED','HTTP_FORWARDED_FOR','HTTP_FORWARDED','REMOTE_ADDR'] as $key){
    $ip = isset($_SERVER[$key]) && !empty($_SERVER[$key]) ? explode(',', $_SERVER[$key])[0] : '';
    if($ip && filter_var($ip, FILTER_VALIDATE_IP)) break;
  }
  $client_hash = md5($ip . (isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '') . __FILE__ . (isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : ''));
  $login_hash = md5(config::$username . config::$password . $client_hash);

  // login status
  $is_logout = isset($_GET['logout']) && isset($_SESSION['login']);
  if($is_logout) unset($_SESSION['login']);
  $is_logged_in = !$is_logout && isset($_SESSION['login']) && $_SESSION['login'] === $login_hash;

  // not logged in
  if(!$is_logged_in){

    // login only on html pages
    if($is_doc){

      // vars
      $sidx = md5(session_id());
      $is_login_attempt = isset($_POST['fusername']) && isset($_POST['fpassword']) && isset($_POST['client_hash']) && isset($_POST['sidx']);
      $fpassword = $is_login_attempt ? trim($_POST['fpassword']) : false;

      // correct login set $_SESSION['login']
      if($is_login_attempt &&
        trim($_POST['fusername']) == config::$username &&
        (phpversion() >= 5.5 && !password_needs_rehash(config::$password, PASSWORD_DEFAULT) ? password_verify($fpassword, config::$password) : ($fpassword == config::$password || md5($fpassword) == config::$password)) &&
        $_POST['client_hash'] === $client_hash &&
        $_POST['sidx'] === $sidx
      ){
        $_SESSION['login'] = $login_hash;

      // display login page and exit
      } else {
        login_page($is_login_attempt, $sidx, $is_logout, $client_hash);
      }

    // not logged in (images or post API requests), don't show form.
    } else if(post('action')){
      json_error('login');

    } else {
      error('You are not logged in.', 401);
    }
  }
}

//
function mkdir_or_error($path){
  if(!file_exists($path) && !mkdir($path, 0777, true)) error('Failed to create ' . $path, 500);
}
function _basename($path){
  return basename($path); // because setlocale(LC_ALL,'en_US.UTF-8')
  // OPTIONAL: replace basename() which may fail on UTF-8 chars if locale != UTF8
  // $arr = explode('/', str_replace('\\', '/', $path));
  // return end($arr);
}
function real_path($path){
  $real_path = realpath($path);
  return $real_path ? str_replace('\\', '/', $real_path) : false;
}
function root_relative($dir){
  return ltrim(substr($dir, strlen(config::$root)), '\/');
}
function root_absolute($dir){
  return config::$root . ($dir ? '/' . $dir : '');
}
function is_within_path($path, $root){
  return strpos($path . '/', $root . '/') === 0;
}
function is_within_root($path){
  return is_within_path($path, config::$root);
}
function is_within_docroot($path){
  return is_within_path($path, config::$doc_root);
}
function get_folders_cache_path($name){
  return config::$cache_path . '/folders/' . $name . '.json';
}
function get_json_cache_url($name){
  $file = get_folders_cache_path($name);
  return file_exists($file) ? get_url_path($file) : false;
}
function get_dir_cache_path($dir, $mtime = false){
  if(!config::$config['cache'] || !$dir) return;
  return get_folders_cache_path(get_dir_cache_hash($dir, $mtime));
}
function get_dir_cache_hash($dir, $mtime = false){
  return config::$dirs_hash . '.' . substr(md5($dir), 0, 6) . '.' . ($mtime ?: filemtime($dir));
}
function header_memory_time(){
  return (isset($_SERVER['REQUEST_TIME_FLOAT']) ? round(microtime(true) - $_SERVER['REQUEST_TIME_FLOAT'], 3) . 's, ' : '') . round(memory_get_peak_usage() / 1048576, 1) . 'M';
}

// read file
// todo: add files-date header
function read_file($path, $mime = false, $msg = false, $props = false, $cache_headers = false, $clone = false){
  if(!$path || !file_exists($path)) return false;
  $cloned = $clone && @copy($path, $clone) ? true : false;
  //if($mime == 'image/svg') $mime .= '+xml';
  header('content-type: ' . ($mime ?: 'image/jpeg'));
	header('content-length: ' . filesize($path));
  header('content-disposition: filename="' . _basename($path) . '"');
  if($msg) header('files-msg: ' . $msg . ($cloned ? ' [cloned to ' . _basename($clone) . ']' : '') . ' [' . ($props ? $props . ', ' : '') . header_memory_time() . ']');
  if($cache_headers) set_cache_headers();
  if(!is_readable($path) || readfile($path) === false) error('Failed to read file ' . $path . '.', 400);
  exit;
}

// get mime
function get_mime($path){
  if(function_exists('mime_content_type')){
    return mime_content_type($path);
  } else {
    return function_exists('finfo_file') ? finfo_file(finfo_open(FILEINFO_MIME_TYPE), $path) : false;
  }
}

// set cache headers
function set_cache_headers(){
  $seconds = 31536000; // 1 year;
  header('expires: ' . gmdate('D, d M Y H:i:s', time() + $seconds) . ' GMT');
  header("cache-control: public, max-age=$seconds, s-maxage=$seconds, immutable");
  header('pragma: cache');
  // header("Last-Modified:" . gmdate('D, d M Y H:i:s', time() - $seconds) . ' GMT');
  // etag?
}

// get image cache path
function get_image_cache_path($path, $image_resize_dimensions, $filesize, $filemtime){
  return config::$cache_path . '/images/' . substr(md5($path), 0, 6) . '.' . $filesize . '.' . $filemtime . '.' . $image_resize_dimensions . '.jpg';
}

// is exclude
function is_exclude($path = false, $is_dir = true, $symlinked = false){

  // early exit
  if(!$path || $path === config::$root) return;

  // exclude all root-relative paths that start with /_files* (reserved for any files and folders to be ignored and hidden from Files app)
  if(strpos('/' . root_relative($path), '/_files') !== false) return true;

  // exclude files PHP application
  if($path === config::$__file__) return true;

  // symlinks not allowed
  if($symlinked && !config::$config['allow_symlinks']) return true;

  // exclude storage path
  if(config::$storage_path && is_within_path($path, config::$storage_path)) return true;

  // dirs_exclude: check root relative dir path
  if(config::$config['dirs_exclude']) {
    $dirname = $is_dir ? $path : dirname($path);
    if($dirname !== config::$root && preg_match(config::$config['dirs_exclude'], substr($dirname, strlen(config::$root)))) return true;
  }

  // files_exclude: check vs basename
  if(!$is_dir){
    $basename = _basename($path);
    if($basename === config::$local_config_file) return true;
    if(config::$config['files_exclude'] && preg_match(config::$config['files_exclude'], $basename)) return true;
  }
}

// valid root path
function valid_root_path($path, $is_dir = false){

  // invalid
  if($path === false) return;
  if(!$is_dir && empty($path)) return; // path cannot be empty if file
  if($path && substr($path, -1) == '/') return; // path should never be root absolute or end with /

  // absolute path may differ if path contains symlink
  $root_absolute = root_absolute($path);
  $real_path = real_path($root_absolute);

  // file does not exist
  if(!$real_path) return;

  // security checks if path contains symlink
  if($root_absolute !== $real_path) {
    if(strpos(($is_dir ? $path : dirname($path)), ':') !== false) return; // dir may not contain ':'
    if(strpos($path, '..') !== false) return; // path may not contain '..'
    if(is_exclude($root_absolute, $is_dir, true)) return;
  }

  // nope
  if(!is_readable($real_path)) return; // not readable
  if($is_dir && !is_dir($real_path)) return; // dir check
  if(!$is_dir && !is_file($real_path)) return; // file check
  if(is_exclude($real_path, $is_dir)) return; // exclude path

  // return root_absolute
  return $root_absolute;
}

// image create from
function image_create_from($path, $type){
  if(!$path || !$type) return;
  if($type === IMAGETYPE_JPEG){
    return imagecreatefromjpeg($path);
  } else if ($type === IMAGETYPE_PNG) {
    return imagecreatefrompng($path);
  } else if ($type === IMAGETYPE_GIF) {
    return imagecreatefromgif($path);
  } else if ($type === 18/*IMAGETYPE_WEBP*/) {
    if(version_compare(PHP_VERSION, '5.4.0') >= 0) return imagecreatefromwebp($path);
  } else if ($type === IMAGETYPE_BMP) {
    if(version_compare(PHP_VERSION, '7.2.0') >= 0) return imagecreatefrombmp($path);
  }
}

// get ffmpeg path / check required config items / check exec() / create "quoted" / check exec('ffmpeg -version')
function get_ffmpeg_path(){
  if(!empty(array_filter(['video_thumbs', 'load_images', 'image_resize_cache', 'video_ffmpeg_path'], function($key){
    return empty(config::$config[$key]);
  })) || !function_exists('exec')) return false;
  //$path = '"' . str_replace('"', '\"', config::$config['video_ffmpeg_path']) . '"'; // <- if path contains Chinese chars
  $path = escapeshellarg(config::$config['video_ffmpeg_path']);
  return @exec($path . ' -version') ? $path : false;
}

// get file (proxy or resize image)
function get_file($path, $resize = false){

  // validate
  if(!$path) error('Invalid file request.', 404);
  $path = real_path($path); // in case of symlink path
  $mime = get_mime($path); // may return false if server does not support mime_content_type() or finfo_file()

  // video thumbnail (FFmpeg)
  if($resize == 'video') {

    // requirements with diagnostics / only check $mime if $mime detected
    if($mime && strtok($mime, '/') !== 'video') error('<strong>' . _basename($path) . '</strong> (' . $mime . ') is not a video.', 415);

    // get cache path
    $cache = get_image_cache_path($path, 480, filesize($path), filemtime($path));

    // check for cached video thumbnail / $path, $mime, $msg, $props, $cache_headers
    if($cache) read_file($cache, null, 'Video thumb served from cache', null, true);

    // get FFmpeg path `video_ffmpeg_path` / checks `exec('ffmpeg -version')`
    $ffmpeg_path = get_ffmpeg_path();
    if(!$ffmpeg_path) error('<a href="http://ffmpeg.org/" target="_blank">FFmpeg</a> disabled. Check your <a href="' . _basename(__FILE__) . '?check=1" target="_blank">diagnostics</a>.', 400);

    // ffmpeg command
    $cmd = $ffmpeg_path . ' -ss 3 -t 1 -hide_banner -i "' . str_replace('"', '\"', $path) . '" -frames:v 1 -an -vf "thumbnail,scale=480:320:force_original_aspect_ratio=increase,crop=480:320" -r 1 -y -f mjpeg "' . $cache . '" 2>&1';

    // try to execute command
    exec($cmd, $output, $result_code);

    // fail if result_code is anything else than 0
    if($result_code) error("Error generating thumbnail for video (\$result_code $result_code)", 400);

    // fix for empty video previews that get created for extremely short videos (or other unknown errors)
    if(file_exists($cache) && !filesize($cache) && imagejpeg(imagecreate(1, 1), $cache)) read_file($cache, 'image/jpeg', '1px placeholder image created and cached', null, true);

    // output created video thumbnail
    read_file($cache, null, 'Video thumb created', null, true);

  // resize image
  } else if($resize){
    if($mime && strtok($mime, '/') !== 'image') error('<strong>' . _basename($path) . '</strong> (' . $mime . ') is not an image.', 415);
    foreach (['load_images', 'image_resize_enabled'] as $key) if(!config::$config[$key]) error('[' .$key . '] disabled.', 400);
    $resize_dimensions = intval($resize);
    if(!$resize_dimensions) error("Invalid resize parameter <strong>$resize</strong>.", 400);
    $allowed = config::$config['image_resize_dimensions_allowed'] ?: [];
    if(!in_array($resize_dimensions, array_merge([config::$config['image_resize_dimensions'], config::$config['image_resize_dimensions_retina']], array_map('intval', is_array($allowed) ? $allowed : explode(',', $allowed))))) error("Resize parameter <strong>$resize_dimensions</strong> is not allowed.", 400);
    resize_image($path, $resize_dimensions);

  // proxy file
  } else {

    // disable if !proxy and path is within document root (file should never be proxied)
    if(!config::$config['load_files_proxy_php'] && is_within_docroot($path)) error('File cannot be proxied.', 400);

    // read file / $mime or 'application/octet-stream'
    read_file($path, ($mime ?: 'application/octet-stream'), $msg = 'File ' . _basename($path) . ' proxied.', false, true);
  }
}

// sharpen resized image
function sharpen_image($image){
  $matrix = array(
    array(-1, -1, -1),
    array(-1, 20, -1),
    array(-1, -1, -1),
  );
  $divisor = array_sum(array_map('array_sum', $matrix));
  $offset = 0;
  imageconvolution($image, $matrix, $divisor, $offset);
}

// exif orientation
// https://github.com/gumlet/php-image-resize/blob/master/lib/ImageResize.php
function exif_orientation($orientation, &$image){
  if(empty($orientation) || !is_numeric($orientation) || $orientation < 3 || $orientation > 8) return;
  $image = imagerotate($image, array(6 => 270, 5 => 270, 3 => 180, 4 => 180, 8 => 90, 7 => 90)[$orientation], 0);
  if(in_array($orientation, array(5, 4, 7)) && function_exists('imageflip')) imageflip($image, IMG_FLIP_HORIZONTAL);
  return true;
}

// resize image
function resize_image($path, $resize_dimensions, $clone = false){

  // file size
  $file_size = filesize($path);

  // header props
  $header_props = 'w:' . $resize_dimensions . ', q:' . config::$config['image_resize_quality'] . ', ' . config::$config['image_resize_function'] . ', cache:' . (config::$config['image_resize_cache'] ? '1' : '0');

  // cache
  $cache = config::$config['image_resize_cache'] ? get_image_cache_path($path, $resize_dimensions, $file_size, filemtime($path)) : NULL;
  if($cache) read_file($cache, null, 'Resized image served from cache', $header_props, true, $clone);

  // imagesize
  $info = getimagesize($path);
  if(empty($info) || !is_array($info)) error('Invalid image / failed getimagesize().', 500);
  $resize_ratio = max($info[0], $info[1]) / $resize_dimensions;

  // image_resize_max_pixels early exit
  if(config::$config['image_resize_max_pixels'] && $info[0] * $info[1] > config::$config['image_resize_max_pixels']) error('Image resolution <strong>' . $info[0] . ' x ' . $info[1] . '</strong> (' . ($info[0] * $info[1]) . ' px) exceeds <strong>image_resize_max_pixels</strong> (' . config::$config['image_resize_max_pixels'] . ' px).', 400);

  // header props
  $header_props .= ', ' . $info['mime'] . ', ' . $info[0] . 'x' . $info[1] . ', ratio:' . round($resize_ratio, 2);

  // check if image type is in image_resize_types / jpeg, png, gif, webp, bmp
  $is_resize_type = in_array(image_type_to_extension($info[2], false), array_map(function($key){
    $type = trim(strtolower($key));
    return $type === 'jpg' ? 'jpeg' : $type;
  }, explode(',', config::$config['image_resize_types'])));

  // serve original if !$is_resize_type || resize ratio < image_resize_min_ratio (only if $file_size <= load_images_max_filesize)
  //if((!$is_resize_type || $resize_ratio < max(config::$config['image_resize_min_ratio'], 1)) && !read_file($path, $info['mime'], 'Original image served', $header_props, true, $clone)) error('File does not exist.', 404);
  if((!$is_resize_type || ($resize_ratio < max(config::$config['image_resize_min_ratio'], 1) && $file_size <= config::$config['load_images_max_filesize'])) && !read_file($path, $info['mime'], 'Original image served', $header_props, true, $clone)) error('File does not exist.', 404);

  // Calculate new image dimensions.
  $resize_width  = round($info[0] / $resize_ratio);
  $resize_height = round($info[1] / $resize_ratio);

  // memory
  $memory_limit = config::$config['image_resize_memory_limit'] && function_exists('ini_get') ? (int) @ini_get('memory_limit') : false;
  if($memory_limit && $memory_limit > -1){
    // $memory_required = ceil(($info[0] * $info[1] * 4 + $resize_width * $resize_height * 4) / 1048576);
    $memory_required = round(($info[0] * $info[1] * (isset($info['bits']) ? $info['bits'] / 8 : 1) * (isset($info['channels']) ? $info['channels'] : 3) * 1.33 + $resize_width * $resize_height * 4) / 1048576, 1);
    $new_memory_limit = function_exists('ini_set') ? max($memory_limit, config::$config['image_resize_memory_limit']) : $memory_limit;
    if($memory_required > $new_memory_limit) error('Resizing this image requires at least <strong>' . $memory_required . 'M</strong>. Your current PHP memory_limit is <strong>' . $new_memory_limit .'M</strong>.', 400);
    if($memory_limit < $new_memory_limit && @ini_set('memory_limit', $new_memory_limit . 'M')) $header_props .= ', ' . $memory_limit . 'M => ' . $new_memory_limit . 'M (min ' . $memory_required . 'M)';
  }

  // new dimensions headers
  $header_props .= ', ' . $resize_width . 'x' . $resize_height;

  // create new $image
  $image = image_create_from($path, $info[2]);
  if(!$image) error('Failed to create image resource.', 500);

  // Create final image with new dimensions.
  $new_image = imagecreatetruecolor($resize_width, $resize_height);
  if(!call_user_func(config::$config['image_resize_function'], $new_image, $image, 0, 0, 0, 0, $resize_width, $resize_height, $info[0], $info[1])) error('Failed to resize image.', 500);

  // destroy original $image resource
  imagedestroy($image);

  // exif orientation
  $exif = function_exists('exif_read_data') ? @exif_read_data($path) : false;
  if(!empty($exif) && is_array($exif) && isset($exif['Orientation']) && exif_orientation($exif['Orientation'], $new_image)) $header_props .= ', orientated from EXIF:' . $exif['Orientation'];

  // sharpen resized image
  if(config::$config['image_resize_sharpen']) sharpen_image($new_image);

  // save to cache
  if($cache){
    if(!imagejpeg($new_image, $cache, config::$config['image_resize_quality'])) error('<strong>imagejpeg()</strong> failed to create and cache resized image.', 500);

    // clone cache (used for folder previews)
    if($clone) @copy($cache, $clone);

  // cache disabled / direct output
  } else {
    set_cache_headers();
    header('content-type: image/jpeg');
    header('files-msg: Resized image served [' . $header_props . ', ' . header_memory_time() . ']');
    if(!imagejpeg($new_image, null, config::$config['image_resize_quality'])) error('<strong>imagejpeg()</strong> failed to create and output resized image.', 500);
  }

  // destroy image
  imagedestroy($new_image);

  // cache readfile
  if($cache && !read_file($cache, null, 'Resized image cached and served', $header_props, true, $clone)) error('Cache file does not exist.', 404);

  //
  exit;
}

function get_url_path($dir){
  if(!is_within_docroot($dir)) return false;

  // if in __dir__ path, __dir__ relative
  if(is_within_path($dir, config::$__dir__)) return $dir === config::$__dir__ ? '.' : substr($dir, strlen(config::$__dir__) + 1);

  // doc root, doc root relative
  return $dir === config::$doc_root ? '/' : substr($dir, strlen(config::$doc_root));
}

// get dir
function get_dir($path, $files = false, $json_url = false){

  // realpath
  $realpath = $path ? real_path($path) : false;
  if(!$realpath) return; // no real path for any reason
  $symlinked = $realpath !== $path; // path is symlinked at some point

  // exclude
  if(is_exclude($path, true, $symlinked)) return; // exclude
  if($symlinked && is_exclude($realpath, true, $symlinked)) return; // exclude check again symlink realpath

  // vars
  $filemtime = filemtime($realpath);
  $url_path = get_url_path($realpath) ?: ($symlinked ? get_url_path($path) : false);
  $is_readable = is_readable($realpath);

  // array
  $arr = array(
    'basename' => _basename($realpath) ?: _basename($path) ?: '',
    'fileperms' => substr(sprintf('%o', fileperms($realpath)), -4),
    'filetype' => 'dir',
    'is_readable' => $is_readable,
    'is_writeable' => is_writeable($realpath),
    'is_link' => $symlinked ? is_link($path) : false,
    'is_dir' => true,
    'mime' => 'directory',
    'mtime' => $filemtime,
    'path' => root_relative($path)
  );

  // url path
  if($url_path) $arr['url_path'] = $url_path;

  // get_files() || config::menu_load_all
  if($files && $is_readable) {

    // files array
    $arr['files'] = get_files_data($path, $url_path, $arr['dirsize'], $arr['files_count'], $arr['images_count'], $arr['preview']);
  }

	// json cache path
  if($json_url && config::$storage_is_within_doc_root && !config::$has_login && config::$config['cache']){
    $json_cache = get_json_cache_url(get_dir_cache_hash($realpath, $filemtime));
    if($json_cache) $arr['json_cache'] = $json_cache;
  }

  //
	return $arr;
}

// get menu sort
function get_menu_sort($dirs){
  if(strpos(config::$config['menu_sort'], 'date') === 0){
    usort($dirs, function($a, $b) {
      return filemtime($a) - filemtime($b);
    });
  } else {
    natcasesort($dirs);
  }
  return substr(config::$config['menu_sort'], -4) === 'desc' ? array_reverse($dirs) : $dirs;
}

// recursive directory scan
function get_dirs($path = false, &$arr = array(), $depth = 0) {

  // get this dir (ignore root, unless load all ... root already loaded into page)
  if($depth || config::$config['menu_load_all']) {
    $data = get_dir($path, config::$config['menu_load_all'], !config::$config['menu_load_all']);
    if(!$data) return $arr;

    //
    $arr[] = $data;

    // max depth
    if(config::$config['menu_max_depth'] && $depth >= config::$config['menu_max_depth']) return $arr;

    // don't recursive if symlink
    if($data['is_link'] && !config::$config['menu_recursive_symlinks']) return $arr;
  }

  // get dirs from files array if $data['files'] or glob subdirs
  $subdirs = isset($data['files']) ? array_filter(array_map(function($file){
    return $file['filetype'] === 'dir' ? root_absolute($file['path']) : false;
  }, $data['files'])) : glob($path . '/*', GLOB_NOSORT|GLOB_ONLYDIR);

  // sort and loop subdirs
  if(!empty($subdirs)) foreach(get_menu_sort($subdirs) as $subdir) get_dirs($subdir, $arr, $depth + 1);

  // return
  return $arr;
}

// encode to UTF-8 when required
function safe_iptc_tag($val){
  $val = @substr($val, 0, 1000);
  return @mb_detect_encoding($val, 'UTF-8', true) ? $val : @utf8_encode($val);
}

// get IPTC
function get_iptc($image_info){
	if(!$image_info || !isset($image_info['APP13']) || !function_exists('iptcparse')) return;
	$app13 = @iptcparse($image_info['APP13']);
	if(empty($app13)) return;
	$iptc = array();

  // loop title, headline, description, creator, credit, copyright, keywords, city, sub-location and province-state
  foreach (['title'=>'005', 'headline'=>'105', 'description'=>'120', 'creator'=>'080', 'credit'=>'110', 'copyright'=>'116', 'keywords'=>'025', 'city'=>'090', 'sub-location'=>'092', 'province-state'=>'095'] as $name => $code) {
    if(isset($app13['2#' . $code][0]) && !empty($app13['2#' . $code][0])) $iptc[$name] = $name === 'keywords' ? $app13['2#' . $code] : safe_iptc_tag($app13['2#' . $code][0]);
  }

  // return IPTC
	return $iptc;
}

// EXIF timestamps always relative to UTC/GMT / Prevent app failure if date strings are malformed
function exif_timestamp($str){
  try {
    return (new DateTime($str, new DateTimeZone('UTC')))->getTimestamp();
  } catch (Exception $e) {
    return false;
  }
}

// get exif
function get_exif($path){
  if(!function_exists('exif_read_data')) return;
	$exif_data = @exif_read_data($path, 'ANY_TAG', 0);
  if(empty($exif_data) || !is_array($exif_data)) return;
	$exif = array();
	foreach (array('DateTime', 'DateTimeOriginal', 'ExposureTime', 'FNumber', 'FocalLength', 'Make', 'Model', 'Orientation', 'ISOSpeedRatings', 'Software') as $name) {
    $val = isset($exif_data[$name]) ? $exif_data[$name] : false;
    if($val) $exif[$name] = strpos($name, 'DateTime') === 0 ? exif_timestamp($val) : (is_string($val) ? trim($val) : $val);
	}

	// computed ApertureFNumber (f_stop)
	if(isset($exif_data['COMPUTED']['ApertureFNumber'])) $exif['ApertureFNumber'] = $exif_data['COMPUTED']['ApertureFNumber'];

	// flash
	//if(isset($exif_data['Flash'])) $exif['Flash'] = ($exif_data['Flash'] & 1) != 0;

	// GPS
  $exif['gps'] = get_image_location($exif_data);

	// return
	return array_filter($exif);
}

// exif GPS / get_image_location
function get_image_location($exif) {
  $arr = array();
  foreach (array('GPSLatitude', 'GPSLongitude') as $key) {
    if(!isset($exif[$key]) || !isset($exif[$key.'Ref'])) return false;
    $coordinate = $exif[$key];
    if(is_string($coordinate)) $coordinate = array_map('trim', explode(',', $coordinate));
    for ($i = 0; $i < 3; $i++) {
      $part = explode('/', $coordinate[$i]);
      if (count($part) == 1) {
        $coordinate[$i] = $part[0];
      } else if (count($part) == 2) {
        if($part[1] == 0) return false; // can't be 0 / invalid GPS
        $coordinate[$i] = floatval($part[0])/floatval($part[1]);
      } else {
        $coordinate[$i] = 0;
      }
    }
    list($degrees, $minutes, $seconds) = $coordinate;
    $sign = ($exif[$key.'Ref'] == 'W' || $exif[$key.'Ref'] == 'S') ? -1 : 1;
    $arr[] = $sign * ($degrees + $minutes/60 + $seconds/3600);
  }
  return empty($arr) ? false : $arr;
}

//
function get_files_data($dir, $url_path = false, &$dirsize = 0, &$files_count = 0, &$images_count = 0, &$preview = false){

  // scandir
  $filenames = scandir($dir, SCANDIR_SORT_NONE);
  if(empty($filenames)) return array();
  $items = array();

  // look for folder_preview_default (might be excluded in loop)
  if(config::$config['folder_preview_default'] && in_array(config::$config['folder_preview_default'], $filenames)) $preview = config::$config['folder_preview_default'];

  // loop filenames
  foreach($filenames as $filename) {

    //
    if($filename === '.' || $filename === '..') continue;
    $path = $dir . '/' . $filename;

    // paths
    $realpath = real_path($path); // differs from $path only if is symlinked
    if(!$realpath) continue; // no real path for any reason, for example symlink dead
    $symlinked = $realpath !== $path; // path is symlinked at some point

    // filetype
    $filetype = filetype($realpath);
    $is_dir = $filetype === 'dir' ? true : false;

    // exclude
    if(is_exclude($path, $is_dir, $symlinked)) continue; // exclude
    if($symlinked && is_exclude($realpath, $is_dir, $symlinked)) continue; // exclude check again symlink realpath

    // vars
    if(!$is_dir) $files_count ++; // files count
    $is_link = $symlinked ? is_link($path) : false; // symlink
    $basename = $is_link ? (_basename($realpath) ?: $filename) : $filename;
    $filemtime = filemtime($realpath);
    $is_readable = is_readable($realpath);
    $filesize = $is_dir ? false : filesize($realpath);
    if($filesize) $dirsize += $filesize;

    // url_path / symlink
    $item_url_path = $symlinked ? get_url_path($realpath) : false; // url_path from realpath if symlinked
    if(!$item_url_path && $url_path) $item_url_path = $url_path . ($url_path === '/' ? '' : '/') . ($is_link ? _basename($path) : $basename);

    // root path // path relative to config::$root
    if(!$symlinked || is_within_root($realpath)){
      $root_path = root_relative($realpath);

    // path is symlinked and !is_within_root(), get path-relative
    } else {

      // root path to symlink
      $root_path = root_relative($path);

      // check for symlink loop
      if($is_link && $is_dir && $path && $root_path) {
        $basename_path = _basename($root_path);
        if($basename_path && preg_match('/(\/|^)' . $basename_path. '\//', $root_path)){
          $loop_path = '';
          $segments = explode('/', $root_path);
          array_pop($segments);
          foreach ($segments as $segment) {
            $loop_path .= ($loop_path ? '/' : '') . $segment;
            if($segment !== $basename_path) continue;
            $loop_abs_path = root_absolute($loop_path);
            if(!is_link($loop_abs_path) || $realpath !== real_path($loop_abs_path)) continue;
            $root_path = $loop_path;
            $item_url_path = get_url_path($loop_abs_path) ?: $item_url_path; // new symlink is within doc_root
            break;
          }
        }
      }
    }

    // add properties
    $item = array(
      'basename' => $basename,
      'fileperms' => substr(sprintf('%o', fileperms($realpath)), -4),
      'filetype' => $filetype,
      'filesize' => $filesize,
      'is_readable' => $is_readable,
      'is_writeable' => is_writeable($realpath),
      'is_link' => $is_link,
      'is_dir' => $is_dir,
      'mtime' => $filemtime,
      'path' => $root_path
    );

    // optional props
    $ext = !$is_dir ? substr(strrchr($realpath, '.'), 1) : false;
    if($ext) {
      $ext = strtolower($ext);
      $item['ext'] = $ext;
    }
    $mime = $is_dir ? 'directory' : ($is_readable && (!$ext || $ext === 'ts' || config::$config['get_mime_type']) ? get_mime($realpath) : false);
    if($mime) $item['mime'] = $mime;
    if($item_url_path) $item['url_path'] = $item_url_path;

    // image / check from mime, fallback to extension
    $is_image = $is_dir ? false : ($mime ? (strtok($mime, '/') === 'image' && !strpos($mime, 'svg')) : in_array($ext, array('gif','jpg','jpeg','jpc','jp2','jpx','jb2','png','swf','psd','bmp','tiff','tif','wbmp','xbm','ico','webp')));
    if($is_image){

      // imagesize
      $imagesize = $is_readable ? @getimagesize($realpath, $info) : false;

      // image count and icon
      $images_count ++;
      $item['icon'] = 'image';

      // is imagesize
      if(!empty($imagesize) && is_array($imagesize)){

        // set folder_preview
        if(!$preview && in_array($ext, array('gif','jpg','jpeg','png'))) $preview = $basename;

        // start image array
        $image = array();
        foreach (array(0 => 'width', 1 => 'height', 2 => 'type', 'bits' => 'bits', 'channels' => 'channels', 'mime' => 'mime') as $key => $name) if(isset($imagesize[$key])) $image[$name] = $imagesize[$key];

        // mime from image
        if(!$mime && isset($image['mime'])) $item['mime'] = $image['mime'];

        // IPTC
        $iptc = $info ? get_iptc($info) : false;
        if(!empty($iptc)) $image['iptc'] = $iptc;

        // EXIF
        $exif = get_exif($realpath);
        if(!empty($exif)) {
          $image['exif'] = $exif;
          if(isset($exif['DateTimeOriginal'])) $item['DateTimeOriginal'] = $exif['DateTimeOriginal'];
          // invert width/height if exif orientation
          if(isset($exif['Orientation']) && $exif['Orientation'] > 4 && $exif['Orientation'] < 9){
            $image['width'] = $imagesize[1];
            $image['height'] = $imagesize[0];
          }
        }

        // panorama equirectangular if w/h === 2 / find resized panoramas '_files_{size}_{filename.jpg}'
        if($item_url_path && $imagesize[0] && $imagesize[0] > 2048 && $imagesize[0]/$imagesize[1] === 2){
          $panorama_resized = [];
          // check for resizes if resize >= original
          foreach ([2048, 4096, 8192] as $resize) {
            if($resize >= $imagesize[0]) break;
            if(file_exists($dir . '/_files_' . $resize . '_' . $filename)) $panorama_resized[] = $resize;
          }
          if(!empty($panorama_resized)) $item['panorama_resized'] = array_reverse($panorama_resized);
        }

        // image resize cache direct
        if(config::$image_resize_cache_direct){
          $resize1 = get_image_cache_path($realpath, config::$config['image_resize_dimensions'], $filesize, $filemtime);
          if(file_exists($resize1)) $image['resize' . config::$config['image_resize_dimensions']] = get_url_path($resize1);
          $retina = config::$image_resize_dimensions_retina;
          if($retina){
            $resize2 = get_image_cache_path($realpath, $retina, $filesize, $filemtime);
            if(file_exists($resize2)) $image['resize' . $retina] = get_url_path($resize2);
          }
        }

        // add image to item
        $item['image'] = $image;

      // get real mime if getimagesize fails. Could be non-image disguised as image extension
      } else if($is_readable && !$mime){
        $mime = get_mime($realpath);
        if($mime) {
          $item['mime'] = $mime;
          if(strtok($mime, '/') !== 'image'){ // unset images_count and icon because is not image after all
            $images_count --;
            unset($item['icon']);
          }
        }
      }

    // read .URL shortcut files and present as links / https://fileinfo.com/extension/url
    } else if($is_readable && $ext === 'url'){
      $url_lines = @file($realpath);
      if(!empty($url_lines) && is_array($url_lines)) foreach ($url_lines as $str) if(preg_match('/^url\s*=\s*([\S\s]+)/i', trim($str), $url_matches) && !empty($url_matches) && isset($url_matches[1])){
        $item['url'] = $url_matches[1];
        break;
      }
    }

    // add to items with basename as key
    $items[$basename] = $item;
	}

  // Sort dirs on top and natural case sort / sorts in JS anyway, but improves performance if stored in json cache
  uasort($items, function($a, $b){
    if(!config::$config['sort_dirs_first'] || $a['is_dir'] === $b['is_dir']) return strnatcasecmp($a['basename'], $b['basename']);
    return $b['is_dir'] ? 1 : -1;
  });

	//
  //var_dump($items); exit;
	return $items;
}

// get files
function get_files($dir){

  // invalid $dir
  if(!$dir) json_error('Invalid directory');

  // cache
  $cache = get_dir_cache_path(real_path($dir));

  // read cache or get dir and cache
  if(!read_file($cache, 'application/json', 'files json served from cache')) {
    json_cache(get_dir($dir, true), 'files json created' . ($cache ? ' and cached' : ''), $cache);
  }
}

/* start here */
function post($param){
	return isset($_POST[$param]) && !empty($_POST[$param]) ? $_POST[$param] : false;
}
function get($param){
	return isset($_GET[$param]) && !empty($_GET[$param]) ? $_GET[$param] : false;
}
function json_cache($arr = array(), $msg = false, $cache = true){
  $json = empty($arr) ? '{}' : json_encode($arr, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PARTIAL_OUTPUT_ON_ERROR);
  if(empty($json)) json_error(json_last_error() ? json_last_error_msg() : 'json_encode() error');
	if($cache) @file_put_contents($cache, $json);
	if($msg) header('files-msg: ' . $msg . ' [' . header_memory_time() . ']');
  header('content-type: application/json');
	echo $json;
}
function json_error($error = 'Error'){
  json_exit(array('error' => $error));
}
function json_success($success = 'Success'){
  json_exit(array('success' => $success));
}
function json_toggle($success, $error){
  json_exit(array_filter(array('success' => $success, 'error' => empty($success) ? $error : 0)));
}
function json_exit($arr = array()){
  header('content-type: application/json');
  exit(json_encode($arr));
}
function error($msg, $code = false){
  // 400 Bad Request, 403 Forbidden, 401 Unauthorized, 404 Not Found, 500 Internal Server Error
  if($code) http_response_code($code);
  header('content-type: text/html');
  header('Expires: ' . gmdate('D, d M Y H:i:s') . ' GMT');
  header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0, s-maxage=0');
  header('Cache-Control: post-check=0, pre-check=0', false);
  header('Pragma: no-cache');
	exit('<h2>Error</h2>' . $msg);
}

// get valid menu cache
function get_valid_menu_cache($cache){
  if(!$cache || !file_exists($cache)) return;
  $json = @file_get_contents($cache);
  if(empty($json)) return;
  if(!config::$config['menu_cache_validate']) return $json;
  $arr = @json_decode($json, true);
  if(empty($arr)) return;
  foreach ($arr as $key => $val) {
    $path = $val['path'];
    if(strpos($path, '/') !== false && $val['mtime'] !== @filemtime(root_absolute($path))) return; // skip shallow 1st level dirs, and compare filemtime
  }
  return $json;
}

// get root dirs
function get_root_dirs(){
  $root_dirs = glob(config::$root . '/*', GLOB_ONLYDIR|GLOB_NOSORT);
  if(empty($root_dirs)) return array();
  return array_filter($root_dirs, function($dir){
    return !is_exclude($dir, true, is_link($dir));
  });
}

// get menu cache hash
function get_menu_cache_hash($root_dirs){
  $mtime_count = filemtime(config::$root);
  foreach ($root_dirs as $root_dir) $mtime_count += filemtime($root_dir);
  return substr(md5(config::$doc_root . config::$__dir__ . config::$root), 0, 6) . '.' . substr(md5(config::$version . config::$config['cache_key'] . config::$config['menu_max_depth'] . config::$config['menu_load_all'] . (config::$config['menu_load_all'] ? config::$config['files_exclude'] . config::$image_resize_cache_direct : '') . config::$has_login . config::$config['dirs_exclude'] . config::$config['menu_sort']), 0, 6) . '.' . $mtime_count;
}

// get dirs
function dirs(){

  // get menu_cache_hash
  if(config::$config['cache']){
    $menu_cache_hash = post('menu_cache_hash'); // get menu cache hash
    $menu_cache_arr = $menu_cache_hash ? explode('.', $menu_cache_hash) : false;
    if(!$menu_cache_arr ||
      count($menu_cache_arr) !== 3 ||
      strlen($menu_cache_arr[0]) !== 6 ||
      strlen($menu_cache_arr[1]) !== 6 ||
      !is_numeric($menu_cache_arr[2])
    ) json_error('Invalid menu cache hash'); // early exit
  }
  $cache = config::$config['cache'] ? config::$cache_path . '/menu/' . $menu_cache_hash . '.json' : false; // get cache path
  $json = $cache ? get_valid_menu_cache($cache) : false; // get valid json menu cache

  // $json is valid from menu cache file
  if($json){
    header('content-type: application/json');
    header('files-msg: valid menu cache hash [' . $menu_cache_hash . ']' . (!config::$config['menu_cache_validate'] ? '[deep validation disabled]' : '') . '[' . header_memory_time() . ']');
    echo (post('localstorage') ? '{"localstorage":"1"}' : $json);

  // reload dirs
  } else {
    json_cache(get_dirs(config::$root), 'dirs reloaded' . ($cache ? ' and cached.' : ' [cache disabled]'), $cache);
  }
}

// include file html, php, css, js
function get_include($file){
  if(!config::$storage_path) return;
  $path = config::$storage_path . '/' . $file;
  if(!file_exists($path)) return;
  $ext = pathinfo($path, PATHINFO_EXTENSION);
  if(in_array($ext, ['html', 'php'])) return include $path;
  if(!config::$storage_is_within_doc_root) return;
  $src = get_url_path($path) . '?' . filemtime($path);
  if($ext === 'js') echo '<script src="' . $src . '"></script>';
  if($ext === 'css') echo '<link href="' . $src . '" rel="stylesheet">';
}

// POST
if(post('action')){

	// post action
	$action = post('action');

  //
  new config();

  // filemanager actions [beta]
  if($action === 'fm') {

    // validate task
    $task = post('task');
    if(empty($task) || !isset(config::$config['allow_' . $task]) || !config::$config['allow_' . $task]) json_error('invalid task');
    // demo_mode
    if(config::$config['demo_mode']) json_error('Action not allowed in demo mode');

    // valid path / path must be inside assigned root
    $is_dir = post('is_dir');
    $post_path = post('path') ?: '';
    $path = valid_root_path($post_path, $is_dir);
    if(empty($path)) json_error('invalid path ' . $post_path);
    $path = real_path($path); // in case of symlink path

    // name_is_allowed / trim name, fail if empty or dodgy characters, mkfile, mkdir, rename, duplicate
    function name_is_allowed($name){
      $name = $name ? trim($name) : false; // trim
      // block empty / <>:"'/\|?*# chars / .. / endswith .
      if(empty($name) || preg_match('/[<>:"\'\/\\\|?*#]|\.\.|\.$/', $name)) json_error('invalid name ' . $name);
      return $name; // return valid trimmed name
    }

    // filemanager json_toggle
    function fm_json_toggle($success, $error){
      fm_json_exit($success, array_filter(array('success' => $success, 'error' => empty($success) ? $error : 0)));
    }
    // filemanager json_exit / includes feature to invalidate X3 cache if x3-plugin active
    function fm_json_exit($success, $arr){
      $x3 = config::$x3_path && $success ? config::$x3_path . '/app/x3.inc.php' : false;
      if($x3 && @file_exists($x3) && @is_writable($x3)) touch($x3);
      json_exit($arr);
    }

    // UPLOAD
    if($task === 'upload'){
      // upload path must be dir
      if(!$is_dir) json_error('invalid dir ' . $post_path);
      // upload path must be writeable
      if(!is_writable($path)) json_error('upload dir ' . $post_path . ' is not writeable');
      // get $_FILES['file']
      $file = isset($_FILES) && isset($_FILES['file']) && is_array($_FILES['file']) ? $_FILES['file'] : false;
      // invalid $_FILES['file']
      if(empty($file) || !isset($file['error']) || is_array($file['error'])) json_error('invalid $_FILES[]');
      // PHP meaningful file upload errors / https://www.php.net/manual/en/features.file-upload.errors.php
      if($file['error'] !== 0) {
        $upload_errors = array(
          1 => 'Uploaded file exceeds upload_max_filesize directive in php.ini',
          2 => 'Uploaded file exceeds MAX_FILE_SIZE directive specified in the HTML form',
          3 => 'The uploaded file was only partially uploaded',
          4 => 'No file was uploaded',
          6 => 'Missing a temporary folder',
          7 => 'Failed to write file to disk.',
          8 => 'A PHP extension stopped the file upload.'
        );
        json_error(isset($upload_errors[$file['error']]) ? $upload_errors[$file['error']] : 'unknown error');
      }
      // invalid $file['size']
      if(!isset($file['size']) || empty($file['size'])) json_error('invalid file size');
      // $file['size'] must not exceed $config['upload_max_filesize']
      if(config::$config['upload_max_filesize'] && $file['size'] > config::$config['upload_max_filesize']) json_error('File size [' . $file['size'] . '] exceeds upload_max_filesize option [' . config::$config['upload_max_filesize'] . ']');
      // filename
      $filename = $file['name'];
      // security: slashes are never ever allowed in filenames / always basenamed() but just in case
      if(strpos($filename, '/') !== false || strpos($filename, '\\') !== false) json_error('Illegal \slash/ in filename ' . $filename);
      // allow only valid file types from config::$config['upload_allowed_file_types'] / 'image/*, .pdf, .mp4'
      $allowed_file_types = !empty(config::$config['upload_allowed_file_types']) ? array_filter(array_map('trim', explode(',', config::$config['upload_allowed_file_types']))) : false;
      if(!empty($allowed_file_types)){
        $mime = get_mime($file['tmp_name']) ?: $file['type']; // mime from PHP or upload[type]
        $ext = strrchr(strtolower($filename), '.');
        $is_valid = false;
        // check if extension match || wildcard match mime type image/*
        foreach ($allowed_file_types as $allowed_file_type) if($ext === ('.'.ltrim($allowed_file_type, '.')) || fnmatch($allowed_file_type, $mime)) {
          $is_valid = true;
          break;
        }
        if(!$is_valid) json_error('invalid file type ' . $filename);
        // extra security: check if image is image
        if(function_exists('exif_imagetype') && in_array($ext, ['.gif', '.jpeg', '.jpg', '.png', '.swf', '.psd', '.bmp', '.tif', '.tiff', 'webp']) && !@exif_imagetype($file['tmp_name'])) json_error('invalid image type ' . $filename);
      }

      // file naming if !overwrite and file exists
      if(config::$config['upload_exists'] !== 'overwrite' && file_exists("$path/$filename")){

        // fail if !increment / 'upload_exists' => 'fail' || false || '' empty
        if(config::$config['upload_exists'] !== 'increment') json_error("$filename already exists");

        // increment filename / 'upload_exists' => 'increment'
        $name = pathinfo($filename, PATHINFO_FILENAME);
        $ext = pathinfo($filename, PATHINFO_EXTENSION);
        $inc = 1;
        while(file_exists($path . '/' . $name . '-' . $inc . '.' . $ext)) $inc ++;
        $filename = $name . '-' . $inc . '.' . $ext;
      }

      // all is well! attempt to move_uploaded_file()
      if(@move_uploaded_file($file['tmp_name'], "$path/$filename")) fm_json_exit(true, array(
        'success' => true,
        'filename' => $filename, // return filename in case it was incremented or renamed
        'url' => get_url_path("$path/$filename") // for usage with showLinkToFileUploadResult
      ));

      // error if failed to move uploaded file
      json_error('failed to move_uploaded_file()');

    // DELETE
    } else if($task === 'delete'){

      // dir recursive
      if($is_dir){

        // success/fail count
        $success = 0;
        $fail = 0;

        // recursive rmdir
        function rrmdir($dir, &$success, &$fail) {
          //global $success, $fail;
          if(!is_readable($dir)) return $fail ++;
          $files = array_diff(scandir($dir), array('.','..'));
          if(!empty($files)) foreach ($files as $file) {
            is_dir("$dir/$file") ? rrmdir("$dir/$file", $success, $fail) : (@unlink("$dir/$file") ? $success++ : $fail++);
          }
          @rmdir($dir) ? $success ++ : $fail ++;
        }

        // recursive rmdir start
        rrmdir($path, $success, $fail);

        // response with partial success/fail count or error if there is !$success
        fm_json_exit($success, array_filter(array('success' => $success, 'fail' => $fail, 'error' => (empty($success) ? 'Failed to delete dir' : 0))));

      // single file
      } else {
        fm_json_toggle(@unlink($path), 'PHP unlink() failed');
      }

    // new_folder || new_file
    } else if($task === 'new_folder' || $task === 'new_file'){
      if(!$is_dir) json_error('invalid dir ' . $post_path); // parent path must be dir
      if(!is_writable($path)) json_error($post_path . ' is not writeable.'); // dir must be writeable
      $name = name_is_allowed(post('name')); // trim and check valid
      $file_path = $path . '/' . $name;
      if(file_exists($file_path)) json_error($name . ' already exists');
      fm_json_toggle($task === 'new_folder' ? @mkdir($file_path) : @touch($file_path), $task . ' failed');

    // rename $path (file or dir)
    } else if($task === 'rename'){
      if(!is_writable($path)) json_error($post_path . ' is not writeable.'); // path must be writeable
      $name = name_is_allowed(post('name')); // trim and check valid
      $new_path = dirname($path) . '/' . $name;
      if(file_exists($new_path)) json_error("$name already exists."); // new name exists
      // security: prevent renaming 'file.html' to 'file.php' / file must already be *.php when renaming
      if(!$is_dir && stripos($path, '.php') === false && stripos($name, '.php') !== false) json_error('cannot rename files to .php');
      fm_json_toggle(@rename($path, $new_path), 'PHP rename() failed');

    // duplicate file
    } else if($task === 'duplicate'){
      if($is_dir) json_error('Can\'t duplicate dir');
      $parent_dir = dirname($path);
      if(!is_writable($parent_dir)) json_error(_basename($parent_dir) . ' is not writeable.'); // dir must be writeable
      $name = name_is_allowed(post('name')); // trim and check valid
      $copy_path = $parent_dir . '/' . $name;
      if(file_exists($copy_path)) json_error($name . ' already exists.');
      fm_json_toggle(@copy($path, $copy_path), 'PHP copy() failed');

    // text / code edit
    } else if($task === 'text_edit'){
      if($is_dir) json_error('Can\'t write text to directory');
      if(!is_writeable($path) || !is_file($path)) json_error('File is not writeable');
      $success = isset($_POST['text']) && @file_put_contents($path, $_POST['text']) !== false ? 1 : 0; // text could be '' (empty)
      if($success) @touch(dirname($path)); // invalidate any cache by updating parent dir mtime
      fm_json_toggle($success, 'PHP file_put_contents() failed');
    }

	// dirs
	} else if($action === 'dirs'){
    dirs(post('localstorage'));

	// files
	} else if($action === 'files'){
    if(!isset($_POST['dir'])) json_error('Missing dir parameter');
    get_files(valid_root_path($_POST['dir'], true));

	// file read
	} else if($action === 'file'){

    // valid path
    $file = valid_root_path(post('file'));
    if(!$file) error('Invalid file path');

    // read text file
    header('content-type:text/plain;charset=utf-8');
    if(@readfile(real_path($file)) === false) error('failed to read file ' . post('file'), 500);

  // check login
  } else if($action === 'check_login'){
    json_success(true);

  // check updates
  } else if($action === 'check_updates'){
    $json = @json_decode(@file_get_contents('https://data.jsdelivr.com/v1/package/npm/files.photo.gallery'), true);
    $latest = !empty($json) && isset($json['versions'][0]) && version_compare($json['versions'][0], config::$version) > 0 ? $json['versions'][0] : false;
    json_exit(array(
      'success' => $latest,
      'writeable' => $latest && is_writable(__FILE__) // only check writeable if $latest
    ));

  // do update
  } else if($action === 'do_update'){
    $version = post('version');
    if(!$version || version_compare($version, config::$version) <= 0 || !is_writable(__FILE__)) json_error(); // requirements
    $get = @file_get_contents('https://cdn.jsdelivr.net/npm/files.photo.gallery@' . $version . '/index.php');
    if(empty($get) || strpos($get, '<?php') !== 0) json_error(); // basic validation
    json_success(array('success' => @file_put_contents(__FILE__, $get)));

  // store license
  } else if($action === 'license'){
    $key = post('key') ? trim(post('key')) : false;
    json_exit(array(
      'success' => $key && config::$storage_config_realpath && config::save_config(array('license_key' => $key)),
      'md5' => $key ? md5($key) : false
    ));

  // invalid action
	} else {
    json_error('invalid action: ' . $action);
  }

// GET
} else /*if($_SERVER['REQUEST_METHOD'] === 'GET')*/{

  // download_dir_zip / download files in directory as zip file
  if(get('download_dir_zip')) {
    new config();

    // check download_dir enabled
    if(config::$config['download_dir'] !== 'zip') error('<strong>download_dir</strong> Zip disabled.', 403);

    // valid dir
    $dir = valid_root_path(get('download_dir_zip'), true);
    if(!$dir) error('Invalid download path <strong>' . get('download_dir_zip') . '</strong>', 404);
    $dir = real_path($dir); // in case of symlink path

    // create zip cache directly in dir (recommended, so that dir can be renamed while zip cache remains)
    if(!config::$storage_path || config::$config['download_dir_cache'] === 'dir') {
      if(!is_writable($dir)) error('Dir ' . _basename($dir) . ' is not writeable.', 500);
      $zip_file_name = '_files.zip';
      $zip_file = $dir . '/' . $zip_file_name;

    // create zip file in storage _files/zip/$dirname.$md5.zip /
    } else {
      mkdir_or_error(config::$storage_path . '/zip');
      $zip_file_name = _basename($dir) . '.' . substr(md5($dir), 0, 6) . '.zip';
      $zip_file = config::$storage_path . '/zip/' . $zip_file_name;
    }

    // cached / download_dir_cache && file_exists() && zip is not older than dir time
    $cached = !empty(config::$config['download_dir_cache']) && file_exists($zip_file) && filemtime($zip_file) >= filemtime($dir);

    // create zip if !cached
    if(!$cached){

      // use shell zip command instead / probably faster and more robust than PHP / if use, comment out PHP ZipArchive method starting below
      // exec('zip ' . $zip_file . ' ' . $dir . '/*.* -j -x _files*', $out, $res);

      // check that ZipArchive class exists
      if(!class_exists('ZipArchive')) error('Missing PHP ZipArchive class.', 500);

      // glob files / must be readable / is_file / !symlink / !is_exclude
      $files = array_filter(glob($dir. '/*', GLOB_NOSORT), function($file){
        return is_readable($file) && is_file($file) && !is_link($file) && !is_exclude($file, false);
      });

      // !no files available to zip
      if(empty($files)) error('No files to zip!', 400);

      // new ZipArchive
      $zip = new ZipArchive();

      // create new $zip_file
      if($zip->open($zip_file, ZipArchive::CREATE | ZIPARCHIVE::OVERWRITE) !== true) error('Failed to create ZIP file ' . $zip_file_name . '.', 500);

      // add files to zip / flatten with _basename()
      foreach($files as $file) $zip->addFile($file, _basename($file));

      // no files added (for some reason)
      if(!$zip->numFiles) error('Could not add any files to ' . $zip_file_name . '.', 500);

      // close zip
      $zip->close();

      // make sure created zip file exists / just in case
      if(!file_exists($zip_file)) error('Zip file ' . $zip_file_name . ' does not exist.', 500);
    }

    // redirect instead of readfile() / might be useful if readfile() fails and/or for caching and performance
    /*$zip_url = get_url_path($zip_file);
    if($zip_url){
      header('Location:' . $zip_url . '?' . filemtime($dir), true, 302);
      exit;
    }*/

    // output headers
    if(config::$has_login) {
      header('cache-control: must-revalidate, post-check=0, pre-check=0');
      header('cache-control: public');
      header('expires: 0');
      header('pragma: public');
    } else {
      set_cache_headers();
    }
    header('content-description: File Transfer');
    header('content-disposition: attachment; filename="' . addslashes(_basename($dir)) . '.zip"');
    $content_length = filesize($zip_file);
    header('content-length: ' . $content_length);
    header('content-transfer-encoding: binary');
    header('content-type: application/zip');
    header('files-msg: [' . $zip_file_name . '][' . ($cached ? 'cached' : 'created') . ']');

    // ignore user abort so we can delete file also on download cancel
    if(empty(config::$config['download_dir_cache'])) @ignore_user_abort(true);

    // clear output buffer for large files
    while (ob_get_level()) ob_end_clean();

    // output zip readfile()
    if(!readfile($zip_file)) error('Failed to readfile(' . $zip_file_name . ').', 500);

    // delete temp zip file if cache disable
    if(empty(config::$config['download_dir_cache'])) @unlink($zip_file);


  // folder preview image
  } else if(get('preview')){
    new config();

    // allow only if only if folder_preview_image + load_images + image_resize_enabled
    foreach (['folder_preview_image', 'load_images', 'image_resize_enabled'] as $key) if(!config::$config[$key]) error('[' .$key . '] disabled.', 400);

    // get real path and validate
    $path = valid_root_path(get('preview'), true); // make sure is valid dir
    if(!$path) error('Invalid directory.', 404);


    // 1. first check for default '_filespreview.jpg' inside dir
    $default = config::$config['folder_preview_default'] ? $path . '/' . config::$config['folder_preview_default'] : false;
    if($default && file_exists($default)) {
      header('files-preview: folder_preview_default found [' . config::$config['folder_preview_default'] . ']');
      resize_image($default, config::$config['image_resize_dimensions']);
    }


    // 2. check preview cache
    $cache = config::$cache_path . '/images/preview.' . substr(md5($path), 0, 6) . '.jpg';

    // cache file exists
    if(file_exists($cache)) {

      // make sure cache file is valid (must be newer than dir updated time)
      if(filemtime($cache) >= filemtime($path)) read_file($cache, null, 'preview image served from cache', null, true);

      // delete expired cache file if is older than dir updated time [silent]
      @unlink($cache);
    }


    // 3. glob images / GLOB_BRACE may fail on some non GNU systems, like Solaris.
    $images = @glob($path . '/*.{jpg,JPG,jpeg,JPEG,png,PNG,gif,GIF}', GLOB_NOSORT|GLOB_BRACE);

    // loop images to locate first match that is not excluded
    if(!empty($images)) foreach ($images as $image) {
      if(!is_exclude($image, false)) {
        header('files-preview: glob() found [' . _basename($image) . ']');
        resize_image($image, config::$config['image_resize_dimensions'], $cache); // + clone into $cache
        break; exit; // just in case
      }
    }


    // 4. nothing found (no images in dir)
    // create empty 1px in $cache, and output (so next check knows dir is empty or has no images, unless updated)
    if(imagejpeg(imagecreate(1, 1), $cache)) read_file($cache, 'image/jpeg', '1px placeholder image created and cached', null, true);


	// file/image
	} else if(isset($_GET['file'])){
    new config();
    get_file(valid_root_path(get('file')), get('resize'));

	// download
	} else if(isset($_GET['download'])){
    new config();

		// valid download
    $download = valid_root_path(get('download'));
    if(!$download) error('Invalid download path <strong>' . get('download') . '</strong>', 404);
    $download = real_path($download); // in case of symlink path

	  // required for some browsers
	  if(@ini_get('zlib.output_compression')) @ini_set('zlib.output_compression', 'Off');

	  // headers
	  header('Content-Description: File Transfer');
	  header('Content-Type: application/octet-stream');
	  header('Content-Disposition: attachment; filename="' . _basename($download) . '"');
	  header('Content-Transfer-Encoding: binary');
	  header('Expires: 0');
	  header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
	  header('Pragma: public');
	  header('Content-Length: ' . filesize($download));
	  while (ob_get_level()) ob_end_clean();
	  readfile($download);

  // tasks plugin
  } else if(get('task')){

    // attempt to load tasks plugin
    new config(true);
    get_include('plugins/files.tasks.php') || error('Can\'t find tasks plugin.', 404);
    exit;

// main document
	} else {

// new config, with tests
new config(true);

// validate exclude regex
if(config::$config['files_exclude'] && @preg_match(config::$config['files_exclude'], '') === false) error('Invalid files_exclude regex <strong>' . config::$config['files_exclude'] . '</strong>');
if(config::$config['dirs_exclude'] && @preg_match(config::$config['dirs_exclude'], '') === false) error('Invalid dirs_exclude regex <strong>' . config::$config['dirs_exclude'] . '</strong>');

// start path
$start_path = config::$config['start_path'];
if($start_path){
  $real_start_path = real_path($start_path);
  if(!$real_start_path) error('start_path ' . $start_path . ' does not exist.');
  if(!is_within_root($real_start_path)) error('start_path ' . $start_path . ' is not within root dir ' . config::$config['root']);
  $start_path = root_relative($real_start_path);
}

// always get root_dirs for breadcrumbs and menu_cache (if menu_enabled)
$root_dirs = get_root_dirs();

// menu_exists if menu_enabled && $root_dirs
$menu_exists = config::$config['menu_enabled'] && !empty($root_dirs) ? true : false;

// get menu cache hash
$menu_cache_hash = false;
$menu_cache_file = false;
if($menu_exists){
  $menu_cache_hash = get_menu_cache_hash($root_dirs);
  // menu cache file (if cache, !menu_cache_validate, exists and is within doc root)
  if(config::$storage_is_within_doc_root && config::$config['cache'] && !config::$config['menu_cache_validate']) {
    $menu_cache_path = config::$cache_path . '/menu/' . $menu_cache_hash . '.json';
    $menu_cache_file = file_exists($menu_cache_path) ? get_url_path($menu_cache_path) : false;
    if($menu_cache_file) $menu_cache_file .= '?' . filemtime($menu_cache_path);
  }
}

// init path
$query = config::$config['history'] && isset($_SERVER['QUERY_STRING']) && !empty($_SERVER['QUERY_STRING']) ? explode('&', $_SERVER['QUERY_STRING']) : false;
$query_path = $query && strpos($query[0], '=') === false ? rtrim(rawurldecode($query[0]), '/') : false;
$query_path_valid = $query_path ? valid_root_path($query_path, true) : false;
$init_path = $query_path ?: $start_path ?: '';

// init dirs, with files if cache
function get_dir_init($dir){
  $cache = get_dir_cache_path(real_path($dir));
  if($cache && file_exists($cache)) return json_decode(file_get_contents($cache), true);
  return get_dir($dir);
}

// get dirs for root and start path
$dirs = array('' => get_dir_init(config::$root));
if($query_path){
  if($query_path_valid) $dirs[$query_path] = get_dir_init($query_path_valid);
} else if($start_path){
  $dirs[$start_path] = get_dir_init($real_start_path);
}

// resize image types
$resize_image_types = array('jpeg', 'jpg', 'png', 'gif');
if(version_compare(PHP_VERSION, '5.4.0') >= 0) {
  $resize_image_types[] = 'webp';
  if(version_compare(PHP_VERSION, '7.2.0') >= 0) $resize_image_types[] = 'bmp';
}

// image resize memory limit / for Javascript detection
$image_resize_memory_limit = config::$config['image_resize_enabled'] && config::$config['image_resize_memory_limit'] && function_exists('ini_get') ? (int) @ini_get('memory_limit') : 0;
if($image_resize_memory_limit && function_exists('ini_set')) $image_resize_memory_limit = max($image_resize_memory_limit, config::$config['image_resize_memory_limit']);

// wtc
$wtc = config::$config[base64_decode('bGljZW5zZV9rZXk')];

// look for custom language files _files/lang/*.json
function lang_custom() {
  $dir = config::$storage_path ? config::$storage_path . '/lang' : false;
  $files = $dir && file_exists($dir) ? glob($dir . '/*.json') : false;
  if(empty($files)) return false;
  $langs = array();
  foreach ($files as $path) {
    $json = @file_get_contents($path);
    $data = !empty($json) ? @json_decode($json, true) : false;
    if(!empty($data)) $langs[strtok(_basename($path), '.')] = $data;
  }
  return !empty($langs) ? $langs : false;
}

// exclude some user settings from frontend
$exclude = array_diff_key(config::$config, array_flip(array('root', 'start_path', 'image_resize_cache', 'image_resize_quality', 'image_resize_function', 'image_resize_cache_direct', 'menu_sort', 'menu_load_all', 'cache_key', 'storage_path', 'files_exclude', 'dirs_exclude', 'username', 'password', 'allow_tasks', 'allow_symlinks', 'menu_recursive_symlinks', 'image_resize_sharpen', 'get_mime_type', 'license_key', 'video_thumbs', 'video_ffmpeg_path', 'folder_preview_default', 'image_resize_dimensions_allowed', 'download_dir_cache')));

// json config
$json_config = array_replace($exclude, array(
  'script' => _basename(__FILE__),
  'menu_exists' => $menu_exists,
  'menu_cache_hash' => $menu_cache_hash,
  'menu_cache_file' => $menu_cache_file,
  'query_path' => $query_path,
  'query_path_valid' => $query_path_valid ? true : false,
  'init_path' => $init_path,
  'dirs' => $dirs,
  'dirs_hash' => config::$dirs_hash,
  'resize_image_types' => $resize_image_types,
  'image_cache_hash' => config::$config['load_images'] ? substr(md5(config::$doc_root . config::$root . config::$config['image_resize_function'] . config::$config['image_resize_quality']), 0, 6) : false,
  'image_resize_dimensions_retina' => config::$image_resize_dimensions_retina,
  'location_hash' => md5(config::$root),
  'has_login' => config::$has_login,
  'version' => config::$version,
  'index_html' => intval(get('index_html')),
  'server_exif' => function_exists('exif_read_data'),
  'image_resize_memory_limit' => $image_resize_memory_limit,
  'qrx' => $wtc && is_string($wtc) ? substr(md5($wtc), 0, strlen($wtc)) : false,
  'video_thumbs_enabled' => !!get_ffmpeg_path(),
  'lang_custom' => lang_custom(),
  'x3_path' => config::$x3_path ? get_url_path(config::$x3_path) : false,
  'userx' => isset($_SERVER['USERX']) ? $_SERVER['USERX'] : false,
  'assets' => config::$assets, // computed assets path
));

// calculate bytes from PHP ini settings
function php_directive_value_to_bytes($directive) {
  $val = function_exists('ini_get') ? @ini_get($directive) : false;
  if (empty($val) || !is_string($val)) return 0;
  preg_match('/^(?<value>\d+)(?<option>[K|M|G]*)$/i', $val, $matches);
  $value = (int) $matches['value'];
  $option = strtoupper($matches['option']);
  if ($option === 'K') {
    $value *= 1024;
  } elseif ($option === 'M') {
    $value *= 1024 * 1024;
  } elseif ($option === 'G') {
    $value *= 1024 * 1024 * 1024;
  }
  return $value;
}

// upload options
if(config::$config['allow_upload']) {
  if(function_exists('ini_get') && !@ini_get('file_uploads')) error('PHP file_uploads disabled on this server.', 500);
  // get max_filesize from all potential limitations (must be > 0)
  $max_sizes = array_filter(array(php_directive_value_to_bytes('upload_max_filesize'), php_directive_value_to_bytes('post_max_size'), config::$config['upload_max_filesize']));
  // get min val from max_sizes[] || no limit
  $json_config['upload_max_filesize'] = !empty($max_sizes) ? min($max_sizes) : 0;
}

// memory and time
header('files-msg: [' . header_memory_time() . ']');

// htmlstart
?>
<!doctype html><!-- www.files.gallery -->
<html<?php echo ' class="menu-' . ($menu_exists ? 'enabled' : 'disabled sidebar-closed') . '"'; ?>>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="robots" content="noindex,nofollow">
    <title><?php echo $init_path ? _basename($init_path) : '/'; ?></title>
    <?php get_include('include/head.html'); ?>
    <link href="<?php echo config::$assets ?>files.photo.gallery@<?php echo config::$version ?>/css/files.css" rel="stylesheet">
    <?php get_include('css/custom.css'); ?>
  </head>
  <body class="body-loading"><svg viewBox="0 0 18 18" class="svg-preloader svg-preloader-active preloader-body"><circle cx="9" cy="9" r="8" pathLength="100" class="svg-preloader-circle"></svg>
    <main id="main">
      <nav id="topbar"<?php if(!empty(config::$config['topbar_sticky'])) echo ' class="topbar-sticky"'; ?>>
        <div id="topbar-top">
          <div id="search-container"><input id="search" type="search" placeholder="search" size="1" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" disabled></div>
          <div id="change-layout" class="dropdown"></div>
          <div id="change-sort" class="dropdown"></div>
        </div>
        <div id="topbar-breadcrumbs">
          <div class="breadcrumbs-info"></div>
          <div id="breadcrumbs"></div>
        </div>
        <div id="topbar-info" class="info-hidden"></div>
        <div id="files-sortbar"></div>
      </nav>
      <!-- files list container -->
      <div id="files-container"><div id="files" class="list files-<?php echo config::$config['layout']; ?>"></div></div>
    </main>
<?php if($menu_exists) { ?>
    <aside id="sidebar">
      <button id="sidebar-toggle" type="button" class="btn-icon"></button>
      <div id="sidebar-inner">
        <div id="sidebar-topbar"></div>
        <div id="sidebar-menu"></div>
      </div>
    </aside>
    <div id="sidebar-bg"></div>
<?php } ?>

    <!-- modal -->
    <div id="modal-bg"></div>
    <div class="modal" id="files_modal" tabindex="-1" role="dialog" data-action="close"></div>

    <!-- context menu -->
    <div id="contextmenu" class="dropdown-menu"></div>

    <!-- custom footer html -->
    <?php get_include('include/footer.html'); ?>

    <!-- Javascript -->
    <script>
var _c = <?php echo json_encode($json_config, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_PARTIAL_OUTPUT_ON_ERROR); ?>;
var CodeMirror = {};
    </script>
    <?php

    // load _files/js/custom.js if exists
    get_include('js/custom.js');

    // load all Javascript assets
    foreach (array_filter([
      'sweetalert2@11.4.26/dist/sweetalert2.min.js',
      'animejs@3.2.1/lib/anime.min.js',
      '@exeba/list.js@2.3.1/dist/list.min.js',
      'yall-js@3.2.0/dist/yall.min.js',
      'filesize@9.0.11/lib/filesize.min.js',
      'screenfull@5.2.0/dist/screenfull.min.js',
      'dayjs@1.11.5/dayjs.min.js',
      'dayjs@1.11.5/plugin/localizedFormat.js',
      'dayjs@1.11.5/plugin/relativeTime.js',
      (in_array(config::$config['download_dir'], ['zip', 'files']) ? 'js-file-downloader@1.1.24/dist/js-file-downloader.min.js' : false),
      (config::$config['download_dir'] === 'browser' ? 'jszip@3.10.1/dist/jszip.min.js' : false),
      (config::$config['download_dir'] === 'browser' ? 'file-saver@2.0.5/dist/FileSaver.min.js' : false),
      'codemirror@5.65.6/mode/meta.js',
      'files.photo.gallery@' . config::$version . '/js/files.js'
    ]) as $key) echo '<script src="' . config::$assets . $key . '"></script>';
    ?>
  </body>
</html>
<?php }}
// htmlend
?>
