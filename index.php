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
    'load_images_max_filesize' => 1000000, // 1MB
    'load_svg_max_filesize' => 100000, // 100k
    'image_resize_enabled' => true,
    'image_resize_cache' => true, // todo: remove this option and just use 'cache?
    'image_resize_dimensions' => 320,
    'image_resize_dimensions_retina' => 480,
    'image_resize_quality' => 90,
    'image_resize_function' => 'imagecopyresampled', // imagecopyresampled / imagecopyresized
    'image_resize_min_filesize' => 50000,
    'image_resize_max_filesize' => 10000000,
    'image_resize_min_ratio' => 1.5,
    'image_resize_cache_direct' => false, // if enabled and delete cache, must increase cache_key
    //'image_resize_min_dimensions,
    //'image_resize_max_dimensions,

    // menu
    'menu_enabled' => true,
    'menu_show' => true,
    'menu_max_depth' => 5,
    'menu_sort' => 'name_asc', // name_asc, name_desc, date_asc, date_desc
    'menu_cache_validate' => true,
    'menu_load_all' => false,

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
    'allow_tasks' => null
  );

  // config (will popuplate)
  public static $config = array();

  // app vars
  static $assets;
  static $prod = true;
  static $version = '0.1.2';
  static $root;
  static $doc_root;
  static $has_login = false;
  static $storage_path;
  static $storage_is_within_doc_root = false;
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
      foreach (['username', 'password', 'allow_tasks'] as $prop) if(isset($props['arr'][$prop]) && !empty($props['arr'][$prop]) && is_string($props['arr'][$prop])) $props['arr'][$prop] = '***';
      $export = $is_empty ? 'array ()' : var_export($props['arr'], true);
      $comment = preg_replace('/\n/', " [" . count($props['arr']) . "]\n", $props['comment'], 1);
      $var = isset($props['var']) ? $props['var'] . ' = ' : 'return ';
      $output .= PHP_EOL . $comment . PHP_EOL . $var . $export . ';' . PHP_EOL;
    }
    highlight_string($output . PHP_EOL . ';?>');
    exit;
  }

  // construct
  function __construct($is_doc = false) {

    // local config
    $local_config = self::get_config(self::$local_config_file);

    // storage config
    $storage_path = isset($local_config['storage_path']) ? $local_config['storage_path'] : self::$default['storage_path'];
    $storage_realpath = !empty($storage_path) ? realpath($storage_path) : false;
    if($is_doc) error($storage_realpath === __DIR__, 'storage_path must be a unique dir.');
    $storage_config_realpath = $storage_realpath ? $storage_realpath . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php' : false;
    $storage_config = self::get_config($storage_config_realpath);

    // config
    $user_config = array_replace($storage_config, $local_config);
    $user_valid = array_intersect_key($user_config, self::$default);
    self::$config = array_replace(self::$default, $user_valid);

    // dump config and exit;
    if(isset($_GET['config'])) self::dump_config($local_config, $storage_path, $storage_config, $user_config, $user_valid);

    // CDN assets
    self::$assets = self::$prod ? 'https://cdn.jsdelivr.net/npm/files.photo.gallery@' . self::$version . '/' : '';

    // root
    self::$root = realpath(self::$config['root']);
    if($is_doc) error(!self::$root, 'root dir "' . self::$config['root'] . '" does not exist.');

    // doc root
    self::$doc_root = $_SERVER['DOCUMENT_ROOT'];

    // login
    self::$has_login = self::$config['username'] || self::$config['password'] ? true : false;

    // $image_cache
    $image_cache = self::$config['image_resize_enabled'] && self::$config['image_resize_cache'] && self::$config['load_images'] ? true : false;

    // cache enabled
    if($image_cache || self::$config['cache']){

      // create storage_path
      if(empty($storage_realpath)){
        $storage_path = is_string($storage_path) ? rtrim($storage_path, '/') : false;
        error(empty($storage_path), 'Invalid storage_path parameter.');
        mkdir_or_error($storage_path);
        $storage_realpath = realpath($storage_path);
        error(empty($storage_realpath), 'storage_path "' . $storage_path . '"" does not exist and can\'t be created.');
      }
      self::$storage_path = $storage_realpath;

      // storage path is within doc root
      if(is_within_docroot(self::$storage_path)) self::$storage_is_within_doc_root = true;

      // cache_path real path
      self::$cache_path = self::$storage_path . DIRECTORY_SEPARATOR . 'cache';

      // create cache dirs
      if($is_doc){
        $dirs = $image_cache ? ['images'] : [];
        if(self::$config['cache']) array_push($dirs, 'folders', 'menu');
        foreach($dirs as $dir) mkdir_or_error(self::$cache_path . DIRECTORY_SEPARATOR . $dir);
      }

      // create config file with all parameters commented out.
      if($is_doc && empty($storage_config)){
        $config_dir = self::$storage_path . DIRECTORY_SEPARATOR . 'config';
        $config_file = $config_dir . DIRECTORY_SEPARATOR . 'config.php';
        if(!file_exists($config_file)){
          mkdir_or_error($config_dir);
          $export = preg_replace("/  '/", "  //'", var_export(self::$default, true));
          $code = '<?php ' . PHP_EOL . PHP_EOL . '// Uncomment the parameters you want to edit.' . PHP_EOL . 'return ' . $export . ';';
          file_put_contents($config_file, $code);
        } 
      }

      // image resize cache direct
      if(self::$config['image_resize_cache_direct'] && !self::$has_login && self::$config['load_images'] && self::$config['image_resize_cache'] && self::$config['image_resize_enabled'] && self::$storage_is_within_doc_root) self::$image_resize_cache_direct = true;
    }

    // image_resize_dimensions_retina
    if(self::$config['image_resize_dimensions_retina'] && self::$config['image_resize_dimensions_retina'] > self::$config['image_resize_dimensions']) self::$image_resize_dimensions_retina = self::$config['image_resize_dimensions_retina'];

    // dirs hash
    self::$dirs_hash = substr(md5(self::$doc_root . __DIR__ . self::$root . self::$version .  self::$config['cache_key'] . self::$image_resize_cache_direct . self::$config['files_exclude'] . self::$config['dirs_exclude']), 0, 6);

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
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, maximum-scale=1.0, user-scalable=0">
    <meta name="robots" content="noindex,nofollow">
    <title>Login</title>
    <link href="<?php echo config::$assets ?>css/files.css" rel="stylesheet">
    <?php custom_script('css'); ?>
  </head>
  <body><div id="files-login-container"></div></body>
  <script>
    document.getElementById('files-login-container').innerHTML = '\
    <h1 class="header login-header">Login</h1>\
    <?php if($is_login_attempt && $_POST['sidx'] !== $sidx) { ?><div class="alert alert-danger" role="alert"><strong>PHP session ID mismatch</strong><br>If the error persists, your PHP is incorrectly creating new session ID for each request.</div><?php } else if($is_login_attempt) { ?>\
    <div class="alert alert-danger" role="alert">Incorrect login!</div><?php } else if($is_logout) { ?>\
    <div class="alert alert-warning" role="alert">You are now logged out.</div><?php } ?>\
    <form>\
      <div class="mylogin">\
        <input type="text" name="username" placeholder="Username">\
        <input type="password" name="password" placeholder="Password">\
      </div>\
      <div class="form-group">\
        <input type="text" name="fusername" class="form-control form-control-lg" placeholder="Username" required autofocus>\
      </div>\
      <div class="form-group">\
        <input type="password" name="fpassword" class="form-control form-control-lg" placeholder="Password" required>\
      </div>\
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
  if($is_doc) foreach (['username', 'password'] as $val) error(empty(config::$config[$val]), $val . ' cannot be empty.');
  error(!session_start() && $is_doc, 'Failed to initiate PHP session_start();');
  function get_client_hash(){
    foreach(array('HTTP_CLIENT_IP','HTTP_X_FORWARDED_FOR','HTTP_X_FORWARDED','HTTP_FORWARDED_FOR','HTTP_FORWARDED','REMOTE_ADDR') as $key){
      if(isset($_SERVER[$key]) && !empty($_SERVER[$key]) && filter_var($_SERVER[$key], FILTER_VALIDATE_IP)) return md5($_SERVER[$key] . $_SERVER['HTTP_USER_AGENT'] . __FILE__ . $_SERVER['HTTP_HOST']);
    }
    exit('Invalid IP');
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
        (strlen(config::$config['password']) === 60 ? password_verify(trim($_POST['fpassword']), config::$config['password']) : (trim($_POST['fpassword']) == config::$config['password'])) && 
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
      exit('You are not logged in.');
    }
  }
}

//
function mkdir_or_error($path){
  if(!file_exists($path)) error(!mkdir($path, 0777, true), 'Failed to create ' . $path);
}
function root_relative($dir){
  return ltrim(substr($dir, strlen(config::$root)), DIRECTORY_SEPARATOR);
}
function root_absolute($dir){
  return config::$root . ($dir ? DIRECTORY_SEPARATOR . $dir : '');
}
function is_within_path($path, $root){
  return strpos($path . DIRECTORY_SEPARATOR, $root . DIRECTORY_SEPARATOR) === 0;
}
function is_within_root($path){
  return is_within_path($path, config::$root);
}
function is_within_docroot($path){
  return is_within_path($path, config::$doc_root);
}
function get_folders_cache_path($name){
  return config::$cache_path . DIRECTORY_SEPARATOR . 'folders' . DIRECTORY_SEPARATOR . $name . '.json';
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
function header_time(){
  $prop = version_compare(PHP_VERSION, '5.4.0') >= 0 ? 'REQUEST_TIME_FLOAT' : 'REQUEST_TIME';
  header('files-output-time: ' . (microtime(true) - $_SERVER[$prop]) . ' seconds.');
}

// read file
// todo: add files-date header
function read_file($path, $mime = 'image/jpeg', $msg = false, $cache_headers = false){
  if(!$path || !file_exists($path)) return false;
  if($mime == 'image/svg') $mime .= '+xml';
  header('content-type: ' . $mime);
	header('content-length: ' . filesize($path));
  header('content-disposition: filename="' . basename($path) . '"');
  header_time();
  if($msg) header('files-msg: ' . $msg);
  if($cache_headers) set_cache_headers();
  if(!readfile($path)) exit('Failed to read file ' . $path . '.');
  exit;
}

// get mime
function get_mime($path){
  if(function_exists('mime_content_type')){
    return mime_content_type($path);
  } else {
    return function_exists('finfo_file') ? @finfo_file(finfo_open(FILEINFO_MIME_TYPE), $path) : false;
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
  return config::$cache_path . DIRECTORY_SEPARATOR . 'images' . DIRECTORY_SEPARATOR . substr(md5($path), 0, 6) . '.' . $filesize . '.' . $filemtime . '.' . $image_resize_dimensions . '.jpg';
}

// is excluded
function is_exclude($path = false, $is_dir = true){

  // early exit
  if(!$path || $path === config::$root) return;

  // exclude files PHP application
  if($path === __FILE__) return true;

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
  if($path === false) return;
  if(!$is_dir && empty($path)) return; // path cannot be empty if file
  $path = root_absolute($path); // get absolute
  if($path !== realpath($path)) return; // path does not exist or does not match realpath
  if(!is_readable($path)) return; // not readable
  if($is_dir && !is_dir($path)) return; // dir check
  if(!$is_dir && !is_file($path)) return; // file check
  if(is_exclude($path, $is_dir)) return; // exclude path
  return $path;
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
  error(!$path, 'Invalid file request.');

  // mime
  $mime = get_mime($path);
  if(!$mime) exit('empty mime type');
  $mime_array = explode('/', $mime);

  // resize
  if($resize){
    if($mime_array[0] !== 'image') exit(basename($path) . ' [' . $mime . '] is not an image.'); // exit if not image
    if(!config::$config['load_images']) exit('Load images disabled.');
    if(!config::$config['image_resize_enabled']) exit('Resize images disabled.');
    $resize_dimensions = intval($resize);
    if(!$resize_dimensions) exit("Invalid resize parameter [$resize]");
    //if($resize_dimensions !== config::image_resize_dimensions && $resize_dimensions !== config::$image_resize_dimensions_retina) exit("Resize [$resize_dimensions] is not allowed.");
    if(!in_array($resize_dimensions, [config::$config['image_resize_dimensions'], config::$image_resize_dimensions_retina])) exit("Resize [$resize_dimensions] is not allowed.");
    resize_image($path, $resize_dimensions);

  // proxy file
  } else {

    // disable if path is within document root and !proxy (should never proxy)
    if(is_within_docroot($path) && !config::$config['load_files_proxy_php']) exit('File cannot be proxied.');

    // read file
    read_file($path, $mime, $msg = 'File ' . basename($path) . ' proxied.', true);
  }
}

// https://www.php.net/manual/en/function.imagecopyresampled.php#112742
function resize_image($path, $resize_dimensions){
  
  // throw error image
    // memory limit errors
  // font as image https://www.php.net/manual/en/function.imagettftext.php
  // rotate from exif?
    // orientation https://github.com/gumlet/php-image-resize/blob/master/lib/ImageResize.php

  // cached
  $file_size = filesize($path);

  // some headers
  $header = "[resize-dimensions: $resize_dimensions][resize-quality: " . config::$config['image_resize_quality'] . "][resize-function: " . config::$config['image_resize_function'] . "][resize-cache: " . (config::$config['image_resize_cache'] ? 'true' : 'false') . "]";

  // cache
  $cache = config::$config['image_resize_cache'] ? get_image_cache_path($path, $resize_dimensions, $file_size, filemtime($path)) : NULL;
  if($cache) read_file($cache, null, 'Resized image served from cache ' . $header, true);

  // limits
  // hmm, maybe just pass through image if < config::image_resize_min_filesize
  if($file_size < config::$config['image_resize_min_filesize']) exit('File size [' . $file_size . '] is smaller than image_resize_min_filesize [' . config::$config['image_resize_min_filesize'] . ']');
  if($file_size > config::$config['image_resize_max_filesize']) exit('File size [' . $file_size . '] exceeds image_resize_max_filesize [' . config::$config['image_resize_max_filesize'] . ']');

  // imagesize
  $info = getimagesize($path);
  if(empty($info)) exit('invalid image [getimagesize]'); // not valid image
  $original_width = $info[0];
  $original_height = $info[1];
  $type = $info[2];
  $mime = $info['mime'];

  // get resize ratio from long side
  $ratio = max($original_width, $original_height) / $resize_dimensions;

  // some headers
  $header .= "[mime: $mime][original-width: $original_width][original-height: $original_height][resize-ratio: $ratio]";

  // output original if resize ratio < image_resize_min_ratio
  if($ratio < config::$config['image_resize_min_ratio'] && !read_file($path, $mime, 'Original image served ' . $header, true)) exit('File ' . $path . ' does not exist.');

  // Calculate new image dimensions.
  $new_width  = round($original_width / $ratio);
  $new_height = round($original_height / $ratio);

  // some headers
  $header .= "[resize-width: $new_width][resize-height: $new_height]";

  // create new $image
  $image = image_create_from($path, $type);
  if(!$image) exit("Failed to create image from resource [path: $path][type: $type]"); 

  // Create final image with new dimensions.
  $new_image = imagecreatetruecolor($new_width, $new_height);
  call_user_func(config::$config['image_resize_function'], $new_image, $image, 0, 0, 0, 0, $new_width, $new_height, $original_width, $original_height);

  // cache
  if($cache){
    if(!imagejpeg($new_image, $cache, config::$config['image_resize_quality'])) exit('Failed to create and cache resized JPG.');
    /* // store cache records in /images.json_decode(json)n
    $image_cache_path = config::$cache_path . DIRECTORY_SEPARATOR . 'images';
    $image_cache_json = $image_cache_path . DIRECTORY_SEPARATOR . 'images.json';
    $image_cache_arr = file_exists($image_cache_json) ? json_decode(file_get_contents($image_cache_json), true) : array();
    $image_cache_arr[basename($cache)] = is_within_docroot($path) ? ltrim(substr($path, strlen(config::$doc_root)), DIRECTORY_SEPARATOR) : $path;
    file_put_contents($image_cache_json, json_encode($image_cache_arr, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES));*/
    if(!read_file($cache, null, 'Resized image cached and served ' . $header, true)) exit('Cache file does not exist.');

  // not cache
  } else {
    set_cache_headers();
    header('content-type: image/jpeg');
    header('files-msg: Resized image served ' . $header);
    header_time();
    imagejpeg($new_image, null, config::$config['image_resize_quality']);
  }

  // destroy
  imagedestroy($new_image);
  
  /*
  errors
  auto-max resize from memory
  */

  // success
  // return false;
  // https://github.com/maxim/smart_resize_image/blob/master/smart_resize_image.function.php
  // https://github.com/gavmck/resize/blob/master/php/lib/resize-class.php
  // https://github.com/gumlet/php-image-resize/blob/master/lib/ImageResize.php
  // https://www.bitrepository.com/resize-an-image-keeping-its-aspect-ratio-using-php-and-gd.html
}

function get_url_path($dir){
  if(!is_within_docroot($dir)) return false;

  // if in __DIR__ path, __DIR__ relative
  if(is_within_path($dir, __DIR__)) return $dir === __DIR__ ? '.' : substr($dir, strlen(__DIR__) + 1);

  // doc root, doc root relative
  return $dir === config::$doc_root ? '/' : substr($dir, strlen(config::$doc_root));
}

//
function get_dir($dir, $files = false, $json_url = false){

  // todo: dir recursive filesize?
  $filemtime = filemtime($dir);

  // array
  $arr = array(
    'basename' => $dir === config::$root ? '' : basename($dir),
    'fileperms' => substr(sprintf('%o', fileperms($dir)), -4),
    'filetype' => 'dir',
    'is_writeable' => is_writeable($dir),
    'mime' => 'directory',
    'mtime' => $filemtime,
    'path' => root_relative($dir),
    'url_path' => get_url_path($dir)
  );

	// $files || config::menu_load_all
  if($files) $arr['files'] = get_files_data($dir, $arr['url_path'], $arr['dirsize'], $arr['files_count'], $arr['images_count']);

	// json cache path
  if($json_url && config::$storage_is_within_doc_root && !config::$has_login && config::$config['cache']){
    $json_cache = get_json_cache_url(get_dir_cache_hash($dir, $filemtime));
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
function get_dirs($dir = false, &$arr = array(), $depth = 0) {

  // exclude
  if($depth && is_exclude($dir)) return;

  // get dir (ignore root, unless load all ... root already loaded into page)
  if($depth || config::$config['menu_load_all']) $arr[] = get_dir($dir, config::$config['menu_load_all'], !config::$config['menu_load_all']);

  // max depth
	if(config::$config['menu_max_depth'] && $depth >= config::$config['menu_max_depth']) return;

  // get dirs from files array if menu_load_all
  if(config::$config['menu_load_all']){
    $dirs = array();
    // foreach ($arr[root_relative($dir)]['files'] as $key => $val) {
    foreach (end($arr)['files'] as $key => $val) {
      if($val['filetype'] === 'dir') $dirs[] = root_absolute($val['path']);
    }

  // glob subdirs
  } else {
    $dirs = glob($dir . '/*', GLOB_NOSORT|GLOB_ONLYDIR);
  }

  // sort and loop
  if(!empty($dirs)) foreach(get_menu_sort($dirs) as $dir) get_dirs($dir, $arr, $depth + 1);

  //
  return $arr;
}

// get image data
function get_image_data($image_size){
	if(!$image_size) return array('corrupt' => true);
	$items = array(0 => 'width', 1 => 'height', 2 => 'type', 'bits' => 'bits', 'channels' => 'channels', 'mime' => 'mime');
	$image_data = array();
	foreach ($items as $id => $name) {
		if(!isset($image_size[$id])) continue;
		$image_data[$name] = $image_size[$id];
	}
	return empty($image_data) ? array('corrupt' => true) : $image_data;
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

function get_exif($path){
	$exif_data = @exif_read_data($path, 'ANY_TAG', 0);
	if(!$exif_data) return;
	$exif = array();
	foreach (array('DateTime', 'DateTimeOriginal', 'ExposureTime', 'FNumber', 'FocalLength', 'Make', 'Model', 'Orientation', 'ISOSpeedRatings', 'Software') as $name) {
		if(isset($exif_data[$name])) {
			$value = trim($exif_data[$name]);
			$exif[$name] = $name === 'DateTime' || $name === 'DateTimeOriginal' ? @strtotime($value) : $value;
		}
	}

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
	$paths = glob($dir . '/*', GLOB_NOSORT);
	if(empty($paths)) return array();
  $items = array();

  // loop paths
	foreach($paths as $path) {

    // filetype
    $filetype = filetype($path);
    $is_dir = $filetype === 'dir' ? true : false;
    if(!$is_dir) $files_count ++;

    // dirs // files // images

    // exclude
    if(is_exclude($path, $is_dir)) continue;

    // vars
    $basename = basename($path);
    $filemtime = filemtime($path);
    $filesize = $is_dir ? false : filesize($path);
    if($filesize) $dirsize += $filesize;
    $mime = $is_dir ? 'directory' : get_mime($path);

    // add properties
    $item = array(
      'basename' => $basename,
      'fileperms' => substr(sprintf('%o', fileperms($path)), -4),
      'filetype' => $filetype,
      'filesize' => $filesize,
      'is_writeable' => is_writeable($path),
      'mime' => $mime,
      'mtime' => $filemtime,
      'path' => root_relative($path)
    );

    // url_path
    if($url_path) $item['url_path'] = $url_path . '/' . $basename;

    // file-only properties
    if(!$is_dir){

      // icon
      if(in_array(strtok($mime, '/'), array('archive', 'audio', 'image', 'video'))) $item['icon'] = strtok($mime, '/');

      // ext
      $ext = pathinfo($path, PATHINFO_EXTENSION);
      $item['ext'] = $ext ? strtolower($ext) : '';

      // image
      if($mime && strpos($mime, 'image') === 0 && !strpos($mime, 'svg')){

        $images_count++;
        
        // getimagesize
        $image_size = @getimagesize($path, $image_info);
        if($image_size){

          // start image array with $image_size array
          $image = get_image_data($image_size);

          // IPTC
          $iptc = get_iptc($image_info);
          if(!empty($iptc)) $image['iptc'] = $iptc;

          // EXIF
          $exif = get_exif($path);
          if(!empty($exif)) {
            $image['exif'] = $exif;
            if(isset($exif['DateTimeOriginal'])) $item['DateTimeOriginal'] = $exif['DateTimeOriginal'];
          }

          // image resize cache direct
          if(config::$image_resize_cache_direct){
            $resize1 = get_image_cache_path($path, config::$config['image_resize_dimensions'], $filesize, $filemtime);
            if(file_exists($resize1)) $image['resize' . config::$config['image_resize_dimensions']] = get_url_path($resize1);
            $retina = config::$image_resize_dimensions_retina;
            if($retina){
              $resize2 = get_image_cache_path($path, $retina, $filesize, $filemtime);
              if(file_exists($resize2)) $image['resize' . $retina] = get_url_path($resize2);
            }
          }

          // add image to item
          $item['image'] = $image;
        }
      }
    }

    // add to items
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
  $cache = get_dir_cache_path($dir);

  // read cache or get dir and cache
  if(!read_file($cache, 'application/json', 'files json served from cache')) {
    json_cache(get_dir($dir, true), 'files json created' . ($cache ? ' and cached.' : '.'), $cache);
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
	if($msg) header('files-msg: ' . $msg);
  header_time();
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
function error($condition, $msg){
	if($condition) exit('<strong>ERROR</strong>: ' . $msg);
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
    return !is_exclude($dir);
  });
}

// get menu cache hash
function get_menu_cache_hash($root_dirs){
  $mtime_count = filemtime(config::$root);
  foreach ($root_dirs as $root_dir) $mtime_count += filemtime($root_dir);
  return substr(md5(config::$doc_root . __DIR__ . config::$root), 0, 6) . '.' . substr(md5(config::$version . config::$config['cache_key'] . config::$config['menu_max_depth'] . config::$config['menu_load_all'] . (config::$config['menu_load_all'] ? config::$config['files_exclude'] . config::$image_resize_cache_direct : '') . config::$has_login . config::$config['dirs_exclude'] . config::$config['menu_sort']), 0, 6) . '.' . $mtime_count;
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
  $cache = config::$config['cache'] ? config::$cache_path . DIRECTORY_SEPARATOR . 'menu' . DIRECTORY_SEPARATOR . $menu_cache_hash . '.json' : false; // get cache path
  $json = $cache ? get_valid_menu_cache($cache) : false; // get valid json menu cache

  // $json is valid from menu cache file
  if($json){
    header('content-type: application/json');
    header('files-msg: valid menu cache hash [' . $menu_cache_hash . ']' . (!config::$config['menu_cache_validate'] ? '[deep validation disabled]' : ''));
    header_time();
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
  $dir = config::$storage_path . DIRECTORY_SEPARATOR . $type;
  if(!file_exists($dir)) return;
  $files = glob($dir . '/*.' . $type);
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
      //echo file_get_contents($file);
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
    $latest = $json && $json['versions'] ? $json['versions'][0] : false;
    if($latest) {
      $is_new = version_compare($latest, config::$version) > 0;
      exit('{"success":' . ($is_new ? '"'.$latest.'"' : 'false') . ($is_new ? ',"writeable":' . (is_writable(__DIR__) && is_writable(__FILE__) ? 'true' : 'false')  : '') . '}');
    }
    exit('{"error": true }');

  } else if($action === 'do_update'){
    $version = post('version');
    $file = 'https://cdn.jsdelivr.net/npm/files.photo.gallery' . ($version ? '@'.$version : '') . '/index.php';
    $update_is_newer = !$version || version_compare($version, config::$version) > 0;
    $writeable = $update_is_newer && is_writable(__DIR__) && is_writable(__FILE__);
    $get = $writeable ? @file_get_contents($file) : false;
    $put = $get && strpos($get, '<?php') === 0 && substr($get, -2) === '?>' && @file_put_contents(__FILE__, $get);
    header('Content-Type: application/json');
    exit('{"success":' . ($put ? 'true' : 'false') . '}');

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
    if(!$download) exit('Invalid download path.');

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
    $tasks_path = config::$storage_path . DIRECTORY_SEPARATOR . 'plugins' . DIRECTORY_SEPARATOR . 'tasks.php';
    error(!file_exists($tasks_path), "Tasks plugin does not exist at <strong>$tasks_path</strong>");
    include $tasks_path;
    exit;

// main document
	} else {

// new config, with tests
new config(true);

// validate exclude regex
if(config::$config['files_exclude']) error(@preg_match(config::$config['files_exclude'], '') === false, 'Invalid files_exclude regex <strong>' . config::$config['files_exclude'] . '</strong>');
if(config::$config['dirs_exclude']) error(@preg_match(config::$config['dirs_exclude'], '') === false, 'Invalid dirs_exclude regex <strong>' . config::$config['dirs_exclude'] . '</strong>');

// start path
$start_path = config::$config['start_path'];
if($start_path){
  $real_start_path = realpath($start_path);
  error(!$real_start_path, 'start_path ' . $start_path . ' does not exist.');
  error(!is_within_root($real_start_path), 'start_path ' . $start_path . ' is not within root dir ' . config::$config['root']);
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
    $menu_cache_path = config::$cache_path . DIRECTORY_SEPARATOR . 'menu' . DIRECTORY_SEPARATOR . $menu_cache_hash . '.json';
    $menu_cache_file = file_exists($menu_cache_path) ? get_url_path($menu_cache_path) : false;
    if($menu_cache_file) $menu_cache_file .= '?' . filemtime($menu_cache_path);
  }
}

// init path
$query = config::$config['history'] && $_SERVER['QUERY_STRING'] ? explode('&', $_SERVER['QUERY_STRING']) : false;
$query_path = $query && strpos($query[0], '=') === false ? rtrim(rawurldecode($query[0]), '/') : false;
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

// exclude some user settings from frontend
$exclude = array_diff_key(config::$config, array_flip(array('root', 'start_path', 'image_resize_cache', 'image_resize_quality', 'image_resize_function', 'image_resize_cache_direct', 'menu_sort', 'menu_load_all', 'cache_key', 'storage_path', 'files_exclude', 'dirs_exclude', 'username', 'password', 'breadcrumbs')));
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
  'index_html' => intval(get('index_html'))
));

// time it
header_time();

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
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1.8.24/dayjs.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1.8.24/plugin/localizedFormat.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1.8.24/plugin/relativeTime.js"></script>
    <script>
var _c = <?php echo json_encode($json_config, JSON_PRETTY_PRINT); ?>;
var CodeMirror = {};
    </script>
    <script src="https://cdn.jsdelivr.net/npm/codemirror@5.52.2/mode/meta.js"></script>
    <!-- custom -->
    <?php custom_script('js'); ?>
    <!-- files -->
    <script src="<?php echo config::$assets ?>js/files.js"></script>

  </body>
</html>
<?php }}
// htmlend
?>