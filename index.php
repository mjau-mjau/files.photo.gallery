<?php

// errors
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// config
class config {

  // DEFAULT CONFIG
  // Only edit directly if it is a temporary installation. Settings added here will be lost when updating!
  // Instead, add options from external config file in your storage_path [_files/config/config.php]
  // READ MORE: https://forum.photo.gallery/viewtopic.php?f=66&t=9964
  public static $default = array(

    // paths
    'root' => '', // root path relative to script. 
    'start_path' => false, // start path relative to script. If empty, root is start path

    // login
    'username' => '',
    'password' => '', // Add password directly or use https://tinyfilemanager.github.io/docs/pwd.html to encrypt the password (encrypted password is more secure, as it prevents your password from being exposed directly in a file).

    // images
    'load_images' => true,
    'load_files_proxy_php' => false,
    'load_images_max_filesize' => 1000000, // maximum file size (bytes) for un-resized images loaded into list
    'load_svg_max_filesize' => 100000, // 100k
    'image_resize_enabled' => true,
    'image_resize_cache' => true, // todo: remove this option and just use 'cache?
    'image_resize_dimensions' => 320,
    'image_resize_dimensions_retina' => 480,
    'image_resize_quality' => 85,
    'image_resize_function' => 'imagecopyresampled', // imagecopyresampled / imagecopyresized
    'image_resize_sharpen' => true,
    'image_resize_memory_limit' => 128, // 128 MB is suffient to resize images around 6000 px / 0 = ignore memory
    'image_resize_max_pixels' => 30000000, // 30 MP equivalent to an image 6000 x 5000 / 0 = no limit
    'image_resize_min_ratio' => 1.5, // min size diff original vs resize. Only resizes if ratio > min ratio
    'image_resize_cache_direct' => false, // if enabled and delete cache, must increase cache_key

    // menu
    'menu_enabled' => true,
    'menu_show' => true,
    'menu_max_depth' => 5,
    'menu_sort' => 'name_asc', // name_asc, name_desc, date_asc, date_desc
    'menu_cache_validate' => true,
    'menu_load_all' => false,
    'menu_recursive_symlinks' => true, // List sub-directories of symlinks in the main menu. May cause menu loops and/or duplicate menu items

    // files layout
    'layout' => 'rows', // list, blocks, grid, rows, columns
    'image_cover' => true, // scales image inside container for list, block, grid and rows layouts.
    'sort' => 'name_asc', // name, date, filesize, kind
    'sort_dirs_first' => true,

    // cache
    'cache' => true,
    'cache_key' => 0,
    'storage_path' => '_files',

    // exclude files directories regex
    'files_exclude' => '', // '/\.(pdf|jpe?g)$/i'
    'dirs_exclude' => '', //'/\/Convert|\/football|\/node_modules(\/|$)/i',
    'allow_symlinks' => true, // allow symlinks

    // various
    'history' => true,
    'breadcrumbs' => true,
    'transitions' => true,
    'click' => 'popup', // popup, modal, download, window, menu
    'code_max_load' => 100000,
    'code_allow_edit' => false,
    'popup_interval' => 5000,
    'topbar_sticky' => 'scroll', // true, false, 'scroll'
    'check_updates' => true,
    'allow_tasks' => true,
    'get_mime_type' => false, // get file mime type from server (slow) instead of from extension (fast)
    'context_menu' => true, // disable context-menu button and right-click menu
    'prevent_right_click' => false, // blocks browser right-click menu on sensitive items (images, list items, menu)
    'license_key' => ''
  );

  // config (will popuplate)
  public static $config = array();

  // app vars
  static $__dir__ = __DIR__;
  static $__file__ = __FILE__;
  static $assets;
  static $prod = true;
  static $version = '0.2.2';
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

  // get config
  private function get_config($path) {
    if(empty($path) || !file_exists($path)) return array();
    $config = include $path;
    return empty($config) || !is_array($config) ? array() : array_map(function($v){ 
      return is_string($v) ? trim($v) : $v; 
    }, $config);
  }

  // dump config
  private function dump_config($local_config, $storage_path, $storage_config, $user_config, $user_valid){

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
      ['arr' => array_diff_key(get_class_vars('config'), array_flip(['default', 'config'])), 'comment' => "// STATIC VARS\n// Static app vars.", 'var' => '$static']
    );

    // loop
    $output = '<?php' . PHP_EOL;
    foreach ($items as $arr => $props) {
      $is_empty = empty($props['arr']);
      if(isset($props['hide']) && $props['hide']) continue;
      foreach (['username', 'password', 'allow_tasks', '__dir__', '__file__'] as $prop) if(isset($props['arr'][$prop]) && !empty($props['arr'][$prop]) && is_string($props['arr'][$prop])) $props['arr'][$prop] = '***';
      $export = $is_empty ? 'array ()' : var_export($props['arr'], true);
      $comment = preg_replace('/\n/', " [" . count($props['arr']) . "]\n", $props['comment'], 1);
      $var = isset($props['var']) ? $props['var'] . ' = ' : 'return ';
      $output .= PHP_EOL . $comment . PHP_EOL . $var . $export . ';' . PHP_EOL;
    }
    highlight_string($output . PHP_EOL . ';?>');
    exit;
  }




  //public static function helloWorld() {
  public static function save_config($config = array()){
    $save_config = array_intersect_key(array_replace(self::$storage_config, $config), self::$default);
    $export = preg_replace("/  '/", "  //'", var_export(array_replace(self::$default, $save_config), true));
    foreach ($save_config as $key => $value) if($value !== self::$default[$key]) $export = str_replace("//'" . $key, "'" . $key, $export);
    return @file_put_contents(config::$storage_config_realpath, '<?php ' . PHP_EOL . PHP_EOL . '// CONFIG / https://forum.photo.gallery/viewtopic.php?f=66&t=9964' . PHP_EOL . '// Uncomment the parameters you want to edit.' . PHP_EOL . 'return ' . $export . ';');
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

    // dump config and exit;
    if(isset($_GET['config'])) self::dump_config($local_config, $storage_path, self::$storage_config, $user_config, $user_valid);

    // CDN assets
    self::$assets = self::$prod ? 'https://cdn.jsdelivr.net/npm/files.photo.gallery@' . self::$version . '/' : '';

    // root
    self::$root = real_path(self::$config['root']);
    if($is_doc && !self::$root) error('root dir "' . self::$config['root'] . '" does not exist.');

    // doc root
    self::$doc_root = real_path($_SERVER['DOCUMENT_ROOT']);

    // login
    self::$has_login = self::$config['username'] || self::$config['password'] ? true : false;

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

    // image_resize_dimensions_retina
    if(self::$config['image_resize_dimensions_retina'] && self::$config['image_resize_dimensions_retina'] > self::$config['image_resize_dimensions']) self::$image_resize_dimensions_retina = self::$config['image_resize_dimensions_retina'];

    // dirs hash
    self::$dirs_hash = substr(md5(self::$doc_root . self::$__dir__ . self::$root . self::$version .  self::$config['cache_key'] . self::$image_resize_cache_direct . self::$config['files_exclude'] . self::$config['dirs_exclude']), 0, 6);

    // login
    // $is_doc
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
    <link href="<?php echo config::$assets ?>css/files.css" rel="stylesheet">
    <?php custom_script('css'); ?>
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
        <input type="text" name="fusername" class="form-control form-control-lg mb-3" placeholder="Username" required autofocus>\
        <input type="password" name="fpassword" class="form-control form-control-lg mb-3" placeholder="Password" required>\
      <input type="hidden" name="client_hash" value="<?php echo $client_hash; ?>">\
      <input type="hidden" name="sidx" value="<?php echo $sidx; ?>">\
      <input type="submit" value="login" class="btn btn-lg btn-primary btn-block">\
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
  if($is_doc) foreach (['username', 'password'] as $val) if(empty(config::$config[$val])) error($val . ' cannot be empty.');
  if(!session_start() && $is_doc) error('Failed to initiate PHP session_start();', 500);
  function get_client_hash(){
    foreach(array('HTTP_CLIENT_IP','HTTP_X_FORWARDED_FOR','HTTP_X_FORWARDED','HTTP_FORWARDED_FOR','HTTP_FORWARDED','REMOTE_ADDR') as $key){
      if(isset($_SERVER[$key]) && !empty($_SERVER[$key]) && filter_var($_SERVER[$key], FILTER_VALIDATE_IP)) return md5($_SERVER[$key] . $_SERVER['HTTP_USER_AGENT'] . __FILE__ . $_SERVER['HTTP_HOST']);
    }
    error('Invalid IP', 401);
  }

  // hash
  $client_hash = get_client_hash();
  $login_hash = md5(config::$config['username'] . config::$config['password'] . $client_hash);

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

      // correct login set $_SESSION['login']
      if($is_login_attempt &&
        trim($_POST['fusername']) == config::$config['username'] && 
        (phpversion() >= 5.5 && !password_needs_rehash(config::$config['password'], PASSWORD_DEFAULT) ? password_verify(trim($_POST['fpassword']), config::$config['password']) : (trim($_POST['fpassword']) == config::$config['password'])) && 
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
function read_file($path, $mime = 'image/jpeg', $msg = false, $props = false, $cache_headers = false){
  if(!$path || !file_exists($path)) return false;
  if($mime == 'image/svg') $mime .= '+xml';
  header('content-type: ' . $mime);
	header('content-length: ' . filesize($path));
  header('content-disposition: filename="' . basename($path) . '"');
  if($msg) header('files-msg: ' . $msg . ' [' . ($props ? $props . ', ' : '') . header_memory_time() . ']');
  if($cache_headers) set_cache_headers();
  if(!is_readable($path) || !readfile($path)) error('Failed to read file ' . $path . '.', 400);
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

// is excluded
function is_exclude($path = false, $is_dir = true, $symlinked = false){

  // early exit
  if(!$path || $path === config::$root) return;

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
    $basename = basename($path);
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

// get file (proxy or resize image)
function get_file($path, $resize = false){

  // validate
  if(!$path) error('Invalid file request.', 404);
  $path = real_path($path); // in case of symlink path

  // mime
  $mime = get_mime($path);
  if(!$mime) error('Empty mime type.', 415);
  $mime_array = explode('/', $mime);

  // resize
  if($resize){
    if($mime_array[0] !== 'image') error('<strong>' . basename($path) . '</strong> (' . $mime . ') is not an image.', 415);
    if(!config::$config['load_images']) error('Load images disabled.', 400);
    if(!config::$config['image_resize_enabled']) error('Resize images disabled.', 400);
    $resize_dimensions = intval($resize);
    if(!$resize_dimensions) error("Invalid resize parameter <strong>$resize</strong>.", 400);
    if(!in_array($resize_dimensions, [config::$config['image_resize_dimensions'], config::$image_resize_dimensions_retina])) error("Resize parameter <strong>$resize_dimensions</strong> is not allowed.", 400);
    resize_image($path, $resize_dimensions);

  // proxy file
  } else {

    // disable if !proxy and path is within document root (file should never be proxied)
    if(!config::$config['load_files_proxy_php'] && is_within_docroot($path)) error('File cannot be proxied.', 400);

    // read file
    read_file($path, $mime, $msg = 'File ' . basename($path) . ' proxied.', false, true);
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
  $image = imagerotate($image, array(6 => 270, 5 => 270, 3 => 180, 4 => 180, 8 => 90, 7 => 90)[$orientation], null);
  if(in_array($orientation, array(5, 4, 7)) && function_exists('imageflip')) imageflip($image, IMG_FLIP_HORIZONTAL);
  return true;
}
  
// resize image
function resize_image($path, $resize_dimensions){

  // file size
  $file_size = filesize($path);

  // header props
  $header_props = 'w:' . $resize_dimensions . ', q:' . config::$config['image_resize_quality'] . ', ' . config::$config['image_resize_function'] . ', cache:' . (config::$config['image_resize_cache'] ? '1' : '0');

  // cache
  $cache = config::$config['image_resize_cache'] ? get_image_cache_path($path, $resize_dimensions, $file_size, filemtime($path)) : NULL;
  if($cache) read_file($cache, null, 'Resized image served from cache', $header_props, true);

  // imagesize
  $info = getimagesize($path);
  if(empty($info) || !is_array($info)) error('Invalid image / failed getimagesize().', 500);
  $resize_ratio = max($info[0], $info[1]) / $resize_dimensions;

  // image_resize_max_pixels early exit
  if(config::$config['image_resize_max_pixels'] && $info[0] * $info[1] > config::$config['image_resize_max_pixels']) error('Image resolution <strong>' . $info[0] . ' x ' . $info[1] . '</strong> (' . ($info[0] * $info[1]) . ' px) exceeds <strong>image_resize_max_pixels</strong> (' . config::$config['image_resize_max_pixels'] . ' px).', 400);

  // header props
  $header_props .= ', ' . $info['mime'] . ', ' . $info[0] . 'x' . $info[1] . ', ratio:' . round($resize_ratio, 2);

  // output original if resize ratio < image_resize_min_ratio
  if($resize_ratio < max(config::$config['image_resize_min_ratio'], 1) && !read_file($path, $info['mime'], 'Original image served', $header_props, true)) error('File does not exist.', 404);

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
    /* // store cache records in /images.json_decode(json)n
    $image_cache_path = config::$cache_path . '/images';
    $image_cache_json = $image_cache_path . '/images.json';
    $image_cache_arr = file_exists($image_cache_json) ? json_decode(file_get_contents($image_cache_json), true) : array();
    $image_cache_arr[basename($cache)] = is_within_docroot($path) ? ltrim(substr($path, strlen(config::$doc_root)), '\/') : $path;
    file_put_contents($image_cache_json, json_encode($image_cache_arr, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES));*/

  // not cache / direct output
  } else {
    set_cache_headers();
    header('content-type: image/jpeg');
    header('files-msg: Resized image served [' . $header_props . ', ' . header_memory_time() . ']');
    if(!imagejpeg($new_image, null, config::$config['image_resize_quality'])) error('<strong>imagejpeg()</strong> failed to create and output resized image.', 500);
  }

  // destroy image
  imagedestroy($new_image);

  // cache readfile
  if($cache && !read_file($cache, null, 'Resized image cached and served', $header_props, true)) error('Cache file does not exist.', 404);

  //
  exit;
  // https://github.com/maxim/smart_resize_image/blob/master/smart_resize_image.function.php
  // https://github.com/gavmck/resize/blob/master/php/lib/resize-class.php
  // https://github.com/gumlet/php-image-resize/blob/master/lib/ImageResize.php
  // https://www.bitrepository.com/resize-an-image-keeping-its-aspect-ratio-using-php-and-gd.html
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

  // array
  $arr = array(
    'basename' => basename($realpath) ?: basename($path) ?: '',
    'fileperms' => substr(sprintf('%o', fileperms($realpath)), -4),
    'filetype' => 'dir',
    'is_writeable' => is_writeable($realpath),
    'is_readable' => is_readable($realpath),
    'is_link' => $symlinked ? is_link($path) : false,
    'mime' => 'directory',
    'mtime' => $filemtime,
    'path' => root_relative($path)
  );

  // url path
  if($url_path) $arr['url_path'] = $url_path;

	// $files || config::menu_load_all
  if($files) $arr['files'] = get_files_data($path, $url_path, $arr['dirsize'], $arr['files_count'], $arr['images_count']);

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
    /*usort($dirs, function($a, $b) {
      return strnatcasecmp(basename(real_path($a)), basename(real_path($b)));
    });*/
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

function safe_iptc_tag($val, $max_str = 1000){
  $val = @substr($val, 0, $max_str);
  return @mb_detect_encoding($val, 'UTF-8', true) ? $val : @utf8_encode($val);
}

function get_iptc($image_info){
	if(!$image_info || !isset($image_info['APP13']) || !function_exists('iptcparse')) return;
	$app13 = @iptcparse($image_info['APP13']);
	if(empty($app13)) return;
	$iptc = array();

  // title // ObjectName
  if(isset($app13['2#005'][0])) $iptc['title'] = safe_iptc_tag($app13['2#005'][0]);

  // description // Caption-Abstract
  if(isset($app13['2#120'][0])) $iptc['description'] = safe_iptc_tag($app13['2#120'][0]);

  // keywords array
  if(isset($app13['2#025']) && !empty($app13['2#025']) && is_array($app13['2#025'])) {
    $keywords = array_map(function($keyword){
      return safe_iptc_tag($keyword, 100);
    }, $app13['2#025']);
    if(!empty($keywords)) $iptc['keywords'] = $keywords;
  }
	return $iptc;
}

// get exif
function get_exif($path){
  if(!function_exists('exif_read_data')) return;
	$exif_data = @exif_read_data($path, 'ANY_TAG', 0); // @exif_read_data($path);
  if(empty($exif_data) || !is_array($exif_data)) return;
	$exif = array();
	foreach (array('DateTime', 'DateTimeOriginal', 'ExposureTime', 'FNumber', 'FocalLength', 'Make', 'Model', 'Orientation', 'ISOSpeedRatings', 'Software') as $name) {
    if(isset($exif_data[$name])) $exif[$name] = trim($exif_data[$name]);
	}
  if(isset($exif['DateTime'])) $exif['DateTime'] = @strtotime($exif['DateTime']);
  if(isset($exif['DateTimeOriginal'])) $exif['DateTimeOriginal'] = @strtotime($exif['DateTimeOriginal']);

	/*LensInfo	24-70mm f/?
	Lens	EF24-70mm f/2.8L USM
	LensID	230*/

	// ApertureFNumber (f_stop)
	if(isset($exif_data['COMPUTED']['ApertureFNumber'])) $exif['ApertureFNumber'] = $exif_data['COMPUTED']['ApertureFNumber'];

	// flash
	if(isset($exif_data['Flash'])) $exif['Flash'] = ($exif_data['Flash'] & 1) != 0;

	// GPS
	$gps = get_image_location($exif_data);
	if(!empty($gps)) $exif['gps'] = $gps;

	// return
	return $exif;
}

function get_image_location($exif){
	$arr = array('GPSLatitudeRef', 'GPSLatitude', 'GPSLongitudeRef', 'GPSLongitude');
	foreach ($arr as $val) {
		if(!isset($exif[$val])) return false;
	}

  $GPSLatitudeRef = $exif[$arr[0]];
  $GPSLatitude    = $exif[$arr[1]];
  $GPSLongitudeRef= $exif[$arr[2]];
  $GPSLongitude   = $exif[$arr[3]];
  
  $lat_degrees = count($GPSLatitude) > 0 ? gps2Num($GPSLatitude[0]) : 0;
  $lat_minutes = count($GPSLatitude) > 1 ? gps2Num($GPSLatitude[1]) : 0;
  $lat_seconds = count($GPSLatitude) > 2 ? gps2Num($GPSLatitude[2]) : 0;
  
  $lon_degrees = count($GPSLongitude) > 0 ? gps2Num($GPSLongitude[0]) : 0;
  $lon_minutes = count($GPSLongitude) > 1 ? gps2Num($GPSLongitude[1]) : 0;
  $lon_seconds = count($GPSLongitude) > 2 ? gps2Num($GPSLongitude[2]) : 0;
  
  $lat_direction = ($GPSLatitudeRef == 'W' or $GPSLatitudeRef == 'S') ? -1 : 1;
  $lon_direction = ($GPSLongitudeRef == 'W' or $GPSLongitudeRef == 'S') ? -1 : 1;
  
  $latitude = $lat_direction * ($lat_degrees + ($lat_minutes / 60) + ($lat_seconds / (60*60)));
  $longitude = $lon_direction * ($lon_degrees + ($lon_minutes / 60) + ($lon_seconds / (60*60)));

  return array($latitude, $longitude);
}

function gps2Num($coordPart){
  $parts = explode('/', $coordPart);
  if(count($parts) <= 0)
  return 0;
  if(count($parts) == 1)
  return $parts[0];
  return floatval($parts[0]) / floatval($parts[1]);
}

// 
function get_files_data($dir, $url_path = false, &$dirsize = 0, &$files_count = 0, &$images_count = 0){

  // scandir
  $filenames = scandir($dir, SCANDIR_SORT_NONE);
  if(empty($filenames)) return array();
  $items = array();

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
    $basename = $is_link ? (basename($realpath) ?: $filename) : $filename;
    $filemtime = filemtime($realpath);
    $is_readable = is_readable($realpath);
    $filesize = $is_dir ? false : filesize($realpath);
    if($filesize) $dirsize += $filesize;

    // url_path / symlink
    $item_url_path = $symlinked ? get_url_path($realpath) : false; // url_path from realpath if symlinked
    if(!$item_url_path && $url_path) $item_url_path = $url_path . ($url_path === '/' ? '' : '/') . ($is_link ? basename($path) : $basename);

    // root path // path relative to config::$root
    if(!$symlinked || is_within_root($realpath)){
      $root_path = root_relative($realpath);

    // path is symlinked and !is_within_root(), get path-relative
    } else {

      // root path to symlink
      $root_path = root_relative($path);

      // check for symlink loop
      if($is_link && $is_dir && $path && $root_path) {
        $basename_path = basename($root_path);
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
      'mtime' => $filemtime,
      'path' => $root_path
    );

    // optional props
    $ext = !$is_dir ? pathinfo($realpath, PATHINFO_EXTENSION) : false;
    if($ext) {
      $ext = strtolower($ext);
      $item['ext'] = $ext;
    }
    $mime = $is_dir ? 'directory' : ($is_readable && (!$ext || config::$config['get_mime_type']) ? get_mime($realpath) : false);
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
    }

    // add to items with basename as key
    $items[$basename] = $item;
	}

	//
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
	header('content-type: application/json');
	$json = empty($arr) ? '{}' : json_encode($arr, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
	if($cache) @file_put_contents($cache, $json);
	if($msg) header('files-msg: ' . $msg . ' [' . header_memory_time() . ']');
	echo $json;
}
function json_error($error = 'Error'){
	header('Content-Type: application/json');
	exit('{"error":"' . $error . '"}');
}
function json_success($success){
  header('Content-Type: application/json');
  exit('{"success":"' . $success . '"}');
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

// custom_script (css + js in storage)
function custom_script($type){
  // todo maybe just use one file custom.css/js for easy edit?
  if(!config::$storage_path || !config::$storage_is_within_doc_root) return;
  $dir = config::$storage_path . '/' . $type;
  $files = file_exists($dir) ? glob($dir . '/*.' . $type) : false;
  if(empty($files)) return;
  $template = $type === 'css' ? '<link href="%url%" rel="stylesheet">' : '<script src="%url%"></script>';
  foreach($files as $file) echo str_replace('%url%', get_url_path($file) . '?' . filemtime($file), $template) . PHP_EOL;
}

// POST
if(post('action')){

  // basic post access security: XMLHttpRequest + post_hash created from server paths
  if(!isset($_SERVER['HTTP_X_REQUESTED_WITH']) || 
    $_SERVER['HTTP_X_REQUESTED_WITH'] !== 'XMLHttpRequest' || 
    post('post_hash') !== md5(__FILE__ . $_SERVER['HTTP_HOST'])) json_error('Invalid request hash. Please Refresh browser.');

	// post action
	$action = post('action');

  //
  new config();

	// dirs
	if($action === 'dirs'){
    dirs(post('localstorage'));

	// files
	} else if($action === 'files'){
    if(!isset($_POST['dir'])) json_error('Missing dir parameter');
    get_files(valid_root_path($_POST['dir'], true));

	// file
	} else if($action === 'file'){

    // valid path
    $file = valid_root_path(post('file'));
    if(!$file) json_error('Invalid file path');
    $file = real_path($file); // in case of symlink path

		// file write
		if(post('write')) {
      if(!config::$config['code_allow_edit']) json_error('Code editing has been disabled.');
      if(!is_writeable($file) || !is_file($file)) json_error('File is not writeable.');
      $write_success = @file_put_contents($file, post('write'));
      $cache_file = $write_success ? get_dir_cache_path(dirname($file)) : false;
      if($cache_file && file_exists($cache_file)) @unlink($cache_file);
      json_success($write_success);

		// get
		} else {
      header('content-type: text/plain; charset=utf-8');
      readfile($file);
		}

  // check login
  } else if($action === 'check_login'){
    header('content-type: application/json');
    echo '{"success":true}';

  // check updates
  } else if($action === 'check_updates'){
    header('Content-Type: application/json');
    $data = @file_get_contents('https://data.jsdelivr.com/v1/package/npm/files.photo.gallery');
    $json = $data ? @json_decode($data, true) : false;
    $latest = !empty($json) && isset($json['versions']) ? $json['versions'][0] : false;
    if($latest) {
      $is_new = version_compare($latest, config::$version) > 0;
      exit('{"success":' . ($is_new ? '"'.$latest.'"' : 'false') . ($is_new ? ',"writeable":' . (is_writable(__DIR__) && is_writable(__FILE__) ? 'true' : 'false')  : '') . '}');
    }
    exit('{"error": true }');

  } else if($action === 'do_update'){
    header('Content-Type: application/json');
    $version = post('version');
    $file = 'https://cdn.jsdelivr.net/npm/files.photo.gallery' . ($version ? '@' . $version : '') . '/index.php';
    $update_is_newer = !$version || version_compare($version, config::$version) > 0;
    $writeable = $update_is_newer && is_writable(__DIR__) && is_writable(__FILE__);
    $get = $writeable ? @file_get_contents($file) : false;
    $put = $get && strpos($get, '<?php') === 0 && substr($get, -2) === '?>' && @file_put_contents(__FILE__, $get);
    exit('{"success":' . ($put ? 'true' : 'false') . '}');

  } else if($action === 'license'){
    header('Content-Type: application/json');
    $key = isset($_POST['key']) ? trim($_POST['key']) : false;
    $success = config::$storage_config_realpath && $key && config::save_config(array('license_key' => $key));
    exit('{"success":' . ($success ? 'true, "md5" : "' . md5($key) . '"' : 'false') . '}');

  // invalid action
	} else {
    json_error('invalid action: ' . $action);
  }

// GET
} else /*if($_SERVER['REQUEST_METHOD'] === 'GET')*/{

	// file/image
	if(isset($_GET['file'])){
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
	  header('Content-Disposition: attachment; filename="' . basename($download) . '"');
	  header('Content-Transfer-Encoding: binary');
	  header('Expires: 0');
	  header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
	  header('Pragma: public');
	  header('Content-Length: ' . filesize($download));
	  ob_clean();
	  flush();
	  readfile($download);

  // tasks plugin
  } else if(get('task')){

    // new config with tests
    new config(true);

    // get plugin
    $tasks_path = config::$storage_path . '/plugins/tasks.php';
    if(!file_exists($tasks_path)) error("Tasks plugin does not exist at <strong>$tasks_path</strong>", 404);
    include $tasks_path;
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

// root dirs (if menu)
$root_dirs = config::$config['menu_enabled'] || config::$config['breadcrumbs'] ? get_root_dirs() : false;
$menu_enabled = config::$config['menu_enabled'] && !empty($root_dirs) ? true : false;
$breadcrumbs = config::$config['breadcrumbs'] && !empty($root_dirs) ? true : false;

// get menu cache hash
$menu_cache_hash = false;
$menu_cache_file = false;
if($menu_enabled){
  $menu_cache_hash = get_menu_cache_hash($root_dirs);
  // menu cache file (if cache, !menu_cache_validate, exists and is within doc root)
  if(config::$storage_is_within_doc_root && config::$config['cache'] && !config::$config['menu_cache_validate']) {
    $menu_cache_path = config::$cache_path . '/menu/' . $menu_cache_hash . '.json';
    $menu_cache_file = file_exists($menu_cache_path) ? get_url_path($menu_cache_path) : false;
    if($menu_cache_file) $menu_cache_file .= '?' . filemtime($menu_cache_path);
  }
}

// init path
$query = config::$config['history'] && $_SERVER['QUERY_STRING'] ? explode('&', $_SERVER['QUERY_STRING']) : false;
$query_path = $query && strpos($query[0], '=') === false && $query[0] != 'debug' ? rtrim(rawurldecode($query[0]), '/') : false;
$query_path_valid = $query_path ? valid_root_path($query_path, true) : false;
$init_path = $query_path ?: $start_path ?: '';

// init dirs, with files if cache
function get_dir_init($dir){
  $cache = get_dir_cache_path($dir);
  if(file_exists($cache)) return json_decode(file_get_contents($cache), true);
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

// image resize memory limit
$image_resize_memory_limit = config::$config['image_resize_enabled'] && config::$config['image_resize_memory_limit'] && function_exists('ini_get') ? (int) @ini_get('memory_limit') : 0;
if($image_resize_memory_limit && function_exists('ini_set')) $image_resize_memory_limit = max($image_resize_memory_limit, config::$config['image_resize_memory_limit']);

$wtc = config::$config[base64_decode('bGljZW5zZV9rZXk')];

// exclude some user settings from frontend
$exclude = array_diff_key(config::$config, array_flip(array('root', 'start_path', 'image_resize_cache', 'image_resize_quality', 'image_resize_function', 'image_resize_cache_direct', 'menu_sort', 'menu_load_all', 'cache_key', 'storage_path', 'files_exclude', 'dirs_exclude', 'username', 'password', 'breadcrumbs', 'allow_tasks', 'allow_symlinks', 'menu_recursive_symlinks', 'image_resize_sharpen', 'get_mime_type', 'license_key')));
$json_config = array_replace($exclude, array(
  'breadcrumbs' => $breadcrumbs,
  'script' => basename(__FILE__),
  'menu_enabled' => $menu_enabled,
  'menu_cache_hash' => $menu_cache_hash,
  'menu_cache_file' => $menu_cache_file,
  'query_path' => $query_path,
  'query_path_valid' => $query_path_valid ? true : false,
  'init_path' => $init_path,
  'dirs' => $dirs,
  'dirs_hash' => config::$dirs_hash,
  'resize_image_types' => $resize_image_types,
  'post_hash' => md5(__FILE__ . $_SERVER['HTTP_HOST']),
  'image_cache_hash' => config::$config['load_images'] ? substr(md5(config::$doc_root . config::$root . config::$config['image_resize_function'] . config::$config['image_resize_quality']), 0, 6) : false,
  'image_resize_dimensions_retina' => config::$image_resize_dimensions_retina,
  'location_hash' => md5(config::$root),
  'has_login' => config::$has_login,
  'version' => config::$version,
  'index_html' => intval(get('index_html')),
  'server_exif' => function_exists('exif_read_data'),
  'image_resize_memory_limit' => $image_resize_memory_limit,
  'qrx' => $wtc && is_string($wtc) ? substr(md5($wtc), 0, strlen($wtc)) : false
));

// memory and time
header('files-msg: [' . header_memory_time() . ']');

// htmlstart
?>
<!doctype html>
<html<?php echo ' class="menu-' . ($menu_enabled ? 'enabled' : 'disabled sidebar-closed') . '"'; ?>>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="robots" content="noindex,nofollow">
    <title><?php echo $init_path ? basename($init_path) : '/'; ?></title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/photoswipe@4.1.3/dist/photoswipe.css">
    <link href="<?php echo config::$assets ?>css/files.css" rel="stylesheet">
    <?php custom_script('css'); ?>
  </head>

  <body class="body-loading">
    <main id="main">
      <?php
      $topbar_classes = array();
      if(config::$config['topbar_sticky']) array_push($topbar_classes, 'topbar-sticky');
      if($breadcrumbs) array_push($topbar_classes, 'has-breadcrumbs');
      ?>
      <nav id="topbar"<?php if(!empty($topbar_classes)) echo ' class="' . join(' ', $topbar_classes) . '"'; ?>>
        <div id="topbar-top">
          <input id="search" type="search" placeholder="search" disabled>
          <div id="change-layout" class="dropdown"></div>
          <div id="change-sort" class="dropdown"></div>
          <?php if(config::$config['username']) { ?><a href="<?php echo strtok($_SERVER['REQUEST_URI'], '?') . '?logout'; ?>" class="btn-icon btn-topbar" id="logout"></a><?php } ?>
          <button class="btn-icon btn-topbar" id="topbar-fullscreen"></button>
        </div>
        <?php if($breadcrumbs) { ?>
        <ul id="breadcrumbs"></ul>
        <?php } ?>
        <div id="topbar-info"></div>
        <div id="files-sortbar"></div>
      </nav>
      <div id="list">
        <ul id="list-ul" class="list" style="display: none"></ul>
      </div>
    </main>
<?php if($menu_enabled) { ?>
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

    <!-- photoswipe -->
    <div id="pswp" class="pswp" tabindex="-1" role="dialog" aria-hidden="true"></div>

    <!-- Javascript -->
    <script src="https://cdn.jsdelivr.net/npm/animejs@3.2.0/lib/anime.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/list.js@1.5.0/dist/list.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/yall-js@3.2.0/dist/yall.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/filesize@6.1.0/lib/filesize.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/photoswipe@4.1.3/dist/photoswipe.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/screenfull@5.0.2/dist/screenfull.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1.8.34/dayjs.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1.8.34/plugin/localizedFormat.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1.8.34/plugin/relativeTime.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-alpha1/dist/js/bootstrap.min.js"></script>
    <script>
var _c = <?php echo json_encode($json_config, JSON_PRETTY_PRINT); ?>;
var CodeMirror = {};
    </script>
    <script src="https://cdn.jsdelivr.net/npm/codemirror@5.57.0/mode/meta.js"></script>
    <!-- custom -->
    <?php custom_script('js'); ?>
    <!-- files -->
    <script src="<?php echo config::$assets ?>js/files.js"></script>

  </body>
</html>
<?php }}
// htmlend
?>