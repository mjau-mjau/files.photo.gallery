<?php

// Files app X3 login plugin @_files/plugins/files.x3-login.php / www.files.gallery
// Uses X3 login credentials if Files app points to X3 'content' dir (normally '../content')
// If you want a public accessible Files app for your X3 content, just copy /files/index.php into /yourpublicdir/index.php

// has_login true
config::$has_login = true;

// x3 config
$x3_config_path = config::$x3_path . '/config/config.user.json';
$x3_config = @file_exists($x3_config_path) && is_readable($x3_config_path) ? json_decode(file_get_contents($x3_config_path), true) : false;
$x3_panel = !empty($x3_config) && isset($x3_config['back']['panel']) ? $x3_config['back']['panel'] : false;

// X3 panel database version
if(!empty($x3_panel) && isset($x3_panel['use_db']) && $x3_panel['use_db']){

	// get X3Config class
	if(!file_exists(config::$x3_path . '/app/x3.config.inc.php')) error('Can\'t find x3.config.inc.php.');
	include config::$x3_path . '/app/x3.config.inc.php'; // include x3 config
	$x3_panel = X3Config::$config['back']['panel']; // get full panel settings

	// get login from DB
	$mysqli = new mysqli($x3_panel['db_host'], $x3_panel['db_user'], $x3_panel['db_pass'], $x3_panel['db_name']);
	if(!$mysqli || $mysqli -> connect_errno) error('Can\'t connect to X3 database.');
	$login = mysqli_query($mysqli, 'select username, password from filemanager_db limit 1') -> fetch_row();
	if(empty($login) || !is_array($login) || count($login) !== 2) error('Can\'t get username or password from database.');
	config::$username = $login[0];
	config::$password = $login[1];

// get login from config.user.json
} else {
	config::$username = !empty($x3_panel) && isset($x3_panel['username']) ? $x3_panel['username'] : 'admin';
	config::$password = !empty($x3_panel) && isset($x3_panel['password']) ? $x3_panel['password'] : 'admin';
}

// assume full filemanager permissions, unless default admin/admin login (security)
foreach (['upload', 'delete', 'rename', 'new_folder', 'new_file', 'duplicate', 'text_edit'] as $key) config::$config['allow_' . $key] = true;

// exclude .json files
config::$config['files_exclude'] = '/\.json$/i';

// Assign demo_mode if X3 guest/guest or default admin/admin (insecure)
if((config::$username === 'guest' && config::$password === 'guest') || 
	(config::$username === 'admin' && config::$password === 'admin')) config::$config['demo_mode'] = true;



