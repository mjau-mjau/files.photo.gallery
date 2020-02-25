<?php

// errors
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// config
class config {

  // paths
	const root = ''; // root path relative to script. 
	const start_path = false; // start path relative to script. If empty, root is start path

  // login
  const username = '';
  const password = '';
  // Add password directly or use https://tinyfilemanager.github.io/docs/pwd.html to encrypt the password (encrypted password is more secure, as it prevents your password from being exposed directly in a file).
  
  // images
  const load_images = true;
  const load_images_proxy_php = false;
  const load_images_max_filesize = 1000000; // 1MB
  const load_svg_max_filesize = 100000; // 100k
  const image_resize_enabled = true;
  const image_resize_cache = true; // todo: remove this option and just use const cache?
  const image_resize_dimensions = 320;
  const image_resize_dimensions_retina = 480;
  const image_resize_quality = 90;
  const image_resize_function = 'imagecopyresampled'; // imagecopyresampled / imagecopyresized
  const image_resize_min_filesize = 50000;
  const image_resize_max_filesize = 10000000;
  const image_resize_min_ratio = 1.5;
  const image_resize_cache_direct = false; // if enabled and delete cache, must increase cache_key
  //const image_resize_min_dimensions;
  //const image_resize_max_dimensions;

  // menu
  const menu_enabled = true;
  const menu_show = true;
  const menu_max_depth = 5;
  const menu_sort = 'name_asc'; // name_asc, name_desc, date_asc, date_desc
  const menu_cache_validate = true;
  const menu_load_all = false;

  // files layout
  const layout = 'rows'; // list, blocks, grid, rows, columns
  const image_cover = true; // scales image inside container for list, block, grid and rows layouts.
  const sort = 'name_asc'; // name, date, filesize, kind
  const sort_dirs_first = true;

  // cache
  const cache = true;
  const cache_key = 0;
  const storage_path = '_files';

  // exclude files directories regex
  const files_exclude = ''; // '/\.(pdf|jpe?g)$/i'
  const dirs_exclude = ''; //'/\/Convert|\/football|\/node_modules(\/|$)/i';

  // various
  const history = true;
  const breadcrumbs = true;
  const transitions = true;
  const click = 'popup'; // popup, modal, download, window, menu
  const code_max_load = 100000;
  const code_allow_edit = false;
  const popup_interval = 5000;
  const topbar_sticky = 'scroll'; // true, false, 'scroll'
  const check_updates = true;
};

// private config vars
class _config {

  // real paths
  static $root;
  static $doc_root;
  static $storage_path;
  static $cache_path;
  static $something;

  // direct cache
  static $dirs_hash = false;
  static $storage_is_within_doc_root = false;
  static $image_resize_cache_direct = false;
  static $image_resize_dimensions_retina = false;

  // login
  static $has_login = false;

  //
  static $version = '0.0.3';
  static $exclude = false;
  static $prod = true;
  static $assets;

  // construct config
  function __construct($errors = false) {

    // CDN assets
    self::$assets = self::$prod ? 'https://cdn.jsdelivr.net/npm/files.photo.gallery@' . self::$version . '/' : '';

    // root
    self::$root = realpath(config::root);
    if($errors) error(!self::$root, 'root dir ' . config::root . ' does not exist.');

    // doc root
    self::$doc_root = $_SERVER['DOCUMENT_ROOT'];

    // login
    self::$has_login = config::username || config::password ? true : false;

    // cache dirs if required
    if((config::image_resize_enabled && config::image_resize_cache && config::load_images) || config::cache){

      // Internet Explorer <=11
      /*if($errors){
        $ua = htmlentities($_SERVER['HTTP_USER_AGENT'], ENT_QUOTES, 'UTF-8');
        error(preg_match('~MSIE|Internet Explorer~i', $ua) || (strpos($ua, 'Trident/7.0') && strpos($ua, 'rv:11.0')), 'Files app does not support older Internet Explorer browsers. Please use a modern browser like <a href="https://www.microsoft.com/en-us/windows/microsoft-edge">Edge</a>, <a href="https://www.google.com/chrome/">Chrome</a>, <a href="https://www.mozilla.org/firefox/">Firefox</a>, <a href="https://www.opera.com/">Opera</a> or <a href="https://www.apple.com/safari/">Safari</a>.<br><br>' . $ua);
      }*/

      // storage path must be a unique directory
      if($errors) error(empty(trim(config::storage_path, './')), 'storage_path must be a unique directory.');

      // create cache/images dir or error
      if($errors && config::image_resize_enabled && config::image_resize_cache && config::load_images) mkdir_or_error(rtrim(config::storage_path, '/') . '/cache/images');

      // create cache/folders dir or error
      if($errors && config::cache) mkdir_or_error(rtrim(config::storage_path, '/') . '/cache/folders');

      // create cache/menu dir or error
      if($errors && config::cache) mkdir_or_error(rtrim(config::storage_path, '/') . '/cache/menu');

      // storage_path real path
      self::$storage_path = realpath(config::storage_path);

      // error if empty storage_path.
      if($errors) error(empty(self::$storage_path), 'storage_path ' . config::storage_path . ' does not exist and can\'t be created.');

      // storage path is within doc root
      if(is_within_docroot(self::$storage_path)) self::$storage_is_within_doc_root = true;

      // cache_path real path
      self::$cache_path = self::$storage_path . DIRECTORY_SEPARATOR . 'cache';
      
      //  image resize cache direct
      if(config::image_resize_cache_direct && !self::$has_login && config::load_images && config::image_resize_cache && config::image_resize_enabled && self::$storage_is_within_doc_root) self::$image_resize_cache_direct = true;
    }

    // image_resize_dimensions_retina
    if(config::image_resize_dimensions_retina && config::image_resize_dimensions_retina > config::image_resize_dimensions) self::$image_resize_dimensions_retina = config::image_resize_dimensions_retina;

    // dirs hash
    self::$dirs_hash = substr(md5(self::$doc_root . __DIR__ . self::$root . self::$version . config::cache_key . self::$image_resize_cache_direct . config::files_exclude . config::dirs_exclude), 0, 6);

    // login
    if(self::$has_login){
      error($errors && empty(config::username), 'Username cannot be empty when setting a password.');
      error($errors && empty(config::password), 'Password cannot be empty when setting a username.');
      error(!session_start() && $errors, 'Failed to initiate PHP session_start();');
      function get_client_hash(){
        foreach(array('HTTP_CLIENT_IP','HTTP_X_FORWARDED_FOR','HTTP_X_FORWARDED','HTTP_FORWARDED_FOR','HTTP_FORWARDED','REMOTE_ADDR') as $key){
          if(isset($_SERVER[$key]) && !empty($_SERVER[$key]) && filter_var($_SERVER[$key], FILTER_VALIDATE_IP)) return md5($_SERVER[$key] . $_SERVER['HTTP_USER_AGENT'] . __FILE__ . $_SERVER['HTTP_HOST']);
        }
        exit('Invalid IP');
      }
      $client_hash = get_client_hash();
      $login_hash = md5(config::username . config::password . $client_hash);

      // login status
      $is_logout = isset($_GET['logout']) && isset($_SESSION['login']);
      if($is_logout) unset($_SESSION['login']);
      $is_logged_in = !$is_logout && isset($_SESSION['login']) && $_SESSION['login'] === $login_hash;

      // not logged in
      if(!$is_logged_in){

        // login only on html pages
        if($errors){

          // vars
          $sidx = md5(session_id());
          $is_login_attempt = isset($_POST['fusername']) && isset($_POST['fpassword']) && isset($_POST['client_hash']) && isset($_POST['sidx']);

          // correct login set $_SESSION['login']
          if($is_login_attempt &&
            trim($_POST['fusername']) == config::username && 
            (strlen(config::password) === 60 ? password_verify(trim($_POST['fpassword']), config::password) : (trim($_POST['fpassword']) == config::password)) && 
            $_POST['client_hash'] === $client_hash && 
            $_POST['sidx'] === $sidx
          ){
            $_SESSION['login'] = $login_hash;

          // display form
          } else {

// login form html
?><!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, maximum-scale=1.0, user-scalable=0">
    <meta name="robots" content="noindex,nofollow">
    <title>Login</title>
    <link href="<?php echo _config::$assets ?>css/files.css" rel="stylesheet">
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
</html><?php // end form

            // always exit on form
            exit();
          }

        // not logged in (images or post API requests), don't show form.
        } else if(post('action')){
          json_error('login');

        } else {
          exit('You are not logged in.');
        }
      }
    }
  }
}

//
function mkdir_or_error($path){
  if(!file_exists($path)) error(!mkdir($path, 0777, true), 'Failed to create ' . $path);
}
function root_relative($dir){
  return ltrim(substr($dir, strlen(_config::$root)), DIRECTORY_SEPARATOR);
}
function root_absolute($dir){
  return _config::$root . ($dir ? DIRECTORY_SEPARATOR . $dir : '');
}
function is_within_path($path, $root){
  return strpos($path . DIRECTORY_SEPARATOR, $root . DIRECTORY_SEPARATOR) === 0;
}
function is_within_root($path){
  return is_within_path($path, _config::$root);
}
function is_within_docroot($path){
  return is_within_path($path, _config::$doc_root);
}
function get_folders_cache_path($name){
  return _config::$cache_path . '/folders/' . $name . '.json';
}
function get_json_cache_url($name){
  $file = get_folders_cache_path($name);
  return file_exists($file) ? get_url_path($file) : false;
}
function get_dir_cache_path($dir, $mtime = false){
  if(!config::cache || !$dir) return;
  return get_folders_cache_path(get_dir_cache_hash($dir, $mtime));
}
function get_dir_cache_hash($dir, $mtime = false){
  return _config::$dirs_hash . '.' . substr(md5($dir), 0, 6) . '.' . ($mtime ?: filemtime($dir));
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
  return _config::$cache_path . DIRECTORY_SEPARATOR . 'images' . DIRECTORY_SEPARATOR . substr(md5($path), 0, 6) . '.' . $filesize . '.' . $filemtime . '.' . $image_resize_dimensions . '.jpg';
}

// is excluded
function is_exclude($path = false, $is_dir = true){

  // early exit
  if(!$path || $path === _config::$root) return;

  // exclude files PHP application
  if($path === __FILE__) return true;

  // exclude storage path (if is within document root)
  if(_config::$storage_is_within_doc_root && is_within_path($path, _config::$storage_path)) return true; 

  // check root relative dir path
  if(config::dirs_exclude) {
    $dirname = $is_dir ? $path : dirname($path);
    if($dirname !== _config::$root && preg_match(config::dirs_exclude, substr($dirname, strlen(_config::$root)))) return true;
  }

  // file only: check basename
  if(!$is_dir && config::files_exclude && preg_match(config::files_exclude, basename($path))) return true;
}

// valid root path
function valid_root_path($path, $is_dir = false){
  if($path === false) return;
  if(!$is_dir && empty($path)) return; // path cannot be empty if file
  $path = root_absolute($path); // get absolute
  if($path !== realpath($path)) return; // path does not exist or does not match
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

// get image (proxy or resize)
function get_image($path, $resize = false){

  // validate
  error(!$path, 'Invalid image request.');

  // resize
  if($resize){
    if(!config::load_images) exit('Load images disabled.');
    if(!config::image_resize_enabled) exit('Resize images disabled.');
    $resize_dimensions = intval($resize);
    if(!$resize_dimensions) exit("Invalid resize parameter [$resize]");
    if($resize_dimensions !== config::image_resize_dimensions && $resize_dimensions !== _config::$image_resize_dimensions_retina) exit("Resize [$resize_dimensions] is not allowed.");
    resize_image($path, $resize_dimensions);

  // proxy image
  } else {

    // disable if path is within document root and !proxy
    if(is_within_docroot($path) && !config::load_images_proxy_php) exit('File cannot be proxied.');

    // mime
    $mime = get_mime($path);
    if(!$mime) exit('empty mime type');
    $mime_array = explode('/', $mime);
    if($mime_array[0] !== 'image') exit(basename($path) . ' [' . $mime . '] is not an image.');

    // read file
    read_file($path, $mime, $msg = 'Image ' . basename($path) . ' proxied.', true);
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
  $header = "[resize-dimensions: $resize_dimensions][resize-quality: ".config::image_resize_quality."][resize-function: ".config::image_resize_function."][resize-cache: ".(config::image_resize_cache ? 'true' : 'false')."]";

  // cache
  $cache = config::image_resize_cache ? get_image_cache_path($path, $resize_dimensions, $file_size, filemtime($path)) : NULL;
  if($cache) read_file($cache, null, 'Resized image served from cache ' . $header, true);

  // limits
  // hmm, maybe just pass through image if < config::image_resize_min_filesize
  if($file_size < config::image_resize_min_filesize) exit('File size [' . $file_size . '] is smaller than image_resize_min_filesize [' . config::image_resize_min_filesize . ']');
  if($file_size > config::image_resize_max_filesize) exit('File size [' . $file_size . '] exceeds image_resize_max_filesize [' . config::image_resize_max_filesize . ']');

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
  if($ratio < config::image_resize_min_ratio && !read_file($path, $mime, 'Original image served ' . $header, true)) exit('File ' . $path . ' does not exist.');

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
  call_user_func(config::image_resize_function, $new_image, $image, 0, 0, 0, 0, $new_width, $new_height, $original_width, $original_height);

  // cache
  if($cache){
    if(!imagejpeg($new_image, $cache, config::image_resize_quality)) exit('Failed to create and cache resized JPG.');
    /* // store cache records in /images.json_decode(json)n
    $image_cache_path = _config::$cache_path . DIRECTORY_SEPARATOR . 'images';
    $image_cache_json = $image_cache_path . DIRECTORY_SEPARATOR . 'images.json';
    $image_cache_arr = file_exists($image_cache_json) ? json_decode(file_get_contents($image_cache_json), true) : array();
    $image_cache_arr[basename($cache)] = is_within_docroot($path) ? ltrim(substr($path, strlen(_config::$doc_root)), DIRECTORY_SEPARATOR) : $path;
    file_put_contents($image_cache_json, json_encode($image_cache_arr, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES));*/
    if(!read_file($cache, null, 'Resized image cached and served ' . $header, true)) exit('Cache file does not exist.');

  // not cache
  } else {
    set_cache_headers();
    header('content-type: image/jpeg');
    header('files-msg: Resized image served ' . $header);
    header_time();
    imagejpeg($new_image, null, config::image_resize_quality);
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
  return $dir === _config::$doc_root ? '/' : substr($dir, strlen(_config::$doc_root));
}

//
function get_dir($dir, $files = false, $json_url = false){

  // todo: dir recursive filesize?
  $filemtime = filemtime($dir);

  // array
  $arr = array(
    'basename' => $dir === _config::$root ? '' : basename($dir),
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
  if($json_url && _config::$storage_is_within_doc_root && !_config::$has_login && config::cache){
    $json_cache = get_json_cache_url(get_dir_cache_hash($dir, $filemtime));
    if($json_cache) $arr['json_cache'] = $json_cache;
  }

  //
	return $arr;
}

// get menu sort
function get_menu_sort($dirs){
  if(strpos(config::menu_sort, 'date') === 0){
    usort($dirs, function($a, $b) {
      return filemtime($a) - filemtime($b); 
    });
  } else {
    natcasesort($dirs);
  }
  return substr(config::menu_sort, -4) === 'desc' ? array_reverse($dirs) : $dirs;
}

// recursive directory scan
function get_dirs($dir = false, &$arr = array(), $depth = 0) {

  // exclude
  if($depth && is_exclude($dir)) return;

  // get dir (ignore root, unless load all ... root already loaded into page)
  if($depth || config::menu_load_all) $arr[root_relative($dir)] = get_dir($dir, config::menu_load_all, !config::menu_load_all);

  // max depth
	if(config::menu_max_depth && $depth >= config::menu_max_depth) return;

  // get dirs from files array if menu_load_all
  if(config::menu_load_all){
    $dirs = array();
    foreach ($arr[root_relative($dir)]['files'] as $key => $val) {
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
          if(_config::$image_resize_cache_direct){
            $resize1 = get_image_cache_path($path, config::image_resize_dimensions, $filesize, $filemtime);
            if(file_exists($resize1)) $image['resize' . config::image_resize_dimensions] = get_url_path($resize1);
            if(_config::$image_resize_dimensions_retina){
              $resize2 = get_image_cache_path($path, _config::$image_resize_dimensions_retina, $filesize, $filemtime);
              if(file_exists($resize2)) $image['resize' . _config::$image_resize_dimensions_retina] = get_url_path($resize2);
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
  if(!config::menu_cache_validate) return $json;
  $arr = @json_decode($json, true);
  if(empty($arr)) return;
  foreach ($arr as $key => $val) {
    $path = $val['path'];
    if(strpos($path, '/') !== false && $val['mtime'] !== @filemtime(root_absolute($path))) return;
  }
  return $json;
}

// get root dirs
function get_root_dirs(){
  $root_dirs = glob(_config::$root . '/*', GLOB_ONLYDIR|GLOB_NOSORT);
  if(empty($root_dirs)) return array();
  return array_filter($root_dirs, function($dir){
    return !is_exclude($dir);
  });
}

// get menu cache hash
function get_menu_cache_hash($root_dirs){
  $mtime_count = filemtime(_config::$root);
  foreach ($root_dirs as $root_dir) $mtime_count += filemtime($root_dir);
  return substr(md5(_config::$doc_root . __DIR__ . _config::$root), 0, 6) . '.' . substr(md5(_config::$version . config::cache_key . config::menu_max_depth . config::menu_load_all . (config::menu_load_all ? config::files_exclude . _config::$image_resize_cache_direct : '') . _config::$has_login . config::dirs_exclude . config::menu_sort), 0, 6) . '.' . $mtime_count;
}

// get dirs
function dirs(){

  // get menu_cache_hash
  if(config::cache){
    $menu_cache_hash = post('menu_cache_hash'); // get menu cache hash
    $menu_cache_arr = $menu_cache_hash ? explode('.', $menu_cache_hash) : false;
    if(!$menu_cache_arr || 
      count($menu_cache_arr) !== 3 || 
      strlen($menu_cache_arr[0]) !== 6 || 
      strlen($menu_cache_arr[1]) !== 6 || 
      !is_numeric($menu_cache_arr[2])
    ) json_error('Invalid menu cache hash'); // early exit
  }
  $cache = config::cache ? _config::$cache_path . '/menu/' . $menu_cache_hash . '.json' : false; // get cache path
  $json = $cache ? get_valid_menu_cache($cache) : false; // get valid json menu cache

  // $json is valid from menu cache file
  if($json){
    header('content-type: application/json');
    header('files-msg: valid menu cache hash [' . $menu_cache_hash . ']' . (!config::menu_cache_validate ? '[deep validation disabled]' : ''));
    header_time();
    echo (post('localstorage') ? '{"localstorage":"1"}' : $json);
    
  // reload dirs
  } else {
    json_cache(get_dirs(_config::$root), 'dirs reloaded' . ($cache ? ' and cached.' : ' [cache disabled]'), $cache);
  }
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
  new _config();

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
      if(!config::code_allow_edit) json_error('Code editing has been disabled.');
      if(!is_writeable($file) || !is_file($file)) json_error('File is not writeable.');
      $write_success = @file_put_contents($file, post('write'));
      $cache_file = $write_success ? get_dir_cache_path(dirname($file)) : false;
      if($cache_file && file_exists($cache_file)) @unlink($cache_file);
      json_success($write_success);

		// get
		} else {
      echo file_get_contents($file);
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
      $is_new = version_compare($latest, _config::$version) > 0;
      exit('{"success":' . ($is_new ? '"'.$latest.'"' : 'false') . ($is_new ? ',"writeable":' . (is_writable(__DIR__) && is_writable(__FILE__) ? 'true' : 'false')  : '') . '}');
    }
    exit('{"error": true }');

  } else if($action === 'do_update'){
    $version = post('version');
    $file = 'https://cdn.jsdelivr.net/npm/files.photo.gallery' . ($version ? '@'.$version : '') . '/index.php';
    $update_is_newer = !$version || version_compare($version, _config::$version) > 0;
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

	// image
	if(isset($_GET['image'])){
    new _config();
    get_image(valid_root_path(get('image')), get('resize'));

	// download
	} else if(isset($_GET['download'])){
    new _config();

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

  // tasks
  } else if(isset($_GET['task'])){

    // new config with tests
    new _config(true);

    //
    if(!_config::$has_login) exit('Tasks require login enabled.');

    // task
    $task = get('task');
    if(!$task) exit('Empty task command.');

    // set time limit
    $time_limit = get('time_limit');
    if($time_limit) set_time_limit(intval($time_limit));

    // vars
    $output = '';
    $force = get('force');
    $do_all = get('all');
    $do_menu = $do_all || get('menu');
    $do_folders = $do_all || get('folders');
    $do_images = $do_all || get('images');

    // processed
    class processed {
      public static $folders = 0;
      public static $folders_count = 0;
      public static $images = 0;
      public static $images_count = 0;
      public static $menu = 0;
      public static $menu_count = 0;
    }

    // add output
    function add_output($create = true, $count, $total, $force){
      $action = $create ? 'created' : 'removed';
      $items = $total === 1 ? 'item' : 'items';
      return ' cache items ' . $action . ': <strong>[' . $count . ' / ' . $total . ']</strong>' . ($total && $force ? ' (force ' . $action . ')' : '') . ($count === $total ? '' : ' (' . ($total - $count) . ' ' . $items . ' still valid)') . '<br>';
    }

    // task: create_cache [beta]
    if($task === 'create_cache') {

      // early exit
      if(!config::cache) exit('cache is disabled.');

      // create folders and images
      if($do_folders || $do_images) {

        // create cache loop function
        function create_cache($dir, $do_folders = false, $do_images = false, $force = false, $depth = 0){

          // exclude
          if(is_exclude($dir)) return 0;

          // dir cache path
          processed::$folders_count ++;
          $cache = get_dir_cache_path($dir);
          $cache_exists = file_exists($cache);
          $cache_recreate = $force || !$cache_exists ? true : false;
          $get_dir = $do_images || $cache_recreate ? true : false;

          // get dir
          if($get_dir){
            
            // dir from cache or new
            $arr = $cache_recreate ? get_dir($dir, true) : json_decode(file_get_contents($cache), true);

            // resize images
            if($do_images && config::image_resize_enabled && config::image_resize_cache && !empty($arr) && !empty($arr['files'])){
              $dirs = array();
              $image_sizes = array(config::image_resize_dimensions);
              if(_config::$image_resize_dimensions_retina) $image_sizes[] = _config::$image_resize_dimensions_retina;
              foreach ($arr['files'] as $filename => $props) {
                if($props['filetype'] === 'dir'){
                  $dirs[] = root_absolute($props['path']);
                  continue;
                }
                if(!isset($props['image']) || 
                   $props['filesize'] < config::image_resize_min_filesize || 
                   $props['filesize']  > config::image_resize_max_filesize
                ) continue;

                // vars
                $type = $props['image']['type'];
                $path = root_absolute($props['path']);

                // original
                $original_width = $props['image']['width'];
                $original_height = $props['image']['height'];

                // loop image sizes
                foreach ($image_sizes as $index => $image_size) {

                  // ratio
                  $ratio = max($original_width, $original_height) / $image_size;
                  if($ratio < config::image_resize_min_ratio) continue;

                  // cache path
                  $image_cache = get_image_cache_path($path, $image_size, $props['filesize'], $props['mtime']);
                  $image_cache_exists = file_exists($image_cache);

                  // skip if cache exists
                  if($image_cache_exists){
                    processed::$images_count ++;

                  // create image acche
                  } else {

                    // image create
                    $image = image_create_from($path, $type);
                    if(!$image) break;

                    // count
                    processed::$images_count ++;

                    // Calculate new image dimensions.
                    $new_width  = round($original_width / $ratio);
                    $new_height = round($original_height / $ratio);

                    // new image
                    $new_image = imagecreatetruecolor($new_width, $new_height);
                    call_user_func(config::image_resize_function, $new_image, $image, 0, 0, 0, 0, $new_width, $new_height, $original_width, $original_height);

                    // save as cache  
                    if(imagejpeg($new_image, $image_cache, config::image_resize_quality)) processed::$images ++;

                    // detroy
                    imagedestroy($new_image);
                  }

                  // add image resize cache direct to $arr
                  if($cache_recreate && _config::$image_resize_cache_direct) $arr['files'][$filename]['image']['resize' . $image_size] = get_url_path($image_cache);
                }
              }
            }
            
            // save json
            if($cache_recreate) {
              $json = empty($arr) ? '{}' : json_encode($arr, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
              if(file_put_contents($cache, $json)) processed::$folders ++;
            }
          }

          // max depth
          if(!get('ignore_max_depth') && config::menu_max_depth && $depth >= config::menu_max_depth) return;

          // subdirs
          if($get_dir){
            if(!isset($dirs)){
              $dirs = array();
              foreach ($arr['files'] as $key => $val) if($val['filetype'] === 'dir') $dirs[] = root_absolute($val['path']);
            } 

          // glob subdirs
          } else {
            $dirs = glob($dir . '/*', GLOB_NOSORT|GLOB_ONLYDIR);
          }

          // sub dirs
          if(!empty($dirs)) foreach($dirs as $dir) create_cache($dir, $do_folders, $do_images, $force, $depth + 1);
        }

        // start create cache loop
        create_cache(get('dir')?:_config::$root, $do_folders, $do_images, $force);
      }
      
      // create menu
      if($do_menu) {
        $menu_cache_hash = get_menu_cache_hash(get_root_dirs());
        $menu_cache_file = _config::$cache_path . '/menu/' . $menu_cache_hash . '.json';
        processed::$menu_count = 1;

        // recreate menu
        if($force || !get_valid_menu_cache($menu_cache_file)){
          $menu_cache_arr = get_dirs(_config::$root);
          $menu_cache_json = empty($menu_cache_arr) ? '{}' : json_encode($menu_cache_arr, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
          if(file_put_contents($menu_cache_file, $menu_cache_json)) processed::$menu ++;
        } 
      }

      // output
      if($do_menu) $output .= 'Menu' . add_output(true, processed::$menu, processed::$menu_count, $force);
      if($do_folders || $do_images) $output .= 'Folders' . add_output(true, processed::$folders, processed::$folders_count, $force);
      if($do_images) $output .= 'Images' . add_output(true, processed::$images, processed::$images_count, false);

    // clear cache [beta]
    } else if($task === 'clear_cache'){

      // get cache items
      function get_cache_items($dir, $ext){
        $cache_path = _config::$storage_path . '/cache/' . $dir;
        if(!file_exists($cache_path)) return array();
        return glob($cache_path . '/*.' . $ext, GLOB_NOSORT);
      }

      // menu
      if($do_menu){
        $menu_cache_items = get_cache_items('menu', 'json');
        processed::$menu_count = count($menu_cache_items);
        if(processed::$menu_count){
          $menu_cache_hash = $force ? false : get_menu_cache_hash(get_root_dirs());
          foreach ($menu_cache_items as $menu_cache_item) {
            if($force || basename($menu_cache_item) !== $menu_cache_hash . '.json') {
              if(unlink($menu_cache_item)) processed::$menu ++;
            }
          }
        }
        $output .= 'Menu' . add_output(false, processed::$menu, processed::$menu_count, $force);
      }

      // folders
      if($do_folders){
        $dirs_cache_items = get_cache_items('folders', 'json');
        processed::$folders_count = count($dirs_cache_items);
        if(processed::$folders_count){
          foreach ($dirs_cache_items as $dirs_cache_item) {
            if($force || strpos(basename($dirs_cache_item), _config::$dirs_hash) !== 0) {
              if(unlink($dirs_cache_item)) processed::$folders ++;
              continue;
            }
            $dir_cache_content = file_get_contents($dirs_cache_item);
            if($dir_cache_content){
              $dir_cache_json = json_decode($dir_cache_content, true);
              $dir_abs_path = root_absolute($dir_cache_json['path']);
              if(!file_exists($dir_abs_path) || $dir_cache_json['mtime'] !== filemtime($dir_abs_path)) {
                if(unlink($dirs_cache_item)) processed::$folders ++;
              }   
            }
          }
        }
        $output .= 'Folders' . add_output(false, processed::$folders, processed::$folders_count, $force);
      }

      // images
      if($do_images){
        $image_cache_items = get_cache_items('images', 'jpg');
        processed::$images_count = count($image_cache_items);
        if(processed::$images_count){
          foreach ($image_cache_items as $image_cache_item) {
            if($force){
              if(unlink($image_cache_item)) processed::$images ++;
              continue;
            }
            $image_cache_item_arr = explode('.', basename($image_cache_item));
            $resize_val = is_numeric($image_cache_item_arr[3]) ? intval($image_cache_item_arr[3]) : false;
            if(!$resize_val || ($resize_val !== config::image_resize_dimensions && $resize_val !== _config::$image_resize_dimensions_retina)) {
              if(unlink($image_cache_item)) processed::$images ++;
            }
          }
        }
        $output .= 'Image' . add_output(false, processed::$images, processed::$images_count, $force);
      }

    // invalid task command
    } else {
      exit('Invalid task command.');
    }

    // output
    header_time();
    echo $output ?: 'No cache parameters selected [menu, folders, images, all]';

// main document
	} else {

// new config, with error checking
new _config(true);

// validate exclude regex
if(config::files_exclude) error(@preg_match(config::files_exclude, '') === false, 'Invalid files_exclude regex <strong>' . config::files_exclude . '</strong>');
if(config::dirs_exclude) error(@preg_match(config::dirs_exclude, '') === false, 'Invalid dirs_exclude regex <strong>' . config::dirs_exclude . '</strong>');

// start path
$start_path = config::start_path;
if($start_path){
  $real_start_path = realpath($start_path);
  error(!$real_start_path, 'start_path ' . $start_path . ' does not exist.');
  error(!is_within_root($real_start_path), 'start_path ' . $start_path . ' is not within root dir ' . config::root);
  $start_path = root_relative($real_start_path);
}

// root dirs (if menu)
$root_dirs = config::menu_enabled || config::breadcrumbs ? get_root_dirs() : false;
$menu_enabled = config::menu_enabled && !empty($root_dirs) ? true : false;
$breadcrumbs = config::breadcrumbs && !empty($root_dirs) ? true : false;

// get menu cache hash
$menu_cache_hash = false;
$menu_cache_file = false;
if($menu_enabled){
  $menu_cache_hash = get_menu_cache_hash($root_dirs);
  // menu cache file (if cache, !menu_cache_validate, exists and is within doc root)
  if(_config::$storage_is_within_doc_root && config::cache && !config::menu_cache_validate) {
    $menu_cache_path = _config::$cache_path . '/menu/' . $menu_cache_hash . '.json';
    $menu_cache_file = file_exists($menu_cache_path) ? get_url_path($menu_cache_path) : false;
    if($menu_cache_file) $menu_cache_file .= '?' . filemtime($menu_cache_path);
  }
}

// init path
$query = config::history && $_SERVER['QUERY_STRING'] ? explode('&', $_SERVER['QUERY_STRING']) : false;
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
$dirs = array('' => get_dir_init(_config::$root));
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
$exclude = array('root', 'start_path', 'image_resize_cache', 'image_resize_quality', 'image_resize_function', 'image_resize_cache_direct', 'menu_sort', 'menu_load_all', 'cache_key', 'storage_path', 'files_exclude', 'dirs_exclude', 'username', 'password', 'breadcrumbs');

// config to frontend
$config = array_merge(array_diff_key((new ReflectionClass('config'))->getConstants(), array_flip($exclude)), array(
  'breadcrumbs' => $breadcrumbs,
  'script' => basename(__FILE__),
  'menu_enabled' => $menu_enabled,
  'menu_cache_hash' => $menu_cache_hash,
  'menu_cache_file' => $menu_cache_file,
  'query_path' => $query_path,
  'query_path_valid' => $query_path_valid ? true : false,
  'init_path' => $init_path,
  'dirs' => $dirs,
  'dirs_hash' => _config::$dirs_hash,
  'resize_image_types' => $resize_image_types,
  'post_hash' => md5(__FILE__ . $_SERVER['HTTP_HOST']),
  'image_cache_hash' => config::load_images ? substr(md5(_config::$doc_root . _config::$root . config::image_resize_function . config::image_resize_quality), 0, 6) : false,
  'image_resize_dimensions_retina' => _config::$image_resize_dimensions_retina,
  'location_hash' => md5(_config::$root),
  'has_login' => _config::$has_login,
  'version' => _config::$version,
  'check_updates' => config::check_updates
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
    <link href="<?php echo _config::$assets ?>css/files.css" rel="stylesheet">
  </head>

  <body class="body-loading">
    <main id="main">
      <?php
      $topbar_classes = array();
      if(config::topbar_sticky) array_push($topbar_classes, 'topbar-sticky');
      if($breadcrumbs) array_push($topbar_classes, 'has-breadcrumbs');
      ?>
      <nav id="topbar"<?php if(!empty($topbar_classes)) echo ' class="' . join(' ', $topbar_classes) . '"'; ?>>
        <div id="topbar-top">
          <input id="search" type="search" placeholder="search" disabled>
          <div id="change-layout" class="dropdown"></div>
          <div id="change-sort" class="dropdown"></div>
          <?php if(config::username) { ?><a href="<?php echo strtok($_SERVER['REQUEST_URI'], '?') . '?logout'; ?>" class="btn-icon btn-topbar" id="logout"></a><?php } ?>
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
    <script src="https://cdn.jsdelivr.net/npm/animejs@3.1.0/lib/anime.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/list.js@1.5.0/dist/list.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/yall-js@3.1.7/dist/yall.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/filesize@6.0.1/lib/filesize.min.js"></script>
    <!--<script crossorigin="anonymous" src="https://polyfill.io/v3/polyfill.min.js?flags=gated&amp;features=Array.prototype.includes%2Cdefault%2CElement.prototype.dataset%2Cfetch%2CIntersectionObserver"></script>-->
    <script src="https://cdn.jsdelivr.net/npm/photoswipe@4.1.3/dist/photoswipe.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/screenfull@5.0.2/dist/screenfull.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1.8.20/dayjs.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1.8.20/plugin/localizedFormat.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1.8.20/plugin/relativeTime.js"></script>
    <!--<script src="https://cdn.jsdelivr.net/npm/eventslibjs@1.2.0/dist/events.min.js"></script>   -->
    <script>
var _c = <?php echo json_encode($config, JSON_PRETTY_PRINT); ?>;
var CodeMirror = {};
    </script>
    <script src="https://cdn.jsdelivr.net/npm/codemirror@5.51.0/mode/meta.js"></script>
    <!-- files -->
    <script src="<?php echo _config::$assets ?>js/files.js"></script>

  </body>
</html>
<?php }}
// htmlend
?>